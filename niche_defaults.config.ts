// universal_flyer_system v1.0.0 · niche_defaults.config.ts
// Responsibility: Authoritative source of niche defaults and the FlyerData type
// SAFE TO EDIT: Default text values, hero_image URLs, promo codes, pricing strings
// DO NOT MODIFY: Field names, NicheType union, FlyerData interface shape, export signatures
// Claude Code: see docs/CLAUDE_CODE_README.md

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type NicheType = "food" | "beauty" | "education" | "services" | "luxury";

export interface FlyerData {
  logo: string;
  business_name: string;
  headline: string;
  subheadline: string;
  hero_image: string;
  trust_badge_1: string;
  trust_badge_2: string;
  trust_badge_3: string;
  testimonial_quote: string;
  testimonial_author: string;
  testimonial_rating: number;
  offer_1: string;
  offer_1_desc: string;
  offer_1_price: string;
  offer_2: string;
  offer_2_desc: string;
  offer_2_price: string;
  offer_3: string;
  offer_3_desc: string;
  offer_3_price: string;
  promo_offer: string;
  promo_expiry: string;
  promo_code: string;
  cta_label: string;
  whatsapp_number: string;
  phone_number: string;
  location: string;
  maps_link: string;
}

// ─────────────────────────────────────────────────────
// NICHE DEFAULTS
// ─────────────────────────────────────────────────────

