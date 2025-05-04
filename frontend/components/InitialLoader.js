"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const InitialLoader = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 100));
    }, 150);

    const timeout = setTimeout(() => setIsLoading(false), 2500);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
    >
      {/* Main Water Drop */}
      <motion.div
        initial={{ y: -100, scale: 0.8 }}
        animate={{
          y: "50vh",
          scale: [0.8, 1.2, 1],
          rotate: [0, 15, -15, 0]
        }}
        transition={{
          duration: 1.2,
          ease: [0.17, 0.67, 0.83, 0.67],
          times: [0, 0.8, 0.9, 1]
        }}
        className="absolute"
      >
        <svg
          width="60"
          height="80"
          viewBox="0 0 60 80"
          className="text-cyan-400 drop-shadow-xl"
        >
          <path
            d="M30 3.5c-20 0-30 26-30 50 0 15 12.5 26.5 30 26.5s30-11.5 30-26.5c0-24-10-50-30-50z"
            fill="currentColor"
          />
        </svg>
      </motion.div>

      {/* Splash Ripples */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ 
          delay: 1,
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1.2
        }}
        className="absolute bottom-1/3 w-16 h-16 border-2 border-cyan-400 rounded-full"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%"
            }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0, Math.random() * 0.8 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 1,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
          />
        ))}
      </div>

      {/* Progress Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-1/4 text-center"
      >
        <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          {Math.round(progress)}%
        </div>
        <div className="text-sm text-cyan-300 font-mono animate-pulse">
          Initializing Core Systems
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2.5 }}
        className="absolute  mx-auto h-1 bg-gray-800 max-w-xs rounded-full overflow-hidden"
      >
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </motion.div>
    </motion.div>
  );
};

export default InitialLoader;