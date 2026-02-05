import OpenAI from "openai";
import type { MiMetrics } from "../../shared/schema";
import { DEFAULT_MI_METRICS } from "../../shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// === TYPES ===

export type SegmentType =
  | 'complex_reflection'
  | 'simple_reflection'
  | 'open_question'
  | 'closed_question'
  | 'affirmation'
  | 'advice_with_permission'
  | 'advice_without_permission'
  | 'statement';

export type ResponseClassification = {
  segments: Array<{
    text: string;
    type: SegmentType;
  }>;
  containsSummary: boolean;
  miInconsistent: boolean; // confrontation, blaming, moralizing, persuasion
  followsTurnTemplate: boolean; // complex_reflection → simple_reflection → open_question
};

export type ChangeTalkAnalysis = {
  hasChangeTalk: boolean;
  changeTalkType: 'desire' | 'ability' | 'reasons' | 'need' | 'commitment' | 'steps' | null;
  hasSustainTalk: boolean;
  sustainTalkQuote: string | null;
  isAmbivalent: boolean; // true when BOTH change talk AND sustain talk detected
};

export type MiCorrectiveContext = {
  requiresSummary: boolean;
  reflectionQuestionRatio: number; // target: >= 2.0
  openQuestionRatio: number; // target: >= 0.70
  complexReflectionRatio: number; // target: >= 0.50
  responseLengthRatio: number; // target: <= 0.50
  lastTurnQuestionCount: number; // target: <= 2
  deficits: string[]; // human-readable list of what needs correction
  changeTalk: ChangeTalkAnalysis;
  userWordCount: number; // for current turn
};

// === WORD COUNT HELPER ===

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// === CLASSIFIER PROMPT ===

const CLASSIFIER_PROMPT = `You are an MI (Motivational Interviewing) response classifier. Analyze the assistant's response and classify each sentence.

DEFINITIONS:
- complex_reflection: Restates user's meaning AND adds emotion, motive, value, or implication. Goes beyond what was literally said.
- simple_reflection: Accurately paraphrases what the user said without adding new meaning.
- open_question: Invites a fuller reply, can't be answered yes/no. Starts with What, How, Tell me, Describe, etc.
- closed_question: Can be answered with yes/no or a single fact.
- affirmation: Specific, behavior-based recognition of strength/effort. NOT generic praise.
- advice_with_permission: Suggestions given AFTER user asked for advice or explicitly agreed to receive it.
- advice_without_permission: Unsolicited advice - suggestions given without user requesting them.
- statement: Any other type of response (greetings, transitions, etc.)

MI-INCONSISTENT FLAGS (set miInconsistent: true if any):
- advice_without_permission present
- Confrontation or arguing
- Blaming or moralizing
- Persuasion attempts ("You should...", "You need to...")

TURN TEMPLATE CHECK:
The ideal MI turn follows this structure: complex_reflection → simple_reflection → open_question
Set followsTurnTemplate: true if the response roughly follows this pattern (reflections before questions, ends with open question).

OUTPUT JSON:
{
  "segments": [
    {"text": "sentence text", "type": "complex_reflection|simple_reflection|open_question|closed_question|affirmation|advice_with_permission|advice_without_permission|statement"}
  ],
  "containsSummary": true/false,
  "miInconsistent": true/false,
  "followsTurnTemplate": true/false
}`;

// === CHANGE TALK DETECTOR PROMPT ===

const CHANGE_TALK_PROMPT = `Analyze the user message for change talk and sustain talk.

CHANGE TALK (language favoring change):
- Desire: "I want...", "I wish...", "I'd like..."
- Ability: "I can...", "I could...", "I'm able to..."
- Reasons: "because...", "so that...", "it would help..."
- Need: "I have to...", "I need to...", "I must..."
- Commitment: "I will...", "I'm going to...", "I promise..."
- Steps: "I started...", "I've been...", "Yesterday I..."

SUSTAIN TALK (language favoring status quo):
- "It won't work", "I can't", "I don't want to", "There's no point", "It's too hard"

OUTPUT JSON:
{
  "hasChangeTalk": true/false,
  "changeTalkType": "desire|ability|reasons|need|commitment|steps" or null,
  "changeTalkQuote": "exact quote if found" or null,
  "hasSustainTalk": true/false,
  "sustainTalkQuote": "exact quote if found" or null
}`;

