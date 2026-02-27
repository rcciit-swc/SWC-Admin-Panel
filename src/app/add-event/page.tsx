'use client';
import { BasicInformation } from '@/components/manage-events/BasicInformation';
import Header from '@/components/manage-events/Header';
import { LinksAndCoordinators } from '@/components/manage-events/LinkAndCoordinators';
import { RulesAndGuidelines } from '@/components/manage-events/RulesAndGuidelines';
import { ScheduleAndDescription } from '@/components/manage-events/ScheduleAndDescription';
import { eventSchema } from '@/lib/schemas/events';
import { useEvents } from '@/lib/stores/events';
import { Convenor, Coordinator, LinkType } from '@/lib/types/events';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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
  const [convenors, setConvenors] = useState<Convenor[]>([]);
  const { postEvent, setEventsData } = useEvents();
  async function onSubmit(values: EventFormInput) {
    console.log('Form submitted with values:', values);
    console.log('Links:', links);
    console.log('Coordinators:', coordinators);

    try {
      console.log('Parsing event schema...');
      const parsed: EventFormOutput = eventSchema.parse(values);
      console.log('Parsed successfully:', parsed);

      const eventData = {
        ...parsed,
        min_team_size: parsed.min_team_size,
        max_team_size: parsed.max_team_size,
        links: links,
        coordinators: coordinators,
        convenors: parsed.convenors || [],
        event_category_id: 'c90f8d69-3520-43ac-85f6-043c6f60bf49',
      };

      console.log('Event data to be posted:', eventData);
      console.log('Calling postEvent...');

      await postEvent(eventData);

      console.log('Event posted successfully, refreshing events data...');
      await setEventsData(true);

      toast.success('Event created!');
      console.log('Redirecting to home page...');
      router.push('/');
    } catch (error: any) {
      console.error('Error creating event:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error('Failed to create event. ' + error.message);
    }
  }

  // Log form errors whenever they change
  console.log('Form errors:', form.formState.errors);
  console.log('Form values:', form.getValues());
  console.log('Form is valid:', form.formState.isValid);
  console.log('Form is submitting:', form.formState.isSubmitting);

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-linear-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      {/* Debug Panel - Show form errors */}
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-md z-50">
          <h4 className="text-red-400 font-semibold mb-2">
            Form Validation Errors:
          </h4>
          <ul className="text-red-300 text-sm space-y-1">
            {Object.entries(form.formState.errors).map(([key, error]) => (
              <li key={key}>
                <strong>{key}:</strong>{' '}
                {error?.message?.toString() || 'Invalid'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormProvider {...form}>
        <form id="create-event-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                    convenors={convenors}
                    setConvenors={setConvenors}
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
