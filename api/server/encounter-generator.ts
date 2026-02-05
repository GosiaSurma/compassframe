import OpenAI from "openai";
import { ESSENCE_ONTOLOGY, type EssenceArchetype } from "../shared/essences";
import type { EncounterState, EncounterScene, EncounterChoice, ArtifactDraft, GameMessage } from "../shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SCENE_NAMES = ["Approach", "Threshold", "Exchange", "Integration"] as const;

const COMPANION_ARCHETYPES: Record<string, { name: string; voice: string; guidance: string }> = {
  owl: {
    name: "The Owl",
    voice: "wise and contemplative, speaking in gentle metaphors about seeing clearly",
    guidance: "helps you find perspective and wisdom"
  },
  fox: {
    name: "The Fox",
    voice: "clever and curious, playfully uncovering hidden truths",
    guidance: "helps you find creative solutions and adaptability"
  },
  bear: {
    name: "The Bear",
    voice: "strong and grounding, offering steadfast presence",
    guidance: "helps you find your inner strength and stand firm"
  },
  deer: {
    name: "The Deer",
    voice: "gentle and intuitive, attuned to subtle feelings",
    guidance: "helps you find gentleness and trust your instincts"
  }
};

export async function summarizeConversation(
  messages: GameMessage[],
  shadowLabel: string
): Promise<string> {
  const conversationText = messages
    .filter(m => m.userText && m.assistantText)
    .map(m => `User: ${m.userText}\nReflection Guide: ${m.assistantText}`)
    .join("\n\n");

  if (!conversationText.trim()) {
    return `A reflection on ${shadowLabel} is beginning.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content: `You are a therapeutic summarizer. Extract the KEY THEMES from this parent-teen reflection conversation about "${shadowLabel}". 

Focus on:
- What struggles or tensions emerged
- What insights or realizations occurred
- What emotions were expressed
- What the parent wants for their relationship

Write 2-3 sentences capturing the emotional essence. Use "you" to address the parent. Be evocative and metaphorical, not clinical.`
        },
        {
          role: "user",
          content: conversationText
        }
      ],
      max_completion_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || `A reflection on ${shadowLabel} has revealed important insights.`;
  } catch (error) {
    console.error("[Encounter] Failed to summarize conversation:", error);
    return `A reflection on ${shadowLabel} has revealed important insights.`;
  }
}

export async function generateScene(
  sceneIndex: number,
  companionId: string,
  shadowLabel: string,
  conversationSummary: string,
  topEssences: Array<{ id: string; archetype: EssenceArchetype }>,
  previousChoices: Array<{ sceneIndex: number; choiceText: string; outcome: string }>,
  chosenEssenceId?: string
): Promise<EncounterScene> {
  const sceneName = SCENE_NAMES[sceneIndex];
  const companion = COMPANION_ARCHETYPES[companionId] || COMPANION_ARCHETYPES.owl;

  const essenceDescriptions = topEssences.map(e =>
    `${e.archetype.name} (${e.archetype.element}, ${e.archetype.polarity}): ${e.archetype.description}`
  ).join("\n");

  // Prioritize explicitly chosen essence, fallback to top essence
  const chosenEssence = chosenEssenceId
    ? topEssences.find(e => e.id === chosenEssenceId)?.archetype?.name
    : null;
  const topEssenceName = chosenEssence || topEssences[0]?.archetype?.name || "inner wisdom";

  const previousChoicesText = previousChoices.length > 0
    ? previousChoices.map(c => `Scene ${c.sceneIndex + 1}: Chose "${c.choiceText}" → ${c.outcome}`).join("\n")
    : "This is the beginning of the journey.";

  const sceneGuidance: Record<string, string> = {
    "Approach": "The parent first senses the shadow in the distance. The scene should evoke anticipation, curiosity, and perhaps some apprehension. The shadow topic becomes a symbolic landscape or presence.",
    "Threshold": "The parent reaches a boundary or doorway. This is a moment of decision - to step forward or hold back. The scene should reflect the internal conflict around the shadow topic.",
    "Exchange": "The parent engages directly with the shadow. Something is given and received. This is the emotional heart of the encounter - vulnerability, truth, or understanding is exchanged.",
    "Integration": "The encounter resolves. The parent carries something new forward. This scene should feel like dawn after night - not everything is solved, but something has shifted."
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a narrative guide creating a symbolic, metaphoric encounter scene for a parent reflecting on their relationship with their teenager.

CONTEXT:
- Shadow topic: "${shadowLabel}"
- Conversation summary: ${conversationSummary}
- Companion: ${companion.name} (${companion.voice})
- Top essences from reflection:
${essenceDescriptions}

PREVIOUS JOURNEY:
${previousChoicesText}

CURRENT SCENE: "${sceneName}" (Scene ${sceneIndex + 1} of 4)
${sceneGuidance[sceneName]}

IMPORTANT:
- The narrative should be metaphorical/symbolic, not literal
- Weave in themes from the conversation summary
- The companion guides with their unique voice
- Include FOUR choices: 3 standard approaches + 1 special choice tied to their STRONGEST ESSENCE: "${topEssenceName}"
- The 4th choice should specifically invoke the energy/quality of "${topEssenceName}"

You MUST respond with valid JSON matching this exact structure:
{
  "title": "${sceneName}",
  "narrative": "2-3 sentences describing the scene metaphorically, weaving in the reflection themes",
  "companionHint": "1-2 sentences of guidance in the companion's voice",
  "choices": [
    {
      "id": 1,
      "text": "Choice that embodies calm/openness/heart",
      "delta": { "calm": 2, "understanding": 0, "boundary": 0 },
      "outcome": "What happens when this choice is made"
    },
    {
      "id": 2,
      "text": "Choice that embodies understanding/curiosity/wisdom",
      "delta": { "calm": 0, "understanding": 2, "boundary": 0 },
      "outcome": "What happens when this choice is made"
    },
    {
      "id": 3,
      "text": "Choice that embodies boundary/strength/clarity",
      "delta": { "calm": 0, "understanding": 0, "boundary": 2 },
      "outcome": "What happens when this choice is made"
    },
    {
      "id": 4,
      "text": "Choice that channels ${topEssenceName}",
      "delta": { "calm": 1, "understanding": 1, "boundary": 1 },
      "outcome": "What happens when invoking ${topEssenceName}"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Generate the "${sceneName}" scene for this parent's symbolic journey through "${shadowLabel}".`
        }
      ],
      max_tokens: 800,
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content) as EncounterScene;

    if (!parsed.title || !parsed.narrative || !parsed.companionHint || !Array.isArray(parsed.choices)) {
      throw new Error("Invalid scene structure");
    }

    // Override 4th choice text to be static
    if (parsed.choices[3]) {
      parsed.choices[3].text = "Use a personal essence";
    }

    return parsed;
  } catch (error) {
    console.error("[Encounter] Failed to generate scene:", error);
    return getFallbackScene(sceneIndex, companion.name, shadowLabel);
  }
}

