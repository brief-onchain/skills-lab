import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const fadeInUp = (element: HTMLElement, delay: number = 0) => {
  return gsap.fromTo(
    element,
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay,
      ease: 'power3.out',
    }
  );
};

export const staggerReveal = (elements: HTMLElement[], trigger?: HTMLElement) => {
  return gsap.fromTo(
    elements,
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: trigger ? {
        trigger: trigger,
        start: 'top 80%',
      } : undefined,
    }
  );
};

export const scanlineEffect = (element: HTMLElement) => {
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(element, {
    backgroundPosition: '0 100%',
    duration: 5,
    ease: 'linear',
  });
  return tl;
};

export const hoverLift = (element: HTMLElement) => {
  element.addEventListener('mouseenter', () => {
    gsap.to(element, { y: -5, borderColor: '#F0BE57', duration: 0.3 });
  });
  element.addEventListener('mouseleave', () => {
    gsap.to(element, { y: 0, borderColor: '#1A150C', duration: 0.3 });
  });
};
