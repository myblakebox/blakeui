"use client";

import {DemoComponents} from "@/components/demo";

export function DemoShowcase() {
  return (
    <div className="flex min-h-0 w-full max-w-[1200px] flex-1 flex-col py-6 lg:py-10">
      <div className="flex min-h-[420px] max-w-[1200px] flex-1 flex-col">
        {/* Mobile */}
        <div className="flex w-full justify-center rounded-2xl bg-background py-8 lg:hidden">
          <DemoComponents />
        </div>
        {/* Desktop */}
        <div className="relative hidden min-h-0 flex-1 lg:flex lg:flex-col">
          <div className="flex flex-1 justify-center overflow-x-hidden overflow-y-auto rounded-2xl border border-border/50 bg-background py-8">
            <div className="my-auto">
              <DemoComponents />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
