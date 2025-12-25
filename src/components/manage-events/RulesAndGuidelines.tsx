'use client';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { ScrollText } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export function RulesAndGuidelines({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
          <ScrollText className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white">
            Rules & Guidelines
          </h3>
          <p className="text-sm text-zinc-500">
            Set clear rules and guidelines for participants to follow.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <FormField
        control={form.control}
        name="rules"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter event rules and guidelines..."
                minHeight="200px"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