export const NICHE_DEFAULTS: Record<NicheType, FlyerData> = {

  food: {
    logo: "",
    business_name: "Your Business Name",
    headline: "Homemade Food That Tastes Like Love",
    subheadline: "Fresh. Hygienic. Delivered to your door.",
    hero_image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80",
    trust_badge_1: "Made Fresh Daily",
    trust_badge_2: "Home Delivery",
    trust_badge_3: "Order via WhatsApp",
    testimonial_quote: "Tastes exactly like mom's cooking. I order every week!",
    testimonial_author: "Priya S., Mumbai",
    testimonial_rating: 5,
    offer_1: "Family Meal Box",
    offer_1_desc: "Serves 4. Freshly cooked.",
    offer_1_price: "₹350",
    offer_2: "Tiffin Service",
    offer_2_desc: "Daily lunch or dinner.",
    offer_2_price: "₹2,500/mo",
    offer_3: "Party Orders",
    offer_3_desc: "Bulk orders for events.",
    offer_3_price: "Call for pricing",
    promo_offer: "First Order 20% Off",
    promo_expiry: "2025-12-31",
    promo_code: "WELCOME20",
    cta_label: "Order Fresh Food on WhatsApp",
    whatsapp_number: "+919999999999",
    phone_number: "",
    location: "",
    maps_link: "",
  },

  beauty: {
    logo: "",
    business_name: "Your Business Name",
    headline: "Glow Up with Every Treatment",
    subheadline: "Professional care. Hygienic setup. Results you'll love.",
    hero_image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&q=80",
    trust_badge_1: "Certified Professionals",
    trust_badge_2: "Hygienic Setup",
    trust_badge_3: "By Appointment Only",
    testimonial_quote: "Best beauty experience. Made me feel like a queen!",
    testimonial_author: "Ria M., Delhi",
    testimonial_rating: 5,
    offer_1: "Facial & Cleanup",
    offer_1_desc: "Deep cleanse, brightening.",
    offer_1_price: "₹999",
    offer_2: "Bridal Package",
    offer_2_desc: "Full bridal makeover.",
    offer_2_price: "₹4,999",
    offer_3: "Mehendi Design",
    offer_3_desc: "Traditional & modern patterns.",
    offer_3_price: "₹799",
    promo_offer: "10% Off First Visit",
    promo_expiry: "2025-12-31",
    promo_code: "BEAUTY10",
    cta_label: "Book Your Session on WhatsApp",
    whatsapp_number: "+919999999999",
    phone_number: "",
    location: "",
    maps_link: "",
  },

  education: {
    logo: "",
    business_name: "Your Business Name",
    headline: "Excel in Your Exams with Expert Guidance",
    subheadline: "Small batches. Experienced faculty. Proven results.",
    hero_image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1080&q=80",
    trust_badge_1: "Experienced Faculty",
    trust_badge_2: "Small Batches",
    trust_badge_3: "Results Guaranteed",
    testimonial_quote: "Child's grades improved dramatically in 2 months!",
    testimonial_author: "Parent, Pune",
    testimonial_rating: 5,
    offer_1: "Foundation Batch",
    offer_1_desc: "Core concepts, weekly tests.",
    offer_1_price: "₹1,500/mo",
    offer_2: "Crash Course",
    offer_2_desc: "Exam-ready in 30 days.",
    offer_2_price: "₹2,500",
    offer_3: "1-on-1 Sessions",
    offer_3_desc: "Personalised attention.",
    offer_3_price: "₹500/hr",
    promo_offer: "Free Demo Class",
    promo_expiry: "Limited seats available",
    promo_code: "LEARN2024",
    cta_label: "Enroll via WhatsApp",
    whatsapp_number: "+919999999999",
    phone_number: "",
    location: "",
    maps_link: "",
  },

  services: {
    logo: "",
    business_name: "Your Business Name",
    headline: "Fast. Reliable. Done Right.",
    subheadline: "Licensed technicians. Same-day service. Guaranteed.",
    hero_image:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1080&q=80",
    trust_badge_1: "Licensed Technicians",
    trust_badge_2: "Same Day Service",
    trust_badge_3: "100% Guaranteed",
    testimonial_quote: "On time, fixed everything in one visit.",
    testimonial_author: "Suresh K., Bangalore",
    testimonial_rating: 5,
    offer_1: "Home Visit",
    offer_1_desc: "Diagnosis + minor fix included.",
    offer_1_price: "₹299",
    offer_2: "Annual Maintenance",
    offer_2_desc: "Full system service plan.",
    offer_2_price: "₹2,999",
    offer_3: "Emergency Fix",
    offer_3_desc: "Available 7 days a week.",
    offer_3_price: "₹499",
    promo_offer: "Free Inspection Today",
    promo_expiry: "This week only",
    promo_code: "FIXNOW",
    cta_label: "Book a Service Call on WhatsApp",
    whatsapp_number: "+919999999999",
    phone_number: "",
    location: "",
    maps_link: "",
  },

  luxury: {
    logo: "",
    business_name: "Your Business Name",
    headline: "Crafted for Those Who Demand the Best.",
    subheadline: "Exclusive collection. Premium materials. Custom orders welcome.",
    hero_image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&q=80",
    trust_badge_1: "Exclusive Collection",
    trust_badge_2: "Premium Materials",
    trust_badge_3: "Custom Orders",
    testimonial_quote: "Exquisite quality. Worth every rupee.",
    testimonial_author: "Arjun V., Mumbai",
    testimonial_rating: 5,
    offer_1: "Signature Piece",
    offer_1_desc: "Bespoke craftsmanship.",
    offer_1_price: "₹25,000+",
    offer_2: "Corporate Gifting",
    offer_2_desc: "Curated gift sets.",
    offer_2_price: "₹5,000+",
    offer_3: "Private Consultation",
    offer_3_desc: "By appointment only.",
    offer_3_price: "Complimentary",
    promo_offer: "Complimentary Gift Wrapping",
    promo_expiry: "For orders above ₹10,000",
    promo_code: "LUXE2024",
    cta_label: "WhatsApp for Private Viewing",
    whatsapp_number: "+919999999999",
    phone_number: "",
    location: "",
    maps_link: "",
  },
};

// ─────────────────────────────────────────────────────
// SHARED FALLBACKS
// ─────────────────────────────────────────────────────

export const SHARED_FALLBACKS = {
  business_name: "Your Business Name",
  whatsapp_number: "+919999999999",
};

// ─────────────────────────────────────────────────────
// ACCESSOR
// ─────────────────────────────────────────────────────

export function getDefaults(niche: NicheType): FlyerData {
  return { ...NICHE_DEFAULTS[niche] };
}
