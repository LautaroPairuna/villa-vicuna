"use client";
import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost";
    if (!isSecure) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}