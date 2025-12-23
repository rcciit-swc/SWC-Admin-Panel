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
    <div className="relative">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full bg-[#1F2937] text-gray-100 border-gray-700 ${
            value ? 'pr-10' : ''
          }`}
          hideArrow={Boolean(value)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#1F2937] text-gray-100 border-gray-700">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-[#2D3748] bg-slate-700 text-gray-300 hover:text-white"
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
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
