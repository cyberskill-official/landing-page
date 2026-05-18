import React from 'react';

export type CriteriaLocale = 'en' | 'vi';

export type CriterionStatus = 'full' | 'partial' | 'n/a';

export type Criterion = {
  fr_refs: string[];
  id: string;
  level: 'A' | 'AA' | 'AAA';
  name: string;
  notes: Record<CriteriaLocale, string>;
  status: CriterionStatus;
};

const statusLabels: Record<CriteriaLocale, Record<CriterionStatus, string>> = {
  en: {
    full: 'Full',
    partial: 'Partial',
    'n/a': 'Not applicable',
  },
  vi: {
    full: 'Day du',
    partial: 'Mot phan',
    'n/a': 'Khong ap dung',
  },
};

const headings = {
  en: {
    criterion: 'Criterion',
    frRefs: 'Evidence',
    level: 'Level',
    name: 'Name',
    notes: 'Notes',
    status: 'Status',
    caption: 'WCAG 2.2 criteria conformance coverage',
  },
  vi: {
    criterion: 'Tieu chi',
    frRefs: 'Bang chung',
    level: 'Cap',
    name: 'Ten',
    notes: 'Ghi chu',
    status: 'Trang thai',
    caption: 'Bang doi chieu tieu chi WCAG 2.2',
  },
} satisfies Record<CriteriaLocale, Record<string, string>>;

export function CriteriaTable({
  criteria,
  locale = 'en',
}: {
  criteria: Criterion[];
  locale?: CriteriaLocale;
}) {
  const copy = headings[locale];
  const rows = [...criteria].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return (
    <div className="criteria-table-wrap" role="region" aria-label={copy.caption} tabIndex={0}>
      <table className="criteria-table">
        <caption>{copy.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{copy.criterion}</th>
            <th scope="col">{copy.name}</th>
            <th scope="col">{copy.level}</th>
            <th scope="col">{copy.status}</th>
            <th scope="col">{copy.notes}</th>
            <th scope="col">{copy.frRefs}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((criterion) => (
            <tr key={criterion.id}>
              <td>
                <code>{criterion.id}</code>
              </td>
              <td>{criterion.name}</td>
              <td>{criterion.level}</td>
              <td>
                <span className={`criteria-status criteria-status--${criterion.status.replace('/', '')}`}>
                  {statusLabels[locale][criterion.status]}
                </span>
              </td>
              <td>{criterion.notes[locale]}</td>
              <td>{criterion.fr_refs.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
