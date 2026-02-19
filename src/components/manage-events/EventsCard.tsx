'use client';
import { InspectEventDialog } from '@/components/manage-events/InspectEventDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useEvents } from '@/lib/stores/events';
import { useFests } from '@/lib/stores/fests';
import { parseWithQuillStyles } from '@/utils/functions/admin/quillParser';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Edit3,
  Image as ImageIcon,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

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

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

// ... (previous imports)

export function EventCards({
  isSuperAdmin = false,
  eventIDs = [],
  categories = [],
}: {
  isSuperAdmin: boolean;
  eventIDs?: string[];
  categories?: any[];
}) {
  const { updateRegisterStatus } = useEvents();
  const { events, eventsLoading, getEventsByFest } = useFests();
  const { festId: paramFestId } = useParams<{ festId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (paramFestId) {
      getEventsByFest(paramFestId);
    }
  }, [paramFestId, getEventsByFest]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let filtered = isSuperAdmin
      ? events
      : events.filter((event) => event.id && eventIDs.includes(event.id));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(
        (event) => event.event_category_id === selectedCategory
      );
    }

    return filtered;
  }, [events, isSuperAdmin, eventIDs, searchQuery, selectedCategory]);

  if (eventsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500 focus:border-violet-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-zinc-400" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-[#0a0a0f] border-white/10 text-white focus:ring-violet-500/50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0f] border-white/10 text-white">
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!filteredEvents?.length && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No events found
          </h3>
          <p className="text-zinc-500 max-w-sm">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {filteredEvents.map((event, index) => (
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
                      className={`px-3 py-1 text-xs font-medium ${event.reg_status
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

                    <InspectEventDialog event={event} />

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
                <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden bg-zinc-900/50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-l from-[#0f0f16] via-transparent to-transparent z-10" />
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-700">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2">
                        <ImageIcon className="w-6 h-6 text-zinc-600" />
                      </div>
                      <span className="text-xs font-medium text-zinc-600">
                        No image
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
