'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signFormSchema, type SignFormValues } from '@/lib/schemas';
import { getRows, appendRow } from '@/lib/sheets';
import type { Submission } from '@/lib/types';

const VALID_IDS = (process.env.VALID_IDS || 'test1@example.com,test2@example.com,test3@example.com').split(',');

export async function submitSignature(values: SignFormValues) {
  try {
    const validatedFields = signFormSchema.parse(values);

    if (!VALID_IDS.includes(validatedFields.email)) {
      return { success: false, error: 'Email not recognized. Please provide a valid email.' };
    }

    const submissionData = {
      name: validatedFields.name,
      uniqueId: validatedFields.email,
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
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

export async function adminLogin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  if (password === adminPassword) {
    cookies().set('signease-admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid password.' };
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
    const headers = ['ID', 'Name', 'Email', 'Timestamp', 'Signature Link'];
    const csvRows = [
        headers.join(','),
        ...data.map(row => [
            row.id,
            `"${row.name}"`,
            row.uniqueId,
            row.timestamp,
            row.signature.startsWith('data:') ? 'Embedded' : row.signature
        ].join(','))
    ];
    return csvRows.join('\n');
}
