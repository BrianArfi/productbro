import raw from "@/data/builders.json";
import site from "@/data/site.json";

export interface ShowcaseItem {
  title: string;
  description: string;
  link?: string;
}

/** The kind of builder. Drives the primary discipline filter on the index. */
export type Discipline =
  | "PRODUCT"
  | "ENGINEERING"
  | "DESIGN"
  | "BUSINESS"
  | "EDUCATION"
  | "FOUNDER";

export interface Builder {
  slug: string;
  name: string;
  discipline: Discipline;
  role: string;
  company: string;
  city: string;
  tags: string[];
  focus: string;
  experience: string;
  linkedin?: string;
  photo?: string;
  bio: string[];
  claimed: boolean;
  showcase?: ShowcaseItem[];
}

export const siteConfig = site;

export const builders: Builder[] = raw as Builder[];

/** Canonical display order for discipline chips (not alphabetical). */
export const DISCIPLINE_ORDER: Discipline[] = [
  "PRODUCT",
  "ENGINEERING",
  "DESIGN",
  "BUSINESS",
  "EDUCATION",
  "FOUNDER",
];

/** Human label shown for each discipline. */
export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  PRODUCT: "Product",
  ENGINEERING: "Engineering",
  DESIGN: "Design",
  BUSINESS: "Business & Deals",
  EDUCATION: "Education",
  FOUNDER: "Founder",
};

export const allDisciplines: Discipline[] = DISCIPLINE_ORDER.filter((d) =>
  builders.some((b) => b.discipline === d)
);

export const allTags: string[] = [...new Set(builders.flatMap((b) => b.tags))].sort();

export const allCities: string[] = [...new Set(builders.map((b) => b.city))].sort();

export const findBuilder = (slug: string | undefined): Builder | undefined =>
  builders.find((b) => b.slug === slug);

/** "12+ YRS" -> 12, used for sorting by seniority */
export const expYears = (b: Builder): number => {
  const m = b.experience.match(/\d+/);
  return m ? Number(m[0]) : 0;
};

export type SortKey = "name" | "experience";

export function filterBuilders(opts: {
  query: string;
  discipline: Discipline | null;
  tags: string[];
  city: string | null;
  sort: SortKey;
}): Builder[] {
  const q = opts.query.trim().toLowerCase();
  let out = builders.filter((b) => {
    if (opts.discipline && b.discipline !== opts.discipline) return false;
    if (opts.city && b.city !== opts.city) return false;
    if (opts.tags.length > 0 && !opts.tags.some((t) => b.tags.includes(t))) return false;
    if (q) {
      const haystack = [b.name, b.role, b.company, b.city, b.focus, b.discipline, ...b.tags]
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
