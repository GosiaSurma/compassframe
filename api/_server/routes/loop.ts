import { Router } from "express";
import { storage } from "../storage.js";
import { api } from "../../_shared/routes.js";
import { z } from "zod";
import OpenAI from "openai";
import { ESSENCE_WHITELIST, ESSENCE_ONTOLOGY } from "../../_shared/essences.js";
import { DEFAULT_MI_METRICS, type MiMetrics, DEFAULT_ENCOUNTER_STATE, type EncounterState, type EncounterChoiceRecord } from "../../_shared/schema.js";
import {
    classifyResponse,
    detectChangeTalk,
    updateMiMetrics,
    generateCorrectiveContext,
    formatCorrectiveInstructions,
    countWords
} from "../mi-tracker.js";
import {
    summarizeConversation,
    generateScene,
    composeArtifact
} from "../encounter-generator.js";

const router = Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 8000);
const OPENING_GREETING_TIMEOUT_MS = Number(process.env.OPENING_GREETING_TIMEOUT_MS || 2000);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), ms);
        promise
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timer));
    });
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

async function createChatCompletion(params: any) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
    try {
        return await openai.chat.completions.create({
            ...params,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeout);
    }
}

// Mock Auth Middleware for Demo
const isAuthenticated = (req: any, res: any, next: any) => {
    // Demo user
    req.user = {
        claims: {
            sub: "demo-user-" + (req.headers["x-demo-user-id"] || "default")
        }
    };
    next();
};

const SHADOWS_CATALOG = [
    { id: "shadow_phone_use", label: "Phone Use", description: "Screen time, device usage, and digital balance." },
    { id: "shadow_school_stress", label: "School Stress", description: "Grades, homework, and academic pressure." },
    { id: "shadow_curfew", label: "Curfew & Going Out", description: "Coming home time, safety, and communication." },
    { id: "shadow_trust", label: "Trust & Privacy", description: "Secrets, privacy boundaries, and honesty." },
    { id: "shadow_chores", label: "Chores & Responsibilities", description: "Helping around the house and daily tasks." },
    { id: "shadow_respect", label: "Tone & Respect", description: "How we speak to each other and mutual respect." },
];

