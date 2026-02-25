'use server';

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  const supabase = await createServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const userId = session.user.id;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const college_roll = formData.get('college_roll') as string;
  const course = formData.get('course') as string;
  const stream = formData.get('stream') as string;
  const gender = formData.get('gender') as string;

  // Simple validation
  if (!name || !phone || !college_roll || !course || !stream || !gender) {
    return { error: 'All fields are required' };
  }

  const { error } = await supabase
    .from('users')
    .update({
      name,
      phone,
      college_roll,
      course,
      stream,
      gender,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile' };
  }

  revalidatePath('/profile');
  return { success: true };
}
