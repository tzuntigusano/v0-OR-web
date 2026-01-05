"use client"

export function VideoBackground() {
  return (
    <div className="video-background">
      <iframe
        src="https://www.youtube.com/embed/NMjJ1Uh7Rgw?autoplay=1&mute=1&loop=1&playlist=NMjJ1Uh7Rgw&controls=0&showinfo=0&rel=0&modestbranding=1"
        title="Star Citizen Background Video"
        allow="autoplay; encrypted-media"
        className="w-full h-full object-cover"
      />
    </div>
  )
}
