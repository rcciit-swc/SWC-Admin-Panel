'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, GripVertical, Loader2, Save, Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  role_name: string;
  image: string;
  sequence: number;
  team_id: string;
  team_name: string;
}

interface ManageTeamSequenceProps {
  isSuperAdmin: boolean;
  festId: string;
}

// Sortable Item Component
function SortableItem({ member }: { member: TeamMember }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 transition-all ${
        isDragging
          ? 'opacity-50 scale-105 shadow-2xl z-50'
          : 'hover:bg-white/10'
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-white transition-colors touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Sequence Number */}
      <div className="flex-shrink-0 w-10 h-10 bg-indigo-600/30 border border-indigo-500/50 rounded-lg flex items-center justify-center">
        <span className="text-indigo-300 font-bold text-sm">
          {member.sequence}
        </span>
      </div>

      {/* Member Image */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <h5 className="text-white font-medium text-sm truncate">
          {member.name}
        </h5>
        <p className="text-zinc-400 text-xs mt-0.5 truncate">
          {member.role_name}
        </p>
      </div>
    </div>
  );
}

export default function ManageTeamSequence({
  isSuperAdmin,
  festId,
}: ManageTeamSequenceProps) {
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [originalMembers, setOriginalMembers] = useState<TeamMember[]>([]); // Track original state
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [changedTeamIds, setChangedTeamIds] = useState<Set<string>>(new Set()); // Track which teams changed

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay before drag starts on touch
        tolerance: 8, // Allow 8px movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all team members
  useEffect(() => {
    const fetchMembers = async () => {
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
          .eq('fest_id', festId)
          .order('team_id')
          .order('sequence');

        if (error) throw error;

        const formattedMembers: TeamMember[] =
          data?.map((member: any) => ({
            id: member.id,
            name: member.name,
            role_name: member.role_name,
            image: member.image,
            sequence: member.sequence,
            team_id: member.team_id,
            team_name: member.defined_org_teams?.team_name || 'Unknown Team',
          })) || [];

        setAllMembers(formattedMembers);
        setOriginalMembers(formattedMembers); // Store original state
        setFilteredMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    if (isSuperAdmin && festId) {
      fetchMembers();
    }
  }, [isSuperAdmin, festId]);

  // Filter members based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(allMembers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.role_name.toLowerCase().includes(query) ||
          member.team_name.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, allMembers]);

  // Group members by team
  const groupedMembers = filteredMembers.reduce(
    (acc, member) => {
      if (!acc[member.team_name]) {
        acc[member.team_name] = [];
      }
      acc[member.team_name].push(member);
      return acc;
    },
    {} as Record<string, TeamMember[]>
  );

  // Toggle team expansion
  const toggleTeam = (teamName: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamName)) {
      newExpanded.delete(teamName);
    } else {
      newExpanded.add(teamName);
    }
    setExpandedTeams(newExpanded);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent, teamName: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const teamMembers = groupedMembers[teamName];
    const oldIndex = teamMembers.findIndex((m) => m.id === active.id);
    const newIndex = teamMembers.findIndex((m) => m.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTeamMembers = arrayMove(teamMembers, oldIndex, newIndex);

      // Update sequences for this team (1-indexed)
      const updatedTeamMembers = reorderedTeamMembers.map((member, index) => ({
        ...member,
        sequence: index + 1,
      }));

      // Update all members with the new sequences and order for this team
      const updatedAllMembers = allMembers.map((member) => {
        if (member.team_name === teamName) {
          const updated = updatedTeamMembers.find((m) => m.id === member.id);
          return updated || member;
        }
        return member;
      });

      // Sort the updated members by team_id and then by sequence to maintain visual order
      const sortedMembers = updatedAllMembers.sort((a, b) => {
        if (a.team_id === b.team_id) {
          return a.sequence - b.sequence;
        }
        return a.team_id.localeCompare(b.team_id);
      });

      setAllMembers(sortedMembers);
      setHasChanges(true);

      // Track which team was changed
      const teamMember = sortedMembers.find((m) => m.team_name === teamName);
      if (teamMember) {
        setChangedTeamIds((prev) => new Set(prev).add(teamMember.team_id));
      }
    }
  };

  // Save changes - only update teams that have been modified
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Get only the teams that have changes
      const teamsToUpdate = Array.from(changedTeamIds);

      if (teamsToUpdate.length === 0) {
        toast.info('No changes to save');
        setSaving(false);
        return;
      }

      // Update each changed team using RPC for true batch updates
      const updatePromises = teamsToUpdate.map(async (teamId) => {
        // Get all members for this team
        const teamMembers = allMembers.filter((m) => m.team_id === teamId);

        // Prepare the updates array for RPC
        const updates = teamMembers.map((member) => ({
          id: member.id,
          sequence: member.sequence,
        }));

        // Call the PostgreSQL function to update all members in a single transaction
        const { error } = await supabase.rpc('update_team_sequences', {
          updates: updates,
        });

        if (error) throw error;
      });

      // Wait for all team updates to complete
      await Promise.all(updatePromises);

      toast.success(
        `Successfully updated ${teamsToUpdate.length} team${teamsToUpdate.length > 1 ? 's' : ''}!`
      );

      // Reset change tracking
      setHasChanges(false);
      setChangedTeamIds(new Set());
      setOriginalMembers(allMembers); // Update original state
    } catch (error: any) {
      console.error('Error saving sequences:', error);

      // Check if error is due to access denied
      if (
        error?.message?.includes('Access denied') ||
        error?.message?.includes('super_admin')
      ) {
        toast.error(
          'Access denied. Only super admins can update team sequences.'
        );
      } else {
        toast.error('Failed to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Access Denied
          </h2>
          <p className="text-zinc-300">
            This feature is only accessible to super administrators.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-white/10 rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage Team Member Sequences
          </h1>
          <p className="text-zinc-400">
            Drag and drop to reorder team members. Click "Save Changes" when
            done.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by name, role, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 h-12"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-zinc-400 mt-2">
              Found {filteredMembers.length} member
              {filteredMembers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="mb-6 bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-amber-300 font-semibold">
                You have unsaved changes
              </p>
              <p className="text-zinc-400 text-sm">
                Click "Save Changes" to update the sequences
              </p>
            </div>
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Teams List */}
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
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Team Header */}
                  <button
                    onClick={() => toggleTeam(teamName)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-indigo-300 font-bold text-lg">
                        {teamName}
                      </h3>
                      <span className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                        {members.length}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-indigo-300 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Team Members - Sortable List */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-white/10">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, teamName)}
                      >
                        <SortableContext
                          items={members.map((m) => m.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3 mt-3">
                            {members.map((member) => (
                              <SortableItem key={member.id} member={member} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Save Button */}
        {hasChanges && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
