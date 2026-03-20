import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const SPORTS = [
  {
    name: "FOOTBALL",
    color: "#00E676",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="3" fill="none"/>
        <polygon points="40,16 47,30 62,30 51,39 55,54 40,45 25,54 29,39 18,30 33,30" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15"/>
        <circle cx="40" cy="40" r="6" fill="currentColor" fillOpacity="0.4"/>
      </svg>
    ),
  },
  {
    name: "BASKETBALL",
    color: "#FF6D00",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="3" fill="none"/>
        <path d="M40 8 Q55 25 55 40 Q55 55 40 72" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M40 8 Q25 25 25 40 Q25 55 40 72" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <line x1="8" y1="40" x2="72" y2="40" stroke="currentColor" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    name: "TENNIS",
    color: "#FFEB3B",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="3" fill="none"/>
        <path d="M16 28 Q28 40 16 52" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M64 28 Q52 40 64 52" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <line x1="14" y1="40" x2="66" y2="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>
      </svg>
    ),
  },
  {
    name: "CRICKET",
    color: "#E53935",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="34" y="10" width="10" height="38" rx="5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <rect x="36" y="48" width="6" height="22" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="58" cy="52" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <path d="M52 46 Q58 52 52 58" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M64 46 Q58 52 64 58" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    name: "BASEBALL",
    color: "#42A5F5",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="3" fill="none"/>
        <path d="M26 20 Q32 30 28 40 Q24 50 28 60" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M54 20 Q48 30 52 40 Q56 50 52 60" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="28" y1="32" x2="36" y2="30" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="28" y1="38" x2="36" y2="38" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="28" y1="44" x2="36" y2="46" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="52" y1="32" x2="44" y2="30" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="52" y1="38" x2="44" y2="38" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="52" y1="44" x2="44" y2="46" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    name: "RUGBY",
    color: "#AB47BC",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="40" rx="26" ry="18" stroke="currentColor" strokeWidth="3" fill="none"/>
        <line x1="14" y1="40" x2="66" y2="40" stroke="currentColor" strokeWidth="2"/>
        <line x1="26" y1="22" x2="26" y2="58" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <line x1="40" y1="22" x2="40" y2="58" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <line x1="54" y1="22" x2="54" y2="58" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      </svg>
    ),
  },
];

export function getSportColor(sportName) {
  const sport = SPORTS.find(s => s.name.toUpperCase() === sportName?.toUpperCase());
  return sport ? sport.color : "#FFFFFF";
}

