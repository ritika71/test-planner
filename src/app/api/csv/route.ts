import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRows } from '@/lib/sheets';
import type { Submission } from '@/lib/types';

// This helper function ensures that any field containing commas, quotes, or newlines
// is properly enclosed in double quotes, and any internal double quotes are escaped.
const formatCsvField = (field: string | null | undefined): string => {
    if (field === null || typeof field === 'undefined') {
        return '';
    }
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        const escapedStr = str.replace(/"/g, '""');
        return `"${escapedStr}"`;
    }
    return str;
};

export async function GET() {
    try {
        const isLoggedIn = cookies().get('signease-admin-auth')?.value === 'true';
        if (!isLoggedIn) {
            // Return a clear error response if not authorized
            return new NextResponse('Unauthorized: Access denied. Please log in as an admin.', { status: 401 });
        }

        const data = await getRows();
        const headers = ['ID', 'Name', 'Email', 'Unique ID', 'Timestamp', 'Signature Link'];
        const csvRows = [
            headers.join(','),
            ...data.map((row: Submission) => [
                formatCsvField(row.id),
                formatCsvField(row.name),
                formatCsvField(row.email),
                formatCsvField(row.uniqueId),
                formatCsvField(row.timestamp),
                (row.signature && row.signature.startsWith('data:')) ? 'Embedded' : formatCsvField(row.signature)
            ].join(','))
        ];
        const csvContent = csvRows.join('\n');

        // Return the CSV content as a downloadable file
        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="trip-submissions-${new Date().toISOString().split('T')[0]}.csv"`,
                'Content-Type': 'text/csv; charset=utf-8',
            },
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown server error occurred.";
        console.error("CSV Download API Error:", message);
        return new NextResponse(`Failed to generate CSV: ${message}`, { status: 500 });
    }
}
