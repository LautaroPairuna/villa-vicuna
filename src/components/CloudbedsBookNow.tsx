// src/components/CloudbedsBookNow.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";

type CommonYesNo = "si" | "no";
type Mode = "estándar" | "ventana emergente" | "standard" | "popup";
type Lang = "auto" | "es" | "en" | "fr" | string;
type Variant = "nav" | "contact" | "rooms";

type CloudbedsBookNowProps = React.HTMLAttributes<HTMLElement> & {
  propertyCode: string;

  // Navbar: texto visible; Contact: no se usa (ocultamos el WC)
  label?: string;
  fallbackText?: string;

  buttonClassName?: string; // class-name del WC
  width?: string;
  height?: string;
  lang?: Lang;
  currency?: string;

  disableCssTitleReset?: CommonYesNo;
  hideCustomHeader?: CommonYesNo;
  hideCustomFooter?: CommonYesNo;
  hidePropertyInfo?: CommonYesNo;
  ignoreSearchParams?: CommonYesNo;
  mode?: Mode;
  timeout?: number;

  variant?: Variant;

  // Variant "contact": tu botón visible
  contactButtonClassName?: string;
  contactIconSrc?: string;
  contactIconSize?: number; // se usa para tap target mínimo
  contactAriaLabel?: string;
  contactLabel?: string;
  roomsButtonClassName?: string;
  roomsLabel?: string;

  directUrlFallback?: string;
  
  // Estado global de carga sincronizada
  isGloballyReady?: boolean;
  
  // Callback para notificar cuando esté listo
  onLoaded?: () => void;
};

const scriptSrc = "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

let cloudbedsScriptPromise: Promise<void> | null = (globalThis as unknown as { __cbScriptPromise?: Promise<void> }).__cbScriptPromise ?? null;
let cloudbedsLoadStarted: boolean = (globalThis as unknown as { __cbLoadStarted?: boolean }).__cbLoadStarted ?? false;

async function ensureCloudbedsLoaded(ms: number = 5000): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if ("customElements" in window && window.customElements.get("cb-book-now-button")) return true;
  const existing = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement | null;
  if (!existing && !cloudbedsLoadStarted) {
    cloudbedsLoadStarted = true;
    (globalThis as unknown as { __cbLoadStarted?: boolean }).__cbLoadStarted = true;
    const s = document.createElement("script");
    s.id = "cb-immersive-experience";
    s.src = scriptSrc;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-domain", "villavicuna.com.ar");
    cloudbedsScriptPromise = new Promise<void>((resolve, reject) => {
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("cloudbeds script error"));
    });
    (globalThis as unknown as { __cbScriptPromise?: Promise<void> }).__cbScriptPromise = cloudbedsScriptPromise;
    document.head.appendChild(s);
  }
  if (existing && !cloudbedsScriptPromise) {
    cloudbedsScriptPromise = new Promise<void>((resolve) => {
      if ("customElements" in window && window.customElements.get("cb-book-now-button")) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
    });
    (globalThis as unknown as { __cbScriptPromise?: Promise<void> }).__cbScriptPromise = cloudbedsScriptPromise;
  }
  try {
    if (!cloudbedsScriptPromise) cloudbedsScriptPromise = Promise.resolve();
    await Promise.race([
      cloudbedsScriptPromise,
      new Promise((resolve) => setTimeout(resolve, ms)),
    ]);
  } catch {}
  if ("customElements" in window && typeof window.customElements.whenDefined === "function") {
    try {
      await Promise.race([
        window.customElements.whenDefined("cb-book-now-button"),
        new Promise((resolve) => setTimeout(resolve, ms)),
      ]);
    } catch {}
  }
  return !!("customElements" in window && window.customElements.get("cb-book-now-button"));
}

