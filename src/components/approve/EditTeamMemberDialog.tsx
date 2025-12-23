'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Phone,
  Mail,
  Building,
  Check,
  X,
  Save,
  PartyPopper,
  Edit,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeamMember } from '@/lib/types/events';

interface EditTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamID: string;
  member: TeamMember;
  onSave: (updatedMember: TeamMember, teamID: string) => Promise<void>;
}

// Schema for team member details.
const memberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10,}$/, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email'),
});
type MemberFormValues = z.infer<typeof memberSchema>;

export function EditTeamMemberDialog({
  isOpen,
  onClose,
  member,
  teamID,
  onSave,
}: EditTeamMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form for team member details.
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name || '',
      phone: member?.phone || '',
      email: member?.email || '',
    },
  });

  const triggerConfetti = () => {
    // Create confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7c3aed', '#4f46e5', '#a78bfa'],
    });
  };

  const onSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true);
    try {
      // Create updated member object
      const updatedMember: TeamMember = {
        ...member,
        ...data,
      };

      // Call the save function passed as prop
      await onSave(updatedMember, teamID);

      toast.success('Team member updated successfully');
      setIsSubmitting(false);
      setShowSuccess(true);
      triggerConfetti();

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to update team member:', error);
      toast.error('Failed to update team member. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes or when member data changes
  useEffect(() => {
    if (isOpen && member) {
      reset({
        name: member.name,
        phone: member.phone,
        email: member.email,
      });
    }

    if (!isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen, member, reset]);

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-[#0a0a0f] border border-white/6 rounded-xl p-6 shadow-xl overflow-hidden">
        <DialogHeader className="relative z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Edit size={28} className="text-violet-300" />
            <User size={28} className="text-violet-300" />
            <PartyPopper size={28} className="text-violet-300" />
          </motion.div>
          <DialogTitle className="text-center text-white text-2xl font-semibold tracking-tight">
            Edit Team Member
          </DialogTitle>
          <div className="h-px w-full bg-white/6 mt-4" />
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <Check size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Changes Saved!
              </h2>
              <p className="text-gray-300 text-center mb-4">
                Team member information has been updated successfully
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="editForm"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit(onSubmit)}
              className="overflow-y-auto overflow-x-hidden max-h-[65vh] relative z-10 mt-4 pr-2"
            >
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-zinc-300 font-medium"
                  >
                    <User size={18} />
                    <span>Name</span>
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      autoFocus
                      {...register('name')}
                      className="w-full bg-[#1F2937] border border-white/10 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/30 focus:outline-none text-white rounded-md p-3 pl-10 transition-colors"
                      placeholder="Enter member name"
                    />
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-sm ml-2">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-zinc-300 font-medium"
                  >
                    <Phone size={18} />
                    <span>Phone</span>
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="w-full bg-[#1F2937] border border-white/10 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/30 focus:outline-none text-white rounded-md p-3 pl-10 transition-colors"
                      placeholder="Enter phone number"
                    />
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-sm ml-2">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-zinc-300 font-medium"
                  >
                    <Mail size={18} />
                    <span>Email</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="w-full bg-[#1F2937] border border-white/10 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/30 focus:outline-none text-white rounded-md p-3 pl-10 transition-colors"
                      placeholder="Enter email"
                    />
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm ml-2">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 px-4 py-2 rounded-md"
                  disabled={isSubmitting}
                >
                  <X size={18} />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  className="bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500 border-0 font-medium flex items-center gap-2 px-6 py-2 rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
