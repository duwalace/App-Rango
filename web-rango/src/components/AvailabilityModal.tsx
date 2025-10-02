import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAYS_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const AvailabilityModal = ({ open, onOpenChange }: AvailabilityModalProps) => {
  const [availabilityType, setAvailabilityType] = useState("always");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Configurar Disponibilidade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={availabilityType} onValueChange={setAvailabilityType}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="always" id="always" />
                <Label htmlFor="always" className="cursor-pointer font-normal">
                  Sempre disponível
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="cursor-pointer font-normal">
                  Programar disponibilidade
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem value="unavailable" id="unavailable" />
                <Label htmlFor="unavailable" className="cursor-pointer font-normal">
                  Indisponível
                </Label>
              </div>
            </div>
          </RadioGroup>

          {availabilityType === "scheduled" && (
            <div className="space-y-4 pl-7 border-l-2 border-primary/20">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Dias da semana
                </label>
                <div className="flex gap-2">
                  {WEEKDAYS.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={cn(
                        "w-10 h-10 rounded-full font-medium text-sm transition-smooth",
                        selectedDays.includes(index)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                      title={WEEKDAYS_FULL[index]}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Horário início
                  </label>
                  <Input type="time" defaultValue="08:00" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Horário fim
                  </label>
                  <Input type="time" defaultValue="22:00" />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
