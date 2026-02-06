export interface EssenceArchetype {
  id: string;
  frequency: 47 | 55 | 66 | 0;
  plane: "emotional" | "action" | "meaning" | "null";
  name: string;
  description: string;
  element: string;
  polarity?: "lunar" | "solar" | "natural" | "arcana" | "micro" | "macro";
}

export const ESSENCE_ONTOLOGY: Record<string, EssenceArchetype> = {
  // Frequency 47 — Emotional plane (Lunar = shadow-side)
  "47_agua_lunar": {
    id: "47_agua_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Sadness / Grief / Melancholy",
    description: "Felt loss, nostalgia, feeling left behind",
    element: "water",
    polarity: "lunar"
  },
  "47_aire_lunar": {
    id: "47_aire_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Guilt / Shame / Self-Disgust",
    description: "Harsh moral self-critique, 'I'm bad / worthless'",
    element: "air",
    polarity: "lunar"
  },
  "47_fuego_lunar": {
    id: "47_fuego_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Anger / Resentment / Injustice Rage",
    description: "Attack-energy aimed at what feels unfair",
    element: "fire",
    polarity: "lunar"
  },
  "47_tierra_lunar": {
    id: "47_tierra_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Fear / Anxiety / Insecurity",
    description: "Threat-sense, instability, anticipation of disaster",
    element: "earth",
    polarity: "lunar"
  },
  
  // Frequency 47 — Emotional plane (Solar = light-side)
  "47_agua_solar": {
    id: "47_agua_solar",
    frequency: 47,
    plane: "emotional",
    name: "Relief / Release / Flow",
    description: "Tension discharge, letting go",
    element: "water",
    polarity: "solar"
  },
  "47_aire_solar": {
    id: "47_aire_solar",
    frequency: 47,
    plane: "emotional",
    name: "Clarity / Perspective / Lightness",
    description: "Internal order, clearer perception",
    element: "air",
    polarity: "solar"
  },
  "47_fuego_solar": {
    id: "47_fuego_solar",
    frequency: 47,
    plane: "emotional",
    name: "Courage / Just Anger / Energy to Act",
    description: "Anger channeled into change",
    element: "fire",
    polarity: "solar"
  },
  "47_tierra_solar": {
    id: "47_tierra_solar",
    frequency: 47,
    plane: "emotional",
    name: "Safety / Grounding / Stability",
    description: "Solid ground, containment, steadiness",
    element: "earth",
    polarity: "solar"
  },
  "47_eter_puro": {
    id: "47_eter_puro",
    frequency: 47,
    plane: "emotional",
    name: "Playful Joy",
    description: "Enjoyment not tied to productivity/utility; requires absence of aggression/sarcasm/cynicism",
    element: "ether",
    polarity: "solar"
  },

  // Frequency 55 — Action plane (Natural = spontaneous)
  "55_fuego_natural": {
    id: "55_fuego_natural",
    frequency: 55,
    plane: "action",
    name: "Impulsive / Energetic Action",
    description: "Sudden confront, slam door, 'I'll say it now'",
    element: "fire",
    polarity: "natural"
  },
  "55_agua_natural": {
    id: "55_agua_natural",
    frequency: 55,
    plane: "action",
    name: "Spontaneous Self-Care",
    description: "Rest, bath, take a break",
    element: "water",
    polarity: "natural"
  },
  "55_aire_natural": {
    id: "55_aire_natural",
    frequency: 55,
    plane: "action",
    name: "Explore Ideas / Talk It Out",
    description: "Tell a friend, speak with someone trusted",
    element: "air",
    polarity: "natural"
  },
  "55_tierra_natural": {
    id: "55_tierra_natural",
    frequency: 55,
    plane: "action",
    name: "Everyday Stabilizing Habits",
    description: "Walk more, cook simple food, tidy a space",
    element: "earth",
    polarity: "natural"
  },
  "55_eter_natural": {
    id: "55_eter_natural",
    frequency: 55,
    plane: "action",
    name: "Spontaneous Creative Exploration",
    description: "Write/draw without objective",
    element: "ether",
    polarity: "natural"
  },

  // Frequency 55 — Action plane (Arcana = structured program)
  "55_fuego_arcana": {
    id: "55_fuego_arcana",
    frequency: 55,
    plane: "action",
    name: "Structured Effort Routine",
    description: "E.g., train 3×/week for a month",
    element: "fire",
    polarity: "arcana"
  },
  "55_agua_arcana": {
    id: "55_agua_arcana",
    frequency: 55,
    plane: "action",
    name: "Emotion Regulation Program",
    description: "Sleep routine, nightly emotion log",
    element: "water",
    polarity: "arcana"
  },
  "55_aire_arcana": {
    id: "55_aire_arcana",
    frequency: 55,
    plane: "action",
    name: "Structured Cognitive Work",
    description: "Thought record, behavioral experiment",
    element: "air",
    polarity: "arcana"
  },
  "55_tierra_arcana": {
    id: "55_tierra_arcana",
    frequency: 55,
    plane: "action",
    name: "Structured Hygiene / Plan",
    description: "Follow a meal plan 2 weeks, 30-day sleep routine",
    element: "earth",
    polarity: "arcana"
  },
  "55_eter_arcana": {
    id: "55_eter_arcana",
    frequency: 55,
    plane: "action",
    name: "Guided Creative Program",
    description: "Writing course, X-day creativity program",
    element: "ether",
    polarity: "arcana"
  },

  // Frequency 66 — Meaning plane (Micro = inward)
  "66_fuego_choice_micro": {
    id: "66_fuego_choice_micro",
    frequency: 66,
    plane: "meaning",
    name: "Inner Decision",
    description: "Choosing for yourself, even without a detailed plan yet",
    element: "fire",
    polarity: "micro"
  },
  "66_agua_values_micro": {
    id: "66_agua_values_micro",
    frequency: 66,
    plane: "meaning",
    name: "Personal Values",
    description: "What matters to me beyond external pressure",
    element: "water",
    polarity: "micro"
  },
  "66_tierra_appreciation_micro": {
    id: "66_tierra_appreciation_micro",
    frequency: 66,
    plane: "meaning",
    name: "Self-Appreciation",
    description: "Recognizing your qualities; tending your own ground",
    element: "earth",
    polarity: "micro"
  },
  "66_aire_acceptance_micro": {
    id: "66_aire_acceptance_micro",
    frequency: 66,
    plane: "meaning",
    name: "Accepting Limits",
    description: "Some things can't be controlled; that doesn't invalidate the person",
    element: "air",
    polarity: "micro"
  },
  "66_eter_potential_micro": {
    id: "66_eter_potential_micro",
    frequency: 66,
    plane: "meaning",
    name: "Recognizing Inner Potential",
    description: "'I could become…', without empty fantasy",
    element: "ether",
    polarity: "micro"
  },
  "66_luz_telos_micro": {
    id: "66_luz_telos_micro",
    frequency: 66,
    plane: "meaning",
    name: "Personal Meaning (Intimate Telos)",
    description: "What kind of life/story I want to live",
    element: "light",
    polarity: "micro"
  },

  // Frequency 66 — Meaning plane (Macro = outward)
  "66_fuego_choice_macro": {
    id: "66_fuego_choice_macro",
    frequency: 66,
    plane: "meaning",
    name: "Leadership / Facilitation",
    description: "Opening paths for others; proposing, organizing",
    element: "fire",
    polarity: "macro"
  },
  "66_agua_values_macro": {
    id: "66_agua_values_macro",
    frequency: 66,
    plane: "meaning",
    name: "Shared Culture / Values",
    description: "Creating or sustaining environments with clear values",
    element: "water",
    polarity: "macro"
  },
  "66_tierra_appreciation_macro": {
    id: "66_tierra_appreciation_macro",
    frequency: 66,
    plane: "meaning",
    name: "Appreciating Others",
    description: "Valuing others' effort/virtue without servility",
    element: "earth",
    polarity: "macro"
  },
  "66_aire_acceptance_macro": {
    id: "66_aire_acceptance_macro",
    frequency: 66,
    plane: "meaning",
    name: "Diplomacy / Healing Friction",
    description: "Mediating, lowering conflict, enabling complex coexistence",
    element: "air",
    polarity: "macro"
  },
  "66_eter_potential_macro": {
    id: "66_eter_potential_macro",
    frequency: 66,
    plane: "meaning",
    name: "Mentoring / Opening Doors",
    description: "Supporting others' potential (opportunities, resources)",
    element: "ether",
    polarity: "macro"
  },
  "66_luz_telos_macro": {
    id: "66_luz_telos_macro",
    frequency: 66,
    plane: "meaning",
    name: "Shared Mission / Group Alignment",
    description: "Collective projects with purpose beyond immediate interests",
    element: "light",
    polarity: "macro"
  },

  // Essence 00 — Nula (veto / noise)
  "00_esencia_nula": {
    id: "00_esencia_nula",
    frequency: 0,
    plane: "null",
    name: "Nula (Veto/Noise)",
    description: "Used when content is disrespectful/toxic or outside the whitelist",
    element: "void"
  }
};

