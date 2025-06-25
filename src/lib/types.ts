export interface Submission {
  id: string;
  name: string;
  email: string;
  uniqueId: string;
  signature: string; // base64 data URI
  timestamp: string;
}
