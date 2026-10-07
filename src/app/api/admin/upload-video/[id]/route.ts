import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/adminAuth";
import { refresh, refreshFor } from "@/lib/adminRefresh";
import { appendChunk, completeUpload, getReceived, OffsetMismatchError } from "@/lib/chunkedUpload";
import { uploadErrorResponse } from "@/lib/uploadRouteErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function guard() {
  if (await isAdminSession()) return null;
  return Response.json(
    { ok: false, error: "Tu sesión venció. Volvé a iniciar sesión y reintentá." },
    { status: 401 },
  );
}

// Cuánto lleva recibido el servidor: es lo que usa el cliente para retomar.
export async function GET(_req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { id } = await params;
    return Response.json({ ok: true, received: await getReceived(id) });
  } catch (err) {
    return uploadErrorResponse(err);
  }
}

// Un trozo: cuerpo crudo, con ?offset= indicando dónde empieza.
export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { id } = await params;
    const offset = Number(new URL(req.url).searchParams.get("offset"));
    if (!Number.isInteger(offset) || offset < 0 || !req.body) {
      return Response.json({ ok: false, error: "Trozo inválido." }, { status: 400 });
    }
    const received = await appendChunk(id, offset, req.body);
    return Response.json({ ok: true, received });
  } catch (err) {
    if (err instanceof OffsetMismatchError) {
      return Response.json({ ok: false, error: "Desfasaje", received: err.received }, { status: 409 });
    }
    return uploadErrorResponse(err);
  }
}

// Cierre: verifica el tamaño, deja el archivo en su lugar y lo asocia a la sección.
export async function POST(_req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { id } = await params;
    const { media, slug } = await completeUpload(id);
    await prisma.sectionImage.upsert({
      where: { slug },
      update: { mediaId: media.id },
      create: { slug, mediaId: media.id },
    });
    refreshFor(slug);
    refresh();
    return Response.json({ ok: true });
  } catch (err) {
    return uploadErrorResponse(err);
  }
}
