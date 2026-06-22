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
            "!rounded-[22px] !border !border-[#e3d6b5] !bg-[#fcfaf5] !px-4 !py-3 !text-[#17273f] !shadow-[0_18px_40px_rgba(23,39,63,0.12)]",
          title: "!text-sm !font-medium !tracking-[0.01em] !text-[#17273f]",
          description: "!text-sm !text-[#17273f]/70",
          success: "!border-[#d8cdb0] !bg-[#f8f4ea] !text-[#17273f]",
          error: "!border-[#e8c7c3] !bg-[#fff7f6] !text-[#7a2e2a]",
          closeButton:
            "!border-[#e3d6b5] !bg-[#fcfaf5] !text-[#17273f] hover:!bg-[#f3ecde]",
        },
      }}
    />
  );
}
