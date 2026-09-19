import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Music,
  Scissors,
  Minimize2,
  Grid,
  Pipette,
  Crop,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import filevaLogo from '../../assets/fileva.png';

interface SplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

const TOOL_HIGHLIGHTS = [
  { icon: Film, label: 'Video Compression' },
  { icon: Music, label: 'Audio Transcoding' },
  { icon: Scissors, label: 'AI Cutout' },
  { icon: Minimize2, label: 'Image Optimizer' },
  { icon: Grid, label: 'App Icons' },
  { icon: Pipette, label: 'Color Picker' },
  { icon: Crop, label: 'Pixel Cropper' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 1700,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing client-side engine...');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusMessage('Initializing local media modules...');
      } else if (pct < 75) {
        setStatusMessage('Loading WebAssembly video & audio codecs...');
      } else if (pct < 100) {
        setStatusMessage('Preparing local browser sandbox...');
      } else {
        setStatusMessage('Environment ready.');
        clearInterval(interval);
        const timeout = setTimeout(() => {
          setIsDone(true);
          onComplete?.();
        }, 220);
        return () => clearTimeout(timeout);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsDone(true);
    onComplete?.();
  };

  if (isDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="app-splash-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-background text-text-main p-6 select-none overflow-hidden"
      >

        {/* Center Hero Branding */}
        <div className="w-full max-w-lg flex flex-col items-center text-center space-y-6 my-auto">
          {/* Animated Monogram Logo */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <img
              src={filevaLogo}
              alt="Fileva logo"
              className="w-20 h-20 rounded-2xl object-contain bg-white"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute -inset-1.5 rounded-2xl border border-dashed border-primary/40 pointer-events-none"
            />
          </motion.div>

          {/* Titles */}
          <div className="space-y-2">
            <motion.h1
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main"
            >
              Fileva
            </motion.h1>
            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.35 }}
              className="text-xs sm:text-sm text-text-muted max-w-md mx-auto"
            >
              High-performance browser-local suite for video, audio, image compression, AI cutout, and icon generation.
            </motion.p>
          </div>

          {/* Progress Bar & Status */}
          <div className="w-full max-w-sm space-y-2 pt-2">
            <div className="w-full bg-border/60 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-md"
          >
            {TOOL_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full bg-surface border border-border text-text-muted"
                >
                  <Icon className="w-3 h-3 text-primary" />
                  <span>{item.label}</span>
                </span>
              );
            })}
          </motion.div>
        </div>


      </motion.div>
    </AnimatePresence>
  );
};
