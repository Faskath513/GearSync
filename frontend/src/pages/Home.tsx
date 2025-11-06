import React from "react";
import {
  Car,
  Wrench,
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Shield,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import ChatWidget from "../components/ChatWidget";

/**
 * Enhanced Home component
 * - Refined color palette using cool darks with cyan/indigo accents
 * - Better hierarchy, spacing, and readable contrasts
 * - Accessible focus states, semantic landmarks, and ARIA labels
 * - Subtle motion on scroll & hover for delight without distraction
 * - Clear primary actions (Book Appointment / Chat with AI)
 */

const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400"; // primary accent sweep

const cardClass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";

const btnBase =
  "inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-slate-950 transition";

const Home: React.FC = () => {
  const features = [
    {
      icon: <Calendar className="w-7 h-7" />,
      title: "Easy Appointment Booking",
      description:
        "Schedule service in seconds with our streamlined online booking.",
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: "Real‑Time Progress Tracking",
      description:
        "Live status updates, ETA, and approvals right from your phone.",
    },
    {
      icon: <Wrench className="w-7 h-7" />,
      title: "Certified Technicians",
      description:
        "Dealer‑level expertise with quality parts and guaranteed work.",
    },
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: "AI Assistant",
      description:
        "Instant answers about availability, pricing, and service prep.",
    },
  ];

  const services = [
    "Oil Change & Filter Replacement",
    "Brake Inspection & Repair",
    "Engine Diagnostics",
    "Transmission Service",
    "AC System Maintenance",
    "Tire Rotation & Alignment",
    "Battery Testing & Replacement",
    "Custom Modifications",
  ];

  const steps = [
    {
      title: "Book",
      text: "Pick a time that works for you. We’ll confirm instantly.",
    },
    {
      title: "Drop‑off / Pickup",
      text: "Choose curbside, in‑shop, or pickup & delivery.",
    },
    {
      title: "Track",
      text: "Approve jobs, chat, and follow progress in real time.",
    },
    {
      title: "Drive",
      text: "Quality‑checked and ready. 90‑day workmanship guarantee.",
    },
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Backdrop: layered gradient + radial highlights + subtle grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)",
          }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pt-14 md:pt-24 pb-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Your Vehicle's
                <span
                  className={`block bg-clip-text text-transparent ${ACCENT_GRADIENT}`}
                >
                  Service Partner
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg md:text-xl text-slate-300/90 leading-relaxed">
                Professional service management with real‑time tracking, effortless
                booking, and certified technicians—designed for speed and trust.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#book"
                  className={`${btnBase} ${ACCENT_GRADIENT} text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110`}
                  aria-label="Book an appointment"
                >
                  <Calendar className="w-5 h-5" /> Book now
                </a>
                <a
                  href="#chat"
                  className={`${btnBase} bg-white/10 border border-white/10 hover:bg-white/15`}
                  aria-label="Chat with AI assistant"
                >
                  <MessageCircle className="w-5 h-5" /> Chat with AI
                </a>
                <div className="flex items-center gap-2 text-sm text-slate-300/80 ml-1">
                  <Shield className="w-4 h-4 text-emerald-400" /> 90‑day workmanship guarantee
                </div>
              </div>

              {/* Trust bar */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-slate-300/80">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" /> 4.9/5 average rating
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Genuine parts
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-300" /> Same‑day slots
                </div>
              </div>
            </motion.div>

            {/* Highlight card */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            >
              <div className={`${cardClass} p-6 md:p-8 relative overflow-hidden`}>
                <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} shadow-md shadow-cyan-500/10`}>
                    <Wrench className="w-5 h-5 text-slate-950" />
                  </div>
                  <h3 className="text-lg font-semibold">Quick quote, instant booking</h3>
                </div>
                <p className="text-slate-300/90">
                  Tell us your vehicle & service needs. We’ll show transparent pricing and the earliest slot—usually within hours.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="text-cyan-300 mt-0.5">{f.icon}</div>
                      <div>
                        <p className="text-sm font-medium">{f.title}</p>
                        <p className="text-xs text-slate-400">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-7xl px-6 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { value: "15K+", label: "Vehicles serviced" },
              { value: "98%", label: "Customer satisfaction" },
              { value: "24/7", label: "Support availability" },
              { value: "50+", label: "Expert technicians" },
            ].map((s, i) => (
              <motion.div
                key={i}
                className={`${cardClass} p-5 text-center`}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
              >
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-cyan-300">
                  {s.value}
                </div>
                <div className="mt-1 text-slate-300/90 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="mx-auto max-w-7xl px-6 pt-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Services</h2>
            <a href="#book" className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1">
              View pricing <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => (
              <motion.div
                key={i}
                className={`${cardClass} p-5"`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <p className="text-slate-200">{service}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="process" className="mx-auto max-w-7xl px-6 mt-16">
          <div className={`${cardClass} p-6 md:p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} shadow-md shadow-cyan-500/10`}>
                <Clock className="w-5 h-5 text-slate-950" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How it works</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="relative">
                  <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-cyan-400/10 ring-1 ring-cyan-300/20" />
                  <div className="text-sm uppercase tracking-wider text-slate-400">Step {i + 1}</div>
                  <div className="mt-1 text-lg font-semibold">{s.title}</div>
                  <p className="mt-1 text-slate-300/90 text-sm leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-7xl px-6 mt-16">
          <div className={`${cardClass} p-6 md:p-8`}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/20">
                  <Phone className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Call us</h3>
                  <p className="text-slate-300">+1 (555) 123‑4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
                  <Mail className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Email us</h3>
                  <p className="text-slate-300">support@autoservicepro.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                  <MapPin className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Visit us</h3>
                  <p className="text-slate-300">123 Service Center Ave</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book" className={`${btnBase} ${ACCENT_GRADIENT} text-slate-950`}>Book a slot</a>
              <a href="#chat" className={`${btnBase} bg-white/10 border border-white/10 hover:bg-white/15`}>
                <MessageCircle className="w-5 h-5" /> Ask our AI
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto max-w-7xl px-6 mt-16 pb-24 md:pb-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} AutoServicePro. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-200">Privacy</a>
              <a href="#" className="hover:text-slate-200">Terms</a>
              <a href="#" className="hover:text-slate-200">Status</a>
            </div>
          </div>
        </footer>
      </main>
      <ChatWidget />
      {/* Animated Car Icon */}
      <div className="fixed bottom-0 left-0 w-full h-28 pointer-events-none overflow-hidden">
        <div className="absolute bottom-6 -left-16 animate-bounce" style={{ animationDuration: "3s" }}>
          <Car className="w-14 h-14 text-cyan-400/30 rotate-90" />
        </div>
      </div>
    </div>
  );
};

export default Home;