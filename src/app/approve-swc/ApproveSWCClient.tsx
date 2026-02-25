'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSWCQueries, updateSWCQueryStatus } from '@/lib/actions/swc';
import { SWCQueryWithUser } from '@/lib/types/swc';
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileImage,
  Loader2,
  Mail,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ApproveSWCClient() {
  const [pendingQueries, setPendingQueries] = useState<SWCQueryWithUser[]>([]);
  const [processedQueries, setProcessedQueries] = useState<SWCQueryWithUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const [pending, processed] = await Promise.all([
        getSWCQueries('pending'),
        getSWCQueries('processed'),
      ]);
      setPendingQueries(pending);
      setProcessedQueries(processed);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setActionLoading(id);
    const { success, error } = await updateSWCQueryStatus(id, action);
    setActionLoading(null);

    if (success) {
      toast.success(`Query ${action} successfully`);
      fetchQueries(); // refresh lists
    } else {
      toast.error(error || `Failed to ${action} query`);
    }
  };

  const QueryCard = ({
    query,
    isPending,
  }: {
    query: SWCQueryWithUser;
    isPending: boolean;
  }) => (
    <Card className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-white/90 flex items-center gap-2">
              <span className="bg-white/5 p-2 rounded-lg">
                <User className="w-5 h-5 text-indigo-400" />
              </span>
              {query.users?.name || 'Unknown User'}
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-2 flex flex-col gap-1.5">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {query.users?.email || 'N/A'}
              </span>
              {query.users?.college_roll && (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Roll:{' '}
                  {query.users.college_roll}
                </span>
              )}
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Trxn: {query.transaction_id}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />{' '}
                {new Date(query.created_at).toLocaleString()}
              </span>
            </CardDescription>
          </div>
          {!isPending && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border ${query.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}
            >
              {query.status.toUpperCase()}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 text-zinc-300">
        <p className="text-sm whitespace-pre-wrap bg-black/20 p-3 rounded-md border border-white/5">
          {query.description || 'No description provided.'}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-white/10"
            >
              <FileImage className="w-4 h-4 mr-2" />
              View Documents
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl bg-zinc-900 text-white border-white/10">
            <DialogHeader>
              <DialogTitle>
                Documents for Transaction {query.transaction_id}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Registration details from {query.users?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/80">
                  Transaction Screenshot
                </h4>
                <div className="relative aspect-[3/4] w-full bg-zinc-800/50 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center p-2">
                  {query.transaction_screenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={query.transaction_screenshot}
                      alt="Transaction"
                      className="object-contain w-full h-full rounded-md max-h-[60vh] md:max-h-full"
                    />
                  ) : (
                    <span className="text-zinc-500 text-sm">No image</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/80">
                  Email Confirmation Receipt
                </h4>
                <div className="relative aspect-[3/4] w-full bg-zinc-800/50 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center p-2">
                  {query.email_confirmation_receipt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={query.email_confirmation_receipt}
                      alt="Receipt"
                      className="object-contain w-full h-full rounded-md max-h-[60vh] md:max-h-full"
                    />
                  ) : (
                    <span className="text-zinc-500 text-sm">No receipt</span>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {isPending && (
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              onClick={() => handleAction(query.id, 'rejected')}
              disabled={actionLoading === query.id}
              className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/20 flex-1 sm:flex-none"
            >
              {actionLoading === query.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              onClick={() => handleAction(query.id, 'approved')}
              disabled={actionLoading === query.id}
              className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20 flex-1 sm:flex-none"
            >
              {actionLoading === query.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full mt-6">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-zinc-900/80 border border-white/10 mx-auto md:mx-0">
        <TabsTrigger
          value="pending"
          className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
        >
          Pending ({pendingQueries.length})
        </TabsTrigger>
        <TabsTrigger
          value="processed"
          className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
        >
          Processed ({processedQueries.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="space-y-6">
        {pendingQueries.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-lg border border-white/5">
            <ShieldCheck className="w-12 h-12 text-zinc-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium text-white/80">
              No pending requests
            </h3>
            <p className="text-zinc-400 mt-1">
              All fund requests have been reviewed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingQueries.map((query) => (
              <QueryCard key={query.id} query={query} isPending={true} />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="processed" className="space-y-6">
        {processedQueries.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 rounded-lg border border-white/5">
            <FileImage className="w-12 h-12 text-zinc-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium text-white/80">
              No processed requests
            </h3>
            <p className="text-zinc-400 mt-1">
              You haven't processed any requests yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {processedQueries.map((query) => (
              <QueryCard key={query.id} query={query} isPending={false} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
