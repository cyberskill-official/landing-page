'use client';

import { useEffect } from 'react';
import { InlineWidget } from 'react-calendly';

type CalendlyEmbedProps = {
  onEventScheduled: (scheduledSlot: string) => void;
  prefill: {
    customAnswers?: Record<string, string>;
    email?: string;
    name?: string;
  };
  url: string;
};

export function CalendlyEmbed({ onEventScheduled, prefill, url }: CalendlyEmbedProps) {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { event?: string; payload?: { event?: { uri?: string } } } | undefined;
      if (data?.event !== 'calendly.event_scheduled') return;
      onEventScheduled(data.payload?.event?.uri ?? 'calendly-event-scheduled');
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onEventScheduled]);

  return (
    <div className="calendly-panel" data-calendly-embed data-calendly-url={url}>
      <InlineWidget
        url={url}
        prefill={prefill}
        styles={{
          height: '620px',
          minWidth: '320px',
        }}
      />
      <p className="cta-form__tip">
        Can't see the calendar? Email <a href="mailto:info@cyberskill.world">info@cyberskill.world</a>.
      </p>
    </div>
  );
}
