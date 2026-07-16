/**
 * Server-rendered wish field. Progressive enhancement: without JS this is a
 * plain GET to the contact band. Matches .cs-wish styles used by HeroWish.
 */
export function HeroWishStatic({
  locale,
  placeholder,
  cta,
}: {
  locale: string;
  placeholder: string;
  cta: string;
}) {
  return (
    <form className="cs-wish" action={`/${locale}#contact`} method="get" role="search">
      <label className="cs-visually-hidden" htmlFor="cs-hero-wish-input">
        {placeholder}
      </label>
      <input
        id="cs-hero-wish-input"
        className="cs-wish-input"
        name="wish"
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="go"
        maxLength={200}
      />
      <button type="submit" className="cs-btn cs-btn-primary cs-wish-go">
        {cta}
      </button>
    </form>
  );
}
