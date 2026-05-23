"use client";

import { useState } from "react";
import UniversalFlyer from "@/components/universal-flyer";

type TestScenario = "services" | "luxury-no-data" | "no-promo" | "whatsapp-format";

export default function Page() {
  const [scenario, setScenario] = useState<TestScenario>("services");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg, #f5f5f5)" }}>
      {/* Test Controls - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-black/90 text-white p-3 text-xs">
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <span className="font-bold">TEST:</span>
          <button
            onClick={() => setScenario("services")}
            className={`px-3 py-1.5 rounded ${scenario === "services" ? "bg-orange-500" : "bg-gray-700"}`}
          >
            1. Services Theme
          </button>
          <button
            onClick={() => setScenario("luxury-no-data")}
            className={`px-3 py-1.5 rounded ${scenario === "luxury-no-data" ? "bg-amber-500" : "bg-gray-700"}`}
          >
            2. Luxury (no data)
          </button>
          <button
            onClick={() => setScenario("no-promo")}
            className={`px-3 py-1.5 rounded ${scenario === "no-promo" ? "bg-blue-500" : "bg-gray-700"}`}
          >
            3. No Promo Fields
          </button>
          <button
            onClick={() => setScenario("whatsapp-format")}
            className={`px-3 py-1.5 rounded ${scenario === "whatsapp-format" ? "bg-green-500" : "bg-gray-700"}`}
          >
            4. WhatsApp Format
          </button>
        </div>
        <p className="text-center mt-2 text-gray-300">
          {scenario === "services" && "CHECK: Theme colors should be dark (#1A1A2E primary, #FF6B35 accent)"}
          {scenario === "luxury-no-data" && "CHECK: Offer cards show names + descriptions + prices from defaults"}
          {scenario === "no-promo" && "CHECK: Gold promo strip should be COMPLETELY GONE"}
          {scenario === "whatsapp-format" && "CHECK: WhatsApp URL should be wa.me/919876543210 (no spaces/dashes)"}
        </p>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-24" />

      {/* Test Scenarios */}
      {scenario === "services" && (
        <UniversalFlyer
          niche="services"
          data={{
            business_name: "QuickFix Home Services",
            whatsapp_number: "+91 98765 43210",
          }}
        />
      )}

      {scenario === "luxury-no-data" && (
        <UniversalFlyer
          niche="luxury"
          data={{
            business_name: "Maison Élégance",
            whatsapp_number: "+91 98765 43210",
          }}
        />
      )}

      {scenario === "no-promo" && (
        <UniversalFlyer
          niche="food"
          data={{
            business_name: "Test Restaurant",
            whatsapp_number: "+91 98765 43210",
            // Explicitly setting promo fields to empty/undefined
            promo_offer: "",
            promo_code: "",
            promo_expiry: "",
          }}
        />
      )}

      {scenario === "whatsapp-format" && (
        <UniversalFlyer
          niche="food"
          data={{
            business_name: "Number Test",
            whatsapp_number: "+91 98765-43210", // With spaces and dashes
          }}
        />
      )}
    </div>
  );
}
