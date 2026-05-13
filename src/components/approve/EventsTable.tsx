'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEvents } from '@/lib/stores/events';
import { RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { List, type RowComponentProps } from 'react-window';
import TableSkeleton from './TableSkeleton';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getRoles } from '@/utils/functions';
import { dateTime } from '@/utils/functions/dateUtils';
import { getApprovalDashboardData as fetchApprovalData } from '@/utils/functions/eventsUtils';
import { Filter } from './EventFilters';
import { TeamMembersDialog } from './TeamMembersDialog';

const PREV_YEAR_FEST_ID = '44bb2093-d229-4385-8f08-3fe7da3521c8';

// Registration status groups used by the Team / Awaiting Teams tabs.
// These reflect actual registration completion, not team membership
// lifecycle (team_status). SWC_PAID teams stay team_status='active'
// (no max members yet) even though registration is complete.
const COMPLETED_REGISTRATION_STATUSES = new Set([
  'SWC_PAID',
  'PAID',
  'FREE',
]);
const INCOMPLETE_REGISTRATION_STATUSES = new Set([
  'TEAM_FORMING',
  'AWAITING_MEMBERS',
  'PAYMENT_PENDING',
  'OFFLINE_PAYMENT_PENDING',
  'PAYMENT_NOT_STARTED',
]);

interface EventsTableProps {
  festId: string;
}

