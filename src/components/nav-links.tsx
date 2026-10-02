"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/invoices", label: "Facturas" },
  { href: "/clients", label: "Clientes" },
  { href: "/products", label: "Productos" },
  { href: "/settings", label: "Mi empresa" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="-mb-px flex flex-1 gap-1 overflow-x-auto text-sm">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-3 py-3.5 font-medium transition-colors ${
              active ? "border-accent text-foreground" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
