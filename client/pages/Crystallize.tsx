import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Scroll, Gem, FlaskConical, Droplets, Wind, Flame, Mountain, Sun, Circle, Heart, Shield, Eye, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ESSENCE_ONTOLOGY, type EssenceArchetype } from "@shared/essences";
import type { LucideIcon } from "lucide-react";
import type { EncounterScene, EncounterState, ArtifactDraft } from "@shared/schema";

type ArtifactType = "scroll" | "crystal" | "potion";
type Phase = "crystallizing" | "essences" | "companion" | "encounter" | "artifact" | "complete";

const MI_CHOICE_ICONS: Record<string, LucideIcon> = {
    complex_reflection: Heart,
    change_talk: Eye,
    autonomy_support: Shield,
    values_link: Sparkles
};

const ENCOUNTER_CHOICE_ICONS: Record<number, LucideIcon> = {
    1: Heart,      // calm/openness
    2: Eye,        // understanding/curiosity
    3: Shield,     // boundary/strength
    4: Sparkles    // crystallized essence
};

const COMPANIONS = [
    { id: "owl", name: "The Owl", description: "Wisdom and perspective", icon: "🦉" },
    { id: "fox", name: "The Fox", description: "Clever solutions and adaptability", icon: "🦊" },
    { id: "bear", name: "The Bear", description: "Strength and grounding", icon: "🐻" },
    { id: "deer", name: "The Deer", description: "Gentleness and intuition", icon: "🦌" },
];

function getElementIcon(element: string): LucideIcon {
    switch (element) {
        case "water": return Droplets;
        case "air": return Wind;
        case "fire": return Flame;
        case "earth": return Mountain;
        case "ether": return Sparkles;
        case "light": return Sun;
        default: return Circle;
    }
}

