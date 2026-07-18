import { LoaderCircle } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

const base = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const primaryLinkClass = `${base} border-moss-700 bg-moss-700 text-white shadow-sm hover:border-moss-800 hover:bg-moss-800 hover:shadow-md active:translate-y-px`;
export const secondaryLinkClass = `${base} border-moss-600 bg-transparent text-moss-800 hover:bg-moss-50 active:translate-y-px`;

export function PrimaryButton({ loading = false, disabled, children, className = "", ...props }: ButtonProps) {
  return (
    <button className={`${primaryLinkClass} ${className}`} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ loading = false, disabled, children, className = "", ...props }: ButtonProps) {
  return (
    <button className={`${secondaryLinkClass} ${className}`} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function TextLink({ children, className = "", ...props }: ButtonProps) {
  return (
    <button className={`inline-flex items-center gap-1 text-sm font-semibold text-moss-700 underline-offset-4 transition hover:text-moss-800 hover:underline disabled:opacity-50 ${className}`} {...props}>
      {children}
    </button>
  );
}
