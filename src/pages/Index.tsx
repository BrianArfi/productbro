import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import FilterChips from "@/components/FilterChips";
import BuilderCard from "@/components/BuilderCard";
import { Button } from "@/components/ui/button";
import { builders, filterBuilders, siteConfig, type Discipline, type SortKey } from "@/lib/builders";

const Index = () => {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [city, setCity] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");

  useEffect(() => {
    document.title = `${siteConfig.name} — ${siteConfig.tagline}`;
  }, []);

  const results = useMemo(
    () => filterBuilders({ query, discipline, tags, city, sort }),
    [query, discipline, tags, city, sort]
  );

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const hasFilters = query !== "" || discipline !== null || tags.length > 0 || city !== null;
  const clearFilters = () => {
    setQuery("");
    setDiscipline(null);
    setTags([]);
    setCity(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {siteConfig.sampleData && (
        <div className="border-b border-primary/20 bg-primary/10">
          <p className="container py-2 text-center font-mono text-[11px] uppercase tracking-wider text-primary">
            ⚠ Sample profiles below — the real index is being curated.{" "}
            <a href={siteConfig.tallyListUrl} target="_blank" rel="noreferrer" className="underline">
              Nominate someone →
            </a>
          </p>
        </div>
      )}

      <main className="flex-1">
        {/* Hero */}
        <section className="container pb-10 pt-14 text-center sm:pt-20">
          <p className="micro-label !text-primary">
            INDEX · {builders.length} PRODUCT BUILDERS · INDONESIA
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            The people building Indonesia's products, <span className="text-primary">indexed.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground sm:text-lg">
            A curated, claimable index of Indonesia's product builders — PMs, engineers, designers,
            dealmakers, educators, and founders, seeded from guests of the BroBri podcast. Browse by
            discipline and city, connect on LinkedIn.
          </p>
          <div className="mx-auto mt-9 max-w-2xl">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <div className="mt-6">
            <FilterChips
              discipline={discipline}
              onDiscipline={setDiscipline}
              tags={tags}
              onToggleTag={toggleTag}
              city={city}
              onCity={setCity}
              sort={sort}
              onSort={setSort}
            />
          </div>
        </section>

        {/* Grid */}
        <section className="container pb-20">
          <div className="mb-4 flex items-center justify-between">
            <p className="micro-label">
              {results.length} {results.length === 1 ? "builder" : "builders"}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="micro-label transition-colors hover:text-primary">
                Clear filters ✕
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <AnimatePresence mode="popLayout">
                {results.map((builder, i) => (
                  <BuilderCard key={builder.slug} builder={builder} index={i} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed py-20 text-center">
              <p className="text-lg font-medium">No one matches that — yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Know a builder who should be here?
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
                <Button asChild>
                  <a href={siteConfig.tallyListUrl} target="_blank" rel="noreferrer">
                    Nominate them
                  </a>
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 bg-card/40">
          <div className="container flex flex-col items-center gap-5 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Building product in Indonesia?
            </h2>
            <p className="max-w-md text-muted-foreground">
              Get listed for free, claim your profile, and make it easier for the ecosystem to find
              you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <a href={siteConfig.tallyListUrl} target="_blank" rel="noreferrer">
                  Get listed
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">How it works</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
