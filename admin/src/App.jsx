import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import AdminLogin from './components/AdminLogin';
import Toast from './components/Toast';

// Code-split all admin views on demand
const DashboardView = lazy(() => import('./views/DashboardView'));
const GamesManagementView = lazy(() => import('./views/GamesManagementView'));
const UsersView = lazy(() => import('./views/UsersView'));
const CategoriesView = lazy(() => import('./views/CategoriesView'));
const BannerView = lazy(() => import('./views/BannerView'));
const SubmissionsView = lazy(() => import('./views/SubmissionsView'));
const MessagesView = lazy(() => import('./views/MessagesView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const GameModal = lazy(() => import('./components/GameModal'));

import {
  DEFAULT_GAMES,
  DEFAULT_CATEGORIES,
  DEFAULT_SUBMISSIONS,
  DEFAULT_MESSAGES,
  DEFAULT_BANNER,
  DEFAULT_SETTINGS,
  DEFAULT_USERS
} from './data/defaultData';

import { socket } from './utils/socket';

const API_BASE = 'http://localhost:5000/api';

const VALID_TABS = ['dashboard', 'games', 'users', 'categories', 'banner', 'submissions', 'messages', 'settings'];

function getInitialAdminUser() {
  try {
    const isSessionActive = sessionStorage.getItem('sky_admin_logged_in') === 'true';
    if (!isSessionActive) return null;
    const saved = localStorage.getItem('sky_admin_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.role === 'admin' || parsed.role === 'moderator' || parsed.username)) {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

function getInitialTab() {
  try {
    const hash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (VALID_TABS.includes(hash)) return hash;

    const saved = localStorage.getItem('sky_admin_tab');
    if (saved && VALID_TABS.includes(saved)) return saved;
  } catch (e) {}
  return 'dashboard';
}

export default function App() {
  const [adminUser, setAdminUser] = useState(getInitialAdminUser);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [dbStatus, setDbStatus] = useState({ connected: false, checked: false });

  // State
  const [onlineCount, setOnlineCount] = useState(0);
  const [games, setGames] = useState(DEFAULT_GAMES);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [submissions, setSubmissions] = useState(DEFAULT_SUBMISSIONS);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Real-time live online visitor tracking
  useEffect(() => {
    fetch(`${API_BASE}/stats/online`)
      .then(res => res.json())
      .then(data => {
        if (typeof data?.count === 'number') setOnlineCount(data.count);
      })
      .catch(() => {});

    const handleCount = (data) => {
      if (typeof data?.count === 'number') setOnlineCount(data.count);
    };

    socket.on('online:count', handleCount);
    if (socket.connected) {
      socket.emit('request:online:count');
    }

    return () => {
      socket.off('online:count', handleCount);
    };
  }, []);

  // Sync activeTab with URL hash and localStorage
  useEffect(() => {
    try {
      window.location.hash = activeTab;
      localStorage.setItem('sky_admin_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);

  // Listen for browser back / forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Modal State
  const [editingGame, setEditingGame] = useState(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all data from MongoDB Backend
  const fetchAllData = useCallback(async () => {
    try {
      const [gamesRes, usersRes, bannerRes, catRes, subRes, msgRes, setRes] = await Promise.all([
        fetch(`${API_BASE}/games`),
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/banner`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/submissions`),
        fetch(`${API_BASE}/messages`),
        fetch(`${API_BASE}/settings`)
      ]);

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        if (Array.isArray(gamesData)) setGames(gamesData);
        setDbStatus({ connected: true, checked: true });
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) setUsers(usersData);
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

      if (setRes && setRes.ok) {
        const setData = await setRes.json();
        if (setData) setSettings(setData);
      }
    } catch (err) {
      console.warn('Backend API connection pending or offline, using fallback:', err.message);
      setDbStatus({ connected: false, checked: true });
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    // Instant real-time Socket.io updates
    const handleGamePlay = (data) => {
      setGames(prev => prev.map(g => g.id === data.id ? { ...g, plays: data.plays } : g));
    };

    const handleNewSubmission = (sub) => {
      setSubmissions(prev => [sub, ...prev]);
      showToast(`🚀 New Game Submitted: "${sub.gameTitle}"`);
    };

    const handleNewMessage = (msg) => {
      setMessages(prev => [msg, ...prev]);
      showToast(`📩 New Inquiry from "${msg.name}"`);
    };

    const handleNewUser = (newUser) => {
      setUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id)]);
      showToast(`👤 New Player Registered: "${newUser.username || newUser.name}"`);
    };

    const handleUserUpdated = (updatedUser) => {
      if (!updatedUser) return;
      setUsers(prev => prev.map(u => (u.id === updatedUser.id || (u._id && u._id === updatedUser._id)) ? { ...u, ...updatedUser } : u));
    };

    const handleUserDeleted = (data) => {
      setUsers(prev => prev.filter(u => u.id !== data.id && u._id !== data.id));
    };

    socket.on('game:play:increment', handleGamePlay);
    socket.on('submission:new', handleNewSubmission);
    socket.on('message:new', handleNewMessage);
    socket.on('user:registered', handleNewUser);
    socket.on('user:updated', handleUserUpdated);
    socket.on('user:deleted', handleUserDeleted);

    return () => {
      socket.off('game:play:increment', handleGamePlay);
      socket.off('submission:new', handleNewSubmission);
      socket.off('message:new', handleNewMessage);
      socket.off('user:registered', handleNewUser);
      socket.off('user:updated', handleUserUpdated);
      socket.off('user:deleted', handleUserDeleted);
    };
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

  const handleMarkAllRead = async () => {
    try {
      const unreadList = messages.filter(m => !m.read);
      for (const m of unreadList) {
        try { await fetch(`${API_BASE}/messages/${m.id}/read`, { method: 'PATCH' }); } catch (e) {}
      }
      setMessages(messages.map(m => ({ ...m, read: true })));
      showToast('All messages marked as read.');
    } catch (err) {
      setMessages(messages.map(m => ({ ...m, read: true })));
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

  // User Management Handlers
  const handleAddUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      if (result.user) {
        setUsers(prev => [result.user, ...prev.filter(u => u.id !== result.user.id)]);
        showToast(`User "${result.user.username}" created successfully!`);
      }
      return result;
    } catch (err) {
      const localUser = {
        id: 'usr-' + Date.now().toString(36),
        ...userData,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.username}`,
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [localUser, ...prev]);
      showToast(`User "${userData.username}" created!`);
      return { user: localUser };
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.user) {
          setUsers(prev => prev.map(u => u.id === userId ? result.user : u));
        }
        showToast(`User profile updated!`);
      }
    } catch (err) {
      showToast(`User updated.`);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));
      await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
      showToast('User account deleted from system.', 'error');
    } catch (err) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted.');
    }
  };

  // Settings Handlers
  const handleSaveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const saved = await res.json();
        setSettings(saved);
        showToast('Platform settings saved to database & broadcasted!');
      } else {
        showToast('Settings saved locally.');
      }
    } catch (err) {
      showToast('Settings saved.');
    }
  };

  const handleExportData = () => {
    const exportBundle = {
      games,
      users,
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
        } catch (e) { }
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
      } catch (e) { }
    }
    showToast('Backup restored into MongoDB successfully!');
  };

  const handleResetData = async () => {
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
        showToast('Platform database reset to defaults in MongoDB!');
      } else {
        setGames(DEFAULT_GAMES);
        setUsers(DEFAULT_USERS);
        setCategories(DEFAULT_CATEGORIES);
        setSubmissions(DEFAULT_SUBMISSIONS);
        setMessages(DEFAULT_MESSAGES);
        setBanner(DEFAULT_BANNER);
        setSettings(DEFAULT_SETTINGS);
        showToast('Platform database reset to defaults!');
      }
    } catch (err) {
      setGames(DEFAULT_GAMES);
      setUsers(DEFAULT_USERS);
      setCategories(DEFAULT_CATEGORIES);
      setSubmissions(DEFAULT_SUBMISSIONS);
      setMessages(DEFAULT_MESSAGES);
      setBanner(DEFAULT_BANNER);
      setSettings(DEFAULT_SETTINGS);
      showToast('Platform reset.');
    }
  };

  const handleAdminLogin = (user) => {
    try {
      sessionStorage.setItem('sky_admin_logged_in', 'true');
    } catch (e) {}
    setAdminUser(user);
    showToast(`Welcome back, ${user.username || user.name || 'Admin'}!`);
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('sky_admin_logged_in');
      localStorage.removeItem('sky_admin_token');
      localStorage.removeItem('sky_admin_user');
    } catch (e) {}
    setAdminUser(null);
    showToast('Signed out of admin console.', 'info');
  };

  const unreadMessagesCount = messages.filter(m => !m.read).length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;

  if (!adminUser) {
    return (
      <>
        <AdminLogin onLoginSuccess={handleAdminLogin} />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      </>
    );
  }

  return (
    <div className="admin-app">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gamesCount={games.length}
        usersCount={users.length}
        submissionsCount={pendingSubmissionsCount}
        unreadMessagesCount={unreadMessagesCount}
        bannerActive={banner.active}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <AdminNavbar
          activeTab={activeTab}
          onOpenGameModal={handleOpenGameModal}
          onOpenUserModal={() => setIsUserModalOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          livePlayerCount={onlineCount}
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          dbStatus={dbStatus}
        />

        <main className="admin-content-area">
          <Suspense fallback={<div className="admin-loading-spinner" style={{ padding: '60px', textAlign: 'center', color: '#00f2fe' }}>Loading View...</div>}>
            {activeTab === 'dashboard' && (
              <DashboardView
                games={games}
                users={users}
                categories={categories}
                submissions={submissions}
                messages={messages}
                onlineCount={onlineCount}
                onNavigateTab={(tab) => setActiveTab(tab)}
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
                onRefresh={fetchAllData}
              />
            )}

            {activeTab === 'users' && (
              <UsersView
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onRefresh={fetchAllData}
                isModalOpen={isUserModalOpen}
                setIsModalOpen={setIsUserModalOpen}
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
                onMarkAllRead={handleMarkAllRead}
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
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
        <GameModal
          game={editingGame}
          isOpen={isGameModalOpen}
          onClose={() => setIsGameModalOpen(false)}
          onSave={handleSaveGame}
          categories={categories}
        />
      </Suspense>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
