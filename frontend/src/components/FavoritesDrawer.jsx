import React from 'react';
import { X, Trash2, Heart, Play, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  games,
  onPlayGame,
  onRemoveFavorite,
  onClearAll
}) {
  if (!isOpen) return null;

  const favoriteGames = games.filter(g => favorites.includes(g.id));

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="sky-favorites-drawer">
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Heart size={20} fill="#f52d3a" color="#f52d3a" />
            <h3>YOUR SAVED GAMES ({favoriteGames.length})</h3>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {favoriteGames.length > 0 ? (
          <>
            <div className="drawer-list">
              {favoriteGames.map((game) => (
                <div key={game.id} className="drawer-item">
                  <img src={game.thumbnail} alt={game.title} className="drawer-item-thumb" />
                  <div className="drawer-item-info">
                    <h4>{game.title}</h4>
                    <span className="drawer-item-cat">{game.category.toUpperCase()} • ★ {game.rating}</span>
                  </div>
                  <div className="drawer-item-actions">
                    <button
                      className="drawer-play-btn"
                      onClick={() => {
                        sounds.playClick();
                        onPlayGame(game);
                        onClose();
                      }}
                      title="Play Now"
                    >
                      <Play size={15} fill="#ffffff" />
                    </button>
                    <button
                      className="drawer-remove-btn"
                      onClick={() => {
                        sounds.playClick();
                        onRemoveFavorite(game.id);
                      }}
                      title="Remove from favorites"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-footer">
              <button
                className="drawer-clear-btn"
                onClick={() => {
                  sounds.playClick();
                  onClearAll();
                }}
              >
                <Trash2 size={14} /> Clear All Favorites
              </button>
            </div>
          </>
        ) : (
          <div className="drawer-empty-state">
            <div className="empty-heart-circle">
              <Heart size={36} color="#8892b0" />
            </div>
            <h4>No saved games yet</h4>
            <p>Click the heart icon on any game card to bookmark your top favorites here for instant access!</p>
          </div>
        )}
      </div>
    </>
  );
}
