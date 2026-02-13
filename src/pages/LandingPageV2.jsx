import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Brain,
  Eye,
  MessageCircle,
  Network,
  Zap,
  Quote,
  User,
  Users,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", href = "#", className = "" }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-black/20";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-black/90"
      : "bg-white/10 text-white hover:bg-white/15 border border-white/20";
  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}

function LightButton({
  children,
  variant = "primary",
  href = "#",
  to = null,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-black/20";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-black/90"
      : "bg-white text-black hover:bg-black/5 border border-black/10";
  if (to) {
    return (
      <Link to={to} className={`${base} ${styles} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}

/* ─── 1. NAV ─── */
function Nav() {
  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <Container className="py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/hridai-icon.png" alt="HridAI" className="h-14 w-auto" />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a className="text-sm text-black/60 hover:text-black" href="#how">How it works</a>
            <a className="text-sm text-black/60 hover:text-black" href="#explore">Try it</a>
            <a className="text-sm text-black/60 hover:text-black" href="#trust">Trust</a>
          </div>
          <div className="flex items-center gap-3">
            <LightButton href="#waitlist">Join the waitlist</LightButton>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ─── 2. HERO — pain‑first ─── */
function Hero() {
  return (
    <div className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[560px] w-[560px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <Container className="relative py-16 sm:py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          <div className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            HridAI
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl max-w-3xl mx-auto">
            The AI you were promised. Truly yours — it knows you and grows with you.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70 sm:text-xl max-w-2xl mx-auto">
            It builds memories continuously and connects them to your questions and conversations, making every response truly personal. The same intelligence you've come to expect, but focused around you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button href="#explore">
              Try HridAI <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="secondary" href="#waitlist">
              Join the waitlist
            </Button>
          </div>
          <div className="mt-4 text-xs text-white/50">
            Early access. Access code required.
          </div>
        </motion.div>
      </Container>

      <div className="h-12 bg-gradient-to-b from-black to-white" />
    </div>
  );
}

/* ─── 3. THE PROBLEM ─── */
function Problem() {
  return (
    <div className="bg-white py-16 sm:py-20">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Every AI starts with "What's on your mind?"
            </h2>
            <p className="mt-4 text-base leading-7 text-black/60">
              Shouldn't it already know?
            </p>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              text: "Every AI forgets you the moment the conversation ends.",
              sub: "ChatGPT, Gemini, Claude — flat lists of facts, no real understanding.",
            },
            {
              text: "Every productivity app needs you to organize first.",
              sub: "You're drowning in mental load, and the tool asks you to build a system.",
            },
            {
              text: "No AI today connects the dots across your life.",
              sub: "Your mom offered help. You haven't responded. Asking for help is hard for you. No AI knows all three.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-2xl border border-black/10 bg-black/[0.02] p-6"
            >
              <p className="text-base font-semibold text-black">{item.text}</p>
              <p className="mt-2 text-sm leading-6 text-black/55">{item.sub}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  );
}

/* ─── 4. THE EXAMPLE — interactive scenarios ─── */
const scenarios = [
  {
    label: "Work stress",
    emoji: "💼",
    user: "Ugh.. I hate my job!",
    ai: "Sorry to hear that. Is it another issue with John or just challenges with project Lira? Not now, but when you are ready, we can use that energy and finish the resume update that's on your todo. I can set a todo to send it to the recruiter that reached out a few days ago.",
    context: [
      { icon: "brain", color: "text-violet-500", title: "Memory recalled", text: '"Recruiter from Stripe reached out" — mentioned 5 days ago' },
      { icon: "network", color: "text-blue-500", title: "Context connected", text: "3 work stress related stories detected recently" },
      { icon: "zap", color: "text-amber-500", title: "Pending Todos", text: "Recruiter follow-up · Resume refresh" },
    ],
    people: [
      { name: "John", relation: "Colleague" },
      { name: "Project Lira", relation: "Project" },
    ],
  },
  {
    label: "Family",
    emoji: "👨‍👩‍👧",
    user: "My mom offered to watch the kids this weekend.",
    ai: "That's great — you mentioned last week you and Sarah haven't had a date night since March. Want me to add a dinner reservation to your todos? I also remember Sarah saying she wanted to try that new Italian place in Hoboken.",
    context: [
      { icon: "brain", color: "text-violet-500", title: "Memory recalled", text: '"Haven\'t had a date night since March" — mentioned last week' },
      { icon: "network", color: "text-blue-500", title: "Context connected", text: "Sarah's restaurant preference linked to your shared interests" },
      { icon: "zap", color: "text-amber-500", title: "Pending Todos", text: "Plan date night · Reply to mom" },
    ],
    people: [
      { name: "Samantha", relation: "Mom" },
      { name: "Max", relation: "Child (6 mo)" },
      { name: "Judy", relation: "Child (3 yr)" },
      { name: "Sarah", relation: "Wife" },
    ],
  },
  {
    label: "Health",
    emoji: "🏃",
    user: "I've been so tired lately.",
    ai: "I've noticed you've mentioned feeling tired three times this month. Your sleep has been shorter since you started the new project two weeks ago. Is Max still waking up every 3 hours? I can set a reminder to wind down by 10pm on work nights, so you get a few hours before the first time Max is up.",
    context: [
      { icon: "brain", color: "text-violet-500", title: "Memory recalled", text: '"Feeling exhausted" — mentioned 3 times in 2 weeks' },
      { icon: "network", color: "text-blue-500", title: "Context connected", text: "Sleep pattern shift correlates with new project start" },
      { icon: "zap", color: "text-amber-500", title: "Pending Todos", text: "10pm wind-down reminder" },
    ],
    people: [
      { name: "Project Lira", relation: "Project" },
      { name: "Max", relation: "Child (6 mo)" },
    ],
  },
];

const contextIcons = {
  brain: Brain,
  network: Network,
  zap: Zap,
};

function Example() {
  const [active, setActive] = React.useState(0);
  const s = scenarios[active];

  return (
    <div className="bg-white py-16 sm:py-20">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-wide text-black/50">SEE IT IN ACTION</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              You shouldn't have to manage your life alone.
            </h2>
          </div>
        </motion.div>

        {/* Scenario pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {scenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active === i
                  ? "bg-black text-white"
                  : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08] hover:text-black"
              }`}
            >
              {sc.emoji} {sc.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          {/* Conversation */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div
              key={`user-${active}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="text-xs font-semibold text-black/50">You</div>
              <div className="mt-2 text-lg font-semibold text-black">
                "{s.user}"
              </div>
            </motion.div>

            <motion.div
              key={`ai-${active}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="text-xs font-semibold text-black/50">HridAI</div>
              <div className="mt-2 text-base leading-7 text-black/80">
                {s.ai}
              </div>
            </motion.div>
          </div>

          {/* Context panel */}
          <motion.div
            key={`ctx-${active}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="lg:col-span-5 space-y-3"
          >
            <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
              <div className="text-xs font-semibold text-black/50 mb-3">Why HridAI knew this</div>

              <div className="space-y-3">
                {s.context.map((ctx, i) => {
                  const Icon = contextIcons[ctx.icon];
                  return (
                    <div key={i} className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${ctx.color}`} />
                        <div className="text-xs font-semibold text-black/50">{ctx.title}</div>
                      </div>
                      <div className="mt-2 text-sm text-black/75">
                        {ctx.text}
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                    <div className="text-xs font-semibold text-black/50">Related people / entities</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.people.map((p, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/70">
                        <span className="font-medium text-black/90">{p.name}</span>
                        <span className="text-black/40">·</span>
                        <span>{p.relation}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 text-lg sm:text-xl text-black/50">
          This is the difference between an AI that responds and an AI that <span className="text-black/70 font-medium">understands</span>.
        </div>
      </Container>
    </div>
  );
}

/* ─── 5. HOW IT'S DIFFERENT — 3 cards, not 6 ─── */
function Differentiators() {
  return (
    <div id="how" className="bg-white py-16 sm:py-20">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="max-w-2xl">
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Not another chatbot. A personal AI that earns your trust.
            </h2>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-2 w-fit">
              <Network className="h-5 w-5" />
            </div>
            <div className="mt-4 text-base font-semibold text-black">
              Remembers relationally, not as a flat list
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              HridAI connects your people, goals, and experiences in a knowledge graph — so it understands how your mom's offer to help relates to your struggle with asking for it.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-2 w-fit">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="mt-4 text-base font-semibold text-black">
              Proactive — checks in without being asked
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              HridAI follows up on things you mentioned, surfaces relevant context at the right moment, and takes action — like a life manager who actually cares.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-2 w-fit">
              <Eye className="h-5 w-5" />
            </div>
            <div className="mt-4 text-base font-semibold text-black">
              Transparent — you see what it knows, always
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              Every memory is visible. Every retrieval is explained. Edit or delete anything, anytime. Trust isn't assumed — it's earned through transparency.
            </p>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

/* ─── 6. SOCIAL PROOF ─── */
function SocialProof() {
  return (
    <div className="bg-black/[0.02] py-16 sm:py-20">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-8 w-8 text-black/20 mx-auto mb-6" />
            <blockquote className="text-xl leading-9 font-medium text-black/80 sm:text-2xl">
              "It was the first time something actually understood me — not just what I said, but why I was feeling that way."
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                <User className="h-5 w-5 text-black/40" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-black/70">Early user</div>
                <div className="text-xs text-black/50">Used HridAI during postpartum recovery</div>
              </div>
            </div>
          </div>
        </motion.div>


      </Container>
    </div>
  );
}

/* ─── 7. EXPLORE / DEMO ─── */
function Explore() {
  return (
    <div id="explore" className="bg-white py-16 sm:py-20">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="max-w-2xl">
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Explore HridAI
            </h2>
            <p className="mt-3 text-base leading-7 text-black/70">
              Early access. Access code required. Join the waitlist to receive it.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="group rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-black">Try it yourself</div>
              <ArrowRight className="h-5 w-5 text-black/50 transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              Start fresh and watch memory and actions form in real time as you chat.
            </p>
            <div className="mt-5">
              <LightButton to="/demo">Try HridAI</LightButton>
            </div>
          </div>

          <div className="group rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-black">Simulated demo</div>
              <ArrowRight className="h-5 w-5 text-black/50 transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              We had AI create three unique personas and simulated conversations between them and their HridAI. Choose a persona and chat as them to see it in action.
            </p>
            <div className="mt-5">
              <LightButton to="/demo" variant="secondary">See it in action</LightButton>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ─── 8. TRUST ─── */
function Trust() {
  return (
    <div id="trust" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-black/10 bg-white p-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-black">Trust by design</div>
              <div className="mt-1 text-sm text-black/70">
                For an AI to manage your life, it has to earn the right. Here's how.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-semibold text-black/50">Transparent memory</div>
              <div className="mt-2 text-sm text-black/75">
                See exactly what HridAI remembers and why it recalled something — in real time, every conversation.
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-semibold text-black/50">You're in control</div>
              <div className="mt-2 text-sm text-black/75">
                Edit, correct, or delete any memory at any time. What stays is always your choice.
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-semibold text-black/50">Private by default</div>
              <div className="mt-2 text-sm text-black/75">
                Your data is encrypted, isolated per user, and never shared. Row-level security in the database.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ─── 9. FOUNDER STORY ─── */
function FounderStory() {
  return (
    <div className="bg-white py-16 sm:py-20">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-wide text-black/50">WHY THIS EXISTS</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Built by someone who needed it
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-black/70">
              <p>
                I'm Pratik — 15 years in data and AI, including building and deploying AI products for Fortune 100 clients. When our first child was born, life became unmanageable. Everything in my head, everything falling through. Every AI made me re-explain my situation from scratch. Every productivity app needed me to organize first. And most importantly, I didn't trust any app to use my data for me.
              </p>
              <p>
                So, with a bold vision, I built HridAI — an app that puts you at the center of its intelligence. When my wife used an early prototype during her postpartum experience and said it was the first time something actually understood her, I knew this had to exist for everyone.
              </p>
              <p className="text-black/90 font-medium">
                The gap isn't intelligence. It's trust — an AI that remembers your life, shows you what it knows, and earns the right to help manage it.
              </p>
              <p>
                We are just getting started and have a long way to go. That's why I founded uFactorial — because it starts with you. Our mission is to build AI that unlocks your potential, not just answers your questions. I hope HridAI inspires a new generation of AI built for the benefit of the individual, the community, and humanity at large — slowly and surely building trust in a movement of AI for good.
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}

/* ─── 10. WAITLIST (reused from v1) ─── */
function Waitlist() {
  const iframeRef = React.useRef(null);

  React.useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const referrer = document.referrer || "";
    const utmSource =
      new URLSearchParams(window.location.search).get("utm_source") || "";
    const ua = navigator.userAgent || "";
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobi)/i.test(ua);
    const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

    const params = new URLSearchParams({
      alignLeft: "1",
      hideTitle: "1",
      transparentBackground: "1",
      dynamicHeight: "1",
      timezone: tz,
      referrer,
      utm_source: utmSource,
      device,
    });
    const embedUrl = `https://tally.so/embed/Pd5BOQ?${params.toString()}`;

    if (iframeRef.current) {
      iframeRef.current.dataset.tallySrc = embedUrl;
    }

    const widgetUrl = "https://tally.so/widgets/embed.js";
    const load = () => {
      if (typeof window.Tally !== "undefined") {
        window.Tally.loadEmbeds();
      } else {
        document
          .querySelectorAll("iframe[data-tally-src]:not([src])")
          .forEach((el) => {
            el.src = el.dataset.tallySrc;
          });
      }
    };
    if (typeof window.Tally !== "undefined") {
      load();
    } else if (!document.querySelector(`script[src="${widgetUrl}"]`)) {
      const s = document.createElement("script");
      s.src = widgetUrl;
      s.onload = load;
      s.onerror = load;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div id="waitlist" className="bg-white py-16 sm:py-20">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="max-w-2xl">
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              Join the waitlist
            </h2>
            <p className="mt-3 text-base leading-7 text-black/70">
              Join the waitlist for our next batch of early access.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 max-w-xl">
          <iframe
            ref={iframeRef}
            data-tally-src="https://tally.so/embed/Pd5BOQ?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
            loading="lazy"
            width="100%"
            height="400"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            title="Join the waitlist"
          />
        </div>
      </Container>
    </div>
  );
}

/* ─── 11. FOOTER ─── */
function Footer() {
  return (
    <div className="border-t border-black/10 bg-white py-10">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src="/hridai-icon.png" alt="HridAI" className="h-8 w-auto" />
            </Link>
            <div className="mt-1 text-xs text-black/55">
              © {new Date().getFullYear()} uFactorial. All rights reserved.
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <div className="flex items-center gap-5 text-sm">
              <a className="text-black/70 hover:text-black" href="#trust">Trust</a>
              <a className="text-black/70 hover:text-black" href="#how">How it works</a>
              <a className="text-black/70 hover:text-black" href="#explore">Explore</a>
              <a className="text-black/70 hover:text-black" href="#waitlist">Waitlist</a>
            </div>
            <a href="mailto:contactus@ufactorial.com" className="text-sm text-black/50 hover:text-black transition">
              contactus@ufactorial.com
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ─── PAGE ASSEMBLY ─── */
export default function LandingPageV2() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Problem />
      <Example />
      <Differentiators />
      <SocialProof />
      <Explore />
      <Trust />
      <FounderStory />
      <Waitlist />
      <Footer />
    </div>
  );
}
