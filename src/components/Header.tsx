import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/pm";

const Header = () => (
  <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
    <div className="container flex h-16 items-center justify-between">
      <Link to="/" className="font-mono text-lg font-bold tracking-tight">
        productbro<span className="text-primary">_</span>
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/about">About</Link>
        </Button>
        <Button size="sm" asChild>
          <a href={siteConfig.tallyListUrl} target="_blank" rel="noreferrer">
            Get listed
          </a>
        </Button>
      </nav>
    </div>
  </header>
);

export default Header;
