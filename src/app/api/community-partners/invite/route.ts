import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
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

// POST - Create a new invitation and send email
export async function POST(req: NextRequest) {
    try {
        const { email, community_name, fest_id, expires_in_days = 7, created_by } = await req.json();

        if (!email || !community_name) {
            return NextResponse.json(
                { success: false, error: 'Email and community name are required' },
                { status: 400 }
            );
        }

        // Check if there's already a pending invitation for this email
        const { data: existingInvite } = await supabaseAdmin
            .from('community_partner_invitations')
            .select('id, status')
            .eq('email', email)
            .eq('status', 'pending')
            .single();

        if (existingInvite) {
            return NextResponse.json(
                { success: false, error: 'A pending invitation already exists for this email' },
                { status: 409 }
            );
        }

        // Generate secure token
        const token = randomBytes(32).toString('hex');

        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expires_in_days);

        // Insert invitation
        const { data: invitation, error: insertError } = await supabaseAdmin
            .from('community_partner_invitations')
            .insert({
                email,
                community_name,
                fest_id: fest_id || null,
                token,
                status: 'pending',
                expires_at: expiresAt.toISOString(),
                created_by: created_by || null,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json(
                { success: false, error: 'Failed to create invitation' },
                { status: 500 }
            );
        }

        // Get fest name for the email
        let festName = 'RCCIIT SWC Event';
        if (fest_id) {
            const { data: fest } = await supabaseAdmin
                .from('fests')
                .select('name')
                .eq('id', fest_id)
                .single();
            if (fest) festName = fest.name;
        }

        // Build invitation link
        const onboardUrl = process.env.NEXT_PUBLIC_COMMUNITY_ONBOARD_URL || 'http://localhost:3001';
        const invitationLink = `${onboardUrl}/community-partner/onboard?token=${token}`;

        // Render email template
        const templatePath = path.join(process.cwd(), 'public', 'mails', 'community-partner-invite.ejs');
        const html = await ejs.renderFile(templatePath, {
            data: {
                communityName: community_name,
                festName,
                invitationLink,
                expiresAt: expiresAt.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            },
        });

        // Send email via nodemailer (Gmail SMTP)
        try {
            const transporter = createTransporter();
            await transporter.verify();
            await transporter.sendMail({
                from: `"RCCIIT Techtrix 2026" <${process.env.COMMUNITY_SMTP_USER}>`,
                to: email,
                subject: `Community Partner Invitation - ${festName}`,
                html,
            });

            return NextResponse.json({
                success: true,
                invitation,
                emailSent: true,
            });
        } catch (emailError) {
            console.error('Email error:', emailError);
            return NextResponse.json({
                success: true,
                invitation,
                emailSent: false,
                emailError: emailError instanceof Error ? emailError.message : 'Email delivery failed',
            });
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - List all invitations
export async function GET() {
    try {
        const { data: invitations, error } = await supabaseAdmin
            .from('community_partner_invitations')
            .select('*, fests(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch invitations' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, invitations });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
