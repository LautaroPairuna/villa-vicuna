"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const WhatsappLink: React.FC = () => {
  const phoneNumber: string = "5493874649748";
  const customMessage: string = encodeURIComponent("¡Hola! Me interesa Villa Vicuña, Hotel en Salta. ¿Podrían brindarme más información?");
  const whatsappUrl: string = `https://wa.me/${phoneNumber}?text=${customMessage}`;
  const [hideForBooking, setHideForBooking] = useState(false);

  useEffect(() => {
    const checkOpen = () => {
      try {
        const root = document.querySelector('.cb-bookingengine-root');
        if (!root) return false;
        const content = root.querySelector('[class*="styles-module__content"]');
        if (!content || !(content instanceof HTMLElement)) return false;
        const rect = content.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      } catch {
        return false;
      }
    };

    const update = () => setHideForBooking(checkOpen());
    update();

    const observer = new MutationObserver(() => update());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <Link href={whatsappUrl} passHref  
    className="ms-4"
    target="_blank"
    title="Contacta con Villa Vicuña por WhatsApp"
    style={{
      position: 'fixed',
      display: 'inline-block',
      bottom: '20px',
      right: '1.5em',
      zIndex: hideForBooking ? 5 : 25,
      pointerEvents: hideForBooking ? 'none' : 'auto',
      opacity: hideForBooking ? 0 : 1
    }}>
      <Image
        src="/images/icons/ico-whatsapp-ventana.svg"
        alt="Logo WhatsApp"
        width={64}
        height={64}
        loading="lazy"
      />
    </Link>
  );
};

export default WhatsappLink;
