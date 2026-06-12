import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Linkedin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PMPhoto from "@/components/PMPhoto";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findPM, siteConfig } from "@/lib/pm";
import NotFound from "./NotFound";

const Profile = () => {
  const { slug } = useParams();
  const pm = findPM(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (pm) {
      document.title = `${pm.name} — ${pm.role} at ${pm.company} | ${siteConfig.name}`;
    }
  }, [pm]);

  if (!pm) return <NotFound />;

  const claimUrl = `${siteConfig.tallyClaimUrl}?slug=${pm.slug}`;
  const firstName = pm.name.split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container max-w-5xl flex-1 py-10">
        <Link
          to="/"
          className="micro-label inline-flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to index
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-[300px,1fr]">
          {/* Left column */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border bg-card">
              <PMPhoto pm={pm} className="aspect-[4/5] w-full object-cover" />
            </div>
            <Button className="w-full" asChild>
              <a href={pm.linkedin} target="_blank" rel="noreferrer">
                <Linkedin /> Connect on LinkedIn
              </a>
            </Button>
            {pm.claimed ? (
              <p className="text-center text-sm text-muted-foreground">
                ✓ Claimed and maintained by {firstName}.
              </p>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-center">
                <p className="text-sm font-medium">Is this you?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Claim this profile to verify it, update your info, and add your own photo.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={claimUrl} target="_blank" rel="noreferrer">
                      Claim profile
                    </a>
                  </Button>
                  <a
                    href={`mailto:${siteConfig.contactEmail}?subject=Update/remove profile: ${pm.slug}`}
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Request an update or removal
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <article>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{pm.name}</h1>
              {pm.claimed && <VerifiedBadge />}
            </div>
            <p className="mt-2 text-lg text-muted-foreground">
              {pm.role} at <span className="font-medium text-foreground">{pm.company}</span>
            </p>
            <p className="micro-label mt-3">
              {pm.city} · {pm.experience} · {pm.focus}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {pm.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-md font-mono text-[11px] font-medium uppercase tracking-wide"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-8 space-y-4 leading-relaxed text-foreground/90">
              {pm.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {pm.showcase && pm.showcase.length > 0 && (
              <section className="mt-10">
                <h2 className="micro-label !text-primary">Showcase</h2>
                <div className="mt-4 space-y-3">
                  {pm.showcase.map((item, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5">
                      <h3 className="font-semibold leading-snug">{item.title}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                        >
                          View <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
