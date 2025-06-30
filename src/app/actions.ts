'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signFormSchema, type SignFormValues } from '@/lib/schemas';
import { getRows, appendRow } from '@/lib/sheets';
import type { Submission } from '@/lib/types';

// For demonstration purposes, this is a hardcoded list of valid employees.
// In a real application, you would want to manage this list in a database
// or a separate, more secure configuration (like another Google Sheet tab).
const validEmployees = [
    { email: 'yash@weetechsolution.com', uniqueId: 'yash@weetechsolution.com' },
    { email: 'harshtambakhe@weetechsolution.com', uniqueId: 'harshtambakhe@weetechsolution.com' },
    { email: 'sagar@weetechsolution.com', uniqueId: 'sagar@weetechsolution.com' },
    { email: 'yagnik@weetechsolution.com', uniqueId: 'yagnik@weetechsolution.com' },
    { email: 'deepakkhunt@weetechsolution.com', uniqueId: 'deepakkhunt@weetechsolution.com' },
    { email: 'akash@weetechsolution.com', uniqueId: 'akash@weetechsolution.com' },
    { email: 'chandrapal@weetechsolution.com', uniqueId: 'chandrapal@weetechsolution.com' },
    { email: 'chandan@weetechsolution.com', uniqueId: 'chandan@weetechsolution.com' },
    { email: 'ritika@weetechsolution.com', uniqueId: 'ritika@weetechsolution.com' },
    { email: 'saifali@weetechsolution.com', uniqueId: 'saifali@weetechsolution.com' },
    { email: 'ajay@weetechsolution.com', uniqueId: 'ajay@weetechsolution.com' },
    { email: 'gauri@weetechsolution.com', uniqueId: 'gauri@weetechsolution.com' },
    { email: 'pankti@weetechsolution.com', uniqueId: 'pankti@weetechsolution.com' },
    { email: 'aniket@weetechsolution.com', uniqueId: 'aniket@weetechsolution.com' },
    { email: 'aniketsinh@weetechsolution.com', uniqueId: 'aniketsinh@weetechsolution.com' },
    { email: 'kishansakariya@weetechsolution.com', uniqueId: 'kishansakariya@weetechsolution.com' },
    { email: 'prince@weetechsolution.com', uniqueId: 'prince@weetechsolution.com' },
    { email: 'dipika@weetechsolution.com', uniqueId: 'dipika@weetechsolution.com' },
    { email: 'sakshi@weetechsolution.com', uniqueId: 'sakshi@weetechsolution.com' },
    { email: 'smit@weetechsolution.com', uniqueId: 'smit@weetechsolution.com' },
    { email: 'vipin@weetechsolution.com', uniqueId: 'vipin@weetechsolution.com' },
    { email: 'devanshi@weetechsolution.com', uniqueId: 'devanshi@weetechsolution.com' },
    { email: 'dhruv@weetechsolution.com', uniqueId: 'dhruv@weetechsolution.com' },
    { email: 'umang@weetechsolution.com', uniqueId: 'umang@weetechsolution.com' },
    { email: 'krutisaliya@weetechsolution.com', uniqueId: 'krutisaliya@weetechsolution.com' },
    { email: 'arin@weetechsolution.com', uniqueId: 'arin@weetechsolution.com' },
    { email: 'nikita@weetechsolution.com', uniqueId: 'nikita@weetechsolution.com' },
    { email: 'shaival@weetechsolution.com', uniqueId: 'shaival@weetechsolution.com' },
    { email: 'subham@weetechsolution.com', uniqueId: 'subham@weetechsolution.com' },
    { email: 'parassheth@weetechsolution.com', uniqueId: 'parassheth@weetechsolution.com' },
    { email: 'khushil@weetechsolution.com', uniqueId: 'khushil@weetechsolution.com' },
    { email: 'sahil@weetechsolution.com', uniqueId: 'sahil@weetechsolution.com' },
    { email: 'jeelrajput@weetechsolution.com', uniqueId: 'jeelrajput@weetechsolution.com' },
    { email: 'swati@weetechsolution.com', uniqueId: 'swati@weetechsolution.com' },
    { email: 'heet@weetechsolution.com', uniqueId: 'heet@weetechsolution.com' },
    { email: 'anusree@weetechsolution.com', uniqueId: 'anusree@weetechsolution.com' },
    { email: 'tushar@weetechsolution.com', uniqueId: 'tushar@weetechsolution.com' },
    { email: 'manthan@weetechsolution.com', uniqueId: 'manthan@weetechsolution.com' },
    { email: 'ganeshsharma@weetechsolution.com', uniqueId: 'ganeshsharma@weetechsolution.com' },
    { email: 'mihir@weetechsolution.com', uniqueId: 'mihir@weetechsolution.com' },
    { email: 'jeel@weetechsolution.com', uniqueId: 'jeel@weetechsolution.com' },
    { email: 'jaysanchaniya@weetechsolution.com', uniqueId: 'jaysanchaniya@weetechsolution.com' },
    { email: 'krutik@weetechsolution.com', uniqueId: 'krutik@weetechsolution.com' },
    { email: 'khevana@weetechsolution.com', uniqueId: 'khevana@weetechsolution.com' },
    { email: 'manish@weetechsolution.com', uniqueId: 'manish@weetechsolution.com' },
    { email: 'amit@weetechsolution.com', uniqueId: 'amit@weetechsolution.com' },
    { email: 'yogesh@weetechsolution.com', uniqueId: 'yogesh@weetechsolution.com' },
    { email: 'satya@weetechsolution.com', uniqueId: 'satya@weetechsolution.com' },
    { email: 'nikhilsuthar@weetechsolution.com', uniqueId: 'nikhilsuthar@weetechsolution.com' },
    { email: 'julikumari@weetechsolution.com', uniqueId: 'julikumari@weetechsolution.com' },
    { email: 'alisha@weetechsolution.com', uniqueId: 'alisha@weetechsolution.com' },
    { email: 'shweta@weetechsolution.com', uniqueId: 'shweta@weetechsolution.com' },
    { email: 'shubham@weetechsolution.com', uniqueId: 'shubham@weetechsolution.com' },
    { email: 'samrat@weetechsolution.com', uniqueId: 'samrat@weetechsolution.com' }
];

