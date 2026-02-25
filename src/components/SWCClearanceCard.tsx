'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkSWCClearance, SWCClearanceStatus } from '@/lib/actions/swc';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SWCClearanceCardProps {
  defaultRollNumber?: string | null;
}

export default function SWCClearanceCard({
  defaultRollNumber,
}: SWCClearanceCardProps) {
  // const [rollNumber, setRollNumber] = useState(defaultRollNumber || ''); // Removed
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SWCClearanceStatus>({ status: 'idle' });

  const handleCheck = async () => {
    if (!defaultRollNumber?.trim()) {
      toast.error('Roll number is missing from profile');
      return;
    }

    setLoading(true);
    setResult({ status: 'idle' });

    try {
      const res = await checkSWCClearance(defaultRollNumber);
      setResult(res);

      if (res.status === 'verified') {
        toast.success('SWC Fund Clearance Verified!');
      } else if (res.status === 'not_found') {
        toast.error('No record found for this Roll Number.');
      } else if (res.status === 'error') {
        toast.error(res.message || 'An error occurred.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to check clearance');
      setResult({ status: 'error', message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-white/10 bg-[#0a0a0f]/60 backdrop-blur-xl mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          SWC Fund Clearance
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Check if your SWC fund payment and data are verified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!defaultRollNumber ? (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
            Please complete your profile and save your{' '}
            <strong>College Roll Number</strong> below to check your SWC
            Clearance status.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="check-roll" className="text-zinc-300">
                Your Roll Number
              </Label>
              <Input
                id="check-roll"
                value={defaultRollNumber}
                disabled
                className="bg-zinc-900/50 border-white/10 text-zinc-400 cursor-not-allowed"
              />
            </div>
            <Button
              onClick={handleCheck}
              disabled={loading}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
            </Button>
          </div>
        )}

        {result.status === 'verified' && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-400">Verified</h4>
              <p className="text-sm text-zinc-300 mt-1">
                Student Name:{' '}
                <span className="text-white font-medium">
                  {result.data.name}
                </span>
              </p>
              <p className="text-sm text-zinc-300">
                Department:{' '}
                <span className="text-white font-medium">
                  {result.data.department}
                </span>
              </p>
              <p className="text-sm text-zinc-300">
                Payment Status:{' '}
                <span className="text-white font-medium">Success</span>
              </p>
            </div>
          </div>
        )}

        {result.status === 'not_found' && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-red-400">Not Found</h4>
              <p className="text-sm text-zinc-300 mt-1">
                No verified record found for this Roll Number. Please ensure you
                have paid the SWC funds and your data is updated in the sheet.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
