import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="font-mono text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">This profile isn't in the index</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          The page you're looking for doesn't exist — or hasn't been curated yet.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/">Back to the index</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
