"use client";

import {Button, Kbd, Label, Tooltip, cn} from "@blakeui/react";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";

import {Moon, Sun} from "@/components/fumadocs/ui/icons";
import {useDictionary} from "@/hooks/use-dictionary";
import {useIsMounted} from "@/hooks/use-is-mounted";
import {useKeyPress} from "@/hooks/use-key-press";

import "./switch-mode.css";

export function SwitchMode({label}: {label?: string}) {
  const {resolvedTheme, setTheme} = useTheme();
  const dict = useDictionary().themeBuilder.header;
  const mounted = useIsMounted();
  const [animated, setAnimated] = useState(false);

  // Arm the crossfade one frame after mount, once the resolved theme has
  // painted — otherwise a dark-mode visitor sees the icons swap on load.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(true));

    return () => cancelAnimationFrame(raf);
  }, []);

  const handleModeSwitch = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  useKeyPress("s", handleModeSwitch);

  return (
    <div className={cn("flex flex-col gap-1", !label && "h-9")}>
      {label ? <Label>{label}</Label> : null}
      <Tooltip>
        <Tooltip.Trigger>
          <Button
            isIconOnly
            aria-label={dict.switchMode}
            size="md"
            variant="tertiary"
            onPress={handleModeSwitch}
          >
            {/* data-mode gates on mounted so SSR (resolvedTheme undefined) and the
                hydration render agree — React never patches mismatched attributes,
                and an unguarded read left dark visitors stuck on the sun icon. */}
            <span
              className={cn("switch-mode-icon", animated && "switch-mode-icon--animated")}
              data-mode={mounted && resolvedTheme === "dark" ? "dark" : "light"}
            >
              <Sun className="switch-mode-icon__sun" fill="currentColor" />
              <Moon className="switch-mode-icon__moon" fill="currentColor" />
            </span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>
            {dict.switchMode}{" "}
            <Kbd>
              <Kbd.Content>S</Kbd.Content>
            </Kbd>
          </p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}
