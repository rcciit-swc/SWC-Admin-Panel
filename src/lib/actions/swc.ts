'use server';

import { fetchSWCFundsData, StudentData } from '@/utils/functions/googleSheets';

export type SWCClearanceStatus =
    | { status: 'idle' }
    | { status: 'verified'; data: StudentData }
    | { status: 'not_found' }
    | { status: 'error'; message: string };

export async function checkSWCClearance(rollNumber: string): Promise<SWCClearanceStatus> {
    if (!rollNumber) {
        return { status: 'error', message: 'Roll number is required' };
    }

    try {
        const allStudents = await fetchSWCFundsData();
        const normalizedRoll = rollNumber.trim().toUpperCase();

        // Check exact match first
        const student = allStudents.find((s) => s.rollNumber === normalizedRoll);

        if (student) {
            return { status: 'verified', data: student };
        } else {
            // Fallback: Check if user input was without department or year but matches the suffix?
            // Risky. Let's stick to exact match against the normalized list which handles format.
            // The fetchSWCFundsData already normalizes list to regex format.
            // If the user's input matches that format, good.
            return { status: 'not_found' };
        }
    } catch (error) {
        console.error('Error checking SWC Clearance:', error);
        return { status: 'error', message: 'Failed to verify clearance' };
    }
}