export default function EventsTable({ festId }: EventsTableProps) {
  // const festId = 'a4bc08e4-9af9-4212-8d32-cd88d2437f18';
  const [searchQuery, setSearchQuery] = useState('');
  const [rolesData, setRolesData] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [activeType, setActiveType] = useState<
    'Individual' | 'Team' | 'Awaiting Teams'
  >('Individual');
  const [swcPaid, setSwcPaid] = useState(0);
  const [swcNotPaid, setSwcNotPaid] = useState(0);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [registeredAtFilter, setRegisteredAtFilter] = useState('');
  const {
    approvalDashboardLoading,
    approvalDashboardData,
    getApprovalDashboardData,
  } = useEvents();

  const [showPrevYear, setShowPrevYear] = useState(false);
  const [prevYearData, setPrevYearData] = useState<any[] | null>(null);
  const [prevYearLoading, setPrevYearLoading] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeApprovalDashboardData = useMemo(() => {
    if (showPrevYear) {
      return Array.isArray(prevYearData) ? prevYearData : [];
    }
    return Array.isArray(approvalDashboardData) ? approvalDashboardData : [];
  }, [approvalDashboardData, showPrevYear, prevYearData]);

  const refreshData = async () => {
    getApprovalDashboardData(0, 1000, festId);
  };

  const loadPrevYearData = async () => {
    if (prevYearData !== null) return; // already fetched
    setPrevYearLoading(true);
    const PAGE_SIZE = 1000;
    const allData: any[] = [];
    let offset = 0;
    while (true) {
      const batch = await fetchApprovalData(
        offset,
        offset + PAGE_SIZE - 1,
        PREV_YEAR_FEST_ID,
        true
      );
      if (!batch || batch.length === 0) break;
      allData.push(...batch);
      if (batch.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }
    setPrevYearData(allData);
    setPrevYearLoading(false);
  };

  const togglePrevYear = async () => {
    if (!showPrevYear) {
      await loadPrevYearData();
      clearAllFilters();
    } else {
      clearAllFilters();
    }
    setShowPrevYear((prev) => !prev);
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const canModerate = useMemo(() => {
    return (rolesData || []).some(
      (role: any) =>
        role?.role === 'super_admin' ||
        role?.role === 'coordinator' ||
        role?.role === 'convenor'
    );
  }, [rolesData]);
  useEffect(() => {
    refreshData();

    const getRolesData = async () => {
      const roles: any[] = (await getRoles()) || [];
      const superAdminRole = roles.find(
        (role: any) => role?.role === 'super_admin'
      );
      const facultyRole = roles.find((role: any) => role?.role === 'faculty');
      setRolesData(roles as any);
      setIsAdmin(Boolean(superAdminRole));
      setIsFaculty(Boolean(facultyRole));
    };
    getRolesData();
  }, []);

  const filteredData = useMemo(() => {
    return safeApprovalDashboardData.filter((item) => {
      const searchMatch =
        !searchQuery ||
        (item.event_name ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.team_lead_phone ?? '').includes(searchQuery) ||
        (item.team_lead_name ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.team_lead_email ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.college ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.transaction_id ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const paymentStatusMatch =
        !paymentStatusFilter ||
        item.registration_status === paymentStatusFilter;
      const eventMatch = !eventFilter || item.event_name === eventFilter;

      const typeMatch = (() => {
        if (activeType === 'Individual')
          return item.registration_type === 'Individual';
        if (activeType === 'Team')
          return (
            item.registration_type === 'Team' &&
            COMPLETED_REGISTRATION_STATUSES.has(item.registration_status)
          );
        if (activeType === 'Awaiting Teams')
          return (
            item.registration_type === 'Team' &&
            INCOMPLETE_REGISTRATION_STATUSES.has(item.registration_status)
          );
        return false;
      })();

      const collegeMatch = !collegeFilter || item.college === collegeFilter;
      const genderMatch =
        !genderFilter || item.team_lead_gender === genderFilter;

      const registeredAtMatch = (() => {
        if (!registeredAtFilter) return true;
        const now = new Date();
        const registeredDate = new Date(item.registered_at);
        const hoursDiff =
          (now.getTime() - registeredDate.getTime()) / (1000 * 60 * 60);

        switch (registeredAtFilter) {
          case 'Last 24 hours':
            return hoursDiff <= 24;
          case 'Last 7 days':
            return hoursDiff <= 24 * 7;
          case 'Last 30 days':
            return hoursDiff <= 24 * 30;
          default:
            return true;
        }
      })();
      return (
        searchMatch &&
        paymentStatusMatch &&
        eventMatch &&
        typeMatch &&
        collegeMatch &&
        genderMatch &&
        registeredAtMatch
      );
    });
  }, [
    safeApprovalDashboardData,
    searchQuery,
    paymentStatusFilter,
    eventFilter,
    activeType,
    collegeFilter,
    genderFilter,
    registeredAtFilter,
  ]);

  useEffect(() => {
    const fetchMore = async () => {
      const totalMembers = filteredData?.reduce((sum, team) => {
        return sum + (team.team_members?.length || 0);
      }, 0);
      return totalMembers;
    };

    fetchMore();
  }, [filteredData]);

  const totalRevenue = useMemo(() => {
    const paidStatuses = new Set(['PAID']);
    return filteredData.reduce((acc, item) => {
      if (!paidStatuses.has(item.registration_status)) return acc;
      return acc + (item.registration_fees || 0);
    }, 0);
  }, [filteredData]);

  const uniqueEvents = useMemo(
    () =>
      Array.from(
        new Set(safeApprovalDashboardData.map((item) => item.event_name))
      ),
    [safeApprovalDashboardData]
  );

  const availableTypes = useMemo(() => {
    const types = new Set(
      safeApprovalDashboardData.map((item) => item.registration_type)
    );
    const hasAwaitingTeams = safeApprovalDashboardData.some(
      (item) =>
        item.registration_type === 'Team' &&
        INCOMPLETE_REGISTRATION_STATUSES.has(item.registration_status)
    );
    const result: ('Individual' | 'Team' | 'Awaiting Teams')[] = [];
    if (types.has('Individual')) result.push('Individual');
    if (types.has('Team')) result.push('Team');
    if (hasAwaitingTeams) result.push('Awaiting Teams');
    return result;
  }, [safeApprovalDashboardData]);

  useEffect(() => {
    if (availableTypes.length > 0 && !availableTypes.includes(activeType)) {
      setActiveType(availableTypes[0]);
    }
  }, [availableTypes, activeType]);

  const columns = useMemo(() => {
    const baseColumns = [
      { header: 'SL No.', width: isMobile ? 50 : 70, key: 'sl' },
      { header: 'Payment Status', width: isMobile ? 180 : 210, key: 'payment' },
      { header: 'Event Name', width: isMobile ? 180 : 240, key: 'event' },
    ];

    if (activeType === 'Team' || activeType === 'Awaiting Teams') {
      baseColumns.push({
        header: 'Team Name',
        width: isMobile ? 180 : 220,
        key: 'team_name',
      });
    }

    baseColumns.push({
      header: 'College',
      width: isMobile ? 200 : 280,
      key: 'college',
    });
    baseColumns.push({
      header: 'Gender',
      width: isMobile ? 80 : 100,
      key: 'gender',
    });
    baseColumns.push({
      header: activeType === 'Individual' ? 'Name' : 'Team Lead',
      width: isMobile ? 160 : 220,
      key: 'lead',
    });
    baseColumns.push({
      header: 'Phone',
      width: isMobile ? 110 : 130,
      key: 'phone',
    });
    baseColumns.push({
      header: 'Email',
      width: isMobile ? 180 : 220,
      key: 'email',
    });
    baseColumns.push({
      header: 'Transaction ID',
      width: isMobile ? 150 : 180,
      key: 'txn',
    });

    if (activeType === 'Team' || activeType === 'Awaiting Teams') {
      baseColumns.push({ header: 'Members', width: 90, key: 'members' });
    }

    baseColumns.push({
      header: 'Registered At',
      width: isMobile ? 140 : 180,
      key: 'date',
    });

    return baseColumns;
  }, [activeType]);

  const tableWidth = useMemo(
    () => columns.reduce((a, b) => a + b.width, 0),
    [columns]
  );

  const uniqueColleges = useMemo(
    () =>
      Array.from(
        new Set(safeApprovalDashboardData.map((item) => item.college))
      ),
    [safeApprovalDashboardData]
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setPaymentStatusFilter('');
    setEventFilter('');
    setActiveType('Individual');
    setCollegeFilter('');
    setGenderFilter('');
    setRegisteredAtFilter('');
  };

  const [teamsWithMembers, setTeamsWithMembers] = useState<any[]>([]);

  useEffect(() => {
    if (filteredData.length > 0) {
      const STATUS_MAP: Record<string, string> = {
        PAYMENT_NOT_STARTED: 'Payment Not Started',
        PAYMENT_PENDING: 'Payment Pending',
        OFFLINE_PAYMENT_PENDING: 'Offline Pending',
        PAID: 'Paid',
        SWC_PAID: 'SWC Paid',
        FREE: 'Free',
        TEAM_FORMING: 'Team Forming',
        AWAITING_MEMBERS: 'Awaiting Members',
      };

      const csvRows: Record<string, any>[] = [];

      filteredData.forEach((team, index) => {
        const isTeam = team.registration_type !== 'Individual';
        const status =
          STATUS_MAP[team.registration_status] || team.registration_status;

        const sharedFields: Record<string, any> = {
          'SL No.': team.serial_no ?? index + 1,
          'Registration Status': status,
          'Event Name': team.event_name,
          'Event Category': team.event_category,
          'Registration Type': team.registration_type,
          ...(isTeam ? { 'Team Name': team.team_name || 'N/A' } : {}),
          'Team College': team.college || '',
          'Payment Mode': team.payment_mode || '',
          'Reg Mode': team.reg_mode || '',
          'Registration Fees': team.registration_fees ?? '',
          'Transaction ID': team.transaction_id || '',
          'Razorpay Payment ID': team.razorpay_payment_id || '',
          'Payment Amount (INR)': team.payment_amount
            ? team.payment_amount / 100
            : '',
          'Razorpay Status': team.razorpay_status || '',
          'Registered At': team.registered_at
            ? new Date(team.registered_at).toLocaleString()
            : '',
          Attendance: team.attendance ? 'Yes' : 'No',
          'Referral Code': team.referral_code || '',
          ...(isTeam ? { 'Member Count': team.member_count ?? '' } : {}),
        };

        // Team lead row
        csvRows.push({
          ...sharedFields,
          Role: isTeam ? 'Team Lead' : 'Participant',
          Name: team.team_lead_name,
          Phone: team.team_lead_phone,
          Email: team.team_lead_email,
          Gender: team.team_lead_gender || '',
          College: team.team_lead_college || '',
          'College Roll': team.team_lead_college_roll || '',
          Course: team.team_lead_course || '',
          Stream: team.team_lead_stream || '',
          'Is RCCIIT Email': team.team_lead_is_rcciit_email ? 'Yes' : 'No',
          'SWC Cleared':
            team.team_lead_swc_cleared === true
              ? 'Yes'
              : team.team_lead_swc_cleared === false
                ? 'No'
                : '',
        });

        // Team member rows
        (team.team_members ?? []).forEach((member: any) => {
          csvRows.push({
            ...sharedFields,
            Role: 'Member',
            Name: member.name,
            Phone: member.phone,
            Email: member.email,
            Gender: '',
            College: member.college || '',
            'College Roll': '',
            Course: '',
            Stream: '',
            'Is RCCIIT Email': member.is_rcciit_email ? 'Yes' : 'No',
            'SWC Cleared':
              member.swc_cleared === true
                ? 'Yes'
                : member.swc_cleared === false
                  ? 'No'
                  : '',
          });
        });
      });

      setTeamsWithMembers(csvRows);
    } else {
      setTeamsWithMembers([]);
    }
  }, [filteredData]);

  const REGISTRATION_STATUS_MAP: Record<string, string> = {
    PAYMENT_NOT_STARTED: 'Payment Not Started',
    PAYMENT_PENDING: 'Payment Pending',
    OFFLINE_PAYMENT_PENDING: 'Offline Pending',
    PAID: 'Paid',
    SWC_PAID: 'SWC Paid',
    FREE: 'Free',
    TEAM_FORMING: 'Team Forming',
    AWAITING_MEMBERS: 'Awaiting Members',
  };

  const getReadableStatus = (status: string) => {
    return REGISTRATION_STATUS_MAP[status] || status.replace(/_/g, ' ');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'SWC_PAID':
      case 'FREE':
        return 'bg-[#10B981]/10 text-[#10B981] ring-1 ring-[#10B981]/30 hover:bg-[#10B981]/20';
      case 'OFFLINE_PAYMENT_PENDING':
      case 'PAYMENT_PENDING':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] ring-1 ring-[#F59E0B]/30 hover:bg-[#F59E0B]/20';
      case 'AWAITING_MEMBERS':
      case 'TEAM_FORMING':
        return 'bg-[#6366F1]/10 text-[#6366F1] ring-1 ring-[#6366F1]/30 hover:bg-[#6366F1]/20';
      default:
        return 'bg-[#EF4444]/10 text-[#EF4444] ring-1 ring-[#EF4444]/30 hover:bg-[#EF4444]/20';
    }
  };

  const htmlToPlainText = (html: string): string => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const walk = (node: Node, depth = 0): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';

      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const kids = Array.from(el.childNodes);

      if (tag === 'ul' || tag === 'ol') {
        let n = 0;
        return kids
          .filter((k) => (k as Element).tagName?.toLowerCase() === 'li')
          .map((k) => {
            n++;
            const bullet = tag === 'ol' ? `${n}.` : '-';
            const indent = '  '.repeat(depth);
            const body = walk(k, depth + 1).trim();
            return body ? `${indent}${bullet} ${body}` : '';
          })
          .filter(Boolean)
          .join('\n');
      }

      if (tag === 'li') return kids.map((k) => walk(k, depth)).join('');
      if (tag === 'br') return '\n';
      if (tag === 'p') {
        const inner = kids.map((k) => walk(k, depth)).join('');
        return inner ? `${inner}\n` : '';
      }
      if (tag === 'strong' || tag === 'b') {
        return `*${kids.map((k) => walk(k, depth)).join('')}*`;
      }
      if (tag === 'em' || tag === 'i') {
        return `_${kids.map((k) => walk(k, depth)).join('')}_`;
      }

      return kids.map((k) => walk(k, depth)).join('');
    };

    return walk(doc.body).replace(/\n{3,}/g, '\n\n').trim();
  };

  const buildReminderMessage = (item: any): string => {
    const lines: string[] = [];
    const isTeam = item.registration_type !== 'Individual';

    lines.push(`*Participation Reminder - ${item.event_name}*`);
    lines.push('');

    if (isTeam) {
      lines.push(`Hi *${item.team_name}* team,`);
      lines.push('');
      lines.push(
        `This is a reminder for your team's participation in *${item.event_name}${item.fest_name ? ` at *${item.fest_name}*` : ''}.`
      );
    } else {
      lines.push(`Hi *${item.team_lead_name}*,`);
      lines.push('');
      lines.push(
        `This is a reminder for your participation in *${item.event_name}*${item.fest_name ? ` at *${item.fest_name}*` : ''}.`
      );
    }

    if (item.event_schedule) {
      lines.push('');
      lines.push('*Schedule:*');
      lines.push(htmlToPlainText(item.event_schedule));
    }

    if (item.event_coordinators && item.event_coordinators.length > 0) {
      lines.push('');
      lines.push('*For queries, contact:*');
      item.event_coordinators.forEach((c: { name: string; phone: string }) => {
        lines.push(`${c.name} - ${c.phone}`);
      });
    }

    if (item.fest_name) {
      lines.push('');
      lines.push(`_Team ${item.fest_name}_`);
    }

    return lines.join('\n');
  };

  const WhatsAppButton = ({ item }: { item: any }) => {
    const phone = item.team_lead_phone?.replace(/\D/g, '');
    if (!phone) return null;
    const message = buildReminderMessage(item);
    return (
      <a
        href={`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex-none flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/25 transition-colors"
        title="Send WhatsApp reminder"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 fill-[#25D366]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    );
  };

  const Row = ({ index, style }: RowComponentProps) => {
    const item = filteredData[index];
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<
      'basic' | 'team' | 'payment' | 'transaction'
    >('basic');
    if (!item) return <div style={style} />;
    return (
      <>
        <div
          style={{ ...style, width: tableWidth }}
          className="flex items-center border-b border-white/[0.04] hover:bg-white/[0.04] active:bg-white/[0.06] transition-all duration-200 text-sm cursor-pointer group"
          onClick={() => setIsDialogOpen(true)}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-6 py-4 flex-none overflow-hidden h-full flex items-center"
              style={{ width: column.width }}
            >
              {column.key === 'sl' ? (
                <span className="text-gray-500 font-mono text-xs">
                  {index + 1}
                </span>
              ) : column.key === 'payment' ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={`h-9 inline-flex items-center justify-center px-4 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm ${getStatusStyle(item.registration_status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDialogOpen(true);
                        }}
                      >
                        {getReadableStatus(item.registration_status)}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-white/10 text-white">
                      <p>Click to view registration details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : column.key === 'event' ? (
                <span
                  className="text-white font-bold truncate group-hover:text-blue-400 transition-colors"
                  title={item.event_name}
                >
                  {item.event_name}
                </span>
              ) : column.key === 'team_name' ? (
                <div className="flex items-center gap-2 w-full overflow-hidden">
                  <span
                    className="text-gray-300 font-medium truncate flex-1 min-w-0"
                    title={item.team_name}
                  >
                    {item.team_name}
                  </span>
                  <WhatsAppButton item={item} />
                </div>
              ) : column.key === 'college' ? (
                <span
                  className="text-gray-400 truncate text-xs"
                  title={item.college}
                >
                  {item.college}
                </span>
              ) : column.key === 'gender' ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${item.team_lead_gender?.toLowerCase() === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}
                  />
                  <span className="text-gray-300 text-xs uppercase font-black tabular-nums">
                    {item.team_lead_gender?.slice(0, 1) || '-'}
                  </span>
                </div>
              ) : column.key === 'lead' ? (
                <div className="flex items-center gap-2 w-full overflow-hidden">
                  <span
                    className="text-white font-semibold truncate flex-1 min-w-0"
                    title={item.team_lead_name}
                  >
                    {item.team_lead_name}
                  </span>
                  {item.registration_type === 'Individual' && (
                    <WhatsAppButton item={item} />
                  )}
                </div>
              ) : column.key === 'phone' ? (
                <span
                  className="text-gray-300 font-mono tracking-tighter"
                  title={item.team_lead_phone}
                >
                  {item.team_lead_phone}
                </span>
              ) : column.key === 'email' ? (
                <span
                  className="text-gray-400 truncate italic text-xs hover:text-white transition-colors"
                  title={item.team_lead_email}
                >
                  {item.team_lead_email}
                </span>
              ) : column.key === 'txn' ? (
                <span
                  className="font-mono text-[11px] text-gray-500 bg-white/[0.03] px-2 py-1 rounded border border-white/5 truncate"
                  title={item.transaction_id ?? undefined}
                >
                  {item.transaction_id || 'NO_TXN'}
                </span>
              ) : column.key === 'members' ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <TeamMembersDialog
                    members={item.team_members}
                    teamID={item.team_id}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-gray-300 text-[11px] font-mono leading-none">
                    {item.registered_at?.split('T')[0]}
                  </span>
                  <span className="text-gray-600 text-[9px] font-mono leading-none">
                    {item.registered_at?.split('T')[1]?.slice(0, 5)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[800px] bg-[#050508]/95 border border-white/10 backdrop-blur-2xl rounded-3xl p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col h-[85vh] max-h-[900px]">
              {/* Modal Header + Tabs */}
              <div className="p-8 pb-4">
                <DialogHeader>
                  <div className="flex items-center justify-between mb-2">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                      Registration Details
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 rounded-full ${getStatusStyle(item.registration_status)}`}
                    >
                      {getReadableStatus(item.registration_status)}
                    </span>
                    {item.serial_no && (
                      <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-black px-3 py-1 bg-amber-500/10 rounded-full">
                        SL #{item.serial_no}
                      </span>
                    )}
                  </div>
                </DialogHeader>
                {/* Modal Tabs */}
                <div className="flex flex-wrap gap-1 mt-6 p-1 bg-white/[0.03] rounded-2xl w-fit border border-white/5">
                  {[
                    { key: 'basic', label: 'Basic' },
                    { key: 'team', label: 'Team Details' },
                    { key: 'payment', label: 'Payment' },
                    { key: 'transaction', label: 'Transaction' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveModalTab(tab.key as any)}
                      className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 relative ${
                        activeModalTab === tab.key
                          ? 'text-white'
                          : 'text-gray-500 hover:text-gray-400'
                      }`}
                    >
                      {activeModalTab === tab.key && (
                        <div className="absolute inset-0 bg-white/[0.05] rounded-xl ring-1 ring-white/10" />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-8 pt-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* ── BASIC TAB ── */}
                {activeModalTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        label: 'Event Name',
                        value: item.event_name,
                        icon: '🏆',
                      },
                      {
                        label: 'Event Category',
                        value: item.event_category,
                        icon: '📂',
                      },
                      {
                        label: 'Registration Type',
                        value: item.registration_type,
                        icon: '🔘',
                      },
                      {
                        label: 'Participant / Lead Name',
                        value: item.team_lead_name,
                        icon: '👤',
                      },
                      ...(item.team_name
                        ? [
                            {
                              label: 'Team Name',
                              value: item.team_name,
                              icon: '👥',
                            },
                          ]
                        : []),
                      {
                        label: 'College (Team)',
                        value: item.college,
                        icon: '🏛️',
                      },
                      {
                        label: 'Lead College',
                        value: item.team_lead_college,
                        icon: '🎓',
                      },
                      ...(item.team_lead_college_roll
                        ? [
                            {
                              label: 'College Roll',
                              value: item.team_lead_college_roll,
                              icon: '🪪',
                            },
                          ]
                        : []),
                      ...(item.team_lead_course
                        ? [
                            {
                              label: 'Course',
                              value: item.team_lead_course,
                              icon: '📘',
                            },
                          ]
                        : []),
                      ...(item.team_lead_stream
                        ? [
                            {
                              label: 'Stream',
                              value: item.team_lead_stream,
                              icon: '📚',
                            },
                          ]
                        : []),
                      {
                        label: 'Gender',
                        value: (item.team_lead_gender || 'N/A').toUpperCase(),
                        icon: '🚻',
                      },
                      {
                        label: 'Phone Number',
                        value: item.team_lead_phone,
                        icon: '📞',
                      },
                      {
                        label: 'Email Address',
                        value: item.team_lead_email,
                        icon: '📧',
                      },
                      ...(item.team_lead_coin != null
                        ? [
                            {
                              label: 'Coins',
                              value: String(item.team_lead_coin),
                              icon: '🪙',
                            },
                          ]
                        : []),
                      ...(item.team_lead_referral
                        ? [
                            {
                              label: 'User Referral',
                              value: item.team_lead_referral,
                              icon: '🔗',
                            },
                          ]
                        : []),
                      ...(item.team_lead_user_created_at
                        ? [
                            {
                              label: 'Account Created',
                              value: new Date(
                                item.team_lead_user_created_at
                              ).toLocaleString(),
                              icon: '🗓️',
                            },
                          ]
                        : []),
                      {
                        label: 'Registered On',
                        value: item.registered_at
                          ? new Date(item.registered_at).toLocaleString()
                          : 'N/A',
                        icon: '📅',
                      },
                      ...(item.referral_code
                        ? [
                            {
                              label: 'Referral Code',
                              value: item.referral_code,
                              icon: '🎟️',
                            },
                          ]
                        : []),
                    ].map((info, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2 opacity-60">
                          <span className="text-lg">{info.icon}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                            {info.label}
                          </span>
                        </div>
                        <p className="text-white font-medium pl-8 break-all">
                          {info.value}
                        </p>
                      </div>
                    ))}
                    {/* RCCIIT / SWC Status */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3 mb-3 opacity-60">
                        <span className="text-lg">🎓</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                          RCCIIT / SWC Status
                        </span>
                      </div>
                      <div className="pl-8 flex flex-wrap gap-2">
                        {item.team_lead_is_rcciit_email ? (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30 font-bold uppercase">
                            RCCIIT Email
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-500 ring-1 ring-white/10 font-bold uppercase">
                            External
                          </span>
                        )}
                        {item.team_lead_swc_cleared === true && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 font-bold uppercase">
                            SWC Cleared
                          </span>
                        )}
                        {item.team_lead_swc_cleared === false && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/30 font-bold uppercase">
                            SWC Not Cleared
                          </span>
                        )}
                        {item.attendance && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/30 font-bold uppercase">
                            Present
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TEAM TAB ── */}
                {activeModalTab === 'team' && (
                  <div className="space-y-6">
                    {/* Team meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Team Status', value: item.team_status },
                        {
                          label: 'Members',
                          value: `${item.member_count} / ${item.min_team_size}–${item.max_team_size}`,
                        },
                        ...(item.invite_code
                          ? [{ label: 'Invite Code', value: item.invite_code }]
                          : []),
                      ].map((info, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                          <p className="text-[9px] uppercase font-black tracking-widest text-gray-500 mb-1">
                            {info.label}
                          </p>
                          <p className="text-sm text-white font-mono">
                            {info.value}
                          </p>
                        </div>
                      ))}
                      {item.all_rcciit_members_swc_cleared !== null && (
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-[9px] uppercase font-black tracking-widest text-gray-500 mb-1">
                            All SWC Cleared
                          </p>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${item.all_rcciit_members_swc_cleared ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30'}`}
                          >
                            {item.all_rcciit_members_swc_cleared ? 'Yes' : 'No'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Team Members */}
                    {item.team_members && item.team_members.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.team_members.map((member: any, i: number) => (
                          <div
                            key={i}
                            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold truncate">
                                  {member.name}
                                </h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {member.is_rcciit_email && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 font-bold uppercase">
                                      RCCIIT
                                    </span>
                                  )}
                                  {member.swc_cleared === true && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 font-bold uppercase">
                                      SWC ✓
                                    </span>
                                  )}
                                  {member.swc_cleared === false && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20 font-bold uppercase">
                                      SWC ✗
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2.5 pl-2">
                              <div className="flex items-center gap-2">
                                <span>📞</span>
                                <span className="text-sm text-gray-300 font-mono tracking-tighter">
                                  {member.phone}
                                </span>
                                {member.phone && (
                                  <a
                                    href={`https://wa.me/91${member.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/25 transition-colors"
                                    title="Open in WhatsApp"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-3.5 h-3.5 fill-[#25D366]"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span>📧</span>
                                <span className="text-sm text-gray-400 italic truncate">
                                  {member.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>🏛️</span>
                                <span className="text-sm text-gray-400">
                                  {member.college}
                                </span>
                              </div>
                              {member.extras &&
                                Object.keys(member.extras).length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                    {Object.entries(member.extras).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex flex-col gap-0.5"
                                        >
                                          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                                            {key.replace(/_/g, ' ')}
                                          </p>
                                          <p className="text-sm text-white font-medium">
                                            {String(value)}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                        <span className="text-4xl mb-4">👥</span>
                        <p className="text-sm font-bold uppercase tracking-widest">
                          No team members listed
                        </p>
                      </div>
                    )}

                    {/* Team Discovery */}
                    {item.team_discovery && item.team_discovery.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[9px] uppercase font-black tracking-widest text-gray-500 px-1">
                          Team Discovery Posts
                        </p>
                        {item.team_discovery.map((td: any, i: number) => (
                          <div
                            key={i}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center gap-3"
                          >
                            <span
                              className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase ring-1 ${td.type === 'looking' ? 'bg-violet-500/10 text-violet-400 ring-violet-500/30' : 'bg-sky-500/10 text-sky-400 ring-sky-500/30'}`}
                            >
                              {td.type}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase ring-1 ${td.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' : td.status === 'matched' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/30' : 'bg-gray-500/10 text-gray-400 ring-gray-500/30'}`}
                            >
                              {td.status}
                            </span>
                            {td.slots_available != null && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                Slots: {td.slots_available}
                              </span>
                            )}
                            {td.message && (
                              <p className="w-full text-sm text-gray-300 italic">
                                "{td.message}"
                              </p>
                            )}
                            <p className="w-full text-[9px] text-gray-600 font-mono">
                              {new Date(td.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── PAYMENT TAB ── */}
                {activeModalTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          label: 'Payment Mode',
                          value: item.payment_mode || 'N/A',
                          icon: '🔄',
                        },
                        {
                          label: 'Reg Mode',
                          value: item.reg_mode || 'N/A',
                          icon: '📋',
                        },
                        {
                          label: 'Registration Fees',
                          value: item.registration_fees
                            ? `₹${item.registration_fees}`
                            : 'Free',
                          icon: '💵',
                        },
                        {
                          label: 'Prize Pool',
                          value: item.prize_pool
                            ? `₹${item.prize_pool}`
                            : 'N/A',
                          icon: '🏅',
                        },
                        {
                          label: 'Razorpay Order ID',
                          value: item.razorpay_order_id,
                          icon: '🆔',
                        },
                        {
                          label: 'Razorpay Payment ID',
                          value: item.razorpay_payment_id,
                          icon: '💳',
                        },
                        {
                          label: 'Razorpay Signature',
                          value: item.razorpay_signature,
                          icon: '🔐',
                        },
                        {
                          label: 'Amount Paid',
                          value: item.payment_amount
                            ? `${item.payment_currency ?? 'INR'} ${item.payment_amount / 100}`
                            : 'N/A',
                          icon: '💰',
                        },
                        {
                          label: 'Razorpay Status',
                          value: item.razorpay_status || 'N/A',
                          icon: '📊',
                        },
                        {
                          label: 'Payment Row ID',
                          value: item.payment_row_id,
                          icon: '🗂️',
                        },
                        {
                          label: 'Payment Created At',
                          value: item.payment_created_at
                            ? new Date(item.payment_created_at).toLocaleString()
                            : 'N/A',
                          icon: '🕒',
                        },
                        {
                          label: 'Payment Updated At',
                          value: item.payment_updated_at
                            ? new Date(item.payment_updated_at).toLocaleString()
                            : 'N/A',
                          icon: '🔁',
                        },
                        {
                          label: 'Payment Verified At',
                          value: item.payment_verified_at
                            ? new Date(
                                item.payment_verified_at
                              ).toLocaleString()
                            : 'N/A',
                          icon: '✅',
                        },
                      ].map((info, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-2 opacity-60">
                            <span className="text-lg">{info.icon}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                              {info.label}
                            </span>
                          </div>
                          <p className="text-white font-mono text-sm pl-8 break-all">
                            {info.value || 'N/A'}
                          </p>
                        </div>
                      ))}
                      {/* Webhook Verified */}
                      {item.webhook_verified != null && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-3 mb-2 opacity-60">
                            <span className="text-lg">🔔</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                              Webhook Verified
                            </span>
                          </div>
                          <div className="pl-8">
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ring-1 ${item.webhook_verified ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' : 'bg-red-500/10 text-red-400 ring-red-500/30'}`}
                            >
                              {item.webhook_verified ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* SWC Eligible Category */}
                      {item.is_swc_eligible_category !== undefined && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-3 mb-2 opacity-60">
                            <span className="text-lg">🎖️</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                              SWC Eligible Category
                            </span>
                          </div>
                          <div className="pl-8">
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${item.is_swc_eligible_category ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-white/5 text-gray-500 ring-1 ring-white/10'}`}
                            >
                              {item.is_swc_eligible_category ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TRANSACTION TAB ── */}
                {activeModalTab === 'transaction' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-2">
                          Account Holder
                        </label>
                        <p className="text-white font-bold">
                          {item.account_holder_name || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-2">
                          Transaction ID
                        </label>
                        <p className="text-white font-mono break-all">
                          {item.transaction_id || 'NO_ID'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-2">
                          Transaction Verified At
                        </label>
                        <p className="text-white font-mono text-sm">
                          {item.transaction_verified
                            ? new Date(
                                item.transaction_verified
                              ).toLocaleString()
                            : 'Not Verified'}
                        </p>
                      </div>
                      {item.transaction_screenshot && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-2">
                            Screenshot
                          </label>
                          <a
                            href={item.transaction_screenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm underline font-mono break-all"
                          >
                            View Screenshot
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                {canModerate && !isFaculty && (
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
                {(!canModerate || isFaculty) && (
                  <Button
                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl font-bold"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Got it
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  if (approvalDashboardLoading || (showPrevYear && prevYearLoading))
    return <TableSkeleton />;

  // const [showNext, setShowNext] = useState(true);

  // useEffect(()=>{
  //   if(showNext){
  //     getApprovalDashboardData(0, 1000);
  //   }else  {
  //     getApprovalDashboardData(1000,2000);
  //   }
  // },[showNext])

  const canDownloadCsv = filteredData.length > 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Search and Main Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0 group">
            <Input
              type="text"
              placeholder="Search registrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 h-12 md:h-[52px] bg-white/[0.03] text-gray-100 border-white/10 group-hover:border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-hover:text-blue-400 transition-colors" />
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            className="h-12 md:h-[52px] px-4 bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:text-white text-gray-400 rounded-xl transition-all"
          >
            <RefreshCw
              className={`w-5 h-5 ${approvalDashboardLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        <div className="flex items-center gap-3 justify-end lg:w-auto flex-wrap">
          <Button
            onClick={togglePrevYear}
            disabled={prevYearLoading}
            variant="outline"
            className={`h-12 md:h-[52px] rounded-xl px-4 md:px-6 font-bold text-xs md:text-sm tracking-wide transition-all border ${
              showPrevYear
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 hover:bg-violet-500/30'
                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {prevYearLoading
              ? 'Loading...'
              : showPrevYear
                ? 'Current Year'
                : 'Prev Year Regs'}
          </Button>
          {canDownloadCsv ? (
            <Button
              asChild
              className="h-12 md:h-[52px] rounded-xl px-4 md:px-8 tracking-wider bg-gradient-to-r from-yellow-600 to-amber-500 text-white font-bold shadow-lg shadow-yellow-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-0 ring-1 ring-white/20 text-xs md:text-sm"
            >
              <CSVLink
                data={teamsWithMembers}
                filename={`registrations-${dateTime()}.csv`}
              >
                Download CSV
              </CSVLink>
            </Button>
          ) : (
            <Button
              disabled
              className="h-12 md:h-[52px] rounded-xl px-4 md:px-8 tracking-wider bg-white/5 text-gray-500 border border-white/10 opacity-60 cursor-not-allowed text-xs md:text-sm"
            >
              Download CSV
            </Button>
          )}
        </div>
      </div>

      {/* Prev Year Banner */}
      {showPrevYear && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
          Viewing Previous Year Registrations
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
              Advanced Filters
            </span>
          </div>
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            disabled={
              !searchQuery &&
              !paymentStatusFilter &&
              !eventFilter &&
              activeType === 'Individual' &&
              !collegeFilter &&
              !genderFilter &&
              !registeredAtFilter
            }
            className="h-7 px-3 text-[10px] uppercase tracking-wider font-bold text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg disabled:opacity-0"
          >
            Reset All
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-black ml-1">
              Status
            </label>
            <Filter
              options={[
                'PAID',
                'SWC_PAID',
                'FREE',
                'OFFLINE_PAYMENT_PENDING',
                'PAYMENT_PENDING',
                'PAYMENT_NOT_STARTED',
                'AWAITING_MEMBERS',
                'TEAM_FORMING',
              ]}
              value={paymentStatusFilter}
              onChange={setPaymentStatusFilter}
              placeholder="All Status"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-black ml-1">
              Event
            </label>
            <Filter
              options={uniqueEvents}
              value={eventFilter}
              onChange={setEventFilter}
              placeholder="All Events"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-black ml-1">
              College
            </label>
            <Filter
              options={uniqueColleges}
              value={collegeFilter}
              onChange={setCollegeFilter}
              placeholder="All Colleges"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-black ml-1">
              Gender
            </label>
            <Filter
              options={['male', 'female']}
              value={genderFilter}
              onChange={setGenderFilter}
              placeholder="All Genders"
            />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-black ml-1">
              Time Range
            </label>
            <Filter
              options={['Last 24 hours', 'Last 7 days', 'Last 30 days']}
              value={registeredAtFilter}
              onChange={setRegisteredAtFilter}
              placeholder="Ever since"
            />
          </div>
        </div>
      </div>

      {/* Tabs and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {availableTypes.length > 1 && (
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-2xl w-fit border border-white/10">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-8 py-2.5 rounded-xl font-semibold transition-all duration-300 relative group overflow-hidden ${
                  activeType === type
                    ? 'text-white shadow-xl'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {activeType === type && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl" />
                )}
                <span className="relative z-10">{type}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
              Estimated Revenue
            </span>
            <span className="text-emerald-400 font-mono text-2xl font-black tabular-nums">
              ₹{totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10" />
          <div className="flex flex-col items-end border-l sm:border-0 border-white/10 pl-6 sm:pl-0">
            <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
              Total Records
            </span>
            <span className="text-white font-mono text-2xl font-black tabular-nums">
              {filteredData.length}
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative group border border-white/5 rounded-2xl bg-black/40 backdrop-blur-md overflow-hidden -mx-4 sm:mx-0 shadow-2xl">
        {isMobile && (
          <div className="absolute top-2 right-4 z-30 animate-pulse pointer-events-none sm:hidden">
            <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 backdrop-blur-md">
              <span className="text-[9px] uppercase font-black text-blue-400 tracking-tighter">
                Scroll to view more
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div
            style={{
              width: Math.max(tableWidth, windowWidth - (isMobile ? 32 : 64)),
            }}
            className="min-w-full"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center bg-white/[0.02] border-b border-white/10 text-[10px] sm:text-xs uppercase tracking-widest font-black text-gray-500 h-14 sm:h-16">
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="px-4 sm:px-6 flex items-center"
                  style={{ width: column.width }}
                >
                  {column.header}
                </div>
              ))}
            </div>
            {/* Rows */}
            <div className="relative" style={{ height: 650 }}>
              <List
                style={{
                  height: 650,
                  width: Math.max(
                    tableWidth,
                    windowWidth - (isMobile ? 32 : 64)
                  ),
                  overflowX: 'hidden',
                }}
                defaultHeight={650}
                rowCount={filteredData.length}
                rowHeight={isMobile ? 64 : 72}
                rowProps={{}}
                rowComponent={Row}
              />
            </div>
          </div>
        </div>

        {/* Shadow Overlays */}
        {!isMobile && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
