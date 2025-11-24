import { useState, useEffect } from 'react';

const images = [
  '/silder_1.png',
  '/silder_2.png',
  '/silder_3.png',
  '/silder_4.png',
];

export default function CompanySetupSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full overflow-hidden">
      <img
        src={images[currentSlide]}
        alt={`Slide ${currentSlide + 1}`}
        className="w-full h-full object-cover transition-all duration-1000"
      />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 h-3 bg-white rounded-full'
                : 'w-3 h-3 bg-white/60 rounded-full hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