export const ESSENCE_WHITELIST = Object.keys(ESSENCE_ONTOLOGY);

export function getEssenceById(id: string): EssenceArchetype | undefined {
  return ESSENCE_ONTOLOGY[id];
}

export function getFrequencyLabel(frequency: number): string {
  switch (frequency) {
    case 47: return "Emotional";
    case 55: return "Action";
    case 66: return "Meaning";
    default: return "Unknown";
  }
}

export function getElementIcon(element: string): string {
  switch (element) {
    case "water": return "💧";
    case "air": return "💨";
    case "fire": return "🔥";
    case "earth": return "🌍";
    case "ether": return "✨";
    case "light": return "☀️";
    default: return "○";
  }
}

// === DYNAMIC ENCOUNTER SYSTEM ===

// Element imagery for narrative descriptions
export const ELEMENT_IMAGERY: Record<string, {
  setting: string;
  atmosphere: string;
  sensory: string;
  movement: string;
}> = {
  water: {
    setting: "near a quiet stream, the water catching fragments of light",
    atmosphere: "The air feels soft, almost liquid, carrying echoes of emotion",
    sensory: "You feel a gentle current pulling at something deep within",
    movement: "The shadow ripples like a reflection on still water"
  },
  air: {
    setting: "in an open clearing where thoughts seem to drift like clouds",
    atmosphere: "The space feels expansive, filled with unspoken understanding",
    sensory: "A gentle breeze carries whispers of insight",
    movement: "The shadow shifts like smoke, hard to pin down yet present"
  },
  fire: {
    setting: "near a warm glow that illuminates without burning",
    atmosphere: "Energy crackles in the space between you, alive with possibility",
    sensory: "You feel a spark of something—courage, perhaps, or determination",
    movement: "The shadow flickers with intensity, demanding to be seen"
  },
  earth: {
    setting: "on solid ground, surrounded by ancient stones and steady presence",
    atmosphere: "The space feels grounded, rooted in something deeper than words",
    sensory: "You sense the weight of what matters, the gravity of connection",
    movement: "The shadow stands firm, neither advancing nor retreating"
  },
  ether: {
    setting: "in a space that feels between worlds, shimmering with potential",
    atmosphere: "Possibility hangs in the air like stardust",
    sensory: "You feel the edges of something creative wanting to emerge",
    movement: "The shadow seems to dance at the edge of imagination"
  },
  light: {
    setting: "where soft radiance reveals what was hidden",
    atmosphere: "Clarity suffuses everything, gentle but illuminating",
    sensory: "You sense meaning weaving through the encounter",
    movement: "The shadow and light intertwine, no longer opposites"
  }
};

