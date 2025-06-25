// This is a mock implementation of a Google Sheets API helper.
// In a real application, you would use the 'googleapis' library to interact with Google Sheets.
import type { Submission } from './types';

// Mock database
const mockSheetData: Submission[] = [
    {
        id: '1',
        name: 'Jane Doe',
        uniqueId: 'test1@example.com',
        signature: 'https://placehold.co/300x150.png',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        name: 'Peter Jones',
        uniqueId: 'test2@example.com',
        signature: 'https://placehold.co/300x150.png',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export async function appendRow(data: Omit<Submission, 'id'>): Promise<void> {
  // In a real app, you would use the Google Sheets API to append a new row.
  // Example:
  /*
  const { google } = require('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A:D',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[data.name, data.uniqueId, data.signature, data.timestamp]],
    },
  });
  */
  
  console.log('MOCK: Appending to sheet:', data);
  const newEntry: Submission = {
    ...data,
    id: (mockSheetData.length + 1).toString(),
  }
  mockSheetData.push(newEntry);
  return Promise.resolve();
}

export async function getRows(): Promise<Submission[]> {
  // In a real app, you would fetch data from the Google Sheet.
  console.log('MOCK: Fetching rows from sheet.');
  return Promise.resolve(mockSheetData.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
}
