'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Save, ArrowLeft, Calendar, Settings } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import { eventSchema } from '@/lib/schemas/events';
type EventFormInput = z.input<typeof eventSchema>;
type EventFormOutput = z.output<typeof eventSchema>;
import { useEvents } from '@/lib/stores/events';
import { Coordinator, LinkType } from '@/lib/types/events';
import { toast } from 'sonner';
import { ScheduleAndDescription } from '@/components/manage-events/ScheduleAndDescription';
import { RulesAndGuidelines } from '@/components/manage-events/RulesAndGuidelines';
import { LinksAndCoordinators } from '@/components/manage-events/LinkAndCoordinators';
import { BasicInformation } from '@/components/manage-events/BasicInformation';
import { EditEventSkeleton } from '@/components/manage-events/EditEventSkeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();

  const { eventsData, eventsLoading, updateEventsData, setEventsData } = useEvents();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  console.log('Events Data:', eventsData);
  console.log('Event ID:', eventId);
  useEffect(() => {
    setEventsData(true);
  }, [setEventsData]);

  const eventToEdit = eventsData?.find((event) => event.id === eventId);
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

  useEffect(() => {
    if (eventToEdit) {
      form.reset({
        name: eventToEdit.name,
        registration_fees: eventToEdit.registration_fees,
        prize_pool: eventToEdit.prize_pool,
        image_url: eventToEdit.image_url,
        // event_category_id: eventToEdit.event_category_id,
        min_team_size: Number(eventToEdit.min_team_size),
        max_team_size: Number(eventToEdit.max_team_size),
        schedule: eventToEdit.schedule,
        description: eventToEdit.description,
        rules: eventToEdit.rules,
        coordinators: eventToEdit.coordinators || [],
        links: eventToEdit.links || [],
        reg_status: eventToEdit.reg_status,
      });
      setLinks(eventToEdit.links || []);
      setCoordinators(eventToEdit.coordinators || []);
    }
  }, [eventToEdit, form]);

  console.log('Event to edit:', eventToEdit);

  // Optionally, show a loading or error state if needed.
  // Don't swap to the global loading skeleton while submitting updates,
  // otherwise the page briefly "flashes" before redirecting.
  if (eventsLoading && !form.formState.isSubmitting) {
    return <EditEventSkeleton />;
  }
  if (!eventToEdit) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Event not found</h3>
          <p className="text-zinc-500 mb-6">The event you're looking for doesn't exist.</p>
          <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  async function onSubmit(values: EventFormInput) {
    try {
      const parsed: EventFormOutput = eventSchema.parse(values);
      const eventData = {
        ...parsed,
        min_team_size: parsed.min_team_size,
        max_team_size: parsed.max_team_size,
        links: links,
        coordinators: coordinators,
      };

      await updateEventsData(eventId, eventData);
      router.push('/');
    } catch (error: any) {
      console.error(error);
      // updateEventById already emits a toast on failure; keep this as a fallback.
      toast.error('Failed to update event');
    }
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <header className="relative border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="container max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link 
                    href="/"
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                      <Settings className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold tracking-tight text-white">Edit Event</h1>
                      <p className="text-sm text-zinc-500">{eventToEdit?.name}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative container max-w-6xl mx-auto px-6 py-8">
            <div className="space-y-6">
              {/* Basic Information - Full Width */}
              <section className="bg-[#0a0a0f] rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="p-6">
                  <BasicInformation form={form} />
                </div>
              </section>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-[#0a0a0f] rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="p-6">
                    <ScheduleAndDescription form={form} />
                  </div>
                </section>

                <section className="bg-[#0a0a0f] rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="p-6">
                    <RulesAndGuidelines form={form} />
                  </div>
                </section>
              </div>

              {/* Links and Coordinators - Full Width */}
              <section className="bg-[#0a0a0f] rounded-xl border border-white/[0.06] overflow-hidden">
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
      </Form>
    </div>
  );
}
