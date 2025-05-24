import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const WhatsappLink: React.FC = () => {
  const phoneNumber: string = "5493874649748";
  const customMessage: string = encodeURIComponent("¡Hola! Me interesa Villa Vicuña, Hotel en Salta. ¿Podrían brindarme más información?");
  const whatsappUrl: string = `https://wa.me/${phoneNumber}?text=${customMessage}`;

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
      zIndex: 1000
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
