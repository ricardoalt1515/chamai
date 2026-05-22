"use client";

import { useEffect } from "react";

export function LandingEffects(): null {
  useEffect(() => {
    const nav = document.querySelector(".nav");
    if (!nav) return;

    let ticking = false;
    const update = () => {
      nav.classList.toggle("scrolled", window.scrollY > 8);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(document.querySelectorAll(".reveal"));
    if (prefersReduced || !("IntersectionObserver" in window)) {
      for (const target of targets) target.classList.add("in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return null;
}
