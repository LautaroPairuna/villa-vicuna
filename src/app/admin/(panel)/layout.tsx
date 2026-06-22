import { auth } from "@/auth";
import AdminToaster from "@/components/admin/AdminToaster";
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfaf5_0%,#f6f0e4_48%,#f3ecde_100%)] text-[#17273f] md:flex">
      <Sidebar email={session?.user?.email} />
      <main className="flex-1 min-w-0 px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <AdminToaster />
    </div>
  );
}
