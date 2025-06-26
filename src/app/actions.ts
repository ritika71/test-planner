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
      return { success: false, error: 'Invalid data provided.' };
    }
    console.error('Submission Error:', error);

    const gerror = error as any;
    let errorMessage = 'An unexpected server error occurred. Please check the server logs.';
    
    if (gerror.errors && gerror.errors.length > 0 && gerror.errors[0].message) {
        errorMessage = gerror.errors[0].message;
    } else if (gerror.message) {
        errorMessage = gerror.message;
    }

    // Add specific hints for common Google Sheets API errors
    if (gerror.code === 403) {
        errorMessage = 'Permission Denied. Please ensure the service account has "Editor" permissions for the Google Sheet.';
    } else if (gerror.code === 404) {
        errorMessage = 'Sheet Not Found. Please double-check your GOOGLE_SHEET_ID.';
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
            row.id,
            `"${row.name}"`,
            row.email,
            row.uniqueId,
            row.timestamp,
            row.signature.startsWith('data:') ? 'Embedded' : row.signature
        ].join(','))
    ];
    return csvRows.join('\n');
}
