"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  MessageCircle,
  Phone,
  MapPin,
  Star,
  Shield,
  Check,
  Copy,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NICHE_DEFAULTS, SHARED_FALLBACKS, getDefaults } from "@/core/niche_defaults.config";
import { NICHE_THEMES } from "@/core/niche_themes.config";

// ─────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────

interface FlyerData {
  logo?: string;
  business_name: string;
  headline?: string;
  subheadline?: string;
  hero_image?: string;
  trust_badge_1?: string;
  trust_badge_2?: string;
  trust_badge_3?: string;
  testimonial_quote?: string;
  testimonial_author?: string;
  testimonial_rating?: number;
  offer_1?: string;
  offer_1_desc?: string;
  offer_1_price?: string;
  offer_2?: string;
  offer_2_desc?: string;
  offer_2_price?: string;
  offer_3?: string;
  offer_3_desc?: string;
  offer_3_price?: string;
  promo_offer?: string;
  promo_expiry?: string;
  promo_code?: string;
  cta_label?: string;
  whatsapp_number: string;
  phone_number?: string;
  location?: string;
  maps_link?: string;
}

interface FlyerConfig {
  niche: "food" | "beauty" | "education" | "services" | "luxury";
  data?: Partial<FlyerData>;
}

// ─────────────────────────────────────────────────────
// ANIMATION CONFIG
// ─────────────────────────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// ─────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────

function stripNonDigits(str: string): string {
  return str.replace(/\D/g, "");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─────────────────────────────────────────────────────
// A — ATTENTION SECTION
// ─────────────────────────────────────────────────────

function AttentionSection({
  data,
  niche,
}: {
  data: FlyerData;
  niche: FlyerConfig["niche"];
}) {
  return (
    <motion.section
      variants={fadeUp}
      className="relative min-h-[60vh] w-full overflow-hidden"
    >
      {/* Hero Image */}
      <div className="absolute inset-0">
        <img
          src={data.hero_image}
          alt={`${data.business_name} — ${niche} flyer`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex min-h-[60vh] flex-col justify-between p-6">
        {/* Top Row: Business Name & Logo */}
        <div className="flex items-start justify-between">
          <h1
            className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.business_name}
          </h1>
          {data.logo ? (
            <img
              src={data.logo}
              alt={`${data.business_name} logo`}
              className="h-12 w-12 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold shadow-lg"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-text-primary)",
              }}
            >
              {getInitials(data.business_name)}
            </div>
          )}
        </div>

        {/* Bottom: Headline & Subheadline */}
        <div className="mt-auto">
          <h2
            className="text-balance text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.headline}
          </h2>
          <p className="mt-2 text-lg text-white/90 drop-shadow-md">
            {data.subheadline}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────
// C — CREDIBILITY SECTION
// ─────────────────────────────────────────────────────

function CredibilitySection({ data }: { data: FlyerData }) {
  const badges = [
    { icon: Shield, label: data.trust_badge_1 },
    { icon: Star, label: data.trust_badge_2 },
    { icon: Check, label: data.trust_badge_3 },
  ].filter((b) => b.label);

  return (
    <motion.section
      variants={fadeUp}
      className="px-4 py-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {badges.map((badge, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              borderRadius: "var(--radius-brand)",
            }}
          >
            <badge.icon className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
            <span>{badge.label}</span>
          </Badge>
        ))}
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────
// T — TRUST SECTION
// ─────────────────────────────────────────────────────

