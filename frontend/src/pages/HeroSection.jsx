import React, { useEffect, useState } from 'react';

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section 
      className="relative min-h-screen bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: "url('/farm.avif')",
        backgroundPosition: `center ${scrollPosition * 0.5}px`
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-float"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 15}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-white/85"></div>
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto h-screen flex items-center px-6 md:px-12">
        <div className={`max-w-4xl text-gray-900 transform transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
          
          {/* Main heading */}
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <span className="inline-block">
              <span className="text-black animate-shimmer">
                Farm
              </span>
            </span>
            <span className="inline-block ml-4 relative">
              <span className="text-gray-700">Oracle</span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-black rounded-full"></div>
            </span>
          </h1>
          
          {/* Subtitle */}
          <h2 className={`text-xl md:text-3xl lg:text-4xl mb-8 font-light text-gray-600 leading-relaxed transition-all duration-700 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Africa's <span className="text-black font-semibold">Autonomous AI Farming Oracle</span>
            <br className="hidden md:block" />
            <span className="text-gray-500">on the Blockchain</span>
          </h2>
          
          {/* Description */}
          <p className={`text-lg md:text-xl leading-relaxed mb-10 max-w-2xl text-gray-600 transition-all duration-700 delay-400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Empowering African farmers with <span className="text-black font-medium">AI-driven insights</span> and <span className="text-gray-800 font-medium">blockchain-backed transparency</span>. 
            Combining computer vision, predictive analytics, and decentralized crop trading.
          </p>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <button className="group relative bg-black text-white px-8 py-4 font-bold rounded-xl hover:shadow-2xl transition-all duration-300 text-sm overflow-hidden transform hover:scale-105 shadow-lg">
              <span className="relative z-10 flex items-center justify-center">
                <span className="mr-2">Launch Oracle AI</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
            
            <a 
              href="https://gamma.app/docs/FarmOracle-Africas-AI-Farming-Oracle-on-the-Blockchain-ggjzchcazv7vtuy?mode=doc"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white border-2 border-black text-black px-8 py-4 font-semibold rounded-xl hover:bg-black hover:text-white transition-all duration-300 text-sm transform hover:scale-105 shadow-md inline-block"
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="mr-2">View Docs</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
            </a>
          </div>
          
          {/* Stats */}
          <div className={`flex flex-wrap gap-8 mt-12 transition-all duration-700 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="text-center group">
              <div className="text-3xl font-bold text-black group-hover:text-gray-700 transition-colors">94.2%</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">AI Accuracy</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-black group-hover:text-gray-700 transition-colors">50M+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Target Farmers</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-black group-hover:text-gray-700 transition-colors">$0.01</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Transaction Cost</div>
            </div>
          </div>
        </div>
        
        {/* Floating card */}
        <div className={`absolute top-20 right-10 md:right-20 lg:right-40 bg-white rounded-2xl p-6 border border-gray-200 shadow-xl transform transition-all duration-1000 delay-700 floating ${isLoaded ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-10 opacity-0 rotate-6'}`}>
          <div className="text-center">
            <div className="text-black font-bold text-4xl mb-2">4</div>
            <div className="text-gray-900 text-sm font-semibold">AI Oracles</div>
            <div className="text-gray-600 text-xs mt-1">Disease • Market • Soil • Weather</div>
            <div className="w-full h-1 bg-black rounded-full mt-3"></div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-70' : 'opacity-0'}`}>
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest mb-3 text-gray-500 font-medium">Scroll to Explore</span>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1 hover:border-black transition-colors">
              <div className="w-1 h-3 bg-black rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// CSS animations
const styles = `
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-15px) translateX(8px);
  }
  50% {
    transform: translateY(-8px) translateX(-12px);
  }
  75% {
    transform: translateY(-20px) translateX(12px);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-float {
  animation: float linear infinite;
}

.animate-shimmer {
  animation: shimmer 4s infinite;
  background-size: 200% 100%;
}
`;

const StyleTag = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);

const EnhancedHeroSection = () => (
  <>
    <StyleTag />
    <HeroSection />
  </>
);

export default EnhancedHeroSection;