export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type LocaleValue = 'en' | 'vi';

export type CoreEventMap = {
  scene_enter: { scene_id: string };
  lumi_interact: { trigger: 'hover' | 'tap'; anim: string };
  cta_view: { cta_id: string; scene_id: string };
  cta_click: { cta_id: string; scene_id: string; track: string; scroll_depth?: number };
  skip_story_used: { breakpoint: Breakpoint };
  lite_mode_toggled: {
    from: 'cinematic' | 'lite';
    to: 'cinematic' | 'lite';
    source: 'click' | 'keyboard' | 'auto_redirect' | 'save_data_banner';
  };
  mute_toggled: {
    from: 'muted' | 'unmuted';
    to: 'muted' | 'unmuted';
    source: 'click' | 'keyboard';
  };
  form_submit: { track: 'buy' | 'partner' | 'join'; success: boolean };
  form_error: { track: string; error_type: string; field?: string };
  nonla_easter_egg: { variant: 'tet' | 'midautumn' | 'sunset' | 'default' };
};

export type OperationalEventMap = {
  ab_conversion: { test_id: string; variant: string; conversion_id: string };
  ab_exposure: { test_id: string; variant: string };
  form_step: { track: 'buy' | 'partner' | 'join'; step: string };
  join_form_open: { source: 'cta_hub' | 'footer_badge' };
  join_form_success: { source: 'cta_hub' | 'footer_badge' };
  lumi_form_reaction_fired: {
    anim: string;
    trigger: 'mount' | 'step_advance' | 'submit_success' | 'submit_error' | 'close';
    form_track: 'buy' | 'partner' | 'join';
  };
  locale_switched: { from: LocaleValue; to: LocaleValue; source: 'switcher' };
  long_task_detected: { duration_ms: number; source?: string };
  preload_completed: { scene: number; url: string; bytes: number; latency_ms: number };
  preload_started: { scene: number; url: string };
  save_data_banner_shown: { source: 'save_data_banner' };
  save_data_banner_stayed: { source: 'save_data_banner' };
  save_data_banner_switched: { source: 'save_data_banner' };
  vi_tagline_revealed: { locale: LocaleValue; trigger_type: 'hover' | 'tap' | 'keyboard' };
  web_vitals: {
    metric_name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
    value: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
    route: string;
    breakpoint: Breakpoint;
    connection: string;
    locale: LocaleValue;
  };
};

export type AnalyticsEventMap = CoreEventMap & OperationalEventMap;
export type AnalyticsEventName = keyof AnalyticsEventMap;
export type EventProps<T extends AnalyticsEventName> = AnalyticsEventMap[T];

export const CORE_EVENT_NAMES = [
  'scene_enter',
  'lumi_interact',
  'cta_view',
  'cta_click',
  'skip_story_used',
  'lite_mode_toggled',
  'mute_toggled',
  'form_submit',
  'form_error',
  'nonla_easter_egg',
] as const satisfies readonly (keyof CoreEventMap)[];

export const ALL_EVENT_NAMES = [
  ...CORE_EVENT_NAMES,
  'ab_conversion',
  'ab_exposure',
  'form_step',
  'join_form_open',
  'join_form_success',
  'lumi_form_reaction_fired',
  'locale_switched',
  'long_task_detected',
  'preload_completed',
  'preload_started',
  'save_data_banner_shown',
  'save_data_banner_stayed',
  'save_data_banner_switched',
  'vi_tagline_revealed',
  'web_vitals',
] as const satisfies readonly AnalyticsEventName[];

export function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return typeof value === 'string' && (ALL_EVENT_NAMES as readonly string[]).includes(value);
}
