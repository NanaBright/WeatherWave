"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const images = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg"]

export function BackgroundSlider() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 10000) // Change image every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 -z-10">
      {images.map((image, index) => (
        <Image
          key={image}
          src={image || "/placeholder.svg"}
          alt={`Weather background ${index + 1}`}
          fill
          style={{
            objectFit: "cover",
            opacity: index === currentImageIndex ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
          priority={index === 0}
        />
      ))}
      <div className="absolute inset-0 bg-black/30" /> {/* Overlay for better text visibility */}
    </div>
  )
}

