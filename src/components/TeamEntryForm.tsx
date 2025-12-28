'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Fest {
  id: string;
  name: string;
}

interface DefinedTeam {
  role: string;
  team_name: string;
}

interface EventCategory {
  id: string;
  name: string;
}

interface Event {
  id: string;
  name: string;
}

interface FormData {
  fest_id: string;
  event_category_id: string;
  event_id: string;
  team_id: string;
  name: string;
  phone: string;
  role_name: string;
  college_roll: string;
  course: string;
  stream: string;
  gender: 'male' | 'female' | '';
  image_file: File | null;
  image_url: string;
}

interface TeamEntryFormProps {
  userId: string;
}

// Function to process events for display - remove duplicates and clean names
const processEventsForDisplay = (
  eventsList: Event[]
): Array<{ id: string; displayName: string; originalName: string }> => {
  const processedMap = new Map<
    string,
    { id: string; displayName: string; originalName: string }
  >();

  eventsList.forEach((event) => {
    let displayName = event.name;

    // Check if event contains "TRACK AND SPORTS" (case insensitive)
    if (displayName.toUpperCase().includes('TRACK AND SPORTS')) {
      displayName = 'TRACK AND SPORTS';
    } else {
      // Remove (SINGLES), (DOUBLES), (MALE), (FEMALE) from the event name
      displayName = displayName
        .replace(/\(SINGLES\)/gi, '')
        .replace(/\(DOUBLES\)/gi, '')
        .trim();

      // Remove "TOURNAMENT" word
      displayName = displayName.replace(/\bTOURNAMENT\b/gi, '').trim();

      // Remove extra spaces
      displayName = displayName.replace(/\s+/g, ' ');
    }

    // Only add if this display name doesn't exist yet
    if (!processedMap.has(displayName)) {
      processedMap.set(displayName, {
        id: event.id,
        displayName: displayName,
        originalName: event.name,
      });
    }
  });

  return Array.from(processedMap.values());
};

