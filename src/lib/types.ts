export interface Submission {
  id: string;
  name: string;
  uniqueId: string;
  signature: string; // base64 data URI
  timestamp: string;
}
