import type { Metadata } from 'next';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';
import { CriteriaTable, type Criterion } from '@/components/accessibility/CriteriaTable';
import { LitePreferenceResetLink } from '@/components/system/LitePreferenceResetLink';
import { FormPrefillClearButton } from '@/components/system/FormPrefillClearButton';
import criteriaData from '../../../../content/accessibility/criteria.json';

type AccessibilityPageProps = {
  searchParams?: RouteSearchParams;
};

const accessibilityCopy = {
  en: {
    title: 'Accessibility statement',
    intro: 'CyberSkill targets WCAG 2.2 Level AA across the public marketing experience and documents the current evidence below.',
    commitmentTitle: 'Our commitment',
    standard: 'Standard claimed',
    standardValue: 'WCAG 2.2 Level AA, with selected AAA enhancements for target size and motion alternatives.',
    statusTitle: 'Conformance status',
    statusValue: 'Partial while the final VoiceOver and NVDA manual audit is pending in FR-A11Y-012. Automated axe, keyboard, reduced-motion, target-size, and form-flow checks are passing for the routes listed here.',
    testedTitle: 'Tested with',
    tested: [
      'Keyboard-only navigation across public routes and CTA flows',
      'Reduced-motion and `/lite` storyboard flow',
      'Low-bandwidth / Save-Data and low-memory fallback paths',
      'Mobile widths down to 320 px and desktop widths up to 1920 px',
      'axe-core WCAG 2.2 AA route gate in Chromium',
      'VoiceOver and NVDA manual review: scheduled for FR-A11Y-012',
    ],
    criteriaTitle: 'WCAG 2.2 criteria coverage',
    knownIssuesTitle: 'Known issues',
    knownIssues: [
      'Manual VoiceOver and NVDA review is pending in FR-A11Y-012; until then, screen-reader conformance remains partial.',
      'Some Vietnamese pages intentionally retain English product and technical terms; this is tracked in the localization review work.',
    ],
    contactTitle: 'Report an accessibility issue',
    contactCopy: 'If you encounter an accessibility barrier on this site, contact us at:',
    contactSla: 'We aim to respond within 5 business days.',
    reviewCopy: 'Last reviewed: May 18, 2026. Reviewed at least quarterly and before major launch changes.',
    lite: 'Open read-only mode',
    reset: 'Reset experience preference',
    privacy: 'Saved form details',
    privacyCopy: 'CTA forms can remember your name, email, organization, and country for 24 hours on this device so you do not need to re-enter the same details across flows.',
  },
  vi: {
    title: 'Tuyen bo kha nang tiep can',
    intro: 'CyberSkill huong den WCAG 2.2 Level AA cho trai nghiem marketing cong khai va cong khai bang chung hien tai ben duoi.',
    commitmentTitle: 'Cam ket',
    standard: 'Tieu chuan cong bo',
    standardValue: 'WCAG 2.2 Level AA, cong them mot so nang cap AAA cho kich thuoc muc tieu va duong khong chuyen dong.',
    statusTitle: 'Trang thai tuan thu',
    statusValue: 'Mot phan trong khi audit thu cong VoiceOver va NVDA dang cho FR-A11Y-012. Cac kiem tra axe, ban phim, reduced-motion, target-size, va form-flow dang pass cho route duoc liet ke.',
    testedTitle: 'Da kiem tra voi',
    tested: [
      'Dieu huong chi bang ban phim tren cac route cong khai va luong CTA',
      'Reduced-motion va luong storyboard `/lite`',
      'Duong fallback cho Save-Data, bang thong thap, va thiet bi bo nho thap',
      'Man hinh mobile tu 320 px den desktop 1920 px',
      'Cong axe-core WCAG 2.2 AA trong Chromium',
      'Review thu cong VoiceOver va NVDA: da len lich o FR-A11Y-012',
    ],
    criteriaTitle: 'Doi chieu tieu chi WCAG 2.2',
    knownIssuesTitle: 'Van de da biet',
    knownIssues: [
      'Review thu cong VoiceOver va NVDA dang cho FR-A11Y-012; den luc do, tuan thu screen-reader duoc ghi la mot phan.',
      'Mot so trang tieng Viet co chu dich giu lai thuat ngu san pham va ky thuat bang tieng Anh; viec nay nam trong review ngon ngu.',
    ],
    contactTitle: 'Bao cao van de accessibility',
    contactCopy: 'Neu ban gap rao can accessibility tren trang nay, hay lien he:',
    contactSla: 'Chung toi dat muc tieu phan hoi trong 5 ngay lam viec.',
    reviewCopy: 'Lan xem lai gan nhat: 18/05/2026. Xem lai toi thieu hang quy va truoc thay doi launch lon.',
    lite: 'Mo che do doc tinh',
    reset: 'Dat lai tuy chon trai nghiem',
    privacy: 'Thong tin bieu mau da luu',
    privacyCopy: 'Cac bieu mau CTA co the luu ten, email, to chuc, va quoc gia trong 24 gio tren thiet bi nay de ban khong can nhap lai giua cac luong.',
  },
};

