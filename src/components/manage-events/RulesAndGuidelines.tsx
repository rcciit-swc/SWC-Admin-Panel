import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollText } from 'lucide-react';

export function RulesAndGuidelines({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
          <ScrollText className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white">Rules & Guidelines</h3>
          <p className="text-sm text-zinc-500">Set clear rules for participants</p>
        </div>
      </div>

      {/* Form Fields */}
      <FormField
        control={form.control}
        name="rules"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300 text-sm font-medium flex items-center gap-2">
              <ScrollText className="w-3.5 h-3.5 text-zinc-500" />
              Rules
            </FormLabel>
            <FormControl>
              <textarea
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                rows={12}
                placeholder="Enter event rules and guidelines..."
                className="w-full resize-y bg-[#0d0d12] text-white border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none placeholder:text-zinc-600 transition-colors"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
