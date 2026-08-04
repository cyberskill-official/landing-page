/**
 * GA4 measurement ID + Consent Mode boot string for the document head.
 * Kept in one module so layout HTML and client consent updates cannot drift.
 */
export const GA_MEASUREMENT_ID = "G-HBXWFJNMHD";

/** Inline boot: Consent Mode defaults denied, then config. Runs before React. */
export const GA_BOOT_SCRIPT =
  "window.dataLayer=window.dataLayer||[];" +
  "function gtag(){dataLayer.push(arguments);}" +
  "gtag('consent','default',{" +
  "analytics_storage:'denied'," +
  "ad_storage:'denied'," +
  "ad_user_data:'denied'," +
  "ad_personalization:'denied'," +
  "wait_for_update:500" +
  "});" +
  "gtag('js',new Date());" +
  `gtag('config','${GA_MEASUREMENT_ID}');`;

export const GA_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
