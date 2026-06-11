// Definiciones de tipos para Cloudbeds

declare global {
  interface Window {
    CloudbedsReservationWidget?: {
      open: (options: {
        propertyCode: string;
        mode?: 'popup' | 'standard';
        lang?: string;
        currency?: string;
      }) => void;
    };
  }
}

// Web Components de Cloudbeds
declare namespace JSX {
  interface IntrinsicElements {
    'cb-book-now-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'property-code'?: string;
        'class-name'?: string;
        label?: string;
        width?: string;
        height?: string;
        lang?: string;
        currency?: string;
        'disable-css-title-reset'?: 'si' | 'no';
        'hide-custom-header'?: 'si' | 'no';
        'hide-custom-footer'?: 'si' | 'no';
        'hide-property-info'?: 'si' | 'no';
        'ignore-search-params'?: 'si' | 'no';
        mode?: 'estándar' | 'ventana emergente' | 'standard' | 'popup';
      },
      HTMLElement
    >;
    
    'cb-immersive-experience': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'property-code'?: string;
        lang?: string;
        currency?: string;
        'disable-css-title-reset'?: 'si' | 'no';
        'hide-custom-header'?: 'si' | 'no';
        'hide-custom-footer'?: 'si' | 'no';
        'hide-property-info'?: 'si' | 'no';
        'ignore-search-params'?: 'si' | 'no';
      },
      HTMLElement
    >;
  }
}

export {};
