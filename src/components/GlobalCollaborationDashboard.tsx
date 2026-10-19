import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Database, Eye, Play, RefreshCw,
  ShieldCheck, WalletCards, Workflow
} from 'lucide-react';

type Json = Record<string, any>;

async function getJson(url: string, init?: RequestInit): Promise<Json> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.details || `Request failed: ${response.status}`);
  return data;
}

function StatCard({ icon: Icon, label, value, detail }: { icon: React.ElementType; label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5 text-emerald-400" /> {label}
      </div>
      <div className="mt-1 text-xl font-bold text-white">{value}</div>
      <div className="text-[11px] text-slate-500">{detail}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <Icon className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export const GlobalCollaborationDashboard: React.FC = () => {
  const [status, setStatus] = useState<Json | null>(null);
  const [discovery, setDiscovery] = useState<Json | null>(null);
  const [bounties, setBounties] = useState<Json | null>(null);
  const [resolution, setResolution] = useState<Json | null>(null);
  const [revenue, setRevenue] = useState<Json | null>(null);
  const [policy, setPolicy] = useState<Json | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.allSettled([
        getJson('/api/global-collaboration/status'),
        getJson('/api/opportunities/24x7/status'),
        getJson('/api/opportunities/github-bounties?limit=25'),
        getJson('/api/global-resolution/cases?limit=100'),
        getJson('/api/economic-os/verified-revenue'),
        getJson('/api/global-collaboration/policy')
      ]);
      const [s, d, b, r, v, p] = results;
      if (s.status === 'fulfilled') setStatus(s.value);
      if (d.status === 'fulfilled') setDiscovery(d.value);
      if (b.status === 'fulfilled') setBounties(b.value);
      if (r.status === 'fulfilled') setResolution(r.value);
      if (v.status === 'fulfilled') setRevenue(v.value);
      if (p.status === 'fulfilled') setPolicy(p.value);
      const failed = results.find(x => x.status === 'rejected') as PromiseRejectedResult | undefined;
      if (failed) setError(failed.reason?.message || 'Some operational data is unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const runCycle = async () => {
    setRunning(true);
    setError('');
    try {
      await getJson('/api/global-collaboration/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'human-owner-command-center', limit: 200 })
      });
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Global collaboration cycle failed');
    } finally {
      setRunning(false);
    }
  };

  const caseRows = useMemo(() => Array.isArray(resolution?.cases) ? resolution.cases : [], [resolution]);
  const bountyRows = useMemo(() => Array.isArray(bounties?.opportunities) ? bounties.opportunities : [], [bounties]);
  const resolved = caseRows.filter(c => c.stage === 'RESOLVED').length;
  const awaitingAuth = caseRows.filter(c => c.stage === 'AUTHORIZATION_PENDING').length;
  const evidencePending = caseRows.filter(c => c.stage === 'EVIDENCE_PENDING').length;
  const verifiedRevenue = revenue?.verifiedRevenue ?? revenue?.summary?.verifiedRevenue ?? null;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-emerald-500/20 bg-slate-950 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-400">
              <Workflow className="h-3.5 w-3.5" /> Global Collaboration
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">GLORIFIER AI CEO Control</h2>
            <p className="mt-1 text-xs text-slate-500">Discovery, evidence, authorization, resolution and verified revenue.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} disabled={loading} aria-label="Refresh dashboard" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={runCycle} disabled={running} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              <Play className="h-3.5 w-3.5" /> {running ? 'Running…' : 'Run cycle'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <StatCard icon={Activity} label="Status" value={status?.status || 'NOT OBSERVABLE'} detail={status?.version || 'GCR-1.0'} />
        <StatCard icon={Eye} label="Evidence" value={evidencePending} detail="Pending verification" />
        <StatCard icon={ShieldCheck} label="Approval" value={awaitingAuth} detail="Human gate" />
        <StatCard icon={CheckCircle2} label="Resolved" value={resolved} detail="Stage label; acceptance and settlement evidence required" />
        <StatCard icon={WalletCards} label="Verified revenue" value={verifiedRevenue == null ? 'NOT OBSERVABLE' : String(verifiedRevenue)} detail="External evidence" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Opportunity queue" icon={Database}>
          <div className="max-h-64 overflow-auto p-2">
            {bountyRows.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500">No opportunity records.</div>
            ) : bountyRows.slice(0, 8).map((b: any) => (
              <div key={b.id} className="border-b border-slate-900 px-2 py-2.5 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-slate-200">{b.title || 'Untitled opportunity'}</div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-500">{b.repository || b.sourceUrl || 'Source recorded'}</div>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 px-1.5 py-0.5 text-[9px] text-slate-500">{b.stage || 'OBSERVED'}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Resolution queue" icon={Workflow}>
          <div className="max-h-64 overflow-auto p-2">
            {caseRows.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500">No resolution cases.</div>
            ) : caseRows.slice(0, 8).map((c: any) => (
              <div key={c.id} className="border-b border-slate-900 px-2 py-2.5 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-slate-200">{c.title || c.sourceTitle || 'Resolution case'}</div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-500">{c.category || 'global'} · {c.estimatedValue ?? 'value unverified'}</div>
                  </div>
                  <span className="shrink-0 rounded-md border border-slate-700 px-1.5 py-0.5 text-[9px] text-slate-500">{c.stage || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Section title="Opportunity Discovery · daemon status reported" icon={Activity}>
          <div className="space-y-2 p-4 text-xs text-slate-400">
            <div className="flex justify-between"><span>Daemon timer</span><span>{!discovery ? 'NOT OBSERVABLE' : discovery.daemon?.running ? 'Reported running' : 'Not running'}</span></div>
            <div className="flex justify-between"><span>Current cycle</span><span>{discovery?.daemon?.cycleRunning ? 'Reported running' : 'No cycle reported'}</span></div>
            <div className="flex justify-between"><span>Last run</span><span>{discovery?.freshness?.latestRunAt ? new Date(discovery.freshness.latestRunAt).toLocaleString() : 'NOT OBSERVABLE'}</span></div>
            <p className="pt-1 text-[10px]">Process uptime, automatic recovery, and continuous availability are NOT independently verified.</p>
          </div>
        </Section>
        <Section title="Evidence" icon={Eye}>
          <p className="p-4 text-xs leading-5 text-slate-400">Model output is not evidence by itself. External source evidence controls verification.</p>
        </Section>
        <Section title="Authorization" icon={ShieldCheck}>
          <p className="p-4 text-xs leading-5 text-slate-400">Consequential, contractual, access and financial actions remain approval-gated.</p>
        </Section>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-slate-400">
        <strong className="text-amber-300">Revenue boundary:</strong> estimates, pipeline value, advertised bounties, invoices and balances are not verified revenue. Verified revenue requires qualifying external settlement evidence.
        {policy?.policy?.nonFabrication ? <span className="ml-1 text-slate-500">{policy.policy.nonFabrication}</span> : null}
      </div>
    </section>
  );
};