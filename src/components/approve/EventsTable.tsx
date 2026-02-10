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
import { events } from '@/lib/types/events';
import { RefreshCw, Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { List, type RowComponentProps } from 'react-window';
import { toast } from 'sonner';
import TableSkeleton from './TableSkeleton';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { whatsAppLinks } from '@/utils/constraints/constants/whatsApp';
import { getRoles } from '@/utils/functions';
import { dateTime } from '@/utils/functions/dateUtils';
import { approveRegistration } from '@/utils/functions/register-services';
import { Filter } from './EventFilters';
import { TeamMembersDialog } from './TeamMembersDialog';

interface EventsTableProps {
  festId: string;
}

export default function EventsTable({ festId }: EventsTableProps) {
  // const festId = 'a4bc08e4-9af9-4212-8d32-cd88d2437f18';
  const [searchQuery, setSearchQuery] = useState('');
  const [rolesData, setRolesData] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [activeType, setActiveType] = useState('Individual');
  const [swcPaid, setSwcPaid] = useState(0);
  const [swcNotPaid, setSwcNotPaid] = useState(0);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [registeredAtFilter, setRegisteredAtFilter] = useState('');
  const {
    eventsData,
    approvalDashboardLoading,
    approvalDashboardData,
    getApprovalDashboardData,
  } = useEvents();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeApprovalDashboardData = useMemo(
    () => (Array.isArray(approvalDashboardData) ? approvalDashboardData : []),
    [approvalDashboardData]
  );

  const refreshData = async () => {
    getApprovalDashboardData(0, 1000, festId);
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const canModerate = useMemo(() => {
    return (rolesData || []).some(
      (role: any) =>
        role?.role === 'super_admin' || role?.role === 'coordinator'
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
        (item.eventname ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.teamleadphone ?? '').includes(searchQuery) ||
        (item.teamlead ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.teamleademail ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.college ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.transactionid ?? '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const paymentStatusMatch =
        !paymentStatusFilter || item.paymentstatus === paymentStatusFilter;
      const eventMatch = !eventFilter || item.eventname === eventFilter;
      const typeMatch = item.type === activeType;
      const collegeMatch = !collegeFilter || item.college === collegeFilter;
      const genderMatch = !genderFilter || item.gender === genderFilter;

      const registeredAtMatch = (() => {
        if (!registeredAtFilter) return true;
        const now = new Date();
        const registeredDate = new Date(item.registeredat);
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
        return sum + (team.teammembers?.length || 0);
      }, 0);
      return totalMembers;
    };

    fetchMore();
  }, [filteredData]);

  const totalRevenue = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const event = eventsData?.find((e) => e.name === item.eventname);
      return acc + (event?.registration_fees || 0);
    }, 0);
  }, [filteredData, eventsData]);

  const uniqueEvents = useMemo(
    () =>
      Array.from(
        new Set(safeApprovalDashboardData.map((item) => item.eventname))
      ),
    [safeApprovalDashboardData]
  );

  const availableTypes = useMemo(() => {
    const types = new Set(safeApprovalDashboardData.map((item) => item.type));
    const result = [];
    if (types.has('Individual')) result.push('Individual');
    if (types.has('Team')) result.push('Team');
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
      { header: 'Payment Status', width: isMobile ? 120 : 140, key: 'payment' },
      { header: 'Event Name', width: isMobile ? 160 : 200, key: 'event' },
    ];

    if (activeType === 'Team') {
      baseColumns.push({
        header: 'Team Name',
        width: isMobile ? 150 : 180,
        key: 'team_name',
      });
    }

    baseColumns.push({
      header: 'College',
      width: isMobile ? 150 : 200,
      key: 'college',
    });
    baseColumns.push({
      header: 'Gender',
      width: isMobile ? 80 : 100,
      key: 'gender',
    });
    baseColumns.push({
      header: activeType === 'Individual' ? 'Name' : 'Team Lead',
      width: isMobile ? 130 : 150,
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

    if (activeType === 'Team') {
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
      const teamsWithMembersData = filteredData.flatMap((team, index) =>
        (team.teammembers ?? []).map((member: any) => {
          const row: Record<string, any> = {
            'SL No.': index + 1,
            'Event Name': team.eventname,
            'Team Name': team.teamname || 'N/A',
            Name: member.name,
            Phone: member.phone,
            Email: member.email,
            College: team.college,
            'College Roll (For RCCIIT Students)': '',
            Attendance: '',
          };

          if (team.type === 'Individual') {
            delete row['Team Name'];
          }

          return row;
        })
      );
      setTeamsWithMembers(teamsWithMembersData);
    } else {
      setTeamsWithMembers([]);
    }
  }, [filteredData]);

  const Row = ({ index, style }: RowComponentProps) => {
    const item = filteredData[index];
    const eventId = eventsData?.find(
      (event) => event.name === item.eventname
    )?.id;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<
      'basic' | 'transaction'
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
                        className={`h-9 inline-flex items-center justify-center px-4 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm ${
                          item.paymentstatus === 'Verified'
                            ? 'bg-[#10B981]/10 text-[#10B981] ring-1 ring-[#10B981]/30 hover:bg-[#10B981]/20'
                            : 'bg-[#EF4444]/10 text-[#EF4444] ring-1 ring-[#EF4444]/30 hover:bg-[#EF4444]/20'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDialogOpen(true);
                        }}
                      >
                        {item.paymentstatus}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-white/10 text-white">
                      <p>Click to verify registration</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : column.key === 'event' ? (
                <span
                  className="text-white font-bold truncate group-hover:text-blue-400 transition-colors"
                  title={item.eventname}
                >
                  {item.eventname}
                </span>
              ) : column.key === 'team_name' ? (
                <span
                  className="text-gray-300 font-medium truncate"
                  title={item.teamname}
                >
                  {item.teamname}
                </span>
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
                    className={`w-1.5 h-1.5 rounded-full ${item.gender?.toLowerCase() === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}
                  />
                  <span className="text-gray-300 text-xs uppercase font-black tabular-nums">
                    {item.gender?.slice(0, 1) || '-'}
                  </span>
                </div>
              ) : column.key === 'lead' ? (
                <span
                  className="text-white font-semibold truncate"
                  title={item.teamlead}
                >
                  {item.teamlead}
                </span>
              ) : column.key === 'phone' ? (
                <span
                  className="text-gray-300 font-mono tracking-tighter"
                  title={item.teamleadphone}
                >
                  {item.teamleadphone}
                </span>
              ) : column.key === 'email' ? (
                <span
                  className="text-gray-400 truncate italic text-xs hover:text-white transition-colors"
                  title={item.teamleademail}
                >
                  {item.teamleademail}
                </span>
              ) : column.key === 'txn' ? (
                <span
                  className="font-mono text-[11px] text-gray-500 bg-white/[0.03] px-2 py-1 rounded border border-white/5 truncate"
                  title={item.transactionid}
                >
                  {item.transactionid || 'NO_TXN'}
                </span>
              ) : column.key === 'members' ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <TeamMembersDialog
                    members={item.teammembers}
                    teamID={item.team_id}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-gray-300 text-[11px] font-mono leading-none">
                    {item.registeredat?.split('T')[0]}
                  </span>
                  <span className="text-gray-600 text-[9px] font-mono leading-none">
                    {item.registeredat?.split('T')[1]?.slice(0, 5)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[800px] bg-[#050508]/95 border border-white/10 backdrop-blur-2xl rounded-3xl p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col h-[85vh] max-h-[900px]">
              {/* Modal Header */}
              <div className="p-8 pb-4">
                <DialogHeader>
                  <div className="flex items-center justify-between mb-2">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                      Registration Details
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-blue-500 font-black px-3 py-1 bg-blue-500/10 rounded-full">
                      {item.paymentstatus}
                    </span>
                  </div>
                </DialogHeader>

                {/* Modal Tabs */}
                <div className="flex gap-1 mt-8 p-1 bg-white/[0.03] rounded-2xl w-fit border border-white/5">
                  {(['basic', 'transaction'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveModalTab(tab)}
                      className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 relative ${
                        activeModalTab === tab
                          ? 'text-white'
                          : 'text-gray-500 hover:text-gray-400'
                      }`}
                    >
                      {activeModalTab === tab && (
                        <div className="absolute inset-0 bg-white/[0.05] rounded-xl ring-1 ring-white/10" />
                      )}
                      <span className="relative z-10">{tab} Info</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-8 pt-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {activeModalTab === 'basic' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        label: 'Event Name',
                        value: item.eventname,
                        icon: '🏆',
                      },
                      {
                        label: 'Registration Type',
                        value: item.type,
                        icon: '🔘',
                      },
                      {
                        label: 'Participant/Lead Name',
                        value: item.teamlead,
                        icon: '👤',
                      },
                      ...(item.teamname
                        ? [
                            {
                              label: 'Team Name',
                              value: item.teamname,
                              icon: '👥',
                            },
                          ]
                        : []),
                      { label: 'College', value: item.college, icon: '🏛️' },
                      {
                        label: 'Gender',
                        value: (item.gender || 'N/A').toUpperCase(),
                        icon: '🚻',
                      },
                      {
                        label: 'Phone Number',
                        value: item.teamleadphone,
                        icon: '📞',
                      },
                      {
                        label: 'Email Address',
                        value: item.teamleademail,
                        icon: '📧',
                      },
                      {
                        label: 'Registered On',
                        value: item.registeredat?.split('T')[0],
                        icon: '📅',
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
                        <p className="text-white font-medium pl-8">
                          {info.value}
                        </p>
                      </div>
                    ))}
                    {item.teammembers && item.teammembers.length > 0 && (
                      <div className="md:col-span-2 mt-4">
                        <h3 className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-4 ml-1">
                          Team Members
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {item.teammembers.map((member: any, i: number) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between"
                            >
                              <span className="text-sm font-semibold text-gray-200">
                                {member.name}
                              </span>
                              <span className="text-sm text-blue-400 font-mono">
                                {member.phone}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-2">
                          Account Holder
                        </label>
                        <p className="text-white font-bold">
                          {item.accountholdername || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 block mb-2">
                          Transaction ID
                        </label>
                        <p className="text-white font-mono">
                          {item.transactionid || 'NO_ID'}
                        </p>
                      </div>
                    </div>

                    <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                      {!item.transaction_screenshot ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-600">
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center text-3xl">
                            🖼️
                          </div>
                          <span className="text-sm font-bold uppercase tracking-widest">
                            No Screenshot Provided
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={
                            item.transaction_screenshot || '/placeholder.svg'
                          }
                          alt="Transaction Screenshot"
                          layout="responsive"
                          loading="lazy"
                          width={800}
                          height={1200}
                          objectFit="contain"
                          className="hover:scale-105 transition-transform duration-700"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                {isAdmin && !isFaculty && (
                  <div className="flex items-center gap-4">
                    <Button
                      className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all border-0 ring-1 ring-white/20"
                      onClick={async () => {
                        try {
                          const eventCoordinators = eventsData?.find(
                            (event: events) => event.name === item.eventname
                          )?.coordinators;
                          await approveRegistration(item.team_id);
                          const emailData = {
                            eventName: item.eventname,
                            year: '2026',
                            festName: 'Game of Thrones',
                            teamName: item.teamname,
                            leaderName: item.teamlead,
                            leaderPhone: item.teamleadphone,
                            email: item.teamleademail,
                            whatsappLink: whatsAppLinks?.find(
                              (link) => link.event_id === eventId
                            )?.link,
                            teamMembers: item.teammembers,
                            coordinators: eventCoordinators,
                            contactEmail: 'rcciit.got.official@gmail.com',
                            logoUrl: 'https://i.postimg.cc/Gtpt62ST/got.jpg',
                          };
                          await fetch('/api/sendMail', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to: [
                                item.teamleademail,
                                ...item.teammembers.map(
                                  (member: any) => member.email
                                ),
                              ],
                              subject: `🎉 Registration Confirmed: ${item.eventname} - GAME OF THRONES 2026`,
                              fileName: 'verify-email.ejs',
                              data: emailData,
                            }),
                          });
                          refreshData();
                          toast.success('Registration Approved Successfully');
                          setIsDialogOpen(false);
                        } catch (error) {
                          toast.error('Failed to approve registration');
                        }
                      }}
                    >
                      {item.paymentstatus === 'Verified'
                        ? 'Approve Again'
                        : 'Verify & Approve'}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
                {(!isAdmin || isFaculty) && (
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

  if (approvalDashboardLoading) return <TableSkeleton />;

  // const [showNext, setShowNext] = useState(true);

  // useEffect(()=>{
  //   if(showNext){
  //     getApprovalDashboardData(0, 1000);
  //   }else  {
  //     getApprovalDashboardData(1000,2000);
  //   }
  // },[showNext])

  const canDownloadCsv = teamsWithMembers.length > 0;

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

        <div className="flex justify-end lg:w-auto">
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
              Payment
            </label>
            <Filter
              options={['Verified', 'Not Verified']}
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
