import type { JSX } from "solid-js";
import { Header } from "./Header";
import { useGeneralContext } from "#/contexts/GeneralContext";

export function Layout(props: { children: JSX.Element }) {
  const { $setGeneral } = useGeneralContext();
  return (
    <div
      class="transition-colors relative"
      ref={(ref) => $setGeneral("layoutRef", ref)}
      data-hakuchou-layout
    >
      <div class="flex flex-col gap-4 p-2 sm:p-4 bg-base-100 min-h-full mx-auto max-w-4xl pt-10 sm:pt-12">
        <Header />
        {props.children}
      </div>
    </div>
  );
}
