import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { DbAdapter, LeadRecord, TranscriptRecord } from "./adapter";

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const isTransient =
        err.name === "PrismaClientInitializationError" ||
        err.name === "PrismaClientRustPanicError" ||
        (err.code && ["P2024", "P2028"].includes(err.code)) ||
        /connection|timeout|pool|deadlock|econnrefused/i.test(err.message);
      if (!isTransient || i === retries - 1) {
        throw err;
      }
      console.warn(`[db:prisma] Transient database error. Retrying (${i + 1}/${retries})...`, err.message);
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw lastErr;
}

function isConnectionError(err: any): boolean {
  if (!err) return false;
  return (
    err.name === "PrismaClientInitializationError" ||
    err.name === "PrismaClientRustPanicError" ||
    (err.code && ["P2024", "P2028"].includes(err.code)) ||
    /connection|timeout|pool|deadlock|econnrefused/i.test(err.message)
  );
}

export class PrismaDbAdapter implements DbAdapter {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    this.pool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  async saveLead(
    lead: Omit<LeadRecord, "id" | "submittedAt" | "retentionDate">
  ): Promise<LeadRecord> {
    const id = this.generateId();
    const now = new Date();
    const retentionDate = new Date(now);
    retentionDate.setMonth(retentionDate.getMonth() + 24);

    const record: LeadRecord = {
      ...lead,
      id,
      submittedAt: now.toISOString(),
      retentionDate: retentionDate.toISOString(),
    };

    try {
      await withRetry(async () => {
        // FR-OPS-014 §1.3: Run lead insert & transcript linking atomically inside a transaction
        await this.prisma.$transaction(async (tx) => {
          await tx.lead.create({
            data: {
              id,
              sessionId: lead.sessionId,
              email: lead.email,
              name: lead.name || null,
              locale: lead.locale,
              source: lead.source,
              intent: lead.intent || null,
              utmSource: lead.utmSource || null,
              utmMedium: lead.utmMedium || null,
              utmCampaign: lead.utmCampaign || null,
              submittedAt: now,
              retentionDate,
            },
          });

          // Find existing transcript for this session and link it
          const existingTranscript = await tx.transcript.findFirst({
            where: {
              sessionId: lead.sessionId,
              leadId: null,
              deletedAt: null,
            },
          });

          if (existingTranscript) {
            await tx.transcript.update({
              where: { id: existingTranscript.id },
              data: { leadId: id },
            });
          }
        });
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout, failing safe to no-op", err.message);
        return record;
      }
      throw err;
    }

    return record;
  }

  async findLead(sessionId: string): Promise<LeadRecord | null> {
    try {
      return await withRetry(async () => {
        const lead = await this.prisma.lead.findFirst({
          where: { sessionId, deletedAt: null },
        });
        if (!lead) return null;
        return {
          id: lead.id,
          sessionId: lead.sessionId,
          email: lead.email,
          name: lead.name || undefined,
          locale: lead.locale,
          source: lead.source,
          intent: lead.intent || undefined,
          utmSource: lead.utmSource || undefined,
          utmMedium: lead.utmMedium || undefined,
          utmCampaign: lead.utmCampaign || undefined,
          submittedAt: lead.submittedAt.toISOString(),
          retentionDate: lead.retentionDate.toISOString(),
          deletedAt: lead.deletedAt ? lead.deletedAt.toISOString() : undefined,
        };
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout in findLead, failing safe", err.message);
        return null;
      }
      throw err;
    }
  }

  async deleteLead(id: string): Promise<void> {
    try {
      await withRetry(async () => {
        await this.prisma.lead.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout in deleteLead, failing safe", err.message);
        return;
      }
      throw err;
    }
  }

  async saveTranscript(
    transcript: Omit<TranscriptRecord, "id" | "createdAt" | "retentionDate">
  ): Promise<TranscriptRecord> {
    const id = this.generateId();
    const now = new Date();
    const retentionDate = new Date(now);
    retentionDate.setMonth(retentionDate.getMonth() + 24);

    const record: TranscriptRecord = {
      ...transcript,
      id,
      createdAt: now.toISOString(),
      retentionDate: retentionDate.toISOString(),
    };

    try {
      await withRetry(async () => {
        await this.prisma.$transaction(async (tx) => {
          // Check if there is an existing lead with same sessionId
          const existingLead = await tx.lead.findFirst({
            where: { sessionId: transcript.sessionId, deletedAt: null },
          });
          const leadId = existingLead ? existingLead.id : (transcript.leadId || null);

          // Upsert transcript by sessionId to keep one per session (matches memory behavior)
          const existingTranscript = await tx.transcript.findFirst({
            where: { sessionId: transcript.sessionId, deletedAt: null },
          });

          if (existingTranscript) {
            const updated = await tx.transcript.update({
              where: { id: existingTranscript.id },
              data: {
                messages: transcript.messages as any,
                locale: transcript.locale,
                leadId: leadId || existingTranscript.leadId,
              },
            });
            record.id = updated.id;
            record.createdAt = updated.createdAt.toISOString();
            record.leadId = updated.leadId || undefined;
          } else {
            const created = await tx.transcript.create({
              data: {
                id,
                sessionId: transcript.sessionId,
                leadId,
                messages: transcript.messages as any,
                locale: transcript.locale,
                createdAt: now,
                retentionDate,
              },
            });
            record.id = created.id;
            record.createdAt = created.createdAt.toISOString();
            record.leadId = created.leadId || undefined;
          }
        });
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout in saveTranscript, failing safe", err.message);
        return record;
      }
      throw err;
    }

    return record;
  }

  async findTranscript(sessionId: string): Promise<TranscriptRecord | null> {
    try {
      return await withRetry(async () => {
        const transcript = await this.prisma.transcript.findFirst({
          where: { sessionId, deletedAt: null },
        });
        if (!transcript) return null;
        return {
          id: transcript.id,
          sessionId: transcript.sessionId,
          leadId: transcript.leadId || undefined,
          messages: transcript.messages as any,
          locale: transcript.locale,
          createdAt: transcript.createdAt.toISOString(),
          retentionDate: transcript.retentionDate.toISOString(),
          deletedAt: transcript.deletedAt ? transcript.deletedAt.toISOString() : undefined,
        };
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout in findTranscript, failing safe", err.message);
        return null;
      }
      throw err;
    }
  }

  async deleteTranscript(id: string): Promise<void> {
    try {
      await withRetry(async () => {
        await this.prisma.transcript.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout in deleteTranscript, failing safe", err.message);
        return;
      }
      throw err;
    }
  }

  async pruneExpired(): Promise<number> {
    try {
      return await withRetry(async () => {
        const now = new Date();
        return await this.prisma.$transaction(async (tx) => {
          const leadsResult = await tx.lead.updateMany({
            where: {
              retentionDate: { lt: now },
              deletedAt: null,
            },
            data: {
              deletedAt: now,
            },
          });

          const transcriptsResult = await tx.transcript.updateMany({
            where: {
              retentionDate: { lt: now },
              deletedAt: null,
            },
            data: {
              deletedAt: now,
            },
          });

          return leadsResult.count + transcriptsResult.count;
        });
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout in pruneExpired, failing safe", err.message);
        return 0;
      }
      throw err;
    }
  }

  async getTeardownCountThisWeek(): Promise<number> {
    try {
      return await withRetry(async () => {
        const start = new Date();
        const day = start.getUTCDay();
        const diff = start.getUTCDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(start.setUTCDate(diff));
        startOfWeek.setUTCHours(0, 0, 0, 0);

        return await this.prisma.lead.count({
          where: {
            source: "teardown",
            submittedAt: { gte: startOfWeek },
            deletedAt: null,
          },
        });
      });
    } catch (err: any) {
      if (isConnectionError(err)) {
        console.warn("[db:prisma] Connection timeout in count, failing safe to 0", err.message);
        return 0;
      }
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    await this.pool.end();
  }
}
