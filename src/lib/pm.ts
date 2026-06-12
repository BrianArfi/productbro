import raw from "@/data/pms.json";
import site from "@/data/site.json";

export interface ShowcaseItem {
  title: string;
  description: string;
  link?: string;
}

export interface PM {
  slug: string;
  name: string;
  role: string;
  company: string;
  city: string;
  tags: string[];
  focus: string;
  experience: string;
  linkedin: string;
  photo?: string;
  bio: string[];
  claimed: boolean;
  showcase?: ShowcaseItem[];
}

export const siteConfig = site;

export const pms: PM[] = raw as PM[];

export const allTags: string[] = [...new Set(pms.flatMap((p) => p.tags))].sort();

export const allCities: string[] = [...new Set(pms.map((p) => p.city))].sort();

export const findPM = (slug: string | undefined): PM | undefined =>
  pms.find((p) => p.slug === slug);

/** "12+ YRS" -> 12, used for sorting by seniority */
export const expYears = (p: PM): number => {
  const m = p.experience.match(/\d+/);
  return m ? Number(m[0]) : 0;
};

export type SortKey = "name" | "experience";

export function filterPMs(opts: {
  query: string;
  tags: string[];
  city: string | null;
  sort: SortKey;
}): PM[] {
  const q = opts.query.trim().toLowerCase();
  let out = pms.filter((p) => {
    if (opts.city && p.city !== opts.city) return false;
    if (opts.tags.length > 0 && !opts.tags.some((t) => p.tags.includes(t))) return false;
    if (q) {
      const haystack = [p.name, p.role, p.company, p.city, p.focus, ...p.tags]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  out = [...out].sort((a, b) =>
    opts.sort === "experience" ? expYears(b) - expYears(a) : a.name.localeCompare(b.name)
  );
  return out;
}
