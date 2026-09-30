import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { PlanningRecommendation, RecommendationSeverity } from '../types/weather';

interface RecommendationsPanelProps {
  recommendations: PlanningRecommendation[];
  cityName: string;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  cityName,
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  const getSeverityIndicator = (severity: RecommendationSeverity) => {
    switch (severity) {
      case 'caution':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />,
          label: 'Caution Advisory',
          textClass: 'text-red-700',
          borderAccent: 'border-l-red-600',
        };
      case 'advisory':
        return {
          icon: <Info className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />,
          label: 'Planning Note',
          textClass: 'text-amber-700',
          borderAccent: 'border-l-amber-500',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />,
          label: 'Optimal Window',
          textClass: 'text-emerald-700',
          borderAccent: 'border-l-emerald-600',
        };
    }
  };

  return (
    <section aria-label="Planning Recommendations and Weather Intelligence" className="mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          03. Operational Planning Recommendations — {cityName}
        </h2>
        <p className="text-xs text-slate-500">
          Deterministic, rule-based planning guidance derived from Open-Meteo telemetry (Human-in-the-Loop auditable thresholds)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const indicator = getSeverityIndicator(rec.severity);

          return (
            <article
              key={rec.id}
              className={`bg-white border border-slate-200 border-l-4 ${indicator.borderAccent} rounded-xl p-5 flex flex-col justify-between`}
            >
              <div>
                {/* Unboxed metadata kicker with typographic separator */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-medium text-slate-600">{rec.category}</span>
                  <span className={`font-medium flex items-center gap-1 ${indicator.textClass}`}>
                    {indicator.icon}
                    <span>{indicator.label}</span>
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {rec.title}
                </h3>

                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {rec.actionSummary}
                </p>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {rec.rationale}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono tabular-nums">
                Trigger: {rec.triggerMetric}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
