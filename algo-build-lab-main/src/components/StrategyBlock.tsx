import React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StrategyBlockProps {
  id: string;
  type: "indicator" | "condition" | "action";
  name: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  isDragging?: boolean;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const StrategyBlock = React.forwardRef<HTMLDivElement, StrategyBlockProps>(
  ({ 
    id, 
    type, 
    name, 
    description, 
    icon, 
    color = "border-border", 
    isDragging = false,
    style,
    onDragStart,
    onDragEnd,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg border-2 bg-card p-3 transition-all duration-200",
          "hover:shadow-md hover:border-primary/50 cursor-move",
          isDragging && "opacity-50 scale-95",
          color
        )}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("blockId", id);
          e.dataTransfer.setData("blockType", type);
          e.dataTransfer.setData("blockName", name);
          onDragStart?.(e);
        }}
        onDragEnd={onDragEnd}
        style={style}
        {...props}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    );
  }
);

StrategyBlock.displayName = "StrategyBlock";