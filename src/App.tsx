/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Play, Pause, RotateCcw, Heart } from 'lucide-react';

const SCENES = [
  { id: 'start', duration: 8400, ambient: null },
  { id: 'sambhal', duration: 3200, ambient: 'https://cdn.pixabay.com/audio/2022/01/18/audio_627af30570.mp3' },
  { id: 'ke-rakha', duration: 2000, ambient: 'https://cdn.pixabay.com/audio/2022/01/18/audio_627af30570.mp3' },
  { id: 'wo-phool', duration: 3000, ambient: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3527873c4.mp3' },
  { id: 'notebook', duration: 3800, ambient: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3527873c4.mp3' },
  { id: 'eye', duration: 3700, ambient: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7366746816.mp3' },
  { id: 'duniya', duration: 2300, ambient: 'https://cdn.pixabay.com/audio/2022/01/18/audio_627af30570.mp3' },
  { id: 'lamha', duration: 3000, ambient: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7366746816.mp3' },
];

export default function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);
  const sfxRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentSceneIndex === 5) { // 'eye' scene
      const playBlinkSfx = () => {
        if (sfxRef.current) {
          sfxRef.current.src = 'https://cdn.pixabay.com/audio/2022/03/24/audio_7839103d51.mp3'; // Soft whoosh/click
          sfxRef.current.volume = 0.42;
          sfxRef.current.play().catch(e => console.log("SFX play failed", e));
        }
      };

      // Trigger SFX at blink points (0s and 1.5s based on blink transition times)
      const t1 = setTimeout(playBlinkSfx, 0);
      const t2 = setTimeout(playBlinkSfx, 1200);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [currentSceneIndex]);

  useEffect(() => {
    if (!isPlaying) {
      ambientRef.current?.pause();
      return;
    }

    const ambientUrl = SCENES[currentSceneIndex].ambient;
    if (ambientUrl && ambientRef.current) {
      ambientRef.current.src = ambientUrl;
      ambientRef.current.volume = 0.3;
      ambientRef.current.loop = true;
      ambientRef.current.play().catch(e => console.log("Ambient play failed", e));
    } else {
      ambientRef.current?.pause();
    }
  }, [currentSceneIndex, isPlaying]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentSceneIndex < SCENES.length - 1) {
        setCurrentSceneIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, SCENES[currentSceneIndex].duration);

    return () => clearTimeout(timer);
  }, [currentSceneIndex, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.log("Audio play failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentSceneIndex(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  };

  const glitchVariant = {
    animate: {
      x: [0, -1, 1, -0.5, 0.5, 0],
      y: [0, 0.5, -0.5, 1, -1, 0],
      skew: [0, -0.5, 0.5, 0],
      opacity: [1, 0.95, 1, 0.98, 1],
      textShadow: [
        "0 0 0 rgba(255,0,0,0), 0 0 0 rgba(0,0,255,0)",
        "-1px 0 0.5px rgba(255,0,0,0.3), 1px 0 0.5px rgba(0,0,255,0.3)",
        "1px 0 0.5px rgba(255,0,0,0.3), -1px 0 0.5px rgba(0,0,255,0.3)",
        "0 0 0 rgba(255,0,0,0), 0 0 0 rgba(0,0,255,0)"
      ],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: "mirror" as const,
        repeatDelay: Math.random() * 1 // Much longer delay for subtlety
      }
    }
  };

  const currentScene = SCENES[currentSceneIndex].id;

  const sceneTransition = {
    initial: { 
      opacity: 0, 
      scale: 1.2, 
      filter: 'blur(40px) brightness(2)', 
      rotateX: 10,
      y: 50
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px) brightness(1)', 
      rotateX: 0,
      y: 0
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      filter: 'blur(40px) brightness(0.5)', 
      rotateX: -10,
      y: -50
    },
    transition: { 
      duration: 1.8, 
      ease: [0.22, 1, 0.36, 1] 
    }
  };

  const textVariant = {
    hidden: { 
      opacity: 0, 
      y: 100, 
      filter: 'blur(30px)', 
      scale: 0.3, 
      rotateX: 90, 
      rotate: -10 
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      rotateX: 0,
      rotate: 0,
      transition: {
        delay: i * 0.15, 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: { 
      opacity: 0, 
      y: -100, 
      filter: 'blur(30px)', 
      scale: 1.5, 
      rotateX: -90, 
      transition: { duration: 1 } 
    }
  };

    return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#1a0b2e] flex items-center justify-center font-sans">
      <AnimatePresence>
        
      </AnimatePresence>
      <audio ref={audioRef} src="/22.mp3" />
      <audio ref={ambientRef} />
      <audio ref={sfxRef} />

      {/* Atmospheric Theme: Lovely, Vibrant, Cinematic */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Layered Radial Gradients - Warmer and More Vibrant */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 15, 0],
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#5b21b6_0%,_transparent_70%)] blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.4, 1, 1.4],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, -20, 0],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#ec4899_0%,_transparent_70%)] blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_#fbbf24_0%,_transparent_60%)] blur-[120px]"
        />
        
        {/* Dynamic Light Leak - Warmer */}
        <motion.div
          animate={{
            x: ['-100%', '200%'],
            opacity: [0, 0.15, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[60%] h-full bg-gradient-to-r from-transparent via-pink-400/10 to-transparent skew-x-12 blur-3xl"
        />

        {/* Scanlines Effect - Softer */}
        <div className="absolute inset-0 z-10 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_2px,3px_100%]" />
        
        {/* Glass Surface Overlay */}
        <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[0.5px]" />
        
        {/* Subtle Grain */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        {/* Vignette - Softer and More Colorful */}
        <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(26,11,46,0.8)]" />

        {/* Bokeh / Floating Petals Effect - More "Lovely" */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: "110%", 
                opacity: 0,
                scale: Math.random() * 0.6 + 0.4
              }}
              animate={{ 
                y: "-10%", 
                opacity: [0, 0.4, 0],
                x: (Math.random() * 100 + (Math.random() - 0.5) * 15) + "%",
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 12 + Math.random() * 8, 
                repeat: Infinity, 
                delay: Math.random() * 1,
                ease: "linear"
              }}
              className="absolute w-3 h-3 bg-pink-400/30 rounded-full blur-[1px] shadow-[0_0_8px_rgba(244,114,182,0.4)]"
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSceneIndex}
          initial={{ x: 0, y: 0, scale: 1.1 }}
          animate={{ 
            x: [0, -2, 2, -1, 1, 0],
            y: [0, 1, -1, 0.5, -0.5, 0],
            scale: 1
          }}
          exit={{ scale: 1.1 }}
          transition={{ 
            x: { duration: 0.5, ease: "easeInOut" },
            y: { duration: 0.5, ease: "easeInOut" },
            scale: { duration: 1.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="w-full h-full flex items-center justify-center"
        >
          {currentScene === 'start' && (
          <motion.div
            key="start"
            {...sceneTransition}
            className="text-center z-10 p-12 glass-morphism rounded-[40px] border border-white/10"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="mb-8"
            >
              <h1 className="text-6xl font-black tracking-tighter text-white uppercase drop-shadow-2xl">Aailobhuuu😘</h1>
              <p className="text-orange-500 font-serif italic text-xl mt-2 tracking-widest">FINDING HER</p>
            </motion.div>
            <motion.button
              onClick={togglePlay}
              animate={{ 
                boxShadow: ["0 0 20px rgba(255,255,255,0.2)", "0 0 40px rgba(255,255,255,0.4)", "0 0 20px rgba(255,255,255,0.2)"],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="px-16 py-6 bg-white text-black rounded-full flex items-center gap-4 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] group"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="fill-black" />}
              <span className="font-bold tracking-[0.3em] uppercase text-xl">Open Surprise </span>
            </motion.button>
          </motion.div>
        )}

        {currentScene === 'sambhal' && (
          <motion.div
            key="sambhal"
            {...sceneTransition}
            className="flex gap-4 text-[14vw] font-black tracking-tighter text-white z-10"
          >
            {"SAMBHAL".split("").map((char, index) => {
              // Create more organic, non-uniform scattering
              const seed = index * 137.5; // Golden angle-ish seed
              const baseAngle = (index / 7) * Math.PI * 2;
              const angleNoise = (Math.sin(seed) * 2); 
              const angle = baseAngle + angleNoise;
              
              // Vary distance and delay more naturally
              const distance = 1000 + (Math.cos(seed) * 400); 
              const delay = 0.8 + (index * 0.12) + (Math.sin(index) * 0.1);
              
              return (
                <motion.span
                  key={index}
                  initial={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    rotate: (Math.sin(seed) * 1080), 
                    opacity: 0,
                    scale: 3 + Math.random() * 2,
                    filter: 'blur(25px)'
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 60,
                    damping: 10,
                    duration: 0.2, 
                    delay: delay * 0.8,
                  }}
                  className="inline-block drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
                >
                  {char}
                </motion.span>
              );
            })}
          </motion.div>
        )}

        {currentScene === 'ke-rakha' && (
          <motion.div key="ke-rakha" {...sceneTransition} className="relative flex items-center justify-center z-10">
            <div className="text-[14vw] font-black text-gray-100 opacity-20 select-none blur-[2px]">
              SAMBHAL
            </div>
            <motion.div
              initial={{ scaleX: 0, opacity: 0, skew: -10 }}
              animate={{ scaleX: 1, opacity: 1, skew: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-gray-900 px-16 py-6 transform -rotate-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <motion.span
                  initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-[7vw] font-black text-orange-500 uppercase tracking-[0.3em]"
                >
                  KE RAKHA !
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {currentScene === 'wo-phool' && (
          <motion.div key="wo-phool" {...sceneTransition} className="flex flex-col items-center gap-12 z-10">
            <div className="flex gap-8">
              {["WO", "PHOOL", "MERA", "TU"].map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={textVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`text-[7vw] tracking-[0.2em] uppercase ${i === 1 ? 'font-black text-orange-500 drop-shadow-[0_0_40px_rgba(255,78,0,0.5)]' : 'font-light text-white/60'}`}
                >
                  <motion.span
                    variants={glitchVariant}
                    animate="animate"
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                </motion.span>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.5, rotate: -45, opacity: 0, y: 200 }}
              animate={{ scale: 1, rotate: 5, opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative group"
            >
              <img
                src="/1.jpg"
                alt="Memory"
                className="w-80 h-[500px] object-cover  transition-all duration-1000 ease-in-out"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://picsum.photos/seed/flower/800/1200";
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-8 -right-8 w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,78,0,0.5)]"
              >
                <Heart size={40} fill="white" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {currentScene === 'notebook' && (
          <motion.div key="notebook" {...sceneTransition} className="perspective-1000 w-[85vw] h-[65vh] flex z-10 relative">
            {/* Film Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none z-40 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            
            {/* Dust Particles Overlay - Golden & Magical */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%",
                    opacity: 0,
                    scale: Math.random() * 0.6 + 0.4
                  }}
                  animate={{ 
                    y: [null, (Math.random() * 30 - 15) + "%", (Math.random() * 30 - 15) + "%"],
                    x: [null, (Math.random() * 15 - 7) + "%", (Math.random() * 15 - 7) + "%"],
                    opacity: [0, Math.random() * 0.6 + 0.2, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 0.7 + Math.random() * 4, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-1 h-1 bg-orange-200 rounded-full blur-[0.5px] shadow-[0_0_5px_rgba(255,200,100,0.5)]"
                />
              ))}
            </div>

            {/* Light Leak Overlay */}
            <motion.div
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_0%_0%,_rgba(255,165,0,0.2)_0%,_transparent_50%)]"
            />

            {/* Left Page */}
            <motion.div
              initial={{ rotateY: -120, opacity: 0, originX: 1 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="flex-1 bg-[#fafaf8] border-r border-gray-200 p-16 shadow-inner overflow-hidden relative"
            >
              <div className="h-full border-l-2 border-red-200 pl-10 relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4}}
                  className="font-serif text-2xl leading-loose text-gray-700 italic"
                >
                  {"Meri shayari mein zaroor raha tu...".split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
                      className="inline-block mr-3"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
                <div className="mt-12 space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 + i * 0.25, duration: 0.7 }}
                      className="h-px bg-gray-200 w-full origin-left"
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced Ink Spreading Effect */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-multiply">
                <motion.path
                  d="M 100 150 C 250 180 150 350 350 450 S 500 200 600 400"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="100"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, filter: 'blur(50px)', opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 150 200 C 300 230 200 400 400 500 S 550 250 650 450"
                  fill="none"
                  stroke="#2a2a2a"
                  strokeWidth="60"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, filter: 'blur(30px)', opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 80 120 C 200 150 120 300 300 400 S 450 150 550 350"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="40"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, filter: 'blur(20px)', opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="180" cy="280" r="80"
                  fill="#1a1a1a"
                  initial={{ scale: 0, opacity: 0, filter: 'blur(40px)' }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                />
                <motion.circle
                  cx="450" cy="380" r="50"
                  fill="#1a1a1a"
                  initial={{ scale: 0, opacity: 0, filter: 'blur(30px)' }}
                  animate={{ scale: 1.6, opacity: 0.7 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                />
              </svg>
            </motion.div>

            {/* Right Page */}
            <motion.div
              initial={{ rotateY: 120, opacity: 0, originX: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
              className="flex-1 bg-[#fafaf8] p-10 shadow-inner relative"
            >
              <div className="grid grid-cols-2 gap-6 h-full">
                <motion.div
                  initial={{ scale: 0, rotate: -25, y: 100 }}
                  animate={{ scale: 1, rotate: 6, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 15 }}
                  className="p-2 bg-white shadow-xl border border-gray-100"
                >
                  <img
                    src="/2.jpg"
                    className="w-full h-48 object-cover  transition-all duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://picsum.photos/seed/girl1/400/400";
                    }}
                  />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, rotate: 25, y: 100 }}
                  animate={{ scale: 1, rotate: -6, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 15 }}
                  className="p-2 bg-white shadow-xl border border-gray-100 mt-16"
                >
                  <img
                    src="/3.jpg"
                    className="w-full h-48 object-cover   transition-all duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://picsum.photos/seed/girl2/400/400";
                    }}
                  />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 40, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.7, type: 'spring' }}
                className="absolute bottom-12 right-12 font-black text-gray-200 text-8xl italic select-none"
              >
                TU!
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {currentScene === 'eye' && (
          <motion.div key="eye" {...sceneTransition} className="relative w-full h-full flex items-center justify-center bg-blue-50 z-10">
            {/* Camera Flash Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
              }}
              transition={{ 
                delay: 0.4,
                duration: 0.4,
                ease: "easeOut"
              }}
              className="absolute inset-0 bg-white z-40 pointer-events-none mix-blend-overlay"
            />

            {/* Eye Lids with Blink Sequence */}
            <motion.div
              initial={{ height: "50%" }}
              animate={{ 
                height: ["50%", "0%", "0%", "50%", "0%"],
              }}
              transition={{ 
                times: [0, 0.1, 0.4, 0.5, 0.6],
                duration: 3, 
                ease: "easeInOut" 
              }}
              className="absolute top-0 left-0 w-full bg-white z-20 border-b border-gray-200 shadow-sm"
            />
            <motion.div
              initial={{ height: "50%" }}
              animate={{ 
                height: ["50%", "0%", "0%", "50%", "0%"],
              }}
              transition={{ 
                times: [0, 0.1, 0.4, 0.5, 0.6],
                duration: 3, 
                ease: "easeInOut" 
              }}
              className="absolute bottom-0 left-0 w-full bg-white z-20 border-t border-gray-200 shadow-sm"
            />

            {/* Eye -> World Transition */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Realistic Eye (Iris) */}
              <motion.div
                initial={{ opacity: 1, scale: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: [1, 1, 0],
                  x: mousePos.x * 80,
                  y: mousePos.y * 80,
                }}
                transition={{ 
                  scale: { delay: 0.2, duration: 0.8 },
                  opacity: { delay: 0.4, duration: 0.8 },
                  x: { type: 'spring', stiffness: 150, damping: 20 },
                  y: { type: 'spring', stiffness: 150, damping: 20 }
                }}
                className="absolute w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,_#4f46e5_0%,_#3b82f6_20%,_#1e3a8a_50%,_#000_100%)] border-4 border-white shadow-2xl overflow-hidden"
              >
                {/* Iris Texture Layers - Intricate Fiber Effect with Color Variations */}
                <div className="absolute inset-0 opacity-70 bg-[repeating-conic-gradient(from_0deg,_transparent_0deg_0.3deg,_rgba(255,255,255,0.25)_0.3deg_0.6deg)]" />
                <div className="absolute inset-0 opacity-60 bg-[repeating-conic-gradient(from_10deg,_transparent_0deg_0.5deg,_rgba(139,92,246,0.35)_0.5deg_1deg)]" />
                <div className="absolute inset-0 opacity-50 bg-[repeating-conic-gradient(from_20deg,_transparent_0deg_0.7deg,_rgba(6,182,212,0.3)_0.7deg_1.4deg)]" />
                <div className="absolute inset-0 opacity-40 bg-[repeating-conic-gradient(from_35deg,_transparent_0deg_1deg,_rgba(245,158,11,0.2)_1deg_2deg)]" />
                <div className="absolute inset-0 opacity-30 bg-[repeating-conic-gradient(from_50deg,_transparent_0deg_1.5deg,_rgba(236,72,153,0.15)_1.5deg_3deg)]" />
                
                {/* Limbal Ring (Dark outer edge) */}
                <div className="absolute inset-0 border-[12px] border-black/40 rounded-full blur-[4px]" />
                <div className="absolute inset-0 border-[4px] border-black/60 rounded-full" />

                {/* Fiber Highlights and Depth */}
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_transparent_25%,_rgba(255,255,255,0.15)_35%,_transparent_45%)]" />
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.3)_70%,_transparent_100%)]" />
                
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.4)_0%,_transparent_40%,_rgba(0,0,0,0.95)_100%)]" />
                <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                
                <motion.div 
                   animate={{ 
                     x: mousePos.x * 50, 
                     y: mousePos.y * 50,
                   }}
                   className="absolute inset-0 flex items-center justify-center"
                >
                   {/* Pupil with Dilation and subtle pulse */}
                   <motion.div 
                      animate={{ 
                        scale: (1 + Math.sqrt(mousePos.x**2 + mousePos.y**2) * 1.2) * (1 + Math.sin(Date.now() / 800) * 0.05)
                      }}
                      className="w-20 h-20 bg-black rounded-full shadow-inner relative"
                   >
                      <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full opacity-70 blur-[2px]" />
                      <div className="absolute bottom-4 right-6 w-3 h-3 bg-white rounded-full opacity-30 blur-[1px]" />
                   </motion.div>
                </motion.div>
              </motion.div>

              {/* World (Globe) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: [0, 0, 1],
                  x: mousePos.x * 80,
                  y: mousePos.y * 80,
                }}
                transition={{ 
                  scale: { delay: 0.4, duration: 0.7, type: 'spring' },
                  opacity: { delay: 0.4, duration: 0.8 },
                  x: { type: 'spring', stiffness: 150, damping: 20 },
                  y: { type: 'spring', stiffness: 150, damping: 20 }
                }}
                className="absolute w-64 h-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#3b82f6_0%,_#1d4ed8_40%,_#1e3a8a_100%)] border-8 border-white shadow-[0_0_80px_rgba(59,130,246,0.6)] relative overflow-hidden cursor-none"
              >
                {/* Enhanced Globe Texture */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  {/* Detailed Landmasses */}
                  <div className="absolute top-4 left-8 w-28 h-20 bg-emerald-500 rounded-full blur-xl opacity-80" />
                  <div className="absolute top-12 left-20 w-16 h-32 bg-green-600 rounded-full blur-lg opacity-70 rotate-45" />
                  <div className="absolute bottom-8 right-12 w-36 h-24 bg-emerald-400 rounded-full blur-xl opacity-80" />
                  <div className="absolute top-24 right-4 w-20 h-28 bg-green-500 rounded-full blur-lg opacity-70 -rotate-12" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-16 bg-emerald-600 rounded-full blur-2xl opacity-60" />
                  <div className="absolute bottom-4 left-10 w-20 h-10 bg-green-700 rounded-full blur-xl opacity-50" />
                  <div className="absolute top-10 right-20 w-12 h-12 bg-emerald-300 rounded-full blur-lg opacity-40" />
                  
                  {/* Specular highlights on land */}
                  <div className="absolute top-10 left-16 w-4 h-4 bg-white/30 rounded-full blur-sm" />
                  <div className="absolute bottom-20 right-20 w-2 h-2 bg-white/20 rounded-full blur-xs" />

                  {/* Cloud Formations - Layer 1 */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 opacity-40"
                  >
                    <div className="absolute top-10 left-10 w-32 h-12 bg-white rounded-full blur-2xl" />
                    <div className="absolute bottom-20 right-10 w-40 h-16 bg-white rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/4 w-24 h-10 bg-white rounded-full blur-xl" />
                  </motion.div>

                  {/* Cloud Formations - Layer 2 (Faster) */}
                  <motion.div
                    animate={{ rotate: 360, x: [0, 20, 0], y: [0, -10, 0] }}
                    transition={{ 
                      rotate: { duration: 90, repeat: Infinity, ease: "linear" },
                      x: { duration: 15, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 12, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute inset-0 opacity-30"
                  >
                    <div className="absolute top-1/4 right-1/4 w-20 h-8 bg-white/80 rounded-full blur-xl" />
                    <div className="absolute bottom-1/3 left-1/3 w-28 h-12 bg-white/60 rounded-full blur-2xl" />
                  </motion.div>
                </motion.div>

                {/* Atmospheric Haze & Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(147,197,253,0.3)_80%,_rgba(59,130,246,0.5)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(255,255,255,0.2)]" />
                
                {/* Ocean Depth Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]" />

                <motion.div
                  animate={{ x: mousePos.x * 25, y: mousePos.y * 25 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-16 h-16 bg-black/80 rounded-full shadow-2xl blur-[1px]" />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute bottom-20 text-center"
            >
              <h1 className="text-[9vw] font-black tracking-tighter text-gray-900 leading-none uppercase">
                DUNIYA <br/> <span className="text-blue-600 drop-shadow-xl">BASAI</span>
              </h1>
            </motion.div>
          </motion.div>
        )}

        {currentScene === 'duniya' && (
          <motion.div key="duniya" {...sceneTransition} className="text-center flex flex-col items-center z-10">
            <motion.p
              initial={{ opacity: 0, scale: 4, filter: 'blur(40px)', letterSpacing: "0em" }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: "1em" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-[4vw] font-light text-white/40 uppercase mb-4"
            >
              <motion.span variants={glitchVariant} animate="animate" className="inline-block">
                WOH DUNIYA BHI
              </motion.span>
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 100, rotateX: -90, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[14vw] font-black text-white leading-tight uppercase drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              <motion.span variants={glitchVariant} animate="animate" className="inline-block">
                THA TU
              </motion.span>
            </motion.h2>
          </motion.div>
        )}

        {currentScene === 'lamha' && (
          <motion.div key="lamha" {...sceneTransition} className="relative w-full h-full flex items-center justify-center bg-black z-10">
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 overflow-hidden"
            >
              {[...Array(80)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * 100 + "%",
                    y: Math.random() * 100 + "%",
                    scale: 0
                  }}
                  animate={{
                    scale: [0, 2.5, 0],
                    opacity: [0, 1, 0],
                    y: ["0%", "-50%"],
                    x: [null, (Math.random() * 10 - 5) + "%"]
                  }}
                  transition={{
                    duration: 0.2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 0.6
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_15px_white]"
                />
              ))}
            </motion.div>

            <div className="text-center z-10">
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0em", filter: 'blur(30px)', y: 50 }}
                animate={{ opacity: 1, letterSpacing: "2.5em", filter: 'blur(0px)', y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-[3vw] font-black text-white/50 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <motion.span variants={glitchVariant} animate="animate" className="inline-block">
                  WOH LAMHA BHI
                </motion.span>
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, scale: 3, rotate: -15, filter: 'blur(40px)' }}
                animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.4, duration: 0.7, type: 'spring', stiffness: 30, damping: 10 }}
                className="text-[15vw] font-black text-white mt-4 drop-shadow-[0_0_60px_rgba(255,255,255,0.5)] uppercase tracking-tighter"
              >
                <motion.span variants={glitchVariant} animate="animate" className="inline-block">
                  THA TU!
                </motion.span>
              </motion.h2>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={reset}
              className="absolute bottom-16 px-10 py-4 border-2 border-white text-white rounded-full flex items-center gap-3 hover:bg-white hover:text-black transition-all group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <RotateCcw size={24} className="relative z-10 group-hover:rotate-180 transition-transform duration-700" />
              <span className="relative z-10 font-bold uppercase tracking-widest text-lg">Play Again!!</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
      </AnimatePresence>

      {/* Watermark */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gray-400 font-medium tracking-widest text-sm z-50 pointer-events-none"
      >
        <span>made with</span>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Heart size={14} className="text-red-500 fill-red-500" />
        </motion.div>
        <span>by @j3ryy.css</span>
      </motion.div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100/10 z-50">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SCENES.reduce((acc, s) => acc + s.duration, 0) / 1000, ease: "linear" }}
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_0_15px_#f97316]"
          />
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-10 right-10 flex gap-6 opacity-10 hover:opacity-100 transition-opacity z-50">
        <button onClick={togglePlay} className="p-3 bg-white rounded-full shadow-2xl hover:scale-125 active:scale-90 transition-all">
          {isPlaying ? <Pause size={24} className="text-gray-900" /> : <Play size={24} className="text-gray-900 fill-gray-900" />}
        </button>
        <button onClick={reset} className="p-3 bg-white rounded-full shadow-2xl hover:scale-125 active:scale-90 transition-all">
          <RotateCcw size={24} className="text-gray-900" />
        </button>
      </div>
    </div>
  );
}
