import { isAdminSession } from "@/lib/adminAuth";
import { startUpload } from "@/lib/chunkedUpload";
import { uploadErrorResponse } from "@/lib/uploadRouteErrors";

// Paso 1 de la subida de videos en trozos: el cliente anuncia qué va a subir y
// recibe un uploadId. Los trozos van a /[id] y el cierre es un POST a /[id].
// Estas rutas no pasan por el proxy (el matcher excluye /api): chequean sesión.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return Response.json(
      { ok: false, error: "Tu sesión venció. Volvé a iniciar sesión y reintentá." },
      { status: 401 },
    );
  }
  try {
    const body = (await req.json()) as {
      slug?: string;
      fileName?: string;
      type?: string;
      size?: number;
    };
    const started = await startUpload({
      slug: String(body.slug ?? ""),
      fileName: String(body.fileName ?? "video"),
      mime: String(body.type ?? ""),
      size: Number(body.size),
    });
    return Response.json({ ok: true, ...started });
  } catch (err) {
    return uploadErrorResponse(err);
  }
}
