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
import { CONFIG } from './config';
import {
  gamesApi,
  usersApi,
  categoriesApi,
  bannerApi,
  submissionsApi,
  messagesApi,
  settingsApi,
  statsApi
} from './services/api';

const { VALID_TABS, STORAGE_KEYS } = CONFIG;

function getInitialAdminUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || sessionStorage.getItem(STORAGE_KEYS.ADMIN_USER);
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

    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_TAB);
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

  // Core Data States
  const [onlineCount, setOnlineCount] = useState(0);
  const [games, setGames] = useState(DEFAULT_GAMES);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [submissions, setSubmissions] = useState(DEFAULT_SUBMISSIONS);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Modal States
  const [editingGame, setEditingGame] = useState(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Sync activeTab with URL hash and localStorage
  useEffect(() => {
    try {
      window.location.hash = activeTab;
      localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, activeTab);
    } catch (e) {}
  }, [activeTab]);

  // Listen for browser back / forward navigation
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

  // Fetch all platform data from backend
  const fetchAllData = useCallback(async () => {
    try {
      const [gamesData, usersData, bannerData, catData, subData, msgData, setData] = await Promise.all([
        gamesApi.getAll().catch(() => null),
        usersApi.getAll().catch(() => null),
        bannerApi.get().catch(() => null),
        categoriesApi.getAll().catch(() => null),
        submissionsApi.getAll().catch(() => null),
        messagesApi.getAll().catch(() => null),
        settingsApi.get().catch(() => null)
      ]);

      if (Array.isArray(gamesData)) {
        setGames(gamesData);
        setDbStatus({ connected: true, checked: true });
      }

      if (Array.isArray(usersData)) {
        setUsers(usersData);
      }

      if (bannerData) {
        setBanner(bannerData);
      }

      if (Array.isArray(catData) && catData.length > 0) {
        setCategories(catData);
      }

      if (Array.isArray(subData)) {
        setSubmissions(subData);
      }

      if (Array.isArray(msgData)) {
        setMessages(msgData);
      }

      if (setData) {
        setSettings(setData);
      }
    } catch (err) {
      console.warn('Backend API offline or initial sync fallback:', err.message);
      setDbStatus({ connected: false, checked: true });
    }
  }, []);

  // Real-time visitor polling & live socket synchronization
  useEffect(() => {
    statsApi.getOnlineCount().then(data => {
      if (typeof data?.count === 'number') setOnlineCount(data.count);
    }).catch(() => {});

    fetchAllData();

    // Socket Event Handlers
    const handleOnlineCount = (data) => {
      if (typeof data?.count === 'number') setOnlineCount(data.count);
    };

    const handleGamePlay = (data) => {
      if (!data?.id) return;
      setGames(prev => prev.map(g => (g.id === data.id || (g._id && String(g._id) === data.id)) ? { ...g, plays: data.plays } : g));
    };

    const handleGameCreated = (newGame) => {
      if (!newGame) return;
      setGames(prev => [newGame, ...prev.filter(g => (g.id || g._id) !== (newGame.id || newGame._id))]);
    };

    const handleGameUpdated = (updatedGame) => {
      if (!updatedGame) return;
      const targetId = updatedGame.id || updatedGame._id;
      setGames(prev => prev.map(g => ((g.id || g._id) === targetId || g.id === targetId || String(g._id) === targetId) ? { ...g, ...updatedGame } : g));
    };

    const handleGameDeleted = (data) => {
      const id = typeof data === 'object' ? (data.id || data._id) : data;
      if (id) {
        setGames(prev => prev.filter(g => (g.id || g._id) !== id && g.id !== id && String(g._id) !== id));
      }
    };

    const handleGameAllDeleted = () => {
      setGames([]);
    };

    const handleNewSubmission = (sub) => {
      if (!sub) return;
      setSubmissions(prev => [sub, ...prev.filter(s => (s.id || s._id) !== (sub.id || sub._id))]);
      showToast(`🚀 New Game Submitted: "${sub.gameTitle || 'Indie Game'}"`);
    };

    const handleSubmissionUpdated = (updatedSub) => {
      if (!updatedSub) return;
      const targetId = updatedSub.id || updatedSub._id;
      setSubmissions(prev => prev.map(s => ((s.id || s._id) === targetId || s.id === targetId || String(s._id) === targetId) ? { ...s, ...updatedSub } : s));
    };

    const handleSubmissionDeleted = (data) => {
      const id = typeof data === 'object' ? (data.id || data._id) : data;
      if (id) {
        setSubmissions(prev => prev.filter(s => (s.id || s._id) !== id && s.id !== id && String(s._id) !== id));
      }
    };

    const handleNewMessage = (msg) => {
      if (!msg) return;
      setMessages(prev => [msg, ...prev.filter(m => (m.id || m._id) !== (msg.id || msg._id))]);
      showToast(`📩 New Inquiry from "${msg.name || 'User'}"`);
    };

    const handleMessageUpdated = (updatedMsg) => {
      if (!updatedMsg) return;
      const targetId = updatedMsg.id || updatedMsg._id;
      setMessages(prev => prev.map(m => ((m.id || m._id) === targetId || m.id === targetId || String(m._id) === targetId) ? { ...m, ...updatedMsg } : m));
    };

    const handleMessageDeleted = (data) => {
      const id = typeof data === 'object' ? (data.id || data._id) : data;
      if (id) {
        setMessages(prev => prev.filter(m => (m.id || m._id) !== id && m.id !== id && String(m._id) !== id));
      }
    };

    const handleMessageRead = (data) => {
      const id = typeof data === 'object' ? (data.id || data._id) : data;
      if (id) {
        setMessages(prev => prev.map(m => ((m.id || m._id) === id || m.id === id || String(m._id) === id) ? { ...m, read: true } : m));
      }
    };

    const handleMessageAllRead = () => {
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
    };

    const handleNewUser = (newUser) => {
      if (!newUser) return;
      setUsers(prev => [newUser, ...prev.filter(u => (u.id || u._id) !== (newUser.id || newUser._id))]);
      showToast(`👤 New Player Registered: "${newUser.username || newUser.name}"`);
    };

    const handleUserUpdated = (updatedUser) => {
      if (!updatedUser) return;
      const targetId = updatedUser.id || updatedUser._id;
      setUsers(prev => prev.map(u => ((u.id || u._id) === targetId || u.id === targetId || String(u._id) === targetId) ? { ...u, ...updatedUser } : u));
    };

    const handleUserDeleted = (data) => {
      const id = typeof data === 'object' ? (data.id || data._id) : data;
      if (id) {
        setUsers(prev => prev.filter(u => (u.id || u._id) !== id && u.id !== id && String(u._id) !== id));
      }
    };

    const handleCategoryNew = (cat) => {
      if (!cat) return;
      setCategories(prev => {
        const id = cat.id || cat._id;
        if (prev.some(c => (c.id || c._id) === id)) return prev;
        return [...prev, cat];
      });
    };

    const handleCategoryUpdate = (updatedCat) => {
      if (!updatedCat) return;
      const id = updatedCat.id || updatedCat._id;
      setCategories(prev => prev.map(c => ((c.id || c._id) === id ? { ...c, ...updatedCat } : c)));
    };

    const handleCategoryDelete = (data) => {
      const id = typeof data === 'object' ? (data.id || data._id) : data;
      if (id) {
        setCategories(prev => prev.filter(c => (c.id || c._id) !== id));
      }
    };

    const handleBannerUpdate = (updatedBanner) => {
      if (updatedBanner) setBanner(updatedBanner);
    };

    const handleSettingsUpdate = (updatedSettings) => {
      if (updatedSettings) setSettings(updatedSettings);
    };

    // Register all socket listeners
    socket.on('online:count', handleOnlineCount);
    socket.on('game:play:increment', handleGamePlay);
    socket.on('game:created', handleGameCreated);
    socket.on('game:updated', handleGameUpdated);
    socket.on('game:deleted', handleGameDeleted);
    socket.on('game:all_deleted', handleGameAllDeleted);

    socket.on('submission:new', handleNewSubmission);
    socket.on('submission:updated', handleSubmissionUpdated);
    socket.on('submission:deleted', handleSubmissionDeleted);

    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:read', handleMessageRead);
    socket.on('message:all_read', handleMessageAllRead);

    socket.on('user:registered', handleNewUser);
    socket.on('user:updated', handleUserUpdated);
    socket.on('user:deleted', handleUserDeleted);

    socket.on('category:new', handleCategoryNew);
    socket.on('category:update', handleCategoryUpdate);
    socket.on('category:delete', handleCategoryDelete);

    socket.on('banner:update', handleBannerUpdate);
    socket.on('settings:update', handleSettingsUpdate);

    if (socket.connected) {
      socket.emit('request:online:count');
    }

    return () => {
      socket.off('online:count', handleOnlineCount);
      socket.off('game:play:increment', handleGamePlay);
      socket.off('game:created', handleGameCreated);
      socket.off('game:updated', handleGameUpdated);
      socket.off('game:deleted', handleGameDeleted);
      socket.off('game:all_deleted', handleGameAllDeleted);

      socket.off('submission:new', handleNewSubmission);
      socket.off('submission:updated', handleSubmissionUpdated);
      socket.off('submission:deleted', handleSubmissionDeleted);

      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('message:read', handleMessageRead);
      socket.off('message:all_read', handleMessageAllRead);

      socket.off('user:registered', handleNewUser);
      socket.off('user:updated', handleUserUpdated);
      socket.off('user:deleted', handleUserDeleted);

      socket.off('category:new', handleCategoryNew);
      socket.off('category:update', handleCategoryUpdate);
      socket.off('category:delete', handleCategoryDelete);

      socket.off('banner:update', handleBannerUpdate);
      socket.off('settings:update', handleSettingsUpdate);
    };
  }, [fetchAllData]);

  // Game Handlers
  const handleOpenGameModal = (game = null) => {
    setEditingGame(game);
    setIsGameModalOpen(true);
  };

  const handleSaveGame = async (savedGame) => {
    const gameId = savedGame.id || savedGame._id;
    const exists = games.some(g => (g.id || g._id) === gameId || g.id === gameId);

    try {
      let result;
      if (exists) {
        result = await gamesApi.update(gameId, savedGame);
        setGames(prev => prev.map(g => (g.id === result.id || g._id === result._id) ? result : g));
        showToast(`Game "${result.title}" updated successfully!`);
      } else {
        result = await gamesApi.create(savedGame);
        setGames(prev => [result, ...prev]);
        showToast(`Game "${result.title}" published & live on SKYGAMES!`);
      }
    } catch (err) {
      // Offline fallback
      if (exists) {
        setGames(prev => prev.map(g => (g.id === gameId || g._id === gameId) ? savedGame : g));
      } else {
        setGames(prev => [savedGame, ...prev]);
      }
      showToast(`Game saved locally (${err.message || 'offline'})`);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!gameId) return;
    try {
      const game = games.find(g => (g.id || g._id) === gameId || g.id === gameId);
      await gamesApi.delete(gameId);
      setGames(prev => prev.filter(g => (g.id || g._id) !== gameId && g.id !== gameId && String(g._id) !== gameId));
      showToast(`Game "${game?.title || gameId}" deleted from database!`, 'error');
    } catch (err) {
      setGames(prev => prev.filter(g => (g.id || g._id) !== gameId && g.id !== gameId && String(g._id) !== gameId));
      showToast(`Game removed locally.`, 'error');
    }
  };

  const handleToggleFeatured = async (gameId) => {
    if (!gameId) return;
    try {
      const updated = await gamesApi.toggleFeatured(gameId);
      setGames(prev => prev.map(g => ((g.id || g._id) === gameId || g.id === gameId || String(g._id) === gameId) ? updated : g));
      showToast(updated.featured ? `Marked "${updated.title}" as Featured Spotlight!` : `Removed from Featured Spotlight.`);
    } catch (err) {
      setGames(prev => prev.map(g => ((g.id || g._id) === gameId || g.id === gameId || String(g._id) === gameId) ? { ...g, featured: !g.featured } : g));
    }
  };

  // Category Handlers
  const handleAddCategory = async (newCat) => {
    try {
      const saved = await categoriesApi.create(newCat);
      setCategories(prev => [...prev, saved]);
      showToast(`Category "${saved.name}" created!`);
    } catch (err) {
      setCategories(prev => [...prev, newCat]);
      showToast(`Category created locally.`);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!catId) return;
    try {
      await categoriesApi.delete(catId);
      setCategories(prev => prev.filter(c => (c.id || c._id) !== catId && c.id !== catId && String(c._id) !== catId));
      showToast(`Category removed from database.`);
    } catch (err) {
      setCategories(prev => prev.filter(c => (c.id || c._id) !== catId && c.id !== catId && String(c._id) !== catId));
    }
  };

  // Banner Handlers
  const handleUpdateBanner = async (updatedBanner) => {
    try {
      const saved = await bannerApi.update(updatedBanner);
      setBanner(saved);
      showToast('Announcement banner broadcast updated!');
    } catch (err) {
      setBanner(updatedBanner);
      showToast('Banner updated locally.');
    }
  };

  // Submission Handlers
  const handleApproveSubmission = async (sub) => {
    try {
      const newGame = {
        id: (sub.gameTitle || 'game').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4),
        title: sub.gameTitle,
        category: sub.category || 'arcade',
        description: sub.description || '',
        thumbnail: sub.thumbnailUrl || '',
        banner: sub.thumbnailUrl || '',
        gameUrl: sub.gameUrl || '',
        tags: ['Developer', 'Community', sub.category || 'Arcade'],
        rating: 5.0,
        plays: 10,
        featured: false,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      const subIdentifier = sub.id || sub._id;
      let createdGame = newGame;
      try {
        createdGame = await gamesApi.create(newGame);
      } catch (e) {}

      try {
        await submissionsApi.updateStatus(subIdentifier, 'approved');
      } catch (e) {}

      setGames(prev => [createdGame, ...prev.filter(g => g.id !== createdGame.id)]);
      setSubmissions(prev => prev.map(s => ((s.id || s._id) === subIdentifier || s.id === subIdentifier || String(s._id) === subIdentifier) ? { ...s, status: 'approved' } : s));
      showToast(`Submission "${sub.gameTitle}" approved & live on SKYGAMES!`);
    } catch (err) {
      showToast(`Approved submission.`);
    }
  };

  const handleRejectSubmission = async (subId) => {
    if (!subId) return;
    try {
      await submissionsApi.updateStatus(subId, 'rejected');
      setSubmissions(prev => prev.map(s => ((s.id || s._id) === subId || s.id === subId || String(s._id) === subId) ? { ...s, status: 'rejected' } : s));
      showToast('Submission marked as rejected.', 'info');
    } catch (err) {
      setSubmissions(prev => prev.map(s => ((s.id || s._id) === subId || s.id === subId || String(s._id) === subId) ? { ...s, status: 'rejected' } : s));
    }
  };

  const handleDeleteSubmission = async (subId) => {
    if (!subId) return;
    try {
      await submissionsApi.delete(subId);
      setSubmissions(prev => prev.filter(s => (s.id || s._id) !== subId && s.id !== subId && String(s._id) !== subId));
      showToast('Submission record deleted.');
    } catch (err) {
      setSubmissions(prev => prev.filter(s => (s.id || s._id) !== subId && s.id !== subId && String(s._id) !== subId));
    }
  };

  // Message Handlers
  const handleMarkRead = async (msgId) => {
    if (!msgId) return;
    try {
      await messagesApi.markRead(msgId);
      setMessages(prev => prev.map(m => ((m.id || m._id) === msgId || m.id === msgId || String(m._id) === msgId) ? { ...m, read: true } : m));
    } catch (err) {
      setMessages(prev => prev.map(m => ((m.id || m._id) === msgId || m.id === msgId || String(m._id) === msgId) ? { ...m, read: true } : m));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await messagesApi.markAllRead();
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
      showToast('All messages marked as read.');
    } catch (err) {
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!msgId) return;
    try {
      await messagesApi.delete(msgId);
      setMessages(prev => prev.filter(m => (m.id || m._id) !== msgId && m.id !== msgId && String(m._id) !== msgId));
      showToast('Message deleted successfully.');
    } catch (err) {
      setMessages(prev => prev.filter(m => (m.id || m._id) !== msgId && m.id !== msgId && String(m._id) !== msgId));
    }
  };

  // User Management Handlers
  const handleAddUser = async (userData) => {
    try {
      const result = await usersApi.create(userData);
      if (result.user) {
        setUsers(prev => [result.user, ...prev.filter(u => (u.id || u._id) !== (result.user.id || result.user._id))]);
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
      showToast(`User "${userData.username}" created locally!`);
      return { user: localUser };
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, ...updates } : u));
      const result = await usersApi.update(userId, updates);
      if (result.user) {
        setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? result.user : u));
      }
      showToast(`User account updated!`);
    } catch (err) {
      showToast(`User updated.`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    try {
      await usersApi.delete(userId);
      setUsers(prev => prev.filter(u => (u.id || u._id) !== userId && u.id !== userId && String(u._id) !== userId));
      showToast('User deleted successfully.');
    } catch (err) {
      setUsers(prev => prev.filter(u => (u.id || u._id) !== userId && u.id !== userId && String(u._id) !== userId));
    }
  };

  // Platform Settings Handlers
  const handleSaveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      const saved = await settingsApi.update(newSettings);
      setSettings(saved);
      showToast('Platform settings saved & broadcasted!');
    } catch (err) {
      showToast('Settings saved locally.');
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
          await gamesApi.create(g);
        } catch (e) {}
      }
      setGames(data.games);
    }
    if (data.banner) {
      setBanner(data.banner);
      try {
        await bannerApi.update(data.banner);
      } catch (e) {}
    }
    showToast('Backup restored successfully!');
  };

  const handleResetData = async () => {
    try {
      await settingsApi.reset();
      await fetchAllData();
      showToast('Platform database reset to defaults in MongoDB!');
    } catch (err) {
      setGames(DEFAULT_GAMES);
      setUsers(DEFAULT_USERS);
      setCategories(DEFAULT_CATEGORIES);
      setSubmissions(DEFAULT_SUBMISSIONS);
      setMessages(DEFAULT_MESSAGES);
      setBanner(DEFAULT_BANNER);
      setSettings(DEFAULT_SETTINGS);
      showToast('Platform reset to defaults.');
    }
  };

  // Auth Handlers
  const handleAdminLogin = (user) => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, 'true');
    } catch (e) {}
    setAdminUser(user);
    showToast(`Welcome back, ${user.username || user.name || 'Admin'}!`);
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED_IN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
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
        bannerActive={Boolean(banner?.active)}
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
          <Suspense fallback={<div className="admin-loading-spinner" style={{ padding: '60px', textAlign: 'center', color: 'var(--accent-cyan)' }}>Loading Control View...</div>}>
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
                onDeleteSubmission={handleDeleteSubmission}
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
