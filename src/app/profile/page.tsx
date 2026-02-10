import ProfileForm from '@/components/ProfileForm';
import SWCClearanceCard from '@/components/SWCClearanceCard';
import { createServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
    const supabase = await createServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
        redirect('/');
    }

    const { next: nextParam } = await searchParams;

    // Capture the 'next' parameter for redirect after profile completion
    const next = typeof nextParam === 'string' ? nextParam : undefined;

    // Fetch current user details from 'users' table
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !user) {
        console.error('Error fetching user profile:', error);
        // Handle error appropriately, potentially showing an error state or redirecting
        // For now, passing empty/default values if fetch fails logic needs adjustment based on auth robustness
        return (
            <div className="min-h-screen w-full bg-[#050508] flex items-center justify-center text-white">
                Error loading profile. Please try logging out and back in.
            </div>
        );
    }

    // Prepare initial data for the form
    const initialData = {
        name: user.name,
        phone: user.phone,
        college_roll: user.college_roll,
        course: user.course,
        stream: user.stream,
        gender: user.gender,
        email: user.email,
    };

    return (
        <div className="min-h-screen w-full bg-[#050508] relative overflow-x-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                        Profile Settings
                    </h1>
                </div>


                <SWCClearanceCard defaultRollNumber={user.college_roll} />

                <ProfileForm initialData={initialData} next={next} />
            </div>
        </div>
    );
}
