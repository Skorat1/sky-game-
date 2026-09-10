import React, { useRef } from 'react';
import {
  Gamepad2,
  Flame,
  Sparkles,
  Brain,
  Gauge,
  Crosshair,
  Trophy,
  Users,
  Coffee,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../data/games';
import { sounds } from '../utils/audio';

const ICON_MAP = {
  Gamepad2,
  Flame,
  Sparkles,
  Brain,
  Gauge,
  Crosshair,
  Trophy,
  Users,
  Coffee,
  Heart
};

export default function CategoryBar({
  activeCategory = 'all',
  onSelectCategory,
  gameCounts = {},
  categories = CATEGORIES
}) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    sounds.playClick();
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="category-bar-wrapper">
      <button 
        className="cat-scroll-arrow left-arrow" 
        onClick={() => handleScroll('left')}
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="category-scroll-container" ref={scrollRef}>
        {categories.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || Gamepad2;
          const isActive = activeCategory === cat.id;
          const count = gameCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              className={`category-pill-btn ${isActive ? 'active' : ''}`}
              style={{
                '--pill-color': cat.color || '#00f2fe'
              }}
              onClick={() => {
                sounds.playClick();
                onSelectCategory(cat.id);
              }}
            >
              <span className="pill-icon-box">
                <IconComp size={16} />
              </span>
              <span className="pill-title">{cat.name}</span>
              {count > 0 && <span className="pill-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <button 
        className="cat-scroll-arrow right-arrow" 
        onClick={() => handleScroll('right')}
        aria-label="Scroll categories right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

