import { ShieldCheck } from "lucide-react";

const MP_ICON = "/images/MP_Icono.png.png";
const MP_LOGO = "/images/mp-logo.png";

/* Ícono oficial de MercadoPago — fondo transparente */
export function MercadoPagoIcon({ size = 20 }: { size?: number }) {
  return (
    <img
      src={MP_ICON}
      alt="MercadoPago"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain inline-block"
    />
  );
}

/* Logo horizontal completo (para contextos con más espacio) */
export function MercadoPagoLogo({ height = 20 }: { height?: number }) {
  return (
    <div className="bg-white rounded-lg px-2 py-0.5 border border-gray-200 inline-flex items-center">
      <img
        src={MP_LOGO}
        alt="MercadoPago"
        style={{ height }}
        className="w-auto object-contain"
      />
    </div>
  );
}

/* Badge de pago seguro — usado en formulario de registro y landing */
export function SecurePaymentBadge() {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="flex items-center gap-1.5 text-success-600 dark:text-success-400">
        <ShieldCheck size={14} />
        <span className="text-xs font-semibold">Pago 100% seguro</span>
      </div>
      <span className="text-gray-300 dark:text-gray-600 text-xs">|</span>
      <div className="flex items-center gap-2">
        <MercadoPagoIcon size={22} />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          MercadoPago
        </span>
      </div>
    </div>
  );
}
