import { cn } from "@/lib/utils";
import {
  allCities,
  allDisciplines,
  allTags,
  DISCIPLINE_LABEL,
  type Discipline,
  type SortKey,
} from "@/lib/builders";

interface FilterChipsProps {
  discipline: Discipline | null;
  onDiscipline: (discipline: Discipline | null) => void;
  tags: string[];
  onToggleTag: (tag: string) => void;
  city: string | null;
  onCity: (city: string | null) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
}

const chipBase =
  "rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors";

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      chipBase,
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
    )}
  >
    {children}
  </button>
);

const FilterChips = ({
  discipline,
  onDiscipline,
  tags,
  onToggleTag,
  city,
  onCity,
  sort,
  onSort,
}: FilterChipsProps) => (
  <div className="space-y-3">
    {/* Discipline — the primary filter */}
    <div className="flex flex-wrap justify-center gap-2">
      <Chip active={discipline === null} onClick={() => onDiscipline(null)}>
        Everyone
      </Chip>
      {allDisciplines.map((d) => (
        <Chip
          key={d}
          active={discipline === d}
          onClick={() => onDiscipline(discipline === d ? null : d)}
        >
          {DISCIPLINE_LABEL[d]}
        </Chip>
      ))}
    </div>

    {/* Specialties */}
    <div className="flex flex-wrap justify-center gap-2">
      {allTags.map((tag) => (
        <Chip key={tag} active={tags.includes(tag)} onClick={() => onToggleTag(tag)}>
          {tag}
        </Chip>
      ))}
    </div>

    {/* Cities + sort */}
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Chip active={city === null} onClick={() => onCity(null)}>
        All cities
      </Chip>
      {allCities.map((c) => (
        <Chip key={c} active={city === c} onClick={() => onCity(city === c ? null : c)}>
          {c}
        </Chip>
      ))}
      <span className="mx-2 hidden h-4 w-px bg-border sm:block" />
      <span className="micro-label">Sort:</span>
      <Chip active={sort === "name"} onClick={() => onSort("name")}>
        Name
      </Chip>
      <Chip active={sort === "experience"} onClick={() => onSort("experience")}>
        Experience
      </Chip>
    </div>
  </div>
);

export default FilterChips;