const TeamEntryForm = ({ userId }: TeamEntryFormProps) => {
  const [step, setStep] = useState(1);
  const [fests, setFests] = useState<Fest[]>([]);
  const [teams, setTeams] = useState<DefinedTeam[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    fest_id: '',
    event_category_id: '',
    event_id: '',
    team_id: '',
    name: '',
    phone: '',
    role_name: '',
    college_roll: '',
    course: '',
    stream: '',
    gender: '',
    image_file: null,
    image_url: '',
  });

  // Check if team requires event selection
  const requiresEventSelection = [
    'coordinators',
    'volunteers',
    'convenors',
  ].includes(formData.team_id);

  // Check if role name should be disabled
  const isRoleNameDisabled = [
    'coordinators',
    'volunteers',
    'convenors',
  ].includes(formData.team_id);

  // Get processed events for display - memoized to prevent infinite loops
  const displayEvents = useMemo(
    () => processEventsForDisplay(events),
    [events]
  );

  // Fetch fests on mount
  useEffect(() => {
    const fetchFests = async () => {
      const { data, error } = await supabase
        .from('fests')
        .select('id, name')
        .eq('year', 2026)
        .order('name');

      if (error) {
        toast.error('Failed to load fests');
        console.error(error);
      } else {
        setFests(data || []);
      }
    };

    fetchFests();
  }, []);

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from('defined_org_teams')
        .select('role, team_name')
        .order('team_name');

      if (error) {
        toast.error('Failed to load teams');
        console.error(error);
      } else {
        setTeams(data || []);
      }
    };

    fetchTeams();
  }, []);

  // Fetch event categories when fest is selected (always, not just for specific teams)
  useEffect(() => {
    if (formData.fest_id) {
      const fetchEventCategories = async () => {
        const { data, error } = await supabase
          .from('event_categories')
          .select('id, name')
          .eq('fest_id', formData.fest_id)
          .order('name');

        if (error) {
          toast.error('Failed to load event categories');
          console.error(error);
        } else {
          setEventCategories(data || []);
        }
      };

      fetchEventCategories();
    } else {
      setEventCategories([]);
      setFormData((prev) => ({ ...prev, event_category_id: '', event_id: '' }));
    }
  }, [formData.fest_id]);

  // Fetch events when event category is selected
  useEffect(() => {
    if (formData.event_category_id && requiresEventSelection) {
      const fetchEvents = async () => {
        const { data, error } = await supabase
          .from('events')
          .select('id, name')
          .eq('event_category_id', formData.event_category_id)
          .order('name');

        if (error) {
          toast.error('Failed to load events');
          console.error(error);
        } else {
          setEvents(data || []);
        }
      };

      fetchEvents();
    } else {
      setEvents([]);
      setFormData((prev) => ({ ...prev, event_id: '' }));
    }
  }, [formData.event_category_id, requiresEventSelection]);

  // Auto-set role name when event is selected
  useEffect(() => {
    if (formData.event_id && requiresEventSelection) {
      const selectedEvent = displayEvents.find(
        (e) => e.id === formData.event_id
      );
      if (selectedEvent) {
        setFormData((prev) => ({
          ...prev,
          role_name: selectedEvent.displayName,
        }));
      }
    }
  }, [formData.event_id, displayEvents, requiresEventSelection]);

  // Auto-set stream based on course
  useEffect(() => {
    if (formData.course && !['B.Tech', 'M.Tech'].includes(formData.course)) {
      setFormData((prev) => ({ ...prev, stream: prev.course }));
    }
  }, [formData.course]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image_file: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';

    if (!apiKey) {
      throw new Error('ImgBB API key not configured');
    }

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error('Image upload failed');
    }

    return data.data.url;
  };

  const getNextSequence = async (): Promise<number> => {
    const { data, error } = await supabase
      .from('org_teams')
      .select('sequence')
      .eq('fest_id', formData.fest_id)
      .eq('team_id', formData.team_id)
      .order('sequence', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching sequence:', error);
      return 1;
    }

    if (!data || data.length === 0) {
      return 1;
    }

    return (data[0].sequence || 0) + 1;
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.fest_id) {
        toast.error('Please select a fest');
        return;
      }
      if (!formData.event_category_id) {
        toast.error('Please select an event category');
        return;
      }
    }

    if (step === 2) {
      if (!formData.team_id) {
        toast.error('Please select a team');
        return;
      }

      if (requiresEventSelection && !formData.event_id) {
        toast.error('Please select an event');
        return;
      }

      if (
        !formData.name ||
        !formData.phone ||
        !formData.role_name ||
        !formData.college_roll ||
        !formData.course ||
        !formData.gender
      ) {
        toast.error('Please fill all required fields');
        return;
      }

      if (['B.Tech', 'M.Tech'].includes(formData.course) && !formData.stream) {
        toast.error('Please select a stream');
        return;
      }
    }

    if (step === 3 && !formData.image_file) {
      toast.error('Please upload a photo');
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploading(true);

    try {
      // Upload image
      if (!formData.image_file) {
        throw new Error('No image file selected');
      }

      const imageUrl = await uploadToImgBB(formData.image_file);
      setUploading(false);

      // Get next sequence number
      const sequence = await getNextSequence();

      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          college_roll: formData.college_roll,
          college: 'RCCIIT',
          stream: formData.stream,
          course: formData.course,
          phone: formData.phone,
          gender: formData.gender,
        })
        .eq('id', userId);

      if (userError) throw userError;

      // Insert into org_teams table
      const { error: teamError } = await supabase.from('org_teams').insert({
        fest_id: formData.fest_id,
        name: formData.name,
        image: imageUrl,
        approved: false,
        team_id: formData.team_id,
        role_name: formData.role_name,
        sequence: sequence,
        requester_id: userId,
        approved_by: null,
        approved_at: null,
        created_at: new Date().toISOString(),
      });

      if (teamError) throw teamError;

      toast.success('Team member data submitted successfully!');

      // Reset form
      setFormData({
        fest_id: '',
        event_category_id: '',
        event_id: '',
        team_id: '',
        name: '',
        phone: '',
        role_name: '',
        college_roll: '',
        course: '',
        stream: '',
        gender: '',
        image_file: null,
        image_url: '',
      });
      setImagePreview('');
      setStep(1);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-white/10 rounded-2xl p-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s <= step
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                    : 'bg-white/10 text-zinc-500'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    s < step
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 && 'Select Fest & Category'}
            {step === 2 && 'Member Details'}
            {step === 3 && 'Upload Photo'}
            {step === 4 && 'Preview & Submit'}
          </h2>
          <p className="text-zinc-400">Step {step} of 4</p>
        </div>
      </div>

      {/* Step 1: Select Fest & Category */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="fest" className="text-white mb-2 block">
              Select Fest *
            </Label>
            <Select
              value={formData.fest_id}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  fest_id: value,
                  event_category_id: '',
                  event_id: '',
                }))
              }
            >
              <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                <SelectValue placeholder="Choose a fest" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0f] border-white/10">
                {fests.map((fest) => (
                  <SelectItem
                    key={fest.id}
                    value={fest.id}
                    className="text-white focus:bg-white/10 focus:text-white"
                  >
                    {fest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.fest_id && (
            <div>
              <Label htmlFor="event_category" className="text-white mb-2 block">
                Select Event Category *
              </Label>
              <Select
                value={formData.event_category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    event_category_id: value,
                    event_id: '',
                  }))
                }
              >
                <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                  <SelectValue placeholder="Choose an event category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0f] border-white/10">
                  {eventCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Member Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="team" className="text-white mb-2 block">
              Select Team *
            </Label>
            <Select
              value={formData.team_id}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  team_id: value,
                  event_id: '',
                  role_name: '',
                }))
              }
            >
              <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                <SelectValue placeholder="Choose a team" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0f] border-white/10">
                {teams.map((team) => (
                  <SelectItem
                    key={team.role}
                    value={team.role}
                    className="text-white focus:bg-white/10 focus:text-white"
                  >
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresEventSelection && formData.event_category_id && (
            <div>
              <Label htmlFor="event" className="text-white mb-2 block">
                Select Event *
              </Label>
              <Select
                value={formData.event_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, event_id: value }))
                }
              >
                <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0f] border-white/10">
                  {displayEvents.map((event) => (
                    <SelectItem
                      key={event.id}
                      value={event.id}
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      {event.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.team_id && (
            <>
              <div>
                <Label htmlFor="name" className="text-white mb-2 block">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-white mb-2 block">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="role_name" className="text-white mb-2 block">
                  Role Name *
                </Label>
                <Input
                  id="role_name"
                  value={formData.role_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role_name: e.target.value,
                    }))
                  }
                  disabled={isRoleNameDisabled}
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter role (e.g., Captain, Member)"
                />
              </div>

              <div>
                <Label htmlFor="college_roll" className="text-white mb-2 block">
                  College Roll *
                </Label>
                <Input
                  id="college_roll"
                  value={formData.college_roll}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      college_roll: e.target.value,
                    }))
                  }
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Enter college roll number"
                />
              </div>

              <div>
                <Label htmlFor="course" className="text-white mb-2 block">
                  Course *
                </Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      course: value,
                      stream: '',
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-white/10">
                    <SelectItem
                      value="B.Tech"
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      B.Tech
                    </SelectItem>
                    <SelectItem
                      value="BCA"
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      BCA
                    </SelectItem>
                    <SelectItem
                      value="MCA"
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      MCA
                    </SelectItem>
                    <SelectItem
                      value="M.Tech"
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      M.Tech
                    </SelectItem>
                    <SelectItem
                      value="B.Sc."
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      B.Sc.
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {['B.Tech', 'M.Tech'].includes(formData.course) && (
                <div>
                  <Label htmlFor="stream" className="text-white mb-2 block">
                    Stream *
                  </Label>
                  <Select
                    value={formData.stream}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, stream: value }))
                    }
                  >
                    <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                      <SelectValue placeholder="Choose a stream" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-white/10">
                      <SelectItem
                        value="CSE"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        CSE
                      </SelectItem>
                      <SelectItem
                        value="IT"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        IT
                      </SelectItem>
                      <SelectItem
                        value="ECE"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        ECE
                      </SelectItem>
                      <SelectItem
                        value="EE"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        EE
                      </SelectItem>
                      <SelectItem
                        value="CSE-AIML"
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        CSE-AIML
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="gender" className="text-white mb-2 block">
                  Gender *
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: value as 'male' | 'female',
                    }))
                  }
                >
                  <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-white">
                    <SelectValue placeholder="Choose gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-white/10">
                    <SelectItem
                      value="male"
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      MALE
                    </SelectItem>
                    <SelectItem
                      value="female"
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      FEMALE
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Upload Photo */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="photo" className="text-white mb-2 block">
              Upload Photo *
            </Label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-violet-500/50 transition-all">
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="photo"
                className="cursor-pointer flex flex-col items-center"
              >
                {imagePreview ? (
                  <div className="relative w-48 h-48 mb-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <Upload className="w-16 h-16 text-violet-400 mb-4" />
                )}
                <p className="text-white font-medium mb-2">
                  {imagePreview ? 'Change Photo' : 'Click to upload photo'}
                </p>
                <p className="text-zinc-400 text-sm">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Eye className="mr-2" />
              Preview Details
            </h3>

            {imagePreview && (
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <Image
                    src={imagePreview}
                    alt="Member photo"
                    fill
                    className="object-cover rounded-full border-4 border-violet-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-400 text-sm">Fest</p>
                <p className="text-white font-medium">
                  {fests.find((f) => f.id === formData.fest_id)?.name}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Team</p>
                <p className="text-white font-medium">
                  {teams.find((t) => t.role === formData.team_id)?.team_name}
                </p>
              </div>
              {requiresEventSelection && formData.event_id && (
                <>
                  <div>
                    <p className="text-zinc-400 text-sm">Event Category</p>
                    <p className="text-white font-medium">
                      {
                        eventCategories.find(
                          (c) => c.id === formData.event_category_id
                        )?.name
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Event</p>
                    <p className="text-white font-medium">
                      {
                        displayEvents.find((e) => e.id === formData.event_id)
                          ?.displayName
                      }
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-zinc-400 text-sm">Name</p>
                <p className="text-white font-medium">{formData.name}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Phone</p>
                <p className="text-white font-medium">{formData.phone}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Role</p>
                <p className="text-white font-medium">{formData.role_name}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">College Roll</p>
                <p className="text-white font-medium">
                  {formData.college_roll}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Course</p>
                <p className="text-white font-medium">{formData.course}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Stream</p>
                <p className="text-white font-medium">{formData.stream}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Gender</p>
                <p className="text-white font-medium">
                  {formData.gender.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">College</p>
                <p className="text-white font-medium">RCCIIT</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={
              step === 1 && (!formData.fest_id || !formData.event_category_id)
            }
            className="ml-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="ml-auto bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-green-500 border-0"
          >
            {uploading
              ? 'Uploading Image...'
              : loading
                ? 'Submitting...'
                : 'Submit'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeamEntryForm;
