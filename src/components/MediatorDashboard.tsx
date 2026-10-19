import React, { useEffect, useState } from 'react';
import { Network, ShieldCheck, RefreshCw } from 'lucide-react';

type Snapshot = {
  version:string;
  generatedAt:string;
  mediator:string;
  role:string;
  nodeCounts:Record<string,number>;
  authorizedConnections:number;
  totalConnections:number;
  nodes:Array<{id:string;nodeType:string;provider:string;capability:string;status:string;authorizationRequired:boolean}>;
  policy:{identity:string;mission:string;economicTruth:Record<string,unknown>;providerNeutrality:boolean};
};

const labels:Record<string,string> = {
  ai_provider:'AI Providers', specialist:'Specialists', demand_source:'Demand',
  marketplace:'Marketplaces', execution_connector:'Execution', settlement_rail:'Settlement',
  evidence_system:'Evidence', revenue_ledger:'Revenue Ledger'
};

export const MediatorDashboard:React.FC = () => {
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  const load=async()=>{
    setLoading(true); setError('');
    try {
      const r=await fetch('/api/mediator/snapshot',{cache:'no-store'});
      const data=await r.json();
      if(!r.ok) throw new Error(data.error || 'Mediator unavailable');
      setSnapshot(data.snapshot);
    } catch(e) { setError(e instanceof Error ? e.message : 'Mediator unavailable'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{void load(); const t=window.setInterval(()=>void load(),60000); return()=>window.clearInterval(t);},[]);

  return <section className="space-y-6">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2"><Network className="w-5 h-5 text-emerald-400"/><h2 className="text-xl font-bold text-white">GLORIFIER Mediator</h2></div>
        <p className="text-sm text-slate-400 mt-1">Top-level provider-neutral mediation across AI, demand, business, execution, evidence and settlement.</p>
      </div>
      <button onClick={()=>void load()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold"><RefreshCw className={loading?'animate-spin':''} size={14}/> Refresh</button>
    </div>
    {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-300">{error}</div>}
    {snapshot && <>
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="text-xs uppercase tracking-wider text-emerald-400">{snapshot.version} · CONFIGURED LAYER · runtime NOT VERIFIED</div>
        <div className="text-lg font-semibold text-white mt-1">{snapshot.role}</div>
        <p className="text-xs text-slate-400 mt-2">{snapshot.policy.mission}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(snapshot.nodeCounts).map(([type,count])=><div key={type} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><div className="text-[10px] uppercase text-slate-500">{labels[type]||type}</div><div className="text-2xl font-bold text-white mt-1">{count}</div></div>)}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><div className="text-[10px] uppercase text-slate-500">Authorized Connections</div><div className="text-2xl font-bold text-emerald-400 mt-1">{snapshot.authorizedConnections}/{snapshot.totalConnections}</div></div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400"/><span className="font-semibold text-white">Mediation Boundary</span></div>
        <div className="grid md:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="rounded-lg bg-slate-950/60 p-3 text-slate-400">Evidence before qualification and consequential execution.</div>
          <div className="rounded-lg bg-slate-950/60 p-3 text-slate-400">External acceptance and settlement must be observed.</div>
          <div className="rounded-lg bg-slate-950/60 p-3 text-slate-400">Estimated value never becomes verified revenue automatically.</div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="font-semibold text-white mb-3">Connected mediation nodes</div>
        <div className="grid md:grid-cols-2 gap-2">{snapshot.nodes.slice(0,40).map(n=><div key={n.id} className="flex items-center gap-2 rounded-lg bg-slate-950/50 p-3"><span className="w-2 h-2 rounded-full bg-emerald-400"/><span className="text-xs text-slate-200">{n.provider}</span><span className="text-[10px] text-slate-500">{labels[n.nodeType]||n.nodeType} · {n.capability}</span><span className="ml-auto text-[10px] text-slate-500">{n.status}</span></div>)}</div>
      </div>
    </>}
  </section>;
};
