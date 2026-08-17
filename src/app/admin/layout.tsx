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
      {/* El fondo del body es el mismo canvas que usa el panel: antes era un
          crema más saturado y asomaba por los costados como una tercera capa. */}
      <body
        style={{
          fontFamily: '"Montserrat", sans-serif',
          backgroundColor: "var(--color-admin-canvas)",
          color: "var(--color-admin-ink)",
          colorScheme: "light",
        }}
        className="min-h-screen antialiased"
      >
        {children}
      </body>
    </html>
  );
}