function TrustSection({ data }: { data: FlyerData }) {
  const rating = data.testimonial_rating || 5;

  return (
    <motion.section
      variants={fadeUp}
      className="px-4 py-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Card
        className="border-0 shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderLeft: "4px solid var(--color-accent)",
          borderRadius: "var(--radius-brand)",
        }}
      >
        <CardContent className="p-4">
          <p
            className="text-pretty text-base italic leading-relaxed"
            style={{ color: "var(--color-text-primary)" }}
          >
            &ldquo;{data.testimonial_quote}&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={data.testimonial_author} />
              <AvatarFallback
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-text-primary)",
                }}
              >
                {getInitials(data.testimonial_author || "User")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {data.testimonial_author}
              </p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    style={{
                      color: "var(--color-accent)",
                      fill: i < rating ? "var(--color-accent)" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────
// I — INFORMATION SECTION
// ─────────────────────────────────────────────────────

function InformationSection({ data }: { data: FlyerData }) {
  const offers = [
    { name: data.offer_1, desc: data.offer_1_desc, price: data.offer_1_price },
    { name: data.offer_2, desc: data.offer_2_desc, price: data.offer_2_price },
    { name: data.offer_3, desc: data.offer_3_desc, price: data.offer_3_price },
  ].filter((o) => o.name);

  return (
    <motion.section
      variants={fadeUp}
      className="px-4 py-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {offers.map((offer, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm"
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-brand)",
            }}
          >
            <CardContent className="p-4">
              <h3
                className="text-lg font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {offer.name}
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                {offer.desc}
              </p>
              <p
                className="mt-3 text-xl font-bold"
                style={{ color: "var(--color-accent)" }}
              >
                {offer.price}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────
// O — OFFER SECTION
// ─────────────────────────────────────────────────────

function OfferSection({ data }: { data: FlyerData }) {
  const [copied, setCopied] = useState(false);
  
  // Render null when all promo fields are absent
  if (!data.promo_offer && !data.promo_expiry && !data.promo_code) {
    return null;
  }

  const handleCopyCode = async () => {
    if (data.promo_code) {
      await navigator.clipboard.writeText(data.promo_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.section
      variants={fadeUp}
      className="px-4 py-6"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="text-center">
        {data.promo_offer && (
          <h3
            className="text-xl font-bold sm:text-2xl"
            style={{ color: "var(--color-accent)" }}
          >
            {data.promo_offer}
          </h3>
        )}
        {data.promo_code && (
          <button
            onClick={handleCopyCode}
            className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-primary)",
            }}
          >
            {data.promo_code}
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
        {data.promo_expiry && (
          <p
            className="mt-3 flex items-center justify-center gap-1.5 text-sm"
            style={{ color: "var(--color-text-on-primary)" }}
          >
            <Clock className="h-4 w-4" />
            {data.promo_expiry}
          </p>
        )}
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────
// N — NEXT STEP SECTION (Sticky CTA)
// ─────────────────────────────────────────────────────

function NextStepSection({ data }: { data: FlyerData }) {
  const whatsappDigits = stripNonDigits(data.whatsapp_number);
  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    "Hi! I saw your flyer"
  )}`;

  return (
    <motion.section
      variants={fadeUp}
      className="sticky bottom-0 z-50 px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* WhatsApp Button */}
      <Button
        asChild
        className="h-14 w-full text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          backgroundColor: "#25D366",
          color: "#FFFFFF",
          borderRadius: "var(--radius-brand)",
        }}
      >
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-5 w-5" />
          {data.cta_label}
        </a>
      </Button>

      {/* Phone & Location Row */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
        {data.phone_number && (
          <a
            href={`tel:${stripNonDigits(data.phone_number)}`}
            className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--color-text-primary)" }}
          >
            <Phone className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
            {data.phone_number}
          </a>
        )}
        {data.location && (
          <a
            href={
              data.maps_link ||
              `https://www.google.com/maps/search/${encodeURIComponent(data.location)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--color-text-primary)" }}
          >
            <MapPin className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
            {data.location}
          </a>
        )}
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────

export default function UniversalFlyer({ niche, data = {} }: FlyerConfig) {
  // Merge user data with niche defaults
  const defaults = NICHE_DEFAULTS[niche];
  const mergedData: FlyerData = {
    ...defaults,
    ...SHARED_FALLBACKS,
    ...data,
  };

  // Apply theme CSS variables
  useEffect(() => {
    const theme = NICHE_THEMES[niche];
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      Object.keys(theme).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [niche]);

  return (
    <div
      className="mx-auto min-h-screen w-full max-w-[1080px] overflow-x-hidden pb-24"
      style={{
        backgroundColor: "var(--color-bg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col"
      >
        {/* A — Attention */}
        <AttentionSection data={mergedData} niche={niche} />

        {/* C — Credibility */}
        <CredibilitySection data={mergedData} />

        {/* T — Trust */}
        <TrustSection data={mergedData} />

        {/* I — Information */}
        <InformationSection data={mergedData} />

        {/* O — Offer */}
        <OfferSection data={mergedData} />

        {/* N — Next Step (Sticky) */}
        <NextStepSection data={mergedData} />
      </motion.div>
    </div>
  );
}
