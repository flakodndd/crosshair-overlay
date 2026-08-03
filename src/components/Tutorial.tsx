import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Grid3x3,
  Paintbrush,
  Eye,
  Bookmark,
  Gamepad2,
  Keyboard,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

interface Step {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  preview?: React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    icon: PartyPopper,
    title: 'Welcome to CrosshairOverlay!',
    description:
      'A professional crosshair overlay for PC gaming. Customize and display crosshairs over any game without modifying game files.',
    color: 'from-accent-500/20 to-purple-500/20',
  },
  {
    id: 'library',
    icon: Grid3x3,
    title: 'Choose from 150+ Crosshairs',
    description:
      'Browse our extensive library of professionally designed crosshairs. Filter by category, style, or search for the perfect one.',
    color: 'from-blue-500/20 to-cyan-500/20',
    preview: (
      <div className="grid grid-cols-4 gap-2 mt-4">
        {['+', '•', '○', '⌖', '✦', '◇', '⟐', '⬡'].map((ch, i) => (
          <div
            key={i}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center
              justify-center text-white/60 text-lg"
          >
            {ch}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'customize',
    icon: Paintbrush,
    title: 'Create Your Perfect Crosshair',
    description:
      'Use the creator to design custom crosshairs. Adjust colors, sizes, shapes, and effects to match your preferences.',
    color: 'from-pink-500/20 to-orange-500/20',
    preview: (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-accent-500 rounded-full" />
          </div>
          <span className="text-xs text-white/40">Size</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-pink-500 rounded-full" />
          </div>
          <span className="text-xs text-white/40">Thickness</span>
        </div>
        <div className="flex gap-1.5">
          {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'].map((c) => (
            <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'overlay',
    icon: Eye,
    title: 'Always-Visible Overlay',
    description:
      'The crosshair overlay stays on top of your games. It is lightweight and does not interfere with gameplay.',
    color: 'from-green-500/20 to-emerald-500/20',
    preview: (
      <div className="mt-4 relative">
        <div className="w-full h-24 bg-[#1a1a2e] rounded-lg border border-white/10 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-green-400 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            </div>
          </div>
          <span className="text-xs text-white/30">Game window</span>
        </div>
      </div>
    ),
  },
  {
    id: 'presets',
    icon: Bookmark,
    title: 'Save and Switch Presets',
    description:
      'Save your favorite crosshair configurations as presets. Switch between them instantly with a single click or hotkey.',
    color: 'from-yellow-500/20 to-amber-500/20',
    preview: (
      <div className="mt-4 space-y-2">
        {['FPS Pro', 'Sniper Elite', 'Battle Royale'].map((name, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border
              ${i === 0
                ? 'bg-accent-500/10 border-accent-500/30'
                : 'bg-white/[0.02] border-white/5'
              }`}
          >
            <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-xs text-white/40">
              +
            </div>
            <span className="text-xs text-white/70">{name}</span>
            {i === 0 && <Check className="w-3.5 h-3.5 text-accent-400 ml-auto" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'profiles',
    icon: Gamepad2,
    title: 'Game-Specific Profiles',
    description:
      'Create profiles for different games. Each profile can have its own crosshair, size, and position settings.',
    color: 'from-purple-500/20 to-violet-500/20',
    preview: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {['Valorant', 'CS2', 'Apex'].map((game, i) => (
          <div
            key={i}
            className={`text-center p-2 rounded-lg border
              ${i === 0
                ? 'bg-purple-500/10 border-purple-500/30'
                : 'bg-white/[0.02] border-white/5'
              }`}
          >
            <div className="text-lg mb-1">🎮</div>
            <span className="text-[10px] text-white/50">{game}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'hotkeys',
    icon: Keyboard,
    title: 'Quick Shortcuts',
    description:
      'Use keyboard shortcuts to toggle the overlay, switch presets, and more. Fully customizable in settings.',
    color: 'from-cyan-500/20 to-teal-500/20',
    preview: (
      <div className="mt-4 space-y-2">
        {[
          { key: 'Ctrl+Shift+X', action: 'Toggle overlay' },
          { key: 'Ctrl+Shift+C', action: 'Cycle crosshairs' },
          { key: 'Ctrl+Shift+H', action: 'Toggle visibility' },
        ].map((hk, i) => (
          <div key={i} className="flex items-center justify-between">
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/60">
              {hk.key}
            </kbd>
            <span className="text-[10px] text-white/40">{hk.action}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'ready',
    icon: PartyPopper,
    title: "You're All Set!",
    description:
      'Start customizing your crosshair experience. You can always access this tutorial again from the Help menu.',
    color: 'from-accent-500/20 to-pink-500/20',
  },
];

export function Tutorial() {
  const { showTutorial, setShowTutorial } = useUIStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [direction, setDirection] = useState(1);

  const step = STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  const goNext = useCallback(() => {
    if (isLastStep) {
      handleClose();
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep]);

  const goBack = useCallback(() => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleClose = useCallback(() => {
    setShowTutorial(false);
    setCurrentStep(0);
  }, [setShowTutorial]);

  if (!showTutorial) return null;

  const Icon = step.icon;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-lg mx-4 bg-[#12121a] border border-white/10 rounded-2xl
          shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Close button */}
        <motion.button
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white/30 hover:text-white/60
            hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Step content */}
        <div className="p-8 pb-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {/* Icon */}
              <div
                className={`
                  w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color}
                  flex items-center justify-center
                `}
              >
                <Icon className="w-8 h-8 text-white/80" />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white/90 text-center mb-3">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-white/50 text-center leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>

              {/* Preview */}
              {step.preview && (
                <div className="mt-4 flex justify-center">
                  {step.preview}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className={`
                h-1.5 rounded-full transition-colors duration-200
                ${i === currentStep ? 'bg-accent-500 w-6' : 'bg-white/10 w-1.5'}
              `}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          ))}
        </div>

        {/* Don't show again checkbox */}
        {isLastStep && (
          <div className="px-8 pb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                className={`
                  w-4 h-4 rounded border transition-colors flex items-center justify-center
                  ${dontShowAgain
                    ? 'bg-accent-500 border-accent-500'
                    : 'border-white/20 group-hover:border-white/30'
                  }
                `}
                onClick={() => setDontShowAgain(!dontShowAgain)}
              >
                {dontShowAgain && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-white/40">Don't show this tutorial again</span>
            </label>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-8 pb-6 pt-2">
          <motion.button
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${isFirstStep
                ? 'text-white/20 cursor-not-allowed'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }
            `}
            whileHover={!isFirstStep ? { x: -2 } : undefined}
            whileTap={!isFirstStep ? { scale: 0.98 } : undefined}
            onClick={goBack}
            disabled={isFirstStep}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          <motion.button
            className="flex items-center gap-1.5 px-6 py-2.5 bg-accent-500 text-white rounded-lg
              text-sm font-medium hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/25"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={goNext}
          >
            {isLastStep ? (
              <>
                Get Started
                <PartyPopper className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* Skip button */}
        {!isLastStep && (
          <div className="absolute top-4 left-4">
            <motion.button
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
            >
              Skip tutorial
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
