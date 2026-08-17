import { auth } from "@/auth";
import AdminToaster from "@/components/admin/AdminToaster";
import Sidebar from "@/components/admin/Sidebar";

// Layout del panel autenticado: sidebar + contenido. El login queda fuera
// de este grupo, así que no muestra el sidebar.
//
// `admin-scope` reencuadra la tipografía del sitio público (ver globals.css):
// sin esa clase, los párrafos del panel heredan 1.25rem con weight 100.
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="admin-scope min-h-screen bg-admin-canvas text-admin-ink md:flex">
      <Sidebar email={session?.user?.email} name={session?.user?.name} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <AdminToaster />
    </div>
  );
}
