import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth.js";
export * from "./models/chat.js";

// === MI METRICS TYPE ===
export type MiMetrics = {
  // Reflection tracking
  complexReflections: number;
  simpleReflections: number;
  // Question tracking
  openQuestions: number;
  closedQuestions: number;
  // Other MI behaviors
  affirmations: number;
  adviceWithPermission: number;
  adviceWithoutPermission: number; // MI-inconsistent
  miInconsistent: number; // confrontation, blaming, moralizing, persuasion
  // Summary tracking
  turnsSinceLastSummary: number;
  // Change/sustain talk detection
  lastChangeTalk: string | null; // 'desire' | 'ability' | 'reasons' | 'need' | 'commitment' | 'steps' | null
  lastSustainTalk: boolean;
  // Response length tracking
  totalUserWords: number;
  totalAssistantWords: number;
  responseLengthViolations: number; // times AI exceeded 50% of user word count
  // Per-turn tracking
  lastTurnQuestionCount: number; // to enforce max 2 questions per turn
  questionsPerTurnViolations: number; // times AI used >2 questions
  // Turn template tracking
  turnTemplateViolations: number; // times AI didn't follow complex→simple→question template
};

export const DEFAULT_MI_METRICS: MiMetrics = {
  complexReflections: 0,
  simpleReflections: 0,
  openQuestions: 0,
  closedQuestions: 0,
  affirmations: 0,
  adviceWithPermission: 0,
  adviceWithoutPermission: 0,
  miInconsistent: 0,
  turnsSinceLastSummary: 0,
  lastChangeTalk: null,
  lastSustainTalk: false,
  totalUserWords: 0,
  totalAssistantWords: 0,
  responseLengthViolations: 0,
  lastTurnQuestionCount: 0,
  questionsPerTurnViolations: 0,
  turnTemplateViolations: 0,
};

// === ENCOUNTER STATE TYPE ===
export type EncounterChoice = {
  id: number;
  text: string;
  delta: { calm: number; understanding: number; boundary: number };
  outcome: string;
};

export type EncounterScene = {
  title: string;
  narrative: string;
  companionHint: string;
  choices: EncounterChoice[];
};

export type EncounterChoiceRecord = {
  sceneIndex: number;
  choiceId: number;
  choiceText: string;
  outcome: string;
  delta: { calm: number; understanding: number; boundary: number };
  essenceId?: string;
};

export type EncounterState = {
  conversationSummary: string; // key themes from reflection
  sceneIndex: number; // 0-3 (approach, threshold, exchange, integration)
  choiceLog: EncounterChoiceRecord[]; // full details of choices made
  scores: { calm: number; understanding: number; boundary: number };
  currentScene: EncounterScene | null; // the current scene to display
  isComplete: boolean;
  chosenEssenceId?: string; // explicitly chosen essence from choice 4
};

export const DEFAULT_ENCOUNTER_STATE: EncounterState = {
  conversationSummary: "",
  sceneIndex: 0,
  choiceLog: [],
  scores: { calm: 0, understanding: 0, boundary: 0 },
  currentScene: null,
  isComplete: false,
};

// === ARTIFACT DRAFT TYPE ===
export type ArtifactDraft = {
  type: 'scroll' | 'crystal' | 'potion';
  text: string;
  essenceHighlights: string[];
  encounterSummary: string;
};

