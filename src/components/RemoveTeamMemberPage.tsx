'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  Search,
  Trash2,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  requester_id: string | null;
  team_name?: string;
}

interface RemoveTeamMemberPageProps {
  userId: string;
  isSuperAdmin: boolean;
}

export default function RemoveTeamMemberPage({
  userId,
  isSuperAdmin,
}: RemoveTeamMemberPageProps) {
  const router = useRouter();
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch all team members
  const fetchAllTeamMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_teams')
        .select(
          `
          *,
          defined_org_teams!org_teams_team_id_fkey(team_name)
        `
        )
        .eq('approved', true)
        .order('team_id')
        .order('sequence');

      if (error) throw error;

      const formattedMembers: TeamMember[] =
        data?.map((member: any) => ({
          id: member.id,
          created_at: member.created_at,
          fest_id: member.fest_id,
          name: member.name,
          team_id: member.team_id,
          image: member.image,
          sequence: member.sequence,
          approved: member.approved,
          role_name: member.role_name,
          approved_at: member.approved_at,
          approved_by: member.approved_by,
          requester_id: member.requester_id,
          team_name: member.defined_org_teams?.team_name || 'Unknown Team',
        })) || [];

      setAllTeamMembers(formattedMembers);
      setFilteredMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAllTeamMembers();
    }
  }, [isSuperAdmin]);

  // Filter members based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(allTeamMembers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allTeamMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.role_name.toLowerCase().includes(query) ||
          member.team_name?.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, allTeamMembers]);

  // Group members by team
  const groupedMembers = filteredMembers.reduce(
    (acc, member) => {
      const teamName = member.team_name || 'Unknown Team';
      if (!acc[teamName]) {
        acc[teamName] = [];
      }
      acc[teamName].push(member);
      return acc;
    },
    {} as Record<string, TeamMember[]>
  );

  // Toggle team accordion
  const toggleTeam = (teamName: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamName)) {
      newExpanded.delete(teamName);
    } else {
      newExpanded.add(teamName);
    }
    setExpandedTeams(newExpanded);
  };

  // Handle remove button click
  const handleRemoveClick = (member: TeamMember) => {
    setMemberToRemove(member);
    setShowConfirmDialog(true);
  };

  // Handle confirm remove
  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    setRemovingMember(memberToRemove.id);
    setShowConfirmDialog(false);

    try {
      const { data, error } = await supabase.rpc('remove_team_member', {
        member_id: memberToRemove.id,
      });

      if (error) throw error;

      // Check if the RPC function returned an error in the JSON
      if (data && !data.success) {
        throw new Error(data.message || 'Failed to remove team member');
      }

      toast.success(
        `Successfully removed ${memberToRemove.name} from ${memberToRemove.team_name}`
      );

      // Refresh the list
      await fetchAllTeamMembers();
    } catch (error: any) {
      console.error('Error removing team member:', error);

      if (
        error?.message?.includes('Access denied') ||
        error?.message?.includes('super_admin')
      ) {
        toast.error(
          'Access denied. Only super admins can remove team members.'
        );
      } else {
        toast.error(error?.message || 'Failed to remove team member');
      }
    } finally {
      setRemovingMember(null);
      setMemberToRemove(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#050508]">
        <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

        <main className="relative container max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              Access Denied
            </h2>
            <p className="text-zinc-300 mb-6">
              This feature is only accessible to super administrators.
            </p>
            <Button
              onClick={() => router.push('/team-entry')}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team Entry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050508]">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <main className="relative container max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                Remove Team Members
              </h1>
              <p className="text-zinc-400">
                Permanently remove team members. Sequences will be automatically
                updated.
              </p>
            </div>
            <Button
              onClick={() => router.push('/team-entry')}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading team members...</p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search by name, role, or team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-violet-500/50"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-zinc-400 mt-2">
                  Found {filteredMembers.length} member
                  {filteredMembers.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Team Members by Category - Accordions */}
            {Object.entries(groupedMembers).length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <p className="text-zinc-400 text-lg">
                  {searchQuery
                    ? 'No members found matching your search'
                    : 'No team members available'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedMembers).map(([teamName, members]) => {
                  const isExpanded = expandedTeams.has(teamName);

                  return (
                    <div
                      key={teamName}
                      className="border border-white/10 rounded-xl overflow-hidden bg-white/5"
                    >
                      {/* Team Header */}
                      <button
                        onClick={() => toggleTeam(teamName)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                          <h4 className="text-red-300 font-semibold text-base sm:text-lg">
                            {teamName}
                          </h4>
                          <span className="bg-red-600/30 text-red-300 px-2 py-0.5 rounded-full text-xs font-medium">
                            {members.length}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-red-300 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Team Members Grid */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-white/10">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
                            {members.map((member) => {
                              const isRemoving = removingMember === member.id;

                              return (
                                <div
                                  key={member.id}
                                  className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                      <Image
                                        src={member.image}
                                        alt={member.role_name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-white font-medium text-sm truncate">
                                        {member.role_name}
                                      </h5>
                                      <p className="text-zinc-300 text-xs mt-0.5 truncate">
                                        {member.name}
                                      </p>
                                      <p className="text-zinc-500 text-xs mt-1">
                                        Seq: {member.sequence}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <Button
                                      size="sm"
                                      onClick={() => handleRemoveClick(member)}
                                      disabled={isRemoving}
                                      className="w-full bg-red-600 hover:bg-red-500 text-white h-7 text-xs"
                                    >
                                      {isRemoving ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Removing...
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="w-3 h-3 mr-1" />
                                          Remove
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent className="bg-[#0a0a0f] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Confirm Removal
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                {memberToRemove && (
                  <>
                    Are you sure you want to remove{' '}
                    <span className="text-white font-semibold">
                      {memberToRemove.name}
                    </span>{' '}
                    ({memberToRemove.role_name}) from{' '}
                    <span className="text-white font-semibold">
                      {memberToRemove.team_name}
                    </span>
                    ?
                    <br />
                    <br />
                    <span className="text-red-400">
                      This action cannot be undone. All remaining team members'
                      sequences will be automatically updated.
                    </span>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRemove}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