// Polarity tones for emotional coloring
export const POLARITY_TONES: Record<string, {
  quality: string;
  invitation: string;
  integration: string;
}> = {
  lunar: {
    quality: "what has been difficult to face",
    invitation: "What part of this shadow holds something you haven't fully acknowledged?",
    integration: "Even the tender places deserve gentle attention"
  },
  solar: {
    quality: "the strength you've been building",
    invitation: "What capability is ready to be claimed more fully?",
    integration: "Your light is meant to be shared, not hidden"
  },
  natural: {
    quality: "your spontaneous wisdom",
    invitation: "What would happen if you trusted your instincts here?",
    integration: "Sometimes the right action arises without forcing"
  },
  arcana: {
    quality: "the structure you've been creating",
    invitation: "What practice or pattern has been supporting you?",
    integration: "Discipline and devotion can be acts of love"
  },
  micro: {
    quality: "your inner knowing",
    invitation: "What do you sense is true for you, beneath the noise?",
    integration: "Self-understanding is the foundation of connection"
  },
  macro: {
    quality: "your gift to others",
    invitation: "How does what you're learning want to serve beyond yourself?",
    integration: "Your growth ripples outward to those you love"
  }
};

// MI-aligned choice types for encounter
export type MIChoiceType = "complex_reflection" | "change_talk" | "values_link" | "autonomy_support";

export interface DynamicChoice {
  id: number;
  type: MIChoiceType;
  text: string;
  outcome: string;
  delta: { calm: number; understanding: number; boundary: number };
  essenceId?: string;
}

export interface DynamicScene {
  id: string;
  title: string;
  narrative: string;
  companionHint: Record<string, string>;
  choices: DynamicChoice[];
}

// Companion MI guidance styles
const COMPANION_MI_STYLES: Record<string, {
  reflection: string;
  evocation: string;
  values: string;
  autonomy: string;
}> = {
  owl: {
    reflection: "observes the deeper pattern",
    evocation: "asks what wisdom this moment holds",
    values: "wonders what matters most to you here",
    autonomy: "trusts you to find your own path"
  },
  fox: {
    reflection: "notices what's shifting beneath the surface",
    evocation: "is curious what change is calling to you",
    values: "senses something important wants attention",
    autonomy: "knows you'll find a clever way through"
  },
  bear: {
    reflection: "holds space for the weight of this",
    evocation: "feels the strength building in you",
    values: "stands with you in what matters",
    autonomy: "respects the boundary only you can set"
  },
  deer: {
    reflection: "gently mirrors what your heart is saying",
    evocation: "invites the tender truth forward",
    values: "attunes to the love underneath",
    autonomy: "honors the pace you need to take"
  }
};

// Companion names for display
const COMPANION_NAMES: Record<string, string> = {
  owl: "The Owl",
  fox: "The Fox",
  bear: "The Bear",
  deer: "The Deer"
};

// Build dynamic encounter scenes based on player's essences
export function buildDynamicEncounter(
  topEssences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  companionId: string,
  shadowLabel: string
): DynamicScene[] {
  const primaryEssence = topEssences[0]?.archetype;
  const secondaryEssence = topEssences[1]?.archetype;
  
  const primaryElement = primaryEssence?.element || "earth";
  const primaryPolarity = primaryEssence?.polarity || "lunar";
  const secondaryElement = secondaryEssence?.element || "water";
  
  const imagery = ELEMENT_IMAGERY[primaryElement] || ELEMENT_IMAGERY.earth;
  const secondaryImagery = ELEMENT_IMAGERY[secondaryElement] || ELEMENT_IMAGERY.water;
  const tone = topEssences.length > 0 
    ? (POLARITY_TONES[primaryPolarity] || POLARITY_TONES.lunar)
    : { quality: "this moment", invitation: "What feels important here?", integration: "Something has shifted" };
  const companionStyle = COMPANION_MI_STYLES[companionId] || COMPANION_MI_STYLES.owl;
  const companionName = COMPANION_NAMES[companionId] || "Your companion";
  
  const essenceNames = topEssences.length > 0 
    ? topEssences.slice(0, 3).map(e => e.archetype.name).join(", ")
    : "your inner wisdom";

  // Helper to build companion hint for selected companion only
  const buildHint = (style: string, question: string) => {
    const hint: Record<string, string> = {};
    hint[companionId] = `${companionName} ${style}: "${question}"`;
    return hint;
  };

  // Stage 1: Approach - Complex Reflection focus
  const approachNarrative = topEssences.length > 0
    ? `You find yourself ${imagery.setting}. ${imagery.atmosphere}. Before you, the shadow of ${shadowLabel} takes shape—not threatening, but present, asking to be met. ${imagery.sensory}. ${imagery.movement}.`
    : `You find yourself in a quiet space where something important waits. Before you, the shadow of ${shadowLabel} takes shape—not threatening, but present, asking to be met.`;
  
  const approachScene: DynamicScene = {
    id: "approach",
    title: "The Approach",
    narrative: approachNarrative,
    companionHint: buildHint(companionStyle.reflection, topEssences.length > 0 ? `What do you notice about ${tone.quality}?` : "What do you notice in this moment?"),
    choices: buildApproachChoices(topEssences, tone)
  };

  // Stage 2: Threshold - Change Talk Evocation focus
  const thresholdNarrative = topEssences.length > 0
    ? `${secondaryImagery.atmosphere}. An invisible boundary lies between you and the shadow. ${tone.invitation} The space feels charged with what could be—not what must be.`
    : `An invisible boundary lies between you and the shadow. The space feels charged with possibility. What could change here?`;
  
  const thresholdScene: DynamicScene = {
    id: "threshold",
    title: "The Threshold",
    narrative: thresholdNarrative,
    companionHint: buildHint(companionStyle.evocation, "What change feels possible from here?"),
    choices: buildThresholdChoices(topEssences, tone)
  };

  // Stage 3: Exchange - Values Linking focus
  const exchangeNarrative = topEssences.length > 0
    ? `Face to face now, the shadow reveals ${tone.quality}. This is the moment of true meeting—where what you've been carrying can be spoken, where ${primaryEssence?.name || "your journey"} meets the reality of connection.`
    : `Face to face now, the shadow's features become clearer. This is the moment of true meeting—where what you've been carrying can be spoken.`;
  
  const exchangeScene: DynamicScene = {
    id: "exchange",
    title: "The Exchange",
    narrative: exchangeNarrative,
    companionHint: buildHint(companionStyle.values, "What matters most to the parent you want to be?"),
    choices: buildExchangeChoices(topEssences, shadowLabel)
  };

  // Stage 4: Integration - Autonomy Support focus
  const integrationNarrative = topEssences.length > 0
    ? `Something has shifted. ${tone.integration}. The shadow no longer feels separate—it's part of the whole picture, part of your path as a parent navigating ${shadowLabel}. What you choose now is entirely yours to choose.`
    : `Something has shifted. The shadow no longer feels like an opponent—it's part of the whole picture. What you choose now is entirely yours to choose.`;
  
  const integrationScene: DynamicScene = {
    id: "integration",
    title: "The Integration",
    narrative: integrationNarrative,
    companionHint: buildHint(companionStyle.autonomy, "Only you know what's right for you."),
    choices: buildIntegrationChoices(topEssences, essenceNames)
  };

  return [approachScene, thresholdScene, exchangeScene, integrationScene];
}

