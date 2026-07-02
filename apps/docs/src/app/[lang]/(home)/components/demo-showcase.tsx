"use client";

import {ComponentShowcase} from "./showcase/component-showcase";

export function DemoShowcase() {
  return (
    <div className="flex min-h-0 w-full max-w-[1200px] flex-1 flex-col py-6 lg:py-10">
      <div className="flex min-h-[420px] max-w-[1200px] flex-1 flex-col">
        <div className="flex w-full justify-center rounded-2xl border border-border/50 bg-background py-8">
          <ComponentShowcase />
        </div>
      </div>
    </div>
  );
}
