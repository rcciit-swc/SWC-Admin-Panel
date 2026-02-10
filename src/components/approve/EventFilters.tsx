import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type FilterProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function Filter({ options, value, onChange, placeholder }: FilterProps) {
  return (
    <div className="relative group/filter">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`h-11 w-full bg-white/[0.03] text-gray-100 border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all rounded-xl text-xs font-semibold ${
            value ? 'pr-10' : ''
          }`}
          hideArrow={Boolean(value)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#0A0A0F] border-white/10 backdrop-blur-xl text-gray-100 rounded-xl">
          {options.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="focus:bg-white/5 focus:text-white rounded-lg mx-1 my-0.5 text-xs capitalize"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10 text-gray-500 hover:text-white rounded-lg transition-colors"
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange('');
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
