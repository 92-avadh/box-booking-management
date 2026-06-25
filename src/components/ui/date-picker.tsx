'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from './dropdown-menu';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  align = 'start'
}) => {
  const today = new Date();
  const initialDate = value ? new Date(value) : today;
  
  const [currentYear, setCurrentYear] = React.useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(initialDate.getMonth()); // 0-11

  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Calculate first day of month (Monday start adjustment)
  const firstDayIndex = (() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon = 0, Sun = 6
  })();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${m}-${d}`;
    onChange(formatted);
  };

  const handleToday = () => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
  };

  const handleClear = () => {
    onChange('');
  };

  const formattedDisplay = () => {
    if (!value) return placeholder;
    const [y, m, d] = value.split('-');
    return `${d}-${m}-${y}`; // DD-MM-YYYY
  };

  // Render Days Grid
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => (
    <div key={`blank-${i}`} className="h-8 w-8" />
  ));

  const dayButtons = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const m = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const fullStr = `${currentYear}-${m}-${dayStr}`;
    
    const isSelected = value === fullStr;
    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d;
    
    dayButtons.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => handleSelectDay(d)}
        className={`h-8 w-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
          isSelected
            ? 'bg-primary text-white scale-105 shadow-md shadow-primary/10'
            : isToday
              ? 'border border-primary text-primary hover:bg-primary/5'
              : 'text-foreground/85 hover:bg-muted bg-card'
        }`}
      >
        {d}
      </button>
    );
  }

  const cells = [...blanks, ...dayButtons];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          type="button"
          className={`flex items-center gap-2 px-3 py-1.5 bg-muted/20 border border-border rounded-xl font-semibold text-xs text-foreground/80 hover:bg-muted/40 focus:outline-none transition-all cursor-pointer select-none ${className}`}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formattedDisplay()}</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="p-4 w-72 text-left bg-card rounded-2xl border border-border shadow-xl space-y-4" align={align}>
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-xs text-foreground uppercase tracking-wider">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-black text-muted-foreground/60 tracking-wider uppercase">
          {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
          {cells}
        </div>

        {/* Calendar Footer Actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/80">
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-bold text-red-650 hover:underline cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
          >
            Today
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
