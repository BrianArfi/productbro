import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/pm";

const Footer = () => (
  <footer className="border-t border-border/60">
    <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="font-mono text-base font-bold">
          productbro<span className="text-primary">_</span>
        </div>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{siteConfig.tagline}</p>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground">
          About & data sources
        </Link>
        <a href={siteConfig.tallyClaimUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
          Claim your profile
        </a>
        <a href={siteConfig.tallyListUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
          Get listed
        </a>
        <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-foreground">
          {siteConfig.contactEmail}
        </a>
      </div>
    </div>
    <div className="border-t border-border/60">
      <div className="container py-4 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name} · Made in Indonesia 🇮🇩
      </div>
    </div>
  </footer>
);

export default Footer;
