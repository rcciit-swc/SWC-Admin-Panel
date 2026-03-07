'use client';

import {
    getCommunityLeaderboard,
    getEventRegistrations,
} from '@/lib/actions/communities';
import { CommunityStats, RegistrationDetail } from '@/lib/types/communities';
import { getUserData } from '@/utils/functions';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    ChevronDown,
    ChevronUp,
    Crown,
    Eye,
    Loader2,
    Medal,
    Search,
    Ticket,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function CommunitiesStatsPage() {
    const [leaderboard, setLeaderboard] = useState<CommunityStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCode, setExpandedCode] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Registration details modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [data, userData] = await Promise.all([
            getCommunityLeaderboard(),
            getUserData(),
        ]);
        setLeaderboard(data);
        // @ts-ignore - Assuming userData.data.email exists based on project structure
        setUserEmail(userData?.data?.email || null);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewRegistrations = async (
        referralCode: string,
        eventId: string,
        eventName: string
    ) => {
        setModalOpen(true);
        setModalLoading(true);
        setModalTitle(eventName);
        const data = await getEventRegistrations(referralCode, eventId);
        setRegistrations(data);
        setModalLoading(false);
    };

    const isUserCommunity = (community: CommunityStats) =>
        userEmail &&
        community.community_email &&
        community.community_email.toLowerCase() === userEmail.toLowerCase();

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-300 fill-gray-300" />;
            case 3:
                return <Award className="w-6 h-6 text-amber-600 fill-amber-600" />;
            default:
                return (
                    <span
                        className="text-base font-bold text-white/40 w-6 text-center"
                        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                    >
                        {rank}
                    </span>
                );
        }
    };

    const getRankBorder = (rank: number, isYou: boolean) => {
        if (isYou)
            return 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]';
        switch (rank) {
            case 1:
                return 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]';
            case 2:
                return 'border-gray-400/30';
            case 3:
                return 'border-amber-700/30';
            default:
                return 'border-white/10';
        }
    };

    if (loading) {
        return (
            <div
                className="min-h-screen w-full flex items-center justify-center bg-black"
            >
                <div className="absolute inset-0 bg-black/70" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                    <p
                        className="text-white/60 text-sm tracking-widest uppercase font-bold"
                    >
                        Loading Leaderboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full relative overflow-x-hidden bg-black"
        >
            <div className="absolute inset-0 bg-black/70" />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at 50% 30%, rgba(250, 204, 21, 0.08) 0%, transparent 60%)',
                }}
            />

            <div className="relative z-10 container mx-auto px-4 pt-10 pb-24">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <div className="absolute top-0 right-0 hidden md:block">
                        <Link href="/community-partners">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all uppercase tracking-wider">
                                <Users className="w-4 h-4" />
                                Invite Community Partner
                            </button>
                        </Link>
                    </div>
                    <h1
                        className="text-4xl md:text-6xl font-bold mb-3 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 py-2"
                        style={{
                            textShadow: '0 0 30px rgba(239,68,68,0.6)',
                            fontFamily: 'inherit',
                        }}
                    >
                        COMMUNITY LEADERBOARD
                    </h1>
                    <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-80" />
                    <p
                        className="mt-4 text-white/50 text-sm tracking-wide max-w-md mx-auto font-medium"
                    >
                        Community partner referral performance at a glance.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
                    <SummaryCard
                        icon={<Trophy className="w-5 h-5 text-yellow-400" />}
                        value={leaderboard.length}
                        label="Communities"
                    />
                    <SummaryCard
                        icon={<Ticket className="w-5 h-5 text-red-400" />}
                        value={leaderboard.reduce((s, c) => s + Number(c.total_registrations), 0)}
                        label="Total Registrations"
                    />
                    <SummaryCard
                        icon={<Users className="w-5 h-5 text-green-400" />}
                        value={leaderboard.reduce((s, c) => s + Number(c.total_signups), 0)}
                        label="Total Sign-ups"
                        className="col-span-2 md:col-span-1"
                    />
                </div>

                {/* Leaderboard */}
                <div className="max-w-4xl mx-auto space-y-3">
                    {leaderboard.map((community, index) => {
                        const rank = index + 1;
                        const isExpanded = expandedCode === community.referral_code;
                        const isYou = !!isUserCommunity(community);

                        return (
                            <motion.div
                                key={community.referral_code}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                                {/* Main Row */}
                                <div
                                    onClick={() => {
                                        setExpandedCode(isExpanded ? null : community.referral_code);
                                    }}
                                    className={`w-full flex items-center gap-3 md:gap-5 p-4 md:p-5 rounded-xl border backdrop-blur-sm transition-all duration-200 text-left ${getRankBorder(rank, isYou)} ${isExpanded
                                        ? 'bg-white/[0.06] rounded-b-none'
                                        : 'bg-white/[0.02]'
                                        } cursor-pointer hover:bg-white/[0.04] ${isYou ? 'ring-1 ring-emerald-500/30' : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                                        {getRankIcon(rank)}
                                    </div>

                                    {/* Community Logo + Name */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 bg-black/40">
                                            {community.community_image ? (
                                                <Image
                                                    src={community.community_image}
                                                    alt={community.community_name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-yellow-400 font-bold text-sm">
                                                    {community.community_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className="text-white font-semibold text-sm md:text-base truncate"
                                                >
                                                    {community.community_name}
                                                </p>
                                                {isYou && (
                                                    <span className="flex-shrink-0 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className="text-white/30 text-[10px] truncate font-mono"
                                            >
                                                {community.referral_code}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                                        <div className="text-center">
                                            <p
                                                className="text-white font-bold text-xl md:text-2xl"
                                            >
                                                {community.total_registrations}
                                            </p>
                                            <p
                                                className="text-white/30 text-[9px] uppercase tracking-wider font-bold"
                                            >
                                                <span className="hidden md:inline">Registrations</span>
                                                <span className="md:hidden">Regs</span>
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p
                                                className="text-white/70 font-bold text-xl md:text-2xl"
                                            >
                                                {community.total_signups}
                                            </p>
                                            <p
                                                className="text-white/30 text-[9px] uppercase tracking-wider font-bold"
                                            >
                                                <span className="hidden md:inline">Sign-ups</span>
                                                <span className="md:hidden">Users</span>
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 text-white/30">
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div
                                                className={`border border-t-0 rounded-b-xl p-4 md:p-5 bg-white/[0.03] backdrop-blur-sm ${getRankBorder(rank, isYou)} border-t-transparent`}
                                            >
                                                {community.event_breakdown.length > 0 ? (
                                                    <div className="space-y-4">
                                                        <p
                                                            className="text-white/50 text-xs uppercase tracking-widest mb-3 font-semibold"
                                                        >
                                                            Event-wise Breakdown
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {community.event_breakdown.map((event) => (
                                                                <div
                                                                    key={event.event_id}
                                                                    className="flex items-center justify-between bg-white/[0.04] rounded-lg px-4 py-3 border border-white/5"
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <span
                                                                            className="text-white/80 text-sm truncate block font-semibold"
                                                                        >
                                                                            {event.event_name}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                                        <span
                                                                            className="text-yellow-400 font-bold text-sm"
                                                                        >
                                                                            {event.registration_count}
                                                                        </span>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleViewRegistrations(
                                                                                    community.referral_code,
                                                                                    event.event_id,
                                                                                    event.event_name
                                                                                );
                                                                            }}
                                                                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 px-3 py-1.5 rounded-md border border-emerald-500/20 transition-colors cursor-pointer"
                                                                        >
                                                                            <Eye className="w-3 h-3" />
                                                                            View
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p
                                                        className="text-white/30 text-sm text-center py-4 font-medium"
                                                    >
                                                        No event registrations yet.
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}

                    {leaderboard.length === 0 && (
                        <div className="text-center py-20">
                            <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/30 text-sm">
                                No community partners found.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Details Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => {
                                setModalOpen(false);
                                setSearchQuery('');
                            }}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-3xl max-h-[80vh] bg-gray-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {modalTitle}
                                        </h3>
                                        <p className="text-white/40 text-xs mt-0.5">
                                            {registrations.length} registration
                                            {registrations.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setModalOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                {!modalLoading && registrations.length > 0 && (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or team..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-yellow-500/40 focus:ring-1 focus:ring-yellow-500/20 transition-colors"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                                {modalLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
                                    </div>
                                ) : registrations.length === 0 ? (
                                    <p className="text-white/30 text-sm text-center py-16">
                                        No registrations found for this event.
                                    </p>
                                ) : (
                                    (() => {
                                        const q = searchQuery.toLowerCase().trim();
                                        const filtered = q
                                            ? registrations.filter(
                                                (reg) =>
                                                    reg.team_name?.toLowerCase().includes(q) ||
                                                    reg.team_lead_email?.toLowerCase().includes(q) ||
                                                    reg.participants.some(
                                                        (p) =>
                                                            p.name.toLowerCase().includes(q) ||
                                                            p.email.toLowerCase().includes(q)
                                                    )
                                            )
                                            : registrations;

                                        if (filtered.length === 0) {
                                            return (
                                                <p className="text-white/30 text-sm text-center py-16">
                                                    No results for &ldquo;{searchQuery}&rdquo;
                                                </p>
                                            );
                                        }

                                        return (
                                            <div className="space-y-3">
                                                {filtered.map((reg, i) => (
                                                    <div
                                                        key={reg.team_id}
                                                        className="bg-white/[0.04] border border-white/5 rounded-xl p-4"
                                                    >
                                                        {/* Team header */}
                                                        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white/30 text-xs font-semibold">
                                                                    #{i + 1}
                                                                </span>
                                                                <span className="text-white font-semibold text-sm">
                                                                    {reg.team_name || 'Solo'}
                                                                </span>
                                                                {reg.is_team && (
                                                                    <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                                                        Team
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {reg.registered_at && (
                                                                <span className="text-white/25 text-[11px]">
                                                                    {new Date(
                                                                        reg.registered_at
                                                                    ).toLocaleDateString('en-IN', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Participants list (simplified for vertical scroll if needed, but table is fine) */}
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-[13px]">
                                                                <thead>
                                                                    <tr className="border-b border-white/5">
                                                                        <th className="text-left text-white/40 pb-2 pr-4 text-[11px] uppercase tracking-wider font-semibold">
                                                                            Name
                                                                        </th>
                                                                        <th className="text-left text-white/40 pb-2 pr-4 text-[11px] uppercase tracking-wider font-semibold">
                                                                            Email
                                                                        </th>
                                                                        <th className="text-left text-white/40 pb-2 text-[11px] uppercase tracking-wider font-semibold">
                                                                            Contact
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {reg.participants.map((p, j) => (
                                                                        <tr
                                                                            key={j}
                                                                            className="border-b border-white/[0.03] last:border-0"
                                                                        >
                                                                            <td className="py-2.5 pr-4 text-white/90 font-medium">
                                                                                {p.name}
                                                                            </td>
                                                                            <td className="py-2.5 pr-4 text-white/60 break-all">
                                                                                {p.email}
                                                                            </td>
                                                                            <td className="py-2.5 text-white/60 tabular-nums">
                                                                                {p.phone || '—'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Summary card sub-component
function SummaryCard({
    icon,
    value,
    label,
    className = '',
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    className?: string;
}) {
    return (
        <div
            className={`bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm ${className}`}
        >
            <div className="mx-auto mb-1 w-fit">{icon}</div>
            <p
                className="text-2xl font-bold text-white font-geist-mono"
            >
                {value}
            </p>
            <p
                className="text-[10px] text-white/40 uppercase tracking-wider font-bold"
            >
                {label}
            </p>
        </div>
    );
}
