'use client';

import { Button } from '@/components/ui/button';
import { useFests } from '@/lib/stores/fests';
import { supabase } from '@/lib/supabase/client';
import { logout } from '@/utils/functions/logout';
import { requestRole, RoleRequestData } from '@/utils/functions/roleUtils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RequestAccessScreenProps {
  hasPendingRequest?: boolean;
}

export default function RequestAccessScreen({
  hasPendingRequest = false,
}: RequestAccessScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedFest, setSelectedFest] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]); // Changed to array for multi-select
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(hasPendingRequest);
  const [existingRoles, setExistingRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Zustand store
  const {
    fests,
    categories,
    events,
    festsLoading,
    categoriesLoading,
    eventsLoading,
    getFests,
    getCategoriesByFest,
    getEventsByCategory,
    resetCategories,
    resetEvents,
  } = useFests();

  // Fetch user's existing roles
  useEffect(() => {
    const fetchExistingRoles = async () => {
      setLoadingRoles(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: roles, error } = await supabase
            .from('roles')
            .select('*')
            .eq('user_id', user.id);

          if (!error && roles) {
            setExistingRoles(roles);
          }
        }
      } catch (error) {
        console.error('Error fetching existing roles:', error);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchExistingRoles();
  }, []);

  // Load fests on mount
  useEffect(() => {
    getFests();
  }, [getFests]);

  // Load categories when fest is selected
  useEffect(() => {
    if (selectedFest) {
      getCategoriesByFest(selectedFest);
    } else {
      resetCategories();
    }
  }, [selectedFest, getCategoriesByFest, resetCategories]);

  // Load events when category is selected
  useEffect(() => {
    if (selectedCategory) {
      getEventsByCategory(selectedCategory);
    } else {
      resetEvents();
    }
  }, [selectedCategory, getEventsByCategory, resetEvents]);

  const availableRoles = [
    {
      id: 'coordinator',
      name: 'Event Coordinator',
      description: 'Manage specific events and registrations',
      icon: UserPlus,
      requiresEvent: true,
    },
    {
      id: 'convenor',
      name: 'Event Convenor',
      description: 'Oversee event categories and coordinators',
      icon: ShieldCheck,
      requiresEvent: true,
    },
    {
      id: 'faculty',
      name: 'Faculty',
      description: 'View and approve registrations',
      icon: ShieldCheck,
      requiresEvent: false,
      requiresFestAndCategory: true,
    },
    {
      id: 'graphics',
      name: 'Graphics',
      description: 'View team members for graphics design',
      icon: ShieldCheck,
      requiresEvent: false,
      requiresFestAndCategory: false,
      requiresFest: true,
    },
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full access to all features and settings',
      icon: Crown,
      requiresEvent: false,
    },
  ];

  // Check if a role is already assigned
  const isRoleAssigned = (roleId: string): boolean => {
    return existingRoles.some((role) => role.role === roleId);
  };

  // Get assigned event IDs for a user
  const getAssignedEventIds = (): string[] => {
    return existingRoles
      .filter((role) => role.event_id !== null)
      .map((role) => role.event_id);
  };

  const handleSubmitRequest = async () => {
    if (!selectedRole) {
      return;
    }

    const selectedRoleData = availableRoles.find((r) => r.id === selectedRole);

    // Validate based on role requirements
    if (
      selectedRoleData?.requiresEvent &&
      (!selectedFest || !selectedCategory || selectedEvents.length === 0)
    ) {
      return;
    }

    // Validate faculty and graphics role requirements
    if (
      selectedRoleData?.requiresFestAndCategory &&
      (!selectedFest || !selectedCategory)
    ) {
      return;
    }

    // Validate graphics role requirements (fest only)
    if (selectedRoleData?.requiresFest && !selectedFest) {
      return;
    }

    setIsSubmitting(true);

    const requestData: RoleRequestData = {
      role: selectedRole,
    };

    // Only add fest, category and events if role requires it
    if (selectedRoleData?.requiresEvent) {
      requestData.fest_id = selectedFest;
      requestData.event_ids = selectedEvents; // Array of event IDs
      requestData.event_category_id = selectedCategory;
    }

    // For faculty add fest and category (graphics only fest now handled separately)
    if (selectedRoleData?.requiresFestAndCategory) {
      requestData.fest_id = selectedFest;
      requestData.event_category_id = selectedCategory;
    }

    // For graphics (fest only)
    if (selectedRoleData?.requiresFest) {
      requestData.fest_id = selectedFest;
    }

    const success = await requestRole(requestData);
    setIsSubmitting(false);

    if (success) {
      setRequestSubmitted(true);
    }
  };

  const handleNext = () => {
    const selectedRoleData = availableRoles.find((r) => r.id === selectedRole);

    if (currentStep === 1 && selectedRole) {
      // If super_admin is selected, skip to final step
      if (
        !selectedRoleData?.requiresEvent &&
        !selectedRoleData?.requiresFestAndCategory &&
        !selectedRoleData?.requiresFest
      ) {
        setCurrentStep(5);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2 && selectedFest) {
      // If graphics role, skip to final step after fest selection
      if (selectedRoleData?.requiresFest) {
        setCurrentStep(5);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 3 && selectedCategory) {
      // If faculty role, skip to final step after category selection
      if (selectedRoleData?.requiresFestAndCategory) {
        setCurrentStep(5);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 4 && selectedEvents.length > 0) {
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    const selectedRoleData = availableRoles.find((r) => r.id === selectedRole);

    if (
      currentStep === 5 &&
      !selectedRoleData?.requiresFestAndCategory &&
      !selectedRoleData?.requiresFest
    ) {
      // If super_admin, go back to step 1
      setCurrentStep(1);
    } else if (currentStep === 5 && selectedRoleData?.requiresFest) {
      // If graphics, go back to step 2 (fest selection)
      setCurrentStep(2);
    } else if (currentStep === 5 && selectedRoleData?.requiresFestAndCategory) {
      // If faculty, go back to step 3 (category selection)
      setCurrentStep(3);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return !!selectedRole;
    if (currentStep === 2) return !!selectedFest;
    if (currentStep === 3) return !!selectedCategory;
    if (currentStep === 4) return selectedEvents.length > 0; // At least one event selected
    return false;
  };

  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-md w-full"
        >
          <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-6 mx-auto">
              <Clock className="w-8 h-8 text-violet-400" />
            </div>

            <h2 className="text-2xl font-semibold text-white mb-3">
              Request Submitted
            </h2>
            <p className="text-zinc-400 mb-6">
              Your role request has been submitted successfully. An
              administrator will review your request and grant access soon.
            </p>

            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-violet-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>You'll receive access once approved</span>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5"
            >
              Logout
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl w-full"
      >
        <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-4 mx-auto">
              <ShieldCheck className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Request Access
            </h1>
            <p className="text-zinc-400">
              Complete the steps below to request access
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 overflow-x-auto px-2">
            {[1, 2, 3, 4, 5].map((step) => {
              const selectedRoleData = availableRoles.find(
                (r) => r.id === selectedRole
              );
              const shouldShow =
                selectedRoleData?.requiresEvent ||
                selectedRoleData?.requiresFestAndCategory ||
                (selectedRoleData?.requiresFest &&
                  (step === 1 || step === 2 || step === 5)) ||
                step === 1 ||
                step === 5;

              // For faculty role, hide step 4 (event selection)
              if (selectedRoleData?.requiresFestAndCategory && step === 4)
                return null;

              // For graphics role, hide step 3 and 4
              if (selectedRoleData?.requiresFest && (step === 3 || step === 4))
                return null;

              if (!shouldShow) return null;

              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                      currentStep === step
                        ? 'bg-violet-500 text-white'
                        : currentStep > step
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-white/5 text-zinc-500'
                    }`}
                  >
                    {currentStep > step ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 5 && shouldShow && (
                    <div
                      className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all ${
                        currentStep > step ? 'bg-violet-500/50' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {/* Step 1: Select Role */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 mb-8"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Step 1: Select Role
                </h3>
                {availableRoles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  const isAssigned = isRoleAssigned(role.id);
                  const isDisabled = isAssigned && !role.requiresEvent; // Disable only for single-assignment roles

                  return (
                    <motion.button
                      key={role.id}
                      onClick={() => !isDisabled && setSelectedRole(role.id)}
                      disabled={isDisabled}
                      className={`w-full p-6 rounded-xl border transition-all text-left ${
                        isDisabled
                          ? 'border-zinc-700 bg-zinc-900/50 opacity-60 cursor-not-allowed'
                          : isSelected
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                      }`}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isDisabled
                              ? 'bg-zinc-800 border border-zinc-700'
                              : isSelected
                                ? 'bg-violet-500/20 border border-violet-500/30'
                                : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              isDisabled
                                ? 'text-zinc-600'
                                : isSelected
                                  ? 'text-violet-400'
                                  : 'text-zinc-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-medium mb-1 ${
                              isDisabled
                                ? 'text-zinc-500'
                                : isSelected
                                  ? 'text-violet-300'
                                  : 'text-white'
                            }`}
                          >
                            {role.name}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            {role.description}
                          </p>
                          {isDisabled && (
                            <p className="text-xs text-amber-500 mt-2 font-medium">
                              ✓ Already Assigned
                            </p>
                          )}
                        </div>
                        {isSelected && !isDisabled && (
                          <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* Step 2: Select Fest */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 mb-8"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Step 2: Select Fest
                </h3>
                {festsLoading ? (
                  <div className="text-center py-8 text-zinc-400">
                    Loading fests...
                  </div>
                ) : fests.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    No fests available for 2026
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fests.map((fest) => {
                      const isSelected = selectedFest === fest.id;
                      return (
                        <motion.button
                          key={fest.id}
                          onClick={() => setSelectedFest(fest.id)}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${
                            isSelected
                              ? 'border-violet-500/50 bg-violet-500/10'
                              : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4
                                className={`font-medium ${isSelected ? 'text-violet-300' : 'text-white'}`}
                              >
                                {fest.name}
                              </h4>
                              <p className="text-sm text-zinc-400">
                                Year: {fest.year}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-violet-400" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Select Category */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 mb-8"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Step 3: Select Category
                </h3>
                {categoriesLoading ? (
                  <div className="text-center py-8 text-zinc-400">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    No categories available for this fest
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {categories.map((category) => {
                      const isSelected = selectedCategory === category.id;
                      return (
                        <motion.button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${
                            isSelected
                              ? 'border-violet-500/50 bg-violet-500/10'
                              : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <h4
                              className={`font-medium ${isSelected ? 'text-violet-300' : 'text-white'}`}
                            >
                              {category.name}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-violet-400" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Select Event */}
            {currentStep === 4 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 mb-8"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Step 4: Select Events (Multi-select)
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Select one or more events you want to manage
                </p>
                {eventsLoading ? (
                  <div className="text-center py-8 text-zinc-400">
                    Loading events...
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    No events available for this category
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {events.map((event) => {
                      const isSelected = selectedEvents.includes(event.id);
                      const assignedEventIds = getAssignedEventIds();
                      const isAssigned = assignedEventIds.includes(event.id);

                      const handleToggleEvent = () => {
                        if (isAssigned) return; // Don't allow toggling assigned events

                        if (isSelected) {
                          // Remove from selection
                          setSelectedEvents(
                            selectedEvents.filter((id) => id !== event.id)
                          );
                        } else {
                          // Add to selection
                          setSelectedEvents([...selectedEvents, event.id]);
                        }
                      };

                      return (
                        <motion.button
                          key={event.id}
                          onClick={handleToggleEvent}
                          disabled={isAssigned}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${
                            isAssigned
                              ? 'border-zinc-700 bg-zinc-900/50 opacity-60 cursor-not-allowed'
                              : isSelected
                                ? 'border-violet-500/50 bg-violet-500/10'
                                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                          }`}
                          whileHover={!isAssigned ? { scale: 1.02 } : {}}
                          whileTap={!isAssigned ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4
                                className={`font-medium ${
                                  isAssigned
                                    ? 'text-zinc-500'
                                    : isSelected
                                      ? 'text-violet-300'
                                      : 'text-white'
                                }`}
                              >
                                {event.name}
                              </h4>
                              {isAssigned && (
                                <p className="text-xs text-amber-500 mt-1 font-medium">
                                  ✓ Already Assigned
                                </p>
                              )}
                            </div>
                            {isSelected && !isAssigned && (
                              <CheckCircle2 className="w-5 h-5 text-violet-400" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-8"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  Step 5: Review & Submit
                </h3>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Role</p>
                    <p className="text-white font-medium">
                      {availableRoles.find((r) => r.id === selectedRole)?.name}
                    </p>
                  </div>
                  {(availableRoles.find((r) => r.id === selectedRole)
                    ?.requiresEvent ||
                    availableRoles.find((r) => r.id === selectedRole)
                      ?.requiresFestAndCategory ||
                    availableRoles.find((r) => r.id === selectedRole)
                      ?.requiresFest) && (
                    <>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Fest</p>
                        <p className="text-white font-medium">
                          {fests.find((f) => f.id === selectedFest)?.name ||
                            'N/A'}
                        </p>
                      </div>
                      {/* Show category only if not just fest required (graphics) */}
                      {!availableRoles.find((r) => r.id === selectedRole)
                        ?.requiresFest && (
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Category</p>
                          <p className="text-white font-medium">
                            {categories.find((c) => c.id === selectedCategory)
                              ?.name || 'N/A'}
                          </p>
                        </div>
                      )}
                      {availableRoles.find((r) => r.id === selectedRole)
                        ?.requiresEvent && (
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">
                            Events ({selectedEvents.length} selected)
                          </p>
                          <div className="space-y-1">
                            {selectedEvents.map((eventId) => {
                              const event = events.find(
                                (e) => e.id === eventId
                              );
                              return (
                                <p
                                  key={eventId}
                                  className="text-white font-medium"
                                >
                                  • {event?.name || 'Unknown Event'}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={logout}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              Logout
            </Button>
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
