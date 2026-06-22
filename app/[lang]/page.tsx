import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Hero } from "@/components/sections/Hero";
import { ValueProp } from "@/components/sections/ValueProp";
import { Services } from "@/components/sections/Services";
import { WorkPreview } from "@/components/sections/WorkPreview";
import { SocialProof } from "@/components/sections/SocialProof";
import { Careers } from "@/components/sections/Careers";
import { ContactCta } from "@/components/sections/ContactCta";
import { HomeFaqJsonLd } from "@/components/seo/HomeFaqJsonLd";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <ValueProp locale={locale} dict={dict} />
      <Services locale={locale} dict={dict} />
      <WorkPreview locale={locale} dict={dict} />
      <SocialProof locale={locale} dict={dict} />
      <Careers locale={locale} dict={dict} />
      <ContactCta locale={locale} dict={dict} />
      <HomeFaqJsonLd locale={locale} />
    </>
  );
}
