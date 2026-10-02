import Link from "next/link";
import { FlashMessage } from "@/components/flash-message";
import { NavLinks } from "@/components/nav-links";
import { readFlash } from "@/lib/flash";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const flash = await readFlash();
  return (
    <>
      <FlashMessage flash={flash} />
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 sm:gap-8">
          <Link href="/invoices" className="flex items-center gap-2 py-3 text-base font-semibold tracking-tight">
            <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent text-sm text-white dark:text-[#06201b]">
              F
            </span>
            <span className="hidden sm:inline">Facturas</span>
          </Link>
          <NavLinks />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 print:max-w-none print:p-0">{children}</main>
    </>
  );
}
