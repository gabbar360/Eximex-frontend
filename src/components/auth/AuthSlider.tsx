import { useState, useEffect } from 'react';

interface SlideData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

const slides: SlideData[] = [
  {
    id: 1,
    image: "/sidelogo3.png",
    title: "Global Trade",
    subtitle: "Made Simple",
    description: "Connect with verified suppliers and buyers worldwide through our secure platform.",
    features: ["50K+ Active Traders", "180+ Countries", "$2B+ Trade Volume", "24/7 Support"]
  },
  {
    id: 2,
    image: "/sidelogo3.png",
    title: "Secure Trading",
    subtitle: "Platform",
    description: "Advanced security measures to protect your business transactions and data.",
    features: ["SSL Encryption", "Verified Suppliers", "Secure Payments", "Trade Protection"]
  },
  {
    id: 3,
    image: "/sidelogo3.png",
    title: "Smart Business",
    subtitle: "Solutions",
    description: "Streamline your import-export operations with our intelligent tools.",
    features: ["Real-time Tracking", "Document Management", "Analytics Dashboard", "Mobile Access"]
  }
];

export default function AuthSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="hidden lg:flex flex-col items-center justify-center text-white text-center relative h-full">
      {/* Slider Content */}
      <div className="relative w-full max-w-md mx-auto">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`transition-all duration-500 ${
              index === currentSlide 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform translate-x-4 absolute inset-0'
            }`}
          >
            <div className="mb-6">
              <img 
                src={slide.image} 
                alt="Eximex" 
                className="h-32 mb-4 mx-auto transition-transform duration-300 hover:scale-105"
              />
              <h1 className="text-3xl font-bold mb-2 leading-tight">
                {slide.title}
                <span className="block text-blue-300">{slide.subtitle}</span>
              </h1>
              <p className="text-base text-blue-100 mb-6 leading-relaxed">
                {slide.description}
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {slide.features.map((feature, idx) => (
                <div key={idx} className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-lg font-bold text-blue-300 mb-1">
                    {feature.split(' ')[0]}
                  </div>
                  <div className="text-xs text-blue-100">
                    {feature.split(' ').slice(1).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Slider Indicators */}
      <div className="flex space-x-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-blue-300 scale-110' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mx-auto mt-4 bg-white/20 rounded-full h-1">
        <div 
          className="bg-blue-300 h-1 rounded-full transition-all duration-4000 ease-linear"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}