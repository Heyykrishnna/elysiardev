import { PointerHighlight } from "@/components/ui/pointer-highlight";

export function PointerHighlightDemo() {
    return (
      <div className="mx-auto text-left max-w-lg py-20 text-7xl font-bold tracking-tight md:text-6xl">
        Transformation Journey:
        <PointerHighlight
          rectangleClassName="bg-neutral-200 dark:bg-neutral-300 border-neutral-100 dark:border-neutral-100"
          pointerClassName="text-yellow-500"
        >
          <span className="relative z-10">Redefining Education</span>
        </PointerHighlight>
      </div>
    );
  }  