"use client";

import type { ButtonHTMLAttributes } from "react";

// Botón de envío que pide confirmación antes de ejecutar una acción destructiva.
export function ConfirmButton({
  message,
  onClick,
  ...props
}: { message: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
        else onClick?.(e);
      }}
    />
  );
}
