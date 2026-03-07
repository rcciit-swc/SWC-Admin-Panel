import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Accept an invitation (called by the onboarding app)
export async function POST(req: NextRequest) {
    try {
        const {
            token,
            referral_code,
            community_name,
            community_image,
            community_email,
        } = await req.json();

        if (!token || !referral_code || !community_name) {
            return NextResponse.json(
                { success: false, error: 'Token, referral_code, and community_name are required' },
                { status: 400 }
            );
        }

        // Validate token
        const { data: invitation, error: fetchError } = await supabaseAdmin
            .from('community_partner_invitations')
            .select('*')
            .eq('token', token)
            .single();

        if (fetchError || !invitation) {
            return NextResponse.json(
                { success: false, error: 'Invalid invitation token' },
                { status: 404 }
            );
        }

        if (invitation.status === 'revoked') {
            return NextResponse.json(
                { success: false, error: 'This invitation has been revoked' },
                { status: 410 }
            );
        }

        if (invitation.status === 'accepted') {
            return NextResponse.json(
                { success: false, error: 'This invitation has already been accepted' },
                { status: 410 }
            );
        }

        if (new Date(invitation.expires_at) < new Date()) {
            return NextResponse.json(
                { success: false, error: 'This invitation has expired' },
                { status: 410 }
            );
        }

        // Check if referral_code already exists
        const { data: existingPartner } = await supabaseAdmin
            .from('community_partners')
            .select('referral_code')
            .eq('referral_code', referral_code)
            .single();

        if (existingPartner) {
            return NextResponse.json(
                { success: false, error: 'This referral code is already in use' },
                { status: 409 }
            );
        }

        // Insert into community_partners
        const { error: insertError } = await supabaseAdmin
            .from('community_partners')
            .insert({
                referral_code,
                community_name,
                community_image: community_image || null,
                community_email: community_email || invitation.email,
                fest_id: invitation.fest_id,
            });

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json(
                { success: false, error: 'Failed to create community partner: ' + insertError.message },
                { status: 500 }
            );
        }

        // Mark invitation as accepted
        const { error: updateError } = await supabaseAdmin
            .from('community_partner_invitations')
            .update({ status: 'accepted' })
            .eq('id', invitation.id);

        if (updateError) {
            console.error('Update error:', updateError);
            // Partner was created but status update failed - not critical
        }

        return NextResponse.json({
            success: true,
            message: 'Community partner onboarded successfully',
            referral_code,
        });
    } catch (error) {
        console.error('Accept error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
