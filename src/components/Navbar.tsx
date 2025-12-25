'use client';

import Link from 'next/link';
import { userDataType } from '@/lib/types/user';
import { useState, Dispatch, SetStateAction, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/stores/user';
import { login } from '@/utils/functions/login';
import { logout } from '@/utils/functions/logout';
import { LogOut, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const { userData, userLoading } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch user session only once on mount
  useEffect(() => {
    const readUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user.user_metadata?.avatar_url) {
        setProfileImage(data.session.user.user_metadata.avatar_url);
      }
    };
    readUserSession();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="container max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Admin Panel
              </h1>
              <p className="text-xs text-zinc-500">RCCIIT SWC</p>
            </div>
          </Link>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            <SignInButton
              userData={userData}
              userLoading={userLoading}
              imageLoaded={imageLoaded}
              image={profileImage}
              setImageLoaded={setImageLoaded}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Memoized SignInButton
const SignInButton = memo(
  ({
    userData,
    userLoading,
    imageLoaded,
    image,
    setImageLoaded,
  }: {
    userData: userDataType | null;
    userLoading: boolean;
    imageLoaded: boolean;
    image: string | null;
    setImageLoaded: Dispatch<SetStateAction<boolean>>;
  }) => {
    if (userLoading) {
      return <Skeleton className="w-10 h-10 rounded-full bg-zinc-800" />;
    }

    if (userData) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="group relative focus:outline-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="relative h-10 w-10 transition-all ring-2 ring-violet-500/30 group-hover:ring-violet-400/50">
                {!imageLoaded && (
                  <Skeleton className="absolute inset-0 h-10 w-10 rounded-full bg-zinc-800" />
                )}
                <AvatarImage
                  src={image || ''}
                  alt="Profile"
                  onLoad={() => setImageLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-violet-500/40 to-indigo-500/30 text-white font-bold text-sm">
                  {userData.name
                    ? userData.name.charAt(0).toUpperCase()
                    : userData.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="mt-2 w-56 rounded-lg border border-white/[0.08] bg-[#0a0a0f]/95 backdrop-blur-xl shadow-xl"
          >
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-white truncate">
                {userData.name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 truncate">{userData.email}</p>
            </div>
            <DropdownMenuItem
              className="cursor-pointer px-4 py-2.5 text-zinc-300 transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06] focus:text-white flex items-center gap-2"
              onSelect={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <motion.button
        onClick={login}
        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Login
      </motion.button>
    );
  }
);

SignInButton.displayName = 'SignInButton';
