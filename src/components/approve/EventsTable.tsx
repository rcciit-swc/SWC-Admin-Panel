'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { List, type RowComponentProps } from 'react-window';
import { CSVLink } from 'react-csv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { EventData, events } from '@/lib/types/events';
import TableSkeleton from './TableSkeleton';
import { useEvents } from '@/lib/stores/events';
import { toast } from 'sonner';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TeamMembersDialog } from './TeamMembersDialog';
import { approveRegistration } from '@/utils/functions/register-services';
import { Filter } from './EventFilters';
import { getRoles } from '@/utils/functions';
import { dateTime } from '@/utils/functions/dateUtils';
import { whatsAppLinks } from '@/utils/constraints/constants/whatsApp';

// Optimized column widths: SL, Payment, Event, Type, Team, College, Lead, Phone, Email, TxnID, Members, Date
const COLUMN_WIDTHS = [
  70, 140, 200, 120, 180, 200, 150, 130, 220, 180, 100, 180,
];
const TABLE_WIDTH = COLUMN_WIDTHS.reduce((a, b) => a + b, 0);

export default function EventsTable() {
  const festId = 'a4bc08e4-9af9-4212-8d32-cd88d2437f18';
  const [searchQuery, setSearchQuery] = useState('');
  const [rolesData, setRolesData] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [swcPaid, setSwcPaid] = useState(0);
  const [swcNotPaid, setSwcNotPaid] = useState(0);
  const [collegeFilter, setCollegeFilter] = useState('');
  const [registeredAtFilter, setRegisteredAtFilter] = useState('');
  const {
    eventsData,
    approvalDashboardLoading,
    approvalDashboardData,
    getApprovalDashboardData,
  } = useEvents();

  const safeApprovalDashboardData = useMemo(
    () => (Array.isArray(approvalDashboardData) ? approvalDashboardData : []),
    [approvalDashboardData]
  );

  const refreshData = async () => {
    getApprovalDashboardData(0, 1000);
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
      const typeMatch = !typeFilter || item.type === typeFilter;
      const collegeMatch = !collegeFilter || item.college === collegeFilter;

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
        registeredAtMatch
      );
    });
  }, [
    safeApprovalDashboardData,
    searchQuery,
    paymentStatusFilter,
    eventFilter,
    typeFilter,
    collegeFilter,
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

  const uniqueEvents = useMemo(
    () =>
      Array.from(
        new Set(safeApprovalDashboardData.map((item) => item.eventname))
      ),
    [safeApprovalDashboardData]
  );
  const uniqueTypes = useMemo(
    () =>
      Array.from(new Set(safeApprovalDashboardData.map((item) => item.type))),
    [safeApprovalDashboardData]
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
    setTypeFilter('');
    setCollegeFilter('');
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
  console.log(approvalDashboardData);

  const Row = ({ index, style }: RowComponentProps) => {
    const item = filteredData[index];
    const eventId = eventsData?.find(
      (event) => event.name === item.eventname
    )?.id;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    if (!item) return <div style={style} />;
    return (
      <div
        style={{ ...style, width: TABLE_WIDTH }}
        className="flex items-center border-b border-gray-800 hover:bg-[#131926] transition-colors text-sm md:text-base"
      >
        {COLUMN_WIDTHS.map((width, colIndex) => (
          <div
            key={colIndex}
            className="p-2 md:p-4 flex-none text-gray-100 overflow-hidden"
            style={{ width: width }}
          >
            {colIndex === 0 ? (
              <span className="truncate block">{item.serial_no}</span>
            ) : colIndex === 1 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={`min-w-[110px] inline-flex items-center justify-center px-2 py-1 rounded-md font-medium cursor-pointer whitespace-nowrap text-xs md:text-sm ${
                        item.paymentstatus === 'Verified'
                          ? 'bg-[#132F21] text-[#4ADE80] border border-[#4ADE80]/20'
                          : 'bg-[#2A1215] text-[#F87171] border border-[#F87171]/20'
                      }`}
                      onClick={() => setIsDialogOpen(true)}
                    >
                      {item.paymentstatus}
                    </button>
                  </TooltipTrigger>
                  {item.paymentstatus === 'Not Verified' && (
                    <TooltipContent>
                      <p>Click to see screenshot</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ) : colIndex === 2 ? (
              <span className="truncate block" title={item.eventname}>
                {item.eventname}
              </span>
            ) : colIndex === 3 ? (
              <span className="min-w-[100px] inline-flex items-center justify-center px-2 py-1 rounded-md bg-[#1F2937] text-gray-300 whitespace-nowrap text-xs md:text-sm">
                {item.type}
              </span>
            ) : colIndex === 4 ? (
              <span className="truncate block" title={item.teamname}>
                {item.teamname}
              </span>
            ) : colIndex === 5 ? (
              <span className="truncate block" title={item.college}>
                {item.college}
              </span>
            ) : colIndex === 6 ? (
              <span className="truncate block" title={item.teamlead}>
                {item.teamlead}
              </span>
            ) : colIndex === 7 ? (
              <span className="truncate block" title={item.teamleadphone}>
                {item.teamleadphone}
              </span>
            ) : colIndex === 8 ? (
              <span className="truncate block" title={item.teamleademail}>
                {item.teamleademail}
              </span>
            ) : colIndex === 9 ? (
              <span
                className="font-mono text-gray-300 truncate block"
                title={item.transactionid}
              >
                {item.transactionid}
              </span>
            ) : colIndex === 10 ? (
              <div className="min-w-75">
                <TeamMembersDialog
                  members={item.teammembers}
                  teamID={item.team_id}
                />
              </div>
            ) : (
              <span className="text-gray-400 truncate block">
                {item.registeredat?.split('T')[0]}
              </span>
            )}
          </div>
        ))}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[900px] bg-[#0a0a0f] border border-white/6 rounded-xl p-6 shadow-xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-semibold tracking-tight">
                Transaction Screenshot
              </DialogTitle>
              <div className="h-px w-full bg-white/6" />
            </DialogHeader>

            <div className="max-h-[65vh] overflow-y-auto overflow-x-hidden mt-4">
              {!item.transaction_screenshot ? (
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 font-medium py-10">
                  No screenshot available.
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/6 bg-[#050508]">
                  <Image
                    src={item.transaction_screenshot || '/placeholder.svg'}
                    alt="Transaction Screenshot"
                    layout="responsive"
                    loading="lazy"
                    width={800}
                    height={600}
                    objectFit="contain"
                  />
                </div>
              )}

              {isAdmin && !isFaculty && (
                <div className="flex flex-row items-center justify-end gap-3 mt-6">
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white"
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
                        const emailResponse = await fetch('/api/sendMail', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
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
                        toast.success('Payment Accepted Successfully');
                        setIsDialogOpen(false);
                      } catch (error) {
                        toast.error('Error in accepting the payment');
                      }
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    onClick={() => {
                      setIsDialogOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Input
              type="text"
              placeholder="Search by event name, phone, team lead, email, college, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 py-3 bg-[#1F2937] text-gray-100 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            className="bg-[#1F2937] border-gray-700 hover:bg-[#2D3748] hover:text-white text-gray-300"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-end">
          {canDownloadCsv ? (
            <Button
              asChild
              className="w-fit-content rounded-md px-4 py-2 tracking-wider bg-regalia text-sm lg:text-lg font-semibold font-kagitingan border-yellow-200 text-white hover:border-regalia hover:text-regalia hover:bg-black border"
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
              className="w-fit-content rounded-md px-4 py-2 tracking-wider bg-regalia text-sm lg:text-lg font-semibold font-kagitingan border-yellow-200 text-white border opacity-60 cursor-not-allowed"
            >
              Download CSV
            </Button>
          )}
        </div>
      </div>
      {/* <Button onClick={()=>{
        setShowNext(!showNext)
      }} className="w-fit-content rounded-md px-4 py-2 tracking-wider bg-regalia text-sm lg:text-lg font-semibold font-kagitingan border-yellow-200 text-white hover:border-regalia hover:text-regalia hover:bg-black border">
        {!showNext  ? "Back" : "Next"}
      </Button> */}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Filter
          options={['Verified', 'Not Verified']}
          value={paymentStatusFilter}
          onChange={setPaymentStatusFilter}
          placeholder="Payment Status"
        />
        <Filter
          options={uniqueEvents}
          value={eventFilter}
          onChange={setEventFilter}
          placeholder="Event"
        />
        <Filter
          options={uniqueTypes}
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="Type"
        />
        <Filter
          options={uniqueColleges}
          value={collegeFilter}
          onChange={setCollegeFilter}
          placeholder="College"
        />
        <Filter
          options={['Last 24 hours', 'Last 7 days', 'Last 30 days']}
          value={registeredAtFilter}
          onChange={setRegisteredAtFilter}
          placeholder="Registered At"
        />
        <Button
          onClick={clearAllFilters}
          variant="outline"
          disabled={
            !searchQuery &&
            !paymentStatusFilter &&
            !eventFilter &&
            !typeFilter &&
            !collegeFilter &&
            !registeredAtFilter
          }
          className="bg-[#1F2937] border-gray-700 hover:bg-[#2D3748] hover:text-white text-gray-300 disabled:cursor-not-allowed"
        >
          Clear All Filters
        </Button>
      </div>

      <div
        className="overflow-x-auto border border-gray-800 rounded-lg bg-[#0B0F17] -mx-6 md:mx-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ width: TABLE_WIDTH }} className="min-w-full">
          <div className="sticky top-0 z-10 flex items-center font-bold border-b border-gray-800 bg-[#0B0F17] text-xs md:text-sm">
            {[
              'SL No.',
              'Payment Status',
              'Event Name',
              'Type',
              'Team Name',
              'College',
              'Team Lead',
              'Phone',
              'Email',
              'Transaction ID',
              'Members',
              'Registered At',
            ].map((header, index) => (
              <div
                key={index}
                className="p-2 md:p-4 flex-none text-gray-100"
                style={{ width: COLUMN_WIDTHS[index] }}
              >
                {header}
              </div>
            ))}
          </div>
          <div className="overflow-hidden" style={{ height: 600 }}>
            <List
              style={{ height: 600, width: TABLE_WIDTH, overflowX: 'hidden' }}
              defaultHeight={600}
              rowCount={filteredData.length}
              rowHeight={50}
              rowProps={{}}
              rowComponent={Row}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
