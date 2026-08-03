import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Star, X, Heart } from 'lucide-react';
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

  const trendingItems = useMemo(() => {
    return allCrosshairs.filter((ch) => favorites.includes(ch.id)).slice(0, 8);
  }, [allCrosshairs, favorites]);

  const recommendedItems = useMemo(() => {
    return allCrosshairs
      .filter((ch) => ch.category === 'classic' || ch.category === 'minimal')
      .slice(0, 8);
  }, [allCrosshairs]);

  const favoriteItems = useMemo(() => {
    return allCrosshairs.filter((ch) => favorites.includes(ch.id));
  }, [allCrosshairs, favorites]);

  const handleSelect = (crosshair: CrosshairConfig) => {
    setActiveCrosshair(crosshair);
    addToRecent(crosshair.id);
    onSelect?.(crosshair);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h1 className="text-2xl font-bold text-white/90 mb-4">Crosshair Library</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search crosshairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <motion.button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeCategory === 'all' && searchQuery === '' ? (
          <div className="space-y-8">
            {recentItems.length > 0 && (
              <Section
                title="Recently Used"
                icon={<Clock className="w-4 h-4" />}
                items={recentItems}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            )}

            {trendingItems.length > 0 && (
              <Section
                title="Favorites"
                icon={<Heart className="w-4 h-4 text-pink-500" />}
                items={trendingItems}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            )}

            {recommendedItems.length > 0 && (
              <Section
                title="Recommended"
                icon={<Star className="w-4 h-4" />}
                items={recommendedItems}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            )}

            {favoriteItems.length > 0 && (
              <Section
                title="Favorites"
                icon={<Star className="w-4 h-4 text-red-500" />}
                items={favoriteItems}
                selectedId={selectedId}
                onSelect={handleSelect}
                onFavorite={toggleFavorite}
              />
            )}

            <div>
              <h2 className="text-lg font-semibold text-white/80 mb-4">All Crosshairs</h2>
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
        {icon}
        <h2 className="text-lg font-semibold text-white/80">{title}</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((crosshair, index) => (
          <motion.div
            key={crosshair.id}
            className="flex-shrink-0 w-[180px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {crosshairs.map((crosshair) => (
        <CrosshairCard
          key={crosshair.id}
          crosshair={crosshair}
          selected={selectedId === crosshair.id}
          onSelect={onSelect}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
}

function EmptyState({ query, category }: { query: string; category: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="text-lg font-medium text-white/60 mb-2">No crosshairs found</h3>
      <p className="text-sm text-white/30 max-w-sm">
        {query
          ? `No results for "${query}"${category !== 'all' ? ` in ${category}` : ''}`
          : `No crosshairs in the ${category} category yet`}
      </p>
    </motion.div>
  );
}
