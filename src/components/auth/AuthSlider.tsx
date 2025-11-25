import { useState, useEffect } from 'react';

const slides = ['/slider1.png', '/slider2.png', '/silder3.jpeg'];

export default function AuthSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center relative h-full">
      <div className="relative w-full max-w-3xl mx-auto">
        {slides.map((image, index) => (
          <div
            key={index}
            className={`transition-all duration-500 ${
              index === currentSlide
                ? 'opacity-100 transform translate-x-0'
                : 'opacity-0 transform translate-x-4 absolute inset-0'
            }`}
          >
            <img
              src={image}
              alt="Slider"
              className="w-full h-auto mx-auto transition-transform duration-300 hover:scale-105 rounded-xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
