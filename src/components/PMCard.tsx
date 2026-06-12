import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import PMPhoto from "@/components/PMPhoto";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { PM } from "@/lib/pm";

interface PMCardProps {
  pm: PM;
  index: number;
}

const PMCard = ({ pm, index }: PMCardProps) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.4), ease: "easeOut" }}
  >
    <Link
      to={`/s/${pm.slug}`}
      className="card-glow group block h-full overflow-hidden rounded-xl border bg-card transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <PMPhoto
          pm={pm}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {pm.claimed && (
          <div className="absolute right-2.5 top-2.5">
            <VerifiedBadge compact />
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary">
          {pm.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {pm.role} · <span className="text-foreground/80">{pm.company}</span>
        </p>
        <div className="micro-label">
          {pm.city} · {pm.experience}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pm.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-md px-1.5 font-mono text-[10px] font-medium uppercase tracking-wide"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  </motion.article>
);

export default PMCard;
