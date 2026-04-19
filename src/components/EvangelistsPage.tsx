'use client';

import { Button } from '@/components/ui/button';
import {
  Ban,
  CheckCircle,
  Clock,
  Copy,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Fest {
  id: string;
  name: string;
  year: number;
}

interface Invitation {
  id: string;
  email: string;
  name: string;
  fest_id: string | null;
  token: string;
  status: 'pending' | 'accepted' | 'revoked';
  expires_at: string;
  created_at: string;
  created_by: string | null;
  fests: { name: string } | null;
}

interface EvangelistsPageProps {
  userId: string;
}

export default function EvangelistsPage({ userId }: EvangelistsPageProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [fests, setFests] = useState<Fest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [festId, setFestId] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/evangelists/invite');
      const data = await res.json();
      if (data.success) {
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFests = useCallback(async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('fests')
        .select('id, name, year')
        .eq('year', 2026)
        .order('name', { ascending: true });
      setFests(data || []);
    } catch (error) {
      console.error('Failed to fetch fests:', error);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
    fetchFests();
  }, [fetchInvitations, fetchFests]);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/evangelists/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          fest_id: festId || null,
          expires_in_days: expiryDays,
          created_by: userId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          data.emailSent
            ? 'Invitation sent successfully!'
            : 'Invitation created but email delivery failed'
        );
        setEmail('');
        setName('');
        setFestId('');
        setExpiryDays(7);
        setShowForm(false);
        fetchInvitations();
      } else {
        toast.error(data.error || 'Failed to send invitation');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    setActionLoadingId(invitationId);
    try {
      const res = await fetch('/api/evangelists/invite/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_id: invitationId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Invitation email resent!');
      } else {
        toast.error(data.error || 'Failed to resend');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    setActionLoadingId(invitationId);
    try {
      const res = await fetch('/api/evangelists/invite/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_id: invitationId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Invitation revoked');
        fetchInvitations();
      } else {
        toast.error(data.error || 'Failed to revoke');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyInvitationLink = (token: string) => {
    const onboardUrl =
      process.env.NEXT_PUBLIC_EVANGELIST_ONBOARD_URL ||
      process.env.NEXT_PUBLIC_COMMUNITY_ONBOARD_URL ||
      'http://localhost:3001';
    const link = `${onboardUrl}/evangelist/onboard?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied!');
  };

  const getStatusBadge = (invitation: Invitation) => {
    const isExpired = new Date(invitation.expires_at) < new Date();

    if (invitation.status === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Accepted
        </span>
      );
    }

    if (invitation.status === 'revoked') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
          <Ban className="w-3 h-3" />
          Revoked
        </span>
      );
    }

    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20">
          <Clock className="w-3 h-3" />
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const filteredInvitations = invitations.filter(
    (inv) =>
      inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Evangelists
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage evangelist invitations
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Invitation
        </Button>
      </div>

      {/* Invitation Form */}
      {showForm && (
        <div className="mb-8 bg-[#1a0a2e]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-violet-400" />
            Send Invitation
          </h2>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="evangelist@example.com"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Fest (Optional)
                </label>
                <select
                  value={festId}
                  onChange={(e) => setFestId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all appearance-none"
                >
                  <option value="" className="bg-[#1a0a2e]">
                    Select a fest
                  </option>
                  {fests.map((fest) => (
                    <option
                      key={fest.id}
                      value={fest.id}
                      className="bg-[#1a0a2e]"
                    >
                      {fest.name} {fest.year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Expiry (Days)
                </label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) =>
                    setExpiryDays(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min={1}
                  max={90}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={sending}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {sending ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 w-72 text-sm transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>
            Total: <strong className="text-white">{invitations.length}</strong>
          </span>
          <span>
            Pending:{' '}
            <strong className="text-violet-400">
              {invitations.filter((i) => i.status === 'pending').length}
            </strong>
          </span>
          <span>
            Accepted:{' '}
            <strong className="text-emerald-400">
              {invitations.filter((i) => i.status === 'accepted').length}
            </strong>
          </span>
        </div>
      </div>

      {/* Invitations List */}
      {filteredInvitations.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-gray-400">
            {searchQuery ? 'No matching invitations' : 'No invitations yet'}
          </p>
          <p className="text-sm mt-1">
            {searchQuery
              ? 'Try a different search term'
              : 'Click "New Invitation" to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvitations.map((invitation) => {
            const isExpired = new Date(invitation.expires_at) < new Date();
            const canAct = invitation.status === 'pending' && !isExpired;

            return (
              <div
                key={invitation.id}
                className="bg-[#1a0a2e]/60 backdrop-blur-sm border border-white/5 rounded-xl p-4 sm:p-5 hover:border-white/10 transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="text-white font-semibold text-base truncate">
                        {invitation.name}
                      </h3>
                      {getStatusBadge(invitation)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                      <span className="truncate">{invitation.email}</span>
                      {invitation.fests?.name && (
                        <span className="text-violet-400/70">
                          {invitation.fests.name}
                        </span>
                      )}
                      <span>
                        Expires:{' '}
                        {new Date(invitation.expires_at).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </span>
                      <span className="text-gray-500">
                        Created:{' '}
                        {new Date(invitation.created_at).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyInvitationLink(invitation.token)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      title="Copy invitation link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {canAct && (
                      <>
                        <button
                          onClick={() => handleResend(invitation.id)}
                          disabled={actionLoadingId === invitation.id}
                          className="p-2 rounded-lg text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all disabled:opacity-50"
                          title="Resend invitation"
                        >
                          {actionLoadingId === invitation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRevoke(invitation.id)}
                          disabled={actionLoadingId === invitation.id}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          title="Revoke invitation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
