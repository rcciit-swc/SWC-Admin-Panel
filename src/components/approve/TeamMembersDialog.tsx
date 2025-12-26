'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamMember } from '@/lib/types/events';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  User,
  Phone,
  Mail,
  Building,
  X,
  UserCheck,
  UserCircle,
  Edit,
} from 'lucide-react';
import { EditTeamMemberDialog } from './EditTeamMemberDialog';
import { supabase } from '@/utils/functions/supabase-client';

export function TeamMembersDialog({
  members,
  teamID,
}: {
  members: TeamMember[];
  teamID: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(members);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const memberVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleSaveMember = async (
    updatedMember: TeamMember,
    teamID: string
  ): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .update({
          team_id: teamID,
          name: updatedMember.name,
          email: updatedMember.email,
          phone: updatedMember.phone,
        })
        .eq('team_id', teamID)
        .eq('email', updatedMember.email);
    } catch (error) {
      toast.error('Failed to save member details. Please try again.');
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingMember(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/15 hover:border-violet-400/30 text-violet-200 transition-colors"
          >
            <Users className="w-4 h-4 mr-2 text-violet-300" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] bg-[#0a0a0f] border border-white/6 rounded-xl p-4 sm:p-6 shadow-xl overflow-hidden">
          <DialogHeader className="relative z-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <UserCheck size={28} className="text-violet-300" />
              <Users size={28} className="text-violet-300" />
              <UserCircle size={28} className="text-violet-300" />
            </motion.div>
            <DialogTitle className="text-center text-white font-semibold text-2xl tracking-tight">
              Team Members
            </DialogTitle>
            <div className="h-px w-full bg-white/6 mt-4" />
          </DialogHeader>

          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-y-auto overflow-x-hidden max-h-[65vh] relative z-10 mt-6 pr-2"
          >
            {teamMembers && teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={memberVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative bg-[#12121a] border border-white/6 p-6 rounded-xl hover:border-violet-500/20 transition-colors group"
                  >
                    {/* Edit button */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        onClick={() => handleEditMember(member)}
                        variant="ghost"
                        className="h-8 w-8 p-0 flex items-center justify-center rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-300"
                      >
                        <Edit size={16} />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full p-0.5 bg-violet-500/30">
                          <div className="bg-[#0a0a0f] rounded-full p-2">
                            <User size={22} className="text-violet-300" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-500">Name</p>
                          <p className="font-medium text-white">
                            {member.name}
                          </p>
                        </div>
                      </div>

                      <div className="pl-12 grid gap-4">
                        <div className="flex items-center gap-3">
                          <Mail size={18} className="text-zinc-400" />
                          <div>
                            <p className="text-sm text-zinc-500">Email</p>
                            <p className="font-medium text-white break-all">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone size={18} className="text-zinc-400" />
                          <div>
                            <p className="text-sm text-zinc-500">Phone</p>
                            <p className="font-medium text-white">
                              {member.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-violet-500/10 rounded-full">
                    <Users size={48} className="text-violet-300/50" />
                  </div>
                </div>
                <p className="text-zinc-400 text-lg">No team members found</p>
              </div>
            )}
          </motion.div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 px-6 py-2 rounded-md z-10"
            >
              <X size={18} />
              <span>Close</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Member Dialog */}
      {editingMember && (
        <EditTeamMemberDialog
          isOpen={isEditDialogOpen}
          teamID={teamID}
          onClose={handleCloseEditDialog}
          member={editingMember}
          onSave={handleSaveMember}
        />
      )}
    </>
  );
}
