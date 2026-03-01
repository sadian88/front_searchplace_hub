import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import {
  MapPin,
  Target,
  BarChart3,
  Download,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Mail,
  Phone,
  Zap,
  Users,
  Globe,
  Star,
} from "lucide-react";

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Inicio", id: "inicio" },
    { label: "Ventajas", id: "ventajas" },
    { label: "Planes", id: "planes" },
    { label: "Contáctenos", id: "contactenos" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/images/logo/placeshub.png"
              alt="PlacesHub"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl tracking-tight leading-none">
              <span className="font-extrabold text-gray-800 dark:text-white">Place</span>
              <span className="font-extrabold text-brand-500">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
              >
                Ir al Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="block w-full text-left text-sm font-medium text-gray-700 dark:text-gray-200 py-2 hover:text-brand-600 dark:hover:text-brand-400"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                className="w-full px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg"
              >
                Ir al Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-center text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full px-4 py-2 text-sm font-semibold text-center bg-brand-600 text-white rounded-lg"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero (Inicio) ───────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950 pt-16"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-900/20 rounded-full blur-3xl" />
        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium">
          <Zap size={14} />
          Plataforma B2B de generación de leads
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          Descubre negocios{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
            en cualquier zona
          </span>{" "}
          del mapa
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
          PlacesHub automatiza la búsqueda de empresas por área geográfica.
          Dibuja una zona en el mapa, elige una categoría y obtén cientos de
          leads listos para tu equipo comercial.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5"
          >
            Comenzar gratis
            <ArrowRight size={18} />
          </Link>
          <button
            onClick={() =>
              document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-sm"
          >
            Ver planes
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-lg sm:max-w-2xl mx-auto">
          {[
            { value: "Miles+", label: "Leads generados" },
            { value: "100%", label: "Basado en datos reales" },
            { value: "24/7", label: "Scraping automatizado" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 80L1440 80L1440 40C1440 40 1080 0 720 0C360 0 0 40 0 40L0 80Z"
            fill="white"
            className="dark:fill-gray-950"
          />
        </svg>
      </div>
    </section>
  );
}

// ─── Ventajas ────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <MapPin size={24} />,
    title: "Búsqueda geográfica",
    description:
      "Dibuja un círculo o polígono en el mapa interactivo y define exactamente la zona donde quieres encontrar negocios.",
    color: "text-brand-600",
    bg: "bg-brand-50 dark:bg-brand-500/10",
    border: "border-brand-100 dark:border-brand-500/20",
  },
  {
    icon: <Target size={24} />,
    title: "Categorías de negocio",
    description:
      "Filtra por tipo de industria: restaurantes, clínicas, tiendas, oficinas y cientos de categorías más.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-100 dark:border-purple-500/20",
  },
  {
    icon: <Zap size={24} />,
    title: "Scraping automatizado",
    description:
      "Nuestro motor extrae datos en tiempo real usando Apify, sin necesidad de configuración técnica por tu parte.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-100 dark:border-orange-500/20",
  },
  {
    icon: <Users size={24} />,
    title: "Gestión de leads",
    description:
      "Organiza cada lead con estados personalizados: cliente, por visita, visitado o descartado.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-100 dark:border-blue-500/20",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Dashboard con métricas",
    description:
      "Visualiza el rendimiento de tus búsquedas, tasas de éxito y evolución temporal con gráficos interactivos.",
    color: "text-brand-600",
    bg: "bg-brand-50 dark:bg-brand-500/10",
    border: "border-brand-100 dark:border-brand-500/20",
  },
  {
    icon: <Globe size={24} />,
    title: "Cobertura global",
    description:
      "Busca negocios en cualquier ciudad o país. Si está en Google Maps, PlacesHub puede encontrarlo.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-100 dark:border-purple-500/20",
  },
];

function VentajasSection() {
  return (
    <section id="ventajas" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider">
            Por qué PlacesHub
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Todo lo que necesitas para prospección B2B
          </h2>
          <p className="max-w-xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
            Desde la búsqueda hasta el cierre, PlacesHub cubre cada etapa de tu
            proceso comercial.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div
                className={`inline-flex p-3 rounded-xl ${feat.bg} ${feat.color} border ${feat.border} mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
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
    name: "Standard",
    price: "$49",
    period: "por mes",
    description: "Para equipos de ventas que necesitan resultados consistentes.",
    features: [
      "500 leads por búsqueda",
      "5 búsquedas simultáneas",
      "Exportación CSV",
      "Gestión avanzada de leads",
      "Dashboard con métricas",
      "Soporte prioritario",
    ],
    cta: "Empezar ahora",
    ctaLink: "/signup",
    highlight: true,
    badge: "Más popular",
  },
  {
    name: "Pro",
    price: "$129",
    period: "por mes",
    description: "Para agencias y equipos comerciales de alto volumen.",
    features: [
      "Leads ilimitados",
      "Búsquedas simultáneas ilimitadas",
      "Exportación CSV y API",
      "Gestión avanzada de leads",
      "Dashboard personalizado",
      "Account manager dedicado",
      "SLA garantizado",
    ],
    cta: "Contactar ventas",
    ctaLink: "#contactenos",
    highlight: false,
  },
];

function PlanesSection() {
  return (
    <section id="planes" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider">
            Precios
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Planes para cada etapa de crecimiento
          </h2>
          <p className="max-w-xl mx-auto text-gray-500 dark:text-gray-400 text-lg">
            Comienza gratis y escala cuando lo necesites. Sin compromisos, sin
            tarifas ocultas.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "bg-brand-600 text-white shadow-2xl shadow-brand-600/30 border border-brand-500"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-400 text-white text-xs font-bold shadow-lg">
                    <Star size={10} />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-6">
                <h3
                  className={`text-sm font-bold uppercase tracking-widest mb-3 ${
                    plan.highlight ? "text-brand-100" : "text-brand-600 dark:text-brand-400"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-2">
                  <span
                    className={`text-4xl font-extrabold ${
                      plan.highlight ? "text-white" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${
                      plan.highlight ? "text-brand-200" : "text-gray-400"
                    }`}
                  >
                    /{plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    plan.highlight ? "text-brand-100" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <CheckCircle
                      size={16}
                      className={`shrink-0 mt-0.5 ${
                        plan.highlight ? "text-brand-200" : "text-brand-600 dark:text-brand-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlight
                          ? "text-brand-50"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.ctaLink.startsWith("#") ? (
                <button
                  onClick={() =>
                    document
                      .getElementById(plan.ctaLink.slice(1))
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-white text-brand-700 hover:bg-brand-50"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  to={plan.ctaLink}
                  className={`block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all duration-200 ${
                    plan.highlight
                      ? "bg-white text-brand-700 hover:bg-brand-50"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contáctenos ─────────────────────────────────────────────────────────────

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al enviar el mensaje. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contactenos" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Info column */}
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider">
              Contáctenos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              ¿Preguntas? Estamos para ayudarte
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 leading-relaxed">
              Cuéntanos sobre tu equipo y tus necesidades. Te responderemos en
              menos de 24 horas hábiles.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl">
                  <Mail size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                    Email
                  </div>
                  <a
                    href="mailto:hola@hubcapture.com"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    hola@hubcapture.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl">
                  <Phone size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                    WhatsApp
                  </div>
                  <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl">
                  <Download size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                    Demo gratuita
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Solicita una demo personalizada
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 gap-4">
                <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-full">
                  <CheckCircle size={32} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  ¡Mensaje enviado!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Te responderemos en menos de 24 horas hábiles.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }}
                  className="mt-2 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@empresa.com"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos sobre tu proyecto o consulta..."
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-brand-600/25 flex items-center justify-center gap-2"
                >
                  {loading ? "Enviando..." : "Enviar mensaje"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            )}
          </div>
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
    <footer className="bg-gray-950 border-t border-gray-800">
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
                { label: "Contáctenos", id: "contactenos" },
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
            © {new Date().getFullYear()} PlacesHub · HubCapture. Todos los
            derechos reservados.
          </p>
          <p className="text-xs text-gray-700">
            Desarrollado con ♥ para equipos comerciales
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
    <div ref={sectionRef} className="font-[Outfit,sans-serif] antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <VentajasSection />
        <PlanesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
