#!/usr/bin/env python3
"""
svg2jsx — convert a delivered .svg into a verbatim inline React (TSX) component.

Guarantees:
  * Path `d`, `fill`, filter primitives, gradient stops and every `id` are copied
    BYTE-FOR-BYTE. No rounding, no reformatting, no id rewriting, no optimisation.
  * Only attribute NAMES change (SVG -> React DOM naming). Values never change.
  * <title> is preserved as a JSX child.
  * The emitted component spreads props onto <svg> so callers can override
    className / width / height / style; the file's own attrs are the defaults.
"""

import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Attribute-name mapping: SVG (hyphen/colon) -> React DOM property name.
# ---------------------------------------------------------------------------
ATTR_MAP = {
    "class": "className",
    "clip-path": "clipPath",
    "clip-rule": "clipRule",
    "color-interpolation": "colorInterpolation",
    "color-interpolation-filters": "colorInterpolationFilters",
    "color-profile": "colorProfile",
    "color-rendering": "colorRendering",
    "dominant-baseline": "dominantBaseline",
    "fill-opacity": "fillOpacity",
    "fill-rule": "fillRule",
    "flood-color": "floodColor",
    "flood-opacity": "floodOpacity",
    "font-family": "fontFamily",
    "font-size": "fontSize",
    "font-size-adjust": "fontSizeAdjust",
    "font-stretch": "fontStretch",
    "font-style": "fontStyle",
    "font-variant": "fontVariant",
    "font-weight": "fontWeight",
    "image-rendering": "imageRendering",
    "letter-spacing": "letterSpacing",
    "lighting-color": "lightingColor",
    "marker-end": "markerEnd",
    "marker-mid": "markerMid",
    "marker-start": "markerStart",
    "mask-type": "maskType",
    "paint-order": "paintOrder",
    "pointer-events": "pointerEvents",
    "shape-rendering": "shapeRendering",
    "stop-color": "stopColor",
    "stop-opacity": "stopOpacity",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-miterlimit": "strokeMiterlimit",
    "stroke-opacity": "strokeOpacity",
    "stroke-width": "strokeWidth",
    "text-anchor": "textAnchor",
    "text-decoration": "textDecoration",
    "text-rendering": "textRendering",
    "unicode-bidi": "unicodeBidi",
    "vector-effect": "vectorEffect",
    "word-spacing": "wordSpacing",
    "writing-mode": "writingMode",
    "xlink:actuate": "xlinkActuate",
    "xlink:arcrole": "xlinkArcrole",
    "xlink:href": "xlinkHref",
    "xlink:role": "xlinkRole",
    "xlink:show": "xlinkShow",
    "xlink:title": "xlinkTitle",
    "xlink:type": "xlinkType",
    "xml:base": "xmlBase",
    "xml:lang": "xmlLang",
    "xml:space": "xmlSpace",
    "xmlns:xlink": "xmlnsXlink",
}

# Attributes that must stay hyphenated in JSX.
PASSTHROUGH_PREFIXES = ("data-", "aria-")

# Attributes we refuse to convert silently because doing so is a semantic change.
REFUSE = {"style"}

VOID_OK = set()  # nothing special; XML tells us via "/>"

_fallback_hits = set()


def react_attr_name(name: str) -> str:
    if name in ATTR_MAP:
        return ATTR_MAP[name]
    if name.startswith(PASSTHROUGH_PREFIXES):
        return name
    if "-" in name or ":" in name:
        # Not in the explicit table -> camelCase it, but record it so the run
        # can be audited. Unknown mappings should be reviewed, not trusted.
        _fallback_hits.add(name)
        head, *rest = re.split(r"[-:]", name)
        return head + "".join(p[:1].upper() + p[1:] for p in rest)
    return name


# ---------------------------------------------------------------------------
# Tokeniser: walks the document, quote-aware, so `>` inside an attribute value
# cannot terminate a tag early.
# ---------------------------------------------------------------------------
def tokenize(src: str):
    tokens = []
    i, n = 0, len(src)
    while i < n:
        lt = src.find("<", i)
        if lt == -1:
            tail = src[i:]
            if tail.strip():
                tokens.append(("text", tail))
            break
        if lt > i:
            text = src[i:lt]
            if text.strip():
                tokens.append(("text", text))
        j, quote = lt + 1, None
        while j < n:
            c = src[j]
            if quote:
                if c == quote:
                    quote = None
            elif c in "\"'":
                quote = c
            elif c == ">":
                break
            j += 1
        if j >= n:
            raise SystemExit(f"unterminated tag starting at offset {lt}")
        tokens.append(("tag", src[lt : j + 1]))
        i = j + 1
    return tokens


ATTR_RE = re.compile(
    r"""([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')"""
)


