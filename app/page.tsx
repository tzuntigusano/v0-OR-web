import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { JoinSection } from "@/components/join-section"
import { VideoBackground } from "@/components/video-background"
import { Navigation } from "@/components/navigation"
import { MediaSection } from "@/components/media-section"

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <VideoBackground />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <MediaSection />
      <JoinSection />
    </main>
  )
}
