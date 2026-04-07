import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#eff6ff] text-[#1d4ed8]",
        low: "border-transparent bg-[#f0fdf4] text-[#15803d]",
        medium: "border-transparent bg-[#fffbeb] text-[#b45309]",
        high: "border-transparent bg-[#fef2f2] text-[#b91c1c]",
        outline: "border-[#e5e7eb] text-[#6b7280]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
