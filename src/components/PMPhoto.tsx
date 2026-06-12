import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PM } from "@/lib/pm";

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
      className={cn("flex items-center justify-center", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 30% 24%), hsl(${(hue + 50) % 360} 35% 12%))`,
      }}
      aria-hidden
    >
      <span className="font-mono text-3xl font-bold text-foreground/80">{initials}</span>
    </div>
  );
};

const PMPhoto = ({ pm, className }: { pm: PM; className?: string }) => {
  const [failed, setFailed] = useState(false);

  if (!pm.photo || failed) {
    return <Monogram name={pm.name} className={className} />;
  }

  return (
    <img
      src={pm.photo}
      alt={`${pm.name}, ${pm.role} at ${pm.company}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export default PMPhoto;
