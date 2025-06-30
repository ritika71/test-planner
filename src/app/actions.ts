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
    { email: 'harshtambakhe@weetechsolution.com', uniqueId: 'iJ2@kLMn3#op' },
    { email: 'chandrapal@weetechsolution.com', uniqueId: 'wX7&yZAb8*cd' },
    { email: 'chandan@weetechsolution.com', uniqueId: 'eF8*gHIj9(kl' },
    { email: 'ritika@weetechsolution.com', uniqueId: 'mN9(oPQr1)st' },
    { email: 'saifali@weetechsolution.com', uniqueId: 'uV1)wXYz2@ab' },
    { email: 'ajay@weetechsolution.com', uniqueId: 'cD2@eFGh3#ij' },
    { email: 'gauri@weetechsolution.com', uniqueId: 'kL3#mNOp4$qr' },
    { email: 'pankti@weetechsolution.com', uniqueId: 'sT4$uVWx5%yz' },
    { email: 'aniket@weetechsolution.com', uniqueId: 'aB5%cDEf6^gh' },
    { email: 'aniketsinh@weetechsolution.com', uniqueId: 'iJ6^kLMn7&op' },
    { email: 'kishansakariya@weetechsolution.com', uniqueId: 'qR7&sTUp8*vw' },
    { email: 'prince@weetechsolution.com', uniqueId: 'xY8*zABc9(de' },
    { email: 'dipika@weetechsolution.com', uniqueId: 'fG9(hIJk1)lm' },
    { email: 'sakshi@weetechsolution.com', uniqueId: 'nO1)pQRSt2@uv' },
    { email: 'smit@weetechsolution.com', uniqueId: 'wX2@yZAb3#cd' },
    { email: 'vipin@weetechsolution.com', uniqueId: 'eF3#gHIj4$kl' },
    { email: 'devanshi@weetechsolution.com', uniqueId: 'mN4$oPQr5%st' },
    { email: 'dhruv@weetechsolution.com', uniqueId: 'uV5%wXYz6^ab' },
    { email: 'umang@weetechsolution.com', uniqueId: 'cD6^eFGh7&ij' },
    { email: 'krutisaliya@weetechsolution.com', uniqueId: 'kL7&mNOp8*qr' },
    { email: 'arin@weetechsolution.com', uniqueId: 'sT8*uVWx9(yz' },
    { email: 'nikita@weetechsolution.com', uniqueId: 'aB9(cDEf1)gh' },
    { email: 'shaival@weetechsolution.com', uniqueId: 'iJ1)kLMn2@op' },
    { email: 'subham@weetechsolution.com', uniqueId: 'qR2@sTUp3#vw' },
    { email: 'parassheth@weetechsolution.com', uniqueId: 'xY3#zABc4$de' },
    { email: 'khushil@weetechsolution.com', uniqueId: 'fG4$hIJk5%lm' },
    { email: 'sahil@weetechsolution.com', uniqueId: 'nO5%pQRSt6^uv' },
    { email: 'jeelrajput@weetechsolution.com', uniqueId: 'wX6^yZAb7&cd' },
    { email: 'swati@weetechsolution.com', uniqueId: 'eF7&gHIj8*kl' },
    { email: 'heet@weetechsolution.com', uniqueId: 'mN8*oPQr9(st' },
    { email: 'anusree@weetechsolution.com', uniqueId: 'uV9(wXYz1)ab' },
    { email: 'tushar@weetechsolution.com', uniqueId: 'cD1)eFGh2@ij' },
    { email: 'manthan@weetechsolution.com', uniqueId: 'kL2@mNOp3#qr' },
    { email: 'ganeshsharma@weetechsolution.com', uniqueId: 'sT3#uVWx4$yz' },
    { email: 'mihir@weetechsolution.com', uniqueId: 'aB4$cDEf5%gh' },
    { email: 'jeel@weetechsolution.com', uniqueId: 'iJ5%kLMn6^op' },
    { email: 'jaysanchaniya@weetechsolution.com', uniqueId: 'qR6^sTUp7&vw' },
    { email: 'krutik@weetechsolution.com', uniqueId: 'xY7&zABc8*de' },
    { email: 'khevana@weetechsolution.com', uniqueId: 'fG8*hIJk9(lm' },
    { email: 'manish@weetechsolution.com', uniqueId: 'nO9(pQRSt1)uv' },
    { email: 'amit@weetechsolution.com', uniqueId: 'wX1)yZAb2@cd' },
    { email: 'yogesh@weetechsolution.com', uniqueId: 'eF2@gHIj3#kl' },
    { email: 'satya@weetechsolution.com', uniqueId: 'mN3#oPQr4$st' },
    { email: 'nikhilsuthar@weetechsolution.com', uniqueId: 'uV4$wXYz5%ab' },
    { email: 'julikumari@weetechsolution.com', uniqueId: 'cD5%eFGh6^ij' },
    { email: 'alisha@weetechsolution.com', uniqueId: 'kL6^mNOp7&qr' },
    { email: 'shweta@weetechsolution.com', uniqueId: 'sT7&uVWx8*yz' },
    { email: 'shubham@weetechsolution.com', uniqueId: 'aB8*cDEf9(gh' },
    { email: 'samrat@weetechsolution.com', uniqueId: 'iJ9(kLMn1)op' }
];

export async function submitSignature(values: SignFormValues) {
  try {
    const validatedFields = signFormSchema.parse(values);
    
    // New validation: Check if the provided email and uniqueId are in our list of valid employees.
    const isApproved = validEmployees.some(
      employee => 
        employee.email.toLowerCase() === validatedFields.email.toLowerCase() && 
        employee.uniqueId === validatedFields.uniqueId
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
