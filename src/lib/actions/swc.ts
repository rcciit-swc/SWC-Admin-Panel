'use server';

import { createServer } from '@/lib/supabase/server';
import { SWCQueryWithUser } from '@/lib/types/swc';
import { fetchSWCFundsData, StudentData } from '@/utils/functions/googleSheets';
import { createClient } from '@supabase/supabase-js';

export type SWCClearanceStatus =
  | { status: 'idle' }
  | { status: 'verified'; data: StudentData }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

export async function checkSWCClearance(
  rollNumber: string
): Promise<SWCClearanceStatus> {
  if (!rollNumber) {
    return { status: 'error', message: 'Roll number is required' };
  }

  try {
    const allStudents = await fetchSWCFundsData();
    const normalizedRoll = rollNumber.trim().toUpperCase();

    const student = allStudents.find((s) => s.rollNumber === normalizedRoll);

    if (student) {
      return { status: 'verified', data: student };
    } else {
      return { status: 'not_found' };
    }
  } catch (error) {
    console.error('Error checking SWC Clearance:', error);
    return { status: 'error', message: 'Failed to verify clearance' };
  }
}

export async function getSWCQueries(
  status: 'pending' | 'processed'
): Promise<SWCQueryWithUser[]> {
  const supabase = await createServer();

  let query = supabase
    .from('swc_queries')
    .select(
      `
            *,
            users:user_id (
                name,
                email,
                phone,
                college_roll
            )
        `
    )
    .order('created_at', { ascending: false });

  if (status === 'pending') {
    query = query.eq('status', 'pending');
  } else {
    query = query.in('status', ['approved', 'rejected']);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching SWC queries:', error);
    return [];
  }

  return data as unknown as SWCQueryWithUser[];
}

export async function updateSWCQueryStatus(
  queryId: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServer();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (status === 'approved') {
    const { data: queryData, error: queryError } = await supabase
      .from('swc_queries')
      .select(
        `
                user_id,
                users:user_id (
                    email,
                    name,
                    phone,
                    college_roll
                )
            `
      )
      .eq('id', queryId)
      .single();

    if (queryError || !queryData || !queryData.users) {
      console.error('Error fetching query/user for approval:', queryError);
      return {
        success: false,
        error: 'Failed to fetch user details for approval',
      };
    }

    const user = queryData.users as any;

    if (!user.college_roll || !user.email) {
      return {
        success: false,
        error: 'User is missing roll number or email, cannot approve.',
      };
    }

    // Create admin client to bypass RLS for UPSERT on SWC-2026
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: insertError } = await supabaseAdmin.from('SWC-2026').upsert(
      {
        roll: user.college_roll,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      {
        onConflict: 'roll, email',
      }
    );

    if (insertError) {
      console.error('Error inserting into SWC-2026:', insertError);
      return { success: false, error: 'Failed to add user to SWC-2026 table' };
    }
  }

  const { error } = await supabase
    .from('swc_queries')
    .update({
      status,
      viewed_by: sessionData.session.user.id,
      viewed_at: new Date().toISOString(),
    })
    .eq('id', queryId);

  if (error) {
    console.error('Error updating SWC query status:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
