"use client";

import { useEffect, useRef, useState } from "react";
import { scrollToId } from "@/lib/scroll/lenis-gsap";

// Guided-story chapter rail (FR-SCENE-011). A fixed side index that turns the
// home page into a directed story: a dot + label per act, lighting up and
// filling as you scroll, clickable to jump. It reads which section is current
// from the live layout (rAF-throttled), so it works with the Lenis smooth
// scroll and the pinned hero. It renders only where its anchors exist (the home
// page) and is inert under reduced motion (the CSS drops the transitions). The
// links are real in-page anchors, so it degrades to plain navigation with no JS.
export type Chapter = { id: string; label: string };

export function ChapterRail({ label, chapters }: { label: string; chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const railRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const liveEls = () => chapters.map((c) => document.getElementById(c.id));
    if (liveEls().filter(Boolean).length < 2) {
      setReady(false);
      return;
    }
    setReady(true);
    let raf = 0;
    const update = () => {
      raf = 0;
      // Re-query the elements EVERY time. Caching them breaks the moment React 19
      // hydration recovery (#418) regenerates the client tree - the cached nodes
      // orphan, their rects read 0, and every act looks like it is at the top.
      const els = liveEls();
      if (els.filter(Boolean).length < 2) return;
      // Until the pinned hero and the canvas expand the page, the sections are
      // stacked near the top and the measurement is unreliable - but you are in
      // the first act anyway, so default there rather than flash the last one.
      if (document.documentElement.scrollHeight < window.innerHeight * 2.5) {
        setActive(0);
        return;
      }
      // The playhead sits a little above centre; the current chapter is the last
      // whose top has crossed it.
      const line = window.innerHeight * 0.42;
      let idx = 0;
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    // Poll briefly to catch the pinned-hero + canvas layout settling. Each tick
    // re-queries live nodes, so a mid-settle tree swap never strands us.
    let polls = 0;
    let timer = 0;
    const poll = () => {
      schedule();
      if (polls++ < 25) timer = window.setTimeout(poll, 200);
    };
    poll();
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, [chapters]);

  if (!ready) return null;

  return (
    <nav
      ref={railRef}
      className="cs-rail cs-no-print"
      aria-label={label}
      data-active={active}
      style={{ ["--rail-active" as string]: String(active) }}
    >
      <ol role="list" style={{ ["--rail-count" as string]: String(chapters.length) }}>
        {chapters.map((c, i) => (
          <li key={c.id} className={i <= active ? "is-past" : ""} data-on={i === active ? "" : undefined}>
            <a
              href={`#${c.id}`}
              aria-current={i === active ? "step" : undefined}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(c.id);
                history.replaceState(null, "", `#${c.id}`);
              }}
            >
              <span className="cs-rail-name">{c.label}</span>
              <span className="cs-rail-dot" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
