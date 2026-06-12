import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/pm";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `About | ${siteConfig.name}`;
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container max-w-2xl flex-1 py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About {siteConfig.name}</h1>

        <div className="mt-8 space-y-10">
          <section>
            <h2 className="micro-label !text-primary">What is this?</h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              {siteConfig.name} is a curated public index of Indonesia's product managers — the
              people shipping the products you use every day. It exists to make great product
              talent visible: to peers, to communities, and to anyone building in Indonesia. Being
              listed is free, and always will be.
            </p>
          </section>

          <section>
            <h2 className="micro-label !text-primary">Where the data comes from</h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              Profiles are curated by hand from publicly available professional information:
              LinkedIn profiles, conference talks, podcasts, and published writing. We only list
              professional facts — name, role, company, city, and specialties — and we never
              publish private contact details like emails or phone numbers.
            </p>
          </section>

          <section>
            <h2 className="micro-label !text-primary">Claim your profile</h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              If you're listed, the profile is yours. Claiming it gets you a verified badge, and
              lets you correct your info, choose your own photo, and add a showcase of products
              you've shipped.
            </p>
            <Button className="mt-4" asChild>
              <a href={siteConfig.tallyClaimUrl} target="_blank" rel="noreferrer">
                Claim your profile
              </a>
            </Button>
          </section>

          <section>
            <h2 className="micro-label !text-primary">Updates & removal</h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              Want something corrected, or prefer not to be listed at all? No questions asked —
              email{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary underline-offset-4 hover:underline">
                {siteConfig.contactEmail}
              </a>{" "}
              and we'll process your request within 48 hours.
            </p>
          </section>

          <section>
            <h2 className="micro-label !text-primary">Get listed</h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              Are you a PM in Indonesia, or do you know one who belongs here? Nominations are
              reviewed by hand to keep the index high-signal.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <a href={siteConfig.tallyListUrl} target="_blank" rel="noreferrer">
                Nominate yourself or a friend
              </a>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
