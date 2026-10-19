import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  Trash2, 
  Lock, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  AlertTriangle, 
  Key, 
  ExternalLink, 
  RefreshCw,
  Search,
  Filter,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';
import { ActiveDataGrant } from '../types';

interface DataControlDashboardProps {
  grants: ActiveDataGrant[];
  onRevokeGrant: (grantId: string) => void;
  onUpdateGrantPermissions: (grantId: string, updatedFields: string[]) => void;
}

export const DataControlDashboard: React.FC<DataControlDashboardProps> = ({
  grants,
  onRevokeGrant,
  onUpdateGrantPermissions
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingGrant, setInspectingGrant] = useState<ActiveDataGrant | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const filteredGrants = grants.filter(g => {
    if (filterCategory !== 'all' && g.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.dataPointName.toLowerCase().includes(q) ||
        g.recipientOrg.toLowerCase().includes(q) ||
        g.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRevoke = (id: string) => {
    setRevokingId(id);
    try {
      onRevokeGrant(id);
    } finally {
      setRevokingId(null);
    }
  };

  const activeGrantsCount = grants.filter(g => g.status === 'active').length;
  const totalAccruedFromGrants = grants.reduce((sum, g) => sum + g.revenueAccruedUsd, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              Data Grant Records & Local Controls
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Review stored grant records and update their local status. Provider-side revocation, data deletion, key erasure, and cryptographic attestation are NOT VERIFIED by this interface.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Records marked active locally</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {activeGrantsCount} Records
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Illustrative grant value (not payable)</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                NOT VERIFIED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search data points, buyers, or purposes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'ecommerce', 'developer', 'health', 'browsing', 'financial'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Grants List */}
      <div className="space-y-4">
        {filteredGrants.map((grant) => {
          const isActive = grant.status === 'active';
          const isRevoked = grant.status === 'revoked';

          return (
            <div
              key={grant.id}
              id={`grant-card-${grant.id}`}
              className={`rounded-xl border p-5 transition-all ${
                isActive
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-rose-900/30 opacity-70'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left Section: Data Point & Buyer */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm font-bold text-white">{grant.dataPointName}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {grant.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Configured protection target: {grant.protectionTech} · NOT VERIFIED
                    </span>
                    {grant.epsilonLevel && (
                      <span className="text-[10px] font-mono text-emerald-300">
                        Configured ε target = {grant.epsilonLevel} · enforcement NOT VERIFIED
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recipient: <strong className="text-white">{grant.recipientOrg}</strong> ({grant.recipientCategory})</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Recorded purpose (not proof of a license):</strong> {grant.purpose}
                  </p>

                  {/* Granular Shared Fields */}
                  <div className="pt-2">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Recorded/configured fields · actual sharing NOT VERIFIED:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {grant.sharedFields.map((field, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section: Retention TTL, Financials & Actions */}
                <div className="flex flex-col items-end gap-3 self-start lg:self-auto shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Recorded yield / query count</div>
                    <div className="text-lg font-bold font-mono text-amber-300">NOT VERIFIED</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">No independently verified usage or payment evidence is attached.</div>
                  </div>

                  {/* TTL Countdown Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Stored TTL: {isActive ? `${grant.ttlHoursRemaining}h` : 'marked expired'} · provider expiry NOT VERIFIED</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setInspectingGrant(grant)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      View grant record
                    </button>

                    {isActive ? (
                      <button
                        onClick={() => handleRevoke(grant.id)}
                        disabled={revokingId === grant.id}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                      >
                        {revokingId === grant.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        Revoke local grant
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Local record marked revoked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <div>Granted: {grant.grantedAt} &bull; Auto-Expires: {grant.expiresAt}</div>
                <div className="text-slate-400 font-semibold">{grant.rateDescription}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cryptographic Token & Verification Modal */}
      {inspectingGrant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Grant record details (not cryptographically attested)</h3>
              </div>
              <button
                onClick={() => setInspectingGrant(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <div className="text-slate-500 text-[10px]">Stored token/reference (not verified):</div>
                <div className="text-emerald-400 break-all">{inspectingGrant.verifiableToken}</div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Licensee:</span>
                  <span>{inspectingGrant.recipientOrg}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Configured protection target (not enforced):</span>
                  <span>{inspectingGrant.protectionTech}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">On-chain escrow evidence:</span>
                  <span>NOT VERIFIED — no on-chain reference checked</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Deletion/key-erasure evidence:</span>
                  <span className="text-amber-300">NOT VERIFIED</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                This control updates the local grant record only. It does not prove that an external provider revoked access, deleted cached data, or erased decryption keys.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingGrant(null)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
