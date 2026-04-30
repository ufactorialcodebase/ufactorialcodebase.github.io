import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DataTable from "../components/DataTable";

function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-4xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-50">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to HridAI
            </Link>
            <Link to="/privacy" className="text-sm text-white/60 hover:text-white transition">
              Privacy Policy
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/40">
          <span>Effective Date: April 29, 2026</span>
          <span>Last Updated: April 29, 2026</span>
        </div>
        <div className="mt-2 text-sm text-white/40">
          Company: uFactorial LLC, a New Jersey limited liability company (ufactorial.com) &middot; Product: HridAI
        </div>

        <hr className="my-10 border-white/10" />

        {/* Agreement Overview */}
        <section>
          <h2 className="text-2xl font-bold">Agreement Overview</h2>
          <p className="mt-4 text-white/60 leading-7">
            These Terms of Service ("<strong className="text-white">Terms</strong>") govern your use of HridAI, a personal intelligence application operated by uFactorial LLC ("<strong className="text-white">we</strong>," "<strong className="text-white">us</strong>," "<strong className="text-white">our</strong>"). By creating an account or using HridAI, you agree to these Terms.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            If you don't agree, don't use HridAI. (We mean that respectfully — we just want to be clear.)
          </p>
          <p className="mt-4 text-white/60 leading-7">
            These Terms incorporate by reference our <Link to="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>, which describes how we handle your personal data and is part of the agreement between you and us.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 1. Definitions */}
        <section>
          <h2 className="text-2xl font-bold">1. Definitions</h2>
          <p className="mt-4 text-white/60 leading-7">To make these Terms easier to follow:</p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">"HridAI"</strong> or <strong className="text-white">"the Service"</strong> means the HridAI application, website, and related services operated by uFactorial.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">"You"</strong> or <strong className="text-white">"User"</strong> means the individual person who creates an account and uses the Service.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">"User Content"</strong> means anything you submit to HridAI — your messages, the people and topics you mention, todos, lists, edits you make to the Vault, and any other text or data you provide.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">"Output"</strong> means anything HridAI generates in response to your User Content, including AI-generated text, summaries, extracted entities, relationships, episodes, and other inferences.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">"AI Providers"</strong> means the third-party providers of large language models and embedding models that we use to power HridAI (currently Anthropic and OpenAI; subject to change with notice as described in the Privacy Policy).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">"Vault"</strong> means the in-product interface where you can view, edit, and delete the structured data HridAI has built about you.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 2. What HridAI Is (and Isn't) */}
        <section>
          <h2 className="text-2xl font-bold">2. What HridAI Is (and Isn't)</h2>
          <p className="mt-4 text-white/60 leading-7">
            HridAI is an AI-powered personal intelligence tool. You talk to it, and it learns about you — your goals,
            relationships, interests, concerns, and the threads of your life. It builds a structured knowledge graph
            that helps you reflect, remember, and organize your thinking.
          </p>

          <p className="mt-6 font-semibold text-white">HridAI is:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">+</span> <span>A personal tool for self-reflection and organization</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">+</span> <span>An AI that remembers your context across conversations</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">+</span> <span>A way to visualize and explore what you've shared</span></li>
          </ul>

          <p className="mt-6 font-semibold text-white">HridAI is <strong>not</strong>:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>A therapist, counselor, or mental health provider</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>A doctor or medical advisor</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>A lawyer or legal advisor</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>A financial advisor or planner</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>A substitute for professional advice of any kind</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>An emergency service — if you are in crisis, please contact a crisis helpline or emergency services in your area</span></li>
          </ul>

          <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
            <p className="text-white/70 leading-7">
              <strong className="text-amber-400">Important:</strong> HridAI's responses are generated by AI. They may
              be helpful, insightful, or useful for self-reflection — but they are not professional advice. If you need
              professional help (medical, legal, financial, psychological), please consult a qualified professional.
            </p>
          </div>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 3. Account Requirements */}
        <section>
          <h2 className="text-2xl font-bold">3. Account Requirements</h2>
          <p className="mt-4 text-white/60 leading-7">To use HridAI, you must:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Be at least 18 years old.</strong> HridAI is not designed for minors. By creating an account, you represent that you are at least 18 years old (or the higher age of majority in your jurisdiction).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Provide a valid email address</strong> for account creation.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Create a secure password</strong> and keep it confidential.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Provide accurate information.</strong> Don't create accounts with false identities.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Use the Service only where lawful.</strong> You may not use HridAI in any jurisdiction where the Service is prohibited, or where you are an individual or entity barred from using such services under applicable sanctions or export control laws (including, without limitation, US OFAC-administered sanctions).</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">3.1 Your Account Security Responsibilities</h3>
          <p className="mt-4 text-white/60 leading-7">You are responsible for:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Keeping your account credentials confidential and not sharing them with anyone.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>All activity that occurs under your account, whether or not authorized by you.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Notifying us immediately at <a href="mailto:security@ufactorial.com" className="text-emerald-400 hover:underline">security@ufactorial.com</a> (or <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>) if you suspect unauthorized access to your account or any other security issue.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Ensuring that any device you use to access HridAI is reasonably secured.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We may take steps we consider reasonably necessary to protect the integrity of our systems, including suspending an account we believe has been compromised.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 4. Service Availability and Modifications */}
        <section>
          <h2 className="text-2xl font-bold">4. Service Availability and Modifications</h2>
          <p className="mt-4 text-white/60 leading-7">
            We provide HridAI on an "as available" basis. You acknowledge that:
          </p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">No uptime guarantee.</strong> We do not guarantee that HridAI will be available without interruption. The Service may be unavailable from time to time due to maintenance, upgrades, errors, or events beyond our reasonable control.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">We may modify or discontinue features.</strong> We may add, change, or remove features of HridAI at any time. We will provide reasonable notice of material changes that affect paying users (see Section 5 for subscription implications).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">We may discontinue the Service.</strong> If we ever decide to wind down HridAI, we will give paying users at least <strong className="text-white">60 days' notice</strong> by email, prorate any unused subscription fees, and ensure you have time to export your data.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Beta features within the Service.</strong> From time to time we may offer specific features identified as beta, preview, or experimental. These individual features are provided "as-is" without any warranty, may change or be removed without notice, and may have additional terms presented at the time of access. (This is distinct from the overall beta status of the Service described in Section 4.1.)</span>
            </li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">4.1 Current Beta Status</h3>
          <p className="mt-4 text-white/60 leading-7">
            HridAI is currently offered as a beta service. By using HridAI during this beta period, you acknowledge that:
          </p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Active development.</strong> We are actively developing the product. Features may change, be added, or be removed as we iterate based on user feedback and our roadmap.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Not the final experience.</strong> The Service may have bugs, performance issues, outages, or other limitations that don't reflect our intended final product experience.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Feedback shapes the product.</strong> We are gathering user feedback to shape HridAI. By using HridAI during beta, you may receive occasional invitations to share feedback (you can always decline). Any feedback you choose to provide is governed by Section 10.1.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Free beta access is not a guarantee of future free access.</strong> We may introduce or change pricing as the product matures, with notice per Section 5 and Section 15.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Privacy, security, and AUP commitments still apply.</strong> Despite beta status, all commitments in these Terms and our Privacy Policy — including data handling, the Acceptable Use Policy, our liability framework, and your data rights — apply fully during beta.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Your data is real and persistent.</strong> Your User Content during beta is your real data and is treated as such under our Privacy Policy. We will not delete or reset your account at the end of any beta phase.</span>
            </li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We will update these Terms when HridAI exits beta status and will provide notice per Section 15.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 5. Subscription Tiers and Payment */}
        <section>
          <h2 className="text-2xl font-bold">5. Subscription Tiers and Payment</h2>

          <h3 className="mt-8 text-xl font-semibold">5.1 Free Tier</h3>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">5 conversations per day</strong></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">14-day memory depth</strong> — HridAI actively references your most recent 14 days of conversation when responding. Older conversations remain in your account and visible in the Vault, but are not actively used by the AI to inform responses. (For clarity: this is a product feature limit, not a data retention difference. Your data is retained the same way for free and premium users — see the Privacy Policy.)</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Access to all views and features within these limits</span></li>
          </ul>
          <p className="mt-3 text-white/60 leading-7">No payment required. No credit card required to start.</p>

          <h3 className="mt-8 text-xl font-semibold">5.2 Premium Tier</h3>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">$9.99/month (USD)</strong></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Unlimited conversations</strong></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Full memory depth</strong> — HridAI actively references your entire conversation history</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Access to all current and future premium features</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">5.3 Billing</h3>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Premium subscriptions are billed <strong className="text-white">monthly</strong> via Stripe.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Your subscription renews automatically at the start of each billing cycle unless you cancel.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You can cancel at any time via your account settings. Cancellation takes effect at the end of your current billing period — you keep Premium access until then.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">No refunds</strong> for partial months. If you cancel mid-cycle, you retain access through the end of that billing period.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>We may change pricing with <strong className="text-white">30 days' notice</strong> via email. Price changes apply at your next renewal — they never affect your current billing period. If you don't accept a price change, you can cancel before the new price takes effect.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Failed payments.</strong> If a renewal payment fails, we will attempt to retry. If payment is not successful, your account may be downgraded to the Free Tier; your data is preserved.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">5.4 Free Trial and Promotions</h3>
          <p className="mt-4 text-white/60 leading-7">
            We may offer free trials or promotional pricing from time to time. Trial terms will be communicated at
            signup. If a trial converts to a paid subscription, you will be notified before the first charge.
          </p>

          <h3 className="mt-8 text-xl font-semibold">5.5 Taxes</h3>
          <p className="mt-4 text-white/60 leading-7">
            Subscription fees do not include applicable taxes (such as state sales tax, VAT, GST, or other transaction taxes). Where we are required to collect taxes, they will be added to your invoice. You are responsible for any taxes that apply to your use of the Service.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 6. Your Content and Data */}
        <section>
          <h2 className="text-2xl font-bold">6. Your Content and Data</h2>

          <h3 className="mt-8 text-xl font-semibold">6.1 You Own Your Content</h3>
          <p className="mt-4 text-white/60 leading-7">This is fundamental to HridAI:</p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">You own your User Content.</strong> The conversations you have, the entities extracted from them, the knowledge graph built from your interactions — that's yours.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">You can see all of it</strong> in the Vault.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">You can export all of it</strong> in JSON format at any time.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">You can delete all of it</strong> — specific items or your entire account. Account deletion permanently removes all your data within 30 days (see Privacy Policy for details).</span>
            </li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We do not claim ownership of your User Content. We do not use your User Content to train AI models. We do not sell your data.
          </p>

          <h3 className="mt-8 text-xl font-semibold">6.2 License You Grant Us</h3>
          <p className="mt-4 text-white/60 leading-7">
            To operate HridAI for you, we need permission to handle your User Content in specific, limited ways. By submitting User Content, you grant uFactorial a <strong className="text-white">limited, worldwide, non-exclusive, royalty-free license</strong> to:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Store your User Content securely on our systems and our sub-processors' systems (as described in the Privacy Policy).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Process your User Content through AI Providers to generate Output.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Extract, structure, and store derived data from your User Content (entities, relationships, topics, episodes, self-graph entries) so HridAI can do what you're paying it to do.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Display your User Content and Output back to you within HridAI.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Generate aggregated, de-identified data that no longer identifies you, for product analytics and improvement (as described in the Privacy Policy).</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            This license is granted solely so we can provide the Service to you. It ends when you delete your User Content or your account, except for aggregated de-identified data that no longer identifies you.
          </p>

          <h3 className="mt-8 text-xl font-semibold">6.3 Your Representations About Your Content</h3>
          <p className="mt-4 text-white/60 leading-7">
            When you submit User Content, you represent and warrant that:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You have the legal right to submit it to HridAI.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Your User Content does not violate the rights of any third party (including privacy, publicity, intellectual property, or contractual rights).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>For information you share about other people: you have a lawful basis to share it. Specifically — the information relates to your own life and personal relationship with that person; it is shared in a private context, not for publication or distribution; it is not intended to harass, stalk, defame, threaten, or harm; and where applicable law requires consent or notice to the other person, you have obtained or provided it.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Your User Content does not violate Section 7 (Acceptable Use Policy).</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">6.4 Your Use of HridAI's Output</h3>
          <p className="mt-4 text-white/60 leading-7">
            Output that HridAI generates is provided to you for your personal use within the Service. If you choose to share, post, distribute, or otherwise publish Output outside HridAI (for example, by taking a screenshot or copying text into another platform), you do so as your own act of publication, and you are solely responsible for any consequences. uFactorial does not publish Output to anyone other than you.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            You may not represent Output as human-generated when sharing it externally, and you must not present Output as factual without independently verifying it (see Section 8).
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 7. Acceptable Use Policy */}
        <section>
          <h2 className="text-2xl font-bold">7. Acceptable Use Policy</h2>
          <p className="mt-4 text-white/60 leading-7">
            You agree to use HridAI only for <strong className="text-white">lawful, personal, non-commercial purposes</strong>. The rest of this Section spells out what that means in practice.
          </p>

          <h3 className="mt-8 text-xl font-semibold">7.1 General Compliance</h3>
          <p className="mt-4 text-white/60 leading-7">You will:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Comply with all applicable laws and regulations in your use of HridAI.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Comply with the Usage Policies of the AI Providers we use, as those policies may be updated from time to time. We pass through the substance of those policies to you in this Section. You don't need to read the providers' policies separately, but you should know your use of HridAI is constrained by them.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Use HridAI in good faith and as it is reasonably intended to be used.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">7.2 Prohibited Uses</h3>
          <p className="mt-4 text-white/60 leading-7">You will not use HridAI to:</p>

          <p className="mt-6 font-semibold text-white">Harm to other people:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Harass, stalk, threaten, intimidate, defame, or otherwise harm any individual.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Plan, coordinate, or facilitate violence against any individual or group.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Surveil, profile, or build dossiers on other people without their lawful consent.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Generate content that targets individuals based on protected characteristics (race, ethnicity, religion, sexual orientation, gender identity, disability, etc.) for the purpose of harassment or discrimination.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Engage in any form of non-consensual sexual content involving real, identifiable people.</span></li>
          </ul>

          <p className="mt-6 font-semibold text-white">Harm to children:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Generate, request, or store child sexual abuse material (CSAM), or any content that sexualizes minors, in any form, regardless of whether AI-generated or otherwise.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Engage in any conduct that exploits, endangers, or harms minors.</span></li>
          </ul>

          <p className="mt-6 font-semibold text-white">Illegal or harmful activity:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Plan, coordinate, or facilitate any illegal activity.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Generate or seek instructions for creating weapons, including biological, chemical, nuclear, or conventional weapons, or precursors to such weapons.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Generate or seek instructions for malware, ransomware, exploits, intrusion tools, or other code intended to compromise computer systems, networks, or infrastructure.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Engage in fraud, identity theft, scams, phishing, or other deceptive practices.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Attempt to compromise the security or integrity of HridAI or any system connected to it.</span></li>
          </ul>

          <p className="mt-6 font-semibold text-white">Abuse of the Service:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Use bots, scrapers, automation, or any other programmatic means to interact with HridAI (API access, if offered separately, will have its own terms).</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Create multiple accounts to bypass free tier limits or evade enforcement actions.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Attempt to overload, disrupt, or interfere with HridAI's infrastructure.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Reverse-engineer, decompile, or attempt to extract HridAI's source code, models, or proprietary algorithms.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Use Output to develop, train, or improve AI models that compete with HridAI or our AI Providers.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Resell, redistribute, sublicense, or commercially exploit access to HridAI.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Misrepresent or impersonate any person or entity in your account or interactions.</span></li>
          </ul>

          <p className="mt-6 font-semibold text-white">Misuse of AI capabilities:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Generate content intended to deceive others about the source of the content (for example, presenting AI Output as the work of a real, identifiable person).</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Use HridAI to provide professional services to others (medical, legal, financial, psychological, or other regulated services) — HridAI is for your personal use.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Use HridAI for high-stakes automated decision-making about other people (employment, credit, housing, insurance, healthcare access, etc.).</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Use HridAI for political campaigning or election-related activities, including voter targeting or generating campaign materials at scale.</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Bypass, circumvent, or attempt to disable any safety measures, content filters, or rate limits we or our AI Providers have implemented.</span></li>
          </ul>

          <p className="mt-4 text-white/60 leading-7">
            This list is not exhaustive. We may update prohibited uses to reflect changes in AI Providers' policies, applicable law, or our enforcement priorities. Material updates will be communicated under Section 15.
          </p>

          <h3 className="mt-8 text-xl font-semibold">7.3 Reporting Violations</h3>
          <p className="mt-4 text-white/60 leading-7">
            If you believe someone is using HridAI in a way that violates this Acceptable Use Policy — including content that targets you specifically — you can contact us at <a href="mailto:abuse@ufactorial.com" className="text-emerald-400 hover:underline font-semibold">abuse@ufactorial.com</a> with:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>A description of the alleged violation.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Any evidence you can provide (e.g., a screenshot, a description of the conduct).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Your contact information so we can follow up.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We will review specific reports of violations and may take action against the user's account if warranted (suspension, termination, removal of specific content, or referral to law enforcement). Our review is narrow and evidence-based — we do not search across user data based on general inquiries (see Privacy Policy Section 2.3).
          </p>
          <p className="mt-4 text-white/60 leading-7">
            If a report involves an immediate threat to life or safety, please also contact local emergency services. We will cooperate with valid requests from law enforcement under Section 5.6 of our Privacy Policy.
          </p>

          <h3 className="mt-8 text-xl font-semibold">7.4 Consequences of Violations</h3>
          <p className="mt-4 text-white/60 leading-7">
            If you violate this Acceptable Use Policy, we may, at our discretion:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Issue a warning.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Suspend your account temporarily.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Terminate your account permanently and delete your data per Section 11.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Refuse to provide future services to you.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Report the conduct to law enforcement or to our AI Providers if required by their terms or applicable law.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Take any other action we consider appropriate.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            For serious violations (CSAM, threats of violence, illegal activity), we may act immediately and without prior warning.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 8. AI Disclaimers and Limitations of Output */}
        <section>
          <h2 className="text-2xl font-bold">8. AI Disclaimers and Limitations of Output</h2>

          <h3 className="mt-8 text-xl font-semibold">8.1 You Are Interacting With AI</h3>
          <p className="mt-4 text-white/60 leading-7">
            All responses you receive in HridAI are generated by AI — not by a human. Output is produced by large language models that predict likely responses based on patterns; they do not have human understanding, judgment, or accountability.
          </p>

          <h3 className="mt-8 text-xl font-semibold">8.2 AI Output May Be Inaccurate</h3>
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
            <p className="text-white/70 leading-7">
              <strong className="text-amber-400">Factual assertions in Output should not be relied upon without independently checking their accuracy. Output may be false, incomplete, misleading, or not reflective of recent events or information.</strong>{" "}
              This includes statements HridAI may make about you, about other people, about the world, or about anything else.
            </p>
          </div>
          <p className="mt-4 text-white/60 leading-7">In particular:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-amber-400">•</span> <span>HridAI may misremember or misextract things you've shared.</span></li>
            <li className="flex gap-3"><span className="text-amber-400">•</span> <span>HridAI may infer connections that are wrong.</span></li>
            <li className="flex gap-3"><span className="text-amber-400">•</span> <span>HridAI may generate plausible-sounding statements that have no basis in reality (sometimes called "hallucinations").</span></li>
            <li className="flex gap-3"><span className="text-amber-400">•</span> <span>HridAI may produce different responses to similar inputs.</span></li>
            <li className="flex gap-3"><span className="text-amber-400">•</span> <span>HridAI does not have real-time knowledge of current events.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">8.3 Not a Substitute for Professional Advice</h3>
          <p className="mt-4 text-white/60 leading-7">
            HridAI is not a substitute for professional advice. Specifically:
          </p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold">!</span>
              <span><strong className="text-white">Medical:</strong> HridAI is not a doctor and is not subject to HIPAA. Do not rely on it for medical diagnoses, treatment decisions, or health advice. If you have a medical concern, see a healthcare provider.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold">!</span>
              <span><strong className="text-white">Mental health:</strong> HridAI is not a therapist or counselor. It may help you organize your thoughts, but it is not therapy. If you're in crisis, contact a mental health professional or crisis helpline.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold">!</span>
              <span><strong className="text-white">Legal:</strong> HridAI is not a lawyer. Do not rely on it for legal advice. Consult a qualified attorney for legal matters.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold">!</span>
              <span><strong className="text-white">Financial:</strong> HridAI is not a financial advisor. Do not make investment, tax, or major financial decisions based on Output. Consult a qualified financial professional.</span>
            </li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            Information you share with HridAI is not protected by professional confidentiality privileges (medical, legal, therapist, etc.).
          </p>

          <h3 className="mt-8 text-xl font-semibold">8.4 You Can Correct What HridAI Knows About You</h3>
          <p className="mt-4 text-white/60 leading-7">
            If HridAI's stored understanding of you contains errors, you can edit or delete entries directly in the Vault. If you want us to remove or correct something HridAI generated about you that you cannot fix yourself, contact <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>.
          </p>

          <h3 className="mt-8 text-xl font-semibold">8.5 Decisions You Make Based on Output</h3>
          <p className="mt-4 text-white/60 leading-7">
            You are responsible for any decisions you make and any actions you take based on Output. HridAI is a tool to assist your thinking — not an authoritative source of truth about your life or anyone else's.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 9. AI Provider Acknowledgment */}
        <section>
          <h2 className="text-2xl font-bold">9. AI Provider Acknowledgment</h2>
          <p className="mt-4 text-white/60 leading-7">
            HridAI is powered in part by AI models provided by third-party AI Providers (currently Anthropic and OpenAI). You acknowledge that:
          </p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Your contract is with us, not with the AI Providers.</strong> You have no direct contractual relationship with any AI Provider through your use of HridAI. The AI Providers have no obligations to you under these Terms.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">No third-party beneficiary rights.</strong> You may not bring claims directly against AI Providers as a third-party beneficiary of any agreement between us and them. Claims relating to your use of HridAI are between you and uFactorial.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">AI Provider data handling.</strong> When you use HridAI, your User Content is sent to AI Providers for processing. How AI Providers handle that data is described in our Privacy Policy (Section 5). For additional detail, you may review the providers' own published policies, but our Privacy Policy is what governs the relationship between us and you.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">We may change AI Providers.</strong> We may add, remove, or change AI Providers from time to time. Material changes will be communicated as described in our Privacy Policy.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 10. Our Intellectual Property */}
        <section>
          <h2 className="text-2xl font-bold">10. Our Intellectual Property</h2>
          <p className="mt-4 text-white/60 leading-7">While you own your User Content, we own HridAI:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>The HridAI application, its code, design, architecture, and the structure of the knowledge graph it builds are the intellectual property of uFactorial.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>The HridAI name, logo, and branding are trademarks of uFactorial.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You may not copy, modify, distribute, or reverse-engineer any part of the HridAI application beyond what is permitted by these Terms or applicable law.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">Your license to use HridAI is:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Non-exclusive</strong> — others can use it too.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Non-transferable</strong> — your account is yours alone.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Revocable</strong> — we can terminate access per Section 11.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Limited</strong> — to personal use as described in these Terms.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">10.1 Feedback</h3>
          <p className="mt-4 text-white/60 leading-7">
            If you provide us with feedback, suggestions, or ideas about HridAI ("Feedback"), you grant us a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and incorporate that Feedback into HridAI without any obligation to you (including no obligation to credit, compensate, or notify you). You retain no rights in Feedback once you've given it to us. Feedback does not include your User Content, which remains yours.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 11. Termination */}
        <section>
          <h2 className="text-2xl font-bold">11. Termination</h2>

          <h3 className="mt-8 text-xl font-semibold">11.1 Termination by You</h3>
          <p className="mt-4 text-white/60 leading-7">You can stop using HridAI at any time:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Cancel your subscription</strong> via the app settings. You retain access through the end of your billing period, after which your account converts to the Free Tier.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Delete your account</strong> via the app settings. This permanently deletes all your data within 30 days. This action is irreversible. Deletion requires you to type "DELETE MY DATA" as confirmation (or equivalent).</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">11.2 Termination by Us</h3>
          <p className="mt-4 text-white/60 leading-7">We may suspend or terminate your account if:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You violate these Terms (particularly the Acceptable Use Policy in Section 7).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You engage in activity that threatens the security or integrity of the Service or other users.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>AI Providers require us to suspend or terminate your access (per their terms, which we are required to enforce).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Continuing to provide the Service to you would expose us to legal risk.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>We are required to by law.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            If we terminate your account for a reason other than your violation of these Terms (for example, we are winding down the Service), we will provide reasonable notice and an opportunity to export your data.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            If we terminate for Terms violations, we may do so immediately and without prior notice. We will still delete your data within 30 days of termination, except for any data we are required to retain by law or for abuse-prevention purposes (see Privacy Policy Section 7).
          </p>

          <h3 className="mt-8 text-xl font-semibold">11.3 Effect of Termination</h3>
          <p className="mt-4 text-white/60 leading-7">Upon termination:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Your access to HridAI ends.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Your data is permanently deleted within 30 days, except as noted above.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Any remaining subscription period is forfeit if termination is due to your violation of these Terms. If termination is for any other reason, we will refund any unused, prepaid subscription fees on a prorated basis.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>The provisions of these Terms that by their nature should survive termination will survive (see Section 16.4).</span></li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 12. Limitation of Liability */}
        <section>
          <h2 className="text-2xl font-bold">12. Limitation of Liability</h2>
          <p className="mt-4 text-white/60 leading-7">To the maximum extent permitted by applicable law:</p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">uFactorial provides HridAI "as is" and "as available."</strong> We make no warranties, express or implied, about the reliability, accuracy, completeness, fitness for a particular purpose, or availability of the Service. We disclaim all implied warranties, including warranties of merchantability, fitness for a particular purpose, and non-infringement.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">We are not liable</strong> for any indirect, incidental, special, consequential, exemplary, or punitive damages arising from your use of HridAI, including loss of profits, loss of data, loss of goodwill, or any damages relating to Output, even if we have been advised of the possibility of such damages.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Our total liability</strong> for any claim related to HridAI is limited to the greater of: (a) the amount you paid us in the 12 months preceding the event giving rise to the claim, or (b) US$100.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">We are not responsible</strong> for decisions you make or actions you take based on Output (see Section 8).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">We are not liable</strong> for damages caused by your violation of these Terms, including external sharing of Output (see Section 6.4).</span>
            </li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            These limitations apply to the extent permitted by law. Some jurisdictions do not allow certain limitations of liability, in which case the limitation applies to the maximum extent permitted in your jurisdiction.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 13. Indemnification */}
        <section>
          <h2 className="text-2xl font-bold">13. Indemnification</h2>
          <p className="mt-4 text-white/60 leading-7">
            You agree to indemnify, defend, and hold harmless uFactorial, its officers, employees, and agents from any claims, damages, losses, liabilities, costs, or expenses (including reasonable attorney fees) arising out of or relating to:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Your User Content</strong> — including any User Content that infringes a third party's rights, violates applicable law, or violates Section 6.3 (your content representations).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Information you share about other people</strong> — including any claim by a third party arising from information you have shared about them in HridAI.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Your use or misuse of HridAI</strong> — including any breach of these Terms or the Acceptable Use Policy.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Your sharing of Output outside HridAI</strong> — including any claim arising from how you use, present, distribute, or rely on Output once it has left the Service.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Your reliance on Output</strong> — including any claim by you or a third party arising from a decision you made or action you took based on Output (see Section 8).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Your violation of any third party's rights</strong> — privacy, publicity, intellectual property, contractual, or otherwise.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We will notify you in writing of any claim for which we seek indemnification, and you agree to cooperate reasonably in the defense. We reserve the right to assume the exclusive defense and control of any matter subject to indemnification, in which case you will cooperate with us in asserting available defenses.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 14. Dispute Resolution */}
        <section>
          <h2 className="text-2xl font-bold">14. Dispute Resolution</h2>

          <h3 className="mt-8 text-xl font-semibold">14.1 Informal Resolution First</h3>
          <p className="mt-4 text-white/60 leading-7">
            Before filing any formal claim, you agree to contact us at{" "}
            <a href="mailto:legal@ufactorial.com" className="text-emerald-400 hover:underline">legal@ufactorial.com</a>{" "}
            with a written description of the dispute, what relief you are seeking, and your contact information. We will attempt to resolve the dispute informally for <strong className="text-white">at least 30 days</strong> after receiving your notice. You may not file a formal claim until this informal resolution period has expired.
          </p>

          <h3 className="mt-8 text-xl font-semibold">14.2 Governing Law</h3>
          <p className="mt-4 text-white/60 leading-7">
            These Terms are governed by the laws of the <strong className="text-white">State of New Jersey, United States</strong>, and applicable US federal law, without regard to conflict of law principles. The United Nations Convention on Contracts for the International Sale of Goods does not apply.
          </p>

          <h3 className="mt-8 text-xl font-semibold">14.3 Venue and Jurisdiction</h3>
          <p className="mt-4 text-white/60 leading-7">
            For any dispute that cannot be resolved informally, you and uFactorial agree to submit to the <strong className="text-white">exclusive jurisdiction of the state and federal courts located in New Jersey, United States</strong>, and waive any objection to such jurisdiction or venue based on inconvenient forum. This applies except where applicable law (including consumer protection law in your jurisdiction) requires otherwise.
          </p>

          <h3 className="mt-8 text-xl font-semibold">14.4 Class Action Waiver</h3>
          <p className="mt-4 text-white/60 leading-7">
            To the extent permitted by applicable law, you agree to resolve disputes individually and waive any right to participate in a class action, class arbitration, or representative proceeding. If a court determines this waiver is unenforceable for a particular claim, that claim must be severed from any class proceeding and resolved individually.
          </p>

          <h3 className="mt-8 text-xl font-semibold">14.5 Time Limit</h3>
          <p className="mt-4 text-white/60 leading-7">
            Any claim arising from your use of HridAI must be brought within <strong className="text-white">one year</strong> of the event giving rise to the claim, or it is permanently barred (except where applicable law prohibits such a limitation).
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 15. Changes to These Terms */}
        <section>
          <h2 className="text-2xl font-bold">15. Changes to These Terms</h2>
          <p className="mt-4 text-white/60 leading-7">We may update these Terms from time to time.</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For minor changes</strong> (clarifications, formatting, non-substantive updates): we will update the "Last Updated" date at the top of these Terms.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For material changes</strong> (changes affecting your rights, obligations, fees, or significant features of the Service): we will notify you via email and/or an in-app notification at least <strong className="text-white">30 days</strong> before the changes take effect.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">If you disagree with material changes</strong>, you may terminate your account before the changes take effect. Your continued use of the Service after the effective date of material changes constitutes acceptance of the updated Terms. Where required by applicable law, we will obtain your explicit consent before material changes apply to your account.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Prior versions</strong> of these Terms are available on request at <a href="mailto:legal@ufactorial.com" className="text-emerald-400 hover:underline">legal@ufactorial.com</a>.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 16. General Provisions */}
        <section>
          <h2 className="text-2xl font-bold">16. General Provisions</h2>

          <h3 className="mt-8 text-xl font-semibold">16.1 Entire Agreement</h3>
          <p className="mt-4 text-white/60 leading-7">
            These Terms, together with our <Link to="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>, constitute the entire agreement between you and uFactorial regarding HridAI and supersede any prior agreements.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.2 Severability</h3>
          <p className="mt-4 text-white/60 leading-7">
            If any provision of these Terms is found unenforceable, that provision will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will continue in effect.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.3 No Waiver</h3>
          <p className="mt-4 text-white/60 leading-7">
            Our failure to enforce any provision of these Terms is not a waiver of our right to enforce it later.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.4 Survival</h3>
          <p className="mt-4 text-white/60 leading-7">
            The following sections survive termination of these Terms or your account: Section 6.2 (License You Grant Us — for aggregated de-identified data only), Section 6.3 (Your Representations About Your Content), Section 8 (AI Disclaimers), Section 9 (AI Provider Acknowledgment), Section 12 (Limitation of Liability), Section 13 (Indemnification), Section 14 (Dispute Resolution), and any other provisions that by their nature should survive.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.5 No Third-Party Beneficiaries</h3>
          <p className="mt-4 text-white/60 leading-7">
            These Terms create rights and obligations only between you and uFactorial. No third party (including AI Providers) has rights or remedies under these Terms.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.6 Assignment</h3>
          <p className="mt-4 text-white/60 leading-7">
            You may not assign your rights or obligations under these Terms. We may assign ours in connection with a merger, acquisition, sale of assets, financing, or reorganization, with notice to you (see Privacy Policy Section 5.7 for related data handling).
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.7 Force Majeure</h3>
          <p className="mt-4 text-white/60 leading-7">
            We are not liable for failures or delays caused by circumstances beyond our reasonable control, including natural disasters, network outages, infrastructure failures of third parties (including AI Providers), acts of government, or labor disputes.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.8 Notice</h3>
          <p className="mt-4 text-white/60 leading-7">We may give you notice under these Terms by:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Sending an email to the address associated with your account.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Posting a notice in the Service or on our website.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Any other reasonable means.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            You may give us notice by sending an email to the relevant address in Section 17.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.9 Headings</h3>
          <p className="mt-4 text-white/60 leading-7">
            Section headings are for convenience only and do not affect the interpretation of these Terms.
          </p>

          <h3 className="mt-8 text-xl font-semibold">16.10 Language</h3>
          <p className="mt-4 text-white/60 leading-7">
            These Terms are written in English. If a translation is provided, the English version controls in case of any conflict.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 17. Contact Us */}
        <section>
          <h2 className="text-2xl font-bold">17. Contact Us</h2>
          <ul className="mt-4 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">General inquiries:</strong> <a href="mailto:support@ufactorial.com" className="text-emerald-400 hover:underline">support@ufactorial.com</a></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Legal inquiries and disputes:</strong> <a href="mailto:legal@ufactorial.com" className="text-emerald-400 hover:underline">legal@ufactorial.com</a></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Privacy inquiries:</strong> <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Abuse reports:</strong> <a href="mailto:abuse@ufactorial.com" className="text-emerald-400 hover:underline">abuse@ufactorial.com</a></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Security issues:</strong> <a href="mailto:security@ufactorial.com" className="text-emerald-400 hover:underline">security@ufactorial.com</a> (or <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>)</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Website:</strong> <a href="https://ufactorial.com" className="text-emerald-400 hover:underline">ufactorial.com</a></span></li>
          </ul>
          <div className="mt-6">
            <p className="font-semibold text-white">Mailing address:</p>
            <p className="mt-2 text-white/60 leading-7">uFactorial LLC, New Jersey, USA.</p>
            <p className="mt-2 text-white/40 italic leading-7">
              Full mailing address coming soon — currently being established with our registered agent. For any correspondence requiring a physical address in the interim, please email <a href="mailto:legal@ufactorial.com" className="text-emerald-400 hover:underline">legal@ufactorial.com</a>.
            </p>
          </div>
        </section>

        <hr className="my-10 border-white/10" />

        <p className="text-white/40 text-sm italic leading-7">
          These Terms are written to be readable because we believe agreements should be understood, not just signed.
          If you have questions, email us.
        </p>

        {/* Bottom nav */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-between border-t border-white/10 pt-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white transition">
            Back to HridAI
          </Link>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-sm text-white/60 hover:text-white transition">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-sm text-white/60 hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
