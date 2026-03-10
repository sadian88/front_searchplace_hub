import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { FiMapPin } from "react-icons/fi";
import { FiCrosshair } from "react-icons/fi";
import { FiBarChart2 } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { FiArrowRight } from "react-icons/fi";
import { FiMenu } from "react-icons/fi";
import { FiX } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
import { FiGlobe } from "react-icons/fi";
import { FiStar } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { MercadoPagoIcon, SecurePaymentBadge } from "../../components/common/MercadoPagoBadge";

// ─── Parallax hook ───────────────────────────────────────────────────────────

function useParallax(speed = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const offset = (window.innerHeight * 0.5 - rect.top - rect.height * 0.5) * speed;
      el.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return ref;
}

// ─── Wave section divider ────────────────────────────────────────────────────

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <div
      className="absolute bottom-0 inset-x-0 pointer-events-none overflow-hidden"
      style={{ height: 80, lineHeight: 0, ...(flip ? { top: 0, bottom: "auto", transform: "rotate(180deg)" } : {}) }}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "100%", fill }}
      >
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </div>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = ["inicio", "ventajas", "planes", "faq"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Inicio", id: "inicio" },
    { label: "Ventajas", id: "ventajas" },
    { label: "Planes", id: "planes" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-gray-950/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      {/* Top accent gradient line — visible on scroll */}
      <div
        className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              <img
                src="/images/logo/placeshub.png"
                alt="PlacesHub"
                width={30}
                height={30}
                className="object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl tracking-tight leading-none">
              <span className="font-extrabold text-white">Place</span>
              <span className="font-extrabold text-brand-400">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection === link.id
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                }`}
              >
                {link.label}
                {/* Active underline indicator */}
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-brand-400 transition-all duration-300 ${
                    activeSection === link.id ? "w-4 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-brand-600/20"
              >
                Ir al Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/signup"
                  className="relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-brand-600/25 group"
                >
                  <span className="relative z-10">Comenzar gratis</span>
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger — animated icon swap */}
          <button
            className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span
              className={`absolute transition-all duration-200 ${
                mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
              }`}
            >
              <FiX size={20} />
            </span>
            <span
              className={`transition-all duration-200 ${
                mobileOpen ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            >
              <FiMenu size={20} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu — smooth height + fade transition */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-gray-950/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSection === link.id
                  ? "bg-brand-500/10 text-brand-300 border border-brand-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
              {activeSection === link.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </button>
          ))}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                className="w-full px-4 py-3 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors"
              >
                Ir al Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-3 text-sm font-medium text-center text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-3 text-sm font-semibold text-center bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors shadow-lg shadow-brand-600/20"
                >
                  Comenzar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Hero (Inicio) ───────────────────────────────────────────────────────────

