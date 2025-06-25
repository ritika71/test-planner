'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signFormSchema, type SignFormValues } from '@/lib/schemas';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { getRows, appendRow } from '@/lib/sheets';
import type { Submission } from '@/lib/types';

const VALID_IDS = (process.env.VALID_IDS || 'VALID_ID_1,VALID_ID_2,VALID_ID_3').split(',');

export async function submitSignature(values: SignFormValues) {
  try {
    const validatedFields = signFormSchema.parse(values);

    if (!VALID_IDS.includes(validatedFields.uniqueId)) {
      return { success: false, error: 'ID not recognized. Please provide a valid ID.' };
    }

    let signatureData = validatedFields.signature;
    if (!signatureData) {
      try {
        const avatarResult = await generateAvatar({ userName: validatedFields.name });
        signatureData = avatarResult.avatarDataUri;
      } catch (aiError) {
        console.error('AI Avatar Generation Failed:', aiError);
        // Fallback to a placeholder if AI fails
        signatureData = `https://placehold.co/300x150.png?text=No+Signature`;
      }
    }

    const submissionData = {
      name: validatedFields.name,
      uniqueId: validatedFields.uniqueId,
      signature: signatureData,
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
    const headers = ['ID', 'Name', 'Unique ID', 'Timestamp', 'Signature Link'];
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
