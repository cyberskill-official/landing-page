import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n/config";

// Fallback for the bare "/" if middleware did not already redirect.
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
