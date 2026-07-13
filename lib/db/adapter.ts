export interface LeadRecord {
  id: string;
  sessionId: string;
  email: string;
  name?: string;
  locale: string;
  source: string;
  intent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  submittedAt: string; // ISO String
  retentionDate: string; // ISO String (24 months retention per PDPL)
  deletedAt?: string; // Nullable if deleted
}

export interface TranscriptMessage {
  sender: string;
  text: string;
  ts?: string;
}

export interface TranscriptRecord {
  id: string;
  sessionId: string;
  leadId?: string;
  messages: TranscriptMessage[];
  locale: string;
  createdAt: string; // ISO String
  retentionDate: string; // ISO String
  deletedAt?: string;
}

export interface DbAdapter {
  saveLead(
    lead: Omit<LeadRecord, "id" | "submittedAt" | "retentionDate">
  ): Promise<LeadRecord>;
  findLead(sessionId: string): Promise<LeadRecord | null>;
  deleteLead(id: string): Promise<void>;
  saveTranscript(
    transcript: Omit<TranscriptRecord, "id" | "createdAt" | "retentionDate">
  ): Promise<TranscriptRecord>;
  findTranscript(sessionId: string): Promise<TranscriptRecord | null>;
  deleteTranscript(id: string): Promise<void>;
  pruneExpired(): Promise<number>; // deletes records past retention date, returns count
}
