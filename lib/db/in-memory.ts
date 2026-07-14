import { DbAdapter, LeadRecord, TranscriptRecord } from "./adapter";

// Module-level global maps to persist data in memory across requests in dev/test
const leadsDb = new Map<string, LeadRecord>();
const transcriptsDb = new Map<string, TranscriptRecord>();

export class InMemoryAdapter implements DbAdapter {
  private generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  async saveLead(
    lead: Omit<LeadRecord, "id" | "submittedAt" | "retentionDate">
  ): Promise<LeadRecord> {
    const id = this.generateId();
    const now = new Date();
    const submittedAt = now.toISOString();
    
    // Stated retention: 24 months for leads (PDPL compliance)
    const retention = new Date(now);
    retention.setMonth(retention.getMonth() + 24);
    const retentionDate = retention.toISOString();

    const record: LeadRecord = {
      ...lead,
      id,
      submittedAt,
      retentionDate,
    };

    // Stored in map, keyed by sessionId (or id)
    leadsDb.set(record.sessionId, record);
    return record;
  }

  async findLead(sessionId: string): Promise<LeadRecord | null> {
    const record = leadsDb.get(sessionId);
    if (!record || record.deletedAt) return null;
    return record;
  }

  async deleteLead(id: string): Promise<void> {
    // Find the record by id and mark it deleted / remove it
    for (const [sid, record] of leadsDb.entries()) {
      if (record.id === id) {
        leadsDb.set(sid, { ...record, deletedAt: new Date().toISOString() });
        break;
      }
    }
  }

  async saveTranscript(
    transcript: Omit<TranscriptRecord, "id" | "createdAt" | "retentionDate">
  ): Promise<TranscriptRecord> {
    const id = this.generateId();
    const now = new Date();
    const createdAt = now.toISOString();

    // Stated retention: 24 months for transcripts
    const retention = new Date(now);
    retention.setMonth(retention.getMonth() + 24);
    const retentionDate = retention.toISOString();

    const record: TranscriptRecord = {
      ...transcript,
      id,
      createdAt,
      retentionDate,
    };

    // Index by sessionId
    transcriptsDb.set(record.sessionId, record);
    return record;
  }

  async findTranscript(sessionId: string): Promise<TranscriptRecord | null> {
    const record = transcriptsDb.get(sessionId);
    if (!record || record.deletedAt) return null;
    return record;
  }

  async deleteTranscript(id: string): Promise<void> {
    for (const [sid, record] of transcriptsDb.entries()) {
      if (record.id === id) {
        transcriptsDb.set(sid, { ...record, deletedAt: new Date().toISOString() });
        break;
      }
    }
  }

  async pruneExpired(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [sid, record] of leadsDb.entries()) {
      if (!record.deletedAt && new Date(record.retentionDate) < now) {
        leadsDb.set(sid, { ...record, deletedAt: now.toISOString() });
        count++;
      }
    }

    for (const [sid, record] of transcriptsDb.entries()) {
      if (!record.deletedAt && new Date(record.retentionDate) < now) {
        transcriptsDb.set(sid, { ...record, deletedAt: now.toISOString() });
        count++;
      }
    }

    return count;
  }

  // Helper for tests to inspect store size
  getLeadsCount(): number {
    return Array.from(leadsDb.values()).filter((r) => !r.deletedAt).length;
  }

  getTranscriptsCount(): number {
    return Array.from(transcriptsDb.values()).filter((r) => !r.deletedAt).length;
  }

  getLeadsMap() {
    return leadsDb;
  }

  getTranscriptsMap() {
    return transcriptsDb;
  }

  async getTeardownCountThisWeek(): Promise<number> {
    const start = new Date();
    const day = start.getUTCDay();
    const diff = start.getUTCDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(start.setUTCDate(diff));
    startOfWeek.setUTCHours(0, 0, 0, 0);
    const startIso = startOfWeek.toISOString();

    return Array.from(leadsDb.values()).filter(
      (r) => !r.deletedAt && r.source === "teardown" && r.submittedAt >= startIso
    ).length;
  }

  clearAll(): void {
    leadsDb.clear();
    transcriptsDb.clear();
  }
}