// MI-aligned choice builders for each stage

function buildApproachChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  tone: typeof POLARITY_TONES[string]
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Acknowledge ${e1.name}—reflect what you're truly feeling` : "Pause and reflect on what you're truly feeling",
      outcome: e1 ? `You name the ${e1.name} within you. The shadow seems to soften, as if being seen matters.` : "You pause, letting yourself feel what's present. The shadow seems to notice.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Notice what ${e2.name} reveals about what you want to change` : "Notice what wants to shift or change here",
      outcome: e2 ? `Through ${e2.name}, you glimpse what's ready to transform.` : "You sense movement within—something ready to shift.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `Honor your ${e3.name}—you choose how to meet this shadow` : "Affirm that you choose how to meet this shadow",
      outcome: e3 ? `Claiming your ${e3.name}, you remember: this is your path to walk.` : "You stand in your own authority. This encounter is yours to navigate.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0 
        ? `Draw on all you've gathered—let ${essences.slice(0, 2).map(e => e.archetype.name).join(" and ")} guide your first step`
        : "Let your deeper values guide your first step",
      outcome: "Drawing on the wisdom of your journey, you approach with integrated presence.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}

function buildThresholdChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  tone: typeof POLARITY_TONES[string]
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Speak what ${e1.name} has been trying to tell you` : "Speak what your heart has been trying to say",
      outcome: e1 ? `The ${e1.name} finds voice. Words come—not perfect, but true.` : "Truth emerges, imperfect but real.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Ask yourself: why does ${e2.name} matter to you right now?` : "Ask yourself: why does this change matter to you?",
      outcome: e2 ? `Questioning ${e2.name}, you find the deeper reason beneath.` : "In asking, you discover what you already knew.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `Set a boundary with ${e3.name}—what you will and won't carry forward` : "Set a boundary—what you will and won't carry forward",
      outcome: e3 ? `Through ${e3.name}, you define your limits with clarity and care.` : "You define your limits. The shadow respects the clarity.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0
        ? `Trust the threshold: ${essences.slice(0, 2).map(e => e.archetype.name).join(" and ")} have prepared you for this crossing`
        : "Trust that you're prepared for this crossing",
      outcome: "Your gathered wisdom becomes the bridge. You cross with confidence.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}

function buildExchangeChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  shadowLabel: string
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Share how ${e1.name} connects to being the parent you want to be` : "Share what kind of parent you want to be around " + shadowLabel,
      outcome: e1 ? `You speak from ${e1.name}, linking it to your deepest parenting values. The shadow listens.` : "You speak from your values. The shadow truly listens.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Name the change ${e2.name} is calling you toward` : "Name the change you're ready to commit to",
      outcome: e2 ? `${e2.name} crystallizes into commitment. You feel something click into place.` : "Commitment crystallizes. Something clicks into place.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `With ${e3.name}, name what you need—without apology` : "Name what you need—without apology",
      outcome: e3 ? `Grounded in ${e3.name}, your needs become clear. There's power in asking directly.` : "Your needs become clear. There's power in asking directly.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0
        ? `Offer what you've learned: how ${essences.slice(0, 2).map(e => e.archetype.name).join(" and ")} shape your path forward`
        : "Offer what you've learned about yourself and your path forward",
      outcome: "You weave your essences into a gift of understanding. The exchange feels complete.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}

function buildIntegrationChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  essenceNames: string
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Offer gratitude for ${e1.name} and what it revealed` : "Offer gratitude for what this encounter revealed",
      outcome: e1 ? `Gratitude for ${e1.name} settles like light. Something in you softens and heals.` : "Gratitude settles like soft light. Something heals.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Commit to carrying ${e2.name} forward—even when it's hard` : "Commit to carrying this understanding forward",
      outcome: e2 ? `You make a quiet vow around ${e2.name}. It feels like a direction, not a burden.` : "The commitment feels right—not a burden, but a direction.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `Release what no longer serves—${e3.name} shows you what to let go` : "Release what no longer serves—let go with clarity",
      outcome: e3 ? `With ${e3.name} as your guide, you release old patterns. The path ahead clears.` : "In letting go, you feel lighter. The path ahead clears.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0
        ? `Integrate all you've gathered: ${essenceNames} now flow as one`
        : "Integrate all you've gathered into a single, centered presence",
      outcome: "Your essences weave together into something new. You leave this encounter changed.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}
export interface EssenceArchetype {
  id: string;
  frequency: 47 | 55 | 66 | 0;
  plane: "emotional" | "action" | "meaning" | "null";
  name: string;
  description: string;
  element: string;
  polarity?: "lunar" | "solar" | "natural" | "arcana" | "micro" | "macro";
}