export default function Crystallize() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [phase, setPhase] = useState<Phase>("crystallizing");
    const [selectedArtifact, setSelectedArtifact] = useState<ArtifactType | null>(null);
    const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);
    const [topEssences, setTopEssences] = useState<Array<{ id: string; archetype: EssenceArchetype; score: number }>>([]);

    const [currentScene, setCurrentScene] = useState<EncounterScene | null>(null);
    const [encounterState, setEncounterState] = useState<EncounterState | null>(null);
    const [showOutcome, setShowOutcome] = useState(false);
    const [lastOutcome, setLastOutcome] = useState("");
    const [artifactDraft, setArtifactDraft] = useState<ArtifactDraft | null>(null);
    const [showEssenceSelector, setShowEssenceSelector] = useState(false);
    const [pendingChoice, setPendingChoice] = useState<{ id: number; text: string; outcome: string; delta: { calm: number; understanding: number; boundary: number } } | null>(null);

    const { data: sessionData, isLoading } = useQuery<{
        session: any;
        messages: any[];
    }>({
        queryKey: ['/api/sessions', id],
    });

    const shadowLabel = sessionData?.session?.shadowId
        ? sessionData.session.shadowId.replace("shadow_", "").replace(/_/g, " ")
        : "your shadow";

    useEffect(() => {
        if (sessionData?.session?.accumulatedScores) {
            const scores = sessionData.session.accumulatedScores as Record<string, number>;
            const sorted = Object.entries(scores)
                .filter(([essenceId]) => ESSENCE_ONTOLOGY[essenceId])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([essenceId, score]) => ({
                    id: essenceId,
                    archetype: ESSENCE_ONTOLOGY[essenceId],
                    score
                }));
            setTopEssences(sorted);
        }
    }, [sessionData]);

    useEffect(() => {
        if (phase === "crystallizing") {
            const timer = setTimeout(() => setPhase("essences"), 2500);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    // Start encounter mutation - also returns first scene
    const startEncounterMutation = useMutation({
        mutationFn: async ({ companionId }: { companionId: string }) => {
            const res = await apiRequest('POST', `/api/sessions/${id}/encounter/start`, { companionId });
            return res.json();
        },
        onSuccess: (data) => {
            setEncounterState(data.encounterState);
            // First scene is included in the response
            if (data.firstScene) {
                setCurrentScene(data.firstScene);
            } else if (data.encounterState?.currentScene) {
                setCurrentScene(data.encounterState.currentScene);
            }
            setPhase("encounter");
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to start encounter", variant: "destructive" });
        }
    });

    // Record choice mutation - also returns next scene if not complete
    const recordChoiceMutation = useMutation({
        mutationFn: async (input: { choiceId: number; choiceText: string; outcome: string; delta: { calm: number; understanding: number; boundary: number }; essenceId?: string }) => {
            const res = await apiRequest('POST', `/api/sessions/${id}/encounter/choice`, input);
            return res.json();
        },
        onSuccess: (data) => {
            // Always update encounter state first
            setEncounterState(data.encounterState);

            // If not complete, set the next scene
            // If complete, keep current scene so user can see final outcome before transitioning
            if (data.nextScene) {
                setCurrentScene(data.nextScene);
            }
            // Never transition to artifact here - user must click "Complete the Encounter" button
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to record choice", variant: "destructive" });
        }
    });

    // Compose artifact mutation
    const composeArtifactMutation = useMutation({
        mutationFn: async (artifactType: ArtifactType) => {
            const res = await apiRequest('POST', `/api/sessions/${id}/artifact`, { artifactType });
            return res.json();
        },
        onSuccess: (data) => {
            setArtifactDraft(data.artifactDraft);
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to compose artifact", variant: "destructive" });
        }
    });

    const getEncounterSummary = () => {
        const scores = encounterState?.scores || { calm: 0, understanding: 0, boundary: 0 };
        const { calm, understanding, boundary } = scores;
        const total = calm + understanding + boundary;
        if (total === 0) return { dominant: "balanced", description: "Your journey was one of balance and presence." };

        if (calm >= understanding && calm >= boundary) {
            return { dominant: "calm", description: "You approached with openness and heart, creating space for healing." };
        } else if (understanding >= calm && understanding >= boundary) {
            return { dominant: "understanding", description: "You sought to truly see and understand, finding wisdom in the encounter." };
        } else {
            return { dominant: "boundary", description: "You held your ground with clarity, honoring your needs and limits." };
        }
    };

    const handleEncounterChoice = (choiceId: number) => {
        const choice = currentScene?.choices.find(c => c.id === choiceId);
        if (!choice) return;

        // For choice 4, show the essence selector instead of immediately proceeding
        if (choiceId === 4) {
            setPendingChoice({
                id: choice.id,
                text: choice.text,
                outcome: choice.outcome,
                delta: choice.delta
            });
            setShowEssenceSelector(true);
            return;
        }

        setLastOutcome(choice.outcome);
        setShowOutcome(true);

        recordChoiceMutation.mutate({
            choiceId,
            choiceText: choice.text,
            outcome: choice.outcome,
            delta: choice.delta
        });
    };

    const handleEssenceSelection = (essenceId: string) => {
        if (!pendingChoice) return;

        const selectedEssence = topEssences.find(e => e.id === essenceId);
        const essenceName = selectedEssence?.archetype?.name || "inner wisdom";

        setLastOutcome(pendingChoice.outcome);
        setShowOutcome(true);
        setShowEssenceSelector(false);

        recordChoiceMutation.mutate({
            choiceId: pendingChoice.id,
            choiceText: `Channel ${essenceName}`,
            outcome: pendingChoice.outcome,
            delta: pendingChoice.delta,
            essenceId
        });

        setPendingChoice(null);
    };

    const cancelEssenceSelection = () => {
        setShowEssenceSelector(false);
        setPendingChoice(null);
    };

    const advanceEncounter = () => {
        setShowOutcome(false);
        setLastOutcome("");

        // Check if encounter is complete from the updated state
        if (encounterState?.isComplete) {
            setPhase("artifact");
        }
        // The next scene is already set from recordChoiceMutation.onSuccess
        // We just need to clear the outcome display to show the new choices
    };

    const handleArtifactSelect = (type: ArtifactType) => {
        setSelectedArtifact(type);
        composeArtifactMutation.mutate(type);
    };

    const completeCrystallization = async () => {
        if (!selectedArtifact || !selectedCompanion || !artifactDraft) {
            toast({ title: "Error", description: "Please complete all steps", variant: "destructive" });
            return;
        }

        try {
            const shadowId = sessionData?.session?.shadowId || "unknown";
            const currentCycle = sessionData?.session?.cycle || 1;

            await apiRequest('POST', '/api/relays', {
                type: selectedArtifact,
                text: artifactDraft.text,
                shadowId,
            });

            await apiRequest('PUT', `/api/sessions/${id}`, {
                companionId: selectedCompanion,
                artifactType: selectedArtifact,
                status: "companion_active",
                turn: 1,
                cycle: currentCycle + 1,
            });

            queryClient.invalidateQueries({ queryKey: ['/api/relays'] });
            queryClient.invalidateQueries({ queryKey: ['/api/sessions', id] });
            setPhase("complete");
        } catch (err) {
            toast({ title: "Error", description: "Failed to complete crystallization. Please try again.", variant: "destructive" });
        }
    };

    const createRelayMutation = useMutation({
        mutationFn: completeCrystallization,
    });

    const handleContinue = () => {
        if (phase === "essences") {
            setPhase("companion");
        } else if (phase === "companion" && selectedCompanion) {
            startEncounterMutation.mutate({ companionId: selectedCompanion });
        } else if (phase === "artifact" && selectedArtifact && artifactDraft) {
            createRelayMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center p-6">
            {/* Phase 1: Crystallizing animation */}
            {phase === "crystallizing" && (
                <div className="text-center space-y-6 animate-pulse">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
                        <div className="absolute inset-4 rounded-full bg-primary/50 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Crystallizing...</h1>
                        <p className="text-muted-foreground mt-2">
                            Your insights are forming into something tangible
                        </p>
                    </div>
                </div>
            )}

            {/* Phase 2: Show top 4 essences */}
            {phase === "essences" && (
                <div className="max-w-lg w-full space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground">Your Resonating Essences</h1>
                        <p className="text-muted-foreground mt-2">
                            These essences emerged most strongly from your reflection on {shadowLabel}
                        </p>
                    </div>

                    <div className="grid gap-3">
                        {topEssences.map((essence, idx) => {
                            const ElementIcon = getElementIcon(essence.archetype.element);
                            return (
                                <Card
                                    key={essence.id}
                                    className="glass-card"
                                    data-testid={`essence-${idx}`}
                                >
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className={`p-3 rounded-full ${idx === 0 ? 'bg-amber-500/20' : idx === 1 ? 'bg-purple-500/20' : idx === 2 ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
                                            <ElementIcon className={`h-6 w-6 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-purple-500' : idx === 2 ? 'text-blue-500' : 'text-emerald-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{essence.archetype.name}</h3>
                                                {idx === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 font-medium">Strongest</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{essence.archetype.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {topEssences.length === 0 && (
                            <Card className="glass-card">
                                <CardContent className="p-4 text-center text-muted-foreground">
                                    No essences have resonated yet. Continue your reflection to discover them.
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleContinue}
                        data-testid="button-continue-essences"
                    >
                        Choose a Companion
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Phase 3: Companion selection */}
            {phase === "companion" && (
                <div className="max-w-lg w-full space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground">Choose a Companion</h1>
                        <p className="text-muted-foreground mt-2">
                            Who will guide you through the encounter with {shadowLabel}?
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {COMPANIONS.map((companion) => (
                            <Card
                                key={companion.id}
                                className={`cursor-pointer transition-all ${selectedCompanion === companion.id ? 'ring-2 ring-primary' : 'hover-elevate'}`}
                                onClick={() => setSelectedCompanion(companion.id)}
                                data-testid={`companion-${companion.id}`}
                            >
                                <CardContent className="p-4 text-center">
                                    <div className="text-4xl mb-2">{companion.icon}</div>
                                    <h3 className="font-medium">{companion.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{companion.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button
                        className="w-full"
                        disabled={!selectedCompanion || startEncounterMutation.isPending}
                        onClick={handleContinue}
                        data-testid="button-continue-companion"
                    >
                        {startEncounterMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Entering the encounter...
                            </>
                        ) : (
                            <>
                                Face the Shadow
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Phase 4: Dynamic encounter */}
            {phase === "encounter" && (
                <div className="max-w-lg w-full space-y-6">
                    {(!currentScene || (recordChoiceMutation.isPending && !showOutcome)) ? (
                        <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground">Your companion is preparing the way...</p>
                        </div>
                    ) : currentScene ? (
                        <>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-xs text-muted-foreground">Step {(encounterState?.sceneIndex || 0) + 1} of 4</span>
                                </div>
                                <h1 className="text-2xl font-bold text-foreground">{currentScene.title}</h1>
                            </div>

                            <Card className="glass-card border-primary/20">
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-sm text-foreground/90 leading-relaxed">
                                        {currentScene.narrative}
                                    </p>
                                    <p className="text-sm italic text-primary/80 border-l-2 border-primary/30 pl-3">
                                        {currentScene.companionHint}
                                    </p>
                                </CardContent>
                            </Card>

                            {showOutcome || encounterState?.isComplete ? (
                                <div className="space-y-4">
                                    <Card className="bg-primary/5 border-primary/20">
                                        <CardContent className="p-4">
                                            <p className="text-sm text-foreground leading-relaxed">{lastOutcome}</p>
                                        </CardContent>
                                    </Card>
                                    <Button
                                        className="w-full"
                                        onClick={advanceEncounter}
                                        disabled={recordChoiceMutation.isPending}
                                        data-testid="button-continue-encounter"
                                    >
                                        {encounterState?.isComplete ? (
                                            <>
                                                Complete the Encounter
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        ) : recordChoiceMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Continuing...
                                            </>
                                        ) : (
                                            <>
                                                Continue the Journey
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {currentScene.choices.map((choice) => {
                                        const ChoiceIcon = ENCOUNTER_CHOICE_ICONS[choice.id] || Heart;
                                        return (
                                            <Card
                                                key={choice.id}
                                                className={`cursor-pointer transition-all hover-elevate ${recordChoiceMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
                                                onClick={() => !recordChoiceMutation.isPending && handleEncounterChoice(choice.id)}
                                                data-testid={`encounter-option-${choice.id}`}
                                            >
                                                <CardContent className="flex items-center gap-3 p-4">
                                                    <ChoiceIcon className="h-5 w-5 text-primary shrink-0" />
                                                    <p className="text-sm">{choice.text}</p>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex justify-center gap-1">
                                {[0, 1, 2, 3].map((idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 w-8 rounded-full transition-colors ${idx < (encounterState?.sceneIndex || 0) ? 'bg-primary' :
                                                idx === (encounterState?.sceneIndex || 0) ? 'bg-primary/60' : 'bg-muted'
                                            }`}
                                    />
                                ))}
                            </div>

                            <Dialog open={showEssenceSelector} onOpenChange={(open) => !open && cancelEssenceSelection()}>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Use one of your essences</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-3 py-4">
                                        {topEssences.map((essence) => {
                                            const ElementIcon = getElementIcon(essence.archetype.element);
                                            return (
                                                <Card
                                                    key={essence.id}
                                                    className="cursor-pointer transition-all hover-elevate"
                                                    onClick={() => handleEssenceSelection(essence.id)}
                                                    data-testid={`essence-select-${essence.id}`}
                                                >
                                                    <CardContent className="flex items-center gap-3 p-4">
                                                        <div className="p-2 rounded-full bg-primary/10">
                                                            <ElementIcon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{essence.archetype.name}</p>
                                                            <p className="text-xs text-muted-foreground">{essence.archetype.description}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={cancelEssenceSelection}
                                        data-testid="button-cancel-essence-select"
                                    >
                                        Back to choices
                                    </Button>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : null}
                </div>
            )}

            {/* Phase 5: Artifact selection with dynamic text */}
            {phase === "artifact" && (
                <div className="max-w-lg w-full space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground">Create a Gift</h1>
                        <p className="text-muted-foreground mt-2">
                            Your encounter revealed: {getEncounterSummary().description}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            What would you like to share from this journey?
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <Card
                            className={`cursor-pointer transition-all ${selectedArtifact === 'scroll' ? 'ring-2 ring-amber-500 bg-amber-500/5' : 'hover-elevate'}`}
                            onClick={() => handleArtifactSelect('scroll')}
                            data-testid="artifact-scroll"
                        >
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-full bg-amber-500/10">
                                        <Scroll className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Scroll of Strength</h3>
                                        <p className="text-xs text-muted-foreground">Share a strength you discovered</p>
                                    </div>
                                </div>
                                {selectedArtifact === 'scroll' && artifactDraft && (
                                    <div className="pl-14 space-y-1">
                                        <p className="text-sm text-foreground/80 italic">"{artifactDraft.text}"</p>
                                    </div>
                                )}
                                {selectedArtifact === 'scroll' && composeArtifactMutation.isPending && (
                                    <div className="pl-14 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Composing your message...</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer transition-all ${selectedArtifact === 'crystal' ? 'ring-2 ring-purple-500 bg-purple-500/5' : 'hover-elevate'}`}
                            onClick={() => handleArtifactSelect('crystal')}
                            data-testid="artifact-crystal"
                        >
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-full bg-purple-500/10">
                                        <Gem className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Crystal of Vulnerability</h3>
                                        <p className="text-xs text-muted-foreground">Share where you're still growing</p>
                                    </div>
                                </div>
                                {selectedArtifact === 'crystal' && artifactDraft && (
                                    <div className="pl-14 space-y-1">
                                        <p className="text-sm text-foreground/80 italic">"{artifactDraft.text}"</p>
                                    </div>
                                )}
                                {selectedArtifact === 'crystal' && composeArtifactMutation.isPending && (
                                    <div className="pl-14 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Composing your message...</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer transition-all ${selectedArtifact === 'potion' ? 'ring-2 ring-emerald-500 bg-emerald-500/5' : 'hover-elevate'}`}
                            onClick={() => handleArtifactSelect('potion')}
                            data-testid="artifact-potion"
                        >
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-full bg-emerald-500/10">
                                        <FlaskConical className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Potion of Balance</h3>
                                        <p className="text-xs text-muted-foreground">Share both strength and vulnerability</p>
                                    </div>
                                </div>
                                {selectedArtifact === 'potion' && artifactDraft && (
                                    <div className="pl-14 space-y-1">
                                        <p className="text-sm text-foreground/80 italic">"{artifactDraft.text}"</p>
                                    </div>
                                )}
                                {selectedArtifact === 'potion' && composeArtifactMutation.isPending && (
                                    <div className="pl-14 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Composing your message...</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Button
                        className="w-full"
                        disabled={!selectedArtifact || !artifactDraft || createRelayMutation.isPending}
                        onClick={handleContinue}
                        data-testid="button-continue-artifact"
                    >
                        {createRelayMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending Gift...
                            </>
                        ) : (
                            <>
                                Complete & Send Gift
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Phase 6: Complete - auto-navigate home */}
            {phase === "complete" && (
                <div className="max-w-lg w-full text-center space-y-6">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-primary/20" />
                        <div className="absolute inset-2 rounded-full bg-primary/40 flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-primary" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Journey Complete</h1>
                        <p className="text-muted-foreground mt-2">
                            Your gift has been sent. A new cycle begins.
                        </p>
                    </div>

                    <Button className="w-full" onClick={() => navigate("/")} data-testid="button-return-home">
                        Return Home
                    </Button>
                </div>
            )}
        </div>
    );
}
