import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getPresetDateRanges, type DateRange } from '@/services/analyticsService';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const presets = getPresetDateRanges();

  const handlePresetClick = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange) => {
    return `${format(range.startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(
      range.endDate,
      'dd/MM/yyyy',
      { locale: ptBR }
    )}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDateRange(value) : 'Selecione o período'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-3 space-y-1">
            <div className="text-sm font-semibold mb-2 px-2">Períodos</div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handlePresetClick(presets.today)}
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handlePresetClick(presets.yesterday)}
            >
              Ontem
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handlePresetClick(presets.last7Days)}
            >
              Últimos 7 dias
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handlePresetClick(presets.last30Days)}
            >
              Últimos 30 dias
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handlePresetClick(presets.thisMonth)}
            >
              Este mês
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm h-9"
              onClick={() => handlePresetClick(presets.lastMonth)}
            >
              Mês passado
            </Button>
          </div>

          {/* Calendar (pode ser expandido futuramente para seleção customizada) */}
          <div className="p-3">
            <div className="text-sm text-muted-foreground">
              Período selecionado:
              <div className="font-medium text-foreground mt-1">
                {formatDateRange(value)}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

