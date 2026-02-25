'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { parseWithQuillStyles } from '@/utils/functions/admin/quillParser';
import {
  Clock,
  Info,
  ListCollapse,
  ScrollText,
  Search,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

type InspectEventDialogProps = {
  event: any;
};

export const InspectEventDialog = ({ event }: InspectEventDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'rules' | 'details'>(
    'about'
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/30"
        >
          <Search className="w-3.5 h-3.5 mr-1.5" />
          Inspect
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0f0f16] text-white max-w-2xl border-white/10 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-white/[0.06] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">
              {event.name} Details
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-4">
          <div className="w-full">
            <div className="flex items-center bg-white/5 border border-white/10 w-full justify-start rounded-lg mb-6 flex-wrap h-auto p-1">
              <button
                onClick={() => setActiveTab('about')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none ${activeTab === 'about' ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none ${activeTab === 'rules' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400'}`}
              >
                <ScrollText className="w-4 h-4 mr-2" />
                Rules
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none ${activeTab === 'details' ? 'bg-white/10 text-white' : 'text-zinc-400'}`}
              >
                <ListCollapse className="w-4 h-4 mr-2" />
                Details
              </button>
            </div>

            {activeTab === 'about' && (
              <div className="mt-0 focus-visible:outline-none outline-none">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-zinc-400" />
                      Description
                    </h4>
                    <div className="text-zinc-300 text-sm leading-relaxed p-4 bg-white/5 rounded-xl border border-white/10">
                      {parseWithQuillStyles(event.description)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      Schedule & Venue
                    </h4>
                    <div className="text-zinc-300 text-sm leading-relaxed p-4 bg-white/5 rounded-xl border border-white/10">
                      {parseWithQuillStyles(event.schedule)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="mt-0 focus-visible:outline-none outline-none">
                <div className="text-zinc-300 text-sm leading-relaxed p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                  {parseWithQuillStyles(event.rules)}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="mt-0 focus-visible:outline-none outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-violet-400" />{' '}
                      Registration Fee
                    </span>
                    <span className="text-lg font-semibold text-white">
                      ₹{event.registration_fees}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" /> Prize
                      Pool
                    </span>
                    <span className="text-lg font-semibold text-white">
                      ₹{event.prize_pool}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" /> Team Size
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {event.min_team_size === event.max_team_size
                        ? event.min_team_size
                        : `${event.min_team_size} - ${event.max_team_size}`}{' '}
                      Members
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-400" />{' '}
                      Registration Status
                    </span>
                    <span className="text-sm font-semibold text-white capitalize">
                      {event.reg_status ? (
                        <span className="text-emerald-400">Open</span>
                      ) : (
                        <span className="text-zinc-500">Closed</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
