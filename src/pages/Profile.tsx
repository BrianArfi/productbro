import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Linkedin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuilderPhoto from "@/components/BuilderPhoto";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISCIPLINE_LABEL, findBuilder, siteConfig } from "@/lib/builders";
import NotFound from "./NotFound";

const Profile = () => {
  const { slug } = useParams();
  const builder = findBuilder(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (builder) {
      document.title = `${builder.name} — ${builder.role} at ${builder.company} | ${siteConfig.name}`;
    }
  }, [builder]);

  if (!builder) return <NotFound />;

  const claimUrl = `${siteConfig.tallyClaimUrl}?slug=${builder.slug}`;
  const firstName = builder.name.split(" ")[0];

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
              <BuilderPhoto builder={builder} className="aspect-[4/5] w-full object-cover" />
            </div>
            {builder.linkedin && (
              <Button className="w-full" asChild>
                <a href={builder.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin /> Connect on LinkedIn
                </a>
              </Button>
            )}
            {builder.claimed ? (
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
                    href={`mailto:${siteConfig.contactEmail}?subject=Update/remove profile: ${builder.slug}`}
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
            <p className="micro-label !text-primary">{DISCIPLINE_LABEL[builder.discipline]}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{builder.name}</h1>
              {builder.claimed && <VerifiedBadge />}
            </div>
            <p className="mt-2 text-lg text-muted-foreground">
              {builder.role} at <span className="font-medium text-foreground">{builder.company}</span>
            </p>
            <p className="micro-label mt-3">
              {builder.city} · {builder.experience} · {builder.focus}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {builder.tags.map((tag) => (
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
              {builder.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {builder.showcase && builder.showcase.length > 0 && (
              <section className="mt-10">
                <h2 className="micro-label !text-primary">Showcase</h2>
                <div className="mt-4 space-y-3">
                  {builder.showcase.map((item, i) => (
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
