import React, { useRef, useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Building2, 
  BadgeAlert,
  ArrowUpRight,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { BuyerOffer, MonetizationPolicy } from '../types';

type OfferAssessment = { score: number; verdict: 'RECOMMEND' | 'CAUTION' | 'REJECT'; reasoning: string };

const isValidScore = (score: unknown): score is number =>
  typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;

const isValidVerdict = (verdict: unknown): verdict is OfferAssessment['verdict'] =>
  verdict === 'RECOMMEND' || verdict === 'CAUTION' || verdict === 'REJECT';

const isValidReasoning = (reasoning: unknown): reasoning is string =>
  typeof reasoning === 'string' && reasoning.trim().length > 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isValidAssessment = (value: unknown): value is OfferAssessment => {
  if (!isRecord(value)) return false;
  const checks = [
    isValidScore(value.score),
    isValidVerdict(value.verdict),
    isValidReasoning(value.reasoning),
  ];
  return checks.every(Boolean);
};

const getOfferAssessment = (
  offer: BuyerOffer,
  current: OfferAssessment | undefined,
  error: string | undefined
): OfferAssessment | null => {
  if (error) return null;
  if (current) return current;
  const persisted = {
    score: offer.aiBrokerScore,
    verdict: offer.aiVerdict,
    reasoning: offer.aiBrokerReasoning,
  };
  return isValidAssessment(persisted) ? persisted : null;
};

const getOfferCardClass = (status: string): string => {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-slate-900/90 border-emerald-500/40 shadow-sm';
    case 'REJECTED':
      return 'bg-slate-950/50 border-slate-850 opacity-70';
    default:
      return 'bg-slate-900/95 border-slate-800 hover:border-slate-700 shadow-md';
  }
};

