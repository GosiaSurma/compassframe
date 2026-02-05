import { db } from "./lib/database";
import {
    gameSessions,
    gameMessages,
    relays,
    type GameSession,
    type GameMessage,
    type Relay,
    type CreateSessionRequest,
    type CreateRelayRequest
} from "../_shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
    createSession(userId: string, data: CreateSessionRequest & { openingQuestion?: string }): Promise<GameSession>;
    getSession(id: number): Promise<GameSession | undefined>;
    updateSession(id: number, updates: Partial<GameSession>): Promise<GameSession>;
    createMessage(sessionId: number, cycle: number, turn: number, mode: string, userText: string, assistantText: string, highlights?: any): Promise<GameMessage>;
    getSessionMessages(sessionId: number, cycle?: number): Promise<GameMessage[]>;
    createRelay(fromUserId: string, fromRole: string, data: CreateRelayRequest): Promise<Relay>;
    getUserRelays(userId: string): Promise<Relay[]>;
}

export class DatabaseStorage implements IStorage {
    async createSession(userId: string, data: CreateSessionRequest & { openingQuestion?: string }): Promise<GameSession> {
        const [session] = await db.insert(gameSessions).values({
            userId,
            role: data.role,
            shadowId: data.shadowId,
            shadowCustom: data.shadowCustom,
            openingQuestion: data.openingQuestion,
            status: "active",
            turn: 1,
            accumulatedScores: {},
            spell: {},
        }).returning();
        return session;
    }

    async getSession(id: number): Promise<GameSession | undefined> {
        const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
        return session;
    }

    async updateSession(id: number, updates: Partial<GameSession>): Promise<GameSession> {
        const [updated] = await db.update(gameSessions)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(gameSessions.id, id))
            .returning();
        return updated;
    }

    async createMessage(sessionId: number, cycle: number, turn: number, mode: string, userText: string, assistantText: string, highlights?: any): Promise<GameMessage> {
        const [message] = await db.insert(gameMessages).values({
            sessionId,
            cycle,
            turn,
            mode,
            userText,
            assistantText,
            highlights,
        }).returning();
        return message;
    }

    async getSessionMessages(sessionId: number, cycle?: number): Promise<GameMessage[]> {
        if (cycle !== undefined) {
            return await db.select()
                .from(gameMessages)
                .where(and(eq(gameMessages.sessionId, sessionId), eq(gameMessages.cycle, cycle)))
                .orderBy(gameMessages.turn);
        }
        return await db.select()
            .from(gameMessages)
            .where(eq(gameMessages.sessionId, sessionId))
            .orderBy(gameMessages.turn);
    }

    async createRelay(fromUserId: string, fromRole: string, data: CreateRelayRequest): Promise<Relay> {
        const [relay] = await db.insert(relays).values({
            fromUserId,
            toUserId: data.toUserId,
            fromRole,
            type: data.type,
            text: data.text,
            shadowId: data.shadowId,
        }).returning();
        return relay;
    }

    async getUserRelays(userId: string): Promise<Relay[]> {
        return await db.select()
            .from(relays)
            .where(eq(relays.toUserId, userId))
            .orderBy(desc(relays.createdAt));
    }
}

export class MemStorage implements IStorage {
    private sessions: Map<number, GameSession>;
    private messages: Map<number, GameMessage>;
    private relays: Map<number, Relay>;
    private currentSessionId: number;
    private currentMessageId: number;
    private currentRelayId: number;

    constructor() {
        this.sessions = new Map();
        this.messages = new Map();
        this.relays = new Map();
        this.currentSessionId = 1;
        this.currentMessageId = 1;
        this.currentRelayId = 1;
    }

    async createSession(userId: string, data: CreateSessionRequest & { openingQuestion?: string }): Promise<GameSession> {
        const id = this.currentSessionId++;
        const session: GameSession = {
            id,
            userId,
            role: data.role,
            shadowId: data.shadowId || null,
            shadowCustom: data.shadowCustom || null,
            companionId: null,
            artifactType: null,
            status: "active",
            turn: 1,
            cycle: 1,
            accumulatedScores: {},
            miMetrics: null,
            encounterState: null,
            artifactDraft: null,
            spell: {},
            openingQuestion: data.openingQuestion || null,
            crystallizedEssenceId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.sessions.set(id, session);
        return session;
    }

    async getSession(id: number): Promise<GameSession | undefined> {
        return this.sessions.get(id);
    }

    async updateSession(id: number, updates: Partial<GameSession>): Promise<GameSession> {
        const session = this.sessions.get(id);
        if (!session) throw new Error("Session not found");
        const updatedSession = { ...session, ...updates, updatedAt: new Date() };
        this.sessions.set(id, updatedSession);
        return updatedSession;
    }

    async createMessage(sessionId: number, cycle: number, turn: number, mode: string, userText: string, assistantText: string, highlights?: any): Promise<GameMessage> {
        const id = this.currentMessageId++;
        const message: GameMessage = {
            id,
            sessionId,
            cycle,
            turn,
            mode,
            userText: userText || null, // handle potential undefined? schema says text
            assistantText: assistantText || null,
            highlights: highlights || null,
            createdAt: new Date()
        };
        this.messages.set(id, message);
        return message;
    }

    async getSessionMessages(sessionId: number, cycle?: number): Promise<GameMessage[]> {
        const msgs = Array.from(this.messages.values()).filter(m => m.sessionId === sessionId);
        if (cycle !== undefined) {
            return msgs.filter(m => m.cycle === cycle).sort((a, b) => a.turn - b.turn);
        }
        return msgs.sort((a, b) => a.turn - b.turn);
    }

    async createRelay(fromUserId: string, fromRole: string, data: CreateRelayRequest): Promise<Relay> {
        const id = this.currentRelayId++;
        const relay: Relay = {
            id,
            fromUserId,
            toUserId: data.toUserId || null,
            fromRole,
            type: data.type,
            text: data.text,
            shadowId: data.shadowId || null,
            createdAt: new Date(),
            readAt: null
        };
        this.relays.set(id, relay);
        return relay;
    }

    async getUserRelays(userId: string): Promise<Relay[]> {
        return Array.from(this.relays.values())
            .filter(r => r.toUserId === userId)
            .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    }
}

export const storage = new MemStorage();
