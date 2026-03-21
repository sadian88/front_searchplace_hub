import { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import { MercadoPagoIcon, SecurePaymentBadge } from "../common/MercadoPagoBadge";
import { FiMail, FiCheckCircle, FiRefreshCw } from "react-icons/fi";

const PLAN_LABELS: Record<string, { label: string; price: string; description: string }> = {
  basic:  { label: "Basic",  price: "$116.000/mes", description: "20 leads por búsqueda · 100 leads mensuales" },
  medium: { label: "Medium", price: "$196.000/mes", description: "50 leads por búsqueda · 400 leads mensuales" },
  pro:    { label: "Pro",    price: "$596.000/mes", description: "100 leads por búsqueda · 4,000 leads mensuales" },
};

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  // Ref para evitar checks duplicados
  const lastCheckedEmail = useRef("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan")?.toLowerCase() ?? null;
  const planInfo = selectedPlan ? PLAN_LABELS[selectedPlan] : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (name === "email") setEmailError("");
  };

  /** Verifica disponibilidad del email al salir del campo */
  const handleEmailBlur = async () => {
    const email = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) return;
    if (email === lastCheckedEmail.current) return; // ya verificado

    lastCheckedEmail.current = email;
    setEmailChecking(true);
    setEmailError("");

    try {
      const { data } = await api.get<{ available: boolean }>(
        `/auth/check-email?email=${encodeURIComponent(email)}`
      );
      if (!data.available) {
        setEmailError("Este email ya tiene una cuenta. ¿Quieres iniciar sesión?");
      }
    } catch {
      // Si falla la verificación previa, dejamos que el submit la maneje
    } finally {
      setEmailChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // No enviar si hay error de email conocido
    if (emailError) return;

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/register", {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (response.data.pending_verification) {
        setRegisteredEmail(response.data.email || form.email.trim());
        // Preservar el plan para retomarlo después de verificar el email
        if (selectedPlan && PLAN_LABELS[selectedPlan]) {
          localStorage.setItem('pending_plan', selectedPlan);
        }
        setPendingVerification(true);
        return;
      }

      // Fallback: si por algún motivo retorna token directamente
      await login(response.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      const msg: string =
        err.response?.data?.message || "Ocurrió un error al crear la cuenta.";
      const field: string | undefined = err.response?.data?.field;

      // Si el servidor indica que es un error de email, mostrarlo inline
      if (field === "email" || msg.toLowerCase().includes("email")) {
        setEmailError(msg + " ¿Quieres iniciar sesión?");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const emailHasError = Boolean(emailError);

  const handleResend = async () => {
    setResending(true);
    setResendDone(false);
    try {
      await api.post("/auth/resend-verification", { email: registeredEmail });
      setResendDone(true);
    } catch {
      // silencioso — el endpoint siempre responde 200
      setResendDone(true);
    } finally {
      setResending(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="w-full space-y-6">
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Verifica tu email
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cuenta creada correctamente.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
            <FiMail size={26} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">Revisa tu bandeja</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enviamos un enlace de verificación a{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{registeredEmail}</span>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
          </div>
        </div>

        {resendDone ? (
          <div className="flex items-center justify-center gap-2 text-sm text-success-600 dark:text-success-400 font-semibold">
            <FiCheckCircle size={15} />
            Correo reenviado correctamente
          </div>
        ) : (
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            ¿No llegó el correo?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline disabled:opacity-60"
            >
              {resending && <FiRefreshCw size={11} className="animate-spin" />}
              {resending ? "Reenviando..." : "Reenviar verificación"}
            </button>
          </p>
        )}

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          <Link to="/signin" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Ir a Iniciar Sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Crear cuenta
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {planInfo
              ? `Registro para el plan ${planInfo.label}. Completa tus datos y continúa al pago.`
              : "Empieza gratis. Sin tarjeta de crédito."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>
                  Nombre <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="first_name"
                  placeholder="Tu nombre"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>
                  Apellido <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="last_name"
                  placeholder="Tu apellido"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                name="email"
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                error={emailHasError}
                success={
                  !emailHasError &&
                  Boolean(form.email) &&
                  lastCheckedEmail.current === form.email.trim()
                }
                hint={
                  emailChecking
                    ? "Verificando disponibilidad..."
                    : emailError || undefined
                }
                required
              />
              {/* Link de acción cuando el email está tomado */}
              {emailError && (
                <p className="mt-1 text-xs text-error-500">
                  <Link
                    to="/signin"
                    className="underline hover:text-error-600 font-medium"
                  >
                    Ir a iniciar sesión
                  </Link>
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <Label>
                Contraseña <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            {/* Error genérico */}
            {error && (
              <div className="px-4 py-3 text-sm text-error-600 bg-error-50 dark:bg-error-500/10 dark:text-error-400 rounded-lg border border-error-200 dark:border-error-500/20">
                {error}
              </div>
            )}

            {/* Plan badge informativo */}
            {planInfo ? (
              <div className="px-4 py-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-lg space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Plan {planInfo.label}
                  </span>
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                    {planInfo.price}
                  </span>
                </div>
                <p className="text-xs text-brand-600/70 dark:text-brand-400/70">
                  {planInfo.description} · Pagarás luego del registro
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-lg">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Plan Free
                </span>
                <span className="text-xs text-brand-700 dark:text-brand-300">
                  · 5 leads por búsqueda · Sin tarjeta de crédito
                </span>
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full"
              size="sm"
              disabled={loading || emailHasError || emailChecking}
            >
              {planInfo && !loading && (
                <span className="mr-2 inline-flex shrink-0">
                  <MercadoPagoIcon size={18} />
                </span>
              )}
              {loading
                ? "Creando cuenta..."
                : planInfo
                  ? "Crear cuenta y continuar al pago"
                  : "Crear cuenta gratis"}
            </Button>

            {/* Badge de seguridad — solo visible cuando hay plan de pago */}
            {planInfo && <SecurePaymentBadge />}
          </div>
        </form>

        <p className="mt-5 text-sm text-center text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/signin"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Inicia sesión
          </Link>
        </p>
    </div>
  );
}
