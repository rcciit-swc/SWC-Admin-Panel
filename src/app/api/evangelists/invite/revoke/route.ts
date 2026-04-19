import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Revoke an invitation
export async function POST(req: NextRequest) {
  try {
    const { invitation_id } = await req.json();

    if (!invitation_id) {
      return NextResponse.json(
        { success: false, error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Check current status
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('evangelist_invitations')
      .select('id, status')
      .eq('id', invitation_id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot revoke a ${invitation.status} invitation`,
        },
        { status: 400 }
      );
    }

    // Update status to revoked
    const { error: updateError } = await supabaseAdmin
      .from('evangelist_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitation_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to revoke invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully',
    });
  } catch (error) {
    console.error('Revoke error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
