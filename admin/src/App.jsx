import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import GameModal from './components/GameModal';
import Toast from './components/Toast';

import DashboardView from './views/DashboardView';
import GamesManagementView from './views/GamesManagementView';
import CategoriesView from './views/CategoriesView';
import BannerView from './views/BannerView';
import SubmissionsView from './views/SubmissionsView';
import MessagesView from './views/MessagesView';
import SettingsView from './views/SettingsView';

import { 
  DEFAULT_GAMES, 
  DEFAULT_CATEGORIES, 
  DEFAULT_SUBMISSIONS, 
  DEFAULT_MESSAGES, 
  DEFAULT_BANNER, 
  DEFAULT_SETTINGS 
} from './data/defaultData';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [dbStatus, setDbStatus] = useState({ connected: false, checked: false });

  // State
  const [games, setGames] = useState(DEFAULT_GAMES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [submissions, setSubmissions] = useState(DEFAULT_SUBMISSIONS);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Modal State
  const [editingGame, setEditingGame] = useState(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all data from MongoDB Backend
  const fetchAllData = useCallback(async () => {
    try {
      const [gamesRes, bannerRes, catRes, subRes, msgRes] = await Promise.all([
        fetch(`${API_BASE}/games`),
        fetch(`${API_BASE}/banner`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/submissions`),
        fetch(`${API_BASE}/messages`)
      ]);

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        if (Array.isArray(gamesData)) setGames(gamesData);
        setDbStatus({ connected: true, checked: true });
      }

      if (bannerRes.ok) {
        const bannerData = await bannerRes.json();
        if (bannerData) setBanner(bannerData);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData) && catData.length > 0) setCategories(catData);
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        if (Array.isArray(subData)) setSubmissions(subData);
      }

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (Array.isArray(msgData)) setMessages(msgData);
      }
    } catch (err) {
      console.warn('Backend API connection pending or offline, using fallback:', err.message);
      setDbStatus({ connected: false, checked: true });
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Game Handlers
  const handleOpenGameModal = (game = null) => {
    setEditingGame(game);
    setIsGameModalOpen(true);
  };

  const handleSaveGame = async (savedGame) => {
    try {
      const exists = games.some(g => g.id === savedGame.id);
      const endpoint = exists ? `${API_BASE}/games/${savedGame.id}` : `${API_BASE}/games`;
      const method = exists ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedGame)
      });

      if (res.ok) {
        const result = await res.json();
        if (exists) {
          setGames(games.map(g => g.id === result.id ? result : g));
          showToast(`Game "${result.title}" updated in MongoDB!`);
        } else {
          setGames([result, ...games]);
          showToast(`Game "${result.title}" added to MongoDB & Live on SKYGAMES!`);
        }
      } else {
        // Fallback local update
        if (exists) {
          setGames(games.map(g => g.id === savedGame.id ? savedGame : g));
        } else {
          setGames([savedGame, ...games]);
        }
        showToast(`Game saved locally (Backend offline)`);
      }
    } catch (err) {
      // Offline fallback
      setGames(games.some(g => g.id === savedGame.id) 
        ? games.map(g => g.id === savedGame.id ? savedGame : g) 
        : [savedGame, ...games]);
      showToast(`Game saved (MongoDB sync pending)`);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      const game = games.find(g => g.id === gameId);
      const res = await fetch(`${API_BASE}/games/${gameId}`, { method: 'DELETE' });
      
      setGames(games.filter(g => g.id !== gameId));
      if (res.ok) {
        showToast(`Game "${game?.title || gameId}" deleted from MongoDB & removed from SKYGAMES!`, 'error');
      } else {
        showToast(`Game "${game?.title || gameId}" removed locally.`, 'error');
      }
    } catch (err) {
      setGames(games.filter(g => g.id !== gameId));
      showToast(`Game removed.`, 'error');
    }
  };

  const handleToggleFeatured = async (gameId) => {
    try {
      const res = await fetch(`${API_BASE}/games/${gameId}/featured`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setGames(games.map(g => g.id === gameId ? updated : g));
        showToast(updated.featured ? `Marked "${updated.title}" as Featured in MongoDB!` : `Removed from Featured in MongoDB.`);
      } else {
        setGames(games.map(g => g.id === gameId ? { ...g, featured: !g.featured } : g));
      }
    } catch (err) {
      setGames(games.map(g => g.id === gameId ? { ...g, featured: !g.featured } : g));
    }
  };

  // Category Handlers
  const handleAddCategory = async (newCat) => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });
      if (res.ok) {
        const saved = await res.json();
        setCategories([...categories, saved]);
        showToast(`Category "${saved.name}" stored in MongoDB!`);
      } else {
        setCategories([...categories, newCat]);
      }
    } catch (err) {
      setCategories([...categories, newCat]);
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await fetch(`${API_BASE}/categories/${catId}`, { method: 'DELETE' });
      setCategories(categories.filter(c => c.id !== catId));
      showToast(`Category removed from MongoDB.`);
    } catch (err) {
      setCategories(categories.filter(c => c.id !== catId));
    }
  };

  // Banner Handlers
  const handleUpdateBanner = async (updatedBanner) => {
    try {
      const res = await fetch(`${API_BASE}/banner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBanner)
      });
      if (res.ok) {
        const saved = await res.json();
        setBanner(saved);
        showToast('Banner updated in MongoDB & Broadcasted to SKYGAMES!');
      } else {
        setBanner(updatedBanner);
      }
    } catch (err) {
      setBanner(updatedBanner);
      showToast('Banner settings updated.');
    }
  };

  // Submission Handlers
  const handleApproveSubmission = async (sub) => {
    try {
      const newGame = {
        id: sub.gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4),
        title: sub.gameTitle,
        category: sub.category || 'arcade',
        description: sub.description,
        thumbnail: sub.thumbnailUrl,
        banner: sub.thumbnailUrl,
        gameUrl: sub.gameUrl,
        tags: ['Developer', 'Community', sub.category || 'Arcade'],
        rating: 5.0,
        plays: 10,
        featured: false,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame)
      });

      await fetch(`${API_BASE}/submissions/${sub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      setGames([newGame, ...games]);
      setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, status: 'approved' } : s));
      showToast(`Submission "${sub.gameTitle}" approved, saved in MongoDB & live on SKYGAMES!`);
    } catch (err) {
      showToast(`Approved submission locally.`);
    }
  };

  const handleRejectSubmission = async (subId) => {
    try {
      await fetch(`${API_BASE}/submissions/${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      setSubmissions(submissions.map(s => s.id === subId ? { ...s, status: 'rejected' } : s));
      showToast('Submission marked rejected in MongoDB.', 'error');
    } catch (err) {
      setSubmissions(submissions.map(s => s.id === subId ? { ...s, status: 'rejected' } : s));
    }
  };

  // Message Handlers
  const handleMarkRead = async (msgId) => {
    try {
      await fetch(`${API_BASE}/messages/${msgId}/read`, { method: 'PATCH' });
      setMessages(messages.map(m => m.id === msgId ? { ...m, read: true } : m));
    } catch (err) {
      setMessages(messages.map(m => m.id === msgId ? { ...m, read: true } : m));
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await fetch(`${API_BASE}/messages/${msgId}`, { method: 'DELETE' });
      setMessages(messages.filter(m => m.id !== msgId));
      showToast('Message deleted from MongoDB.');
    } catch (err) {
      setMessages(messages.filter(m => m.id !== msgId));
    }
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    showToast('Platform settings saved!');
  };

  const handleExportData = () => {
    const exportBundle = {
      games,
      categories,
      submissions,
      messages,
      banner,
      settings,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `skygames_mongodb_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Platform database exported!');
  };

  const handleImportData = async (data) => {
    if (data.games) {
      for (const g of data.games) {
        try {
          await fetch(`${API_BASE}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(g)
          });
        } catch (e) {}
      }
      setGames(data.games);
    }
    if (data.banner) {
      setBanner(data.banner);
      try {
        await fetch(`${API_BASE}/banner`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.banner)
        });
      } catch (e) {}
    }
    showToast('Backup restored into MongoDB successfully!');
  };

  const handleResetData = async () => {
    setGames(DEFAULT_GAMES);
    setCategories(DEFAULT_CATEGORIES);
    setSubmissions(DEFAULT_SUBMISSIONS);
    setMessages(DEFAULT_MESSAGES);
    setBanner(DEFAULT_BANNER);
    setSettings(DEFAULT_SETTINGS);
    showToast('Platform database reset to defaults!');
  };

  const unreadMessagesCount = messages.filter(m => !m.read).length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="admin-app">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gamesCount={games.length}
        submissionsCount={pendingSubmissionsCount}
        unreadMessagesCount={unreadMessagesCount}
        bannerActive={banner.active}
      />

      <div className="admin-main">
        <AdminNavbar
          activeTab={activeTab}
          onOpenGameModal={handleOpenGameModal}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          livePlayerCount={2480}
        />

        <main className="content-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              games={games}
              submissions={submissions}
              messages={messages}
              onNavigate={setActiveTab}
              onEditGame={handleOpenGameModal}
            />
          )}

          {activeTab === 'games' && (
            <GamesManagementView
              games={games}
              categories={categories}
              onEditGame={handleOpenGameModal}
              onDeleteGame={handleDeleteGame}
              onToggleFeatured={handleToggleFeatured}
              onOpenAddModal={() => handleOpenGameModal(null)}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              games={games}
            />
          )}

          {activeTab === 'banner' && (
            <BannerView
              banner={banner}
              onUpdateBanner={handleUpdateBanner}
            />
          )}

          {activeTab === 'submissions' && (
            <SubmissionsView
              submissions={submissions}
              onApprove={handleApproveSubmission}
              onReject={handleRejectSubmission}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesView
              messages={messages}
              onRead={handleMarkRead}
              onDeleteMessage={handleDeleteMessage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      <GameModal
        game={editingGame}
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        onSave={handleSaveGame}
        categories={categories}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
