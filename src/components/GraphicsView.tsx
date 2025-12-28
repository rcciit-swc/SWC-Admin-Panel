'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Search, Users, Copy, Check, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { toast } from 'sonner';

interface TeamMember {
    id: string;
    name: string;
    role_name: string;
    image: string;
    team_id: string;
    team_name: string;
}

interface GroupedMember {
    name: string;
    image: string;
    roles: string[];
}

interface Fest {
    id: string;
    name: string;
    year: number;
}

interface GraphicsViewProps {
    festId?: string;
    isSuperAdmin: boolean;
}

export default function GraphicsView({ festId: initialFestId, isSuperAdmin }: GraphicsViewProps) {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedImage, setCopiedImage] = useState<string | null>(null);
    const [fests, setFests] = useState<Fest[]>([]);
    const [selectedFestId, setSelectedFestId] = useState<string | undefined>(initialFestId);
    const [loadingFests, setLoadingFests] = useState(isSuperAdmin);

    // Copy image URL to clipboard
    const handleCopyImage = async (imageUrl: string, memberName: string) => {
        try {
            await navigator.clipboard.writeText(imageUrl);
            setCopiedImage(imageUrl);
            toast.success(`Copied ${memberName}'s photo!`);

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopiedImage(null);
            }, 2000);
        } catch (error) {
            toast.error('Failed to copy image URL');
            console.error('Error copying to clipboard:', error);
        }
    };

    // Format role name based on team_id
    const formatRoleName = (roleName: string, teamId: string): string => {
        // For specific team IDs, show formatted team name followed by role_name
        switch (teamId.toLowerCase()) {
            case 'coordinators':
                return `Coordinator - ${roleName}`;
            case 'volunteers':
                return `Volunteer - ${roleName}`;
            case 'convenors':
                return `Convenor - ${roleName}`;
            default:
                return roleName; // Return original role_name for other teams
        }
    };

    // Fetch fests for super admin
    useEffect(() => {
        const fetchFests = async () => {
            if (!isSuperAdmin) {
                setLoadingFests(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('fests')
                    .select('id, name, year')
                    .eq('year', 2026)
                    .order('name');

                if (error) throw error;

                setFests(data || []);
            } catch (error) {
                console.error('Error fetching fests:', error);
                toast.error('Failed to load fests');
            } finally {
                setLoadingFests(false);
            }
        };

        fetchFests();
    }, [isSuperAdmin]);

    // Fetch team members
    useEffect(() => {
        const fetchMembers = async () => {
            if (!selectedFestId) {
                setMembers([]);
                setLoading(false);
                return;
            }

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
                    .eq('fest_id', selectedFestId)
                    .eq('approved', true)
                    .order('name');

                if (error) throw error;

                const formattedMembers: TeamMember[] =
                    data?.map((member: any) => ({
                        id: member.id,
                        name: member.name,
                        role_name: member.role_name,
                        image: member.image,
                        team_id: member.team_id,
                        team_name: member.defined_org_teams?.team_name || 'Unknown Team',
                    })) || [];

                setMembers(formattedMembers);
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [selectedFestId]);

    // Group members by name and aggregate roles
    const groupedMembers = useMemo(() => {
        const grouped = new Map<string, GroupedMember>();

        members.forEach((member) => {
            const key = member.name.toLowerCase().trim();
            const formattedRole = formatRoleName(member.role_name, member.team_id);

            if (grouped.has(key)) {
                const existing = grouped.get(key)!;
                // Add role if not already present
                if (!existing.roles.includes(formattedRole)) {
                    existing.roles.push(formattedRole);
                }
            } else {
                grouped.set(key, {
                    name: member.name,
                    image: member.image,
                    roles: [formattedRole],
                });
            }
        });

        return Array.from(grouped.values());
    }, [members]);

    // Filter members based on search query
    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) {
            return groupedMembers;
        }

        const query = searchQuery.toLowerCase();
        return groupedMembers.filter(
            (member) =>
                member.name.toLowerCase().includes(query) ||
                member.roles.some((role) => role.toLowerCase().includes(query))
        );
    }, [groupedMembers, searchQuery]);

    // Show fest selector for super admin if no fest selected
    if (isSuperAdmin && !selectedFestId) {
        if (loadingFests) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-zinc-400">Loading fests...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-white/10 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-8 h-8 text-indigo-400" />
                            <h1 className="text-3xl font-bold text-white">
                                Select a Fest
                            </h1>
                        </div>
                        <p className="text-zinc-400">
                            Choose which fest's team members you want to view
                        </p>
                    </div>

                    {/* Fest Selector */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                            Fest
                        </label>
                        <Select onValueChange={setSelectedFestId}>
                            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-12">
                                <SelectValue placeholder="Select a fest" />
                            </SelectTrigger>
                            <SelectContent>
                                {fests.map((fest) => (
                                    <SelectItem key={fest.id} value={fest.id}>
                                        {fest.name} {fest.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {fests.length === 0 && (
                            <p className="text-zinc-400 text-sm mt-3">
                                No fests available. Please create a fest first.
                            </p>
                        )}
                    </div>
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-3xl font-bold text-white">
                            Team Members - Graphics View
                        </h1>
                    </div>
                    <p className="text-zinc-400">
                        View all team members and their roles for graphics design purposes
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <Input
                            type="text"
                            placeholder="Search by name or role..."
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

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-zinc-400 text-sm mb-1">Total Unique Members</p>
                        <p className="text-2xl font-bold text-white">
                            {groupedMembers.length}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-zinc-400 text-sm mb-1">Total Role Assignments</p>
                        <p className="text-2xl font-bold text-white">{members.length}</p>
                    </div>
                </div>

                {/* Table */}
                {filteredMembers.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                        <p className="text-zinc-400 text-lg">
                            {searchQuery
                                ? 'No members found matching your search'
                                : 'No team members available'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="text-left p-4 text-zinc-400 font-medium text-sm">
                                            Image
                                        </th>
                                        <th className="text-left p-4 text-zinc-400 font-medium text-sm">
                                            Name
                                        </th>
                                        <th className="text-left p-4 text-zinc-400 font-medium text-sm">
                                            Roles
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white/10">
                                                        <Image
                                                            src={member.image}
                                                            alt={member.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            handleCopyImage(member.image, member.name)
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                                                    >
                                                        {copiedImage === member.image ? (
                                                            <>
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4 mr-1" />
                                                                Copy Photo
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-white font-medium">{member.name}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {member.roles.map((role, roleIndex) => (
                                                        <span
                                                            key={roleIndex}
                                                            className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-white/5">
                            {filteredMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/10">
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium mb-2">
                                                {member.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {member.roles.map((role, roleIndex) => (
                                                    <span
                                                        key={roleIndex}
                                                        className="bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full text-xs font-medium"
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleCopyImage(member.image, member.name)}
                                        size="sm"
                                        variant="outline"
                                        className="w-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                                    >
                                        {copiedImage === member.image ? (
                                            <>
                                                <Check className="w-4 h-4 mr-1" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-1" />
                                                Copy Photo
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
``;
