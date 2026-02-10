import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Sheet ID and Tab IDs from the user request
// --- Configuration ---

// Standard Sheets (Sheet 1 & 2) - Logic: Fetch Tab 2, Filter by "Payment Status" = "success"
const STANDARD_SHEET_IDS = [
  '1Ha1eGsct8RvcpF6372mgKQ0xkP2Qe5Ib_PB3CNQMj4k', // Sheet 1
  '1TFTo6BUbvZgON2dkb9qnSESOrjidYten3MIGsfEvDyk', // Sheet 2
];
const STANDARD_TAB_PAYMENTS_GID = 938528198;

// Sheet 3 - Logic: Fetch Tab 2 (Payments), Match "Collge Roll" with Tab 1 (Students) "clg_roll"
const SHEET_3_ID = '1O3H8-AChkvQAwkThqPT3gnnw3goWZU2w_MJ97Nfj6DQ';
const SHEET_3_TAB_STUDENTS_GID = 0;
const SHEET_3_TAB_PAYMENTS_GID = 457860725;

// Sheet 4 - Logic: Form Responses (Fetch Tab 1)
const SHEET_4_ID = '177xLpHyvu2SiJvSkxcbcDpCHn9zDpjMPNwTgOqCvm1U';
const SHEET_4_TAB_GID = 2145714635;

export interface StudentData {
  timestamp: string;
  name: string;
  department: string;
  rollNumber: string;
  mobile: string;
  collegeEmail: string;
  personalEmail: string;
  whatsapp: string;
  emergency: string;
}

