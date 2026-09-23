import type { LucideIcon } from "lucide-react";

interface CalculatorHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

/**
 * Biomedical page header: solid navy icon chip,
 * Space Grotesk title, muted subtitle.
 */
export function CalculatorHeader({ icon: Icon, title, subtitle }: CalculatorHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-primary leading-none">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export default CalculatorHeader;
