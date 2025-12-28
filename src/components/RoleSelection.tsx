'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Image as ImageIcon,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Role {
  role: string;
  event_category_id?: string | null;
  event_id?: string | null;
}

interface RoleSelectionProps {
  roles: Role[];
}

export default function RoleSelection({ roles }: RoleSelectionProps) {
  const router = useRouter();

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'super_admin':
        return {
          name: 'Super Admin',
          description: 'Full access to all features',
          icon: Crown,
          color: 'from-red-500/20 to-orange-500/20 border-red-500/30',
          iconColor: 'text-red-400',
          route: '/admin',
        };
      case 'faculty':
        return {
          name: 'Faculty',
          description: 'View and approve registrations',
          icon: ShieldCheck,
          color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
          iconColor: 'text-emerald-400',
          route: '/approve',
        };
      case 'graphics':
        return {
          name: 'Graphics',
          description: 'View team members for design',
          icon: ImageIcon,
          color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
          iconColor: 'text-pink-400',
          route: '/graphics',
        };
      case 'coordinator':
        return {
          name: 'Event Coordinator',
          description: 'Manage event registrations',
          icon: UserCheck,
          color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
          iconColor: 'text-blue-400',
          route: '/admin',
        };
      case 'convenor':
        return {
          name: 'Event Convenor',
          description: 'Oversee event categories',
          icon: Users,
          color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
          iconColor: 'text-violet-400',
          route: '/admin',
        };
      case 'volunteer':
        return {
          name: 'Volunteer',
          description: 'Support event management',
          icon: Users,
          color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
          iconColor: 'text-indigo-400',
          route: '/admin',
        };
      default:
        return {
          name: role,
          description: 'Access granted',
          icon: ShieldCheck,
          color: 'from-zinc-500/20 to-gray-500/20 border-zinc-500/30',
          iconColor: 'text-zinc-400',
          route: '/admin',
        };
    }
  };

  // Get unique roles
  const uniqueRoles = Array.from(new Set(roles.map((r) => r.role)));

  const handleRoleSelect = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl w-full"
      >
        <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-4 mx-auto">
              <ShieldCheck className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Select Your Role
            </h1>
            <p className="text-zinc-400">
              You have multiple roles. Choose which one to use
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {uniqueRoles.map((roleId) => {
              const config = getRoleConfig(roleId);
              const Icon = config.icon;

              return (
                <motion.button
                  key={roleId}
                  onClick={() => handleRoleSelect(config.route)}
                  className={`p-6 rounded-xl border bg-gradient-to-r ${config.color} hover:scale-[1.02] transition-all text-left`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-white mb-1">
                        {config.name}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {config.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Info */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 text-center">
            <p className="text-sm text-violet-300">
              You can switch between roles anytime from your dashboard
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