export const fetchSWCFundsData = async (): Promise<StudentData[]> => {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error(
        'GOOGLE_SERVICE_ACCOUNT_JSON is not defined in environment variables'
      );
    }

    const serviceAccountAuth = new JWT({
      email: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON).client_email,
      key: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON).private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const allStudents: StudentData[] = [];

    // --- Process Standard Sheets (Sheet 1 & 2) ---
    const standardSheetPromises = STANDARD_SHEET_IDS.map(async (sheetId) => {
      try {
        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo();

        const sheetPayment = doc.sheetsById[STANDARD_TAB_PAYMENTS_GID];
        if (!sheetPayment) {
          console.warn(
            `Payment sheet (GID: ${STANDARD_TAB_PAYMENTS_GID}) not found for standard sheet: ${sheetId}`
          );
          return [];
        }

        const rows = await sheetPayment.getRows();
        const sheetStudents: StudentData[] = [];

        rows.forEach((row) => {
          const paymentStatus = row
            .get('Payment Status')
            ?.toString()
            .trim()
            .toLowerCase();

          if (paymentStatus === 'success') {
            sheetStudents.push({
              timestamp: row.get('Timestamp') || '',
              name: row.get('Name') || '',
              department: row.get('Department') || '',
              rollNumber: row.get('Roll Number')?.toString() || '',
              collegeEmail: row.get('College Email') || '',
              personalEmail: row.get('Personal Email') || '',
              mobile: row.get('Mobile') || '',
              whatsapp: row.get('Whatsapp') || '',
              emergency: row.get('Emergency') || '',
            });
          }
        });
        return sheetStudents;
      } catch (err) {
        console.error(`Error processing standard sheet ${sheetId}:`, err);
        return [];
      }
    });

    // --- Process Sheet 3 ---
    const sheet3Promise = (async () => {
      try {
        const doc = new GoogleSpreadsheet(SHEET_3_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheetStudents = doc.sheetsById[SHEET_3_TAB_STUDENTS_GID];
        const sheetPayments = doc.sheetsById[SHEET_3_TAB_PAYMENTS_GID];

        if (!sheetStudents || !sheetPayments) {
          console.warn('Required tabs not found for Sheet 3');
          return [];
        }

        const [studentRows, paymentRows] = await Promise.all([
          sheetStudents.getRows(),
          sheetPayments.getRows(),
        ]);

        // Create a map of Students from Tab 1 for fast lookup
        // Key: Normalized Roll Number
        const studentMap = new Map<string, any>();
        studentRows.forEach((row) => {
          const rawRoll = row.get('clg_roll')?.toString();
          if (rawRoll) {
            studentMap.set(rawRoll.trim().toLowerCase(), row);
          }
        });

        const sheet3Data: StudentData[] = [];

        // Iterate Payments in Tab 2
        paymentRows.forEach((payRow) => {
          const payRollRaw = payRow.get('Collge Roll')?.toString();
          const payRoll = payRollRaw?.trim().toLowerCase();

          if (!payRoll) return;

          // Check if student exists in Tab 1
          const studentInfo = studentMap.get(payRoll);

          if (studentInfo) {
            sheet3Data.push({
              timestamp: payRow.get('Update Timestamp') || '', // Use payment timestamp
              name: studentInfo.get('name') || '',
              department: studentInfo.get('department') || '',
              rollNumber: payRollRaw || '',
              collegeEmail: studentInfo.get('clg_email') || '',
              personalEmail: '', // Not in Sheet 3 Tab 1
              mobile: studentInfo.get('mobile_no') || '',
              whatsapp: studentInfo.get('wapp_no') || '',
              emergency: studentInfo.get('emergency_no') || '',
            });
          }
        });

        return sheet3Data;
      } catch (err) {
        console.error('Error processing Sheet 3:', err);
        return [];
      }
    })();

    // --- Process Sheet 4 ---
    const sheet4Promise = (async () => {
      try {
        const doc = new GoogleSpreadsheet(SHEET_4_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsById[SHEET_4_TAB_GID];
        if (!sheet) {
          console.warn('Tab 1 not found for Sheet 4');
          return [];
        }

        const rows = await sheet.getRows();
        const sheet4Data: StudentData[] = [];

        // Headers based on user provided data
        // "College Roll No.\n(Eg : CSE2024XXX)"
        // "College Email \n(Eg: cse2024xxx@rcciit.org.in)"
        // "Mobile no. (Associated with UPI ID )\n"

        rows.forEach((row) => {
          // Helper to find header that starts with string if exact match fails
          // But first try exact keys from user description

          const rollRaw =
            row.get('College Roll No.\n(Eg : CSE2024XXX)') ||
            row.get('College Roll No.') || // Fallback
            '';

          const collegeEmail =
            row.get('College Email \n(Eg: cse2024xxx@rcciit.org.in)') ||
            row.get('College Email') ||
            '';

          const mobile =
            row.get('Mobile no. (Associated with UPI ID )\n') ||
            row.get('Mobile no. (Associated with UPI ID )') ||
            '';

          // "Phone (WhatsApp No.) " might have trailing space
          const whatsapp =
            row.get('Phone (WhatsApp No.) ') ||
            row.get('Phone (WhatsApp No.)') ||
            '';

          sheet4Data.push({
            timestamp: row.get('Timestamp') || '',
            name: row.get('Full Name') || '',
            department: row.get('Department') || '',
            rollNumber: rollRaw.toString(),
            collegeEmail: collegeEmail.toString(),
            personalEmail: row.get('Email address') || '',
            mobile: mobile.toString(),
            whatsapp: whatsapp.toString(),
            emergency: '', // Not provided
          });
        });

        return sheet4Data;
      } catch (err) {
        console.error('Error processing Sheet 4:', err);
        return [];
      }
    })();

    // execute all
    const results = await Promise.all([
      ...standardSheetPromises,
      sheet3Promise,
      sheet4Promise,
    ]);

    // Flatten results
    results.forEach((dataset) => {
      allStudents.push(...dataset);
    });

    // Valid Departments and Years for Regex
    // Pattern: Department + Year + (3 digits OR [BPL] + 2 digits)
    const deptPattern = 'CSE|IT|ECE|EE|CSEAI|BCS|BCA|MCA|BSC|MTECH';
    const yearPattern = '2020|2021|2022|2023|2024|2025|2026';
    const idPattern = '[0-9]{3}|[BPL][0-9]{2}';

    const rollNumberRegex = new RegExp(
      `^(${deptPattern})(${yearPattern})(${idPattern})$`
    );

    // Filter by Roll Number Pattern
    const validStudents = allStudents.filter((student) => {
      // Normalize to uppercase
      const normalizedRoll = student.rollNumber.trim().toUpperCase();

      // Update the student object with the normalized roll number
      student.rollNumber = normalizedRoll;

      return rollNumberRegex.test(normalizedRoll);
    });

    // Deduplicate and Normalize
    const uniqueStudentsMap = new Map<string, StudentData>();

    validStudents.forEach((student) => {
      const rollKey = student.rollNumber; // Already normalized
      if (!uniqueStudentsMap.has(rollKey)) {
        // Normalize Department to Uppercase
        student.department = student.department.trim().toUpperCase();
        uniqueStudentsMap.set(rollKey, student);
      }
    });

    // Convert back to array
    const uniqueStudents = Array.from(uniqueStudentsMap.values());

    // Sort by name
    return uniqueStudents.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching SWC Funds data:', error);
    return []; // Return empty array on error
  }
};
