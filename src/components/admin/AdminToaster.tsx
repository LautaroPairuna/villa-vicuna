"use client";

import { Toaster } from "sonner";

export default function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      theme="light"
      expand={false}
      visibleToasts={4}
      duration={2600}
      offset={{ top: 24, right: 24 }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border !border-admin-line !bg-admin-surface !px-4 !py-3 !text-admin-ink !shadow-[0_12px_28px_rgba(23,39,63,0.10)]",
          title: "!text-sm !font-medium !tracking-[0.01em] !text-admin-ink",
          description: "!text-sm !text-admin-ink-soft",
          // El éxito se marca con el filete dorado, no cambiando el fondo.
          success: "!border-l-2 !border-l-admin-gold !text-admin-ink",
          error: "!border-l-2 !border-l-admin-danger !text-admin-ink",
          closeButton:
            "!border-admin-line !bg-admin-surface !text-admin-ink hover:!bg-admin-canvas",
        },
      }}
    />
  );
}
