"use client";

import {ComponentShowcase} from "./showcase/component-showcase";
import {MacWindow} from "./showcase/mac-window";

export function DemoShowcase() {
  return (
    <div className="flex min-h-0 w-full max-w-[1200px] flex-1 flex-col py-6 lg:py-10">
      <div className="flex min-h-[420px] max-w-[1200px] flex-1 flex-col">
        <MacWindow>
          <div className="flex w-full justify-center pt-8">
            <ComponentShowcase />
          </div>
        </MacWindow>
      </div>
    </div>
  );
}