export default function CloudbedsBookNow({
  // Props básicas
  propertyCode,
  className,
  buttonClassName,
  label,
  fallbackText,
  width,
  height,
  lang = "auto",
  currency,
  disableCssTitleReset,
  hideCustomHeader,
  hideCustomFooter,
  hidePropertyInfo,
  ignoreSearchParams,
  mode = "popup",
  timeout = 5000,

  // Variant-specific
  variant = "nav",
  contactButtonClassName,
  contactIconSrc = "/images/icons/ico-reservar.svg",
  contactIconSize = 64,
  contactAriaLabel = "Reservar ahora",
  contactLabel,
  roomsButtonClassName,
  roomsLabel,
  directUrlFallback,
  
  // Callback
  isGloballyReady,
  onLoaded,

  ...rest
}: CloudbedsBookNowProps) {
  const [isComponentReady, setIsComponentReady] = useState(false);

  // Función auxiliar segura para crear el Web Component
  const createSafeWebComponent = (props: Record<string, unknown>) => {
    try {
      // Verificación triple antes de crear el elemento
      if (typeof window === "undefined") return null;
      if (!("customElements" in window)) return null;
      
      const componentConstructor = window.customElements.get("cb-book-now-button");
      if (!componentConstructor) return null;
      
      // Verificar que el constructor es válido
      if (typeof componentConstructor !== "function") return null;
      
      return React.createElement("cb-book-now-button", props);
    } catch (error) {
      console.warn("Error creating Web Component:", error);
      return null;
    }
  };
  
  const computedLabel = (typeof label !== "undefined" ? label : (typeof roomsLabel !== "undefined" ? roomsLabel : fallbackText));
  const effectiveButtonClassName = buttonClassName || roomsButtonClassName;

  const wcAttrs = useMemo(() => {
    const attrs: Record<string, unknown> = {
      "property-code": propertyCode,
      ...(buttonClassName ? { "class-name": buttonClassName } : {}),
      ...(computedLabel !== undefined ? { label: computedLabel } : {}),
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      ...(lang ? { lang } : {}),
      ...(currency ? { currency } : {}),
      ...(disableCssTitleReset ? { "disable-css-title-reset": disableCssTitleReset } : {}),
      ...(hideCustomHeader ? { "hide-custom-header": hideCustomHeader } : {}),
      ...(hideCustomFooter ? { "hide-custom-footer": hideCustomFooter } : {}),
      ...(hidePropertyInfo ? { "hide-property-info": hidePropertyInfo } : {}),
      ...(ignoreSearchParams ? { "ignore-search-params": ignoreSearchParams } : {}),
      ...(mode ? { mode } : {}),
      ...(typeof timeout === "number" ? { timeout } : {}),
    };
    return attrs;
  }, [
    propertyCode,
    buttonClassName,
    computedLabel,
    width,
    height,
    lang,
    currency,
    disableCssTitleReset,
    hideCustomHeader,
    hideCustomFooter,
    hidePropertyInfo,
    ignoreSearchParams,
    mode,
    timeout,
  ]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (typeof window === "undefined") return;
      void ensureCloudbedsLoaded(timeout);
      if (!("customElements" in window)) return;
      const already = window.customElements.get("cb-book-now-button") !== undefined;
      if (already) {
        if (!cancelled) {
          setIsComponentReady(true);
          if (onLoaded) onLoaded();
        }
        return;
      }
      const hasWhenDefined = typeof window.customElements.whenDefined === "function";
      if (!hasWhenDefined) return;
      try {
        await window.customElements.whenDefined("cb-book-now-button");
        if (!cancelled) {
          const registered = window.customElements.get("cb-book-now-button") !== undefined;
          if (registered) {
            setIsComponentReady(true);
            if (onLoaded) onLoaded();
          }
        }
      } catch (error) {
        console.warn("Error waiting for Cloudbeds component:", error);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [onLoaded, timeout]);

  // NAVBAR: render normal del web component
  if (variant === "nav") {
    // Verificar si el componente está disponible antes de renderizar con verificación dual robusta
    try {
      const componentRegistered = typeof window !== "undefined" &&
        "customElements" in window &&
        window.customElements.get("cb-book-now-button") !== undefined;
      if (componentRegistered || isComponentReady || isGloballyReady) {
        const webComponent = createSafeWebComponent({ ...wcAttrs, class: className, ...rest });
        if (webComponent) {
          return webComponent;
        }
      }
      
      // Fallback para cuando el componente no está disponible
      const fallbackUrl = directUrlFallback || `https://hotels.cloudbeds.com/${propertyCode}`;
      return (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${effectiveButtonClassName || ''} ${className || ''}`}
          onClickCapture={(e) => {
            void ensureCloudbedsLoaded(timeout).then((ok) => {
              if (!ok) return;
              e.preventDefault();
            });
          }}
          onPointerEnter={() => { void ensureCloudbedsLoaded(timeout); }}
          onFocus={() => { void ensureCloudbedsLoaded(timeout); }}
          {...rest}
        >
          {computedLabel}
        </a>
      );
    } catch (error) {
      console.warn("Error in nav variant check:", error);
      // Fallback en caso de error
      const fallbackUrl = directUrlFallback || `https://hotels.cloudbeds.com/${propertyCode}`;
      return (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClassName || ''} ${className || ''}`}
          {...rest}
        >
          {computedLabel}
        </a>
      );
    }
  }

  if (variant === "contact") {
  const isReady = () => {
    try {
      const scriptLoaded = typeof document !== "undefined" && document.querySelector('script[src*="cloudbeds"]') !== null;
      const componentRegistered = typeof window !== "undefined" &&
        "customElements" in window &&
        window.customElements.get("cb-book-now-button") !== undefined;
      return (scriptLoaded && componentRegistered) || isComponentReady || !!isGloballyReady;
    } catch (error) {
      console.warn("Error in isReady check:", error);
      return false;
    }
  };

  const fallbackUrl = directUrlFallback || `https://hotels.cloudbeds.com/${propertyCode}`;

  // Tap target mínimo (mejora de accesibilidad)
  const minSide = Math.max(44, (contactIconSize ?? 64) + 16);

  // Clon de attrs sin label para no duplicar accesibilidad ni texto visual
  const wcNoLabel: Record<string, unknown> = { ...wcAttrs };
  delete wcNoLabel["label"];

  return (
    <div
      className={`relative inline-flex w-full justify-center items-center ${className || ""}`}
      onClickCapture={(e) => {
        if (!isReady()) {
          void ensureCloudbedsLoaded(timeout).then((ok) => {
            if (!ok) {
              e.preventDefault();
              e.stopPropagation();
              window.open(fallbackUrl, "_blank", "noopener,noreferrer");
            }
          });
        }
      }}
      onPointerEnter={() => { void ensureCloudbedsLoaded(timeout); }}
      onTouchStart={() => { void ensureCloudbedsLoaded(timeout); }}
      onFocus={() => { void ensureCloudbedsLoaded(timeout); }}
      {...rest}
    >
      {/* Contenedor del tamaño del botón (clave para que el overlay coincida al 100%) */}
      <div className="relative">
        {/* Botón visible (tu diseño) */}
        <button
          type="button"
          aria-label={contactAriaLabel}
          className={contactButtonClassName}
          style={{
            minWidth: contactIconSrc ? `${minSide}px` : undefined,
            minHeight: contactIconSrc ? `${minSide}px` : undefined,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {contactIconSrc ? (
            <Image src={contactIconSrc} alt="" width={contactIconSize} height={contactIconSize} />
          ) : null}
          {typeof contactLabel === "string" ? (
            <span className={contactIconSrc ? "ml-2" : undefined}>{contactLabel}</span>
          ) : null}
        </button>

        {/* Overlay exacto: el WC ocupa TODO el contenedor del botón */}
        <div className="absolute inset-0 z-10">
          {(() => {
            // Usar la función segura para crear el Web Component
            const webComponent = createSafeWebComponent({
              ...wcNoLabel,
              "aria-hidden": "true", // no afectar a11y
              tabIndex: -1,
              className: "cb-overlay-invisible",
              style: {
                opacity: 0.001,
                pointerEvents: "auto",
                touchAction: "manipulation",
                background: "transparent",
                color: "transparent",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: "0",
                left: "0",
                margin: "0",
                padding: "0",
                border: "none",
                outline: "none",
                display: "block",
                zIndex: "10",
              },
            });
            
            // Si no se puede crear el Web Component, renderizar un div invisible como placeholder
            return webComponent || (
              <div 
                className="cb-overlay-invisible"
                style={{
                  opacity: 0,
                  pointerEvents: "none",
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: "0",
                  left: "0",
                }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
  }

  if (variant === "rooms") {
    const ready = () => {
      try {
        const scriptLoaded = typeof document !== "undefined" && document.querySelector('script[src*="cloudbeds"]') !== null;
        const componentRegistered = typeof window !== "undefined" &&
          "customElements" in window &&
          window.customElements.get("cb-book-now-button") !== undefined;
        return (scriptLoaded && componentRegistered) || isComponentReady || !!isGloballyReady;
      } catch {
        return false;
      }
    };
    const visibleLabel = typeof roomsLabel === "string" ? roomsLabel : (typeof label === "string" ? label : undefined);
    const btnClass = roomsButtonClassName || buttonClassName || "";
    const wcNoLabel: Record<string, unknown> = { ...wcAttrs };
    delete wcNoLabel["label"];
    return (
      <div
        className={`relative inline-flex ${className || ""}`}
        onClickCapture={(e) => {
          if (!ready()) {
            void ensureCloudbedsLoaded(timeout).then((ok) => {
              if (!ok) {
                e.preventDefault();
                e.stopPropagation();
                window.open(fallbackUrl2, "_blank", "noopener,noreferrer");
              }
            });
          }
        }}
        onPointerEnter={() => { void ensureCloudbedsLoaded(timeout); }}
        onTouchStart={() => { void ensureCloudbedsLoaded(timeout); }}
        onFocus={() => { void ensureCloudbedsLoaded(timeout); }}
        {...rest}
      >
        <button
          type="button"
          aria-label={visibleLabel || "Reservar"}
          className={btnClass}
        >
          {visibleLabel}
        </button>
        <div className="absolute inset-0 z-10">
          {(() => {
            const webComponent = createSafeWebComponent({
              ...wcNoLabel,
              "aria-hidden": "true",
              tabIndex: -1,
              className: "cb-overlay-invisible",
              style: {
                opacity: 0.001,
                pointerEvents: "auto",
                touchAction: "manipulation",
                background: "transparent",
                color: "transparent",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: "0",
                left: "0",
                margin: "0",
                padding: "0",
                border: "none",
                outline: "none",
                display: "block",
                zIndex: "10",
              },
            });
            return webComponent || (
              <div 
                className="cb-overlay-invisible"
                style={{ opacity: 0, pointerEvents: "none", width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              />
            );
          })()}
        </div>
      </div>
    );
  }

  const fallbackUrl2 = directUrlFallback || `https://hotels.cloudbeds.com/${propertyCode}`;
  return (
    <a
      href={fallbackUrl2}
      target="_blank"
      rel="noopener noreferrer"
      className={`${effectiveButtonClassName || ''} ${className || ''}`}
      {...rest}
    >
      {computedLabel}
    </a>
  );
}
