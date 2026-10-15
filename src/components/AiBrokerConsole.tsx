import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  User, 
  Zap,
  RefreshCw,
  FileCheck,
  Users
} from 'lucide-react';
import { MonetizationPolicy, DataFootprintSource, AiBrokerChatMessage } from '../types';
import { AiPolicyOptimizerModal } from './AiPolicyOptimizerModal';
import { AllAiCollaborationModal } from './AllAiCollaborationModal';

interface AiBrokerConsoleProps {
  policy: MonetizationPolicy;
  onUpdatePolicy: (newPolicy: Partial<MonetizationPolicy>) => void;
  footprints: DataFootprintSource[];
  onApplySuggestedAction?: (action: any) => void;
}

export const AiBrokerConsole: React.FC<AiBrokerConsoleProps> = ({
  policy,
  onUpdatePolicy,
  footprints,
  onApplySuggestedAction
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(policy.aiModel || 'gpt-4o');
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  const [messages, setMessages] = useState<AiBrokerChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai_broker',
      content: `Hello. I am your autonomous personal data broker, powered by OpenAI GPT-4o. I represent your sovereign data rights across all digital broker syndicates, enforce strict differential privacy (ε), evaluate commercial AI training bids, and block unconsented shadow tracking.

Currently, I have 5 data streams monetizing at an average pacing of ~$215/mo under your $${policy.minimumMonthlyFloorUsd}/mo floor. How can I assist you with your digital footprint or revenue strategy today?`,
      timestamp: 'Just now',
      modelUsed: 'gpt-4o',
      provider: 'OpenAI GPT Sovereign Broker',
      suggestedAction: {
        label: 'Audit Active Tracker Exposure',
        type: 'run_audit'
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    onUpdatePolicy({ aiModel: newModel as any });
  };

  const handleApplyOptimization = (optimizedPolicy: Partial<MonetizationPolicy>, rationale: string) => {
    onUpdatePolicy(optimizedPolicy);

    const optimizerMsg: AiBrokerChatMessage = {
      id: `optimizer-${Date.now()}`,
      sender: 'ai_broker',
      content: `[AI Policy Optimizer Applied (${selectedModel.toUpperCase()})]:\n\n${rationale}\n\n• Calibrated Privacy Epsilon: ε = ${optimizedPolicy.globalEpsilon}\n• Recalibrated Monthly Floor: $${optimizedPolicy.minimumMonthlyFloorUsd}/mo\n• Autonomous Stance: ${optimizedPolicy.brokerMode}\n• Status: Differential privacy proof attested. Mathematical risk containment active.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel,
      provider: 'AI Policy Optimizer'
    };

    setMessages(prev => [...prev, optimizerMsg]);
  };

  const handleApplyCouncilDirectives = (directives: { globalEpsilon?: number; minimumMonthlyFloorUsd?: number; autoNegotiateHighBids?: boolean }, summary: string) => {
    onUpdatePolicy(directives);

    const councilMsg: AiBrokerChatMessage = {
      id: `council-${Date.now()}`,
      sender: 'ai_broker',
      content: `🏛️ **ALL-AI MODEL COUNCIL CONSENSUS ENACTED**\n\n${summary}\n\n• Participating Frontier AI Nodes: OpenAI GPT-4o, Google Gemini 3.8 Flash, Meta LLaMA 3.3 (Open Weights)\n• Consensus Agreement: 98%\n• Calibrated Privacy Epsilon: ε = ${directives.globalEpsilon}\n• Recalibrated Monthly Floor: $${directives.minimumMonthlyFloorUsd}/mo\n• Status: All models have signed the consensus proof. Commercial ad-broker tracking quarantined, and zero-PII sovereign AI pretraining authorized.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'all-models',
      provider: 'All-AI Sovereign Collaboration Council'
    };

    setMessages(prev => [...prev, councilMsg]);
  };

  const quickPrompts = [
    'Invite all artificial intelligence models to collaborate on my data strategy',
    'Run AI Policy Optimizer to tune my epsilon and privacy tier',
    'Have GPT-4o negotiate a +25% rate for my developer code telemetry',
    'GPT & Gemini Audit: Scan my search and browsing streams for quasi-identifiers',
    'Draft a strict CCPA / GDPR statutory clawback demand letter',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const lower = textToSend.toLowerCase();
    if (lower.includes('optimizer') || lower.includes('tune my epsilon')) {
      setShowOptimizerModal(true);
    }

    if (lower.includes('collaborat') || lower.includes('invite all') || lower.includes('all ai') || lower.includes('all artificial') || lower.includes('council')) {
      setShowCollaborationModal(true);
      setSelectedModel('all-models');
      onUpdatePolicy({ aiModel: 'all-models' as any });
    }

    const userMsg: AiBrokerChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsLoading(true);

    try {
      const activeStreams = footprints.filter(f => f.isMonetized).map(f => f.name).join(', ');
      const res = await fetch('/api/ai/broker-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentPolicy: { ...policy, aiModel: selectedModel },
          footprintsSummary: activeStreams,
          model: selectedModel
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Broker API unavailable (HTTP ${res.status})`);
      }
      const brokerMsg: AiBrokerChatMessage = {
        id: `broker-${Date.now()}`,
        sender: 'ai_broker',
        content: data.reply || 'The broker API returned no reply text. No audit, privacy enforcement, or revenue outcome is verified.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data.suggestedAction,
        modelUsed: data.modelUsed || selectedModel,
        provider: data.provider || 'Provider not reported'
      };

      setMessages(prev => [...prev, brokerMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `broker-err-${Date.now()}`,
          sender: 'ai_broker',
          content: 'Broker unavailable. No audit, privacy enforcement, or licensing revenue was verified. Please retry when the API is reachable.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Not executed',
          provider: 'Not verified'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 cols: Live Chat with AI Broker */}
      <div className="lg:col-span-7 flex flex-col rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg h-[680px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">DataSovereign AI Broker</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {selectedModel === 'all-models' ? 'ALL AI COUNCIL' : selectedModel.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedModel === 'all-models' 
                    ? 'All AI Models Collaborative Council (OpenAI GPT-4o + Google Gemini + Meta LLaMA)' 
                    : selectedModel === 'gemini-3.8-flash'
                    ? 'Google Gemini 3.8 Flash Low-Latency Multimodal Reasoning'
                    : selectedModel === 'consensus'
                    ? 'Dual-Consensus Cross-Validation (GPT-4o + Gemini 3.8 Flash)'
                    : 'OpenAI GPT-4o Autonomous Reasoning & Valuation Engine'}
                </p>
              </div>
            </div>

            {/* Model Selector Pills in Header */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 flex-wrap">
              <button
                type="button"
                onClick={() => handleModelChange('gpt-4o')}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-colors ${
                  selectedModel === 'gpt-4o'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="OpenAI GPT-4o: Flagship multimodal intelligence for high-stakes contract and yield negotiations"
              >
                GPT-4o
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('gpt-4o-mini')}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-colors ${
                  selectedModel === 'gpt-4o-mini'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="OpenAI GPT-4o-mini: Fast, low-latency micro-screening"
              >
                GPT-4o mini
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('gemini-3.8-flash')}
                className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Google Gemini 3.8 Flash Engine"
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => handleModelChange('consensus')}
                className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                  selectedModel === 'consensus'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dual Consensus: Synthesize analysis from both GPT-4o and Gemini 3.8 Flash"
              >
                Consensus
              </button>
              <button
                type="button"
                id="invite-all-ai-models-btn"
                onClick={() => {
                  handleModelChange('all-models');
                  setShowCollaborationModal(true);
                }}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedModel === 'all-models'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 shadow-md font-bold'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
                title="Invite All AI Models to Collaborate (OpenAI GPT-4o + Google Gemini 3.8 Flash + Meta LLaMA 3.3)"
              >
                <Users className="w-3 h-3" />
                <span>Collaborate (All AI)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai_broker' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.sender === 'ai_broker' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Cpu className="w-3 h-3 text-emerald-400" />
                      <span className="font-mono text-emerald-400/90 font-semibold">
                        {msg.modelUsed || selectedModel}
                      </span>
                      {msg.provider && (
                        <span className="text-slate-500 hidden sm:inline">• {msg.provider}</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {msg.suggestedAction && (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (msg.suggestedAction?.type === 'maximize_yield') {
                          onUpdatePolicy({ brokerMode: 'autonomous-maximize', globalEpsilon: 0.65 });
                        } else if (msg.suggestedAction?.type === 'apply_policy') {
                          onUpdatePolicy({ globalEpsilon: 0.2 });
                        }
                        handleSendMessage(`Action applied: ${msg.suggestedAction?.label}`);
                      }}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 underline underline-offset-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {msg.suggestedAction.label}
                    </button>
                  </div>
                )}

                {msg.sender === 'user' && (
                  <div className="mt-1 text-[9px] text-emerald-200 text-right">
                    {msg.timestamp}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              </div>
              <div className="bg-slate-950/90 text-slate-400 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px]">Evaluating data valuation & privacy proofs...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="ai-broker-input"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask your AI broker to audit streams, counter offers, or tighten privacy..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              id="ai-broker-send-btn"
              className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right 5 cols: Live Policy Configuration Panel */}
      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Autonomous Policy Directives
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                id="invite-all-ai-header-btn"
                onClick={() => {
                  handleModelChange('all-models');
                  setShowCollaborationModal(true);
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 group cursor-pointer"
                title="Invite All AI Models to Collaborate (OpenAI GPT-4o, Google Gemini, Meta LLaMA)"
              >
                <Users className="w-3.5 h-3.5 fill-slate-950 group-hover:scale-110 transition-transform" />
                <span>Invite All AI</span>
              </button>
              <button
                type="button"
                id="ai-policy-optimizer-btn"
                onClick={() => setShowOptimizerModal(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all active:scale-95 group cursor-pointer"
                title="Calibrate optimal epsilon and privacy tier settings based on risk tolerance"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Optimizer</span>
              </button>
            </div>
          </div>

          {/* All-AI Collaboration Council Banner */}
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-cyan-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-300 leading-tight">
                <span className="font-semibold text-white">All-AI Collaboration Council: </span>
                <span className="text-slate-400">OpenAI GPT-4o, Google Gemini, & Meta LLaMA co-deliberating.</span>
              </div>
            </div>
            <button
              type="button"
              id="banner-convene-models-btn"
              onClick={() => {
                handleModelChange('all-models');
                setShowCollaborationModal(true);
              }}
              className="shrink-0 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 cursor-pointer"
            >
              Convene Council →
            </button>
          </div>

          {/* AI Policy Optimizer Quick Recommendation Banner */}
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] text-slate-300 leading-tight">
                <span className="font-semibold text-white">Risk-Tuned Directives: </span>
                <span>Calibrate optimal ε and privacy tiers for your risk tolerance.</span>
              </div>
            </div>
            <button
              type="button"
              id="banner-launch-optimizer-btn"
              onClick={() => setShowOptimizerModal(true)}
              className="shrink-0 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 cursor-pointer"
            >
              Optimize →
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Your AI broker automatically applies these governing thresholds to all incoming buyer bids and data license requests.
          </p>

          <div className="space-y-4">
            {/* Minimum Floor Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Minimum Monthly Compensation Floor</span>
                <span className="font-mono font-bold text-emerald-400">${policy.minimumMonthlyFloorUsd}/mo</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={policy.minimumMonthlyFloorUsd}
                onChange={(e) => onUpdatePolicy({ minimumMonthlyFloorUsd: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>$10/mo (Relaxed)</span>
                <span>$35/mo (Standard)</span>
                <span>$100/mo (Premium)</span>
              </div>
            </div>

            {/* Global Epsilon Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Global Privacy Ceiling (Max ε)</span>
                <span className="font-mono font-bold text-emerald-400">ε = {policy.globalEpsilon}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={policy.globalEpsilon}
                onChange={(e) => onUpdatePolicy({ globalEpsilon: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Bids requesting higher epsilon (lower privacy noise) will be auto-rejected or countered.
              </p>
            </div>

            {/* Allowed Buyer Purposes Toggles */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Permitted Buyer Categories
              </label>

              {/* AI Pretraining */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">AI Model Pre-training</div>
                  <div className="text-[10px] text-slate-400">LLM code & reasoning training sets</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.allowAiModelPretraining}
                  onChange={(e) => onUpdatePolicy({ allowAiModelPretraining: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Academic Research */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Academic & Medical Research</div>
                  <div className="text-[10px] text-slate-400">Non-profit biomedical studies</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.allowAcademicResearch}
                  onChange={(e) => onUpdatePolicy({ allowAcademicResearch: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Commercial Behavioral Ads (OFF by default) */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Targeted Behavioral Advertising</div>
                  <div className="text-[10px] text-rose-400">Adtech DSPs & clickstream retargeting</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.allowAdTargeting}
                  onChange={(e) => onUpdatePolicy({ allowAdTargeting: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Insurance Actuarial Risk Profiling */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Insurance / Credit Scoring</div>
                  <div className="text-[10px] text-rose-400">Actuarial rate adjustment algorithms</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.allowInsuranceRiskProfiling}
                  onChange={(e) => onUpdatePolicy({ allowInsuranceRiskProfiling: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Autonomous Counter-Offer feature */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Auto-Counter High Value Bids</div>
                <div className="text-[10px] text-slate-400">Negotiate +25% higher compensation if buyer reputation &gt; 90</div>
              </div>
              <input
                type="checkbox"
                checked={policy.autoNegotiateHighBids}
                onChange={(e) => onUpdatePolicy({ autoNegotiateHighBids: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Cryptographic Proof Verification Card */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Smart Licensing Protocol
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Every data release is signed with an on-chain zero-knowledge attestation (ZK-SNARK). Buyers verify the statistical validity of the dataset without receiving any raw identifier or unperturbed personal attributes.
          </p>
          <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-2">
            <span>Protocol: ZK-DataShield v3.4</span> • <span>Epsilon Verifier: Active</span>
          </div>
        </div>

        {/* AI Engine & GPT Status Card */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Cpu className="w-4 h-4 text-emerald-400" />
              AI Intelligence Architecture
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {selectedModel === 'all-models'
                ? 'All-AI Model Council'
                : selectedModel === 'gpt-4o'
                ? 'OpenAI GPT-4o'
                : selectedModel === 'gpt-4o-mini'
                ? 'OpenAI GPT-4o mini'
                : selectedModel === 'consensus'
                ? 'Dual Consensus'
                : 'Google Gemini'}
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span>Active Architecture:</span>
              <span className="text-slate-200 font-mono font-medium">
                {selectedModel === 'all-models'
                  ? 'OpenAI + Gemini + Meta LLaMA'
                  : selectedModel === 'consensus'
                  ? 'GPT-4o & Gemini 3.8 Flash'
                  : selectedModel === 'gemini-3.8-flash'
                  ? 'Gemini 3.8 Flash'
                  : 'OpenAI GPT-4o'}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span>Autonomous Stance:</span>
              <span className="text-emerald-400 font-mono capitalize">{policy.brokerMode}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-1">
              <span>Zero-Training Guarantee:</span>
              <span className="text-emerald-300 font-mono">Enforced (API Terms)</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>Negotiation Capability:</span>
              <span className="text-slate-200">
                {selectedModel === 'all-models' ? 'Multi-Model Consensus & Counter-Offers' : 'Autonomous Counter-Offers'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Policy Optimizer Modal */}
      <AiPolicyOptimizerModal
        isOpen={showOptimizerModal}
        onClose={() => setShowOptimizerModal(false)}
        currentPolicy={policy}
        onApplyOptimization={handleApplyOptimization}
        activeModel={selectedModel}
      />

      {/* All-AI Model Collaboration Council Modal */}
      <AllAiCollaborationModal
        isOpen={showCollaborationModal}
        onClose={() => setShowCollaborationModal(false)}
        policy={policy}
        footprints={footprints}
        onApplyDirectives={handleApplyCouncilDirectives}
      />
    </div>
  );
};
