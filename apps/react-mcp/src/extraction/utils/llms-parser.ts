/**
 * llms.txt parser utilities
 * Extracts component URLs and metadata from llms.txt content
 */

export interface ComponentUrl {
  title: string;
  url: string;
  description?: string;
  category?: string;
}

export interface DocUrl {
  title: string;
  url: string;
  description?: string;
  category?: string;
}

/**
 * Parse llms.txt content and extract component URLs only
 */
export function parseLlmsTxt(content: string): ComponentUrl[] {
  return parseAllDocsFromLlmsTxt(content).filter((doc) =>
    doc.url.startsWith("/docs/react/components/"),
  ) as ComponentUrl[];
}

/**
 * Parse llms.txt content and extract all documentation URLs
 */
export function parseAllDocsFromLlmsTxt(content: string): DocUrl[] {
  const docs: DocUrl[] = [];
  const lines = content.split("\n");
  let currentCategory: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and headers
    if (!trimmed || trimmed.startsWith("#")) {
      // Extract category from headers
      if (trimmed.startsWith("### ")) {
        currentCategory = trimmed.substring(4).trim();
      }
      continue;
    }

    // Parse doc links: - [Title](https://www.blakeui.com/docs/react/...): Description
    const match = trimmed.match(/^- \[([^\]]+)\]\(([^)]+)\)(?:\s*:\s*(.+))?$/);
    if (match) {
      const [, title, url, description] = match;

      // Extract the pathname regardless of the host the docs site emitted
      // (production base URL, www, or a localhost build), then drop an
      // optional locale prefix so both /en/docs/react/... and /docs/react/...
      // resolve to the same canonical path.
      let path = url;
      try {
        path = new URL(url).pathname;
      } catch {
        // url is already a relative path
      }
      path = path.replace(/^\/[a-z]{2}(?=\/)/, "");

      // Include all React docs
      if (path.startsWith("/docs/react/")) {
        docs.push({
          title,
          url: path,
          description,
          category: currentCategory || undefined,
        });
      }
    }
  }

  return docs;
}
