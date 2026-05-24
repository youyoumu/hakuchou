import { useGeneralContext } from "#/contexts/GeneralContext";
import { constant } from "#/lib/constant";
import Frequency from "./Frequency";

export function Header() {
  const { $general } = useGeneralContext();

  return (
    <div
      class="top-0 left-0 w-full pt-2 pb-2 sm:pt-4 bg-base-100/90 backdrop-blur-xs z-30"
      classList={{
        fixed: !$general.isAnkiWeb,
        absolute: $general.isAnkiWeb,
      }}
    >
      <div class="w-full mx-auto px-2 sm:px-4 max-w-4xl">
        <div class="flex justify-between flex-row h-6 items-center min-h-6">
          <div class="flex gap-1 sm:gap-2 items-center">
            <div class="text-base-content-soft">v{constant.VERSION}</div>
            <div class="text-base-content-soft text-xs">({constant.COMMIT_SHA.slice(0, 7)})</div>
          </div>
          <div>
            <Frequency />
          </div>
        </div>
      </div>
    </div>
  );
}
