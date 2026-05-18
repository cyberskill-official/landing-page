import React from 'react';
import type { OutcomeMetric } from '@/lib/sanity/types.generated';

export function OutcomeMetricsGrid({ metrics }: { metrics: OutcomeMetric[] }) {
  if (metrics.length === 0) return null;

  return (
    <section className="case-study-section" aria-labelledby="outcome-metrics-title">
      <h2 id="outcome-metrics-title">Outcome metrics</h2>
      <div className="case-study-metrics">
        {metrics.map((metric) => (
          <div key={`${metric.label}-${metric.value}`} className="case-study-metric" data-direction={metric.delta_direction}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
