import { videoSources } from "@/lib/videoSources";

interface EditorialVideoHeroProps {
  videoUrl?: string;
  posterUrl?: string;
}

export default function EditorialVideoHero({
  videoUrl = "/videos/video-home.mp4",
  posterUrl = "/images/hero-poster.webp",
}: EditorialVideoHeroProps) {
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
          {videoSources(videoUrl).map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      </div>
    </section>
  );
}
