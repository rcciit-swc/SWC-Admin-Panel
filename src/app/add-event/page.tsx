'use client';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coordinator, LinkType } from '@/lib/types/events';
import { toast } from 'sonner';
import 'react-quill/dist/quill.snow.css';
import { useEvents } from '@/lib/stores/events';
import Header from '@/components/manage-events/Header';
import { BasicInformation } from '@/components/manage-events/BasicInformation';
import { ScheduleAndDescription } from '@/components/manage-events/ScheduleAndDescription';
import { RulesAndGuidelines } from '@/components/manage-events/RulesAndGuidelines';
import { LinksAndCoordinators } from '@/components/manage-events/LinkAndCoordinators';
import { eventSchema } from '@/lib/schemas/events';

type EventFormInput = z.input<typeof eventSchema>;
type EventFormOutput = z.output<typeof eventSchema>;

const Page = () => {
  const router = useRouter();
  const form = useForm<EventFormInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      registration_fees: 0,
      prize_pool: 0,
      image_url: '',
      min_team_size: 1,
      max_team_size: 1,
      schedule: '',
      description: '',
      rules: '',
      coordinators: [],
      links: [],
      reg_status: false,
    },
  });

  const [links, setLinks] = useState<LinkType[]>([]);
  const values = useWatch({ control: form.control });
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const { postEvent, setEventsData } = useEvents();
  async function onSubmit(values: EventFormInput) {
    try {
      const parsed: EventFormOutput = eventSchema.parse(values);
      const eventData = {
        ...parsed,
        min_team_size: parsed.min_team_size,
        max_team_size: parsed.max_team_size,
        links: links,
        coordinators: coordinators,
        event_category_id: '46ea4f76-36ba-469d-aed6-3bf72d1beb87',
      };
      await postEvent(eventData);
      await setEventsData(true);
      toast.success('Event created!');
      router.push('/');
    } catch (error: any) {
      toast.error('Failed to create event. ' + error.message);
    }
  }
  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-linear-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <Header form={form} />

          {/* Main Content */}
          <main className="relative container max-w-6xl mx-auto px-6 py-8">
            <div className="space-y-6">
              {/* Basic Information - Full Width */}
              <section className="bg-[#0a0a0f] rounded-xl border border-white/6 overflow-hidden">
                <div className="p-6">
                  <BasicInformation form={form} />
                </div>
              </section>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-[#0a0a0f] rounded-xl border border-white/6 overflow-hidden">
                  <div className="p-6">
                    <ScheduleAndDescription form={form} />
                  </div>
                </section>

                <section className="bg-[#0a0a0f] rounded-xl border border-white/6 overflow-hidden">
                  <div className="p-6">
                    <RulesAndGuidelines form={form} />
                  </div>
                </section>
              </div>

              {/* Links and Coordinators - Full Width */}
              <section className="bg-[#0a0a0f] rounded-xl border border-white/6 overflow-hidden">
                <div className="p-6">
                  <LinksAndCoordinators
                    links={links}
                    setLinks={setLinks}
                    coordinators={coordinators}
                    setCoordinators={setCoordinators}
                  />
                </div>
              </section>
            </div>
          </main>
        </form>
      </FormProvider>
    </div>
  );
};

export default Page;
