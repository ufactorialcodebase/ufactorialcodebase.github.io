import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Network, Wand2, Eye, Trash2, UserRound } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

function PillarCard({ icon: Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-black/10 bg-black/[0.03] p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-black">{title}</div>
          <div className="mt-1 text-sm leading-6 text-black/70">{body}</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ kicker, title, body }) {
  return (
    <div className="max-w-2xl">
      {kicker ? (
        <div className="text-xs font-semibold tracking-wide text-black/50">{kicker}</div>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">{title}</h2>
      {body ? <p className="mt-3 text-base leading-7 text-black/70">{body}</p> : null}
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

function LightButton({ children, variant = "primary", href = "#", className = "" }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-black/20";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-black/90"
      : "bg-white text-black hover:bg-black/5 border border-black/10";

  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}

function Nav() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <Container className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Brand assets (add these files to /public):
                - /ufactorial-mark.png  (logo only)
                - /ufactorial-lockup.png (logo + name)
            */}
            <img
              src="/ufactorial-mark.png"
              alt="Ufactorial"
              className="h-8 w-8 rounded-xl"
            />
            <img
              src="/ufactorial-lockup.png"
              alt="Ufactorial"
              className="hidden h-7 w-auto sm:block"
            />
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a className="text-sm text-white/70 hover:text-white" href="#product">
              Product
            </a>
            <a className="text-sm text-white/70 hover:text-white" href="#how">
              How it works
            </a>
            <a className="text-sm text-white/70 hover:text-white" href="#trust">
              Trust
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button href="#explore">Explore</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 right-[-140px] h-[560px] w-[560px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <Container className="relative py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="lg:col-span-5"
          >
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              HrdAI is a personal AI manager that remembers—and acts.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/70 sm:text-lg">
              HrdAI turns conversations into structured memory and next-best actions across your goals,
              relationships, and life admin.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="#explore">
                Explore HrdAI <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="secondary" href="#footer">
                Request a demo
              </Button>
            </div>
            <div className="mt-4 text-xs text-white/55">Guided demo. No login required.</div>
          </motion.div>

          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl">
              {/* Video */}
              <video
                className="h-[300px] w-full object-cover sm:h-[420px]"
                autoPlay
                muted
                loop
                playsInline
                poster="/hero-poster.jpg"
              >
                {/* Replace these with your generated loop */}
                <source src="/hero-loop.webm" type="video/webm" />
                <source src="/hero-loop.mp4" type="video/mp4" />
              </video>

              {/* Minimal overlay labels */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white/80">
                  Memory
                </div>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white/80">
                  Context
                </div>
                <div className="absolute bottom-5 right-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white/80">
                  Action
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/50">
              Tip: replace <span className="font-mono">/hero-loop.mp4</span> with your cinematic loop.
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Transition band */}
      <div className="relative">
        <div className="h-12 bg-gradient-to-b from-black to-white" />
      </div>
    </div>
  );
}

function Pillars() {
  return (
    <div id="product" className="bg-white py-14 sm:py-18">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <SectionHeader
            title="Built for real life, not just chat."
            body="HrdAI is designed to keep context durable and useful—and to reduce the mental overhead of keeping track of everything."
          />
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PillarCard
            icon={Sparkles}
            title="Grows with you"
            body="Grows with every conversation—remembering, understanding, and connecting context over time."
          />
          <PillarCard
            icon={Network}
            title="Understands your world and network"
            body="Connects your people, relationships, and the details that shape decisions."
          />
          <PillarCard
            icon={Wand2}
            title="Proactive, not just responsive"
            body="Talks, asks, suggests, reminds, recommends, and takes action—at the right time."
          />
          <PillarCard
            icon={Eye}
            title="Intelligence and wisdom"
            body="Blends intelligence with your wisdom—so help feels personal, grounded, and right for you."
          />
          <PillarCard
            icon={Trash2}
            title="You decide what it should hear, remember, and forget"
            body="Review, edit, or remove memory anytime—so what stays is always your choice."
          />
          <PillarCard
            icon={UserRound}
            title="Truly yours"
            body="Not a general assistant. Yours from day one—forever."
          />
        </div>
      </Container>
    </div>
  );
}

function ThirtySeconds() {
  return (
    <div className="bg-white py-14 sm:py-18">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <SectionHeader title="A small moment. A better outcome." />
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold text-black/50">User</div>
              <div className="mt-2 text-lg font-semibold text-black">“I hate my job.”</div>

              <div className="mt-6 text-xs font-semibold text-black/50">HrdAI</div>
              <div className="mt-2 text-base leading-7 text-black/80">
                That sounds exhausting. Want to take one small step today—follow up with your recruiter and open a
                resume task?
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
              <div className="text-xs font-semibold text-black/50">System</div>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-xs font-semibold text-black/50">Memory updated</div>
                  <div className="mt-2 text-sm text-black/75">Work stress • Career change</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-xs font-semibold text-black/50">Action created</div>
                  <div className="mt-2 text-sm text-black/75">Recruiter follow-up • Resume refresh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function HowItWorks() {
  return (
    <div id="how" className="bg-white py-14 sm:py-18">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <SectionHeader title="How HrdAI works" />
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-black">Capture</div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              Bring in what matters—conversation, snippets, and key moments.
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-black">Organize</div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              Convert signal into structured memory: people, goals, preferences, and context.
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-black">Act</div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              Use memory to respond well—and move things forward with helpful actions.
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-black/60">Designed to be proactive, explainable, and user-controlled.</div>
      </Container>
    </div>
  );
}

function ExploreTeaser() {
  return (
    <div id="explore" className="bg-white py-14 sm:py-18">
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <SectionHeader title="Explore HrdAI" body="Choose a guided demo, or watch curated journeys." />
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="group rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-black">Try it yourself</div>
              <ArrowRight className="h-5 w-5 text-black/50 transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              Chat with a guided profile and watch memory and actions form in real time.
            </p>
            <div className="mt-5">
              <LightButton href="#">Start the demo</LightButton>
            </div>
            <div className="mt-6 h-24 rounded-2xl border border-black/10 bg-black/[0.03]" />
          </div>

          <div className="group rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-black">See it in action</div>
              <ArrowRight className="h-5 w-5 text-black/50 transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-2 text-sm leading-6 text-black/70">
              Choose a persona journey and see how HrdAI builds context over time.
            </p>
            <div className="mt-5">
              <LightButton href="#" variant="secondary">
                View journeys
              </LightButton>
            </div>
            <div className="mt-6 h-24 rounded-2xl border border-black/10 bg-black/[0.03]" />
          </div>
        </div>

        <div className="mt-4 text-xs text-black/55">No setup required. You can reset the demo at any time.</div>
      </Container>
    </div>
  );
}

function TrustStrip() {
  return (
    <div id="trust" className="bg-white py-14 sm:py-18">
      <Container>
        <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-black/10 bg-white p-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-black">Trust by design</div>
              <div className="mt-1 text-sm text-black/70">You can see what gets saved—and control what stays.</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-semibold text-black/50">Visible memory</div>
              <div className="mt-2 text-sm text-black/75">See what gets saved.</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-semibold text-black/50">Editable</div>
              <div className="mt-2 text-sm text-black/75">Edit or delete anytime.</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-semibold text-black/50">Demo-safe</div>
              <div className="mt-2 text-sm text-black/75">Avoid sensitive personal info.</div>
            </div>
          </div>

          <div className="mt-6">
            <LightButton href="#">Read Trust &amp; Privacy</LightButton>
          </div>
        </div>
      </Container>
    </div>
  );
}

function FinalCTA() {
  return (
    <div className="bg-white pb-16">
      <Container>
        <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
          <div className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            See what it feels like when your AI remembers.
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LightButton href="#explore">
              Explore HrdAI <ArrowRight className="ml-2 h-4 w-4" />
            </LightButton>
            <LightButton href="#" variant="secondary">
              Request a demo
            </LightButton>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Footer() {
  return (
    <div id="footer" className="border-t border-black/10 bg-white py-10">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/ufactorial-mark.png"
                alt="Ufactorial"
                className="h-7 w-7 rounded-lg"
              />
              <img
                src="/ufactorial-lockup.png"
                alt="Ufactorial"
                className="h-6 w-auto"
              />
            </div>
            <div className="mt-1 text-xs text-black/55">Demo mode: avoid sensitive personal information. Reset anytime.</div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <a className="text-black/70 hover:text-black" href="#trust">
              Trust
            </a>
            <a className="text-black/70 hover:text-black" href="#how">
              How it works
            </a>
            <a className="text-black/70 hover:text-black" href="#explore">
              Explore
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function HrdAIHomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Pillars />
      <ThirtySeconds />
      <HowItWorks />
      <ExploreTeaser />
      <TrustStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}
