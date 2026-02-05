import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Menu, X, ArrowRight } from "lucide-react";
import { NativeDemo } from "@/components/NativeDemo";
import Loop from "./Loop";

export default function Index() {
  const navigate = useNavigate();
  const [demoStep, setDemoStep] = useState(0);
  const [activeSession, setActiveSession] = useState<any>(null); // Store full session object

  // ... (skipped lines)

  <div className="h-[600px] w-full mb-12 shadow-2xl rounded-2xl overflow-hidden border-4 border-white bg-white">
    {activeSession ? (
      <Loop initialSession={activeSession} embedded={true} />
    ) : (
      <NativeDemo onStartSession={setActiveSession} />
    )}
  </div>
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedTeen, setSelectedTeen] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Why different", href: "#why-different" },
    { label: "Team", href: "#team" },
  ];

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const resetDemo = () => {
    setDemoStep(0);
    setSelectedConflict(null);
    setSelectedEmotion(null);
    setSelectedTeen(null);
  };

  // Step 1 - Conflict scenarios
  const conflictScenarios = [
    { id: "grades", label: "They shut down about grades", emoji: "📚" },
    { id: "phone", label: "Constant battles over screen time", emoji: "📱" },
    { id: "friends", label: "Concerned about their friend group", emoji: "👥" },
    { id: "rules", label: "Arguing about house rules", emoji: "🏠" },
  ];

  // Step 2 - Parent emotions (varies by conflict)
  const parentEmotions = [
    { id: "anxious", label: "Anxious about their future", color: "blue" },
    { id: "frustrated", label: "Frustrated by the resistance", color: "orange" },
    { id: "disappointed", label: "Disappointed in their choices", color: "red" },
    { id: "helpless", label: "Helpless to reach them", color: "purple" },
  ];

  // Step 3 - What the teen might be protecting (varies by conflict)
  const teenNeeds: Record<string, Array<{ id: string; label: string; need: string }>> = {
    grades: [
      { id: "autonomy", label: "Need for autonomy", need: "They want control over their own path" },
      { id: "safety", label: "Fear of failure", need: "They're protecting against shame" },
      { id: "competence", label: "Need to feel capable", need: "They don't want to disappoint you" },
      { id: "identity", label: "Finding their own way", need: "They want to define themselves" },
    ],
    phone: [
      { id: "belonging", label: "Belonging with peers", need: "Staying connected is survival to them" },
      { id: "autonomy", label: "Autonomy and independence", need: "They need to make own choices" },
      { id: "escape", label: "Escape from pressure", need: "It's how they decompress" },
      { id: "identity", label: "Self-expression", need: "Online is where they explore who they are" },
    ],
    friends: [
      { id: "autonomy", label: "Right to choose friends", need: "They need independence here" },
      { id: "belonging", label: "Belonging and loyalty", need: "Friends mean everything" },
      { id: "trust", label: "Wanting to be trusted", need: "They feel judged by you" },
      { id: "identity", label: "Finding their tribe", need: "Friends help them figure out who they are" },
    ],
    rules: [
      { id: "autonomy", label: "Autonomy in their space", need: "They want agency over their life" },
      { id: "fairness", label: "Fairness and respect", need: "Rules feel arbitrary to them" },
      { id: "identity", label: "Becoming their own person", need: "Rules feel like control" },
      { id: "voice", label: "Having a voice", need: "They want to be heard, not told" },
    ],
  };

  // Generate dynamic output based on selections
  const getOutput = () => {
    const conflict = conflictScenarios.find(c => c.id === selectedConflict);
    const emotion = parentEmotions.find(e => e.id === selectedEmotion);
    const needs = teenNeeds[selectedConflict || "grades"] || [];
    const teen = needs.find(n => n.id === selectedTeen);

    const outputs: Record<string, Record<string, { avoid: string; response: string }>> = {
      grades: {
        autonomy: {
          avoid: "This is your life. If you don't care about your future, that's on you.",
          response: "I see school stress is weighing on you. This is your path. How can I support without pushing?",
        },
        safety: {
          avoid: "You're throwing away your life. You're not working hard enough.",
          response: "I know you care about doing well. What would help you feel more confident?",
        },
        competence: {
          avoid: "Why can't you just focus? Your brother gets better grades.",
          response: "I see you struggling. Let's figure this out together-what's the hardest part?",
        },
        identity: {
          avoid: "You need to be realistic about what you can achieve.",
          response: "What kind of future do YOU want to build? Let's talk about that.",
        },
      },
      phone: {
        belonging: {
          avoid: "You're addicted to that phone. You're wasting your life.",
          response: "I get that staying connected matters. Let's find a balance that works for both of us.",
        },
        autonomy: {
          avoid: "As long as you live here, you follow my rules.",
          response: "You're growing up. Let's talk about what screen time looks like for you.",
        },
        escape: {
          avoid: "You're avoiding real life. That's not healthy.",
          response: "I see you need downtime. Let's make sure it's balanced with everything else.",
        },
        identity: {
          avoid: "That's all nonsense. You need real friends, not online ones.",
          response: "Your online world matters to you. Tell me what's important about it.",
        },
      },
      friends: {
        autonomy: {
          avoid: "I won't let you hang around those kinds of people.",
          response: "I trust your judgment. Can you help me understand why these friendships matter?",
        },
        belonging: {
          avoid: "You're making bad choices just to fit in.",
          response: "Friendship is huge right now. What do you like about this group?",
        },
        trust: {
          avoid: "I'm just trying to protect you. You don't understand the world yet.",
          response: "I'm not judging them or you. I want to understand what you see in them.",
        },
        identity: {
          avoid: "Those friends are a bad influence on you.",
          response: "Tell me who YOU are becoming. These friendships-what are they teaching you?",
        },
      },
      rules: {
        autonomy: {
          avoid: "Because I said so. That's how it works here.",
          response: "I want to understand your side. Why does this rule feel unfair?",
        },
        fairness: {
          avoid: "Life isn't fair. Get used to it.",
          response: "Help me see this from your perspective. What would feel fair?",
        },
        identity: {
          avoid: "You're not old enough to make these decisions.",
          response: "You're becoming your own person. Let's talk about what that looks like.",
        },
        voice: {
          avoid: "I'm the parent. Your opinion doesn't matter here.",
          response: "What would it take for you to feel heard in our home?",
        },
      },
    };

    return outputs[selectedConflict || "grades"]?.[selectedTeen || "autonomy"] || {
      avoid: "Loading...",
      response: "Loading...",
    };
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" />
                <path d="M12 3v18M3 12h18" stroke="currentColor" />
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" opacity="0.5" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Compassframe
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-50 border-t border-slate-200 py-4">
            <div className="px-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Logo Focus */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 lg:py-32 overflow-hidden pt-20">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>

        {/* Decorative animated shapes */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>

        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Logo and branding */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Large animated logo */}
            <div className="mb-12" style={{
              animation: "float 6s ease-in-out infinite"
            }}>
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-20 h-20 sm:w-28 sm:h-28 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  {/* Outer circle */}
                  <circle cx="12" cy="12" r="10" stroke="currentColor" />
                  {/* Inner circle */}
                  <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6" />
                  {/* Cross lines representing perspective shift */}
                  <path d="M12 2v20" stroke="currentColor" />
                  <path d="M2 12h20" stroke="currentColor" />
                  {/* Diagonal connection lines */}
                  <path d="M5.5 5.5l13 13" stroke="currentColor" opacity="0.4" strokeLinecap="round" />
                  <path d="M18.5 5.5l-13 13" stroke="currentColor" opacity="0.4" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8">
              <span className="block">When you understand</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                their world.
              </span>
              <span className="block">A new form of connection</span>
              <span className="block">becomes possible.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-light mb-10 max-w-xl">
              Compassframe is a new communication channel for parents and teens - built on guided reflection and narrative devices.
            </p>

            <button
              onClick={() => document.querySelector("#demo-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-500/30 w-fit"
            >
              Try the demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right side - Visual representation of bridge */}
          <div className="hidden lg:flex flex-col gap-0 relative">
            {/* Parent World */}
            <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl border-2 border-slate-300 mb-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Parent's Known World</p>
              <div className="space-y-2 text-sm text-slate-700">
                <p>📺 Traditional media</p>
                <p>📚 Known communication styles</p>
                <p>⏰ Linear thinking</p>
                <p>🎮 Understands older games</p>
              </div>
            </div>

            {/* The Bridge - Visual */}
            <div className="relative h-12 flex items-center justify-center">
              <div className="absolute w-1 h-full bg-gradient-to-b from-slate-300 via-blue-400 to-purple-400"></div>
              <div className="relative bg-white px-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Entering their world</p>
                  <p className="text-2xl">🌉</p>
                </div>
              </div>
            </div>

            {/* Teen World */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-300 mt-4">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">Teen's New World</p>
              <div className="space-y-2 text-sm text-slate-700">
                <p>🎵 Streaming & TikTok</p>
                <p>💬 New language & memes</p>
                <p>⚡ Fast-paced, non-linear</p>
                <p>🎮 Gaming worlds & communities</p>
              </div>
            </div>

            {/* Connection point */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border-2 border-blue-300">
              <p className="text-xs font-bold text-blue-700 uppercase mb-2">When you understand their world</p>
              <p className="text-lg font-bold text-slate-900">Connection happens</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo-section" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-bold text-center mb-4">Experience it yourself</h2>




          <p className="text-center text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
            Choose your scenario and watch how understanding transforms response.
          </p>



          <div className="h-[600px] w-full mb-12 shadow-2xl rounded-2xl overflow-hidden border-4 border-white bg-white">
            {activeSession ? (
              <Loop initialSession={activeSession} embedded={true} />
            ) : (
              <NativeDemo onStartSession={setActiveSession} />
            )}
          </div>


        </div>
      </section>

      {/* Entering Their World Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white border-t-2 border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold mb-4">Understand their world</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              They're not living in your world anymore. And that's okay. Here's what you need to know.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Parent's World */}
            <div className="relative">
              <div className="absolute -top-8 left-0 text-sm font-bold text-slate-500 uppercase">Your generation</div>
              <div className="p-8 bg-slate-100 rounded-2xl border-2 border-slate-300 space-y-6">
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase mb-2">Media</p>
                  <p className="text-slate-700">Longer-form content, slower cycles, fewer abrupt shifts in context.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase mb-2">Communication</p>
                  <p className="text-slate-700">Messages aim to stand alone, intent is stated explicitly.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase mb-2">Thinking</p>
                  <p className="text-slate-700">Preference for a single thread, explanation, and closure.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600 uppercase mb-2">Community</p>
                  <p className="text-slate-700">Fewer overlapping circles in daily life, lower audience mixing.</p>
                </div>
              </div>
            </div>

            {/* Teen's World */}
            <div className="relative">
              <div className="absolute -top-8 left-0 text-sm font-bold text-purple-600 uppercase">Their generation</div>
              <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-300 space-y-6">
                <div>
                  <p className="text-sm font-bold text-purple-600 uppercase mb-2">Media</p>
                  <p className="text-slate-700">Stream-first content, fast remixing, constant context switching.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-600 uppercase mb-2">Communication</p>
                  <p className="text-slate-700">Messages rely on references, subtext, and who is watching.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-600 uppercase mb-2">Thinking</p>
                  <p className="text-slate-700">Comfort with parallel threads, fast social inference, delayed closure.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-600 uppercase mb-2">Community</p>
                  <p className="text-slate-700">Overlapping circles, higher audience mixing, moments travel across groups.</p>
                </div>
              </div>
            </div>
          </div>

          {/* The Bridge */}
          <div className="relative">
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-slate-300 via-blue-400 to-purple-400 top-1/2 -translate-y-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="text-center p-6 bg-slate-100 rounded-xl">
                <p className="text-3xl mb-2">👨‍👧</p>
                <p className="font-bold text-slate-900">Your world</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl transform scale-110">
                <p className="text-3xl mb-2 text-white">🌉</p>
                <p className="font-bold text-white">Step in &</p>
                <p className="font-bold text-white">play</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                <p className="text-3xl mb-2">👧</p>
                <p className="font-bold text-slate-900">Their world</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 bg-blue-50 rounded-2xl border-2 border-blue-300 text-center">
            <p className="text-lg text-slate-700">
              <span className="font-bold text-blue-700">You don't need to understand everything.</span>
              You just need to experiment the rules of their world through play. The bridge isn't about abandoning who you are - it's about sharing a safe space for change and growth.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-16">How Compassframe works</h2>

          <div className="space-y-12">
            {[
              {
                num: "1",
                title: "Reflection Phase",
                desc: "A short guided reflection grounded in Motivational Interviewing, an evidence-based approach used in healthcare and education. It gives you a structured space to slow down, put words to what is happening, and clarify what matters to you, without lectures or advice.",
              },
              {
                num: "2",
                title: "Challenge Phase",
                desc: "A friendly, guided duel that turns the moment into text with choices. The system surfaces the expectations and social pressures hiding inside the conflict, gives them a voice, and lets you respond in a way that keeps your experience valid and your intent clear, without turning your teen into the opponent.",
              },
              {
                num: "3",
                title: "Gift Phase",
                desc: (
                  <span className="block space-y-1">
                    At the end, you choose one gift to carry forward or share:
                    <span className="block pl-4 mt-2">📜 <span className="font-semibold">Strength (Scroll):</span> what you did right under pressure, captured in a reusable form</span>
                    <span className="block pl-4">🎯 <span className="font-semibold">Vulnerability (Crystal):</span> where the pattern hooks you, made visible without blame</span>
                    <span className="block pl-4">🧪 <span className="font-semibold">Synthesis (Potion):</span> a compact summary you can return to later</span>
                  </span>
                ),
              },
              {
                num: "4",
                title: "New Cycle",
                desc: "Send the gift to a family member and invite them into Compassframe. They can follow your reflection in their own way, continue the thread, and start their own process from the same shared moment.",
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {step.num}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <div className="text-lg text-slate-600">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section id="why-different" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-16">Why this is different</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "No lectures", desc: "We don't tell you what to say. We help you understand what's really happening." },
              { title: "No behavior hacks", desc: "This isn't about tricks. It's about genuine connection with your teen." },
              { title: "Grounded in science", desc: "Built on Motivational Interviewing, adolescent psychology, and clinical research." },
              { title: "For real families", desc: "Designed by clinicians and parents who've lived this. Not theoretical. Real." },
            ].map((item) => (
              <div key={item.title} className="p-8 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-lg text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-6">Built by clinicians and builders</h2>
          <p className="text-center text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
            Psychiatry + Motivational Interviewing + engineering. Real expertise. Real product.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Adolescent psychiatry", desc: "Deep understanding of how teens develop and what they actually need." },
              { title: "Family systems", desc: "Clinical expertise in how connection works and what breaks it." },
              { title: "Product engineering", desc: "Built to work in real moments with real families. Not research. Product." },
            ].map((role) => (
              <div key={role.title} className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 text-center hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold mb-3">{role.title}</h3>
                <p className="text-slate-600">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to transform conflict?</h2>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            We're working with families right now. Limited spots in our pilot.
          </p>

          <button
            onClick={() => navigate("/early-access")}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 text-lg shadow-lg shadow-blue-500/30"
          >
            Request early access
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" />
                <path d="M12 3v18M3 12h18" stroke="currentColor" />
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" opacity="0.5" />
              </svg>
            </div>
            <span className="text-lg font-bold">Compassframe</span>
          </div>
          <p className="text-sm">© 2026 Compassframe. Understanding your teen. One conversation at a time.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
