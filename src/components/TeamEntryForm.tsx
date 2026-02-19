'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Eye,
  History,
  Save,
  Trash2,
  Upload,
  UserPlus,
  Users,
  XCircle,
  X as XIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Fest {
  id: string;
  name: string;
}

interface DefinedTeam {
  role: string;
  team_name: string;
}

interface EventCategory {
  id: string;
  name: string;
}

interface Event {
  id: string;
  name: string;
}

interface FormData {
  fest_id: string;
  event_category_id: string;
  event_id: string;
  team_id: string;
  name: string;
  phone: string;
  role_name: string;
  member_type: 'Team Member' | 'Lead' | '';
  college_roll: string;
  course: string;
  stream: string;
  gender: 'male' | 'female' | '';
  image_file: File | null;
  image_url: string;
}

interface PreviousRequest {
  id: string;
  created_at: string;
  fest_name: string;
  team_name: string;
  role_name: string;
  name: string;
  approved: boolean;
  approved_at: string | null;
  image: string;
}

interface AllTeamMember {
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

interface OwnershipTransferRequest {
  id: string;
  created_at: string;
  current_owner_id: string | null;
  new_owner_id: string | null;
  approved_at: string | null;
  approved_by: string | null;
  org_team_id: string;
  org_team?: AllTeamMember;
}

interface TeamEntryFormProps {
  userId: string;
  isSuperAdmin?: boolean;
}

// Function to process events for display - remove duplicates and clean names
const processEventsForDisplay = (
  eventsList: Event[]
): Array<{ id: string; displayName: string; originalName: string }> => {
  const processedMap = new Map<
    string,
    { id: string; displayName: string; originalName: string }
  >();

  eventsList.forEach((event) => {
    let displayName = event.name;

    // Check if event contains "TRACK AND SPORTS" (case insensitive)
    if (displayName.toUpperCase().includes('TRACK AND SPORTS')) {
      displayName = 'TRACK AND SPORTS';
    } else if (displayName.toUpperCase().includes('BGMI')) {
      displayName = 'BGMI';
    } else if (displayName.toUpperCase().includes('E-FOOTBALL')) {
      displayName = 'E-Football';
    } else {
      // Remove (SINGLES), (DOUBLES), (MALE), (FEMALE) from the event name
      displayName = displayName
        .replace(/\(SINGLES\)/gi, '')
        .replace(/\(DOUBLES\)/gi, '')
        .trim();

      // Remove "TOURNAMENT" word
      displayName = displayName.replace(/\bTOURNAMENT\b/gi, '').trim();

      // Remove extra spaces
      displayName = displayName.replace(/\s+/g, ' ');
    }

    // Only add if this display name doesn't exist yet
    if (!processedMap.has(displayName)) {
      processedMap.set(displayName, {
        id: event.id,
        displayName: displayName,
        originalName: event.name,
      });
    }
  });

  return Array.from(processedMap.values());
};

const TeamEntryForm = ({
  userId,
  isSuperAdmin = false,
}: TeamEntryFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fests, setFests] = useState<Fest[]>([]);
  const [teams, setTeams] = useState<DefinedTeam[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [previousRequests, setPreviousRequests] = useState<PreviousRequest[]>(
    []
  );
  const [showPreviousRequests, setShowPreviousRequests] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PreviousRequest | null>(
    null
  );
  const [editName, setEditName] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Ownership transfer states
  const [allTeamMembers, setAllTeamMembers] = useState<AllTeamMember[]>([]);
  const [ownershipRequests, setOwnershipRequests] = useState<
    OwnershipTransferRequest[]
  >([]);
  const [userOwnRequests, setUserOwnRequests] = useState<
    OwnershipTransferRequest[]
  >([]);
  const [showOwnershipSection, setShowOwnershipSection] = useState(false);
  const [showMyRequestsSection, setShowMyRequestsSection] = useState(false);
  const [loadingOwnership, setLoadingOwnership] = useState(true);
  const [requestingOwnership, setRequestingOwnership] = useState<string | null>(
    null
  );
  const [approvingRequest, setApprovingRequest] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    fest_id: '',
    event_category_id: '',
    event_id: '',
    team_id: '',
    name: '',
    phone: '',
    role_name: '',
    member_type: '',
    college_roll: '',
    course: '',
    stream: '',
    gender: '',
    image_file: null,
    image_url: '',
  });

  // Teams that require event category selection
  const requiresCategorySelection = [
    'coordinators',
    'volunteers',
    'convenors',
    'category_convenors',
  ].includes(formData.team_id);

  // Teams that require specific event selection
  const requiresEventSelection = [
    'coordinators',
    'volunteers',
    'convenors',
  ].includes(formData.team_id);

  // Check if role name should be disabled (always disabled now)
  const isRoleNameDisabled = true;

  // Get processed events for display - memoized to prevent infinite loops
  const displayEvents = useMemo(
    () => processEventsForDisplay(events),
    [events]
  );

  // Fetch previous requests on mount
  useEffect(() => {
    const fetchPreviousRequests = async () => {
      setLoadingRequests(true);
      try {
        const { data, error } = await supabase
          .from('org_teams')
          .select(
            `
                        *,
                        fests!org_teams_fest_id_fkey(name),
                        defined_org_teams!org_teams_team_id_fkey(team_name)
                    `
          )
          .eq('requester_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedRequests: PreviousRequest[] =
          data?.map((request: any) => ({
            id: request.id,
            created_at: request.created_at,
            fest_name: request.fests?.name || 'Unknown Fest',
            team_name: request.defined_org_teams?.team_name || 'Unknown Team',
            role_name: request.role_name,
            name: request.name,
            approved: request.approved,
            approved_at: request.approved_at,
            image: request.image,
          })) || [];

        setPreviousRequests(formattedRequests);
      } catch (error) {
        console.error('Error fetching previous requests:', error);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchPreviousRequests();
  }, [userId]);

  // Fetch fests on mount
  useEffect(() => {
    const fetchFests = async () => {
      const { data, error } = await supabase
        .from('fests')
        .select('id, name')
        .eq('year', 2026)
        .eq('is_active', true)
        .order('name');

      if (error) {
        toast.error('Failed to load fests');
        console.error(error);
      } else {
        setFests(data || []);
      }
    };

    fetchFests();
  }, []);

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from('defined_org_teams')
        .select('role, team_name')
        .order('team_name');

      if (error) {
        toast.error('Failed to load teams');
        console.error(error);
      } else {
        setTeams(data || []);
      }
    };

    fetchTeams();
  }, []);

  // Fetch event categories when fest is selected (always, not just for specific teams)
  useEffect(() => {
    if (formData.fest_id) {
      const fetchEventCategories = async () => {
        const { data, error } = await supabase
          .from('event_categories')
          .select('id, name')
          .eq('fest_id', formData.fest_id)
          .order('name');

        if (error) {
          toast.error('Failed to load event categories');
          console.error(error);
        } else {
          setEventCategories(data || []);
        }
      };

      fetchEventCategories();
    } else {
      setEventCategories([]);
      setFormData((prev) => ({ ...prev, event_category_id: '', event_id: '' }));
    }
  }, [formData.fest_id]);

  // Fetch events when event category is selected
  useEffect(() => {
    if (formData.event_category_id && requiresEventSelection) {
      const fetchEvents = async () => {
        const { data, error } = await supabase
          .from('events')
          .select('id, name')
          .eq('event_category_id', formData.event_category_id)
          .order('name');

        if (error) {
          toast.error('Failed to load events');
          console.error(error);
        } else {
          setEvents(data || []);
        }
      };

      fetchEvents();
    } else {
      setEvents([]);
      setFormData((prev) => ({ ...prev, event_id: '' }));
    }
  }, [formData.event_category_id, requiresEventSelection]);

  // Auto-set role name when event is selected (for coordinators/volunteers/convenors)
  useEffect(() => {
    if (formData.event_id && requiresEventSelection) {
      const selectedEvent = displayEvents.find(
        (e) => e.id === formData.event_id
      );
      if (selectedEvent) {
        setFormData((prev) => ({
          ...prev,
          role_name: selectedEvent.displayName,
        }));
      }
    }
  }, [formData.event_id, displayEvents, requiresEventSelection]);

  // Auto-set role name for regular teams (team name + member type)
  useEffect(() => {
    if (
      formData.team_id &&
      !requiresEventSelection &&
      formData.team_id !== 'category_convenors' &&
      formData.member_type
    ) {
      const selectedTeam = teams.find((t) => t.role === formData.team_id);
      if (selectedTeam) {
        const roleName = `${selectedTeam.team_name} ${formData.member_type}`;
        setFormData((prev) => ({
          ...prev,
          role_name: roleName,
        }));
      }
    }
  }, [formData.team_id, formData.member_type, teams, requiresEventSelection]);

  // Auto-set stream based on course
  useEffect(() => {
    if (formData.course && !['B.Tech', 'M.Tech'].includes(formData.course)) {
      setFormData((prev) => ({ ...prev, stream: prev.course }));
    }
  }, [formData.course]);

  // Fetch all team members for ownership claiming
  useEffect(() => {
    const fetchAllTeamMembers = async () => {
      setLoadingOwnership(true);
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

        const formattedMembers: AllTeamMember[] =
          data?.map((member: any) => ({
            ...member,
            team_name: member.defined_org_teams?.team_name || 'Unknown Team',
          })) || [];

        setAllTeamMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching all team members:', error);
      } finally {
        setLoadingOwnership(false);
      }
    };

    fetchAllTeamMembers();
  }, []);

  // Fetch ownership transfer requests (for super admins)
  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchOwnershipRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('org_teams_ownership_transfer')
          .select(
            `
            *,
            org_teams!org_teams_ownership_transfer_org_team_id_fkey(
              *,
              defined_org_teams!org_teams_team_id_fkey(team_name)
            )
          `
          )
          .is('approved_at', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedRequests: OwnershipTransferRequest[] =
          data?.map((req: any) => ({
            ...req,
            org_team: req.org_teams
              ? {
                  ...req.org_teams,
                  team_name:
                    req.org_teams.defined_org_teams?.team_name ||
                    'Unknown Team',
                }
              : undefined,
          })) || [];

        setOwnershipRequests(formattedRequests);
      } catch (error) {
        console.error('Error fetching ownership requests:', error);
      }
    };

    fetchOwnershipRequests();
  }, [isSuperAdmin]);

  // Fetch user's own ownership transfer requests AND requests for entries they own
  useEffect(() => {
    const fetchUserOwnRequests = async () => {
      try {
        // Fetch requests where user is the requester (new_owner_id)
        // These are outgoing requests - user can only view them, not approve/reject
        const { data: myRequests, error: myError } = await supabase
          .from('org_teams_ownership_transfer')
          .select(
            `
            *,
            org_teams!org_teams_ownership_transfer_org_team_id_fkey(
              *,
              defined_org_teams!org_teams_team_id_fkey(team_name)
            )
          `
          )
          .eq('new_owner_id', userId)
          .is('approved_at', null)
          .order('created_at', { ascending: false });

        if (myError) throw myError;

        // Fetch requests for entries the user owns (current_owner_id)
        // These are incoming requests - user can approve/reject ONLY when approved_at and approved_by are null
        const { data: incomingRequests, error: incomingError } = await supabase
          .from('org_teams_ownership_transfer')
          .select(
            `
            *,
            org_teams!org_teams_ownership_transfer_org_team_id_fkey(
              *,
              defined_org_teams!org_teams_team_id_fkey(team_name)
            ),
            users!org_teams_ownership_transfer_new_owner_id_fkey(
              name,
              email
            )
          `
          )
          .eq('current_owner_id', userId)
          .is('approved_at', null)
          .is('approved_by', null)
          .order('created_at', { ascending: false });

        if (incomingError) throw incomingError;

        // Combine both arrays
        // Only incoming requests (where current_owner_id = userId) can be approved/rejected
        // Outgoing requests (where new_owner_id = userId) are view-only
        const allRequests = [
          ...(myRequests?.map((req: any) => ({
            ...req,
            isMyRequest: true,
            canApprove: false, // User cannot approve their own requests
            org_team: req.org_teams
              ? {
                  ...req.org_teams,
                  team_name:
                    req.org_teams.defined_org_teams?.team_name ||
                    'Unknown Team',
                }
              : undefined,
          })) || []),
          ...(incomingRequests?.map((req: any) => ({
            ...req,
            isMyRequest: false,
            canApprove: true, // User can approve incoming requests
            requesterName: req.users?.name || 'Unknown User',
            requesterEmail: req.users?.email || '',
            org_team: req.org_teams
              ? {
                  ...req.org_teams,
                  team_name:
                    req.org_teams.defined_org_teams?.team_name ||
                    'Unknown Team',
                }
              : undefined,
          })) || []),
        ];

        // Sort by created_at descending
        allRequests.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setUserOwnRequests(allRequests as any);
      } catch (error) {
        console.error('Error fetching user own requests:', error);
      }
    };

    fetchUserOwnRequests();
  }, [userId]);

  // Handle ownership request
  const handleRequestOwnership = async (
    orgTeamId: string,
    currentOwnerId: string | null
  ) => {
    setRequestingOwnership(orgTeamId);
    try {
      const { error } = await supabase
        .from('org_teams_ownership_transfer')
        .insert({
          org_team_id: orgTeamId,
          current_owner_id: currentOwnerId,
          new_owner_id: userId,
        });

      if (error) throw error;

      // Refresh user's own requests
      const { data } = await supabase
        .from('org_teams_ownership_transfer')
        .select(
          `
          *,
          org_teams!org_teams_ownership_transfer_org_team_id_fkey(
            *,
            defined_org_teams!org_teams_team_id_fkey(team_name)
          )
        `
        )
        .eq('new_owner_id', userId)
        .is('approved_at', null)
        .order('created_at', { ascending: false });

      if (data) {
        const formattedRequests: OwnershipTransferRequest[] = data.map(
          (req: any) => ({
            ...req,
            org_team: req.org_teams
              ? {
                  ...req.org_teams,
                  team_name:
                    req.org_teams.defined_org_teams?.team_name ||
                    'Unknown Team',
                }
              : undefined,
          })
        );
        setUserOwnRequests(formattedRequests);
      }

      toast.success('Ownership request submitted successfully!');
    } catch (error: any) {
      console.error('Error requesting ownership:', error);
      if (error.code === '23505') {
        toast.error('You have already requested ownership for this entry');
      } else {
        toast.error('Failed to request ownership. Please try again.');
      }
    } finally {
      setRequestingOwnership(null);
    }
  };

  // Handle approve ownership transfer (super admin only)
  const handleApproveOwnership = async (
    transferId: string,
    orgTeamId: string,
    newOwnerId: string | null
  ) => {
    if (!isSuperAdmin) return;

    try {
      // Update org_teams table
      const { error: teamError } = await supabase
        .from('org_teams')
        .update({ requester_id: newOwnerId })
        .eq('id', orgTeamId);

      if (teamError) throw teamError;

      // Update ownership transfer table
      const { error: transferError } = await supabase
        .from('org_teams_ownership_transfer')
        .update({
          approved_at: new Date().toISOString(),
          approved_by: userId,
        })
        .eq('id', transferId)
        .eq('org_team_id', orgTeamId);

      if (transferError) throw transferError;

      // Remove from local state
      setOwnershipRequests((prev) =>
        prev.filter((req) => req.id !== transferId)
      );

      // Refresh all team members
      const { data } = await supabase
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

      if (data) {
        const formattedMembers: AllTeamMember[] = data.map((member: any) => ({
          ...member,
          team_name: member.defined_org_teams?.team_name || 'Unknown Team',
        }));
        setAllTeamMembers(formattedMembers);
      }

      toast.success('Ownership transfer approved!');
    } catch (error) {
      console.error('Error approving ownership:', error);
      toast.error('Failed to approve ownership transfer');
    }
  };

  // Handle reject ownership transfer (super admin only)
  const handleRejectOwnership = async (
    transferId: string,
    orgTeamId: string
  ) => {
    if (!isSuperAdmin) return;

    try {
      const { error } = await supabase
        .from('org_teams_ownership_transfer')
        .delete()
        .eq('id', transferId)
        .eq('org_team_id', orgTeamId);

      if (error) throw error;

      // Remove from local state
      setOwnershipRequests((prev) =>
        prev.filter((req) => req.id !== transferId)
      );

      toast.success('Ownership request rejected');
    } catch (error) {
      console.error('Error rejecting ownership:', error);
      toast.error('Failed to reject ownership request');
    }
  };

  // Handle user approve incoming ownership request (for entries they own)
  const handleUserApproveRequest = async (
    transferId: string,
    orgTeamId: string,
    newOwnerId: string | null
  ) => {
    setApprovingRequest(transferId);
    try {
      // Update org_teams table - transfer ownership
      const { error: teamError } = await supabase
        .from('org_teams')
        .update({ requester_id: newOwnerId })
        .eq('id', orgTeamId);

      if (teamError) throw teamError;

      // Update ownership transfer table
      const { error: transferError } = await supabase
        .from('org_teams_ownership_transfer')
        .update({
          approved_at: new Date().toISOString(),
          approved_by: userId,
        })
        .eq('id', transferId);

      if (transferError) throw transferError;

      // Refresh all team members to reflect ownership change
      const { data: teamMembersData } = await supabase
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

      if (teamMembersData) {
        const formattedMembers: AllTeamMember[] = teamMembersData.map(
          (member: any) => ({
            ...member,
            team_name: member.defined_org_teams?.team_name || 'Unknown Team',
          })
        );
        setAllTeamMembers(formattedMembers);
      }

      // Refetch previous requests to show updated ownership
      const { data: previousRequestsData, error: prevError } = await supabase
        .from('org_teams')
        .select(
          `
                    *,
                    fests!org_teams_fest_id_fkey(name),
                    defined_org_teams!org_teams_team_id_fkey(team_name)
                `
        )
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (!prevError && previousRequestsData) {
        const formattedPrevRequests: PreviousRequest[] =
          previousRequestsData.map((request: any) => ({
            id: request.id,
            created_at: request.created_at,
            fest_name: request.fests?.name || 'Unknown Fest',
            team_name: request.defined_org_teams?.team_name || 'Unknown Team',
            role_name: request.role_name,
            name: request.name,
            approved: request.approved,
            approved_at: request.approved_at,
            image: request.image,
          }));
        setPreviousRequests(formattedPrevRequests);
      }

      // Refetch user's own requests (both outgoing and incoming)
      const { data: myRequests } = await supabase
        .from('org_teams_ownership_transfer')
        .select(
          `
          *,
          org_teams!org_teams_ownership_transfer_org_team_id_fkey(
            *,
            defined_org_teams!org_teams_team_id_fkey(team_name)
          )
        `
        )
        .eq('new_owner_id', userId)
        .is('approved_at', null)
        .order('created_at', { ascending: false });

      const { data: incomingRequests } = await supabase
        .from('org_teams_ownership_transfer')
        .select(
          `
          *,
          org_teams!org_teams_ownership_transfer_org_team_id_fkey(
            *,
            defined_org_teams!org_teams_team_id_fkey(team_name)
          ),
          users!org_teams_ownership_transfer_new_owner_id_fkey(
            name,
            email
          )
        `
        )
        .eq('current_owner_id', userId)
        .is('approved_at', null)
        .is('approved_by', null)
        .order('created_at', { ascending: false });

      // Combine and update user requests
      const allRequests = [
        ...(myRequests?.map((req: any) => ({
          ...req,
          isMyRequest: true,
          canApprove: false,
          org_team: req.org_teams
            ? {
                ...req.org_teams,
                team_name:
                  req.org_teams.defined_org_teams?.team_name || 'Unknown Team',
              }
            : undefined,
        })) || []),
        ...(incomingRequests?.map((req: any) => ({
          ...req,
          isMyRequest: false,
          canApprove: true,
          requesterName: req.users?.name || 'Unknown User',
          requesterEmail: req.users?.email || '',
          org_team: req.org_teams
            ? {
                ...req.org_teams,
                team_name:
                  req.org_teams.defined_org_teams?.team_name || 'Unknown Team',
              }
            : undefined,
        })) || []),
      ];

      allRequests.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setUserOwnRequests(allRequests as any);

      toast.success('Ownership transferred successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve ownership request');
    } finally {
      setApprovingRequest(null);
    }
  };

  // Handle user reject incoming ownership request (for entries they own)
  const handleUserRejectRequest = async (transferId: string) => {
    setRejectingRequest(transferId);
    try {
      const { error } = await supabase
        .from('org_teams_ownership_transfer')
        .delete()
        .eq('id', transferId);

      if (error) throw error;

      // Remove from local state
      setUserOwnRequests((prev) =>
        prev.filter((req: any) => req.id !== transferId)
      );

      toast.success('Ownership request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject ownership request');
    } finally {
      setRejectingRequest(null);
    }
  };

  // Toggle team accordion
  const toggleTeam = (teamName: string) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamName)) {
        newSet.delete(teamName);
      } else {
        newSet.add(teamName);
      }
      return newSet;
    });
  };

  // Check if user has pending request for this org_team
  const hasPendingRequest = (orgTeamId: string) => {
    return userOwnRequests.some((req) => req.org_team_id === orgTeamId);
  };

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allTeamMembers;

    const query = searchQuery.toLowerCase();
    return allTeamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.role_name.toLowerCase().includes(query)
    );
  }, [allTeamMembers, searchQuery]);

  // Group filtered members by team
  const groupedMembers = useMemo(() => {
    return filteredMembers.reduce(
      (acc, member) => {
        const teamName = member.team_name || 'Unknown Team';
        if (!acc[teamName]) acc[teamName] = [];
        acc[teamName].push(member);
        return acc;
      },
      {} as Record<string, AllTeamMember[]>
    );
  }, [filteredMembers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image_file: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';

    if (!apiKey) {
      throw new Error('ImgBB API key not configured');
    }

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error('Image upload failed');
    }

    return data.data.url;
  };

  const getNextSequence = async (): Promise<number> => {
    const { data, error } = await supabase
      .from('org_teams')
      .select('sequence')
      .eq('fest_id', formData.fest_id)
      .eq('team_id', formData.team_id)
      .order('sequence', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching sequence:', error);
      return 1;
    }

    if (!data || data.length === 0) {
      return 1;
    }

    return (data[0].sequence || 0) + 1;
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.fest_id) {
        toast.error('Please select a fest');
        return;
      }
      if (!formData.team_id) {
        toast.error('Please select a team');
        return;
      }
    }

    if (step === 2) {
      if (requiresCategorySelection && !formData.event_category_id) {
        toast.error('Please select an event category');
        return;
      }

      if (requiresEventSelection && !formData.event_id) {
        toast.error('Please select an event');
        return;
      }

      if (
        !formData.name ||
        !formData.phone ||
        !formData.role_name ||
        !formData.college_roll ||
        !formData.course ||
        !formData.gender
      ) {
        toast.error('Please fill all required fields');
        return;
      }

      if (['B.Tech', 'M.Tech'].includes(formData.course) && !formData.stream) {
        toast.error('Please select a stream');
        return;
      }
    }

    if (step === 3 && !formData.image_file) {
      toast.error('Please upload a photo');
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploading(true);

    try {
      // Upload image
      if (!formData.image_file) {
        throw new Error('No image file selected');
      }

      const imageUrl = await uploadToImgBB(formData.image_file);
      setUploading(false);

      // Get next sequence number
      const sequence = await getNextSequence();

      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          college_roll: formData.college_roll,
          college: 'RCCIIT',
          stream: formData.stream,
          course: formData.course,
          phone: formData.phone,
          gender: formData.gender,
        })
        .eq('id', userId);

      if (userError) throw userError;

      // Insert into org_teams table
      const { error: teamError } = await supabase.from('org_teams').insert({
        fest_id: formData.fest_id,
        name: formData.name,
        image: imageUrl,
        approved: false,
        team_id: formData.team_id,
        role_name: formData.role_name,
        sequence: sequence,
        requester_id: userId,
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString(),
      });

      if (teamError) throw teamError;

      toast.success('Team member data submitted successfully!');

      // Refresh previous requests
      const { data: updatedData, error: fetchError } = await supabase
        .from('org_teams')
        .select(
          `
                    *,
                    fests!org_teams_fest_id_fkey(name),
                    defined_org_teams!org_teams_team_id_fkey(team_name)
                `
        )
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (!fetchError && updatedData) {
        const formattedRequests: PreviousRequest[] = updatedData.map(
          (request: any) => ({
            id: request.id,
            created_at: request.created_at,
            fest_name: request.fests?.name || 'Unknown Fest',
            team_name: request.defined_org_teams?.team_name || 'Unknown Team',
            role_name: request.role_name,
            name: request.name,
            approved: request.approved,
            approved_at: request.approved_at,
            image: request.image,
          })
        );
        setPreviousRequests(formattedRequests);
      }

      // Reset form
      setFormData({
        fest_id: '',
        event_category_id: '',
        event_id: '',
        team_id: '',
        name: '',
        phone: '',
        role_name: '',
        member_type: '',
        college_roll: '',
        course: '',
        stream: '',
        gender: '',
        image_file: null,
        image_url: '',
      });
      setImagePreview('');
      setStep(1);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Extract image delete hash from ImgBB URL
  const extractDeleteHash = (url: string): string | null => {
    try {
      // ImgBB URL format: https://i.ibb.co/xxxxx/filename.ext
      const match = url.match(/\/([a-zA-Z0-9]+)\//);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  // Delete image from ImgBB
  const deleteFromImgBB = async (imageUrl: string): Promise<boolean> => {
    try {
      const deleteHash = extractDeleteHash(imageUrl);
      if (!deleteHash) {
        console.warn('Could not extract delete hash from URL');
        return false;
      }

      // Note: ImgBB requires authentication for deletion
      // This is a best-effort attempt - if it fails, we'll still proceed
      const response = await fetch(
        `https://api.imgbb.com/1/image/${deleteHash}`,
        {
          method: 'DELETE',
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting image from ImgBB:', error);
      return false;
    }
  };

  // Handle edit button click
  const handleEditRequest = (request: PreviousRequest) => {
    setEditingRequest(request);
    setEditName(request.name);
    setEditImagePreview(request.image);
    setEditImageFile(null);
    setEditDialogOpen(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingRequest(null);
    setEditName('');
    setEditImageFile(null);
    setEditImagePreview('');
  };

  // Handle edit image change
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingRequest) return;

    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSavingEdit(true);
    try {
      let newImageUrl = editingRequest.image;

      // If user selected a new image, upload it
      if (editImageFile) {
        // Upload new image first
        newImageUrl = await uploadToImgBB(editImageFile);
      }

      // Update the org_teams table
      const { error: teamError } = await supabase
        .from('org_teams')
        .update({
          name: editName,
          image: newImageUrl,
        })
        .eq('id', editingRequest.id);

      if (teamError) throw teamError;

      // Also update the users table with the new name
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: editName,
        })
        .eq('id', userId);

      if (userError) throw userError;

      // Update local state
      setPreviousRequests((prev) =>
        prev.map((req) =>
          req.id === editingRequest.id
            ? { ...req, name: editName, image: newImageUrl }
            : req
        )
      );

      toast.success('Request updated successfully!');
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin CTA - Remove Team Member */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Super Admin Tools
              </h3>
              <p className="text-zinc-400 text-sm">
                Manage team members with administrative privileges
              </p>
            </div>
            <Button
              onClick={() => router.push('/remove-team-member')}
              className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Team Member
            </Button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-white/10 rounded-2xl p-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s <= step
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                      : 'bg-white/10 text-zinc-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      s < step
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
                        : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 && 'Select Fest & Team'}
              {step === 2 && 'Member Details'}
              {step === 3 && 'Upload Photo'}
              {step === 4 && 'Preview & Submit'}
            </h2>
            <p className="text-zinc-400">Step {step} of 4</p>
          </div>
        </div>

        {/* Step 1: Select Fest & Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="fest" className="text-white mb-2 block">
                Select Fest *
              </Label>
              <Select
                value={formData.fest_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    fest_id: value,
                    event_category_id: '',
                    event_id: '',
                  }))
                }
              >
                <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                  <SelectValue placeholder="Choose a fest" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0f] border-white/10">
                  {fests.map((fest) => (
                    <SelectItem
                      key={fest.id}
                      value={fest.id}
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      {fest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.fest_id && (
              <div>
                <Label htmlFor="team" className="text-white mb-2 block">
                  Select Team *
                </Label>
                <Select
                  value={formData.team_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      team_id: value,
                      event_category_id: '',
                      event_id: '',
                      role_name: '',
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-white/10">
                    {teams.map((team) => (
                      <SelectItem
                        key={team.role}
                        value={team.role}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        {team.team_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Member Details */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Event Category Selection - Conditionally rendered */}
            {requiresCategorySelection && (
              <div>
                <Label
                  htmlFor="event_category"
                  className="text-white mb-2 block"
                >
                  Select Event Category *
                </Label>
                <Select
                  value={formData.event_category_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      event_category_id: value,
                      event_id: '',
                      // For category convenors, auto-set role name when category changes
                      role_name:
                        formData.team_id === 'category_convenors'
                          ? `${
                              eventCategories.find((c) => c.id === value)
                                ?.name || ''
                            } Convenor`
                          : '',
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                    <SelectValue placeholder="Choose an event category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-white/10">
                    {eventCategories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {requiresEventSelection && formData.event_category_id && (
              <div>
                <Label htmlFor="event" className="text-white mb-2 block">
                  Select Event *
                </Label>
                <Select
                  value={formData.event_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, event_id: value }))
                  }
                >
                  <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-white/10">
                    {displayEvents.map((event) => (
                      <SelectItem
                        key={event.id}
                        value={event.id}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        {event.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Member Type - Only for non-coordinator/volunteer/convenor/category_convenor teams */}
            {formData.team_id &&
              !requiresEventSelection &&
              formData.team_id !== 'category_convenors' && (
                <div>
                  <Label
                    htmlFor="member_type"
                    className="text-white mb-2 block"
                  >
                    Member Type *
                  </Label>
                  <Select
                    value={formData.member_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        member_type: value as 'Team Member' | 'Lead',
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                      <SelectValue placeholder="Choose member type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-white/10">
                      <SelectItem
                        value="Team Member"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        Team Member
                      </SelectItem>
                      <SelectItem
                        value="Lead"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        Lead
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

            {formData.team_id && (
              <>
                <div>
                  <Label htmlFor="name" className="text-white mb-2 block">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2 block">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="role_name" className="text-white mb-2 block">
                    Role Name *
                  </Label>
                  <Input
                    id="role_name"
                    value={formData.role_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role_name: e.target.value,
                      }))
                    }
                    disabled={isRoleNameDisabled}
                    className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter role (e.g., Captain, Member)"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="college_roll"
                    className="text-white mb-2 block"
                  >
                    College Roll *
                  </Label>
                  <Input
                    id="college_roll"
                    value={formData.college_roll}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        college_roll: e.target.value,
                      }))
                    }
                    className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500"
                    placeholder="Enter college roll number"
                  />
                </div>

                <div>
                  <Label htmlFor="course" className="text-white mb-2 block">
                    Course *
                  </Label>
                  <Select
                    value={formData.course}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        course: value,
                        stream: '',
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-white/10">
                      <SelectItem
                        value="B.Tech"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        B.Tech
                      </SelectItem>
                      <SelectItem
                        value="BCA"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        BCA
                      </SelectItem>
                      <SelectItem
                        value="MCA"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        MCA
                      </SelectItem>
                      <SelectItem
                        value="M.Tech"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        M.Tech
                      </SelectItem>
                      <SelectItem
                        value="B.Sc."
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        B.Sc.
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {['B.Tech', 'M.Tech'].includes(formData.course) && (
                  <div>
                    <Label htmlFor="stream" className="text-white mb-2 block">
                      Stream *
                    </Label>
                    <Select
                      value={formData.stream}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, stream: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                        <SelectValue placeholder="Choose a stream" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-white/10">
                        <SelectItem
                          value="CSE"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          CSE
                        </SelectItem>
                        <SelectItem
                          value="IT"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          IT
                        </SelectItem>
                        <SelectItem
                          value="ECE"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          ECE
                        </SelectItem>
                        <SelectItem
                          value="EE"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          EE
                        </SelectItem>
                        <SelectItem
                          value="CSE-AIML"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          CSE-AIML
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="gender" className="text-white mb-2 block">
                    Gender *
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: value as 'male' | 'female',
                      }))
                    }
                  >
                    <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                      <SelectValue placeholder="Choose gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-white/10">
                      <SelectItem
                        value="male"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        MALE
                      </SelectItem>
                      <SelectItem
                        value="female"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        FEMALE
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Upload Photo */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="photo" className="text-white mb-2 block">
                Upload Photo *
              </Label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-violet-500/50 transition-all">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {imagePreview ? (
                    <div className="relative w-48 h-48 mb-4">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <Upload className="w-16 h-16 text-violet-400 mb-4" />
                  )}
                  <p className="text-white font-medium mb-2">
                    {imagePreview ? 'Change Photo' : 'Click to upload photo'}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Eye className="mr-2" />
                Preview Details
              </h3>

              {imagePreview && (
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <Image
                      src={imagePreview}
                      alt="Member photo"
                      fill
                      className="object-cover rounded-full border-4 border-violet-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-zinc-400 text-sm">Fest</p>
                  <p className="text-white font-medium">
                    {fests.find((f) => f.id === formData.fest_id)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Team</p>
                  <p className="text-white font-medium">
                    {teams.find((t) => t.role === formData.team_id)?.team_name}
                  </p>
                </div>
                {requiresEventSelection && formData.event_id && (
                  <>
                    <div>
                      <p className="text-zinc-400 text-sm">Event Category</p>
                      <p className="text-white font-medium">
                        {
                          eventCategories.find(
                            (c) => c.id === formData.event_category_id
                          )?.name
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Event</p>
                      <p className="text-white font-medium">
                        {
                          displayEvents.find((e) => e.id === formData.event_id)
                            ?.displayName
                        }
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-zinc-400 text-sm">Name</p>
                  <p className="text-white font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Phone</p>
                  <p className="text-white font-medium">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Role</p>
                  <p className="text-white font-medium">{formData.role_name}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">College Roll</p>
                  <p className="text-white font-medium">
                    {formData.college_roll}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Course</p>
                  <p className="text-white font-medium">{formData.course}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Stream</p>
                  <p className="text-white font-medium">{formData.stream}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Gender</p>
                  <p className="text-white font-medium">
                    {formData.gender.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">College</p>
                  <p className="text-white font-medium">RCCIIT</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && (!formData.fest_id || !formData.team_id)}
              className="ml-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-green-500 border-0"
            >
              {uploading
                ? 'Uploading Image...'
                : loading
                  ? 'Submitting...'
                  : 'Submit'}
            </Button>
          )}
        </div>
      </div>

      {/* Ownership Transfer/Claiming Section */}
      {/* <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-white/10 rounded-2xl p-6">
        <button
          onClick={() => setShowOwnershipSection(!showOwnershipSection)}
          className="w-full flex items-center justify-between text-white hover:text-indigo-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="text-xl font-bold">Claim Ownership</h3>
            <span className="bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full text-xs font-medium">
              {allTeamMembers.length} members
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${showOwnershipSection ? 'rotate-180' : ''}`}
          />
        </button>

        {showOwnershipSection && (
          <div className="mt-6 space-y-6">
            {loadingOwnership ? (
              <div className="text-center py-8 text-zinc-400">
                Loading team members...
              </div>
            ) : (
              <>
                {isSuperAdmin && ownershipRequests.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-600/10 border border-amber-600/30 rounded-xl">
                    <h4 className="text-amber-300 font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending Ownership Requests ({ownershipRequests.length})
                    </h4>
                    <div className="space-y-3">
                      {ownershipRequests.map((request) => (
                        <div
                          key={request.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {request.org_team?.image && (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={request.org_team.image}
                                  alt={request.org_team.role_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {request.org_team?.role_name}
                              </p>
                              <p className="text-zinc-400 text-xs">
                                {request.org_team?.team_name} •{' '}
                                {request.org_team?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApproveOwnership(
                                  request.id,
                                  request.org_team_id,
                                  request.new_owner_id
                                )
                              }
                              className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRejectOwnership(
                                  request.id,
                                  request.org_team_id
                                )
                              }
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 px-3"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-indigo-500/50"
                  />
                </div>
                {searchQuery && (
                  <div className="text-sm text-zinc-400">
                    Found {filteredMembers.length} member
                    {filteredMembers.length !== 1 ? 's' : ''}
                  </div>
                )}

                {Object.entries(groupedMembers).length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    {searchQuery
                      ? 'No members found matching your search'
                      : 'No team members available'}
                  </div>
                ) : (
                  Object.entries(groupedMembers).map(([teamName, members]) => {
                    const isExpanded = expandedTeams.has(teamName);

                    return (
                      <div
                        key={teamName}
                        className="border border-white/10 rounded-xl overflow-hidden bg-white/5"
                      >
                        <button
                          onClick={() => toggleTeam(teamName)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                            <h4 className="text-indigo-300 font-semibold text-base sm:text-lg">
                              {teamName}
                            </h4>
                            <span className="bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              {members.length}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-indigo-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-white/10">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
                              {members.map((member) => {
                                const isOwnedByUser =
                                  member.requester_id === userId;
                                const isRequesting =
                                  requestingOwnership === member.id;

                                return (
                                  <div
                                    key={member.id}
                                    className={`bg-white/5 border rounded-xl p-3 transition-all ${isOwnedByUser
                                        ? 'border-emerald-500/50 bg-emerald-500/5'
                                        : 'border-white/10 hover:bg-white/10'
                                      }`}
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
                                      {isOwnedByUser ? (
                                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          You own this
                                        </div>
                                      ) : hasPendingRequest(member.id) ? (
                                        <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                                          <Clock className="w-3.5 h-3.5" />
                                          Request Pending
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleRequestOwnership(
                                              member.id,
                                              member.requester_id
                                            )
                                          }
                                          disabled={isRequesting}
                                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-7 text-xs"
                                        >
                                          {isRequesting ? (
                                            'Requesting...'
                                          ) : (
                                            <>
                                              <UserPlus className="w-3 h-3 mr-1" />
                                              Request Ownership
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        )}
      </div> */}

      {/* My Ownership Requests Section */}
      {userOwnRequests.length > 0 && (
        <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border border-white/10 rounded-2xl p-6">
          <button
            onClick={() => setShowMyRequestsSection(!showMyRequestsSection)}
            className="w-full flex items-center justify-between text-white hover:text-amber-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h3 className="text-xl font-bold">My Ownership Requests</h3>
              <span className="bg-amber-600/30 text-amber-300 px-2 py-1 rounded-full text-xs font-medium">
                {userOwnRequests.length}
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${showMyRequestsSection ? 'rotate-180' : ''}`}
            />
          </button>

          {showMyRequestsSection && (
            <div className="mt-6 space-y-3">
              {userOwnRequests.map((request: any) => (
                <div
                  key={request.id}
                  className={`bg-white/5 border rounded-xl p-4 transition-all ${
                    request.isMyRequest
                      ? 'border-amber-500/30 hover:bg-white/10'
                      : 'border-emerald-500/30 hover:bg-emerald-500/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {request.org_team?.image && (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={request.org_team.image}
                          alt={request.org_team.role_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-base sm:text-lg truncate">
                            {request.org_team?.role_name}
                          </h4>
                          <p className="text-zinc-300 text-sm mt-1">
                            {request.org_team?.name}
                          </p>
                        </div>
                        {request.canApprove && !request.isMyRequest && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUserApproveRequest(
                                  request.id,
                                  request.org_team_id,
                                  request.new_owner_id
                                )
                              }
                              disabled={
                                approvingRequest === request.id ||
                                rejectingRequest === request.id
                              }
                              className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3 disabled:opacity-50"
                            >
                              {approvingRequest === request.id ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin sm:mr-1" />
                                  <span className="hidden sm:inline">
                                    Accepting...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">
                                    Accept
                                  </span>
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUserRejectRequest(request.id)
                              }
                              disabled={
                                approvingRequest === request.id ||
                                rejectingRequest === request.id
                              }
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 px-3 disabled:opacity-50"
                            >
                              {rejectingRequest === request.id ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin sm:mr-1" />
                                  <span className="hidden sm:inline">
                                    Rejecting...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">
                                    Reject
                                  </span>
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {request.org_team?.team_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {!request.isMyRequest && request.requesterName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              From: {request.requesterName}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="mt-3">
                        {request.isMyRequest ? (
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Waiting for owner approval
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <UserPlus className="w-3.5 h-3.5" />
                            Incoming ownership request
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Previous Requests Section */}
      {previousRequests.length > 0 && (
        <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-white/10 rounded-2xl p-6">
          <button
            onClick={() => setShowPreviousRequests(!showPreviousRequests)}
            className="w-full flex items-center justify-between text-white hover:text-violet-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              <h3 className="text-xl font-bold">Previous Requests</h3>
              <span className="bg-violet-600/30 text-violet-300 px-2 py-1 rounded-full text-xs font-medium">
                {previousRequests.length}
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${showPreviousRequests ? 'rotate-180' : ''}`}
            />
          </button>

          {showPreviousRequests && (
            <div className="mt-6 space-y-4">
              {loadingRequests ? (
                <div className="text-center py-8 text-zinc-400">
                  Loading previous requests...
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {previousRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        {/* Image */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={request.image}
                            alt={request.role_name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold text-base sm:text-lg truncate">
                                {request.role_name}
                              </h4>
                              <p className="text-zinc-300 text-sm mt-1">
                                {request.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {request.approved ? (
                                <div className="flex items-center gap-1 bg-emerald-600/20 text-emerald-400 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approved
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-amber-600/20 text-amber-400 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditRequest(request)}
                                className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50 h-7 sm:h-8 px-2 sm:px-3"
                              >
                                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm">
                            <div>
                              <span className="text-zinc-400">Fest: </span>
                              <span className="text-zinc-300">
                                {request.fest_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Team: </span>
                              <span className="text-zinc-300">
                                {request.team_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Submitted: </span>
                              <span className="text-zinc-300">
                                {new Date(
                                  request.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {request.approved && request.approved_at && (
                              <div>
                                <span className="text-zinc-400">
                                  Approved:{' '}
                                </span>
                                <span className="text-zinc-300">
                                  {new Date(
                                    request.approved_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Request Modal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0a0a0f] border-white/10 text-white max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Edit Request
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update your name and photo for this team entry request
            </DialogDescription>
          </DialogHeader>

          {editingRequest && (
            <div className="space-y-4 sm:space-y-6 mt-4">
              {/* Role Name (Read-only) */}
              <div>
                <Label className="text-white mb-2 block text-sm">Role</Label>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-zinc-300">
                  {editingRequest.role_name}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <Label
                  htmlFor="edit-name"
                  className="text-white mb-2 block text-sm"
                >
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Enter your name"
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label className="text-white mb-2 block text-sm">Photo *</Label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-4 sm:p-6 text-center hover:border-violet-500/50 transition-all">
                  <input
                    type="file"
                    id="edit-photo"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-photo"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {editImagePreview ? (
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-3 sm:mb-4">
                        <Image
                          src={editImagePreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-violet-400 mb-3 sm:mb-4" />
                    )}
                    <p className="text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                      {editImagePreview
                        ? 'Change Photo'
                        : 'Click to upload photo'}
                    </p>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 border-0"
                >
                  {savingEdit ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={savingEdit}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamEntryForm;
