'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRequests } from '@/lib/stores/requests';
import { EventDetail, RoleRequest } from '@/lib/types/requests';
import { getEventDetailsForRequest } from '@/utils/functions/requestsUtils';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Eye,
  Loader2,
  Mail,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ApproveRequestsPage() {
  const {
    requests,
    requestsLoading,
    getRequests,
    approveEvent,
    approveSuperAdmin,
    rejectRequest,
  } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(
    null
  );
  const [eventDetails, setEventDetails] = useState<EventDetail[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [processingEventId, setProcessingEventId] = useState<string | null>(
    null
  );

  useEffect(() => {
    getRequests();
  }, [getRequests]);

  const handleViewEvents = async (request: RoleRequest) => {
    setSelectedRequest(request);

    if (request.event_ids && request.event_ids.length > 0) {
      setLoadingEvents(true);
      const events = await getEventDetailsForRequest(request.event_ids);
      setEventDetails(events || []);
      setLoadingEvents(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    if (!selectedRequest) return;

    setProcessingEventId(eventId);

    // Get current event_ids from selectedRequest
    const currentEventIds = selectedRequest.event_ids || [];

    const success = await approveEvent(
      selectedRequest.id,
      selectedRequest.user_id,
      selectedRequest.role,
      eventId,
      selectedRequest.event_category_id,
      selectedRequest.fest_id,
      currentEventIds
    );

    if (success) {
      // Calculate updated event_ids
      const updatedEventIds = currentEventIds.filter((id) => id !== eventId);

      // Update event details list for UI
      const updatedEvents = eventDetails.filter((e) => e.id !== eventId);
      setEventDetails(updatedEvents);

      // Update selectedRequest with new event_ids
      setSelectedRequest({
        ...selectedRequest,
        event_ids: updatedEventIds,
      });

      // Close modal if no events left
      if (updatedEvents.length === 0) {
        setSelectedRequest(null);
      }
    }

    setProcessingEventId(null);
  };

  const handleApproveFacultyOrSuperAdmin = async (request: RoleRequest) => {
    const success = await approveSuperAdmin(
      request.id,
      request.user_id,
      request.role,
      request.fest_id || null, // Pass fest_id
      request.event_category_id || null
    );

    if (success) {
      // Requests list will auto-refresh
    }
  };

  const handleReject = async (requestId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to reject this request? This action cannot be undone.'
    );

    if (confirmed) {
      await rejectRequest(requestId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400';
      case 'convenor':
        return 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400';
      case 'coordinator':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400';
      case 'faculty':
        return 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400';
      case 'graphics':
        return 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400';
      default:
        return 'from-zinc-500/20 to-gray-500/20 border-zinc-500/30 text-zinc-400';
    }
  };

  if (requestsLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] p-6">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Role Requests Approval
          </h1>
          <p className="text-zinc-400">
            Review and approve role requests from users
          </p>
        </div>

        {/* Requests Table */}
        {requests.length === 0 ? (
          <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-12 text-center">
            <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Pending Requests
            </h3>
            <p className="text-zinc-400">
              All role requests have been processed
            </p>
          </div>
        ) : (
          <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      User
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Role
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Fest
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Category
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Events
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Requested
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {request.user_name}
                            </p>
                            <p className="text-sm text-zinc-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {request.requester_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border bg-gradient-to-r ${getRoleBadgeColor(
                            request.role
                          )}`}
                        >
                          <Shield className="w-4 h-4" />
                          {request.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-white">{request.fest_name}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white">{request.category_name}</p>
                      </td>
                      <td className="p-4">
                        {request.event_ids && request.event_ids.length > 0 ? (
                          <span className="text-violet-400 font-medium">
                            {request.event_ids.length} event(s)
                          </span>
                        ) : (
                          <span className="text-zinc-500">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(request.created_at)}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {request.role === 'super_admin' ||
                          request.role === 'faculty' ||
                          request.role === 'graphics' ? (
                            <Button
                              onClick={() =>
                                handleApproveFacultyOrSuperAdmin(request)
                              }
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 border-0"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleViewEvents(request)}
                              size="sm"
                              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 border-0"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Events
                            </Button>
                          )}
                          <Button
                            onClick={() => handleReject(request.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Events Approval Modal */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="bg-[#0a0a0f] border-white/[0.06] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Approve Events for {selectedRequest?.user_name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Approve individual events for this{' '}
              {selectedRequest?.role.replace('_', ' ')} role request
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {loadingEvents ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-2" />
                <p className="text-zinc-400">Loading events...</p>
              </div>
            ) : eventDetails.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">No events to approve</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {eventDetails.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div>
                      <h4 className="text-white font-medium">{event.name}</h4>
                      <p className="text-sm text-zinc-400">
                        Event ID: {event.id.slice(0, 8)}...
                      </p>
                    </div>
                    <Button
                      onClick={() => handleApproveEvent(event.id)}
                      disabled={processingEventId === event.id}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 border-0 disabled:opacity-50"
                    >
                      {processingEventId === event.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