function HeroSection() {
  const parallaxRef = useParallax(0.12);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{ backgroundColor: "#030711" }}
    >
      {/* Background: coordinate dot grid — fixed, no parallax */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.032]"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Parallax layer: ambient glows */}
      <div ref={parallaxRef} className="absolute inset-0 pointer-events-none will-change-transform">
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full blur-[130px]" style={{ background: "rgba(37,99,235,0.07)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[110px]" style={{ background: "rgba(59,130,246,0.05)" }} />
        <div className="absolute top-1/2 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/6 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/6 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-4rem)] py-20">

          {/* ── Left: copy ── */}
          <div>
            {/* Live badge */}
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
              Descubre negocios{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500">
                en cualquier
              </span>{" "}
              zona del mapa
            </h1>

            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
              Dibuja un área en el mapa, elige una categoría y obtén cientos de
              leads verificados listos para tu equipo comercial.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-16">
              <Link
                to="/signup"
                className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-2xl shadow-brand-600/30 group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Comenzar gratis <FiArrowRight size={17} />
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </Link>
              <button
                onClick={() =>
                  document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/8 text-gray-200 font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                Ver planes
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
              {[
                { value: "Miles+", label: "Leads generados" },
                { value: "100%", label: "Datos reales" },
                { value: "24/7", label: "Automatizado" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-extrabold text-white mb-0.5">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: product mockup ── */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[420px]">
              {/* Card glow */}
              <div className="absolute -inset-4 bg-brand-500/10 blur-3xl rounded-3xl" />

              {/* Main card */}
              <div className="relative bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-300">Nueva búsqueda activa</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                    EN VIVO
                  </span>
                </div>

                {/* Map area */}
                <div className="relative h-44 bg-gray-800/60 rounded-xl mb-5 overflow-hidden border border-white/[0.05]">
                  {/* Grid */}
                  <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                  {/* Selection circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-brand-400/60 bg-brand-500/8 shadow-[0_0_24px_4px_rgba(59,130,246,0.12)]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.6)]" />
                    </div>
                  </div>
                  {/* Pin dots */}
                  {[
                    { top: "30%", left: "46%" },
                    { top: "55%", left: "38%" },
                    { top: "46%", left: "63%" },
                    { top: "34%", left: "57%" },
                    { top: "62%", left: "53%" },
                  ].map((pin, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_6px_2px_rgba(96,165,250,0.5)]"
                      style={{ top: pin.top, left: pin.left }}
                    />
                  ))}
                </div>

                {/* Info row */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-gray-800/50 border border-white/[0.05] rounded-xl px-3 py-2.5">
                    <div className="text-[10px] text-gray-500 mb-0.5">Categoría</div>
                    <div className="text-sm font-semibold text-white">Restaurantes</div>
                  </div>
                  <div className="flex-1 bg-brand-500/10 border border-brand-500/20 rounded-xl px-3 py-2.5">
                    <div className="text-[10px] text-brand-400 mb-0.5">Leads</div>
                    <div className="text-sm font-bold text-brand-300">248 encontrados</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-600">Procesando resultados…</span>
                  <span className="text-[10px] text-brand-400 font-mono">75%</span>
                </div>
              </div>

              {/* Floating success chip */}
              <div className="absolute -bottom-5 -right-5 bg-gray-900 border border-white/[0.08] rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
                  <FiCheckCircle size={14} className="text-green-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none mb-0.5">Búsqueda completada</div>
                  <div className="text-[10px] text-gray-500">hace 2 minutos</div>
                </div>
              </div>

              {/* Floating stat chip */}
              <div className="absolute -top-5 -left-5 bg-gray-900 border border-white/[0.08] rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <FiMapPin size={14} className="text-brand-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none mb-0.5">Bogotá, Usaquen</div>
                  <div className="text-[10px] text-gray-500">Radio: 2.4 km</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <WaveDivider fill="#f8fafc" />
    </section>
  );
}

// ─── Ventajas ────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <FiMapPin size={22} />,
    title: "Búsqueda geográfica",
    description:
      "Dibuja un círculo o polígono en el mapa interactivo y define exactamente la zona donde quieres encontrar negocios.",
    color: "text-brand-600",
    bg: "bg-brand-50",
    border: "border-brand-100",
    accent: "bg-brand-600",
  },
  {
    icon: <FiCrosshair size={22} />,
    title: "Categorías de negocio",
    description:
      "Filtra por tipo de industria: restaurantes, clínicas, tiendas, oficinas y cientos de categorías más.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    accent: "bg-violet-600",
  },
  {
    icon: <FiUsers size={22} />,
    title: "Gestión de leads",
    description:
      "Organiza cada lead con estados personalizados: cliente, por visita, visitado o descartado.",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
    accent: "bg-sky-600",
  },
  {
    icon: <FiBarChart2 size={22} />,
    title: "Dashboard con métricas",
    description:
      "Visualiza el rendimiento de tus búsquedas, tasas de éxito y evolución temporal con gráficos interactivos.",
    color: "text-brand-600",
    bg: "bg-brand-50",
    border: "border-brand-100",
    accent: "bg-brand-600",
  },
  {
    icon: <FiGlobe size={22} />,
    title: "Cobertura global",
    description:
      "Busca negocios en cualquier ciudad o país. Si está en Google Maps, PlacesHub puede encontrarlo.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    accent: "bg-violet-600",
  },
];

function VentajasSection() {
  const parallaxRef = useParallax(0.08);

  return (
    <section id="ventajas" className="py-28 relative overflow-hidden bg-[#f8fafc]">
      <div ref={parallaxRef} className="absolute inset-0 pointer-events-none will-change-transform">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: "rgba(37,99,235,0.05)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.04)" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-brand-100 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-widest">
            Por qué PlacesHub
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight leading-tight">
            Todo lo que necesitas para{" "}
            <span className="text-brand-600">prospección B2B</span>
          </h2>
          <p className="max-w-xl mx-auto text-gray-500 text-lg leading-relaxed">
            Buscar contactos de Google Maps nunca fue tan fácil. Si necesitas
            acceder a negocios, su ubicación y sus datos, PlacesHub es para ti.
          </p>
        </div>

        {/* Features: 5-col on desktop, 3-col tablet, 2-col mobile — no cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-14">
          {features.map((feat) => (
            <div key={feat.title} className="group flex flex-col items-center text-center">
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${feat.bg} ${feat.color} transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}
              >
                {feat.icon}
              </div>
              {/* Title */}
              <h3 className="text-sm font-bold text-gray-800 mb-2 leading-snug">
                {feat.title}
              </h3>
              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
      <WaveDivider fill="#0a0f1e" />
    </section>
  );
}

// ─── Planes ──────────────────────────────────────────────────────────────────

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlight: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "para siempre",
    description: "Perfecto para explorar la plataforma y hacer pruebas.",
    features: [
      "5 leads por búsqueda",
      "10 leads mensuales",
      "1 búsqueda simultánea",
      "Gestión básica de leads",
      "Dashboard con métricas",
      "Soporte por email",
    ],
    cta: "Comenzar gratis",
    ctaLink: "/signup",
    highlight: false,
  },
  {
    name: "Basic",
    price: "$29",
    period: "por mes",
    description: "Para profesionales que comienzan a generar leads.",
    features: [
      "20 leads por búsqueda",
      "100 leads mensuales",
      "2 búsquedas simultáneas",
      "Gestión de leads",
      "Dashboard con métricas",
      "Soporte por email",
    ],
    cta: "Empezar ahora",
    ctaLink: "/signup?plan=basic",
    highlight: false,
  },
  {
    name: "Medium",
    price: "$49",
    period: "por mes",
    description: "Para equipos de ventas que necesitan resultados consistentes.",
    features: [
      "50 leads por búsqueda",
      "400 leads mensuales",
      "3 búsquedas simultáneas",
      "Exportación CSV",
      "Gestión avanzada de leads",
      "Soporte prioritario",
    ],
    cta: "Empezar ahora",
    ctaLink: "/signup?plan=medium",
    highlight: true,
    badge: "Más popular",
  },
  {
    name: "Pro",
    price: "$149",
    period: "por mes",
    description: "Para agencias y equipos comerciales de alto volumen.",
    features: [
      "100 leads por búsqueda",
      "4,000 leads mensuales",
      "Búsquedas simultáneas ilimitadas",
      "Exportación CSV y API",
      "Gestión avanzada de leads",
      "Account manager dedicado",
    ],
    cta: "Contactar ventas",
    ctaLink: "#faq",
    highlight: false,
  },
];

