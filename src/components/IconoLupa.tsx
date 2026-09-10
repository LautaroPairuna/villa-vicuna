/**
 * Lupa de los "ver más" que aparecen al pasar el mouse por una foto.
 *
 * El dibujo anterior era una silueta rellena: el aro salía grueso y el mango,
 * hecho con un rectángulo redondeado, entraba en el aro y se veía como un
 * bulto. Este va con trazo fino y punta redonda, que es lo que pega con la
 * tipografía liviana del sitio, y el mango arranca justo donde termina el aro
 * (el borde del círculo a 45° cae en 15,15) para que no queden ni escalón ni
 * hueco entre las dos piezas.
 *
 * El trazo no escala con el tamaño: a 20 px queda en 1,25 px y a 32 px en 2 px,
 * así la lupa mantiene el mismo peso visual que el texto que la acompaña.
 */
export default function IconoLupa({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.35 15.35 20.4 20.4" />
    </svg>
  );
}
