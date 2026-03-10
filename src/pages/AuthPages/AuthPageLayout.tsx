import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* ── Form side ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
        {/* Logo — mobile only */}
        <div className="mb-10 lg:hidden flex items-center gap-2.5">
          <img src="/images/logo/placeshub.png" alt="PlacesHub" width={30} className="object-contain" />
          <span className="text-xl font-extrabold">
            <span className="text-gray-900 dark:text-white">Place</span>
            <span className="text-brand-500">Hub</span>
          </span>
        </div>
        <div className="w-full max-w-lg mx-auto">
          {children}
        </div>
      </div>

      {/* ── Branding side ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: "#030711" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow orbs */}
        <div
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[130px]"
          style={{ background: "rgba(37,99,235,0.10)" }}
        />
        <div
          className="absolute bottom-1/3 right-0 w-[350px] h-[350px] rounded-full blur-[100px]"
          style={{ background: "rgba(124,58,237,0.07)" }}
        />
        {/* Accent lines */}
        <div className="absolute top-1/2 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/8 to-transparent" />
        {/* Top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center">
          {/* Logo */}
          <Link to="/" className="mb-8 group">
            <div className="relative inline-block">
              <img
                src="/images/logo/placeshub.png"
                alt="PlacesHub"
                width={60}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>

          {/* Headline */}
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            Encuentra leads B2B
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500">
              en cualquier zona del mapa
            </span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-10">
            Tu centro inteligente para la gestión de leads y prospección geográfica.
          </p>

          {/* Feature chips */}
          <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
            {[
              "Búsqueda geográfica con polígonos",
              "Categorías de negocio detalladas",
              "Dashboard con métricas en tiempo real",
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] border border-white/[0.07] rounded-xl text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                <span className="text-xs text-gray-300 font-medium">{feat}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-10 mt-10 pt-8 border-t border-white/[0.06] w-full max-w-[260px] justify-around">
            {[
              { value: "Miles+", label: "Leads" },
              { value: "100%", label: "Real" },
              { value: "24/7", label: "Auto" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
