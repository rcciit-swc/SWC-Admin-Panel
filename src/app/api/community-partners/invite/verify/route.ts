import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Verify an invitation token (public endpoint for onboarding app)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Token is required' },
                { status: 400 }
            );
        }

        const { data: invitation, error } = await supabaseAdmin
            .from('community_partner_invitations')
            .select('*, fests(name)')
            .eq('token', token)
            .single();

        if (error || !invitation) {
            return NextResponse.json(
                { success: false, error: 'Invalid invitation token' },
                { status: 404 }
            );
        }

        // Check if revoked
        if (invitation.status === 'revoked') {
            return NextResponse.json(
                { success: false, error: 'This invitation has been revoked' },
                { status: 410 }
            );
        }

        // Check if already accepted
        if (invitation.status === 'accepted') {
            return NextResponse.json(
                { success: false, error: 'This invitation has already been accepted' },
                { status: 410 }
            );
        }

        // Check expiry
        if (new Date(invitation.expires_at) < new Date()) {
            return NextResponse.json(
                { success: false, error: 'This invitation has expired' },
                { status: 410 }
            );
        }

        return NextResponse.json({
            success: true,
            invitation: {
                id: invitation.id,
                email: invitation.email,
                community_name: invitation.community_name,
                fest_id: invitation.fest_id,
                fest_name: invitation.fests?.name || null,
                expires_at: invitation.expires_at,
            },
        });
    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
