'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUserProfile } from '@/lib/actions/profile';
import { Loader2, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfileFormProps {
  initialData: {
    name: string | null;
    phone: string | null;
    college_roll: string | null;
    course: string | null;
    stream: string | null;
    gender: string | null;
    email: string;
  };
  next?: string;
}

export default function ProfileForm({ initialData, next }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(initialData.course || '');
  const [stream, setStream] = useState(initialData.stream || '');

  const handleCourseChange = (value: string) => {
    setCourse(value);
    if (value === 'BCA') {
      setStream('BCA');
    } else if (value === 'MCA') {
      setStream('MCA');
    } else {
      setStream(''); // Reset stream if switching to a course that requires manual selection
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Ensure controlled stream value is submitted even if disabled/hidden
    if (!formData.get('stream')) {
      formData.append('stream', stream);
    }

    formData.set('course', course);
    formData.set('stream', stream);

    try {
      const result = await updateUserProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully');
        router.refresh();
        if (next) {
          router.push(next);
        } else {
          router.push('/landing');
        }
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isStreamAutoSet = course === 'BCA' || course === 'MCA';

  return (
    <Card className="max-w-2xl mx-auto border-white/10 bg-[#0a0a0f]/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-violet-500" />
          My Profile
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email
            </Label>
            <Input
              id="email"
              value={initialData.email}
              disabled
              className="bg-zinc-900/50 border-white/10 text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData.name || ''}
                required
                className="bg-white/5 border-white/10 text-white focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={initialData.phone || ''}
                required
                className="bg-white/5 border-white/10 text-white focus:ring-violet-500/50 focus:border-violet-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="college_roll" className="text-zinc-300">
              College Roll Number
            </Label>
            <Input
              id="college_roll"
              name="college_roll"
              defaultValue={initialData.college_roll || ''}
              required
              className="bg-white/5 border-white/10 text-white focus:ring-violet-500/50 focus:border-violet-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-zinc-300">Course</Label>
              <Select
                value={course}
                onValueChange={handleCourseChange}
                required
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-violet-500/50 focus:border-violet-500/50">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1f] border-white/10 text-white">
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="MCA">MCA</SelectItem>
                  <SelectItem value="B.Sc.">B.Sc.</SelectItem>
                  <SelectItem value="M.Tech">M.Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Stream</Label>
              {isStreamAutoSet ? (
                <Input
                  value={stream}
                  disabled
                  className="bg-zinc-900/50 border-white/10 text-zinc-500 cursor-not-allowed"
                />
              ) : (
                <Select value={stream} onValueChange={setStream} required>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-violet-500/50 focus:border-violet-500/50">
                    <SelectValue placeholder="Select Stream" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1f] border-white/10 text-white">
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="EE">EE</SelectItem>
                    <SelectItem value="CSE-AIML">CSE-AIML</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-zinc-300">
              Gender
            </Label>
            <Select
              name="gender"
              defaultValue={initialData.gender?.toLowerCase() || ''}
              required
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-violet-500/50 focus:border-violet-500/50">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1f] border-white/10 text-white">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