// === CLASSIFIER FUNCTION ===

export async function classifyResponse(assistantText: string): Promise<ResponseClassification> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        { role: "system", content: CLASSIFIER_PROMPT },
        { role: "user", content: `Classify this response:\n\n${assistantText}` }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      segments: result.segments || [],
      containsSummary: result.containsSummary || false,
      miInconsistent: result.miInconsistent || false,
      followsTurnTemplate: result.followsTurnTemplate ?? true,
    };
  } catch (err) {
    console.error("[MI-Tracker] Classification error:", err);
    return fallbackClassifyResponse(assistantText);
  }
}

// === RULE-BASED FALLBACK ===

function fallbackClassifyResponse(text: string): ResponseClassification {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const segments: ResponseClassification['segments'] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // Check for questions
    if (trimmed.includes('?') || /^(what|how|tell me|describe|when|where|why|who)/i.test(trimmed)) {
      const isOpen = /^(what|how|tell me|describe)/i.test(trimmed);
      segments.push({
        text: trimmed,
        type: isOpen ? 'open_question' : 'closed_question'
      });
    }
    // Check for unsolicited advice
    else if (/you should|you need to|you must|why don't you|try to|consider doing/i.test(trimmed)) {
      segments.push({ text: trimmed, type: 'advice_without_permission' });
    }
    // Check for reflections (starts with "You" or "It sounds like" or "So")
    else if (/^(you|it sounds like|so |i hear|it seems)/i.test(trimmed)) {
      const isComplex = /feel|sense|important|matter|value|mean|care|want|need|hope|worry|afraid|love/i.test(trimmed);
      segments.push({
        text: trimmed,
        type: isComplex ? 'complex_reflection' : 'simple_reflection'
      });
    }
    // Default to statement
    else {
      segments.push({ text: trimmed, type: 'statement' });
    }
  }

  // Check turn template: complex reflection → simple reflection → open question
  // Must have at least one complex reflection, one simple reflection, and end with open question
  const hasComplexReflection = segments.some(s => s.type === 'complex_reflection');
  const hasSimpleReflection = segments.some(s => s.type === 'simple_reflection');
  const hasOpenQuestion = segments.some(s => s.type === 'open_question');
  const lastSegment = segments[segments.length - 1];
  const endsWithOpenQuestion = lastSegment?.type === 'open_question';

  // Find indices for order checking
  const firstComplexIdx = segments.findIndex(s => s.type === 'complex_reflection');
  const firstSimpleIdx = segments.findIndex(s => s.type === 'simple_reflection');
  const firstOpenQuestionIdx = segments.findIndex(s => s.type === 'open_question');

  // Template is followed if: has all components AND complex comes before simple AND simple comes before open question
  const followsTurnTemplate =
    hasComplexReflection &&
    hasSimpleReflection &&
    hasOpenQuestion &&
    endsWithOpenQuestion &&
    (firstComplexIdx < firstSimpleIdx || firstSimpleIdx === -1) &&
    (firstSimpleIdx < firstOpenQuestionIdx || firstOpenQuestionIdx === -1);

  const hasUnsolicitedAdvice = segments.some(s => s.type === 'advice_without_permission');

  return {
    segments,
    containsSummary: /so far|to summarize|what i've heard|let me recap/i.test(text),
    miInconsistent: hasUnsolicitedAdvice || /you should|you need to|you must/i.test(text),
    followsTurnTemplate,
  };
}

// === CHANGE TALK DETECTOR ===

export async function detectChangeTalk(userText: string): Promise<ChangeTalkAnalysis> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        { role: "system", content: CHANGE_TALK_PROMPT },
        { role: "user", content: userText }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 200,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    const hasChangeTalk = result.hasChangeTalk || false;
    const hasSustainTalk = result.hasSustainTalk || false;
    return {
      hasChangeTalk,
      changeTalkType: result.changeTalkType || null,
      hasSustainTalk,
      sustainTalkQuote: result.sustainTalkQuote || null,
      isAmbivalent: hasChangeTalk && hasSustainTalk,
    };
  } catch (err) {
    console.error("[MI-Tracker] Change talk detection error:", err);
    return fallbackDetectChangeTalk(userText);
  }
}

