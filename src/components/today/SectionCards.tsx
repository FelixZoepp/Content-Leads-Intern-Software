import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import cardMarketing from "@/assets/card-marketing.jpg";
import cardSales from "@/assets/card-sales.jpg";
import cardOverview from "@/assets/card-overview.jpg";
import cardFinance from "@/assets/card-finance.jpg";
import cardFulfillment from "@/assets/card-fulfillment.jpg";
import cardAi from "@/assets/card-ai.jpg";
import cardCsat from "@/assets/card-csat.jpg";
import cardReports from "@/assets/card-reports.jpg";

interface SectionCard {
  badge: string;
  badgeColor: string;
  title: string;
  path: string;
  image: string;
}

const sectionCards: SectionCard[] = [
  { badge: "KPIs", badgeColor: "hsl(0 85% 55%)", title: "Übersicht & KPIs", path: "/dashboard/overview", image: cardOverview },
  { badge: "Marketing", badgeColor: "hsl(25 90% 55%)", title: "Reichweite & Content tracken", path: "/dashboard/marketing", image: cardMarketing },
  { badge: "Sales", badgeColor: "hsl(0 70% 50%)", title: "Pipeline & Deals verfolgen", path: "/dashboard/sales", image: cardSales },
  { badge: "Fulfillment", badgeColor: "hsl(15 80% 50%)", title: "Projekte & Kundenerfolg", path: "/dashboard/fulfillment", image: cardFulfillment },
  { badge: "Finanzen", badgeColor: "hsl(38 92% 55%)", title: "Revenue & Kosten im Blick", path: "/dashboard/finance", image: cardFinance },
  { badge: "KI-Briefing", badgeColor: "hsl(0 85% 55%)", title: "Intelligente Analyse & Insights", path: "/dashboard/ai", image: cardAi },
  { badge: "Leistungsanalyse", badgeColor: "hsl(10 75% 52%)", title: "Kundenzufriedenheit messen", path: "/dashboard/csat", image: cardCsat },
  { badge: "Reports", badgeColor: "hsl(25 90% 55%)", title: "Monatsberichte & Export", path: "/dashboard/reports", image: cardReports },
];

export function SectionCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sectionCards.map((card, i) => (
        <motion.button
          key={card.path}
          onClick={() => navigate(card.path)}
          className="relative rounded-2xl overflow-hidden text-left group cursor-pointer border border-white/[0.08] bg-white/[0.03]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `0 0 40px -8px ${card.badgeColor}44, inset 0 0 30px -15px ${card.badgeColor}22`,
            }}
          />
          {/* Top border shimmer */}
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t-2xl opacity-50"
            style={{ background: `linear-gradient(90deg, transparent, ${card.badgeColor}66, transparent)` }}
          />

          <div className="relative z-10 p-5 flex flex-col h-full min-h-[260px]">
            {/* Badge */}
            <span
              className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full w-fit mb-3"
              style={{
                color: card.badgeColor,
                background: `${card.badgeColor}18`,
                border: `1px solid ${card.badgeColor}33`,
              }}
            >
              {card.badge}
            </span>

            {/* Title */}
            <h3 className="text-base font-bold text-foreground leading-snug mb-4">
              {card.title}
            </h3>

            {/* Preview Image */}
            <div className="mt-auto rounded-xl overflow-hidden opacity-70 group-hover:opacity-90 transition-opacity duration-300">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-28 object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
