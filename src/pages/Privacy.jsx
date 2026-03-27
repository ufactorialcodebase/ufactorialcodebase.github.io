import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-4xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
      <div className="grid gap-px bg-white/5" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
        {headers.map((h, i) => (
          <div key={i} className="bg-white/10 px-4 py-3 text-sm font-semibold text-white">
            {h}
          </div>
        ))}
        {rows.map((row, ri) =>
          row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className="bg-white/[0.03] px-4 py-3 text-sm text-white/60">
              {cell}
            </div>
          ))
        )}
      </div>
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
          <span>Effective Date: March 26, 2026</span>
          <span>Last Updated: March 26, 2026</span>
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
          <h3 className="mt-8 text-xl font-semibold">2.3 Data We Collect Automatically</h3>
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
              ["Manage your subscription", "Performance of contract", "Account info, payment data (via Stripe)"],
              ["Improve the product", "Legitimate interest", "Aggregated, anonymized usage analytics"],
              ["Prevent abuse", "Legitimate interest", "Account info, usage patterns"],
              ["Comply with legal obligations", "Legal obligation", "As required by applicable law"],
            ]}
          />
          <p className="mt-6 text-white/60 leading-7">
            We do <strong className="text-white">not</strong> use your data to:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> Train AI models</li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> Serve advertisements</li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> Build profiles for third parties</li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> Make automated decisions that affect your legal rights</li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 4. Who Sees Your Data */}
        <section>
          <h2 className="text-2xl font-bold">4. Who Sees Your Data</h2>

          <h3 className="mt-8 text-xl font-semibold">4.1 LLM Processing — Anthropic (Claude API)</h3>
          <p className="mt-4 text-white/60 leading-7">
            When you send a message in HridAI, your conversation content is sent to Anthropic's Claude API for
            processing. Here's what that means:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Anthropic processes your message and returns a response.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Anthropic does not store your conversation data</strong> beyond the duration of the API call.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Anthropic does not use your data to train their models (per their API data usage policy).</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> This is a stateless API call — once the response is returned, your data is not retained by Anthropic.</li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">4.2 Embeddings — OpenAI API</h3>
          <p className="mt-4 text-white/60 leading-7">
            To enable semantic search within your data, we generate text embeddings using OpenAI's
            text-embedding-3-small model. This means:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Text snippets are sent to OpenAI's API to generate numerical vector representations.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">OpenAI does not store your data</strong> beyond the duration of the API call (per their API data usage policy).</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> The embeddings (numerical vectors, not readable text) are stored in our database for search functionality.</li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">4.3 Data Storage — Supabase</h3>
          <p className="mt-4 text-white/60 leading-7">Your data is stored in a PostgreSQL database hosted by Supabase:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Data is <strong className="text-white">encrypted at rest</strong> and in transit.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Supabase infrastructure is hosted on AWS.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Database access is restricted to authenticated API calls from HridAI.</li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">4.4 Payment Processing — Stripe</h3>
          <p className="mt-4 text-white/60 leading-7">If you subscribe to HridAI Premium:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Payment is processed by Stripe.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> We do not store your credit card number. Stripe handles all payment data.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> We receive: subscription status, billing cycle dates, and a Stripe customer ID.</li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">4.5 No Other Third-Party Sharing</h3>
          <p className="mt-4 text-white/60 leading-7">
            Beyond the services listed above, we do <strong className="text-white">not</strong> share your personal
            data with any third party. No data brokers, no analytics companies that see your content, no advertising
            networks. Period.
          </p>

          <h3 className="mt-8 text-xl font-semibold">Sub-Processor Summary</h3>
          <DataTable
            headers={["Provider", "Purpose", "Data Shared", "Retention by Provider"]}
            rows={[
              ["Anthropic", "LLM conversation processing", "Conversation content", "None (stateless API)"],
              ["OpenAI", "Text embeddings for search", "Text snippets", "None (stateless API)"],
              ["Supabase", "Database hosting", "All user data", "Until we delete it"],
              ["Stripe", "Payment processing", "Payment info", "Per Stripe's policy"],
            ]}
          />
        </section>

        <hr className="my-10 border-white/10" />

        {/* 5. International Data Transfers */}
        <section>
          <h2 className="text-2xl font-bold">5. International Data Transfers</h2>
          <p className="mt-4 text-white/60 leading-7">
            uFactorial serves users globally. Your data may be processed in jurisdictions outside your home country:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Supabase</strong> infrastructure is hosted on AWS (US regions).</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Anthropic</strong> and <strong className="text-white">OpenAI</strong> API processing occurs in the United States.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Stripe</strong> processes payments in the United States.</li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            For transfers from the European Economic Area (EEA), UK, or Switzerland, we rely on:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Standard Contractual Clauses (SCCs) where applicable</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> The service providers' own compliance frameworks (Anthropic, OpenAI, Supabase, and Stripe each maintain their own transfer mechanisms)</li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            If you are located in the EEA, UK, or Switzerland and have concerns about international transfers, contact
            us at <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 6. Data Retention */}
        <section>
          <h2 className="text-2xl font-bold">6. Data Retention</h2>
          <ul className="mt-4 space-y-3 text-white/60 leading-7">
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Your data is retained for as long as you have an account.</strong> We don't auto-delete your data — that's the point of a personal memory tool.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Free tier:</strong> Memory depth is limited to 14 days. Conversations older than 14 days are not actively processed, but the raw conversation data is retained.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">Premium tier:</strong> Full memory depth — all data retained and actively processed.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">•</span>
              <span><strong className="text-white">After account deletion:</strong> All your data is permanently deleted within <strong className="text-white">30 days</strong>. Most data is deleted immediately; the 30-day window covers cleanup of orphaned references and backup rotation.</span>
            </li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 7. Your Rights */}
        <section>
          <h2 className="text-2xl font-bold">7. Your Rights</h2>

          <h3 className="mt-8 text-xl font-semibold">7.1 Rights Under GDPR (EEA, UK, Switzerland)</h3>
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
              [<strong className="text-white">Object</strong>, "Object to processing based on legitimate interest", "Contact us at privacy@ufactorial.com"],
              [<strong className="text-white">Withdraw consent</strong>, "Where processing is based on consent, withdraw it", "Contact us or adjust settings in the app"],
            ]}
          />
          <p className="mt-4 text-white/60 leading-7">
            You also have the right to lodge a complaint with your local data protection authority.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            <strong className="text-white">Data export:</strong> You can export all your data at any time via the app.
            The export includes: self-graph entries, entities, relationships, topics, episodes, todos, lists, and
            conversation history — everything we have — in JSON format.
          </p>
          <p className="mt-4 text-white/60 leading-7">
            <strong className="text-white">Data deletion:</strong> You can delete your entire account and all
            associated data. Deletion requires you to type "DELETE MY DATA" as confirmation. Deletion is{" "}
            <strong className="text-white">irreversible</strong> — there is no undo. All data is removed from all
            tables within 30 days.
          </p>

          <h3 className="mt-8 text-xl font-semibold">7.2 Rights Under CCPA (California)</h3>
          <p className="mt-4 text-white/60 leading-7">If you are a California resident, you have the right to:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Know</strong> what personal information we collect and how we use it (this policy covers that)</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Delete</strong> your personal information (use the account deletion feature)</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Opt-out of sale</strong> of personal information — <strong className="text-white">we do not sell your personal information</strong>, so there is nothing to opt out of</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Non-discrimination</strong> — we will not treat you differently for exercising your rights</li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            To exercise any CCPA right, contact us at{" "}
            <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>{" "}
            or use the in-app features described above.
          </p>

          <h3 className="mt-8 text-xl font-semibold">7.3 Rights for All Users</h3>
          <p className="mt-4 text-white/60 leading-7">Regardless of where you live:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> You can <strong className="text-white">see all your data</strong> in HridAI's Vault UI at any time.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> You can <strong className="text-white">export all your data</strong> in JSON format at any time.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> You can <strong className="text-white">delete specific items</strong> (entities, topics, conversations, etc.) at any time.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> You can <strong className="text-white">delete your entire account</strong> and all data at any time.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> You can <strong className="text-white">contact us</strong> at <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a> with any questions.</li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 8. Data Security */}
        <section>
          <h2 className="text-2xl font-bold">8. Data Security</h2>
          <p className="mt-4 text-white/60 leading-7">
            We implement appropriate technical and organizational measures to protect your data:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Encryption at rest:</strong> All database data is encrypted at rest via Supabase/AWS encryption.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Encryption in transit:</strong> All data transmission uses TLS/HTTPS.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Authentication:</strong> API access requires authenticated sessions (JWT tokens).</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Access control:</strong> Database access is restricted to the HridAI application layer.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Password security:</strong> Passwords are hashed using industry-standard algorithms (bcrypt via Supabase Auth). We never store plaintext passwords.</li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 9. Cookies and Tracking */}
        <section>
          <h2 className="text-2xl font-bold">9. Cookies and Tracking</h2>
          <p className="mt-4 text-white/60 leading-7">HridAI uses:</p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Essential cookies:</strong> Session management and authentication. These are required for the app to function.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Analytics:</strong> We collect anonymized usage analytics (session timing, feature usage). This data does not include conversation content.</li>
          </ul>
          <p className="mt-4 text-white/60 leading-7">
            We do <strong className="text-white">not</strong> use:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-red-400">✕</span> Third-party tracking cookies</li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> Advertising cookies or pixels</li>
            <li className="flex gap-3"><span className="text-red-400">✕</span> Cross-site tracking of any kind</li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 10. Children's Privacy */}
        <section>
          <h2 className="text-2xl font-bold">10. Children's Privacy</h2>
          <p className="mt-4 text-white/60 leading-7">
            HridAI is not intended for users under the age of 18. We do not knowingly collect data from minors. If you
            believe a minor has created an account, contact us at{" "}
            <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a>{" "}
            and we will delete the account.
          </p>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 11. Changes to This Policy */}
        <section>
          <h2 className="text-2xl font-bold">11. Changes to This Policy</h2>
          <p className="mt-4 text-white/60 leading-7">
            We may update this privacy policy from time to time. When we do:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> We will update the "Last Updated" date at the top.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> For material changes, we will notify you via email and/or an in-app notification.</li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> Continued use of HridAI after changes take effect constitutes acceptance of the updated policy.</li>
          </ul>
        </section>

        <hr className="my-10 border-white/10" />

        {/* 12. Contact Us */}
        <section>
          <h2 className="text-2xl font-bold">12. Contact Us</h2>
          <p className="mt-4 text-white/60 leading-7">
            For any privacy-related questions, data requests, or concerns:
          </p>
          <ul className="mt-3 space-y-2 text-white/60 leading-7">
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Email:</strong> <a href="mailto:privacy@ufactorial.com" className="text-emerald-400 hover:underline">privacy@ufactorial.com</a></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Website:</strong> <a href="https://ufactorial.com" className="text-emerald-400 hover:underline">ufactorial.com</a></li>
            <li className="flex gap-3"><span className="text-emerald-400">•</span> <strong className="text-white">Response time:</strong> We aim to respond to all data-related inquiries within 30 days, as required by GDPR.</li>
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
          <Link to="/terms" className="text-sm text-white/60 hover:text-white transition">
            Terms of Service
          </Link>
        </div>
      </Container>
    </div>
  );
}
