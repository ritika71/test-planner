// src/lib/sheets.ts
import { google } from 'googleapis';
import type { Submission } from './types';

// This is the main configuration for the Google Sheets API.
// IMPORTANT: You must set up a Google Cloud project with the Sheets API enabled,
// create a service account, and share your Google Sheet with the service account's email.
// Then, create a .env file in the root of your project and add the following:
//
// GOOGLE_SHEET_ID=your_sheet_id_here
// GOOGLE_SHEET_NAME=your_tab_name_here (e.g., "Sheet1")
// GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
// GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_private_key_here\n-----END PRIVATE KEY-----\n"
//
// To bypass this for local development, you can set MOCK_SHEETS_API=true in your .env file.

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
const RANGE = `${SHEET_NAME}!A:E`; // Assumes data is in columns A through E

const useMock = process.env.MOCK_SHEETS_API === 'true';

// This function checks if all required environment variables are set.
const checkCredentials = () => {
    if (
        !process.env.GOOGLE_SHEETS_CLIENT_EMAIL ||
        !process.env.GOOGLE_SHEETS_PRIVATE_KEY ||
        !SPREADSHEET_ID ||
        SPREADSHEET_ID === 'your_sheet_id_here'
    ) {
        throw new Error('Google Sheets API credentials are not fully configured in the .env file. Please provide GOOGLE_SHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY. To work locally without a real sheet, set MOCK_SHEETS_API=true in the .env file.');
    }
}

// Configure the Google Sheets API client
const getSheetsClient = () => {
    checkCredentials();
    const credentials = {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
}


export async function appendRow(data: Omit<Submission, 'id'>): Promise<void> {
    if (useMock) {
        console.log('MOCK MODE: Appending to sheet:', data);
        console.log('MOCK MODE: To see data in your sheet, set MOCK_SHEETS_API=false in .env');
        // In mock mode, we do nothing.
        return Promise.resolve();
    }
    
    const sheets = getSheetsClient();
    try {
        // We assume the sheet columns are in this order:
        // Timestamp, Name, Email, Unique ID, Signature
        const values = [[
            data.timestamp,
            data.name,
            data.email,
            data.uniqueId,
            data.signature,
        ]];
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values,
            },
        });

    } catch (error) {
        console.error('Error appending row to Google Sheet:', error);
        console.error(`DEBUG: Attempted to write to Sheet ID: ${SPREADSHEET_ID}`);
        console.error(`DEBUG: Attempted to write to Sheet Name: ${SHEET_NAME}`);
        console.error(`DEBUG: Using Service Account Email starting with: ${process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.substring(0, 15)}...`);
        throw error;
    }
}

export async function getRows(): Promise<Submission[]> {
    if (useMock) {
        console.log('MOCK MODE: Fetching rows from sheet.');
        // In mock mode, we return some sample data for previewing the admin panel.
        return Promise.resolve([
            {
                id: '1',
                timestamp: new Date().toISOString(),
                name: 'John Doe (Sample)',
                email: 'john.doe@example.com',
                uniqueId: 'MOCK-123',
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                name: 'Jane Smith (Sample)',
                email: 'jane.smith@example.com',
                uniqueId: 'MOCK-456',
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            }
        ]);
    }

    const sheets = getSheetsClient();
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) { // <=1 to account for header
            return [];
        }

        // We skip the first row (header) with .slice(1)
        // Then map the sheet rows to Submission objects.
        return rows.slice(1).map((row, index) => ({
            id: (index + 2).toString(), // +2 because sheets are 1-indexed and we sliced the header
            timestamp: row[0] || '',
            name: row[1] || '',
            email: row[2] || '',
            uniqueId: row[3] || '',
            signature: row[4] || '',
        })).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (error) {
        const gerror = error as any;
        console.error('Error fetching rows from Google Sheet:', gerror.message);
        console.error(`DEBUG: Attempted to read from Sheet ID: ${SPREADSHEET_ID}`);
        console.error(`DEBUG: Attempted to read from Sheet Name: ${SHEET_NAME}`);
        console.error(`DEBUG: Using Service Account Email starting with: ${process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.substring(0, 15)}...`);
        if (gerror.code === 404 || gerror.code === 403) {
            console.error("Sheet not found or permission denied. Please check your GOOGLE_SHEET_ID and sharing settings.");
        }
        return [];
    }
}
