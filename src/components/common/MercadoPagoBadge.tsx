import { ShieldCheck } from "lucide-react";

/* Ícono oficial de MercadoPago como SVG inline */
export function MercadoPagoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MercadoPago"
    >
      <rect width="40" height="40" rx="8" fill="#009EE3" />
      <text
        x="50%"
        y="52%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="15"
        fontWeight="bold"
        letterSpacing="-0.5"
      >
        mp
      </text>
    </svg>
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
      <div className="flex items-center gap-1.5">
        <MercadoPagoIcon size={18} />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          Procesado por MercadoPago
        </span>
      </div>
    </div>
  );
}