function PlanesSection() {
  const parallaxRef = useParallax(0.08);

  return (
    <section id="planes" className="py-28 relative overflow-hidden bg-[#0a0f1e]">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #7c9dff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      {/* Parallax glow layer */}
      <div ref={parallaxRef} className="absolute inset-0 pointer-events-none will-change-transform">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-80 rounded-full blur-3xl" style={{ background: "rgba(37,99,235,0.08)" }} />
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full blur-[120px]" style={{ background: "rgba(124,58,237,0.06)" }} />
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: "rgba(14,165,233,0.04)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-widest">
            Precios
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Planes para cada etapa
          </h2>
          <p className="max-w-xl mx-auto text-gray-400 text-lg">
            Comienza gratis y escala cuando lo necesites. Sin compromisos, sin tarifas ocultas.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "bg-brand-600 border border-brand-500 shadow-2xl shadow-brand-600/25"
                  : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.05]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-400 text-white text-xs font-bold shadow-lg">
                    <FiStar size={10} />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                    plan.highlight ? "text-brand-100" : "text-brand-400"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className={`text-sm mb-1.5 ${plan.highlight ? "text-brand-200" : "text-gray-500"}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlight ? "text-brand-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <FiCheckCircle
                      size={15}
                      className={`shrink-0 mt-0.5 ${plan.highlight ? "text-brand-200" : "text-brand-500"}`}
                    />
                    <span className={`text-sm ${plan.highlight ? "text-brand-50" : "text-gray-400"}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.ctaLink.startsWith("#") ? (
                <button
                  onClick={() =>
                    document.getElementById(plan.ctaLink.slice(1))?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-white text-brand-700 hover:bg-brand-50"
                      : "bg-brand-600 hover:bg-brand-500 text-white"
                  }`}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  to={plan.ctaLink}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-center transition-all duration-200 ${
                    plan.highlight
                      ? "bg-white text-brand-700 hover:bg-brand-50"
                      : "bg-brand-600 hover:bg-brand-500 text-white"
                  }`}
                >
                  {plan.ctaLink.includes("?plan=") && <MercadoPagoIcon size={18} />}
                  {plan.cta}
                </Link>
              )}

              {plan.ctaLink.includes("?plan=") && (
                <p className={`mt-2 text-center text-[11px] font-medium ${
                  plan.highlight ? "text-brand-100/70" : "text-gray-600"
                }`}>
                  Pago seguro con MercadoPago
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-sm mx-auto">
          <SecurePaymentBadge />
        </div>
      </div>

      <WaveDivider fill="#f5f7fb" />
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "¿Qué tipo de negocios/leads vas a encontrar?",
    a: "PlaceHub descubre negocios locales verificados en Google de acuerdo a tus criterios de búsqueda.",
  },
  {
    q: "¿Qué información de contacto vas a obtener con PlaceHub?",
    a: "PlaceHub te entregará información relevante de los negocios locales, tales como, teléfonos, correos, sitios web, perfiles de redes sociales y otros datos importantes para que puedas activar tu estrategia de contacto en frío.",
  },
  {
    q: "¿En qué ubicaciones puedo encontrar negocios/leads?",
    a: "Busca negocios en cualquier ciudad o país. Si está en Google Maps, PlacesHub puede encontrarlo.",
  },
  {
    q: "¿Cómo funciona el consumo de créditos de mi plan?",
    a: "El consumo del plan está basado en el número de búsquedas y leads verificados que necesites, cada plan te brinda créditos para descubrir nuevos negocios locales.",
  },
  {
    q: "¿Cómo puedo adquirir más créditos?",
    a: "Dentro de la plataforma puedes realizar el upgrade al siguiente plan de manera automática pagando en línea.",
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const parallaxRef = useParallax(0.1);

  return (
    <section id="faq" className="py-28 relative overflow-hidden bg-[#f5f7fb]">
      {/* Parallax: subtle orbs on light bg */}
      <div ref={parallaxRef} className="absolute inset-0 pointer-events-none will-change-transform">
        <div className="absolute -bottom-20 right-0 w-[500px] h-[400px] rounded-full blur-3xl" style={{ background: "rgba(37,99,235,0.05)" }} />
        <div className="absolute top-0 left-0 w-[350px] h-[350px] rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.04)" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-brand-100 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-500 text-lg">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
                openIdx === i
                  ? "bg-white border border-brand-200 shadow-md"
                  : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow"
              }`}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50/50 transition-colors duration-150"
              >
                <span className="text-sm font-semibold text-gray-800 leading-snug">
                  {faq.q}
                </span>
                <FiChevronDown
                  size={17}
                  className={`shrink-0 text-brand-500 transition-transform duration-300 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIdx === i ? "max-h-48" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <WaveDivider fill="#030711" />
    </section>
  );
}

