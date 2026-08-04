import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Star, X, Heart, Sparkles } from 'lucide-react';
import type { CrosshairConfig } from '../types';
import { CrosshairCard } from './CrosshairCard';
import { useCrosshairStore } from '../stores/crosshairStore';
import { BUILTIN_CROSSHAIRS } from '../data/crosshairs';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'dot', label: 'Dot' },
  { id: 'classic', label: 'Classic' },
  { id: 'tactical', label: 'Tactical' },
  { id: 'circle', label: 'Circle' },
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'tshape', label: 'T-Shape' },
  { id: 'sniper', label: 'Sniper' },
  { id: 'hollow', label: 'Hollow' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'esports', label: 'Esports' },
  { id: 'fps', label: 'FPS' },
  { id: 'retro', label: 'Retro' },
  { id: 'custom', label: 'Custom' },
];

export function CrosshairLibrary({ onSelect }: { onSelect?: (c: CrosshairConfig) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const activeCrosshair = useCrosshairStore((s) => s.activeCrosshair);
  const favorites = useCrosshairStore((s) => s.favorites);
  const recentCrosshairs = useCrosshairStore((s) => s.recentCrosshairs);
  const setActiveCrosshair = useCrosshairStore((s) => s.setActiveCrosshair);
  const toggleFavorite = useCrosshairStore((s) => s.toggleFavorite);
  const addToRecent = useCrosshairStore((s) => s.addToRecent);
  const customCrosshairs = useCrosshairStore((s) => s.customCrosshairs);

  const allCrosshairs = useMemo(
    () => [...BUILTIN_CROSSHAIRS, ...customCrosshairs],
    [customCrosshairs]
  );

  const selectedId = activeCrosshair?.id;

  const filteredCrosshairs = useMemo(() => {
    return allCrosshairs.filter((ch) => {
      const matchesSearch =
        !searchQuery ||
        ch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.color?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || ch.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allCrosshairs, searchQuery, activeCategory]);

  const recentItems = useMemo(() => {
    return recentCrosshairs
      .map((id) => allCrosshairs.find((ch) => ch.id === id))
      .filter(Boolean)
      .slice(0, 8) as CrosshairConfig[];
  }, [recentCrosshairs, allCrosshairs]);

  const favoriteItems = useMemo(() => {
    return allCrosshairs.filter((ch) => favorites.includes(ch.id));
  }, [allCrosshairs, favorites]);

  const recommendedItems = useMemo(() => {
    return allCrosshairs
      .filter((ch) => ch.category === 'classic' || ch.category === 'minimal')
      .slice(0, 8);
  }, [allCrosshairs]);

  const handleSelect = (crosshair: CrosshairConfig) => {
    setActiveCrosshair(crosshair);
    addToRecent(crosshair.id);
    onSelect?.(crosshair);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white/90 tracking-tight">Crosshair Library</h1>
            <p className="text-[11px] text-white/30 mt-0.5">{allCrosshairs.length} crosshairs available</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/30"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{favorites.length} favorites</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search crosshairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-[13px] text-white/90 placeholder-white/25 focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <motion.button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-6 px-6">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-accent-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'text-white/35 hover:text-white/55 hover:bg-white/[0.04]'
              }`}
              style={activeCategory !== cat.id ? {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
              } : undefined}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeCategory === 'all' && searchQuery === '' ? (
          <div className="space-y-7">
            {recentItems.length > 0 && (
              <Section
                title="Recently Used"
                icon={<Clock className="w-3.5 h-3.5" />}
                items={recentItems}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            )}

            {favoriteItems.length > 0 && (
              <Section
                title="Favorites"
                icon={<Heart className="w-3.5 h-3.5 text-pink-500" />}
                items={favoriteItems}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            )}

            {recommendedItems.length > 0 && (
              <Section
                title="Recommended"
                icon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                items={recommendedItems}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            )}

            <div>
              <h2 className="text-base font-bold text-white/70 mb-3">All Crosshairs</h2>
              <CrosshairGrid
                crosshairs={allCrosshairs}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            </div>
          </div>
        ) : (
          <div>
            {filteredCrosshairs.length > 0 ? (
              <CrosshairGrid
                crosshairs={filteredCrosshairs}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            ) : (
              <EmptyState query={searchQuery} category={activeCategory} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  selectedId,
  onSelect,
  onFavorite,
}: {
  title: string;
  icon: React.ReactNode;
  items: CrosshairConfig[];
  selectedId?: string;
  onSelect: (crosshair: CrosshairConfig) => void;
  onFavorite: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/40">{icon}</span>
        <h2 className="text-base font-bold text-white/70">{title}</h2>
        <span className="text-[10px] text-white/20 font-medium bg-white/[0.04] px-1.5 py-0.5 rounded">{items.length}</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {items.map((crosshair, index) => (
          <motion.div
            key={crosshair.id}
            className="flex-shrink-0 w-[170px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
          >
            <CrosshairCard
              crosshair={crosshair}
              selected={selectedId === crosshair.id}
              onSelect={onSelect}
              onFavorite={onFavorite}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CrosshairGrid({
  crosshairs,
  selectedId,
  onSelect,
  onFavorite,
}: {
  crosshairs: CrosshairConfig[];
  selectedId?: string;
  onSelect: (crosshair: CrosshairConfig) => void;
  onFavorite: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {crosshairs.map((crosshair, index) => (
        <motion.div
          key={crosshair.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.02, 0.5), duration: 0.3 }}
        >
          <CrosshairCard
            crosshair={crosshair}
            selected={selectedId === crosshair.id}
            onSelect={onSelect}
            onFavorite={onFavorite}
          />
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState({ query, category }: { query: string; category: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Search className="w-6 h-6 text-white/15" />
      </div>
      <h3 className="text-sm font-semibold text-white/50 mb-1">No crosshairs found</h3>
      <p className="text-[11px] text-white/25 max-w-xs">
        {query
          ? `No results for "${query}"${category !== 'all' ? ` in ${category}` : ''}`
          : `No crosshairs in the ${category} category yet`}
      </p>
    </motion.div>
  );
}
