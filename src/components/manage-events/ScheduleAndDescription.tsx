'use client';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Calendar, FileText } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export function ScheduleAndDescription({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
          <Calendar className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white">
            Schedule & Description
          </h3>
          <p className="text-sm text-zinc-500">
            Set timing and describe your event
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <label className="text-zinc-300 text-sm font-medium">
                  Schedule
                </label>
              </div>
              <FormControl>
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter event schedule details..."
                  minHeight="150px"
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
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <label className="text-zinc-300 text-sm font-medium">
                  Description
                </label>
              </div>
              <FormControl>
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Describe what this event is about..."
                  minHeight="150px"
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