export async function submitSignature(values: SignFormValues) {
  try {
    const validatedFields = signFormSchema.parse(values);
    
    // New validation: Check if the provided email and uniqueId are in our list of valid employees.
    const isApproved = validEmployees.some(
      employee => 
        employee.email.toLowerCase() === validatedFields.email.toLowerCase() && 
        employee.uniqueId.toLowerCase() === validatedFields.uniqueId.toLowerCase()
    );

    if (!isApproved) {
      return { 
        success: false, 
        error: "This email and Unique ID pair is not on the approved list for the trip." 
      };
    }


    const submissionData = {
      name: validatedFields.name,
      email: validatedFields.email,
      uniqueId: validatedFields.uniqueId,
      signature: validatedFields.signature,
      timestamp: new Date().toISOString(),
    };
    
    await appendRow(submissionData);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the first validation error message. This will now include our custom rule.
      return { success: false, error: error.errors[0]?.message || 'Invalid data provided.' };
    }
    console.error('Submission Error:', error);

    const gerror = error as any;
    let errorMessage = 'An unexpected server error occurred. Please check the server logs for more details.';
    
    // Attempt to get a more specific message from the Google API error response
    if (gerror.errors && gerror.errors.length > 0 && gerror.errors[0].message) {
        errorMessage = gerror.errors[0].message;
    } else if (gerror.message) {
        errorMessage = gerror.message;
    }

    // Append helpful hints based on common error codes
    if (gerror.code === 403) {
        errorMessage += ' (Hint: This is a "Permission Denied" error. Please double-check that your service account has "Editor" permissions on the Google Sheet and that the Sheets API is enabled in your Google Cloud project.)';
    } else if (gerror.code === 404) {
        errorMessage += ' (Hint: This is a "Not Found" error. Please double-check your GOOGLE_SHEET_ID and GOOGLE_SHEET_NAME in the .env file.)';
    }
    
    return { success: false, error: errorMessage };
  }
}

export type AdminLoginFormState = {
  error?: string;
};

export async function adminLoginAction(
  prevState: AdminLoginFormState,
  formData: FormData
): Promise<AdminLoginFormState> {
  const password = formData.get('password') as string;
  if (!password) {
    return { error: 'Password is required.' };
  }
  
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  if (password === adminPassword) {
    cookies().set('signease-admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    redirect('/admin');
  }

  return { error: 'Invalid password.' };
}


export async function adminLogout() {
  cookies().delete('signease-admin-auth');
  redirect('/admin');
}

export async function getAdminData(): Promise<Submission[]> {
  const isLoggedIn = cookies().get('signease-admin-auth')?.value === 'true';
  if (!isLoggedIn) {
    throw new Error('Unauthorized');
  }
  return getRows();
}

const formatCsvField = (field: string | null | undefined): string => {
    if (field === null || typeof field === 'undefined') {
        return '';
    }
    const str = String(field);
    // If the field contains a comma, a double quote, or a newline, enclose it in double quotes.
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        // Escape any double quotes within the field by doubling them up.
        const escapedStr = str.replace(/"/g, '""');
        return `"${escapedStr}"`;
    }
    return str;
};

export async function downloadCsv() {
  try {
    const isLoggedIn = cookies().get('signease-admin-auth')?.value === 'true';
    if (!isLoggedIn) {
        throw new Error('Unauthorized');
    }
    const data = await getRows();
    const headers = ['ID', 'Name', 'Email', 'Unique ID', 'Timestamp', 'Signature Link'];
    const csvRows = [
        headers.join(','),
        ...data.map(row => [
            formatCsvField(row.id),
            formatCsvField(row.name),
            formatCsvField(row.email),
            formatCsvField(row.uniqueId),
            formatCsvField(row.timestamp),
            (row.signature && row.signature.startsWith('data:')) ? 'Embedded' : formatCsvField(row.signature)
        ].join(','))
    ];
    return csvRows.join('\n');
  } catch(error) {
    const message = error instanceof Error ? error.message : "An unknown server error occurred.";
    console.error("CSV Download Error:", message);
    // We can't return a Response here, so we throw to be caught by the client-side.
    throw new Error(`Failed to generate CSV: ${message}`);
  }
}