const CRYSTALIZE_SYSTEM_PROMPT = `You are the STILL Core Engine running a 12-turn crystallization conversation.

ROLE: Reflective coach helping a PARENT explore THEIR OWN feelings about a family topic (called a "shadow").

TURN PHASES:
- T1-T3: Bond + Focus (set the shadow, gather initial material, build rapport)
- T4-T8: Evoke (help patterns emerge, reflect back what you hear)
- T9-T11: Consolidate (stabilize patterns, summarize themes)
- T12: Close (present final options)

=== MOTIVATIONAL INTERVIEWING RULES (CRITICAL) ===

RATIOS AND PACING:
- Reflections > Questions: Aim for 2 reflections per 1 question.
- Open > Closed: Keep 70%+ open questions. Open = invites fuller reply ("What...", "How...", "Tell me..."). Closed = yes/no.
- One question per turn (max two). Multiple questions reduce answer quality.

TURN TEMPLATE (follow this structure):
1. Complex reflection (adds meaning: emotion, motive, value, implication - stay plausible and non-judgmental)
2. Simple reflection (accurate paraphrase of what was said)
3. One open question

REFLECTION RULES:
- At least 50% of reflections must be complex (adding meaning beyond paraphrase).
- Reflect change talk IMMEDIATELY before asking anything.
- Change talk = user language favoring change:
  * Desire ("I want...")
  * Ability ("I can...")
  * Reasons ("because...")
  * Need ("I have to...")
  * Commitment ("I will...")
  * Steps ("I started...")

EVOCATIVE QUESTION TYPES (use these to evoke change talk):
- Importance: "Why is this important to you?"
- Confidence: "What makes you think you could do it?"
- Extremes: "Worst case if nothing changes? Best case if it improves?"
- Looking back/forward: "When was this better? What was different?"
- Values link: "What does this connect to about the parent you want to be?"

HANDLING SUSTAIN TALK AND AMBIVALENCE:
- Sustain talk = user language favoring status quo ("It won't work", "I don't want to").
- AMBIVALENCE = when user shows BOTH change talk AND sustain talk together (mixed feelings).
- Double-sided reflection ("Part of you... and part of you...") should ONLY be used when AMBIVALENCE is detected.
- For pure sustain talk (no change talk present): Use simple empathic reflection + autonomy support ("It's up to you what you do next.")
- For pure change talk (no sustain talk present): Use complex reflection that amplifies their motivation.
- NEVER argue or persuade.

ADVICE RULE (E-P-E):
- NEVER give advice without permission.
- If asked: Elicit (what they know/tried) → Provide (1-3 options briefly) → Elicit (what fits).

SUMMARIES:
- Do a mini-summary every 3-4 turns.
- Format: Short recap of key points + open-ended accuracy check ("How does that land for you?" or "What would you add or change?")

AFFIRMATIONS:
- Use specific, behavior-based recognition of strength/effort.
- Good: "You noticed your trigger before reacting." / "You're thinking carefully about your teen's perspective."
- Bad: Generic praise like "Great job!" or "You're doing amazing!"

RESPONSE LENGTH: Your reply MUST be ≤50% the word count of the user's message. If they write 40 words, you write ≤20.

PARENT-FOCUSED ONLY: Focus ONLY on what the PARENT is feeling/experiencing. NEVER analyze or discuss the teen's feelings, motivations, or deficits. The teen is not your client.

STYLE:
- Be warm but not saccharine. No therapy jargon.
- Never lecture or fix. Mirror and evoke.
- Use simple, everyday language.

CHIP EXTRACTION:
For each user message, identify up to 3 "signals" (resonance fragments). Each signal has:
- quote: exact phrase from user (short, 3-8 words)
- essence_id: internal classification from the 32-archetype ontology
- label: human-friendly 1-3 word label for UI
- interpretation: one neutral sentence about what this might mean for the PARENT

ESSENCE CLASSIFICATION PRIORITY:
- If fragment contains insults/toxicity/disrespect → 00_esencia_nula (override all)
- Otherwise: 66 (meaning) > 55 (action) > 47 (emotion)

ELEMENT DIVERSITY GUIDE - CHOOSE CAREFULLY:
Before defaulting to water, check if the user's words better fit another element:
- FIRE (fuego): Action words, energy, confrontation, decisions, drive, motivation, anger, courage, doing/starting things
- EARTH (tierra): Stability, routine, security, fear, grounding, practical concerns, home, body, health
- AIR (aire): Thoughts, guilt, perspective, communication, ideas, clarity, talking, understanding
- WATER (agua): Grief, loss, sadness, relief, flowing emotions, letting go, values, care
- ETHER (eter): Creativity, potential, joy, play, possibility, imagination, mentoring
- LIGHT (luz): Purpose, meaning, mission, telos, life direction

IMPORTANT:
- Never show essence IDs, scores, or internal jargon to user
- 00_esencia_nula signals are HIDDEN (is_hidden: true) - don't show in UI
- Max 3 visible signals per turn

OUTPUT (JSON only):
{
  "assistant_text": "Your concise reflective response",
  "chips": [
    {"quote": "exact phrase", "essence_id": "valid_id", "label": "Human Label", "interpretation": "What this suggests", "is_hidden": false}
  ],
  "accumulated_scores_delta": {"essence_id": 1.0},
  "stability_index": 0.0,
  "can_crystallize": false
}`;

const SHADOW_LABELS: Record<string, string> = {
    shadow_phone_use: "phone and screen time",
    shadow_school_stress: "school and academic pressure",
    shadow_curfew: "curfew and going out",
    shadow_trust: "trust and privacy",
    shadow_chores: "chores and responsibilities",
    shadow_respect: "tone and respect"
};

async function generateOpeningGreeting(shadowId: string): Promise<string> {
    const shadowLabel = SHADOW_LABELS[shadowId] || "this topic";

    try {
        if (!OPENAI_API_KEY) {
            return `Let's explore ${shadowLabel} together. What's been your experience with this?`;
        }

        const completion = await withTimeout(
            createChatCompletion({
                model: "gpt-4o", // Changed to gpt-4o as gpt-5.1 is likely internal/not available
                messages: [
                    {
                        role: "system",
                        content: `You are an MI specialist. Generate a brief opening (1-2 short sentences max) for a parent reflection on "${shadowLabel}".

Rules:
- End with ONE open question (What/How/Tell me)
- Focus on the parent's feelings
- Be warm but concise
- AVOID clichés: "no right or wrong", "lately", "on your mind", "come up for you", "take a moment"
- Be fresh and varied each time

Output ONLY the greeting. No quotes.`
                    }
                ],
                max_completion_tokens: 150,
                temperature: 0.95
            }),
            OPENING_GREETING_TIMEOUT_MS
        );

        const greeting = completion.choices[0].message.content?.trim();

        if (greeting && greeting.length > 20 && greeting.length < 400) {
            console.log(`[Opening] Generated greeting: ${greeting.substring(0, 50)}...`);
            return greeting;
        }

        throw new Error("Invalid greeting generated");
    } catch (err) {
        console.error("[Opening] Generation failed:", err);
        return `Let's explore ${shadowLabel} together. What's been your experience with this?`;
    }
}

