{/* Demo Panel */ }
<div className="bg-white rounded-3xl p-8 sm:p-12 min-h-[700px] flex flex-col justify-between border-2 border-slate-200 shadow-2xl">
    {/* Progress bar */}
    <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
            <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${i <= demoStep ? "bg-blue-500" : "bg-slate-300"
                    }`}
            />
        ))}
    </div>

    {/* Step 1 - Select Conflict */}
    {demoStep === 0 && (
        <div className="animate-fade-in space-y-8">
            <div>
                <span className="text-blue-600 text-sm font-bold uppercase tracking-widest">Step 1</span>
                <h3 className="text-4xl font-bold mt-3 mb-4">What's happening at home?</h3>
                <p className="text-lg text-slate-600">Choose a conflict that feels familiar.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {conflictScenarios.map((conflict) => (
                    <button
                        key={conflict.id}
                        onClick={() => {
                            setSelectedConflict(conflict.id);
                            setDemoStep(1);
                        }}
                        className="p-6 text-left bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
                    >
                        <span className="text-3xl mb-3 block">{conflict.emoji}</span>
                        <p className="text-lg font-semibold text-slate-900">{conflict.label}</p>
                    </button>
                ))}
            </div>
        </div>
    )}

    {/* Step 2 - Select Parent Emotion */}
    {demoStep === 1 && (
        <div className="animate-fade-in space-y-8">
            <div>
                <span className="text-blue-600 text-sm font-bold uppercase tracking-widest">Step 2</span>
                <h3 className="text-4xl font-bold mt-3 mb-4">How does it feel for you?</h3>
                <p className="text-lg text-slate-600">What emotion comes up most?</p>
            </div>

            <div className="space-y-3">
                {parentEmotions.map((emotion) => (
                    <button
                        key={emotion.id}
                        onClick={() => {
                            setSelectedEmotion(emotion.id);
                            setDemoStep(2);
                        }}
                        className="w-full p-5 text-left bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
                    >
                        <p className="text-lg font-semibold text-slate-900">{emotion.label}</p>
                    </button>
                ))}
            </div>

            <button
                onClick={() => {
                    resetDemo();
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
                ← Back
            </button>
        </div>
    )}

    {/* Step 3 - Select Teen Need */}
    {demoStep === 2 && (
        <div className="animate-fade-in space-y-8">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                <p className="text-xs font-bold text-purple-600 uppercase mb-2">🌉 Entering their world</p>
                <p className="text-lg font-semibold text-slate-900">When you step into their perspective, everything makes sense.</p>
            </div>

            <div>
                <span className="text-blue-600 text-sm font-bold uppercase tracking-widest">Step 3</span>
                <h3 className="text-4xl font-bold mt-3 mb-4">What might they be protecting?</h3>
                <p className="text-lg text-slate-600">This is their inner world. Choose what resonates.</p>
            </div>

            <div className="space-y-3">
                {(teenNeeds[selectedConflict || "grades"] || []).map((need) => (
                    <button
                        key={need.id}
                        onClick={() => {
                            setSelectedTeen(need.id);
                            setDemoStep(3);
                        }}
                        className="w-full p-5 text-left bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <p className="text-lg font-semibold text-slate-900">{need.label}</p>
                        <p className="text-sm text-slate-600 mt-1">{need.need}</p>
                    </button>
                ))}
            </div>

            <button
                onClick={() => setDemoStep(1)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
                ← Back
            </button>
        </div>
    )}

    {/* Step 4 - Show Output */}
    {demoStep === 3 && (
        <div className="animate-fade-in space-y-8">
            <div className="relative">
                <span className="text-blue-600 text-sm font-bold uppercase tracking-widest">Step 4</span>
                <h3 className="text-4xl font-bold mt-3 mb-4">The bridge between worlds</h3>
                <p className="text-lg text-slate-600">You've entered their world. Now you respond from understanding.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Parent's Instinct */}
                <div className="p-6 bg-slate-100 rounded-xl border-2 border-slate-300">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-3">Your instinct (parent world)</p>
                    <p className="text-sm italic text-slate-700">"{getOutput().avoid}"</p>
                    <p className="text-xs text-slate-500 mt-3">→ Creates walls</p>
                </div>

                {/* The Bridge */}
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-3xl mb-2">🌉</p>
                        <p className="text-xs font-bold text-blue-600">UNDERSTANDING</p>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl border-l-4 border-l-purple-500">
                <p className="text-sm text-purple-600 font-bold uppercase mb-3">✨ From their world (what works)</p>
                <p className="text-lg text-purple-900 font-semibold italic">"{getOutput().response}"</p>
                <p className="text-sm text-purple-700 mt-4 font-medium">→ Builds bridges, not walls</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-slate-700">
                    <span className="font-bold">What changed:</span> You shifted from your world's perspective to theirs. You acknowledged what they're protecting instead of fighting it. <span className="text-blue-700 font-semibold">This is the bridge.</span>
                </p>
            </div>

            <div className="flex gap-3 pt-6">
                <button
                    onClick={resetDemo}
                    className="flex-1 px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 text-lg"
                >
                    Try another scenario
                </button>
                <button
                    onClick={() => navigate("/early-access")}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all transform hover:scale-105 text-lg shadow-lg"
                >
                    Get early access
                </button>
            </div>
        </div>
    )}
</div>