export const ESSENCE_ONTOLOGY: Record<string, EssenceArchetype> = {
  // Frequency 47 — Emotional plane (Lunar = shadow-side)
  "47_agua_lunar": {
    id: "47_agua_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Sadness / Grief / Melancholy",
    description: "Felt loss, nostalgia, feeling left behind",
    element: "water",
    polarity: "lunar"
  },
  "47_aire_lunar": {
    id: "47_aire_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Guilt / Shame / Self-Disgust",
    description: "Harsh moral self-critique, 'I'm bad / worthless'",
    element: "air",
    polarity: "lunar"
  },
  "47_fuego_lunar": {
    id: "47_fuego_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Anger / Resentment / Injustice Rage",
    description: "Attack-energy aimed at what feels unfair",
    element: "fire",
    polarity: "lunar"
  },
  "47_tierra_lunar": {
    id: "47_tierra_lunar",
    frequency: 47,
    plane: "emotional",
    name: "Fear / Anxiety / Insecurity",
    description: "Threat-sense, instability, anticipation of disaster",
    element: "earth",
    polarity: "lunar"
  },
  
  // Frequency 47 — Emotional plane (Solar = light-side)
  "47_agua_solar": {
    id: "47_agua_solar",
    frequency: 47,
    plane: "emotional",
    name: "Relief / Release / Flow",
    description: "Tension discharge, letting go",
    element: "water",
    polarity: "solar"
  },
  "47_aire_solar": {
    id: "47_aire_solar",
    frequency: 47,
    plane: "emotional",
    name: "Clarity / Perspective / Lightness",
    description: "Internal order, clearer perception",
    element: "air",
    polarity: "solar"
  },
  "47_fuego_solar": {
    id: "47_fuego_solar",
    frequency: 47,
    plane: "emotional",
    name: "Courage / Just Anger / Energy to Act",
    description: "Anger channeled into change",
    element: "fire",
    polarity: "solar"
  },
  "47_tierra_solar": {
    id: "47_tierra_solar",
    frequency: 47,
    plane: "emotional",
    name: "Safety / Grounding / Stability",
    description: "Solid ground, containment, steadiness",
    element: "earth",
    polarity: "solar"
  },
  "47_eter_puro": {
    id: "47_eter_puro",
    frequency: 47,
    plane: "emotional",
    name: "Playful Joy",
    description: "Enjoyment not tied to productivity/utility; requires absence of aggression/sarcasm/cynicism",
    element: "ether",
    polarity: "solar"
  },

  // Frequency 55 — Action plane (Natural = spontaneous)
  "55_fuego_natural": {
    id: "55_fuego_natural",
    frequency: 55,
    plane: "action",
    name: "Impulsive / Energetic Action",
    description: "Sudden confront, slam door, 'I'll say it now'",
    element: "fire",
    polarity: "natural"
  },
  "55_agua_natural": {
    id: "55_agua_natural",
    frequency: 55,
    plane: "action",
    name: "Spontaneous Self-Care",
    description: "Rest, bath, take a break",
    element: "water",
    polarity: "natural"
  },
  "55_aire_natural": {
    id: "55_aire_natural",
    frequency: 55,
    plane: "action",
    name: "Explore Ideas / Talk It Out",
    description: "Tell a friend, speak with someone trusted",
    element: "air",
    polarity: "natural"
  },
  "55_tierra_natural": {
    id: "55_tierra_natural",
    frequency: 55,
    plane: "action",
    name: "Everyday Stabilizing Habits",
    description: "Walk more, cook simple food, tidy a space",
    element: "earth",
    polarity: "natural"
  },
  "55_eter_natural": {
    id: "55_eter_natural",
    frequency: 55,
    plane: "action",
    name: "Spontaneous Creative Exploration",
    description: "Write/draw without objective",
    element: "ether",
    polarity: "natural"
  },

  // Frequency 55 — Action plane (Arcana = structured program)
  "55_fuego_arcana": {
    id: "55_fuego_arcana",
    frequency: 55,
    plane: "action",
    name: "Structured Effort Routine",
    description: "E.g., train 3×/week for a month",
    element: "fire",
    polarity: "arcana"
  },
  "55_agua_arcana": {
    id: "55_agua_arcana",
    frequency: 55,
    plane: "action",
    name: "Emotion Regulation Program",
    description: "Sleep routine, nightly emotion log",
    element: "water",
    polarity: "arcana"
  },
  "55_aire_arcana": {
    id: "55_aire_arcana",
    frequency: 55,
    plane: "action",
    name: "Structured Cognitive Work",
    description: "Thought record, behavioral experiment",
    element: "air",
    polarity: "arcana"
  },
  "55_tierra_arcana": {
    id: "55_tierra_arcana",
    frequency: 55,
    plane: "action",
    name: "Structured Hygiene / Plan",
    description: "Follow a meal plan 2 weeks, 30-day sleep routine",
    element: "earth",
    polarity: "arcana"
  },
  "55_eter_arcana": {
    id: "55_eter_arcana",
    frequency: 55,
    plane: "action",
    name: "Guided Creative Program",
    description: "Writing course, X-day creativity program",
    element: "ether",
    polarity: "arcana"
  },

  // Frequency 66 — Meaning plane (Micro = inward)
  "66_fuego_choice_micro": {
    id: "66_fuego_choice_micro",
    frequency: 66,
    plane: "meaning",
    name: "Inner Decision",
    description: "Choosing for yourself, even without a detailed plan yet",
    element: "fire",
    polarity: "micro"
  },
  "66_agua_values_micro": {
    id: "66_agua_values_micro",
    frequency: 66,
    plane: "meaning",
    name: "Personal Values",
    description: "What matters to me beyond external pressure",
    element: "water",
    polarity: "micro"
  },
  "66_tierra_appreciation_micro": {
    id: "66_tierra_appreciation_micro",
    frequency: 66,
    plane: "meaning",
    name: "Self-Appreciation",
    description: "Recognizing your qualities; tending your own ground",
    element: "earth",
    polarity: "micro"
  },
  "66_aire_acceptance_micro": {
    id: "66_aire_acceptance_micro",
    frequency: 66,
    plane: "meaning",
    name: "Accepting Limits",
    description: "Some things can't be controlled; that doesn't invalidate the person",
    element: "air",
    polarity: "micro"
  },
  "66_eter_potential_micro": {
    id: "66_eter_potential_micro",
    frequency: 66,
    plane: "meaning",
    name: "Recognizing Inner Potential",
    description: "'I could become…', without empty fantasy",
    element: "ether",
    polarity: "micro"
  },
  "66_luz_telos_micro": {
    id: "66_luz_telos_micro",
    frequency: 66,
    plane: "meaning",
    name: "Personal Meaning (Intimate Telos)",
    description: "What kind of life/story I want to live",
    element: "light",
    polarity: "micro"
  },

  // Frequency 66 — Meaning plane (Macro = outward)
  "66_fuego_choice_macro": {
    id: "66_fuego_choice_macro",
    frequency: 66,
    plane: "meaning",
    name: "Leadership / Facilitation",
    description: "Opening paths for others; proposing, organizing",
    element: "fire",
    polarity: "macro"
  },
  "66_agua_values_macro": {
    id: "66_agua_values_macro",
    frequency: 66,
    plane: "meaning",
    name: "Shared Culture / Values",
    description: "Creating or sustaining environments with clear values",
    element: "water",
    polarity: "macro"
  },
  "66_tierra_appreciation_macro": {
    id: "66_tierra_appreciation_macro",
    frequency: 66,
    plane: "meaning",
    name: "Appreciating Others",
    description: "Valuing others' effort/virtue without servility",
    element: "earth",
    polarity: "macro"
  },
  "66_aire_acceptance_macro": {
    id: "66_aire_acceptance_macro",
    frequency: 66,
    plane: "meaning",
    name: "Diplomacy / Healing Friction",
    description: "Mediating, lowering conflict, enabling complex coexistence",
    element: "air",
    polarity: "macro"
  },
  "66_eter_potential_macro": {
    id: "66_eter_potential_macro",
    frequency: 66,
    plane: "meaning",
    name: "Mentoring / Opening Doors",
    description: "Supporting others' potential (opportunities, resources)",
    element: "ether",
    polarity: "macro"
  },
  "66_luz_telos_macro": {
    id: "66_luz_telos_macro",
    frequency: 66,
    plane: "meaning",
    name: "Shared Mission / Group Alignment",
    description: "Collective projects with purpose beyond immediate interests",
    element: "light",
    polarity: "macro"
  },

  // Essence 00 — Nula (veto / noise)
  "00_esencia_nula": {
    id: "00_esencia_nula",
    frequency: 0,
    plane: "null",
    name: "Nula (Veto/Noise)",
    description: "Used when content is disrespectful/toxic or outside the whitelist",
    element: "void"
  }
};

