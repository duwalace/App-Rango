import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ProductTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
}

export const ProductTypeCard = ({
  icon: Icon,
  title,
  description,
  selected = false,
  onClick,
}: ProductTypeCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-lg border-2 cursor-pointer transition-smooth shadow-card",
        "hover:shadow-card-hover",
        selected ? "border-primary bg-primary/5" : "border-border bg-card"
      )}
    >
      <div className="flex flex-col items-start space-y-3">
        <div
          className={cn(
            "p-3 rounded-lg transition-smooth",
            selected ? "bg-primary/10" : "bg-muted"
          )}
        >
          <Icon className={cn("h-6 w-6", selected ? "text-primary" : "text-muted-foreground")} />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>

      <div
        className={cn(
          "absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-smooth",
          selected
            ? "border-primary bg-primary"
            : "border-border bg-background"
        )}
      >
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
