'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { useEvents } from '@/lib/stores/events';
import { Skeleton } from '@/components/ui/skeleton';
import { parseWithQuillStyles } from '@/utils/functions/admin/quillParser';
import { RulesDialog } from '@/components/manage-events/RulesDialog';
import Image from 'next/image';
import {
  Calendar,
  Users,
  Trophy,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
} from 'lucide-react';

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

function EventCardSkeleton() {
  return (
    <Card className="relative bg-[#0f0f16] border border-white/6 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64 bg-white/6" />
              <Skeleton className="h-4 w-40 bg-white/6" />
            </div>
            <Skeleton className="h-6 w-32 rounded-full bg-white/6" />
          </div>
          <Skeleton className="h-20 w-full bg-white/6 rounded-lg mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-white/6" />
            ))}
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg bg-white/6" />
            ))}
          </div>
        </div>
        <div className="lg:w-72 h-48 lg:h-auto">
          <Skeleton className="w-full h-full bg-white/6" />
        </div>
      </div>
    </Card>
  );
}

export function EventCards({
  isSuperAdmin = false,
  eventID,
}: {
  isSuperAdmin: boolean;
  eventID?: string | undefined;
}) {
  const { eventsData, eventsLoading, setEventsData, updateRegisterStatus } =
    useEvents();

  useEffect(() => {
    setEventsData(true);
  }, [setEventsData]);

  if (eventsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!eventsData?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-violet-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No events yet</h3>
        <p className="text-zinc-500 max-w-sm">
          Get started by creating your first event to manage registrations and
          participants.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {(isSuperAdmin
          ? eventsData
          : eventsData?.filter((event) => event.id === eventID)
        )?.map((event, index) => (
          <motion.div
            key={event.id}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            layout
          >
            <Card className="relative bg-[#0f0f16] border border-white/6 overflow-hidden hover:border-white/10 transition-colors group">
              {/* Subtle gradient accent */}
              <div className="absolute inset-0 bg-linear-to-r from-violet-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col lg:flex-row relative">
                {/* Main Content */}
                <div className="flex-1 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white tracking-tight">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <div className="min-w-0 truncate">
                          {parseWithQuillStyles(event.schedule)}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={`px-3 py-1 text-xs font-medium ${
                        event.reg_status
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}
                    >
                      {event.reg_status ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <XCircle className="w-3 h-3" />
                          Closed
                        </span>
                      )}
                    </Badge>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <div className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                      {parseWithQuillStyles(event.description.slice(0, 180))}
                      {event.description.length > 180 && '...'}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#12121a] rounded-lg p-3 border border-white/4">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-xs text-zinc-500">Fee</span>
                      </div>
                      <p className="text-white font-semibold">
                        ₹{event.registration_fees}
                      </p>
                    </div>
                    <div className="bg-[#12121a] rounded-lg p-3 border border-white/4">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-zinc-500">Prize</span>
                      </div>
                      <p className="text-white font-semibold">
                        ₹{event.prize_pool}
                      </p>
                    </div>
                    <div className="bg-[#12121a] rounded-lg p-3 border border-white/4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs text-zinc-500">Team</span>
                      </div>
                      <p className="text-white font-semibold">
                        {event.min_team_size === event.max_team_size
                          ? event.min_team_size
                          : `${event.min_team_size}-${event.max_team_size}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/4">
                    <div className="flex items-center gap-2 mr-auto">
                      <Switch
                        checked={event.reg_status}
                        onCheckedChange={() => {
                          if (event.id) {
                            updateRegisterStatus(event.id, !event.reg_status);
                          }
                        }}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <span className="text-xs text-zinc-500">
                        Registration
                      </span>
                    </div>

                    <RulesDialog rules={event.rules} />

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/20"
                      asChild
                    >
                      <Link href={`/${event.id}`}>
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Image */}
                <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-l from-[#0f0f16] via-transparent to-transparent z-10" />
                  <Image
                    src={event.image_url}
                    alt={event.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