function getFallbackScene(sceneIndex: number, companionName: string, shadowLabel: string): EncounterScene {
  const fallbackScenes: EncounterScene[] = [
    {
      title: "Approach",
      narrative: `A path stretches before you, winding toward a distant presence that feels both familiar and unsettling. The air carries whispers of ${shadowLabel}—memories, hopes, and unspoken words.`,
      companionHint: `${companionName} walks beside you: "Every journey begins with a single step. What calls you forward?"`,
      choices: [
        { id: 1, text: "Approach with an open heart, ready to receive", delta: { calm: 2, understanding: 0, boundary: 0 }, outcome: "Your openness creates a gentle warmth in the air around you." },
        { id: 2, text: "Observe carefully, seeking to understand first", delta: { calm: 0, understanding: 2, boundary: 0 }, outcome: "The path reveals subtle details you would have missed in haste." },
        { id: 3, text: "Walk with purpose, honoring your own pace", delta: { calm: 0, understanding: 0, boundary: 2 }, outcome: "Your steady presence grounds you as you move forward." },
        { id: 4, text: "Use a personal essence", delta: { calm: 1, understanding: 1, boundary: 1 }, outcome: "Your inner wisdom guides you with balanced clarity." }
      ]
    },
    {
      title: "Threshold",
      narrative: `Before you stands a threshold—not quite a door, but a shimmer in the air where the world shifts. Beyond it, ${shadowLabel} waits in symbolic form.`,
      companionHint: `${companionName} pauses: "This is the place between what was and what could be. How will you cross?"`,
      choices: [
        { id: 1, text: "Step through softly, leaving defenses behind", delta: { calm: 2, understanding: 0, boundary: 0 }, outcome: "The threshold parts like mist, welcoming your vulnerability." },
        { id: 2, text: "Pause to truly see what lies beyond", delta: { calm: 0, understanding: 2, boundary: 0 }, outcome: "Understanding blooms as you recognize what you couldn't see before." },
        { id: 3, text: "Cross firmly, carrying your truth with you", delta: { calm: 0, understanding: 0, boundary: 2 }, outcome: "You cross the threshold whole, your truth intact." },
        { id: 4, text: "Use a personal essence", delta: { calm: 1, understanding: 1, boundary: 1 }, outcome: "Your essence illuminates hidden paths you couldn't see before." }
      ]
    },
    {
      title: "Exchange",
      narrative: `The shadow of ${shadowLabel} takes shape before you—not as a monster, but as something more complex. It holds something that belongs to you, and you hold something of its.`,
      companionHint: `${companionName} whispers: "What we resist persists. What we embrace transforms. What will you offer?"`,
      choices: [
        { id: 1, text: "Offer understanding and acceptance", delta: { calm: 2, understanding: 0, boundary: 0 }, outcome: "Something softens between you. The shadow reveals a gift hidden within." },
        { id: 2, text: "Ask to understand its true nature", delta: { calm: 0, understanding: 2, boundary: 0 }, outcome: "The shadow shares its story, and suddenly it makes sense." },
        { id: 3, text: "Name what is yours and what isn't", delta: { calm: 0, understanding: 0, boundary: 2 }, outcome: "Clear boundaries create space for genuine connection." },
        { id: 4, text: "Use a personal essence", delta: { calm: 1, understanding: 1, boundary: 1 }, outcome: "Your essence creates unexpected harmony between you and the shadow." }
      ]
    },
    {
      title: "Integration",
      narrative: `The encounter shifts. What felt heavy begins to feel different—not gone, but changed. You carry new understanding about ${shadowLabel} and about yourself.`,
      companionHint: `${companionName} smiles: "You came seeking answers and found something better—you found yourself. What will you carry forward?"`,
      choices: [
        { id: 1, text: "Carry forward the gift of presence", delta: { calm: 2, understanding: 0, boundary: 0 }, outcome: "You realize that being present is the greatest gift you can offer." },
        { id: 2, text: "Carry forward new understanding", delta: { calm: 0, understanding: 2, boundary: 0 }, outcome: "Wisdom settles into your heart like morning light." },
        { id: 3, text: "Carry forward clearer purpose", delta: { calm: 0, understanding: 0, boundary: 2 }, outcome: "You know now what matters most and what you must protect." },
        { id: 4, text: "Use a personal essence", delta: { calm: 1, understanding: 1, boundary: 1 }, outcome: "Your essence has grown stronger through this journey." }
      ]
    }
  ];

  return fallbackScenes[sceneIndex] || fallbackScenes[0];
}

