'use client';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ImageIcon, DollarSign, Trophy, Users, Type } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEvents } from '@/lib/stores/events';
import { useEffect } from 'react';

export function BasicInformation({ form }: { form: any }) {
  const { eventCategories, eventCategoriesLoading, getEventCategories } =
    useEvents();

  useEffect(() => {
    getEventCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/6">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10">
          <Type className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-base font-medium text-white">Basic Information</h3>
          <p className="text-sm text-zinc-500">Enter the core details about your event</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-zinc-300 text-sm font-medium">Event Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter event name"
                  {...field}
                  className="bg-[#0d0d12] text-white border-white/10 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11 placeholder:text-zinc-600"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registration_fees"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300 text-sm font-medium">Registration Fee</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                  <Input
                    className="pl-7 bg-[#0d0d12] text-white border-white/10 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11 placeholder:text-zinc-600"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ''}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prize_pool"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300 text-sm font-medium">Prize Pool</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                  <Input
                    className="pl-7 bg-[#0d0d12] text-white border-white/10 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11 placeholder:text-zinc-600"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ''}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-zinc-300 text-sm font-medium">Cover Image URL</FormLabel>
              <FormControl>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    className="pl-10 bg-[#0d0d12] text-white border-white/10 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11 placeholder:text-zinc-600"
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="min_team_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300 text-sm font-medium">Minimum Team Size</FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value ?? ''}
                    className="pl-10 bg-[#0d0d12] text-white border-white/10 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_team_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300 text-sm font-medium">Maximum Team Size</FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value ?? ''}
                    className="pl-10 bg-[#0d0d12] text-white border-white/10 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