export const ESSENCE_WHITELIST = Object.keys(ESSENCE_ONTOLOGY);

export function getEssenceById(id: string): EssenceArchetype | undefined {
  return ESSENCE_ONTOLOGY[id];
}

export function getFrequencyLabel(frequency: number): string {
  switch (frequency) {
    case 47: return "Emotional";
    case 55: return "Action";
    case 66: return "Meaning";
    default: return "Unknown";
  }
}

export function getElementIcon(element: string): string {
  switch (element) {
    case "water": return "💧";
    case "air": return "💨";
    case "fire": return "🔥";
    case "earth": return "🌍";
    case "ether": return "✨";
    case "light": return "☀️";
    default: return "○";
  }
}

// === DYNAMIC ENCOUNTER SYSTEM ===

// Element imagery for narrative descriptions
export const ELEMENT_IMAGERY: Record<string, {
  setting: string;
  atmosphere: string;
  sensory: string;
  movement: string;
}> = {
  water: {
    setting: "near a quiet stream, the water catching fragments of light",
    atmosphere: "The air feels soft, almost liquid, carrying echoes of emotion",
    sensory: "You feel a gentle current pulling at something deep within",
    movement: "The shadow ripples like a reflection on still water"
  },
  air: {
    setting: "in an open clearing where thoughts seem to drift like clouds",
    atmosphere: "The space feels expansive, filled with unspoken understanding",
    sensory: "A gentle breeze carries whispers of insight",
    movement: "The shadow shifts like smoke, hard to pin down yet present"
  },
  fire: {
    setting: "near a warm glow that illuminates without burning",
    atmosphere: "Energy crackles in the space between you, alive with possibility",
    sensory: "You feel a spark of something—courage, perhaps, or determination",
    movement: "The shadow flickers with intensity, demanding to be seen"
  },
  earth: {
    setting: "on solid ground, surrounded by ancient stones and steady presence",
    atmosphere: "The space feels grounded, rooted in something deeper than words",
    sensory: "You sense the weight of what matters, the gravity of connection",
    movement: "The shadow stands firm, neither advancing nor retreating"
  },
  ether: {
    setting: "in a space that feels between worlds, shimmering with potential",
    atmosphere: "Possibility hangs in the air like stardust",
    sensory: "You feel the edges of something creative wanting to emerge",
    movement: "The shadow seems to dance at the edge of imagination"
  },
  light: {
    setting: "where soft radiance reveals what was hidden",
    atmosphere: "Clarity suffuses everything, gentle but illuminating",
    sensory: "You sense meaning weaving through the encounter",
    movement: "The shadow and light intertwine, no longer opposites"
  }
};

// Polarity tones for emotional coloring
export const POLARITY_TONES: Record<string, {
  quality: string;
  invitation: string;
  integration: string;
}> = {
  lunar: {
    quality: "what has been difficult to face",
    invitation: "What part of this shadow holds something you haven't fully acknowledged?",
    integration: "Even the tender places deserve gentle attention"
  },
  solar: {
    quality: "the strength you've been building",
    invitation: "What capability is ready to be claimed more fully?",
    integration: "Your light is meant to be shared, not hidden"
  },
  natural: {
    quality: "your spontaneous wisdom",
    invitation: "What would happen if you trusted your instincts here?",
    integration: "Sometimes the right action arises without forcing"
  },
  arcana: {
    quality: "the structure you've been creating",
    invitation: "What practice or pattern has been supporting you?",
    integration: "Discipline and devotion can be acts of love"
  },
  micro: {
    quality: "your inner knowing",
    invitation: "What do you sense is true for you, beneath the noise?",
    integration: "Self-understanding is the foundation of connection"
  },
  macro: {
    quality: "your gift to others",
    invitation: "How does what you're learning want to serve beyond yourself?",
    integration: "Your growth ripples outward to those you love"
  }
};

