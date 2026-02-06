import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignalChip } from "@/components/ui/signal-chip";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Send, Loader2, Bird } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type Chip = {
    quote: string;
    label: string;
    interpretation: string;
    is_hidden: boolean;
    essence_id?: string;
};

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    text: string;
    chips?: Chip[];
    turn?: number;
};

export default function Loop({ initialSession, embedded }: { initialSession?: any; embedded?: boolean } = {}) {
    const params = useParams<{ id: string }>();
    const id = initialSession ? String(initialSession.id) : params.id;
    const navigate = useNavigate();
    const { toast } = useToast();

    const [messages, setMessages] = useState<ChatMessage[]>(
        initialSession?.openingQuestion ? [{
            id: Date.now(),
            role: "assistant",
            text: initialSession.openingQuestion,
            turn: 1
        }] : []
    );
    const [input, setInput] = useState("");
    const [currentTurn, setCurrentTurn] = useState<number>(1);
    const [currentSession, setCurrentSession] = useState<any>(initialSession || null);
    const [canCrystallize, setCanCrystallize] = useState(false);
    const [stabilityIndex, setStabilityIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: sessionData, isLoading } = useQuery<{
        session: any;
        messages: any[];
    }>({
        queryKey: ['/api/sessions', id],
        enabled: !initialSession && !!id
    });

    // Track when session data has been initialized to avoid re-processing
    const [initializedForKey, setInitializedForKey] = useState<string | null>(null);
    const sessionCycle = sessionData?.session?.cycle || 1;
    const sessionStatus = sessionData?.session?.status;

    // Sync local state with session data
    // Backend now filters messages by cycle, so we just load what the server returns
    // Sync from API if legacy mode
    useEffect(() => {
        if (!initialSession && sessionData?.session) {
            setCurrentSession(sessionData.session);
            const turn = sessionData.session.turn || 1;
            setCurrentTurn(turn);

            // Only initialize messages if we explicitly fetched them (legacy)
            // In stateless mode, we manage messages entirely in client state after init
            const sessionKey = `${sessionData.session.id}-${sessionData.session.cycle || 1}`;
            if (initializedForKey !== sessionKey) {
                setInitializedForKey(sessionKey);

                const existingMessages: ChatMessage[] = [];
                (sessionData.messages || []).forEach((m: any, idx: number) => {
                    if (m.userText) existingMessages.push({ id: idx * 2, role: "user", text: m.userText, turn: m.turn });
                    if (m.assistantText) {
                        const highlights = m.highlights as any;
                        existingMessages.push({
                            id: idx * 2 + 1,
                            role: "assistant",
                            text: m.assistantText,
                            chips: highlights?.chips?.filter((c: Chip) => !c.is_hidden) || [],
                            turn: m.turn
                        });
                    }
                });
                setMessages(existingMessages);

                // Set crystallization state
                const lastMsg = sessionData.messages?.[sessionData.messages.length - 1];
                if (lastMsg?.highlights) {
                    setCanCrystallize(lastMsg.highlights.canCrystallize || false);
                    setStabilityIndex(lastMsg.highlights.stabilityIndex || 0);
                }
            }
        }
    }, [sessionData, initialSession, initializedForKey]);

    // Auto-redirect to crystallization at turn 12 or when status is awaiting_crystallize
    useEffect(() => {
        const session = sessionData?.session;
        if (session) {
            const needsCrystallization = session.turn >= 12 && session.status === "active";
            const awaitingCrystallization = session.status === "awaiting_crystallize";

            if (needsCrystallization || awaitingCrystallization) {
                navigate(`/loop/${id}/crystallize`);
            }
        }
    }, [sessionData, id, navigate]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Add initial greeting if no messages
    useEffect(() => {
        if (sessionData?.session && messages.length === 0 && !isLoading) {
            const shadow = sessionData.session.shadowId?.replace('shadow_', '').replace(/_/g, ' ') || 'this topic';
            const companionId = sessionData.session.companionId;
            const cycle = sessionData.session.cycle || 1;

            let greeting = "";
            if (cycle > 1 && companionId) {
                const companionNames: Record<string, string> = {
                    owl: "The Owl",
                    fox: "The Fox",
                    bear: "The Bear",
                    deer: "The Deer"
                };
                const companionName = companionNames[companionId] || "Your companion";
                greeting = `${companionName} is here to continue your journey with ${shadow}. After your crystallization, what new thoughts or feelings are arising?`;
            } else {
                // Use full LLM-generated greeting from server (stored with session)
                greeting = sessionData.session.openingQuestion ||
                    `Let's explore ${shadow} together. What's been your experience?`;
            }

            setMessages([{
                id: 0,
                role: "assistant",
                text: greeting,
                turn: 0
            }]);
        }
    }, [sessionData, messages.length, isLoading]);

    const turnMutation = useMutation({
        mutationFn: async (userText: string) => {
            const payload: any = {
                userText,
                mode: 'reflect',
                session: currentSession,
                messages: messages
            };
            const res = await apiRequest('POST', `/api/sessions/${id}/turn`, payload);
            return res.json();
        },
        onSuccess: (response) => {
            if (response.updatedSession) {
                setCurrentSession(response.updatedSession);
            }
            // Add assistant message with chips
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: "assistant",
                text: response.assistantText,
                chips: response.chips || [],
                turn: response.turn
            }]);
            setCurrentTurn(response.nextTurn);
            setCanCrystallize(response.canCrystallize);
            setStabilityIndex(response.stabilityIndex);
            queryClient.invalidateQueries({ queryKey: ['/api/sessions', id] });
        },
        onError: () => {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        },
    });

    const handleSend = () => {
        if (!input.trim() || turnMutation.isPending || currentTurn >= 12) return;

        // Add user message
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: "user",
            text: input,
            turn: currentTurn
        }]);

        turnMutation.mutate(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getPhaseLabel = () => {
        if (currentTurn <= 3) return "Getting started";
        if (currentTurn <= 8) return "Exploring patterns";
        if (currentTurn <= 11) return "Finding clarity";
        return "Wrapping up";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    const session = currentSession;
    const shadowLabel = session?.shadowId?.replace('shadow_', '').replace(/_/g, ' ') || 'your topic';

    const COMPANIONS: Record<string, { name: string; icon: string }> = {
        owl: { name: "The Owl", icon: "Wisdom" },
        fox: { name: "The Fox", icon: "Adaptability" },
        bear: { name: "The Bear", icon: "Strength" },
        deer: { name: "The Deer", icon: "Gentleness" },
    };

    const companion = session?.companionId ? COMPANIONS[session.companionId] : null;
    const isCompanionActive = session?.status === "companion_active";

    return (
        <div className={`flex flex-col bg-slate-50 relative overflow-hidden ${embedded ? 'w-full h-full' : 'min-h-screen bg-gradient-to-br from-background via-background to-primary/5'}`}>
            {/* Header */}
            <header className={`flex items-center justify-between p-4 border-b ${embedded ? 'bg-white' : 'bg-background/80 backdrop-blur-sm'}`}>
                {!embedded && (
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} data-testid="button-back">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <div className="flex flex-col items-center flex-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium capitalize">{shadowLabel}</span>
                        {isCompanionActive && companion && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                with {companion.name}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {session?.cycle > 1 ? `Cycle ${session.cycle} · ` : ''}Turn {Math.min(currentTurn, 12)} of 12 · {getPhaseLabel()}
                    </span>
                </div>
                {!embedded ? <div className="w-9" /> : null}
            </header>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="max-w-2xl mx-auto space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[85%] ${message.role === "user" ? "order-1" : ""}`}>
                                <Card className={`${message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "glass-card"
                                    }`}>
                                    <CardContent className="p-3">
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    </CardContent>
                                </Card>

                                {/* Signal Chips */}
                                {message.chips && message.chips.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                                        {message.chips.map((chip, idx) => (
                                            <SignalChip
                                                key={idx}
                                                label={chip.label}
                                                quote={chip.quote}
                                                interpretation={chip.interpretation}
                                                essenceId={chip.essence_id}
                                                data-testid={`chip-${idx}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {turnMutation.isPending && (
                        <div className="flex justify-start">
                            <Card className="glass-card">
                                <CardContent className="p-3 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Reflecting...</span>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Crystallize Banner */}
            {canCrystallize && currentTurn < 12 && (
                <div className="p-3 bg-primary/10 border-t border-primary/20">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <p className="text-sm text-primary">
                            A pattern is emerging. Ready to crystallize?
                        </p>
                        <Button size="sm" onClick={() => navigate(`/loop/${id}/crystallize`)} data-testid="button-crystallize-early">
                            Crystallize Now
                        </Button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                <div className="max-w-2xl mx-auto flex gap-2">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={currentTurn >= 12 ? "Session complete" : "Share what's on your mind..."}
                        disabled={turnMutation.isPending || currentTurn >= 12}
                        className="flex-1"
                        data-testid="input-message"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || turnMutation.isPending || currentTurn >= 12}
                        data-testid="button-send"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                {currentTurn < 12 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        {Math.max(0, 12 - currentTurn)} turns remaining
                    </p>
                )}
                {currentTurn >= 12 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Session complete
                    </p>
                )}
            </div>
        </div>
    );
}