export default function SportsLoader({ onComplete }) {
  const containerRef = useRef(null);
  const ballRefs = useRef([]);
  const labelRef = useRef(null);
  const taglineRef = useRef(null);
  const progressBarRef = useRef(null);
  const orbitRef = useRef(null);
  const orbitDotsRef = useRef([]);
  const loaderDotsRef = useRef([]);
  // We keep active state ONLY for the very first render, then GSAP takes over.
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" }
      );

      gsap.fromTo(
        taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" }
      );

      // Progress bar loading for 4 seconds, then out
      gsap.to(progressBarRef.current, {
        width: "100%",
        duration: 4,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.1,
            duration: 0.5,
            ease: "power2.in",
            onComplete: onComplete
          });
        }
      });

      // Orbit spin
      gsap.to(orbitRef.current, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
        force3D: true,
      });

      const cycleTimeline = gsap.timeline({ repeat: -1 });

      SPORTS.forEach((sport, i) => {
        cycleTimeline
          .to(labelRef.current, { color: sport.color, duration: 0.3 })
          .set(labelRef.current, { innerText: sport.name }, "<")
          .to(progressBarRef.current, { background: `linear-gradient(90deg, ${sport.color}88, ${sport.color})`, boxShadow: `0 0 12px ${sport.color}`, duration: 0.3 }, "<")
          // Update orbit dots
          .to(orbitDotsRef.current, { opacity: 0.35, scale: 1, boxShadow: "none", duration: 0.3 }, "<")
          .to(orbitDotsRef.current[i], { opacity: 1, scale: 1.5, boxShadow: `0 0 10px ${sport.color}`, duration: 0.3 }, "<")
          // Update loader dots
          .to(loaderDotsRef.current, { background: sport.color, duration: 0.3 }, "<")
          .fromTo(ballRefs.current[i], 
            { scale: 0, opacity: 0, rotation: -90 }, 
            { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(1.5)", force3D: true }
          )
          .fromTo(labelRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "<")
          .to(ballRefs.current[i], 
            { scale: 0, opacity: 0, rotation: 180, duration: 0.4, ease: "back.in(1.2)", force3D: true }, 
            "+=0.75"
          );
      });

      const dots = document.querySelectorAll(".loader-dot");
      dots.forEach((dot, i) => {
        gsap.to(dot, { y: -14, duration: 0.6 + i * 0.12, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.15 });
      });
    });

    return () => ctx.revert();
  }, [onComplete]);

  const currentSport = SPORTS[active];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050810] font-bebas">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div ref={containerRef} className="relative flex flex-col items-center gap-6 p-12 w-[360px] bg-white/5 border border-white/10 rounded-[24px] backdrop-blur-[20px] shadow-[0_40px_80px_rgba(0,0,0,0.6)] opacity-0">
        
        <div className="flex items-center gap-2 self-start">
          <span className="text-xl">⚡</span>
          <span className="text-white text-xl tracking-[2px] font-[800]">
            SPORTZ<span className="animate-spectrum">LIVE</span>
          </span>
        </div>

        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <div ref={orbitRef} className="absolute inset-0 rounded-full border border-dashed border-white/10 will-change-transform">
            {SPORTS.map((s, i) => (
              <div
                key={i}
                ref={el => orbitDotsRef.current[i] = el}
                style={{
                  position: "absolute", width: 8, height: 8, borderRadius: "50%",
                  background: s.color,
                  top: `${50 - 46 * Math.cos((2 * Math.PI * i) / SPORTS.length)}%`,
                  left: `${50 + 46 * Math.sin((2 * Math.PI * i) / SPORTS.length)}%`,
                  opacity: i === 0 ? 1 : 0.35,
                  transform: i === 0 ? "translate(-50%, -50%) scale(1.5)" : "translate(-50%, -50%) scale(1)",
                  boxShadow: i === 0 ? `0 0 10px ${s.color}` : "none",
                  willChange: "transform, opacity",
                }}
              />
            ))}
          </div>

          <div className="relative w-[100px] h-[100px]">
            {SPORTS.map((sport, i) => (
              <div
                key={i}
                ref={el => ballRefs.current[i] = el}
                style={{
                  position: "absolute", width: 100, height: 100, top: 0, left: 0,
                  color: sport.color,
                  opacity: 0,
                  transform: "scale(0)",
                  filter: `drop-shadow(0 0 20px ${sport.color}55)`,
                  willChange: "transform, opacity",
                }}
              >
                {sport.svg}
              </div>
            ))}
          </div>
        </div>

        <div ref={labelRef} style={{ color: SPORTS[0].color }} className="text-4xl tracking-[6px] font-[900] text-center will-change-[transform,opacity,color]">
          {SPORTS[0].name}
        </div>

        <p ref={taglineRef} className="text-white/40 text-[11px] tracking-[2px] uppercase font-mono m-0 text-center">
          Loading latest scores & updates...
        </p>

        <div className="w-full">
          <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              style={{
                height: "100%", width: "0%", borderRadius: "4px",
                background: `linear-gradient(90deg, ${SPORTS[0].color}88, ${SPORTS[0].color})`,
                boxShadow: `0 0 12px ${SPORTS[0].color}`,
                willChange: "width, background",
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 items-end h-[20px]">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              ref={el => loaderDotsRef.current[i] = el}
              className="loader-dot w-1.5 h-1.5 rounded-full"
              style={{ background: SPORTS[0].color, opacity: 0.6 + (i === 2 ? 0.4 : 0), willChange: "background" }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
