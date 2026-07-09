interface EditorialVideoHeroProps {
  videoUrl?: string;
  posterUrl?: string;
}

export default function EditorialVideoHero({
  videoUrl = "/videos/video-home.mp4",
  posterUrl = "/images/hero-poster.webp",
}: EditorialVideoHeroProps) {
  const webmUrl = videoUrl.endsWith(".mp4") ? videoUrl.replace(/\.mp4$/, ".webm") : null;

  return (
    <section className="relative h-screen overflow-hidden">
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
          {webmUrl && <source src={webmUrl} type="video/webm" />}
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