export async function composeArtifact(
  artifactType: 'scroll' | 'crystal' | 'potion',
  companionId: string,
  shadowLabel: string,
  conversationSummary: string,
  topEssences: Array<{ id: string; archetype: EssenceArchetype }>,
  encounterChoices: Array<{ sceneIndex: number; choiceText: string; outcome: string }>,
  scores: { calm: number; understanding: number; boundary: number }
): Promise<ArtifactDraft> {
  const companion = COMPANION_ARCHETYPES[companionId] || COMPANION_ARCHETYPES.owl;

  const essenceNames = topEssences.map(e => e.archetype.name);

  const { calm, understanding, boundary } = scores;
  const total = calm + understanding + boundary;
  let dominant = "balanced";
  if (total > 0) {
    if (calm >= understanding && calm >= boundary) dominant = "calm";
    else if (understanding >= calm && understanding >= boundary) dominant = "understanding";
    else dominant = "boundary";
  }

  const artifactGuidance: Record<string, string> = {
    scroll: "A Scroll of Strength shares what the parent discovered about their resilience, courage, or capacity for love. It highlights what they're proud of and want their teen to see.",
    crystal: "A Crystal of Vulnerability shares where the parent is still growing, what they struggle with, or what they're learning. It's honest about their edges.",
    potion: "A Potion of Balance blends both strength and vulnerability—acknowledging both what the parent does well and where they're still learning."
  };

  const choicesText = encounterChoices
    .map(c => `${SCENE_NAMES[c.sceneIndex]}: "${c.choiceText}"`)
    .join(", ");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are crafting a heartfelt message from a parent to their teenager. This message emerges from a deep reflection journey.

CONTEXT:
- Shadow topic reflected on: "${shadowLabel}"
- Conversation insights: ${conversationSummary}
- Companion that guided them: ${companion.name}
- Top essences: ${essenceNames.join(", ")}
- Encounter journey: ${choicesText}
- Journey character: ${dominant} (${dominant === "calm" ? "approached with openness and heart" : dominant === "understanding" ? "sought wisdom and perspective" : "held clear boundaries with love"})

ARTIFACT TYPE: ${artifactType.toUpperCase()}
${artifactGuidance[artifactType]}

Write a personal, authentic message (3-4 sentences) from the parent to their teen. The message should:
- Feel genuine and from the heart, not performative
- Reference specific insights from the reflection without being too abstract
- Acknowledge the companion's guidance naturally
- Match the artifact type's energy (strength/vulnerability/balance)
- Avoid clichés—be specific to this journey

Respond with JSON:
{
  "text": "The message to the teen",
  "essenceHighlights": ["Essence 1", "Essence 2"],
  "encounterSummary": "Brief description of the journey character"
}`
        },
        {
          role: "user",
          content: `Compose the ${artifactType} artifact message for this parent's journey through "${shadowLabel}".`
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);

    return {
      type: artifactType,
      text: parsed.text || getFallbackArtifactText(artifactType, essenceNames, dominant, companion.name),
      essenceHighlights: parsed.essenceHighlights || essenceNames.slice(0, 2),
      encounterSummary: parsed.encounterSummary || `A ${dominant} journey through ${shadowLabel}`
    };
  } catch (error) {
    console.error("[Encounter] Failed to compose artifact:", error);
    return {
      type: artifactType,
      text: getFallbackArtifactText(artifactType, essenceNames, dominant, companion.name),
      essenceHighlights: essenceNames.slice(0, 2),
      encounterSummary: `A ${dominant} journey through ${shadowLabel}`
    };
  }
}

function getFallbackArtifactText(
  artifactType: string,
  essenceNames: string[],
  dominant: string,
  companionName: string
): string {
  const primaryEssence = essenceNames[0] || "reflection";
  const secondaryEssence = essenceNames[1] || "growth";

  if (artifactType === "scroll") {
    return `Through ${primaryEssence}, I found the courage to face what was difficult. ${companionName} reminded me that this strength was always there—I just needed to see it clearly. I wanted to share this with you because it helps me show up more fully in our relationship.`;
  } else if (artifactType === "crystal") {
    return `I'm learning about ${secondaryEssence}—it's an edge I'm still softening. ${companionName} guided me to see that acknowledging where I'm still growing is its own kind of strength. I share this vulnerability with you because I want us to grow together.`;
  } else {
    return `This journey wove together ${primaryEssence} and ${secondaryEssence}. ${companionName} showed me that real connection isn't about being perfect—it's about being present. I offer this blend of insight because our relationship deserves both my strengths and my edges.`;
  }
}
