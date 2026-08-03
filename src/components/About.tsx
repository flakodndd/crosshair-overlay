import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Globe,
  MessageCircle,
  Twitter,
  Heart,
  Shield,
  ChevronDown,
  ExternalLink,
  Cpu,
  Monitor,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Overlay Only',
    description: 'Never modifies game files or memory',
  },
  {
    icon: '🛡️',
    title: 'No Game Modification',
    description: 'Works as a separate overlay layer',
  },
  {
    icon: '⚡',
    title: 'Lightweight',
    description: 'Minimal CPU and memory usage',
  },
  {
    icon: '🌐',
    title: 'Open Source',
    description: 'Community-driven development',
  },
];

const LINKS = [
  { icon: Github, label: 'GitHub', url: 'https://github.com', color: 'text-white/70' },
  { icon: Globe, label: 'Website', url: 'https://crosshairoverlay.com', color: 'text-accent-400' },
  { icon: MessageCircle, label: 'Discord', url: 'https://discord.gg', color: 'text-indigo-400' },
  { icon: Twitter, label: 'Twitter', url: 'https://twitter.com', color: 'text-sky-400' },
];

const CHANGELOG = [
  {
    version: '1.0.0',
    date: '2026-01-15',
    changes: [
      'Initial release',
      '150+ crosshair designs',
      'Custom crosshair creator',
      'Preset management system',
      'Game-specific profiles',
      'Multi-monitor support',
      'Hardware-accelerated overlay',
    ],
  },
  {
    version: '0.9.0',
    date: '2025-12-20',
    changes: [
      'Beta release',
      'Overlay system',
      'Crosshair library',
      'Basic customization',
    ],
  },
  {
    version: '0.8.0',
    date: '2025-11-15',
    changes: [
      'Alpha release',
      'Core crosshair rendering',
      'Settings management',
    ],
  },
];

const CREDITS = [
  { name: 'CrosshairOverlay Team', role: 'Development' },
  { name: 'Community Contributors', role: 'Crosshair Designs' },
  { name: 'Open Source Libraries', role: 'Built with React, Electron, Framer Motion' },
];

export function About() {
  const [expandedChangelog, setExpandedChangelog] = useState<string | null>(null);
  const [copiedSystemInfo, setCopiedSystemInfo] = useState(false);

  const systemInfo = {
    version: '1.0.0',
    platform: 'Windows 11',
    electron: '33.3.1',
    chrome: '130.0.6723.117',
    node: '20.18.1',
  };

  const handleCopySystemInfo = () => {
    const text = Object.entries(systemInfo)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSystemInfo(true);
    setTimeout(() => setCopiedSystemInfo(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {/* Logo and Name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-accent-500/10 border border-accent-500/20
              flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg
              viewBox="0 0 64 64"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-accent-400"
            >
              <circle cx="32" cy="32" r="8" />
              <line x1="32" y1="4" x2="32" y2="20" />
              <line x1="32" y1="44" x2="32" y2="60" />
              <line x1="4" y1="32" x2="20" y2="32" />
              <line x1="44" y1="32" x2="60" y2="32" />
              <circle cx="32" cy="32" r="20" strokeDasharray="4 4" />
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold text-white/90 mb-2">CrosshairOverlay</h1>
          <p className="text-sm text-white/40 font-mono mb-3">Version 1.0.0</p>
          <p className="text-white/60 max-w-md mx-auto">
            Professional crosshair overlay for PC gaming. Customize and display
            crosshairs over any game without modifying game files.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 text-center">
            Features
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center
                  hover:bg-white/[0.04] transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="text-sm font-medium text-white/80 mb-1">{feature.title}</h3>
                <p className="text-xs text-white/40">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 text-center">
            Links
          </h2>
          <div className="flex justify-center gap-3">
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/5
                    rounded-xl text-sm hover:bg-white/[0.06] transition-colors ${link.color}
                  `}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  <ExternalLink className="w-3 h-3 opacity-40" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 text-center">
            Credits
          </h2>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl divide-y divide-white/5">
            {CREDITS.map((credit) => (
              <div key={credit.name} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-white/70">{credit.name}</span>
                <span className="text-xs text-white/40">{credit.role}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* License */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 text-center">
            License
          </h2>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-white/80">MIT License</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files, to deal in the Software
              without restriction, including without limitation the rights to use, copy, modify,
              merge, publish, distribute, sublicense, and/or sell copies of the Software.
            </p>
          </div>
        </motion.div>

        {/* Changelog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 text-center">
            Changelog
          </h2>
          <div className="space-y-2">
            {CHANGELOG.map((release) => (
              <div
                key={release.version}
                className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                  onClick={() =>
                    setExpandedChangelog(
                      expandedChangelog === release.version ? null : release.version
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium text-white/80">
                      v{release.version}
                    </span>
                    <span className="text-xs text-white/30">{release.date}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedChangelog === release.version ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedChangelog === release.version && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 border-t border-white/5">
                        <ul className="mt-3 space-y-1.5">
                          {release.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                              <span className="text-accent-400 mt-0.5">•</span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 text-center">
            System Info
          </h2>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/60">System Information</span>
              </div>
              <motion.button
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/40
                  hover:text-white/60 transition-colors rounded"
                whileTap={{ scale: 0.95 }}
                onClick={handleCopySystemInfo}
              >
                {copiedSystemInfo ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(systemInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-white/40 capitalize">{key}</span>
                  <span className="text-white/60 font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex items-center justify-center gap-1.5 text-sm text-white/30">
            Made with
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            for gamers
          </div>
        </motion.div>
      </div>
    </div>
  );
}
