// Root layout del panel admin (fuera de [locale], sin next-intl).
// Usa la identidad visual del sitio: crema + Montserrat, encabezados en Cinzel.
import "../../styles/globals.css";

export const metadata = {
  title: "Administración · Villa Vicuña",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        style={{ fontFamily: '"Montserrat", sans-serif' }}
        className="min-h-screen bg-[#f6f0e1] text-[#17273f] antialiased"
      >
        {children}
      </body>
    </html>
  );
}
