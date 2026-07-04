import {ProBanner} from "@/app/[lang]/(home)/components/pro-banner";
import {CodePanelProvider} from "@/hooks/use-code-panel";
import {DictionaryProvider} from "@/hooks/use-dictionary";
// Imported statically (not awaited via getDictionary's dynamic import) so the
// page completes in the initial SSR flush instead of streaming as a deferred
// Suspense boundary. Deferred boundaries are revealed by a
// requestAnimationFrame-scheduled runtime that never runs in a document that
// has not painted (background tab, headless preview) — arrival there left the
// page unhydrated indefinitely. Only one locale exists; if more are added,
// import them statically here and select synchronously.
import dictionary from "@/lib/dictionaries/en.json";

import {
  AccentColorSelector,
  BaseColorSlider,
  BuilderHeader,
  FontFamilyPopover,
  RadiusPopover,
  ThemePopover,
} from "./components";
import {MobileFooter} from "./components/mobile-footer";
import {Onboarding} from "./components/onboarding";
import {ThemeBuilderContent} from "./components/theme-builder-content";
import {THEME_BUILDER_PAGE_ID, formRadiusOptions, radiusOptions} from "./constants";

export default function ThemeBuilderPage() {
  const dict = dictionary;
  const radiusDict = dict.themeBuilder.radius;

  return (
    <DictionaryProvider dict={dict}>
      <CodePanelProvider>
        <div
          className="grid h-dvh grid-rows-[auto_1fr_auto] bg-background px-4 sm:grid-rows-[auto_auto_1fr] sm:overflow-hidden sm:px-6"
          id={THEME_BUILDER_PAGE_ID}
        >
          <BuilderHeader />
          <div className="mx-auto hidden items-center justify-between gap-4 pt-0 pb-2 max-[1200px]:flex-col sm:flex">
            <div className="flex items-center gap-4">
              <AccentColorSelector />
              <BaseColorSlider />
              <FontFamilyPopover />
            </div>
            <div className="flex items-center gap-4">
              <RadiusPopover
                description={radiusDict.description}
                label={radiusDict.label}
                radiusOptions={radiusOptions}
                variableKey="radius"
              />
              <RadiusPopover
                description={radiusDict.formDescription}
                label={radiusDict.formLabel}
                radiusOptions={formRadiusOptions}
                variableKey="formRadius"
              />
              <ThemePopover />
            </div>
          </div>
          <ThemeBuilderContent />
          <div className="h-20 w-full sm:hidden" />
          <MobileFooter />
        </div>
        <Onboarding />
        <ProBanner />
      </CodePanelProvider>
    </DictionaryProvider>
  );
}