// MI-aligned choice types for encounter
export type MIChoiceType = "complex_reflection" | "change_talk" | "values_link" | "autonomy_support";

export interface DynamicChoice {
  id: number;
  type: MIChoiceType;
  text: string;
  outcome: string;
  delta: { calm: number; understanding: number; boundary: number };
  essenceId?: string;
}

export interface DynamicScene {
  id: string;
  title: string;
  narrative: string;
  companionHint: Record<string, string>;
  choices: DynamicChoice[];
}

// Companion MI guidance styles
const COMPANION_MI_STYLES: Record<string, {
  reflection: string;
  evocation: string;
  values: string;
  autonomy: string;
}> = {
  owl: {
    reflection: "observes the deeper pattern",
    evocation: "asks what wisdom this moment holds",
    values: "wonders what matters most to you here",
    autonomy: "trusts you to find your own path"
  },
  fox: {
    reflection: "notices what's shifting beneath the surface",
    evocation: "is curious what change is calling to you",
    values: "senses something important wants attention",
    autonomy: "knows you'll find a clever way through"
  },
  bear: {
    reflection: "holds space for the weight of this",
    evocation: "feels the strength building in you",
    values: "stands with you in what matters",
    autonomy: "respects the boundary only you can set"
  },
  deer: {
    reflection: "gently mirrors what your heart is saying",
    evocation: "invites the tender truth forward",
    values: "attunes to the love underneath",
    autonomy: "honors the pace you need to take"
  }
};

// Companion names for display
const COMPANION_NAMES: Record<string, string> = {
  owl: "The Owl",
  fox: "The Fox",
  bear: "The Bear",
  deer: "The Deer"
};

// Build dynamic encounter scenes based on player's essences
export function buildDynamicEncounter(
  topEssences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  companionId: string,
  shadowLabel: string
): DynamicScene[] {
  const primaryEssence = topEssences[0]?.archetype;
  const secondaryEssence = topEssences[1]?.archetype;
  
  const primaryElement = primaryEssence?.element || "earth";
  const primaryPolarity = primaryEssence?.polarity || "lunar";
  const secondaryElement = secondaryEssence?.element || "water";
  
  const imagery = ELEMENT_IMAGERY[primaryElement] || ELEMENT_IMAGERY.earth;
  const secondaryImagery = ELEMENT_IMAGERY[secondaryElement] || ELEMENT_IMAGERY.water;
  const tone = topEssences.length > 0 
    ? (POLARITY_TONES[primaryPolarity] || POLARITY_TONES.lunar)
    : { quality: "this moment", invitation: "What feels important here?", integration: "Something has shifted" };
  const companionStyle = COMPANION_MI_STYLES[companionId] || COMPANION_MI_STYLES.owl;
  const companionName = COMPANION_NAMES[companionId] || "Your companion";
  
  const essenceNames = topEssences.length > 0 
    ? topEssences.slice(0, 3).map(e => e.archetype.name).join(", ")
    : "your inner wisdom";

  // Helper to build companion hint for selected companion only
  const buildHint = (style: string, question: string) => {
    const hint: Record<string, string> = {};
    hint[companionId] = `${companionName} ${style}: "${question}"`;
    return hint;
  };

  // Stage 1: Approach - Complex Reflection focus
  const approachNarrative = topEssences.length > 0
    ? `You find yourself ${imagery.setting}. ${imagery.atmosphere}. Before you, the shadow of ${shadowLabel} takes shape—not threatening, but present, asking to be met. ${imagery.sensory}. ${imagery.movement}.`
    : `You find yourself in a quiet space where something important waits. Before you, the shadow of ${shadowLabel} takes shape—not threatening, but present, asking to be met.`;
  
  const approachScene: DynamicScene = {
    id: "approach",
    title: "The Approach",
    narrative: approachNarrative,
    companionHint: buildHint(companionStyle.reflection, topEssences.length > 0 ? `What do you notice about ${tone.quality}?` : "What do you notice in this moment?"),
    choices: buildApproachChoices(topEssences, tone)
  };

  // Stage 2: Threshold - Change Talk Evocation focus
  const thresholdNarrative = topEssences.length > 0
    ? `${secondaryImagery.atmosphere}. An invisible boundary lies between you and the shadow. ${tone.invitation} The space feels charged with what could be—not what must be.`
    : `An invisible boundary lies between you and the shadow. The space feels charged with possibility. What could change here?`;
  
  const thresholdScene: DynamicScene = {
    id: "threshold",
    title: "The Threshold",
    narrative: thresholdNarrative,
    companionHint: buildHint(companionStyle.evocation, "What change feels possible from here?"),
    choices: buildThresholdChoices(topEssences, tone)
  };

  // Stage 3: Exchange - Values Linking focus
  const exchangeNarrative = topEssences.length > 0
    ? `Face to face now, the shadow reveals ${tone.quality}. This is the moment of true meeting—where what you've been carrying can be spoken, where ${primaryEssence?.name || "your journey"} meets the reality of connection.`
    : `Face to face now, the shadow's features become clearer. This is the moment of true meeting—where what you've been carrying can be spoken.`;
  
  const exchangeScene: DynamicScene = {
    id: "exchange",
    title: "The Exchange",
    narrative: exchangeNarrative,
    companionHint: buildHint(companionStyle.values, "What matters most to the parent you want to be?"),
    choices: buildExchangeChoices(topEssences, shadowLabel)
  };

  // Stage 4: Integration - Autonomy Support focus
  const integrationNarrative = topEssences.length > 0
    ? `Something has shifted. ${tone.integration}. The shadow no longer feels separate—it's part of the whole picture, part of your path as a parent navigating ${shadowLabel}. What you choose now is entirely yours to choose.`
    : `Something has shifted. The shadow no longer feels like an opponent—it's part of the whole picture. What you choose now is entirely yours to choose.`;
  
  const integrationScene: DynamicScene = {
    id: "integration",
    title: "The Integration",
    narrative: integrationNarrative,
    companionHint: buildHint(companionStyle.autonomy, "Only you know what's right for you."),
    choices: buildIntegrationChoices(topEssences, essenceNames)
  };

  return [approachScene, thresholdScene, exchangeScene, integrationScene];
}

