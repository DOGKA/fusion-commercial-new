import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Sadece client-side'da register et
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
