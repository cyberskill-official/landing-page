import { describe, it, expect } from "vitest";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales } from "@/lib/i18n/config";

type Json = Record<string, unknown>;

function leafPaths(obj: Json, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") out.push(...leafPaths(v as Json, path));
    else out.push(path);
  }
  return out;
}

describe("dictionary parity (Vietnamese-first commitment)", () => {
  it("en and vi expose identical key paths", () => {
    const en = leafPaths(getDictionary("en") as unknown as Json).sort();
    const vi = leafPaths(getDictionary("vi") as unknown as Json).sort();
    expect(vi).toEqual(en);
  });

  it("every string is non-empty in every locale", () => {
    for (const loc of locales) {
      const dict = getDictionary(loc) as unknown as Json;
      const walk = (o: Json) => {
        for (const v of Object.values(o)) {
          if (v && typeof v === "object") walk(v as Json);
          else expect(typeof v === "string" && (v as string).length > 0).toBe(true);
        }
      };
      walk(dict);
    }
  });
});
