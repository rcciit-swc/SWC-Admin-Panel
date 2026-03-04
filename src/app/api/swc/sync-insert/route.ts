import { createServer } from '@/lib/supabase/server';
import { StudentData } from '@/utils/functions/googleSheets';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const students: StudentData[] = body.students;

        if (!Array.isArray(students) || students.length === 0) {
            return NextResponse.json({ error: 'No students provided' }, { status: 400 });
        }

        // Map StudentData → SWC-2026 table shape
        const rows = students.map((s) => ({
            roll: s.rollNumber.trim().toUpperCase(),
            email: s.collegeEmail || s.personalEmail || '',
            name: s.name || null,
            phone: s.mobile || null,
        }));

        // Upsert to handle any race-condition duplicates gracefully
        const { error } = await supabase
            .from('SWC-2026')
            .upsert(rows, { onConflict: 'roll,email', ignoreDuplicates: true });

        if (error) {
            console.error('sync-insert upsert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ inserted: rows.length });
    } catch (err) {
        console.error('sync-insert error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
