import { ReactNode } from "react";

interface MobilePreviewProps {
  children: ReactNode;
}

export const MobilePreview = ({ children }: MobilePreviewProps) => {
  return (
    <div className="sticky top-8">
      <div className="text-sm font-medium text-muted-foreground mb-3">
        Pré-visualização
      </div>
      
      {/* Smartphone frame */}
      <div className="relative mx-auto w-[320px] h-[640px] bg-card rounded-[2.5rem] border-[14px] border-foreground/90 shadow-xl">
        {/* Screen notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/90 rounded-b-2xl" />
        
        {/* Screen content */}
        <div className="h-full w-full bg-background rounded-[1.5rem] overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/40 rounded-full" />
      </div>
    </div>
  );
};
