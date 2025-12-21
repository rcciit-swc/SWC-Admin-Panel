'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { parseWithQuillStyles } from '@/utils/functions/admin/quillParser';
import { useState } from 'react';
import { ScrollText, X } from 'lucide-react';

type RulesDialogProps = {
  rules: string;
};

export const RulesDialog = ({ rules }: RulesDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/30"
        >
          <ScrollText className="w-3.5 h-3.5 mr-1.5" />
          Rules
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0f0f16] text-white max-w-2xl border-white/10 max-h-[85vh] overflow-hidden">
        <DialogHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ScrollText className="w-5 h-5 text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">
              Event Rules & Guidelines
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-4 py-4 text-zinc-300 text-sm leading-relaxed custom-scrollbar">
          {parseWithQuillStyles(rules)}
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
