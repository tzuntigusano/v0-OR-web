"use client"
import { useDivision } from "@/context/DivisionContext"

export function VideoBackground() {
  const { isIndustrial } = useDivision()
  
  // Video PVP vs Video Industrial (ExMVXVWHiAQ)
  const videoId = isIndustrial ? "ExMVXVWHiAQ" : "NMjJ1Uh7Rgw"

  return (
    <div className="video-background">
      <iframe
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
        title="Star Citizen Background Video"
        allow="autoplay; encrypted-media"
        className="w-full h-full object-cover"
      />
    </div>
  )
}