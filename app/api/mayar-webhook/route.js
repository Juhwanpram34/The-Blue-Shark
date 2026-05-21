import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Map Mayar product names to Blue Shark plan IDs
function detectBluesharkPlan(productName) {
  const name = (productName || "").toLowerCase();
  if (name.includes("business") || name.includes("bisnis")) return "business";
  if (name.includes("pro")) return "pro";
  if (name.includes("student") || name.includes("siswa") || name.includes("pelajar")) return "student";
  return null;
}

// Check if payment is for LegalAI.Pro
function isLegalAI(productName) {
  const name = (productName || "").toLowerCase();
  return name.includes("legalai") || name.includes("legal ai") || name.includes("legalaipro");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const event = body.event || body.type || "";
    const data = body.data || body;

    const email = data?.email || data?.customer?.email || data?.customerEmail || "";
    const productName = data?.productName || data?.product?.name || data?.item?.name || "";

    console.log("Mayar webhook:", JSON.stringify({ event, email, productName }));

    if (!email) {
      return NextResponse.json({ received: true, skipped: "no email" });
    }

    // ─── Forward LegalAI.Pro payments ───
    if (isLegalAI(productName)) {
      try {
        const res = await fetch("https://ai-business-sigma-gray.vercel.app/api/webhook/mayar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        console.log("Forwarded to LegalAI:", res.status);
      } catch (err) {
        console.error("Forward to LegalAI failed:", err);
      }
      return NextResponse.json({ success: true, forwarded: "legalai" });
    }

    // ─── Handle Blue Shark payments ───
    const plan = detectBluesharkPlan(productName);
    if (!plan) {
      console.log("Unknown product:", productName);
      return NextResponse.json({ received: true, skipped: "unknown product" });
    }

    // Find user by email in profiles
    const { data: profile, error: findError } = await supabase
      .from("profiles")
      .select("id, plan")
      .eq("email", email)
      .single();

    if (findError || !profile) {
      console.error("User not found:", email);
      return NextResponse.json({ error: "User not found", email }, { status: 404 });
    }

    // Update plan
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Update plan failed:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    console.log(`Upgraded ${email} to ${plan}`);
    return NextResponse.json({ success: true, email, plan });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Blue Shark webhook active" });
}
