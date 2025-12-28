'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Eye, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TeamMember {
  id: string;
  created_at: string;
  fest_id: string;
  name: string;
  team_id: string;
  image: string;
  sequence: number;
  approved: boolean;
  role_name: string;
  approved_at: string | null;
  approved_by: string | null;
  requester_id: string;
  fest_name?: string;
  team_name?: string;
  requester_email?: string;
}

interface ApproveTeamTableProps {
  userId: string;
}

const ApproveTeamTable = ({ userId }: ApproveTeamTableProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      // Fetch pending team members
      const { data: members, error } = await supabase
        .from('org_teams')
        .select(
          `
                    *,
                    fests!org_teams_fest_id_fkey(name),
                    defined_org_teams!org_teams_team_id_fkey(team_name),
                    users!org_teams_requester_id_fkey(email)
                `
        )
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMembers =
        members?.map((member: any) => ({
          ...member,
          fest_name: member.fests?.name,
          team_name: member.defined_org_teams?.team_name,
          requester_email: member.users?.email,
        })) || [];

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleApprove = async (member: TeamMember) => {
    setActionLoading(member.id);
    try {
      const { error } = await supabase
        .from('org_teams')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: userId,
        })
        .eq('id', member.id)
        .eq('fest_id', member.fest_id)
        .eq('team_id', member.team_id)
        .eq('sequence', member.sequence);

      if (error) throw error;

      toast.success(`Approved ${member.name} successfully!`);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error('Failed to approve member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (member: TeamMember) => {
    setActionLoading(member.id);
    try {
      const { error } = await supabase
        .from('org_teams')
        .delete()
        .eq('id', member.id)
        .eq('fest_id', member.fest_id)
        .eq('team_id', member.team_id)
        .eq('sequence', member.sequence);

      if (error) throw error;

      toast.success(`Rejected ${member.name}'s request`);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error('Failed to reject member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = (member: TeamMember) => {
    setSelectedMember(member);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <p className="text-zinc-400">No pending team member requests</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Fest
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm font-medium text-white">
                        {member.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-300">
                      {member.role_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-300">
                      {member.team_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-300">
                      {member.fest_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-300">
                      {member.requester_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-400">
                      {new Date(member.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(member)}
                        className="border-white/10 text-white hover:bg-white/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(member)}
                        disabled={actionLoading === member.id}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 border-0"
                      >
                        {actionLoading === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(member)}
                        disabled={actionLoading === member.id}
                        className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 border-0"
                      >
                        {actionLoading === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-[#0a0a0f] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Team Member Details
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Review the complete information
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-6">
              {/* Image */}
              <div className="flex justify-center">
                <div className="relative h-48 w-48 rounded-lg overflow-hidden border-4 border-violet-500">
                  <Image
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-zinc-400 text-sm">Name</p>
                  <p className="text-white font-medium">
                    {selectedMember.name}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Role</p>
                  <p className="text-white font-medium">
                    {selectedMember.role_name}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Team</p>
                  <p className="text-white font-medium">
                    {selectedMember.team_name}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Fest</p>
                  <p className="text-white font-medium">
                    {selectedMember.fest_name}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Sequence</p>
                  <p className="text-white font-medium">
                    {selectedMember.sequence}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Requested By</p>
                  <p className="text-white font-medium">
                    {selectedMember.requester_email}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-zinc-400 text-sm">Requested Date</p>
                  <p className="text-white font-medium">
                    {new Date(selectedMember.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    handleApprove(selectedMember);
                    setViewDialogOpen(false);
                  }}
                  disabled={actionLoading === selectedMember.id}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 border-0"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    handleReject(selectedMember);
                    setViewDialogOpen(false);
                  }}
                  disabled={actionLoading === selectedMember.id}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 border-0"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApproveTeamTable;
