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
    <div className="min-h-screen bg-white text-[#17273f] md:flex">
      <Sidebar email={session?.user?.email} name={session?.user?.name} />
      <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <AdminToaster />
    </div>
  );
}
