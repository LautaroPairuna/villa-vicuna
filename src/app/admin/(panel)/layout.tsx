import { auth } from "@/auth";
import Sidebar from "@/components/admin/Sidebar";

// Layout del panel autenticado: sidebar + contenido. El login queda fuera
// de este grupo, así que no muestra el sidebar.
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="md:flex min-h-screen">
      <Sidebar email={session?.user?.email} />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
