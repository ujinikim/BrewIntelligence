'use client';

import { useState, useEffect, Suspense } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { CoffeeReview } from '@/utils/supabase-data';
import { Beaker, Plus, Minus, Zap, Coffee, Loader2, Sparkles, X, MapPin, FlaskConical, Flame, Home } from 'lucide-react';

const CONCEPTS = [
    "Fruit", "Chocolate", "Nutty", "Floral", "Bright", "Body",
    "Dark", "Light", "Ethiopia", "Colombia", "Sumatra"
];

interface Step {
    id: string;
    type: 'add' | 'sub';
}

type AlchemistState = 'idle' | 'adding' | 'brewing' | 'success' | 'error';

function TransmutationAnimation({ state, formulaCount }: { state: AlchemistState, formulaCount: number }) {
    const isBrewing = state === 'brewing';
    const isSuccess = state === 'success';
    const isAdding = state === 'adding';
    const isIdle = state === 'idle';

    return (
        <div className="flex flex-col items-center justify-center py-10 overflow-hidden relative min-h-[350px]">
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Magic Circle Background */}
                <div className={`absolute inset-0 border-2 border-dashed rounded-full transition-all duration-1000 ${isBrewing ? "border-amber-500 animate-spin" : "border-stone-200 animate-spin"
                    }`} style={{ animationDuration: isBrewing ? '3s' : '20s' }} />

                {/* The Alchemist */}
                <div className="relative z-10 flex flex-col items-center transition-transform duration-500 hover:scale-105">
                    {/* Head */}
                    <div className={`w-24 h-24 bg-stone-900 rounded-full border-4 shadow-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${isBrewing ? "border-amber-500 scale-110" : "border-stone-800"
                        } ${isSuccess ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]" : ""}`}>
                        {/* Expressions (Eyes) */}
                        <div className="flex gap-3">
                            {/* Left Eye */}
                            <div className="w-6 h-6 border-2 border-white/10 rounded-full flex items-center justify-center bg-stone-800 overflow-hidden">
                                <div className={`w-1.5 h-1.5 bg-white rounded-full transition-all duration-300 ${isIdle ? "animate-eye-blink" : ""
                                    } ${isAdding ? "scale-[1.5] bg-amber-400" : ""} ${isBrewing ? "scale-[1.8] shadow-[0_0_12px_white] animate-pulse" : ""
                                    } ${isSuccess ? "scale-[1.3] bg-green-400 rotate-45 rounded-none w-2 h-0.5" : ""} ${state === 'error' ? "scale-[1.2] bg-red-500 rotate-45 w-3 h-0.5" : ""
                                    }`} />
                            </div>
                            {/* Right Eye */}
                            <div className="w-6 h-6 border-2 border-white/10 rounded-full flex items-center justify-center bg-stone-800 overflow-hidden">
                                <div className={`w-1.5 h-1.5 bg-white rounded-full transition-all duration-300 ${isIdle ? "animate-eye-blink" : ""
                                    } ${isAdding ? "scale-[1.5] bg-amber-400" : ""} ${isBrewing ? "scale-[1.8] shadow-[0_0_12px_white] animate-pulse" : ""
                                    } ${isSuccess ? "scale-[1.3] bg-green-400 -rotate-45 rounded-none w-2 h-0.5" : ""} ${state === 'error' ? "scale-[1.2] bg-red-500 -rotate-45 w-3 h-0.5" : ""
                                    }`} />
                            </div>
                        </div>
                        {/* Magical Inner Glow */}
                        <div className={`absolute inset-0 transition-opacity duration-1000 ${isBrewing ? "bg-amber-500/20 opacity-100" : "bg-transparent opacity-0"
                            } ${isSuccess ? "bg-green-500/20 opacity-100" : ""}`} />
                    </div>
                    {/* Body / Cape */}
                    <div className={`w-28 h-14 bg-stone-900 rounded-t-full -mt-2 shadow-lg border-x-4 border-t-4 transition-colors duration-500 ${isBrewing ? "border-amber-500/50" : "border-stone-800/50"
                        } ${isSuccess ? "border-green-500/50" : ""}`} />
                </div>

                {/* Hand & Beaker */}
                <div className={`absolute top-24 right-4 z-20 transition-all duration-500 ${isBrewing ? "animate-alchemist-shake" : "animate-alchemist-bounce"
                    }`}>
                    <div className="relative">
                        {/* Hand */}
                        <div className="w-8 h-8 bg-[#D4A373] rounded-full border-2 border-stone-900 shadow-md relative z-10" />
                        {/* Beaker */}
                        <div className="absolute -top-8 -left-4 -rotate-12 transition-transform hover:scale-110">
                            <FlaskConical
                                size={64}
                                className={`transition-all duration-500 ${isBrewing ? "text-amber-500 fill-amber-500/40" : "text-stone-300 fill-stone-100"
                                    } ${isSuccess ? "text-green-500 fill-green-500/40" : ""}`}
                            />

                            {/* Beaker "Fluid" Level */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 overflow-hidden pointer-events-none">
                                <div
                                    className={`w-full transition-all duration-700 rounded-t-sm ${isBrewing ? "bg-amber-400" : "bg-stone-300"
                                        } ${isSuccess ? "bg-green-400" : ""}`}
                                    style={{ height: `${Math.min(formulaCount * 4, 30)}px` }}
                                />
                            </div>

                            {/* Dynamic Bubbles */}
                            {(isBrewing || formulaCount > 0) && (
                                <div className="absolute -top-4 left-4 flex gap-1">
                                    <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bubble opacity-0" />
                                    <div className="w-1.5 h-1.5 bg-amber-400/30 rounded-full animate-bubble delay-200 opacity-0" />
                                    <div className="w-2.5 h-2.5 bg-amber-300/20 rounded-full animate-bubble delay-500 opacity-0" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Labeling State */}
            <div className="text-center space-y-3 relative z-10 -mt-4">
                {isIdle && formulaCount === 0 && (
                    <p className="text-stone-400 text-sm font-bold tracking-[0.2em] uppercase animate-pulse">Awaiting Formula</p>
                )}
                {isIdle && formulaCount > 0 && (
                    <p className="text-amber-600 text-sm font-bold tracking-[0.2em] uppercase">Formula Loaded</p>
                )}
                {isAdding && (
                    <p className="text-primary text-sm font-bold tracking-[0.2em] uppercase">Reagent Added</p>
                )}
                {isBrewing && (
                    <h3 className="text-3xl font-serif font-bold text-[#1F1815] animate-pulse">Transmuting Vectors...</h3>
                )}
                {isSuccess && (
                    <h3 className="text-3xl font-serif font-bold text-green-700">Brew Successful</h3>
                )}
            </div>
        </div>
    );
}

export default function AlchemistPage() {
    const [formula, setFormula] = useState<Step[]>([]);
    const [results, setResults] = useState<CoffeeReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState<AlchemistState>('idle');

    const addStep = (id: string, type: 'add' | 'sub') => {
        setFormula(prev => [...prev, { id, type }]);
        setState('adding');
        setTimeout(() => setState('idle'), 800);
    };

    const removeStep = (index: number) => {
        setFormula(prev => prev.filter((_, i) => i !== index));
    };

    const handleBrew = async () => {
        if (formula.length === 0) return;
        setLoading(true);
        setState('brewing');

        try {
            const res = await fetch('/api/alchemist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formula: formula.map(s => ({ ...s, weight: 1 })) })
            });
            const data = await res.json();

            setTimeout(() => {
                setResults(data.results || []);
                setState('success');
                setLoading(false);
                setTimeout(() => {
                    if (data.results?.length > 0) {
                    } else {
                        setState('idle');
                    }
                }, 3000);
            }, 2500);

        } catch (error) {
            console.error(error);
            setState('error');
            setLoading(false);
        }
    };

    return (
        <DashboardShell>
            <div className="max-w-6xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="relative mb-12 pt-12">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-6 text-stone-400 text-xs font-bold uppercase tracking-[0.3em]">
                            <a href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                <Home size={12} /> Home
                            </a>
                            <span className="opacity-30">/</span>
                            <span className="text-stone-900">Lab</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <FlaskConical size={24} />
                            </div>
                            <h1 className="text-5xl font-serif font-bold text-[#1F1815] tracking-tight">The Coffee Alchemist</h1>
                        </div>
                        <p className="text-stone-500 text-lg font-light leading-relaxed">
                            Perform vector arithmetic on flavor concepts to discover hybrid beans that match your mathematical ideal.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
                    {/* Left: Workbench */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass p-8 rounded-3xl relative overflow-hidden shadow-sm border border-stone-200/50">
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Beaker size={16} className="text-primary" /> Reagents Shelf
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {CONCEPTS.map(c => (
                                    <div key={c} className="flex items-center bg-stone-100/50 hover:bg-white rounded-xl border border-stone-200/50 overflow-hidden transition-all group">
                                        <span className="px-4 py-2.5 text-sm font-bold text-stone-800">{c}</span>
                                        <button
                                            onClick={() => addStep(c, 'add')}
                                            className="p-2.5 hover:bg-green-500 hover:text-white text-stone-400 transition-all border-l border-stone-200/50"
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            onClick={() => addStep(c, 'sub')}
                                            className="p-2.5 hover:bg-red-500 hover:text-white text-stone-400 transition-all border-l border-stone-200/50"
                                        >
                                            <Minus size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-stone-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <h3 className="text-[10px] font-bold text-amber-500/70 uppercase tracking-[0.3em] mb-8">Alchemy Log</h3>

                            <div className="space-y-4 min-h-[120px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {formula.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                                        <FlaskConical size={32} className="mb-4" />
                                        <p className="text-xs font-medium uppercase tracking-widest">Workbench Empty</p>
                                    </div>
                                )}
                                {formula.map((step, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl p-4 group animate-in slide-in-from-left-4 duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${step.type === 'add' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                                }`}>
                                                {step.type === 'add' ? <Plus size={14} /> : <Minus size={14} />}
                                            </div>
                                            <span className="font-bold tracking-tight">{step.id}</span>
                                        </div>
                                        <button onClick={() => removeStep(i)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleBrew}
                                disabled={formula.length === 0 || loading}
                                className="w-full mt-10 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-700 text-stone-950 font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/10 active:scale-[0.98] group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={22} /> : <Zap size={22} className="group-hover:rotate-12 transition-transform" />}
                                <span className="uppercase tracking-widest text-xs">{loading ? 'Transmuting...' : 'Perform Alchemy'}</span>
                            </button>

                            {formula.length > 0 && (
                                <button
                                    onClick={() => setFormula([])}
                                    className="w-full mt-4 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    Clear Workbench
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Lab Output */}
                    <div className="lg:col-span-8 flex flex-col items-center">
                        <div className="w-full glass rounded-[3rem] p-10 shadow-xl border border-stone-200/50 min-h-[500px] flex flex-col items-center">
                            <TransmutationAnimation state={state} formulaCount={formula.length} />

                            {results.length > 0 && !loading && (
                                <div className="space-y-8 mt-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-grow bg-stone-100" />
                                        <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.4em] flex items-center gap-3">
                                            <Sparkles size={14} /> Discovery Matrix
                                        </h3>
                                        <div className="h-px flex-grow bg-stone-100" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {results.map((bean, i) => (
                                            <div key={bean.id} className="group glass-dark bg-stone-900 p-8 rounded-[2rem] hover:shadow-2xl transition-all flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-right-8 duration-700" style={{ animationDelay: `${i * 150}ms` }}>
                                                <div className="w-20 h-20 bg-stone-800 rounded-3xl flex items-center justify-center font-serif font-bold text-3xl text-amber-500 shrink-0 border border-white/5 group-hover:rotate-3 transition-transform">
                                                    {bean.rating}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="text-2xl font-bold text-white mb-1 tracking-tight">{bean.title}</h4>
                                                            <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-4">{bean.roaster}</p>
                                                        </div>
                                                        {(bean as any).similarity && (
                                                            <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                                                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
                                                                    {((bean as any).similarity * 100).toFixed(0)}% Match
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-stone-400 italic text-lg leading-relaxed mb-6 font-serif">
                                                        "{bean.review || bean.blind_assessment}"
                                                    </p>
                                                    <div className="flex items-center gap-6 text-[10px] font-bold text-stone-500 border-t border-white/5 pt-6 uppercase tracking-widest">
                                                        <span className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> {bean.origin || bean.roaster_location}</span>
                                                        <span className="ml-auto text-white text-sm tracking-normal">{bean.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