// === GAME SESSIONS ===
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // 'parent' or 'teen'
  shadowId: text("shadow_id"),
  shadowCustom: text("shadow_custom"),
  companionId: text("companion_id"),
  artifactType: text("artifact_type"), // 'scroll', 'crystal', 'potion'
  status: text("status").notNull().default("active"), // active, awaiting_crystallize, crystallized, companion_active
  turn: integer("turn").notNull().default(1),
  cycle: integer("cycle").notNull().default(1), // Track how many crystallization cycles
  accumulatedScores: jsonb("accumulated_scores"),
  miMetrics: jsonb("mi_metrics"), // MI compliance tracking
  encounterState: jsonb("encounter_state"), // Dynamic encounter state
  artifactDraft: jsonb("artifact_draft"), // Generated artifact text
  spell: jsonb("spell"),
  openingQuestion: text("opening_question"), // LLM-generated opening question for reflection
  crystallizedEssenceId: text("crystallized_essence_id"), // User-selected essence from top 4
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === GAME MESSAGES ===
export const gameMessages = pgTable("game_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  cycle: integer("cycle").notNull().default(1), // Which crystallization cycle this message belongs to
  turn: integer("turn").notNull(),
  mode: text("mode").notNull(), // 'reflect', 'battle'
  userText: text("user_text"),
  assistantText: text("assistant_text"),
  highlights: jsonb("highlights"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELAYS ===
export const relays = pgTable("relays", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id"),
  fromRole: text("from_role").notNull(),
  type: text("type").notNull(), // 'scroll', 'crystal', 'potion'
  text: text("text").notNull(),
  shadowId: text("shadow_id"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// === RELATIONS ===
export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  messages: many(gameMessages),
}));

export const gameMessagesRelations = relations(gameMessages, ({ one }) => ({
  session: one(gameSessions, {
    fields: [gameMessages.sessionId],
    references: [gameSessions.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGameMessageSchema = createInsertSchema(gameMessages).omit({ id: true, createdAt: true });
export const insertRelaySchema = createInsertSchema(relays).omit({ id: true, createdAt: true, readAt: true });

// === TYPES ===
export type GameSession = typeof gameSessions.$inferSelect;
export type GameMessage = typeof gameMessages.$inferSelect;
export type Relay = typeof relays.$inferSelect;

export type CreateSessionRequest = {
  role: 'parent' | 'teen';
  shadowId?: string;
  shadowCustom?: string;
};

export type SubmitTurnRequest = {
  userText: string;
  mode: 'reflect' | 'battle';
};

export type CreateRelayRequest = {
  type: 'scroll' | 'crystal' | 'potion';
  text: string;
  shadowId?: string;
  toUserId?: string;
};

export type ShadowCatalogItem = {
  id: string;
  label: string;
  description: string;
};
import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";
export * from "./models/chat";

// === MI METRICS TYPE ===
export type MiMetrics = {
  // Reflection tracking
  complexReflections: number;
  simpleReflections: number;
  // Question tracking
  openQuestions: number;
  closedQuestions: number;
  // Other MI behaviors
  affirmations: number;
  adviceWithPermission: number;
  adviceWithoutPermission: number; // MI-inconsistent
  miInconsistent: number; // confrontation, blaming, moralizing, persuasion
  // Summary tracking
  turnsSinceLastSummary: number;
  // Change/sustain talk detection
  lastChangeTalk: string | null; // 'desire' | 'ability' | 'reasons' | 'need' | 'commitment' | 'steps' | null
  lastSustainTalk: boolean;
  // Response length tracking
  totalUserWords: number;
  totalAssistantWords: number;
  responseLengthViolations: number; // times AI exceeded 50% of user word count
  // Per-turn tracking
  lastTurnQuestionCount: number; // to enforce max 2 questions per turn
  questionsPerTurnViolations: number; // times AI used >2 questions
  // Turn template tracking
  turnTemplateViolations: number; // times AI didn't follow complex→simple→question template
};

export const DEFAULT_MI_METRICS: MiMetrics = {
  complexReflections: 0,
  simpleReflections: 0,
  openQuestions: 0,
  closedQuestions: 0,
  affirmations: 0,
  adviceWithPermission: 0,
  adviceWithoutPermission: 0,
  miInconsistent: 0,
  turnsSinceLastSummary: 0,
  lastChangeTalk: null,
  lastSustainTalk: false,
  totalUserWords: 0,
  totalAssistantWords: 0,
  responseLengthViolations: 0,
  lastTurnQuestionCount: 0,
  questionsPerTurnViolations: 0,
  turnTemplateViolations: 0,
};

// === ENCOUNTER STATE TYPE ===
export type EncounterChoice = {
  id: number;
  text: string;
  delta: { calm: number; understanding: number; boundary: number };
  outcome: string;
};

export type EncounterScene = {
  title: string;
  narrative: string;
  companionHint: string;
  choices: EncounterChoice[];
};

export type EncounterChoiceRecord = {
  sceneIndex: number;
  choiceId: number;
  choiceText: string;
  outcome: string;
  delta: { calm: number; understanding: number; boundary: number };
  essenceId?: string;
};

export type EncounterState = {
  conversationSummary: string; // key themes from reflection
  sceneIndex: number; // 0-3 (approach, threshold, exchange, integration)
  choiceLog: EncounterChoiceRecord[]; // full details of choices made
  scores: { calm: number; understanding: number; boundary: number };
  currentScene: EncounterScene | null; // the current scene to display
  isComplete: boolean;
  chosenEssenceId?: string; // explicitly chosen essence from choice 4
};

export const DEFAULT_ENCOUNTER_STATE: EncounterState = {
  conversationSummary: "",
  sceneIndex: 0,
  choiceLog: [],
  scores: { calm: 0, understanding: 0, boundary: 0 },
  currentScene: null,
  isComplete: false,
};

// === ARTIFACT DRAFT TYPE ===
export type ArtifactDraft = {
  type: 'scroll' | 'crystal' | 'potion';
  text: string;
  essenceHighlights: string[];
  encounterSummary: string;
};

// === GAME SESSIONS ===
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // 'parent' or 'teen'
  shadowId: text("shadow_id"),
  shadowCustom: text("shadow_custom"),
  companionId: text("companion_id"),
  artifactType: text("artifact_type"), // 'scroll', 'crystal', 'potion'
  status: text("status").notNull().default("active"), // active, awaiting_crystallize, crystallized, companion_active
  turn: integer("turn").notNull().default(1),
  cycle: integer("cycle").notNull().default(1), // Track how many crystallization cycles
  accumulatedScores: jsonb("accumulated_scores"),
  miMetrics: jsonb("mi_metrics"), // MI compliance tracking
  encounterState: jsonb("encounter_state"), // Dynamic encounter state
  artifactDraft: jsonb("artifact_draft"), // Generated artifact text
  spell: jsonb("spell"),
  openingQuestion: text("opening_question"), // LLM-generated opening question for reflection
  crystallizedEssenceId: text("crystallized_essence_id"), // User-selected essence from top 4
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === GAME MESSAGES ===
export const gameMessages = pgTable("game_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  cycle: integer("cycle").notNull().default(1), // Which crystallization cycle this message belongs to
  turn: integer("turn").notNull(),
  mode: text("mode").notNull(), // 'reflect', 'battle'
  userText: text("user_text"),
  assistantText: text("assistant_text"),
  highlights: jsonb("highlights"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELAYS ===
export const relays = pgTable("relays", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id"),
  fromRole: text("from_role").notNull(),
  type: text("type").notNull(), // 'scroll', 'crystal', 'potion'
  text: text("text").notNull(),
  shadowId: text("shadow_id"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// === RELATIONS ===
export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  messages: many(gameMessages),
}));

export const gameMessagesRelations = relations(gameMessages, ({ one }) => ({
  session: one(gameSessions, {
    fields: [gameMessages.sessionId],
    references: [gameSessions.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGameMessageSchema = createInsertSchema(gameMessages).omit({ id: true, createdAt: true });
export const insertRelaySchema = createInsertSchema(relays).omit({ id: true, createdAt: true, readAt: true });

// === TYPES ===
export type GameSession = typeof gameSessions.$inferSelect;
export type GameMessage = typeof gameMessages.$inferSelect;
export type Relay = typeof relays.$inferSelect;

export type CreateSessionRequest = {
  role: 'parent' | 'teen';
  shadowId?: string;
  shadowCustom?: string;
};

export type SubmitTurnRequest = {
  userText: string;
  mode: 'reflect' | 'battle';
};

export type CreateRelayRequest = {
  type: 'scroll' | 'crystal' | 'potion';
  text: string;
  shadowId?: string;
  toUserId?: string;
};

export type ShadowCatalogItem = {
  id: string;
  label: string;
  description: string;
};
