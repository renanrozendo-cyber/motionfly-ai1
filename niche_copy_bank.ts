// universal_flyer_system v1.0.0 · niche_copy_bank.ts
// Responsibility: A/B-testable copy variants for every niche, beyond the single defaults
// SAFE TO EDIT: All copy strings, add new variants
// DO NOT MODIFY: NicheType, CopyBank shape, NICHE_COPY_BANK key names, getRandomCopy signature

import type { NicheType } from "./niche_defaults.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CopyBank {
  headlines: string[];
  subheadlines: string[];
  cta_labels: string[];
  testimonials: Array<{ quote: string; author: string; rating: number }>;
}

// ─── Copy Bank ────────────────────────────────────────────────────────────────
// Rules applied to every entry:
//   headlines     ≤ 60 chars · active voice · no unsubstantiated superlatives
//   subheadlines  ≤ 100 chars
//   cta_labels    ≤ 30 chars · must start with Order/Book/Get/Call/Message/Enroll
//   testimonials  ≤ 120 chars per quote · real Indian names and cities

export const NICHE_COPY_BANK: Record<NicheType, CopyBank> = {

  // ── FOOD ──────────────────────────────────────────────────────────────────

  food: {
    headlines: [
      "Fresh Home Meals Delivered to Your Doorstep",
      "Skip the Kitchen. Eat Better Every Day.",
      "Pure Home Cooking. No Preservatives. Just Taste.",
    ],
    subheadlines: [
      "Hygienic kitchen. Fresh ingredients. WhatsApp to order now.",
      "Cooked with care, delivered on time — every single day.",
      "No preservatives. No compromise. Just like your mother made.",
    ],
    cta_labels: [
      "Order Now on WhatsApp",
      "Message Us for Today's Menu",
      "Get Your Tiffin Started",
    ],
    testimonials: [
      {
        quote:
          "Switched from restaurants. Never going back. Fresh, hygienic, and genuinely affordable.",
        author: "Meena R., Hyderabad",
        rating: 5,
      },
      {
        quote:
          "Lunch tiffin arrives hot at 1pm sharp every day. Genuinely surprised by the quality.",
        author: "Rohan D., Chennai",
        rating: 5,
      },
    ],
  },

  // ── BEAUTY ────────────────────────────────────────────────────────────────

  beauty: {
    headlines: [
      "Look Stunning. Feel Confident. Every Day.",
      "Salon-Quality Results Without Leaving Your City",
      "Skincare Treatments That Actually Deliver Results",
    ],
    subheadlines: [
      "Expert hands. Premium products. Slots available 7 days a week.",
      "Your skin deserves expert care — not guesswork. Book a slot today.",
      "Trained beauticians. Hospital-grade hygiene. Visible results in one session.",
    ],
    cta_labels: [
      "Book Your Slot on WhatsApp",
      "Get Your Bridal Quote Today",
      "Call to Check Availability",
    ],
    testimonials: [
      {
        quote:
          "Skin hasn't looked this clear in years. Professional, hygienic, and worth every rupee.",
        author: "Ananya P., Pune",
        rating: 5,
      },
      {
        quote:
          "Bridal package was thorough and results were stunning. Got so many compliments.",
        author: "Kavya N., Bangalore",
        rating: 5,
      },
    ],
  },

  // ── EDUCATION ─────────────────────────────────────────────────────────────

  education: {
    headlines: [
      "Your Child's Rank Goes Up. Guaranteed.",
      "From Struggling to Scoring 90+ in 90 Days",
      "Expert Coaching That Gets Students Into Top Colleges",
    ],
    subheadlines: [
      "Proven curriculum. Doubt-clearing sessions. Results parents talk about.",
      "Batches of 10 or fewer — every student gets individual attention.",
      "Board exams, entrance tests, or foundation — we cover them all.",
    ],
    cta_labels: [
      "Enroll for Free Demo Class",
      "Book a Trial Batch Today",
      "Get the Syllabus on WhatsApp",
    ],
    testimonials: [
      {
        quote:
          "Scored 94% in boards after joining here. Teachers are patient and explain very clearly.",
        author: "Parent of Class 10 Student, Nagpur",
        rating: 5,
      },
      {
        quote:
          "My daughter's confidence in Maths went from zero to 85 marks in just 6 weeks.",
        author: "Sunita B., Jaipur",
        rating: 5,
      },
    ],
  },

  // ── SERVICES ──────────────────────────────────────────────────────────────

  services: {
    headlines: [
      "Your Problem Fixed. Today. No Waiting.",
      "Trained Technicians at Your Doorstep in 60 Minutes",
      "Reliable Repairs Done Right the First Time",
    ],
    subheadlines: [
      "Call now, get a technician within the hour — available every day.",
      "Transparent pricing. No hidden charges. Work guaranteed in writing.",
      "Licensed team. Same-day slots. Satisfaction or we come back free.",
    ],
    cta_labels: [
      "Book a Technician Now",
      "Call to Schedule Your Visit",
      "Get a Free Quote on WhatsApp",
    ],
    testimonials: [
      {
        quote:
          "AC stopped at 8pm. Technician arrived by 9:30pm and fixed it same night. Impressed.",
        author: "Deepak M., Gurgaon",
        rating: 5,
      },
      {
        quote:
          "Gave me an exact price before starting. No surprises. Job done in under 2 hours.",
        author: "Nandini T., Pune",
        rating: 5,
      },
    ],
  },

  // ── LUXURY ────────────────────────────────────────────────────────────────

  luxury: {
    headlines: [
      "Where Craft Meets Connoisseurship.",
      "Investments in Beauty That Hold Their Value.",
      "Handcrafted for Discerning Collectors Across India.",
    ],
    subheadlines: [
      "Hand-finished. Limited to 50 units per design. Call for availability.",
      "For those who know the difference — private viewing by appointment.",
      "Sourced from the finest ateliers. Authenticated. Delivered discreetly.",
    ],
    cta_labels: [
      "Message for Private Viewing",
      "Book a Personal Consultation",
      "Get the Lookbook on WhatsApp",
    ],
    testimonials: [
      {
        quote:
          "Gifted one to my wife for our anniversary. The craftsmanship is genuinely museum-level.",
        author: "Vikram A., Chennai",
        rating: 5,
      },
      {
        quote:
          "Ordered a corporate gift set. Packaging, quality, and service were all exceptional.",
        author: "Ritu C., Ahmedabad",
        rating: 5,
      },
    ],
  },
};

// ─── A/B Accessor ─────────────────────────────────────────────────────────────

export function getRandomCopy(niche: NicheType, field: keyof CopyBank): string {
  const bank = NICHE_COPY_BANK[niche];

  if (field === "testimonials") {
    const items = bank.testimonials;
    return items[Math.floor(Math.random() * items.length)].quote;
  }

  const variants = bank[field] as string[];
  return variants[Math.floor(Math.random() * variants.length)];
}