// MI-aligned choice builders for each stage

function buildApproachChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  tone: typeof POLARITY_TONES[string]
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Acknowledge ${e1.name}—reflect what you're truly feeling` : "Pause and reflect on what you're truly feeling",
      outcome: e1 ? `You name the ${e1.name} within you. The shadow seems to soften, as if being seen matters.` : "You pause, letting yourself feel what's present. The shadow seems to notice.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Notice what ${e2.name} reveals about what you want to change` : "Notice what wants to shift or change here",
      outcome: e2 ? `Through ${e2.name}, you glimpse what's ready to transform.` : "You sense movement within—something ready to shift.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `Honor your ${e3.name}—you choose how to meet this shadow` : "Affirm that you choose how to meet this shadow",
      outcome: e3 ? `Claiming your ${e3.name}, you remember: this is your path to walk.` : "You stand in your own authority. This encounter is yours to navigate.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0 
        ? `Draw on all you've gathered—let ${essences.slice(0, 2).map(e => e.archetype.name).join(" and ")} guide your first step`
        : "Let your deeper values guide your first step",
      outcome: "Drawing on the wisdom of your journey, you approach with integrated presence.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}

function buildThresholdChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  tone: typeof POLARITY_TONES[string]
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Speak what ${e1.name} has been trying to tell you` : "Speak what your heart has been trying to say",
      outcome: e1 ? `The ${e1.name} finds voice. Words come—not perfect, but true.` : "Truth emerges, imperfect but real.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Ask yourself: why does ${e2.name} matter to you right now?` : "Ask yourself: why does this change matter to you?",
      outcome: e2 ? `Questioning ${e2.name}, you find the deeper reason beneath.` : "In asking, you discover what you already knew.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `Set a boundary with ${e3.name}—what you will and won't carry forward` : "Set a boundary—what you will and won't carry forward",
      outcome: e3 ? `Through ${e3.name}, you define your limits with clarity and care.` : "You define your limits. The shadow respects the clarity.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0
        ? `Trust the threshold: ${essences.slice(0, 2).map(e => e.archetype.name).join(" and ")} have prepared you for this crossing`
        : "Trust that you're prepared for this crossing",
      outcome: "Your gathered wisdom becomes the bridge. You cross with confidence.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}

function buildExchangeChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  shadowLabel: string
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Share how ${e1.name} connects to being the parent you want to be` : "Share what kind of parent you want to be around " + shadowLabel,
      outcome: e1 ? `You speak from ${e1.name}, linking it to your deepest parenting values. The shadow listens.` : "You speak from your values. The shadow truly listens.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Name the change ${e2.name} is calling you toward` : "Name the change you're ready to commit to",
      outcome: e2 ? `${e2.name} crystallizes into commitment. You feel something click into place.` : "Commitment crystallizes. Something clicks into place.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `With ${e3.name}, name what you need—without apology` : "Name what you need—without apology",
      outcome: e3 ? `Grounded in ${e3.name}, your needs become clear. There's power in asking directly.` : "Your needs become clear. There's power in asking directly.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0
        ? `Offer what you've learned: how ${essences.slice(0, 2).map(e => e.archetype.name).join(" and ")} shape your path forward`
        : "Offer what you've learned about yourself and your path forward",
      outcome: "You weave your essences into a gift of understanding. The exchange feels complete.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}

function buildIntegrationChoices(
  essences: Array<{ id: string; archetype: EssenceArchetype; score: number }>,
  essenceNames: string
): DynamicChoice[] {
  const e1 = essences[0]?.archetype;
  const e2 = essences[1]?.archetype;
  const e3 = essences[2]?.archetype;
  
  return [
    {
      id: 0,
      type: "complex_reflection",
      text: e1 ? `Offer gratitude for ${e1.name} and what it revealed` : "Offer gratitude for what this encounter revealed",
      outcome: e1 ? `Gratitude for ${e1.name} settles like light. Something in you softens and heals.` : "Gratitude settles like soft light. Something heals.",
      delta: { calm: 2, understanding: 2, boundary: 0 },
      essenceId: e1?.id
    },
    {
      id: 1,
      type: "change_talk",
      text: e2 ? `Commit to carrying ${e2.name} forward—even when it's hard` : "Commit to carrying this understanding forward",
      outcome: e2 ? `You make a quiet vow around ${e2.name}. It feels like a direction, not a burden.` : "The commitment feels right—not a burden, but a direction.",
      delta: { calm: 1, understanding: 3, boundary: 0 },
      essenceId: e2?.id
    },
    {
      id: 2,
      type: "autonomy_support",
      text: e3 ? `Release what no longer serves—${e3.name} shows you what to let go` : "Release what no longer serves—let go with clarity",
      outcome: e3 ? `With ${e3.name} as your guide, you release old patterns. The path ahead clears.` : "In letting go, you feel lighter. The path ahead clears.",
      delta: { calm: 0, understanding: 1, boundary: 3 },
      essenceId: e3?.id
    },
    {
      id: 3,
      type: "values_link",
      text: essences.length > 0
        ? `Integrate all you've gathered: ${essenceNames} now flow as one`
        : "Integrate all you've gathered into a single, centered presence",
      outcome: "Your essences weave together into something new. You leave this encounter changed.",
      delta: { calm: 1, understanding: 1, boundary: 1 }
    }
  ];
}
