import { createServer } from '@/lib/supabase/server';
import { fetchSWCFundsData } from '@/utils/functions/googleSheets';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServer();

    // Auth guard – super_admin only
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: userRoles } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', sessionData.session.user.id)
      .eq('role', 'super_admin');
    if (!userRoles || userRoles.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all students from sheets + existing SWC-2026 rows in parallel
    const [sheetsStudents, { data: existingRows }] = await Promise.all([
      fetchSWCFundsData(),
      supabase.from('SWC-2026').select('roll'),
    ]);

    // Build a Set of rolls already in the DB (normalized)
    const existingRolls = new Set(
      (existingRows ?? []).map((r) => (r.roll ?? '').trim().toUpperCase())
    );

    // Find students present in sheets but NOT in SWC-2026
    const newStudents = sheetsStudents.filter(
      (s) => !existingRolls.has(s.rollNumber.trim().toUpperCase())
    );

    return NextResponse.json({ newStudents });
  } catch (err) {
    console.error('sync-check error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
