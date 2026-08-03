import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

export function BackgroundImage() {
  const { backgroundImage, setBackgroundImage } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBackgroundImage(result);
    };
    reader.readAsDataURL(file);
  }, [setBackgroundImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white/90">Background Image</h1>
        <p className="text-sm text-white/40">Import an image to use as the app background</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {/* Drop zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors
          ${dragOver
            ? 'border-accent-500 bg-accent-500/10'
            : backgroundImage
              ? 'border-white/10 bg-white/[0.02] hover:border-white/20'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20'
          }
        `}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <AnimatePresence mode="wait">
          {backgroundImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/20">
                <img
                  src={backgroundImage}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/70">Current Background</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <Upload className="w-8 h-8 text-white/30" />
              </div>
              <div className="text-center">
                <p className="text-white/60 font-medium">Drop an image here</p>
                <p className="text-sm text-white/30 mt-1">or click to browse</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      {backgroundImage && (
        <div className="flex gap-3">
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Replace
          </motion.button>
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400/80 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBackgroundImage(null)}
          >
            <Trash2 className="w-4 h-4" />
            Remove Background
          </motion.button>
        </div>
      )}
    </div>
  );
}
