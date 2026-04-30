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

export default function Privacy() {
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
            <Link to="/terms" className="text-sm text-white/60 hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/40">
          <span>Effective Date: April 29, 2026</span>
          <span>Last Updated: April 29, 2026</span>
        </div>
        <div className="mt-2 text-sm text-white/40">
          Company: uFactorial (ufactorial.com) &middot; Product: HridAI
        </div>

        <hr className="my-10 border-white/10" />

        {/* The Short Version */}
        <section>
          <h2 className="text-2xl font-bold">The Short Version</h2>
          <p className="mt-4 text-white/60 leading-7">
            HridAI is a personal AI that learns about you through conversation. That means we store personal
            information — your conversations, the people and topics you mention, your goals, your preferences.
            We take that seriously.
          </p>
          <p className="mt-4 text-white/60 leading-7">Here's what you should know upfront:</p>
          <ul className="mt-4 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">You own your data.</strong> Always.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">We don't sell your data.</strong> Ever.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">We don't show you ads.</strong> There is no advertising in HridAI.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">We don't train AI models on your data</strong> — ours, or any third party's.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">You can see everything we know about you</strong> — that's the whole point of the product.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong className="text-white">You can export or delete all of it</strong> at any time.</span>
            </li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            This policy explains exactly what we collect, why, where it goes, and what rights you have.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 1. Who We Are */}
        <section>
          <h2 className="text-2xl font-bold">1. Who We Are</h2>
          <p className="mt-4 text-white/60 leading-7">
            uFactorial operates HridAI, a personal intelligence application available at hridai.app (and related
            domains). When this policy says "we," "us," or "our," it means uFactorial.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            For data protection purposes, uFactorial is the <strong className="text-white">data controller</strong> for your personal data.
          </p>
          <div className="mt-4 text-white/60 leading-7">
            <p className="font-semibold text-white">Contact for data inquiries:</p>
            <ul className="mt-2 space-y-1">
              <li>Email: <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a></li>
              <li>Website: <a href="https://ufactorial.com" className="text-emerald-400 hover:underline">ufactorial.com</a></li>
            </ul>
          </div>
          <p className="mt-4 text-white/60 leading-7">
            We have not designated a formal Data Protection Officer at this time. If you are in the EEA, UK, or Switzerland, you may contact your local data protection authority for any complaint.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 2. What Data We Collect */}
        <section>
          <h2 className="text-2xl font-bold">2. What Data We Collect</h2>

          {/* 2.1 */}
          <h3 className="mt-8 text-xl font-semibold">2.1 Data You Provide Directly</h3>
          <DataTable
            headers={["Data Type", "Description", "Examples"]}
            rows={[
              [
                <strong className="text-white">Account information</strong>,
                "What you give us at signup",
                "Email address, password (hashed)",
              ],
              [
                <strong className="text-white">Conversation content</strong>,
                "Messages you send to HridAI and HridAI's responses",
                "Chat messages, questions, stories you share",
              ],
              [
                <strong className="text-white">Todos and lists</strong>,
                "Items you ask HridAI to track",
                "Task lists, reminders, notes",
              ],
              [
                <strong className="text-white">Payment information</strong>,
                "If you subscribe to Premium",
                "Processed entirely by Stripe; we receive only a customer ID and subscription status",
              ],
            ]}
          />

          {/* 2.2 */}
          <h3 className="mt-8 text-xl font-semibold">2.2 Data We Extract From Conversations</h3>
          <p className="mt-4 text-white/60 leading-7">
            HridAI processes your conversations to build a structured understanding of your life. This is the
            core product — it's how HridAI becomes useful to you. We extract:
          </p>
          <DataTable
            headers={["Data Type", "Description", "Examples"]}
            rows={[
              [
                <strong className="text-white">Entities</strong>,
                "People, organizations, and locations you mention",
                '"my sister Meera," "my company," "Mumbai"',
              ],
              [
                <strong className="text-white">Relationships</strong>,
                "How entities relate to you and each other",
                '"Meera is your sister," "you work at [company]"',
              ],
              [
                <strong className="text-white">Topics</strong>,
                "Ongoing threads in your life",
                '"career transition," "school search for Ananya"',
              ],
              [
                <strong className="text-white">Episodes</strong>,
                "Summaries of conversation segments",
                "A condensed summary of a conversation about your work situation",
              ],
              [
                <strong className="text-white">Self-graph entries</strong>,
                "Facts about you — goals, preferences, key dates, values",
                '"wants to learn piano," "prefers morning meetings"',
              ],
            ]}
          />
          <p className="mt-4 text-white/60 leading-7">
            <strong className="text-white">You can see all extracted data</strong> in HridAI's Vault interface. If
            something is wrong, you can edit or delete it.
          </p>

          {/* 2.3 */}
          <h3 className="mt-8 text-xl font-semibold">2.3 Information About Other People You Mention</h3>
          <p className="mt-4 text-white/60 leading-7">
            Because HridAI is a personal intelligence tool, you will naturally share information about other people in your life — family, friends, colleagues, businesses you interact with. This section explains how we treat that information and how we handle requests from people you mention.
          </p>

          <p className="mt-4 font-semibold text-white">Your responsibility.</p>
          <p className="mt-2 text-white/60 leading-7">
            When you share information about other people in your conversations with HridAI, you represent and warrant that you have a lawful basis to do so. Specifically:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>The information relates to your own life and your personal relationship with that person.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>It is shared in a private context, not for publication or distribution.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>It is not intended to harass, stalk, defame, threaten, or harm.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Where applicable law requires consent or notice to the other person for your particular use, you have obtained or provided it.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            You agree to indemnify uFactorial against claims arising from information you share about third parties. Details of this obligation are set out in our <Link to="/terms" className="text-emerald-400 hover:underline">Terms of Service</Link>.
          </p>

          <p className="mt-6 font-semibold text-white">How we treat this data.</p>
          <p className="mt-2 text-white/60 leading-7">
            Information you share about other people is part of your personal data. We hold it as part of your account, secure it the same way we secure the rest of your data, and use it only to provide the service to you. We do not routinely access or read the content of your conversations. uFactorial staff do not browse user data, and the service is not designed to be queryable across users by the name or identity of someone mentioned in a conversation.
          </p>

          <p className="mt-6 font-semibold text-white">Requests from people you mention.</p>
          <p className="mt-2 text-white/60 leading-7">
            People you mention in HridAI sometimes contact us asking what data we hold about them, asking us to disclose what was said, or asking us to delete it. Because we do not routinely access user content, and because searching across our users' private conversations to find references to one outside person would violate the privacy of every user in our system, we do not respond to such requests by searching, retrieving, or disclosing user data.
          </p>
          <p className="mt-4 text-white/60 leading-7">When a third party contacts us:</p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For businesses, organizations, public figures, or other entities</strong> — these are not natural persons under data protection law and have no individual rights with respect to information shared in your personal use of the service.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For private individuals</strong> — we will explain that the data, if any, is part of a user's personal account, that we do not access user content on request, and that we cannot search across our users' conversations. We will direct them to address the matter with the relevant user (where the user is known to them) or to pursue legal channels if they believe unlawful conduct is involved.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For specific reports of unlawful content</strong> — if a person provides evidence of specific content that violates our Terms of Service or applicable law (for example, harassment, threats, illegal activity), our Trust &amp; Safety review will examine the specific reported content and may take action against the user's account. This is a narrow, evidence-based review of reported content, not a general search of user data.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For valid legal demands</strong> — if law enforcement or a court issues a valid subpoena, court order, or other legal process for a specific user's data, we will comply per Section 5.6 of this policy, with notice to the affected user where legally permitted.</span>
            </li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We do not proactively notify people you mention about information you have shared regarding them.
          </p>

          {/* 2.4 */}
          <h3 className="mt-8 text-xl font-semibold">2.4 Sensitive Personal Data</h3>
          <p className="mt-4 text-white/60 leading-7">
            Because HridAI is designed to help you with the substantive context of your life, your conversations may include sensitive information — health details, religious or philosophical beliefs, political opinions, sexual orientation, ethnic or racial background, biometric or genetic information, or other "special category" data under GDPR Article 9 / "sensitive personal information" under the CPRA.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            By using HridAI and choosing to share this information in conversation, you provide your <strong className="text-white">explicit consent</strong> under GDPR Article 9(2)(a) for us to process it for the sole purpose of providing the service to you. You can withdraw this consent at any time by deleting the relevant data or your account.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            We do <strong className="text-white">not</strong> use sensitive personal data for any purpose other than providing the service. We do not share it with third parties beyond the sub-processors listed in Section 5, do not infer additional sensitive attributes for marketing, and do not use it to make decisions producing legal or similarly significant effects.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            If you would prefer not to share sensitive information with HridAI, simply do not include it in your conversations.
          </p>

          {/* 2.5 */}
          <h3 className="mt-8 text-xl font-semibold">2.5 Data We Collect Automatically</h3>
          <DataTable
            headers={["Data Type", "Description", "What It Includes"]}
            rows={[
              [
                <strong className="text-white">Usage analytics</strong>,
                "How you use the app (not what you say)",
                "Session timing, feature usage, device type",
              ],
              [
                <strong className="text-white">Technical data</strong>,
                "Standard web/app data",
                "IP address, browser type, operating system",
              ],
            ]}
          />
          <p className="mt-4 text-white/60 leading-7">
            We do <strong className="text-white">not</strong> use analytics to profile your conversation content.
            Usage analytics track things like "user opened the app at 9am" — not "user talked about their marriage."
          </p>

          {/* 2.6 */}
          <h3 className="mt-8 text-xl font-semibold">2.6 Aggregated and De-Identified Data</h3>
          <p className="mt-4 text-white/60 leading-7">
            We may aggregate or de-identify data such that it no longer identifies you, and use this aggregated data to operate, improve, and analyze the service (for example: total active users, feature usage rates, average session length, crash and performance diagnostics). We will not attempt to re-identify de-identified data. Aggregated and de-identified data is no longer considered personal data and is not subject to the rights described in Section 8.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 3. How We Use Your Data */}
        <section>
          <h2 className="text-2xl font-bold">3. How We Use Your Data</h2>
          <DataTable
            headers={["Purpose", "Lawful Basis (GDPR)", "Data Used"]}
            rows={[
              ["Provide the HridAI service", "Performance of contract", "Conversations, extracted data, account info"],
              ["Process conversations with AI", "Performance of contract", "Conversation content (sent to LLM provider)"],
              ["Build your personal knowledge graph", "Performance of contract", "Extracted entities, relationships, topics, episodes"],
              ["Process sensitive personal data shared by you", "Explicit consent (Art. 9(2)(a))", "Health, beliefs, political opinions, etc."],
              ["Manage your subscription", "Performance of contract", "Account info, payment data (via Stripe)"],
              ["Improve the product", "Legitimate interest", "Aggregated, anonymized usage analytics"],
              ["Prevent abuse and ensure security", "Legitimate interest", "Account info, usage patterns, technical data"],
              ["Communicate with you about the service", "Legitimate interest / contract", "Account email"],
              ["Send product updates and marketing (with opt-out)", "Legitimate interest / consent", "Account email"],
              ["Comply with legal obligations", "Legal obligation", "As required by applicable law"],
            ]}
          />
          <p className="mt-6 text-white/60 leading-7">
            We do <strong className="text-white">not</strong> use your data to:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Train AI models — ours, or any third party's</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Serve advertisements</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Build profiles for third parties</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Sell, rent, or trade your personal information</span></li>
          </ul>

          {/* 3.1 */}
          <h3 className="mt-8 text-xl font-semibold">3.1 Profiling and Personalization</h3>
          <p className="mt-4 text-white/60 leading-7">
            HridAI uses your data to build a personalized model of your life — what we call your self-graph and your knowledge graph. This is profiling within the meaning of GDPR Article 4(4), and it is the core feature of the product. We're transparent about this:
          </p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">No legal effect.</strong> This profiling produces no decisions affecting your access to services, employment, credit, insurance, immigration, or any other matter outside HridAI itself.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Visible to you.</strong> All inferences and stored attributes are visible in the Vault interface — you can see exactly what we've inferred and edit or delete it.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">You can object.</strong> You can object to profiling at any time by contacting <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a> or by deleting your account. Note that profiling is intrinsic to the service, so objection generally means discontinuing use.</span>
            </li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            Per GDPR Article 22, you have the right not to be subject to a decision based solely on automated processing that produces legal or similarly significant effects. HridAI does not make such decisions.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 4. AI Processing and Accuracy */}
        <section>
          <h2 className="text-2xl font-bold">4. AI Processing and Accuracy</h2>
          <p className="mt-4 text-white/60 leading-7">
            HridAI uses large language models (LLMs) provided by third parties to process your conversations and generate responses. You should know:
          </p>
          <ul className="mt-4 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold">!</span>
              <span><strong className="text-white">You are interacting with AI.</strong> All responses you receive in HridAI are generated by a language model, not by a human.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold">!</span>
              <span><strong className="text-white">AI outputs may be inaccurate.</strong> Factual assertions in HridAI's responses should not be relied upon without independently checking their accuracy. Outputs may be false, incomplete, misleading, or not reflective of recent events. Do not rely on HridAI for medical, legal, financial, tax, or other professional advice.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 font-bold">!</span>
              <span><strong className="text-white">HridAI is not a regulated service.</strong> uFactorial is not a healthcare provider (and not subject to HIPAA), legal counsel, financial advisor, or licensed therapist. Information you share in HridAI is not protected by professional confidentiality privileges.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">You can correct inaccuracies.</strong> If HridAI's stored understanding of you contains errors, you can edit or delete entries directly in the Vault. If you want us to remove or correct content the model has generated about you, contact <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 5. Who Sees Your Data */}
        <section>
          <h2 className="text-2xl font-bold">5. Who Sees Your Data</h2>

          <h3 className="mt-8 text-xl font-semibold">5.1 LLM Processing — Anthropic (Claude API)</h3>
          <p className="mt-4 text-white/60 leading-7">
            When you send a message in HridAI, your conversation content is sent to Anthropic's Claude API for processing.
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Anthropic processes your message and returns a response.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Anthropic does not use your data to train their models</strong> (per their Commercial Terms of Service).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Anthropic may retain API inputs and outputs for <strong className="text-white">up to 30 days</strong> for the purpose of detecting abuse and ensuring trust and safety, after which they are deleted, unless Anthropic is required to retain them longer for legal reasons.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>This retention is solely for trust and safety purposes; Anthropic does not access this data for model training, advertising, or any other purpose.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            For more information about how Anthropic processes API data, see Anthropic's Commercial Terms of Service and their Privacy Policy at{" "}
            <a href="https://www.anthropic.com/legal" className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">anthropic.com/legal</a>.
          </p>

          <h3 className="mt-8 text-xl font-semibold">5.2 Embeddings — OpenAI API</h3>
          <p className="mt-4 text-white/60 leading-7">
            To enable semantic search within your data, we generate text embeddings using OpenAI's <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/80">text-embedding-3-small</code> model.
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Text snippets are sent to OpenAI's API to generate numerical vector representations.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">OpenAI does not use your data to train their models</strong> (per their API data usage policy).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>OpenAI may retain inputs for <strong className="text-white">up to 30 days</strong> for abuse monitoring under their standard API terms.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>The embeddings (numerical vectors) are stored in our database for search functionality. While embeddings are not directly readable text, they are derived from your content and we treat them as personal data.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            For more information about how OpenAI processes API data, see OpenAI's API data usage policy and their Privacy Policy at{" "}
            <a href="https://openai.com/policies" className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">openai.com/policies</a>.
          </p>

          <h3 className="mt-8 text-xl font-semibold">5.3 Data Storage — Supabase</h3>
          <p className="mt-4 text-white/60 leading-7">Your data is stored in a PostgreSQL database hosted by Supabase:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Data is <strong className="text-white">encrypted at rest</strong> and in transit.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Supabase infrastructure is hosted on AWS.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Database access is restricted to authenticated API calls from the HridAI application layer.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">5.4 Payment Processing — Stripe</h3>
          <p className="mt-4 text-white/60 leading-7">If you subscribe to HridAI Premium:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Payment is processed by Stripe.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>We do not store your credit card number. Stripe handles all payment data.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>We receive: subscription status, billing cycle dates, and a Stripe customer ID.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">5.5 No Other Third-Party Sharing</h3>
          <p className="mt-4 text-white/60 leading-7">
            Beyond the services listed above, we do <strong className="text-white">not</strong> share your personal
            data with any third party. No data brokers, no analytics companies that see your content, no advertising
            networks. Period.
          </p>

          <h3 className="mt-8 text-xl font-semibold">5.6 Disclosure for Legal Reasons</h3>
          <p className="mt-4 text-white/60 leading-7">
            We may disclose your data if required by law, court order, or other valid legal process — for example, in response to a subpoena, search warrant, or government investigation. Where legally permitted, we will notify you before disclosing your data so that you can seek to challenge the request.
          </p>

          <h3 className="mt-8 text-xl font-semibold">5.7 Business Transfers</h3>
          <p className="mt-4 text-white/60 leading-7">
            If uFactorial is involved in a merger, acquisition, sale of assets, financing, reorganization, or bankruptcy, your data may be transferred to a successor entity as part of the transaction. We will:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Notify you in advance via email of any such transfer where reasonably possible.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Ensure the successor entity is bound by a privacy policy at least as protective as this one.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Give you the opportunity to delete your account before the transfer takes effect.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">Sub-Processor Summary</h3>
          <DataTable
            headers={["Provider", "Purpose", "Data Shared", "Provider Retention"]}
            rows={[
              ["Anthropic", "LLM conversation processing", "Conversation content", "Up to 30 days for abuse monitoring; not used for training"],
              ["OpenAI", "Text embeddings for search", "Text snippets", "Up to 30 days for abuse monitoring; not used for training"],
              ["Supabase", "Database hosting (on AWS)", "All user data", "Until we delete it"],
              ["Stripe", "Payment processing", "Payment info", "Per Stripe's privacy policy"],
            ]}
          />
          <p className="mt-4 text-white/60 leading-7">
            We will notify users via email of any new sub-processors or material changes to existing sub-processor relationships at least <strong className="text-white">30 days</strong> in advance.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 6. International Data Transfers */}
        <section>
          <h2 className="text-2xl font-bold">6. International Data Transfers</h2>
          <p className="mt-4 text-white/60 leading-7">
            uFactorial serves users globally. Your data may be processed in jurisdictions outside your home country:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Supabase</strong> infrastructure is hosted on AWS (US regions).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Anthropic</strong> and <strong className="text-white">OpenAI</strong> API processing occurs in the United States.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Stripe</strong> processes payments in the United States.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            For transfers from the European Economic Area (EEA), United Kingdom, or Switzerland to the United States, we rely on the following mechanisms as applicable:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">EU-US Data Privacy Framework</strong> (and the UK Extension and Swiss-US Framework) where the US recipient is certified.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Standard Contractual Clauses (SCCs)</strong> as adopted by the European Commission, with the equivalent IDTA or UK Addendum for UK transfers.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>The service providers' own compliance frameworks (Anthropic, OpenAI, Supabase, and Stripe each maintain their own transfer mechanisms).</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            If you are located in the EEA, UK, or Switzerland and have concerns about international transfers, contact
            us at <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 7. Data Retention */}
        <section>
          <h2 className="text-2xl font-bold">7. Data Retention</h2>
          <ul className="mt-4 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Your data is retained for as long as you have an account.</strong> We don't auto-delete your data — that's the point of a personal memory tool. All account holders are treated identically with respect to data retention regardless of subscription tier.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Inactive accounts:</strong> If you have not used your account for <strong className="text-white">24 months</strong>, we will email you to ask whether you want to keep it. If we do not hear back within <strong className="text-white">30 days</strong>, your account and all associated data will be permanently deleted. You can keep your account active simply by logging in, and you can download your data at any time before deletion.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">After account deletion:</strong> All your data is permanently deleted within <strong className="text-white">30 days</strong>. Most data is deleted immediately; the 30-day window covers backup rotation. After deletion is complete, we retain only minimal records required by law (for example: transaction records for tax compliance, abuse-prevention logs).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Technical and security logs</strong> (IP addresses, server logs): retained for 90 days on a rolling basis.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 8. Your Rights */}
        <section>
          <h2 className="text-2xl font-bold">8. Your Rights</h2>

          <h3 className="mt-8 text-xl font-semibold">8.1 Rights Under GDPR (EEA, UK, Switzerland)</h3>
          <p className="mt-4 text-white/60 leading-7">
            If you are in the European Economic Area, United Kingdom, or Switzerland, you have the right to:
          </p>
          <DataTable
            headers={["Right", "What It Means", "How to Exercise"]}
            rows={[
              [<strong className="text-white">Access</strong>, "See all data we hold about you", "Use the Vault UI in HridAI, or request a data export"],
              [<strong className="text-white">Rectification</strong>, "Correct inaccurate data", "Edit entries directly in the Vault UI"],
              [<strong className="text-white">Erasure</strong>, 'Delete your data ("right to be forgotten")', "Delete specific items in the UI, or delete your entire account"],
              [<strong className="text-white">Data portability</strong>, "Get your data in a machine-readable format", "Use the data export feature (JSON format)"],
              [<strong className="text-white">Restrict processing</strong>, "Limit how we use your data", "Contact us at privacy@ufactorial.com"],
              [<strong className="text-white">Object</strong>, "Object to processing based on legitimate interest, including profiling", "Contact us at privacy@ufactorial.com"],
              [<strong className="text-white">Not be subject to automated decisions (Art. 22)</strong>, "Not applicable here — HridAI does not make decisions producing legal or similarly significant effects", "n/a"],
              [<strong className="text-white">Withdraw consent</strong>, "Where processing is based on consent (including sensitive data), withdraw it", "Contact us or adjust settings in the app"],
              [<strong className="text-white">Lodge a complaint</strong>, "File with your local data protection authority", "Your DPA's website"],
            ]}
          />
          <p className="mt-4 text-white/60 leading-7">
            <strong className="text-white">Data export:</strong> You can export all your data at any time via the app.
            The export includes self-graph entries, entities, relationships, topics, episodes, todos, lists, and
            conversation history — everything we have — in JSON format.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            <strong className="text-white">Data deletion:</strong> You can delete your entire account and all
            associated data. Deletion requires you to type "DELETE MY DATA" as confirmation. Deletion is{" "}
            <strong className="text-white">irreversible</strong> — there is no undo. All data is removed from all
            systems within 30 days.
          </p>

          <h3 className="mt-8 text-xl font-semibold">8.2 Rights Under CCPA / CPRA (California)</h3>
          <p className="mt-4 text-white/60 leading-7">If you are a California resident, you have the right to:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Know</strong> what personal information we collect, the categories of sources, the business purposes for collection, and the categories of third parties with whom we share it (this policy, particularly Sections 2 and 5, covers that).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Correct</strong> inaccurate personal information we hold about you.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Delete</strong> your personal information (use the account deletion feature).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Opt out of sale or sharing</strong> of personal information — <strong className="text-white">we do not sell or share your personal information</strong> (as those terms are defined in the CPRA), so there is nothing to opt out of.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Limit the use of sensitive personal information</strong> — we only use sensitive personal information to provide the service you've requested, which is one of the permitted uses under the CPRA. We do not use it for any other purpose.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Non-discrimination</strong> — we will not treat you differently for exercising your rights.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            To exercise any CCPA/CPRA right, contact us at{" "}
            <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>{" "}
            or use the in-app features described above.
          </p>

          <h3 className="mt-8 text-xl font-semibold">8.3 Rights for All Users</h3>
          <p className="mt-4 text-white/60 leading-7">Regardless of where you live:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You can <strong className="text-white">see all your data</strong> in HridAI's Vault UI at any time.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You can <strong className="text-white">export all your data</strong> in JSON format at any time.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You can <strong className="text-white">delete specific items</strong> (entities, topics, conversations, etc.) at any time.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You can <strong className="text-white">delete your entire account</strong> and all data at any time.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>You can <strong className="text-white">contact us</strong> at <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a> with any questions.</span></li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 9. Data Security */}
        <section>
          <h2 className="text-2xl font-bold">9. Data Security</h2>
          <p className="mt-4 text-white/60 leading-7">
            We implement appropriate technical and organizational measures to protect your data:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Encryption at rest:</strong> All database data is encrypted at rest via Supabase/AWS encryption.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Encryption in transit:</strong> All data transmission uses TLS/HTTPS.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Authentication:</strong> API access requires authenticated sessions (JWT tokens).</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Access control:</strong> Database access is restricted to the HridAI application layer.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Password security:</strong> Passwords are hashed using industry-standard algorithms (bcrypt via Supabase Auth). We never store plaintext passwords.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">9.1 Your Security Responsibilities</h3>
          <p className="mt-4 text-white/60 leading-7">You are responsible for:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Keeping your account credentials confidential.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Notifying us immediately at <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a> if you suspect unauthorized access to your account.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Ensuring that any device you use to access HridAI is reasonably secured.</span></li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">9.2 Data Breach Notification</h3>
          <p className="mt-4 text-white/60 leading-7">In the event of a personal data breach affecting your data:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>We will notify the relevant supervisory authority within <strong className="text-white">72 hours</strong> of becoming aware of the breach, where required by GDPR Article 33.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>We will notify affected users <strong className="text-white">without undue delay</strong> where the breach is likely to result in a high risk to their rights and freedoms (GDPR Article 34) or as otherwise required by applicable law.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span>Notifications will describe the nature of the breach, likely consequences, and measures taken or proposed to address it.</span></li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 10. Cookies and Tracking */}
        <section>
          <h2 className="text-2xl font-bold">10. Cookies and Tracking</h2>
          <p className="mt-4 text-white/60 leading-7">HridAI uses:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Essential cookies:</strong> Session management and authentication. These are required for the app to function.</span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Analytics:</strong> We collect anonymized usage analytics (session timing, feature usage). This data does not include conversation content.</span></li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We do <strong className="text-white">not</strong> use:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Third-party tracking cookies</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Advertising cookies or pixels</span></li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> <span>Cross-site tracking of any kind</span></li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 11. Marketing Communications */}
        <section>
          <h2 className="text-2xl font-bold">11. Marketing Communications</h2>
          <p className="mt-4 text-white/60 leading-7">When you create an account, we may send you:</p>
          <ul className="mt-3 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Service emails</strong> — required communications about your account, billing, security incidents, or material changes to the service. You cannot opt out of these as long as your account is active.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Product updates and marketing</strong> — occasional emails about new features, tips, or related content. You can opt out at any time via the unsubscribe link in any such email or by contacting <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 12. Children's Privacy */}
        <section>
          <h2 className="text-2xl font-bold">12. Children's Privacy</h2>
          <p className="mt-4 text-white/60 leading-7">
            HridAI is not intended for users under the age of 18. We do not knowingly collect data from minors. If you
            believe a minor has created an account, contact us at{" "}
            <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>{" "}
            and we will delete the account.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 13. Changes to This Policy */}
        <section>
          <h2 className="text-2xl font-bold">13. Changes to This Policy</h2>
          <p className="mt-4 text-white/60 leading-7">
            We may update this privacy policy from time to time.
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For minor changes</strong> (clarifications, formatting, non-substantive updates): we will update the "Last Updated" date at the top of this policy.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">For material changes</strong> (changes affecting how we collect, use, share, or retain your data, or affecting your rights): we will notify you via email and/or an in-app notification at least <strong className="text-white">30 days</strong> before the changes take effect. Where required by applicable law, we will obtain your explicit consent before the material change applies to your account.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Prior versions</strong> of this policy are available on request at <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 14. Contact Us */}
        <section>
          <h2 className="text-2xl font-bold">14. Contact Us</h2>
          <p className="mt-4 text-white/60 leading-7">
            For any privacy-related questions, data requests, or concerns:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Email:</strong> <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Website:</strong> <a href="https://ufactorial.com" className="text-emerald-400 hover:underline">ufactorial.com</a></span></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <span><strong className="text-white">Response time:</strong> We aim to respond to all data-related inquiries within 30 days, as required by GDPR.</span></li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        <p className="text-white/40 text-sm italic leading-7">
          This privacy policy is written in plain language because we believe you should actually understand how your
          data is handled. If anything is unclear, please reach out — we'd rather over-explain than leave you guessing.
        </p>

        {/* Bottom nav */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-between border-t border-white/10 pt-8">
          <Link to="/" className="text-sm text-white/60 hover:text-white transition">
            Back to HridAI
          </Link>
          <div className="flex gap-4">
            <Link to="/terms" className="text-sm text-white/60 hover:text-white transition">
              Terms of Service
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