def parse_tag(raw: str):
    """Return (kind, name, attrs) where kind is open|close|self."""
    body = raw[1:-1]
    if body.startswith("!") or body.startswith("?"):
        raise SystemExit(f"unsupported node (comment/decl/doctype): {raw[:60]!r}")
    if body.startswith("/"):
        return "close", body[1:].strip(), []
    self_closing = body.rstrip().endswith("/")
    if self_closing:
        body = body.rstrip()[:-1]
    m = re.match(r"\s*([A-Za-z][-A-Za-z0-9:_.]*)", body)
    if not m:
        raise SystemExit(f"could not read element name in {raw[:60]!r}")
    name = m.group(1)
    rest = body[m.end() :]
    attrs = []
    pos = 0
    for am in ATTR_RE.finditer(rest):
        between = rest[pos : am.start()]
        if between.strip():
            raise SystemExit(
                f"unparsed text {between.strip()!r} in tag {raw[:80]!r} "
                "(valueless attribute?)"
            )
        key = am.group(1)
        val = am.group(2) if am.group(2) is not None else am.group(3)
        if key in REFUSE:
            raise SystemExit(
                f"attribute {key!r} needs a semantic rewrite (CSS text -> object); "
                "refusing to guess"
            )
        attrs.append((key, val))
        pos = am.end()
    if rest[pos:].strip():
        raise SystemExit(f"trailing text {rest[pos:].strip()!r} in tag {raw[:80]!r}")
    return ("self" if self_closing else "open"), name, attrs


def jsx_text(t: str) -> str:
    """Escape a text node for JSX. Values are otherwise untouched."""
    return (
        t.replace("{", "&#123;")
        .replace("}", "&#125;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def jsx_attr(key: str, val: str) -> str:
    name = react_attr_name(key)
    # Attribute VALUES are copied verbatim. A JSX double-quoted attribute string
    # is literal (braces are not interpolated), so only `"` would need escaping.
    if '"' in val:
        return f"{name}={{{val!r}}}"
    return f'{name}="{val}"'


HEADER = '''/* -------------------------------------------------------------------------------------------------
 * {component} — the delivered Figma brand artwork, inlined VERBATIM.
 *
 * Generated from apps/docs/public/images/{source} by /private/tmp/svg2jsx/svg2jsx.py.
 * Only attribute NAMES were changed (SVG -> React DOM naming); every path `d`, fill, filter
 * primitive, gradient stop and id is byte-for-byte the delivered artwork.
 *
 * WHY INLINE rather than <img src="/images/{source}">: WebKit rasterises an SVG loaded through
 * <img> at deviceScaleFactor 1, so the badge's <g filter="..."> region is drawn at 1 raster px per
 * CSS px and then stretched 2x on Retina — a visibly soft badge next to razor-sharp unfiltered
 * geometry. Inline <svg> in the main document rasterises filters at true device resolution.
 * (<object> also fixes it but swallows pointer events, and the lockup sits inside a <Link>.)
 *
 * DO NOT hand-edit this file, and DO NOT run it through SVGO / prefixIds / cleanupIds / mergePaths.
 * Re-generate from the .svg instead — the ids here are referenced by url(#...) and the filter
 * stack is what produces the badge's shadow.
 * -----------------------------------------------------------------------------------------------*/

import type {{SVGProps}} from "react";

'''


def convert(svg_path: Path, component: str) -> str:
    src = svg_path.read_text(encoding="utf-8")
    tokens = tokenize(src)

    out = []
    depth = 0
    root_seen = False
    stack = []

    def pad(d):
        return "  " * (d + 2)

    for kind, payload in tokens:
        if kind == "text":
            out.append(pad(depth) + jsx_text(payload.strip()))
            continue
        tkind, name, attrs = parse_tag(payload)
        if tkind == "close":
            depth -= 1
            popped = stack.pop()
            if popped != name:
                raise SystemExit(f"mismatched close </{name}> (expected </{popped}>)")
            out.append(pad(depth) + f"</{name}>")
            continue

        rendered = [jsx_attr(k, v) for k, v in attrs]
        if not root_seen:
            if name != "svg":
                raise SystemExit(f"root element is <{name}>, expected <svg>")
            root_seen = True
            # role="img" gives the <title> child an accessible name, matching the
            # alt text the <img> used to carry. {...props} last so callers win.
            rendered.append('role="img"')
            rendered.append("{...props}")
        attr_str = (" " + " ".join(rendered)) if rendered else ""
        if tkind == "self":
            out.append(pad(depth) + f"<{name}{attr_str} />")
        else:
            out.append(pad(depth) + f"<{name}{attr_str}>")
            stack.append(name)
            depth += 1

    if stack:
        raise SystemExit(f"unclosed elements: {stack}")

    body = "\n".join(out)
    return (
        HEADER.format(component=component, source=svg_path.name)
        + f"export function {component}(props: SVGProps<SVGSVGElement>) {{\n"
        + "  return (\n"
        + body
        + "\n  );\n}\n"
    )


def main():
    if len(sys.argv) != 4:
        raise SystemExit("usage: svg2jsx.py <in.svg> <out.tsx> <ComponentName>")
    src, dst, comp = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(convert(src, comp), encoding="utf-8")
    print(f"wrote {dst} ({dst.stat().st_size} B) from {src.name}")
    if _fallback_hits:
        print("  !! attributes camelCased by FALLBACK (review these):",
              ", ".join(sorted(_fallback_hits)))


if __name__ == "__main__":
    main()
