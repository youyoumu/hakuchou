import type { JSX } from "solid-js";

export function Layout(props: { children: JSX.Element }) {
  return (
    <div class="transition-colors relative">
      <div class="flex flex-col gap-4 p-2 sm:p-4 bg-base-100 min-h-full mx-auto max-w-4xl">
        {props.children}
      </div>
    </div>
  );
}
