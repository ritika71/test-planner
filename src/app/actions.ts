'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signFormSchema, type SignFormValues } from '@/lib/schemas';
import { getRows, appendRow } from '@/lib/sheets';
import type { Submission } from '@/lib/types';

export async function submitSignature(values: SignFormValues) {
  try {
    const validatedFields = signFormSchema.parse(values);

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
}
