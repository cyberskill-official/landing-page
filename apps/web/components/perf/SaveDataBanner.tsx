'use client';

import { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';

type SaveDataBannerProps = {
  locale: SupportedLocale;
  onStay: () => void;
  onSwitch: () => void;
};

const copy = {
  en: {
    label: 'Data-saving option',
    message: 'We can show a faster version that uses less data - switch?',
    stay: 'Stay here',
    switch: 'Switch to /lite',
    why: 'Why am I seeing this?',
    whyText: "Your browser's Low Data mode is on. We have a lighter version that uses about 80% less data.",
  },
  vi: {
    label: 'Lua chon tiet kiem du lieu',
    message: 'Phiên bản nhẹ hơn, tiết kiệm dữ liệu - chuyển sang?',
    stay: 'Ở lại đây',
    switch: 'Chuyển sang /lite',
    why: 'Vì sao tôi thấy thông báo này?',
    whyText: 'Trình duyệt đang bật chế độ tiết kiệm dữ liệu. Bản nhẹ dùng ít dữ liệu hơn khoảng 80%.',
  },
};

export function SaveDataBanner({ locale, onStay, onSwitch }: SaveDataBannerProps) {
  const switchButton = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const text = copy[locale];

  useEffect(() => {
    switchButton.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onStay();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onStay]);

  return (
    <section
      aria-label={text.label}
      aria-live="polite"
      className="save-data-banner"
      data-save-data-banner
      onKeyDown={(event) => {
        if (event.key === 'Escape') onStay();
      }}
      role="region"
    >
      <p>{text.message}</p>
      <button
        type="button"
        className="save-data-banner__why"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {text.why}
      </button>
      {expanded ? <p className="save-data-banner__why-text">{text.whyText}</p> : null}
      <div className="save-data-banner__actions">
        <button
          ref={switchButton}
          type="button"
          className="save-data-banner__primary"
          onClick={onSwitch}
        >
          {text.switch}
        </button>
        <button type="button" className="save-data-banner__secondary" onClick={onStay}>
          {text.stay}
        </button>
      </div>
    </section>
  );
}
