import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export function useParallaxFloat(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => ScrollTrigger.maxScroll(window) * speed * -0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const elements = ref.current?.querySelectorAll('[data-reveal]');
      
      elements?.forEach((el) => {
        gsap.fromTo(el, 
          { 
            opacity: 0, 
            y: 60,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}

export function useConfessionReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const confessions = ref.current?.querySelectorAll('[data-confession]');
      
      confessions?.forEach((el, index) => {
        gsap.fromTo(el,
          {
            opacity: 0,
            x: index % 2 === 0 ? -40 : 40,
            filter: 'blur(8px)',
          },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}

export function usePulsingGlow() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        boxShadow: '0 0 60px 10px rgba(16, 185, 129, 0.5)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}

export function useCountUp(targetValue: number, duration: number = 2) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const obj = { value: 0 };
      
      gsap.to(obj, {
        value: targetValue,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.value).toLocaleString();
          }
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [targetValue, duration]);

  return ref;
}

export function useFloatingOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const orbs = containerRef.current?.querySelectorAll('[data-orb]');
      
      orbs?.forEach((orb, i) => {
        gsap.to(orb, {
          y: '+=30',
          x: i % 2 === 0 ? '+=20' : '-=20',
          rotation: i % 2 === 0 ? 15 : -15,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

export function useRedemptionRise() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      // Golden light rise effect
      gsap.fromTo(ref.current,
        {
          backgroundPosition: '50% 100%',
          filter: 'brightness(0.8)',
        },
        {
          backgroundPosition: '50% 0%',
          filter: 'brightness(1.2)',
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}
