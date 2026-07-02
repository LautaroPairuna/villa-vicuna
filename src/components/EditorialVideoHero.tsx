interface EditorialVideoHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  videoUrl?: string;
  posterUrl?: string;
}

export default function EditorialVideoHero({
  eyebrow,
  title,
  description,
  videoUrl = "/videos/video-home.mp4",
  posterUrl = "/images/hero-poster.webp",
}: EditorialVideoHeroProps) {
  return (
    <section className="relative min-h-[calc(100dvh-5rem)] overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl}
        >
          <source src={videoUrl} />
        </video>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative flex min-h-[calc(100dvh-5rem)] items-end px-4 pb-14 pt-28 text-white md:px-12 md:pb-18">
        <div className="mx-auto w-full max-w-[1200px]">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-4xl uppercase tracking-[0.2em] sm:text-5xl lg:text-[4.2rem] lg:leading-[1.12]">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-7 tracking-[0.12em] text-white/85">{description}</p>
        </div>
      </div>
    </section>
  );
}