const criteria = criteriaData as Criterion[];
export const revalidate = 86400;

export function generateMetadata(): Metadata {
  return generateRouteMetadata('/accessibility', {
    title: 'CyberSkill — Accessibility',
    description: 'Public accessibility statement and WCAG conformance route for CyberSkill.',
    hreflang: {
      'x-default': '/accessibility',
      en: '/accessibility',
      vi: '/vi/accessibility',
    },
  });
}

export default async function AccessibilityPage({ searchParams }: AccessibilityPageProps) {
  const locale = await resolveRouteLocale(searchParams);
  const copy = accessibilityCopy[locale];

  return (
    <main className="route-page route-page--accessibility">
      <article aria-labelledby="accessibility-title" className="accessibility-statement">
        <h1 id="accessibility-title">{copy.title}</h1>
        <p>{copy.intro}</p>

        <section className="route-page__section" aria-labelledby="commitment-title">
          <h2 id="commitment-title">{copy.commitmentTitle}</h2>
          <dl className="accessibility-facts">
            <div>
              <dt>{copy.standard}</dt>
              <dd>{copy.standardValue}</dd>
            </div>
            <div>
              <dt>{copy.statusTitle}</dt>
              <dd>{copy.statusValue}</dd>
            </div>
          </dl>
        </section>

        <section className="route-page__section" aria-labelledby="tested-with-title">
          <h2 id="tested-with-title">{copy.testedTitle}</h2>
          <ul>
            {copy.tested.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="route-page__section route-page__section--wide" aria-labelledby="criteria-title">
          <h2 id="criteria-title">{copy.criteriaTitle}</h2>
          <CriteriaTable criteria={criteria} locale={locale} />
        </section>

        <section className="route-page__section" aria-labelledby="known-issues-title">
          <h2 id="known-issues-title">{copy.knownIssuesTitle}</h2>
          <ul>
            {copy.knownIssues.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="route-page__section" aria-labelledby="contact-title">
          <h2 id="contact-title">{copy.contactTitle}</h2>
          <p>{copy.contactCopy}</p>
          <address>
            <a href="mailto:accessibility@cyberskill.world">accessibility@cyberskill.world</a>
          </address>
          <p>{copy.contactSla}</p>
        </section>

      <section id="privacy" className="route-page__section" aria-labelledby="privacy-title">
        <h2 id="privacy-title">{copy.privacy}</h2>
        <p>{copy.privacyCopy}</p>
        <FormPrefillClearButton />
      </section>

        <p className="accessibility-reviewed">{copy.reviewCopy}</p>
        <LitePreferenceResetLink label={copy.reset} />
        <a href="/lite">{copy.lite}</a>
      </article>
    </main>
  );
}
