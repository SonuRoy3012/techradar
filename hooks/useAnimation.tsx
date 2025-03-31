'use client';

import { useEffect, useState } from 'react';

type AnimationClass = 
  | 'fade-in'
  | 'slide-up'
  | 'slide-in-right'
  | 'scale-in'
  | 'bounce-in';

interface UseAnimationProps {
  animation: AnimationClass;
  delay?: number;
  duration?: number;
  threshold?: number;
}

export function useAnimation({
  animation,
  delay = 0,
  duration = 0.5,
  threshold = 0.1
}: UseAnimationProps) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(ref);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);
  
  const style = {
    opacity: isVisible ? 1 : 0,
    animation: isVisible ? `${animation} ${duration}s ease-out forwards` : 'none',
    animationDelay: `${delay}s`,
  };
  
  return { ref: setRef, style, isVisible };
}