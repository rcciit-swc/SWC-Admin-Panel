import { sendMail } from '@/utils/functions/mailUtils';
import { NextRequest, NextResponse } from 'next/server';

// New way to configure routes in Next.js App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handle file upload directly
export async function POST(req: NextRequest) {
    try {
        const { to, subject, fileName, data } = await req.json();

        const res = await sendMail({
            to,
            subject,
            fileName,
            data,
        });

        if (res.success) {
            return NextResponse.json({ success: true, messageId: res.messageId });
        } else {
            return NextResponse.json(
                { success: false, error: res.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ success: false, error: error }, { status: 500 });
    }
}
