import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar, FileText } from 'lucide-react';

export function ScheduleAndDescription({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
          <Calendar className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white">Schedule & Description</h3>
          <p className="text-sm text-zinc-500">Set timing and describe your event</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300 text-sm font-medium flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Schedule
              </FormLabel>
              <FormControl>
                <textarea
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  rows={5}
                  placeholder="Enter event schedule details..."
                  className="w-full resize-y bg-[#0d0d12] text-white border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none placeholder:text-zinc-600 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300 text-sm font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                Description
              </FormLabel>
              <FormControl>
                <textarea
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  rows={5}
                  placeholder="Describe what this event is about..."
                  className="w-full resize-y bg-[#0d0d12] text-white border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none placeholder:text-zinc-600 transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