// ─── CTA Final ───────────────────────────────────────────────────────────────

function CTASection() {
  const parallaxRef = useParallax(0.14);

  return (
    <section className="py-28 relative overflow-hidden bg-[#030711]">
      {/* Parallax glow */}
      <div ref={parallaxRef} className="absolute inset-0 pointer-events-none will-change-transform">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-80 rounded-full blur-3xl" style={{ background: "rgba(37,99,235,0.10)" }} />
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-[110px]" style={{ background: "rgba(124,58,237,0.07)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: "rgba(14,165,233,0.05)" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
          Tu próximo cliente ya está{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
            en el mapa
          </span>
        </h2>
        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Únete a PlacesHub y automatiza tu prospección B2B. Sin tarjeta de crédito para empezar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-2xl shadow-brand-600/30 group"
          >
            <span className="relative z-10 flex items-center gap-2">
              Crear cuenta gratis <FiArrowRight size={17} />
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </Link>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/8 text-gray-200 font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>

    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer style={{ backgroundColor: "#030712", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/images/logo/placeshub.png"
                alt="PlacesHub"
                width={28}
                className="object-contain"
              />
              <span className="text-lg font-extrabold">
                <span className="text-white">Place</span>
                <span className="text-brand-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tu centro inteligente para la gestión de leads y prospección B2B
              por área geográfica.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Plataforma
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Inicio", id: "inicio" },
                { label: "Ventajas", id: "ventajas" },
                { label: "Planes", id: "planes" },
                { label: "FAQ", id: "faq" },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="text-sm text-gray-500 hover:text-brand-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Cuenta
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/signin"
                  className="text-sm text-gray-500 hover:text-brand-400 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-sm text-gray-500 hover:text-brand-400 transition-colors"
                >
                  Registrarse gratis
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-500 hover:text-brand-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2026 PlacesHub · HubMyPyme S.A.S | Un producto de Marketing de Bolsillo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Landing() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={sectionRef} className="font-[Outfit,sans-serif] antialiased bg-[#030711]">
      <Navbar />
      <main>
        <HeroSection />
        <VentajasSection />
        <PlanesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
