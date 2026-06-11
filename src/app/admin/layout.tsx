// Root layout independiente para el panel admin (fuera de [locale], sin next-intl).
import "../../styles/globals.css";

export const metadata = {
  title: "Admin · Villa Vicuña",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-100 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
