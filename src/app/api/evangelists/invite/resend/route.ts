import { createClient } from '@supabase/supabase-js';
import ejs from 'ejs';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.COMMUNITY_SMTP_USER!,
      pass: process.env.COMMUNITY_SMTP_PASS!,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// POST - Resend invitation email
export async function POST(req: NextRequest) {
  try {
    const { invitation_id } = await req.json();

    if (!invitation_id) {
      return NextResponse.json(
        { success: false, error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Fetch the invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('evangelist_invitations')
      .select('*, fests(name)')
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
          error: `Cannot resend a ${invitation.status} invitation`,
        },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'This invitation has expired. Please create a new one.',
        },
        { status: 400 }
      );
    }

    const festName = invitation.fests?.name || 'RCCIIT SWC Event';
    const onboardUrl =
      process.env.NEXT_PUBLIC_EVANGELIST_ONBOARD_URL ||
      process.env.NEXT_PUBLIC_COMMUNITY_ONBOARD_URL ||
      'http://localhost:3001';
    const invitationLink = `${onboardUrl}/evangelist/onboard?token=${invitation.token}`;

    // Render email template
    const templatePath = path.join(
      process.cwd(),
      'public',
      'mails',
      'evangelist-invite.ejs'
    );
    const html = await ejs.renderFile(templatePath, {
      data: {
        name: invitation.name,
        festName,
        invitationLink,
        expiresAt: new Date(invitation.expires_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    });

    // Send email via nodemailer
    const transporter = createTransporter();
    await transporter.verify();
    await transporter.sendMail({
      from: `"RCCIIT Techtrix 2026" <${process.env.COMMUNITY_SMTP_USER}>`,
      to: invitation.email,
      subject: `Evangelist Invitation - ${festName}`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation email resent successfully',
    });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
