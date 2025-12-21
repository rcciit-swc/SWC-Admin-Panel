import { Button } from '@/components/ui/button';
import { Loader2, Plus, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Header = ({ form }: { form: any }) => {
  return (
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
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  Create New Event
                </h1>
                <p className="text-sm text-zinc-500">
                  Fill in the details to create a new event
                </p>
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
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Event
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