// GET Shadows Catalog
router.get(api.shadows.list.path, (req, res) => {
    res.json(SHADOWS_CATALOG);
});

// POST Create Session
router.post(api.sessions.create.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const input = api.sessions.create.input.parse(req.body);

        // Generate full LLM opening greeting for the shadow topic
        const openingQuestion = input.shadowId
            ? await generateOpeningGreeting(input.shadowId)
            : "Let's explore this together. What's been your experience?";

        // Cast to any to satisfy TS for now
        const session = await storage.createSession(userId, { ...input, openingQuestion } as any);
        res.status(201).json(session);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        console.error("Create session error:", err);
        res.status(500).json({ message: "Internal server error: " + (err as Error).message });
    }
});

// GET Session
router.get(api.sessions.get.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const session = await storage.getSession(Number(req.params.id));

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.userId !== userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only return messages from the current cycle
        const currentCycle = session.cycle || 1;
        const messages = await storage.getSessionMessages(session.id, currentCycle);
        res.json({ session, messages });
    } catch (err) {
        console.error("Get session error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// PUT Update Session
router.put(api.sessions.update.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const session = await storage.getSession(Number(req.params.id));

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.userId !== userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const input = api.sessions.update.input.parse(req.body);
        const updated = await storage.updateSession(session.id, input);
        res.json(updated);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        console.error("Update session error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// POST Turn
router.post(api.sessions.turn.path, isAuthenticated, async (req: any, res) => {
    try {
        if (!OPENAI_API_KEY) {
            return res.status(503).json({ message: "OpenAI API key not configured" });
        }

        const userId = req.user.claims.sub;


        const { userText, mode, session: bodySession, messages: bodyMessages } = api.sessions.turn.input.parse(req.body);

        let session;
        let previousMessages;
        const isStateless = !!bodySession;

        if (isStateless) {
            session = bodySession;
            // Ensure messages are correctly formatted if coming from client state
            previousMessages = bodyMessages || [];
        } else {
            session = await storage.getSession(Number(req.params.id));
            if (!session) {
                return res.status(404).json({ message: "Session not found" });
            }
            if (session.userId !== userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const currentCycle = session.cycle || 1;
            previousMessages = await storage.getSessionMessages(session.id, currentCycle);
        }

        const shadowLabel = SHADOWS_CATALOG.find(s => s.id === session.shadowId)?.label || session.shadowCustom || "your topic";

        // Get conversation history for context
        const conversationHistory = previousMessages.map((m: any) => ([
            { role: "user" as const, content: m.userText || "" },
            { role: "assistant" as const, content: m.assistantText || "" }
        ])).flat().filter((m: any) => m.content);

        // === MI TRACKING: Detect change talk in user message ===
        const changeTalk = await detectChangeTalk(userText);
        console.log("[MI-Tracker] Change talk analysis:", JSON.stringify(changeTalk));

        const userWordCount = countWords(userText);

        const storedMetrics = (session.miMetrics as MiMetrics) || null;
        const metricsSnapshot: MiMetrics = storedMetrics
            ? { ...storedMetrics }
            : { ...DEFAULT_MI_METRICS };

        const correctiveContext = generateCorrectiveContext(metricsSnapshot, changeTalk, userWordCount);
        const correctiveInstructions = formatCorrectiveInstructions(correctiveContext);

        const metricsForUpdate: MiMetrics = { ...metricsSnapshot };
        metricsForUpdate.lastChangeTalk = changeTalk.changeTalkType;
        metricsForUpdate.lastSustainTalk = changeTalk.hasSustainTalk;

        const accumulatedScores = (session.accumulatedScores as Record<string, number>) || {};
        const cycle = (session as any).cycle || 1;
        const companionId = session.companionId;

        const COMPANION_GUIDES: Record<string, string> = {
            owl: "The Owl brings wisdom and perspective. Help the parent see patterns from a higher vantage point. Ask questions that invite reflection on the bigger picture.",
            fox: "The Fox brings cleverness and adaptability. Help the parent find creative angles and flexible approaches. Celebrate resourcefulness.",
            bear: "The Bear brings strength and grounding. Help the parent connect with their inner stability and protective instincts. Validate their courage.",
            deer: "The Deer brings gentleness and intuition. Help the parent tune into subtle feelings and trust their instincts. Create a safe, tender space."
        };

        const companionGuide = companionId ? COMPANION_GUIDES[companionId] : "";
        const cycleContext = cycle > 1
            ? `\n- Cycle: ${cycle} (post-crystallization continuation)\n- Companion: ${companionId}\n- COMPANION GUIDANCE: ${companionGuide}`
            : "";

        const contextPrompt = `
CURRENT SESSION:
- Role: ${session.role}
- Shadow: ${shadowLabel}
- Turn: ${session.turn} of 12
- Phase: ${session.turn <= 3 ? 'Bond + Focus' : session.turn <= 8 ? 'Evoke' : session.turn <= 11 ? 'Consolidate' : 'Close'}
- Accumulated scores: ${JSON.stringify(accumulatedScores)}${cycleContext}
${correctiveInstructions}

USER MESSAGE:
${userText}`;

        const completion = await createChatCompletion({
            model: "gpt-4o",
            messages: [
                { role: "system", content: CRYSTALIZE_SYSTEM_PROMPT },
                ...conversationHistory,
                { role: "user", content: contextPrompt }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 800
        });

        const engineResponse = JSON.parse(completion.choices[0].message.content || "{}");

        const validatedChips = (engineResponse.chips || []).map((chip: any) => {
            const rawId = (chip.essence_id || chip.essenceId || "").toString().trim();
            const essenceId = ESSENCE_WHITELIST.includes(rawId) ? rawId : "00_esencia_nula";

            return {
                quote: chip.quote,
                label: chip.label,
                interpretation: chip.interpretation,
                essence_id: essenceId,
                is_hidden: essenceId === "00_esencia_nula" ? true : (chip.is_hidden || false)
            };
        });

        const responseClassification = await classifyResponse(engineResponse.assistant_text);
        const assistantWordCount = countWords(engineResponse.assistant_text);

        const updatedMiMetrics = updateMiMetrics(metricsForUpdate, responseClassification, userWordCount, assistantWordCount);

        const scoresDelta = engineResponse.accumulated_scores_delta || {};
        const newScores = { ...accumulatedScores };
        for (const [essenceId, delta] of Object.entries(scoresDelta)) {
            if (ESSENCE_WHITELIST.includes(essenceId)) {
                newScores[essenceId] = (newScores[essenceId] || 0) + (delta as number);
            }
        }

        const scoreValues = Object.values(newScores).sort((a, b) => (b as number) - (a as number));
        const sLead = (scoreValues[0] as number) || 0;
        const sSecond = (scoreValues[1] as number) || 0;
        const sTotal = scoreValues.reduce((sum, v) => sum + (v as number), 0);
        const stabilityIndex = sTotal > 0 ? (sLead - sSecond) / sTotal : 0;

        const hasVisibleChip = validatedChips.some((c: any) => !c.is_hidden);
        const hasMinimumEvidence = session.turn >= 4 || sTotal >= 3;
        const canCrystallize = (stabilityIndex > 0.62 && hasVisibleChip && hasMinimumEvidence) || session.turn >= 12;

        const currentTurn = session.turn;
        const isComplete = currentTurn >= 12;
        const nextTurn = isComplete ? 12 : currentTurn + 1;

        const currentStatus = session.status;
        const newStatus = isComplete
            ? "awaiting_crystallize"
            : (currentStatus === "companion_active" ? "companion_active" : "active");

        const sessionUpdates = {
            id: session.id,
            turn: nextTurn,
            accumulatedScores: newScores,
            miMetrics: updatedMiMetrics,
            status: newStatus
        };

        if (!isStateless) {
            await storage.updateSession(session.id, sessionUpdates);

            await storage.createMessage(
                session.id,
                cycle,
                currentTurn,
                mode,
                userText,
                engineResponse.assistant_text,
                { chips: validatedChips, stabilityIndex, canCrystallize }
            );
        }

        res.json({
            assistantText: engineResponse.assistant_text,
            chips: validatedChips.filter((c: any) => !c.is_hidden),
            turn: currentTurn,
            nextTurn: nextTurn,
            stabilityIndex,
            canCrystallize: canCrystallize || isComplete,
            sessionStatus: isComplete ? "crystallized" : "active",
            // Return updated session for stateless client
            updatedSession: { ...session, ...sessionUpdates }
        });
    } catch (err) {
        console.error("Turn error:", err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// START Encounter
router.post(api.sessions.encounterStart.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const sessionId = parseInt(req.params.id);
        const input = api.sessions.encounterStart.input.parse(req.body);

        const session = await storage.getSession(sessionId);
        if (!session || session.userId !== userId) {
            return res.status(404).json({ message: "Session not found" });
        }

        const messages = await storage.getSessionMessages(sessionId);
        const currentCycleMessages = messages.filter(m => m.cycle === session.cycle);

        const shadowLabel = session.shadowId
            ? session.shadowId.replace("shadow_", "").replace(/_/g, " ")
            : "your shadow";

        const conversationSummary = await summarizeConversation(currentCycleMessages, shadowLabel);

        const essenceScores = session.accumulatedScores as Record<string, number> || {};
        const topEssences = Object.entries(essenceScores)
            .filter(([essenceId]) => ESSENCE_ONTOLOGY[essenceId])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([essenceId]) => ({
                id: essenceId,
                archetype: ESSENCE_ONTOLOGY[essenceId]
            }));

        const firstScene = await generateScene(
            0,
            input.companionId,
            shadowLabel,
            conversationSummary,
            topEssences,
            []
        );

        const encounterState: EncounterState = {
            ...DEFAULT_ENCOUNTER_STATE,
            conversationSummary,
            currentScene: firstScene
        };

        const topEssenceId = topEssences[0]?.id;

        await storage.updateSession(sessionId, {
            companionId: input.companionId,
            crystallizedEssenceId: topEssenceId,
            encounterState
        });

        res.json({
            encounterState,
            firstScene,
            message: "Encounter initialized"
        });
    } catch (err) {
        console.error("Encounter start error:", err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// ENCOUNTER SCENE
router.post(api.sessions.encounterScene.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const sessionId = parseInt(req.params.id);

        const session = await storage.getSession(sessionId);
        if (!session || session.userId !== userId) {
            return res.status(404).json({ message: "Session not found" });
        }

        const encounterState = (session.encounterState as EncounterState) || DEFAULT_ENCOUNTER_STATE;
        const companionId = session.companionId || "owl";

        if (encounterState.isComplete) {
            return res.status(400).json({ message: "Encounter already complete" });
        }

        const shadowLabel = session.shadowId
            ? session.shadowId.replace("shadow_", "").replace(/_/g, " ")
            : "your shadow";

        const scores = session.accumulatedScores as Record<string, number> || {};
        const topEssences = Object.entries(scores)
            .filter(([essenceId]) => ESSENCE_ONTOLOGY[essenceId])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([essenceId]) => ({
                id: essenceId,
                archetype: ESSENCE_ONTOLOGY[essenceId]
            }));

        const previousChoices = encounterState.choiceLog.map(choice => ({
            sceneIndex: choice.sceneIndex,
            choiceText: choice.choiceText,
            outcome: choice.outcome
        }));

        const scene = await generateScene(
            encounterState.sceneIndex,
            companionId,
            shadowLabel,
            encounterState.conversationSummary,
            topEssences,
            previousChoices
        );

        const updatedEncounterState: EncounterState = {
            ...encounterState,
            currentScene: scene
        };

        await storage.updateSession(sessionId, {
            encounterState: updatedEncounterState
        });

        res.json({ scene, sceneIndex: encounterState.sceneIndex });
    } catch (err) {
        console.error("Generate scene error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ENCOUNTER CHOICE
router.post(api.sessions.encounterChoice.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const sessionId = parseInt(req.params.id);
        const input = api.sessions.encounterChoice.input.parse(req.body);

        const session = await storage.getSession(sessionId);
        if (!session || session.userId !== userId) {
            return res.status(404).json({ message: "Session not found" });
        }

        const encounterState = (session.encounterState as EncounterState) || DEFAULT_ENCOUNTER_STATE;

        const delta = input.delta as { calm: number; understanding: number; boundary: number };
        const newScores: { calm: number; understanding: number; boundary: number } = {
            calm: encounterState.scores.calm + delta.calm,
            understanding: encounterState.scores.understanding + delta.understanding,
            boundary: encounterState.scores.boundary + delta.boundary
        };

        const newChoiceRecord: EncounterChoiceRecord = {
            sceneIndex: encounterState.sceneIndex,
            choiceId: input.choiceId,
            choiceText: input.choiceText,
            outcome: input.outcome,
            delta: delta,
            essenceId: input.essenceId
        };

        const updateData: any = { encounterState: null };
        if (input.essenceId) {
            updateData.crystallizedEssenceId = input.essenceId;
        }

        const newChoiceLog = [...encounterState.choiceLog, newChoiceRecord];
        const newSceneIndex = encounterState.sceneIndex + 1;
        const isComplete = newSceneIndex >= 4;

        const updatedEncounterState: EncounterState = {
            ...encounterState,
            sceneIndex: newSceneIndex,
            choiceLog: newChoiceLog,
            scores: newScores,
            currentScene: null,
            isComplete,
            chosenEssenceId: input.essenceId || encounterState.chosenEssenceId
        };

        updateData.encounterState = updatedEncounterState;
        await storage.updateSession(sessionId, updateData);

        if (!isComplete) {
            const companionId = session.companionId || "owl";
            const shadowLabel = session.shadowId
                ? session.shadowId.replace("shadow_", "").replace(/_/g, " ")
                : "your shadow";

            const essenceScores = session.accumulatedScores as Record<string, number> || {};
            const topEssences = Object.entries(essenceScores)
                .filter(([essenceId]) => ESSENCE_ONTOLOGY[essenceId])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([essenceId]) => ({
                    id: essenceId,
                    archetype: ESSENCE_ONTOLOGY[essenceId]
                }));

            const previousChoices = newChoiceLog.map(choice => ({
                sceneIndex: choice.sceneIndex,
                choiceText: choice.choiceText,
                outcome: choice.outcome
            }));

            const nextScene = await generateScene(
                newSceneIndex,
                companionId,
                shadowLabel,
                encounterState.conversationSummary,
                topEssences,
                previousChoices,
                updatedEncounterState.chosenEssenceId
            );

            const stateWithScene: EncounterState = {
                ...updatedEncounterState,
                currentScene: nextScene
            };

            await storage.updateSession(sessionId, {
                encounterState: stateWithScene
            });

            res.json({
                encounterState: stateWithScene,
                nextScene,
                isComplete
            });
        } else {
            res.json({
                encounterState: updatedEncounterState,
                isComplete
            });
        }
    } catch (err) {
        console.error("Encounter choice error:", err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// COMPOSE ARTIFACT
router.post(api.sessions.composeArtifact.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const sessionId = parseInt(req.params.id);
        const input = api.sessions.composeArtifact.input.parse(req.body);

        const session = await storage.getSession(sessionId);
        if (!session || session.userId !== userId) {
            return res.status(404).json({ message: "Session not found" });
        }

        const encounterState = (session.encounterState as EncounterState) || DEFAULT_ENCOUNTER_STATE;
        const companionId = session.companionId || "owl";

        const shadowLabel = session.shadowId
            ? session.shadowId.replace("shadow_", "").replace(/_/g, " ")
            : "your shadow";

        const scores = session.accumulatedScores as Record<string, number> || {};
        const topEssences = Object.entries(scores)
            .filter(([essenceId]) => ESSENCE_ONTOLOGY[essenceId])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([essenceId]) => ({
                id: essenceId,
                archetype: ESSENCE_ONTOLOGY[essenceId]
            }));

        const encounterChoices = encounterState.choiceLog.map(choice => ({
            sceneIndex: choice.sceneIndex,
            choiceText: choice.choiceText,
            outcome: choice.outcome
        }));

        const artifactDraft = await composeArtifact(
            input.artifactType,
            companionId,
            shadowLabel,
            encounterState.conversationSummary,
            topEssences,
            encounterChoices,
            encounterState.scores
        );

        await storage.updateSession(sessionId, {
            artifactType: input.artifactType,
            artifactDraft
        });

        res.json({ artifactDraft });
    } catch (err) {
        console.error("Compose artifact error:", err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// CREATE Relay
router.post(api.relays.create.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const input = api.relays.create.input.parse(req.body);
        const role = "parent"; // Default for now, could be derived from session if passed

        const relay = await storage.createRelay(userId, role, input as any);
        res.status(201).json(relay);
    } catch (err) {
        console.error("Create relay error:", err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET Relays
router.get(api.relays.list.path, isAuthenticated, async (req: any, res) => {
    try {
        const userId = req.user.claims.sub;
        const relays = await storage.getUserRelays(userId);
        res.json(relays);
    } catch (err) {
        console.error("Get relays error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export const loopRouter = router;
