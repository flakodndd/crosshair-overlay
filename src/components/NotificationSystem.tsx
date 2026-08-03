import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

const ICON_MAP = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const COLOR_MAP = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    bar: 'bg-blue-400',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-400',
    bar: 'bg-green-400',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: 'text-yellow-400',
    bar: 'bg-yellow-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    bar: 'bg-red-400',
  },
};

const AUTO_DISMISS_MS = 5000;
const MAX_VISIBLE = 5;

function NotificationItem({
  id,
  type,
  title,
  message,
  onDismiss,
}: {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onDismiss: (id: string) => void;
}) {
  const Icon = ICON_MAP[type];
  const colors = COLOR_MAP[type];
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, -50, 0], [0, 0.5, 1]);
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x < -100) {
        onDismiss(id);
      }
    },
    [id, onDismiss]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      className={`
        relative w-80 ${colors.bg} border ${colors.border} rounded-xl p-4
        shadow-lg backdrop-blur-sm cursor-grab active:cursor-grabbing overflow-hidden
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white/90">{title}</h4>
          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{message}</p>
        </div>
        <motion.button
          className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(id);
          }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${colors.bar} opacity-40`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function NotificationSystem() {
  const { notifications, removeNotification } = useUIStore();
  const visibleNotifications = notifications.slice(0, MAX_VISIBLE);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notif) => (
          <div key={notif.id} className="pointer-events-auto">
            <NotificationItem
              id={notif.id}
              type={notif.type}
              title={notif.title}
              message={notif.message}
              onDismiss={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
