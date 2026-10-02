import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { CURRENCIES } from "@/lib/currencies";
import { saveSettings } from "./actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Mi empresa</h1>
      <p className="text-sm text-muted">Estos datos aparecen en el encabezado de tus facturas.</p>
      <SettingsForm action={saveSettings} values={profile} currencies={CURRENCIES} />
    </div>
  );
}