const VERDICT_BADGE_CONFIG = {
  RECOMMEND: { classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', Icon: CheckCircle2 },
  CAUTION: { classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30', Icon: AlertTriangle },
  REJECT: { classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30', Icon: XCircle },
} as const;

const NOT_EVALUATED_BADGE_CLASS =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700';

const getVerdictBadge = (assessment: OfferAssessment | null) => {
  if (!assessment) {
    return <span className={NOT_EVALUATED_BADGE_CLASS}>Not evaluated</span>;
  }
  return <VerdictBadge assessment={assessment} />;
};

const VerdictBadge: React.FC<{ assessment: OfferAssessment }> = ({ assessment }) => {
  const config = VERDICT_BADGE_CONFIG[assessment.verdict];
  const BadgeIcon = config.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.classes}`}>
      <BadgeIcon className="w-3.5 h-3.5" />
      {assessment.score}/100 Match • {assessment.verdict}
    </span>
  );
};

const requestOfferAssessment = async (
  offer: BuyerOffer,
  policy: MonetizationPolicy
): Promise<OfferAssessment> => {
  const response = await fetch('/api/ai/evaluate-offer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer, userPolicy: policy })
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data: unknown = await response.json();
  if (!isValidAssessment(data)) {
    throw new Error('AI evaluation response was incomplete or invalid.');
  }
  return data;
};

const runOfferAssessment = async (
  offer: BuyerOffer,
  policy: MonetizationPolicy,
  onSuccess: (assessment: OfferAssessment) => void,
  onFailure: (error: unknown) => void,
  onFinally: () => void
): Promise<void> => {
  try {
    onSuccess(await requestOfferAssessment(offer, policy));
  } catch (error) {
    onFailure(error);
  } finally {
    onFinally();
  }
};

interface MarketplaceOffersProps {
  offers: BuyerOffer[];
  onAcceptOffer: (id: string) => void;
  onRejectOffer: (id: string) => void;
  onCounterOffer: (id: string, counterAmount: number) => void;
  policy: MonetizationPolicy;
}

export const MarketplaceOffers: React.FC<MarketplaceOffersProps> = ({
  offers,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  policy
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [evaluatingIds, setEvaluatingIds] = useState<Record<string, boolean>>({});
  const evaluationRequestIds = useRef<Record<string, number>>({});
  const [evaluationResults, setEvaluationResults] = useState<Record<string, { key: string; assessment: OfferAssessment }>>({});
  const [evaluationErrors, setEvaluationErrors] = useState<Record<string, string>>({});

  const filteredOffers = offers.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'pending') return o.status === 'PENDING' || o.status === 'COUNTERED';
    if (filter === 'accepted') return o.status === 'ACCEPTED';
    if (filter === 'rejected') return o.status === 'REJECTED';
    return true;
  });

  const handleStartCounter = (offer: BuyerOffer) => {
    setCounteringOfferId(offer.id);
    const suggested = Math.round(offer.offeredCompUsd * 1.25);
    setCounterPrice(suggested);
  };

  const isCurrentEvaluation = (offerId: string, requestId: number) =>
    evaluationRequestIds.current[offerId] === requestId;

  const clearEvaluationResult = (offerId: string) => {
    setEvaluationResults(previous => Object.fromEntries(
      Object.entries(previous).filter(([id]) => id !== offerId)
    ));
  };

  const storeEvaluationFailure = (offerId: string, error: unknown) => {
    clearEvaluationResult(offerId);
    setEvaluationErrors(previous => ({
      ...previous,
      [offerId]: error instanceof Error ? error.message : 'AI evaluation unavailable.'
    }));
  };

  const storeEvaluationSuccess = (
    offerId: string,
    requestId: number,
    evaluationKey: string,
    assessment: OfferAssessment
  ) => {
    if (!isCurrentEvaluation(offerId, requestId)) return;
    setEvaluationResults(previous => ({ ...previous, [offerId]: { key: evaluationKey, assessment } }));
    setEvaluationErrors(previous => Object.fromEntries(
      Object.entries(previous).filter(([id]) => id !== offerId)
    ));
  };

  const storeCurrentEvaluationFailure = (
    offerId: string,
    requestId: number,
    error: unknown
  ) => {
    if (!isCurrentEvaluation(offerId, requestId)) return;
    console.error('Offer AI evaluation failed:', error);
    storeEvaluationFailure(offerId, error);
  };

  const finishCurrentEvaluation = (offerId: string, requestId: number) => {
    if (!isCurrentEvaluation(offerId, requestId)) return;
    setEvaluatingIds(previous => ({ ...previous, [offerId]: false }));
  };

  const handleRunAiEvaluation = async (offer: BuyerOffer) => {
    const evaluationKey = JSON.stringify({ offer, policy });
    const requestId = (evaluationRequestIds.current[offer.id] || 0) + 1;
    evaluationRequestIds.current[offer.id] = requestId;
    setEvaluatingIds(previous => ({ ...previous, [offer.id]: true }));
    await runOfferAssessment(
      offer,
      policy,
      assessment => storeEvaluationSuccess(offer.id, requestId, evaluationKey, assessment),
      error => storeCurrentEvaluationFailure(offer.id, requestId, error),
      () => finishCurrentEvaluation(offer.id, requestId)
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Buyer Offers & Evaluation
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Review offer details and run an AI assessment when the evaluation service is configured. Scores and recommendations are shown only when a valid assessment is available.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                  filter === f
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Offer Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOffers.map((offer) => {
          const isPending = offer.status === 'PENDING';
          const isAccepted = offer.status === 'ACCEPTED';
          const isRejected = offer.status === 'REJECTED';
          const isCountered = offer.status === 'COUNTERED';
          const isEvaluating = evaluatingIds[offer.id] === true;
          // A failed re-evaluation invalidates both the previous local result and any
          // persisted offer assessment until a later successful evaluation clears the error.
          const evaluationError = evaluationErrors[offer.id];
          const storedEvaluation = evaluationResults[offer.id];
          const currentAssessment = storedEvaluation?.key === JSON.stringify({ offer, policy })
            ? storedEvaluation.assessment
            : undefined;
          const assessment = getOfferAssessment(
            offer,
            currentAssessment,
            evaluationError
          );

          return (
            <div
              key={offer.id}
              id={`offer-card-${offer.id}`}
              className={`rounded-xl border p-5 transition-all ${getOfferCardClass(offer.status)}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: Buyer info & specs */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm font-bold text-white">{offer.buyerName}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {offer.buyerCategory}
                    </span>
                    {offer.buyerVerified && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Audited Entity
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">
                      Reputation: {offer.reputationScore}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {offer.purposeSummary}
                  </p>

                  {/* Badges / Constraints */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="text-[11px] font-medium text-slate-400">
                      Streams Needed:
                    </div>
                    {offer.dataCategoriesNeeded.map((c) => (
                      <span key={c} className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {c}
                      </span>
                    ))}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                      Retention: {offer.retentionWindowDays} days max
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-mono">
                      Required ε ≤ {offer.maxEpsilonAllowed}
                    </span>
                  </div>

                  {/* Prohibited clauses */}
                  {offer.prohibitedPurposes.length > 0 && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                      <span className="font-semibold text-slate-500">Strict Prohibitions:</span>
                      {offer.prohibitedPurposes.map((p, i) => (
                        <span key={i} className="text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Compensation & Verdict */}
                <div className="flex flex-col items-end gap-3 self-start lg:self-auto shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Offered Compensation</div>
                    <div className="text-xl font-extrabold font-mono text-emerald-400">
                      ${offer.offeredCompUsd.toFixed(2)}{' '}
                      <span className="text-xs font-normal text-slate-400">/{offer.pricingCadence}</span>
                    </div>
                    {isCountered && (
                      <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                        Counter-offer submitted: ${offer.counterOfferAmount?.toFixed(2)}/mo
                      </div>
                    )}
                  </div>

                  <div>{getVerdictBadge(assessment)}</div>
                </div>
              </div>

              {/* AI Broker Evaluation Note */}
              <div className="mt-3.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/90 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-slate-200">AI Broker Assessment</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-semibold uppercase">
                      {policy.aiModel || 'AI model not configured'}
                    </span>
                  </div>
                  <span className="text-slate-300">{assessment?.reasoning || evaluationErrors[offer.id] || 'No verified AI assessment is available yet. Run an evaluation; a failed request will not produce a score or recommendation.'}</span>
                </div>
                <button
                  onClick={() => handleRunAiEvaluation(offer)}
                  disabled={isEvaluating}
                  className="text-[11px] text-slate-400 hover:text-emerald-300 font-medium shrink-0 flex items-center gap-1"
                >
                  {isEvaluating ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                  Re-evaluate
                </button>
              </div>

              {/* Counter-Offer Drawer / Box */}
              {counteringOfferId === offer.id && (
                <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300">
                      Counter-offer draft for {offer.buyerName}
                    </span>
                    <button
                      onClick={() => setCounteringOfferId(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Proposed Compensation Rate ($/month)
                      </label>
                      <input
                        type="number"
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        onCounterOffer(offer.id, counterPrice);
                        setCounteringOfferId(null);
                      }}
                      className="mt-4 px-4 py-2 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                    >
                      Submit Counter
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    This prepares a counter-offer for your review. No message is sent and no contract is created until the application confirms that action.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Status: <strong className="text-white font-mono uppercase">{offer.status}</strong>
                  <span className="ml-2 text-slate-500">{offer.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleStartCounter(offer)}
                        id={`counter-btn-${offer.id}`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        Counter-Offer
                      </button>
                      <button
                        onClick={() => onRejectOffer(offer.id)}
                        id={`reject-btn-${offer.id}`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onAcceptOffer(offer.id)}
                        id={`accept-btn-${offer.id}`}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept Offer
                      </button>
                    </>
                  )}

                  {isCountered && (
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Awaiting Buyer Response
                    </span>
                  )}

                  {isAccepted && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Offer accepted
                    </span>
                  )}

                  {isRejected && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Bid Declined
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
