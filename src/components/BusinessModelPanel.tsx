import React, { useEffect, useState } from 'react';

type Model = { version:string; identity:string; pricing:any; modules:string[]; economicTruth:any; governance:any; flywheel:string[] };

export const BusinessModelPanel: React.FC = () => {
  const [model,setModel]=useState<Model|null>(null);
  const [usage,setUsage]=useState<any>(null);
  const [dashboard,setDashboard]=useState<any>(null);

  useEffect(() => {
    let active=true;
    Promise.all([
      fetch('/api/business-model').then(r=>r.json()),
      fetch('/api/work-units/summary').then(r=>r.json()),
      fetch('/api/monetization/dashboard').then(r=>r.json())
    ]).then(([m,u,d]) => {
      if(!active) return;
      setModel(m.model||null); setUsage(u.summary||null); setDashboard(d||null);
    }).catch(()=>{});
    return ()=>{active=false};
  },[]);

  if(!model) return null;
  const verifiedPaid = Array.isArray(dashboard?.verifiedPaid) ? dashboard.verifiedPaid : null;
  const verified = verifiedPaid?.reduce((sum:number,x:any)=>sum+Number(x.amount||0),0) ?? null;

  return <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">GLORIFIER Business Model {model.version}</div>
        <h2 className="text-xl font-bold text-white mt-1">AI Orchestration + Intelligence + Automation + Data + Governance</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-3xl">{model.identity}</p>
      </div>
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
        Human authority: design principle · runtime enforcement not verified
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
      <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
        <div className="text-[11px] text-slate-400">GLORIFIER Work Units</div>
        <div className="text-2xl font-bold text-white mt-1">{usage?.units ?? 'NOT OBSERVABLE'}</div>
        <div className="text-[10px] text-slate-500 mt-1">{usage?.executions ?? 'NOT OBSERVABLE'} recorded executions</div>
      </div>
      <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
        <div className="text-[11px] text-slate-400">Opportunity Pipeline</div>
        <div className="text-2xl font-bold text-white mt-1">NOT VERIFIED</div>
        <div className="text-[10px] text-slate-500 mt-1">Estimated and expected value are not revenue</div>
      </div>
      <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
        <div className="text-[11px] text-slate-400">Verified Paid Revenue</div>
        <div className="text-2xl font-bold text-white mt-1">{verified == null ? 'NOT OBSERVABLE' : verified.toFixed(2)}</div>
        <div className="text-[10px] text-emerald-400 mt-1">Only qualifying payment evidence can establish verified revenue</div>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {model.modules.map((m)=><span key={m} className="px-2 py-1 rounded-full bg-slate-800 text-[10px] text-slate-300 border border-slate-700">{m}</span>)}
    </div>
    <div className="mt-4 text-[10px] text-slate-500">
      Economic truth: market value ≠ revenue · estimated value ≠ earnings · missing evidence ≠ zero.
    </div>
  </section>;
};
