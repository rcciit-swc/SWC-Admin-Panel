'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coordinator } from '@/lib/types/events';
import { Plus, Users } from 'lucide-react';

interface AddCoordinatorDialogProps {
  addCoordinator: (coordinator: Coordinator) => void;
}

export function AddCoordinatorDialog({
  addCoordinator,
}: AddCoordinatorDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddCoordinator = () => {
    if (name && phone) {
      addCoordinator({ name, phone });
      setName('');
      setPhone('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/20"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Coordinator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0f0f16] text-white border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">Add Coordinator</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                Add a coordinator for this event
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-zinc-300">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter coordinator name"
              className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-zinc-300">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="bg-transparent border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCoordinator}
            disabled={!name || !phone}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 border-0 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Coordinator
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
