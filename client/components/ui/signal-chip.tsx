import { cn } from "@/lib/utils";
import { ESSENCE_ONTOLOGY, type EssenceArchetype } from "@shared/essences";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Droplets, Wind, Flame, Mountain, Sparkles, Sun, Moon, Leaf, Star, Circle, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SignalChipProps {
  label: string;
  quote: string;
  interpretation: string;
  essenceId?: string;
  className?: string;
  "data-testid"?: string;
}

function getFrequencyColor(frequency: number): string {
  switch (frequency) {
    case 47: return "from-blue-500/20 to-purple-500/20 border-blue-400/30";
    case 55: return "from-orange-500/20 to-red-500/20 border-orange-400/30";
    case 66: return "from-emerald-500/20 to-teal-500/20 border-emerald-400/30";
    default: return "from-gray-500/20 to-gray-600/20 border-gray-400/30";
  }
}

function getElementIcon(element: string): LucideIcon {
  switch (element) {
    case "water": return Droplets;
    case "air": return Wind;
    case "fire": return Flame;
    case "earth": return Mountain;
    case "ether": return Sparkles;
    case "light": return Sun;
    default: return Circle;
  }
}

function getPolarityIcon(polarity?: string): LucideIcon {
  switch (polarity) {
    case "lunar": return Moon;
    case "solar": return Sun;
    case "natural": return Leaf;
    case "arcana": return Star;
    case "micro": return Circle;
    case "macro": return Globe;
    default: return Circle;
  }
}

function getFrequencyLabel(frequency: number): string {
  switch (frequency) {
    case 47: return "Emotional";
    case 55: return "Action";
    case 66: return "Meaning";
    default: return "Unknown";
  }
}

export function SignalChip({ label, quote, interpretation, essenceId, className, "data-testid": testId }: SignalChipProps) {
  const archetype: EssenceArchetype | undefined = essenceId ? ESSENCE_ONTOLOGY[essenceId] : undefined;
  const frequencyColor = archetype ? getFrequencyColor(archetype.frequency) : "from-gray-500/20 to-gray-600/20 border-gray-400/30";
  
  const ElementIcon = archetype ? getElementIcon(archetype.element) : Circle;
  const PolarityIcon = archetype ? getPolarityIcon(archetype.polarity) : Circle;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            "bg-gradient-to-r backdrop-blur-sm border",
            "cursor-pointer transition-all duration-200",
            "hover:scale-105 hover:shadow-md",
            "text-foreground/80",
            frequencyColor,
            className
          )}
        >
          <ElementIcon className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[100px]">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-72 p-0 glass-card overflow-hidden">
        {archetype && (
          <>
            <div className="p-3 border-b border-border/50">
              <p className="font-semibold text-sm text-primary">{archetype.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{archetype.description}</p>
            </div>
            
            <div className="p-3 bg-primary/5 border-b border-border/50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Magical Resonance
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <ElementIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs capitalize">{archetype.element}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PolarityIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs capitalize">{archetype.polarity}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                    F{archetype.frequency}
                  </span>
                  <span className="text-xs text-muted-foreground">{getFrequencyLabel(archetype.frequency)}</span>
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="p-3">
          <p className="font-medium text-xs mb-1 italic text-foreground/80">"{quote}"</p>
          <p className="text-xs text-muted-foreground">{interpretation}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
