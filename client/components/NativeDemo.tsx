import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignalChip } from "@/components/ui/signal-chip";
import { Sparkles, Send, Loader2, ArrowRight, RotateCcw } from "lucide-react";

type Chip = {
    quote: string;
    label: string;
    interpretation: string;
    essenceId?: string;
};

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    text: string;
    chips?: Chip[];
    isSystem?: boolean;
};

const DEMO_SCRIPT = [
    {
        text: "Let's explore a conflict pattern. What's a conversation with your teen that feels stuck?",
        chips: []
    },
    {
        text: "I hear underneath that frustration is a deep desire to help them. But in the heat of the moment, that care often comes out as control, doesn't it?",
        chips: [
            {
                label: "Fear / Security",
                quote: "I just want them to be okay",
                interpretation: "Your protective instinct is flaring up.",
                essenceId: "47_tierra_lunar"
            }
        ]
    },
    {
        text: "Exactly. The bridge isn't about agreeing—it's about understanding that their resistance isn't rejecting YOU, it's them trying to establish their own boundary (even clumsily).",
        chips: [
            {
                label: "Autonomy Defense",
                quote: "Stop telling me what to do",
                interpretation: "They are practicing being their own person.",
                essenceId: "55_fuego_natural"
            },
            {
                label: "Inner Wisdom",
                quote: "I need to learn this myself",
                interpretation: "Trusting their capacity to learn from mistakes.",
                essenceId: "66_eter_potential_micro"
            }
        ]
    }
];

import { useToast } from "@/hooks/use-toast";

export function NativeDemo({ onStartSession }: { onStartSession?: (sessionId: number) => void } = {}) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    const handleStartRealSession = async () => {
        try {
            setIsCreatingSession(true);
            const res = await apiRequest("POST", "/api/sessions", {
                role: "parent",
                shadowId: "shadow_phone_use"
            });
            const session = await res.json();

            if (onStartSession) {
                onStartSession(session.id);
            } else {
                navigate(`/loop/${session.id}`);
            }
        } catch (err) {
            console.error("Failed to start session:", err);
            toast({
                title: "Demo mode",
                description: "Server is unavailable. Starting a local demo session instead.",
            });
            navigate("/loop/demo");
        } finally {
            setIsCreatingSession(false);
        }
    };

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 0,
            role: "assistant",
            text: DEMO_SCRIPT[0].text
        }
    ]);
    const [input, setInput] = useState("");
    const [step, setStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message
        const newMessages = [
            ...messages,
            { id: Date.now(), role: "user" as const, text: input }
        ];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        // Simulate AI delay
        setTimeout(() => {
            const nextStep = step + 1;
            if (nextStep < DEMO_SCRIPT.length) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        role: "assistant",
                        text: DEMO_SCRIPT[nextStep].text,
                        chips: DEMO_SCRIPT[nextStep].chips
                    }
                ]);
                setStep(nextStep);
            } else {
                // Loop completion - show CTA
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        role: "assistant",
                        text: "You've touched on the core pattern: Fear meeting Autonomy. This is where the loop creates clarity.",
                        chips: [],
                        isSystem: true // New flag for system messages
                    }
                ]);
                setStep(nextStep + 1); // Force complete
            }
            setIsTyping(false);
        }, 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const resetDemo = () => {
        setMessages([{ id: 0, role: "assistant", text: DEMO_SCRIPT[0].text }]);
        setStep(0);
        setInput("");
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-slate-800">Compassframe Demo</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleStartRealSession}
                        disabled={isCreatingSession}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isCreatingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                        Start Real Session
                    </Button>
                    <Button variant="ghost" size="sm" onClick={resetDemo} className="text-slate-500 hover:text-slate-900">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restart
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === "user" ? "order-1" : ""}`}>
                                <div
                                    className={`p-4 rounded-2xl shadow-sm ${message.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white border border-slate-100 rounded-tl-none font-light leading-relaxed text-slate-800"
                                        }`}
                                >
                                    <p className="text-sm sm:text-base whitespace-pre-wrap">{message.text}</p>
                                </div>

                                {/* Signal Chips */}
                                {message.chips && message.chips.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 ml-1 animate-in fade-in slide-in-from-top-2 duration-500">
                                        {message.chips.map((chip, idx) => (
                                            <SignalChip
                                                key={idx}
                                                label={chip.label}
                                                quote={chip.quote}
                                                interpretation={chip.interpretation}
                                                essenceId={chip.essenceId}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* System End State */}
                    {step >= DEMO_SCRIPT.length + 1 && (
                        <div className="flex justify-center mt-4 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Card className="w-full max-w-sm border-blue-200 bg-blue-50/50">
                                <CardContent className="p-6 text-center space-y-4">
                                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Pattern Detected</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            The demo script ends here, but your real understanding begins now.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={handleStartRealSession}
                                        disabled={isCreatingSession}
                                    >
                                        {isCreatingSession ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Start Real Session"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                <span className="text-sm text-slate-400">Reflecting...</span>
                            </div>
                        </div>
                    )}

                    <div className="h-4" /> {/* Spacer */}
                </div>
            </ScrollArea >

            {/* Input Area */}
            < div className="p-4 bg-white border-t shrink-0" >
                <div className="max-w-3xl mx-auto flex gap-3">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={step >= DEMO_SCRIPT.length ? "Demo complete" : "Type your response..."}
                        disabled={isTyping || step >= DEMO_SCRIPT.length + 1}
                        className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping || step >= DEMO_SCRIPT.length + 1}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