function fallbackDetectChangeTalk(text: string): ChangeTalkAnalysis {
  const lower = text.toLowerCase();

  let changeTalkType: ChangeTalkAnalysis['changeTalkType'] = null;
  if (/i want|i wish|i'd like/i.test(lower)) changeTalkType = 'desire';
  else if (/i can|i could|i'm able/i.test(lower)) changeTalkType = 'ability';
  else if (/because|so that|it would help/i.test(lower)) changeTalkType = 'reasons';
  else if (/i have to|i need to|i must/i.test(lower)) changeTalkType = 'need';
  else if (/i will|i'm going to|i promise/i.test(lower)) changeTalkType = 'commitment';
  else if (/i started|i've been|yesterday i|i began/i.test(lower)) changeTalkType = 'steps';

  const hasChangeTalk = changeTalkType !== null;
  const hasSustainTalk = /won't work|can't|don't want to|no point|too hard|impossible/i.test(lower);

  return {
    hasChangeTalk,
    changeTalkType,
    hasSustainTalk,
    sustainTalkQuote: null,
    isAmbivalent: hasChangeTalk && hasSustainTalk,
  };
}

// === UPDATE MI METRICS ===

export function updateMiMetrics(
  currentMetrics: MiMetrics | null,
  classification: ResponseClassification,
  userWordCount: number,
  assistantWordCount: number
): MiMetrics {
  const metrics = currentMetrics ? { ...currentMetrics } : { ...DEFAULT_MI_METRICS };

  let turnQuestionCount = 0;

  for (const segment of classification.segments) {
    switch (segment.type) {
      case 'complex_reflection':
        metrics.complexReflections++;
        break;
      case 'simple_reflection':
        metrics.simpleReflections++;
        break;
      case 'open_question':
        metrics.openQuestions++;
        turnQuestionCount++;
        break;
      case 'closed_question':
        metrics.closedQuestions++;
        turnQuestionCount++;
        break;
      case 'affirmation':
        metrics.affirmations++;
        break;
      case 'advice_with_permission':
        metrics.adviceWithPermission++;
        break;
      case 'advice_without_permission':
        metrics.adviceWithoutPermission++;
        break;
    }
  }

  // Track questions per turn
  metrics.lastTurnQuestionCount = turnQuestionCount;
  if (turnQuestionCount > 2) {
    metrics.questionsPerTurnViolations++;
  }

  // Track turn template compliance
  if (!classification.followsTurnTemplate) {
    metrics.turnTemplateViolations++;
  }

  // Track MI-inconsistent behavior
  if (classification.miInconsistent) {
    metrics.miInconsistent++;
  }

  // Track response length
  metrics.totalUserWords += userWordCount;
  metrics.totalAssistantWords += assistantWordCount;

  // Check response length violation (AI should be ≤50% of user's words)
  if (userWordCount > 0 && assistantWordCount > userWordCount * 0.5) {
    metrics.responseLengthViolations++;
  }

  // Update summary counter
  if (classification.containsSummary) {
    metrics.turnsSinceLastSummary = 0;
  } else {
    metrics.turnsSinceLastSummary++;
  }

  return metrics;
}

// === GENERATE CORRECTIVE CONTEXT ===

export function generateCorrectiveContext(
  metrics: MiMetrics,
  changeTalk: ChangeTalkAnalysis,
  userWordCount: number = 0
): MiCorrectiveContext {
  const totalReflections = metrics.complexReflections + metrics.simpleReflections;
  const totalQuestions = metrics.openQuestions + metrics.closedQuestions;

  const reflectionQuestionRatio = totalQuestions > 0 ? totalReflections / totalQuestions : 2.0;
  const openQuestionRatio = totalQuestions > 0 ? metrics.openQuestions / totalQuestions : 1.0;
  const complexReflectionRatio = totalReflections > 0 ? metrics.complexReflections / totalReflections : 0.5;
  const responseLengthRatio = metrics.totalUserWords > 0
    ? metrics.totalAssistantWords / metrics.totalUserWords
    : 0.5;

  const deficits: string[] = [];

  // Reflection/question ratio check
  if (reflectionQuestionRatio < 2.0 && totalQuestions >= 2) {
    deficits.push(`Reflection ratio low (${reflectionQuestionRatio.toFixed(1)}:1, need 2:1). Use MORE reflections, fewer questions.`);
  }

  // Open question ratio check
  if (openQuestionRatio < 0.70 && totalQuestions >= 2) {
    deficits.push(`Open question ratio low (${(openQuestionRatio * 100).toFixed(0)}%, need 70%+). Use What/How questions.`);
  }

  // Complex reflection ratio check
  if (complexReflectionRatio < 0.50 && totalReflections >= 2) {
    deficits.push(`Complex reflection ratio low (${(complexReflectionRatio * 100).toFixed(0)}%, need 50%+). Add emotion/value/meaning to reflections.`);
  }

  // Response length check
  if (metrics.responseLengthViolations > 0) {
    deficits.push(`Responses too long. Keep replies ≤50% of user's word count. Be more concise.`);
  }

  // Questions per turn check
  if (metrics.lastTurnQuestionCount > 2) {
    deficits.push(`Too many questions last turn (${metrics.lastTurnQuestionCount}, max 2). Ask ONE question per turn.`);
  }

  // Turn template check
  if (metrics.turnTemplateViolations > 0) {
    deficits.push(`Follow turn template: Complex reflection → Simple reflection → One open question.`);
  }

  // Unsolicited advice check
  if (metrics.adviceWithoutPermission > 0) {
    deficits.push(`Unsolicited advice detected. NEVER give advice without permission. Use E-P-E pattern.`);
  }

  // General MI-inconsistent check
  if (metrics.miInconsistent > 0) {
    deficits.push(`MI-inconsistent responses detected. Avoid arguing, persuading, or moralizing.`);
  }

  return {
    requiresSummary: metrics.turnsSinceLastSummary >= 3,
    reflectionQuestionRatio,
    openQuestionRatio,
    complexReflectionRatio,
    responseLengthRatio,
    lastTurnQuestionCount: metrics.lastTurnQuestionCount,
    deficits,
    changeTalk,
    userWordCount,
  };
}

// === FORMAT CORRECTIVE INSTRUCTIONS FOR PROMPT ===

export function formatCorrectiveInstructions(context: MiCorrectiveContext): string {
  const lines: string[] = [];

  // Word count limit reminder
  if (context.userWordCount > 0) {
    const maxWords = Math.floor(context.userWordCount * 0.5);
    lines.push(`\n📏 RESPONSE LENGTH: User wrote ${context.userWordCount} words. Your reply must be ≤${maxWords} words.`);
  }

  // Ambivalence handling - ONLY use double-sided when both change talk AND sustain talk present
  if (context.changeTalk.isAmbivalent) {
    lines.push(`\n🔀 AMBIVALENCE DETECTED: Use a double-sided reflection ("Part of you... and part of you...") to honor both the desire for change and the resistance.`);
  } else if (context.changeTalk.hasChangeTalk) {
    // Pure change talk - reflect and amplify
    lines.push(`\n⚡ CHANGE TALK DETECTED (${context.changeTalk.changeTalkType}): Reflect this IMMEDIATELY. Use a complex reflection that amplifies their motivation.`);
  } else if (context.changeTalk.hasSustainTalk) {
    // Pure sustain talk - reflect with empathy, don't push
    lines.push(`\n⚠️ SUSTAIN TALK DETECTED: Reflect their resistance with empathy. Use a simple reflection + autonomy support ("It's completely up to you...").`);
  }

  // Summary reminder
  if (context.requiresSummary) {
    lines.push(`\n📋 SUMMARY DUE: Include a brief mini-summary of what you've heard so far. End with an open accuracy check.`);
  }

  // Deficit corrections
  if (context.deficits.length > 0) {
    lines.push(`\n🔧 MI COMPLIANCE CORRECTIONS NEEDED:`);
    for (const deficit of context.deficits) {
      lines.push(`  - ${deficit}`);
    }
  }

  return lines.join('\n');
}
