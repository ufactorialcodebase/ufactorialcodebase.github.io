import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-4xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

const contacts = [
  {
    address: "support@ufactorial.com",
    label: "General Support",
    description: "Product help, billing questions, and how-to guidance.",
  },
  {
    address: "privacy@ufactorial.com",
    label: "Privacy",
    description:
      "Data subject access requests (DSARs), GDPR/CCPA rights, profiling objections, marketing opt-out, children's privacy concerns, and AI output corrections.",
  },
  {
    address: "legal@ufactorial.com",
    label: "Legal",
    description:
      "Informal dispute resolution, requests for prior policy versions, and formal legal correspondence.",
  },
  {
    address: "abuse@ufactorial.com",
    label: "Abuse Reports",
    description:
      "Reports of Acceptable Use Policy violations and third-party harm.",
  },
  {
    address: "security@ufactorial.com",
    label: "Security",
    description:
      "Account compromise reports, vulnerability disclosure, and breach reporting.",
  },
];

export default function Contact() {
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
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-sm text-white/60 hover:text-white transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-white/60 hover:text-white transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="mt-4 text-white/60 leading-7">
          Reach us at the address that best matches your inquiry. All addresses below are <strong className="text-white">@ufactorial.com</strong>.
        </p>

        <div className="mt-10 space-y-4">
          {contacts.map(({ address, label, description }) => (
            <div
              key={address}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-lg border border-white/10 bg-white/5 p-2">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <h2 className="text-base font-semibold text-white">{label}</h2>
                    <a
                      href={`mailto:${address}`}
                      className="text-sm text-emerald-400 hover:underline break-all"
                    >
                      {address}
                    </a>
                  </div>
                  <p className="mt-2 text-sm text-white/50 leading-6">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="my-10 border-white/10" />

        <div>
          <h2 className="text-xl font-semibold">Mailing Address</h2>
          <p className="mt-4 text-white/60 leading-7">uFactorial LLC, New Jersey, USA.</p>
          <p className="mt-2 text-white/40 italic leading-7">
            Full mailing address coming soon — currently being established with our registered agent. For any correspondence requiring a physical address in the interim, please email{" "}
            <a href="mailto:legal@ufactorial.com" className="text-emerald-400 hover:underline">legal@ufactorial.com</a>.
          </p>
        </div>

        <hr className="my-10 border-white/10" />

        <p className="text-white/40 text-sm italic leading-7">
          We aim to respond to all inquiries within a reasonable timeframe. For privacy-related requests (DSARs), we respond within 30 days as required by GDPR.
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
            <Link to="/terms" className="text-sm text-white/60 hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
