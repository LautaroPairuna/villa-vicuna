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
        style={{
          fontFamily: '"Montserrat", sans-serif',
          backgroundColor: "#f6f0e1",
          color: "#17273f",
          colorScheme: "light",
        }}
        className="min-h-screen antialiased"
      >
        {children}
      </body>
    </html>
  );
}
