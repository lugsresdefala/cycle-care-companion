import { BookOpen } from "lucide-react";

interface CitationChipProps {
  children: React.ReactNode;
  /** Show the book icon (default true) */
  icon?: boolean;
}

/**
 * Scientific reference chip — teal hairline pill used to attribute
 * a formula/reference to its source on calculator panels.
 */
export function CitationChip({ children, icon = true }: CitationChipProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-accent">
      {icon ? <BookOpen className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

export default CitationChip;
