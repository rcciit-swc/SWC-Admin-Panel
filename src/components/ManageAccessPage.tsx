'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2,
  User,
  Mail,
  Shield,
  Calendar,
  Loader2,
  UserX,
  Trophy,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoles } from '@/lib/stores/roles';
import { UserRole } from '@/lib/types/roles';

export default function ManageAccessPage() {
  const { userRoles, rolesLoading, getUserRoles, removeRole, removeAllRoles } =
    useRoles();
  const [processingRole, setProcessingRole] = useState<string | null>(null);

  useEffect(() => {
    getUserRoles();
  }, [getUserRoles]);

  const handleRemoveRole = async (userId: string, roleId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this role? This action cannot be undone.'
    );

    if (confirmed) {
      setProcessingRole(`${userId}-${roleId}`);
      await removeRole(userId, roleId);
      setProcessingRole(null);
    }
  };

  const handleRemoveAllRoles = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ALL roles for ${userName}? This action cannot be undone.`
    );

    if (confirmed) {
      setProcessingRole(`all-${userId}`);
      await removeAllRoles(userId);
      setProcessingRole(null);
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
      case 'security':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400';
      default:
        return 'from-zinc-500/20 to-gray-500/20 border-zinc-500/30 text-zinc-400';
    }
  };

  // Group roles by user
  const groupedRoles = userRoles.reduce(
    (acc, role) => {
      if (!acc[role.user_id]) {
        acc[role.user_id] = {
          user_name: role.user_name,
          user_email: role.user_email,
          roles: [],
        };
      }
      acc[role.user_id].roles.push(role);
      return acc;
    },
    {} as Record<
      string,
      { user_name?: string; user_email?: string; roles: UserRole[] }
    >
  );

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading user roles...</p>
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
            Manage User Access
          </h1>
          <p className="text-zinc-400">
            View and manage all user roles and permissions
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="w-4 h-4" />
              <span>{Object.keys(groupedRoles).length} Users</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Shield className="w-4 h-4" />
              <span>{userRoles.length} Total Roles</span>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        {userRoles.length === 0 ? (
          <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-12 text-center">
            <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No User Roles
            </h3>
            <p className="text-zinc-400">
              No users have been assigned any roles yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRoles).map(([userId, userData]) => (
              <motion.div
                key={userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] overflow-hidden"
              >
                {/* User Header */}
                <div className="p-6 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {userData.user_name}
                        </h3>
                        <p className="text-sm text-zinc-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {userData.user_email}
                        </p>
                      </div>
                      <div className="ml-4 px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <span className="text-sm text-violet-400 font-medium">
                          {userData.roles.length} role(s)
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        handleRemoveAllRoles(
                          userId,
                          userData.user_name || 'User'
                        )
                      }
                      disabled={processingRole === `all-${userId}`}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {processingRole === `all-${userId}` ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 mr-1" />
                          Remove All Access
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Roles Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
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
                          Event
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-zinc-400">
                          Granted On
                        </th>
                        <th className="text-right p-4 text-sm font-medium text-zinc-400">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.roles.map((role) => (
                        <tr
                          key={role.id}
                          className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border bg-gradient-to-r ${getRoleBadgeColor(
                                role.role
                              )}`}
                            >
                              <Shield className="w-4 h-4" />
                              {role.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-white">
                              <Trophy className="w-4 h-4 text-zinc-400" />
                              {role.fest_name}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-white">
                              <Layers className="w-4 h-4 text-zinc-400" />
                              {role.category_name}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-white">{role.event_name}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-zinc-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(role.created_at)}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end">
                              <Button
                                onClick={() =>
                                  handleRemoveRole(role.user_id, role.id)
                                }
                                disabled={
                                  processingRole ===
                                  `${role.user_id}-${role.id}`
                                }
                                size="sm"
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              >
                                {processingRole ===
                                `${role.user_id}-${role.id}` ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
