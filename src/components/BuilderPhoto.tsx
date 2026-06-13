import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Builder } from "@/lib/builders";

/** Deterministic gradient monogram used when a profile has no (working) photo. */
const Monogram = ({ name, className }: { name: string; className?: string }) => {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(125% 125% at 25% 15%, hsl(${hue} 42% 23%) 0%, hsl(${(hue + 45) % 360} 55% 8%) 100%)`,
      }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-60"
        style={{
          background: `radial-gradient(55% 45% at 75% 95%, hsl(${(hue + 25) % 360} 65% 35% / 0.45), transparent 70%)`,
        }}
      />
      <span className="relative select-none font-mono text-4xl font-bold tracking-tight text-white/85 drop-shadow">
        {initials}
      </span>
    </div>
  );
};

const BuilderPhoto = ({ builder, className }: { builder: Builder; className?: string }) => {
  const [failed, setFailed] = useState(false);

  if (!builder.photo || failed) {
    return <Monogram name={builder.name} className={className} />;
  }

  return (
    <img
      src={builder.photo}
      alt={`${builder.name}, ${builder.role} at ${builder.company}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export default BuilderPhoto;
