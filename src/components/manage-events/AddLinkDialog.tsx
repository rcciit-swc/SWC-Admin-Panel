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
import { LinkType } from '@/lib/types/events';
import { Plus, Link2 } from 'lucide-react';

interface AddLinkDialogProps {
  addLink: (link: LinkType) => void;
}

export function AddLinkDialog({ addLink }: AddLinkDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleClick = () => {
    if (title && url) {
      addLink({ title, url });
      setTitle('');
      setUrl('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/20"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0f0f16] text-white border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Link2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                Add Link
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                Add a relevant link for this event
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-zinc-300"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter link title"
              className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium text-zinc-300">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 h-11"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="bg-transparent border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClick}
            disabled={!title || !url}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 border-0 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
