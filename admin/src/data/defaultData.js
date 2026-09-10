export const DEFAULT_GAMES = [];

export const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Games', icon: '🎮', count: 10, color: '#00ffcc' },
  { id: 'arcade', name: 'Arcade', icon: '🕹️', count: 3, color: '#ff0055' },
  { id: 'action', name: 'Action', icon: '⚔️', count: 1, color: '#ffaa00' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩', count: 3, color: '#9d00ff' },
  { id: 'classic', name: 'Classic', icon: '👾', count: 1, color: '#00e5ff' },
  { id: 'sports', name: 'Sports', icon: '⚽', count: 1, color: '#00ff88' },
  { id: 'cyber', name: 'Cyberpunk', icon: '⚡', count: 4, color: '#ff00aa' }
];

export const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub-101',
    developerName: 'AeroPulse Studios',
    email: 'dev@aeropulse.io',
    gameTitle: 'Galactic Drift Racer',
    category: 'racing',
    gameUrl: 'https://play.gamepix.com/drift-boss/embed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80',
    description: 'High speed hovercraft racing across neon canyons with dynamic weather effects.',
    status: 'pending',
    date: '2026-09-08'
  },
  {
    id: 'sub-102',
    developerName: 'HexaByte Indie Lab',
    email: 'contact@hexabyte.game',
    gameTitle: 'Quantum Chess 3D',
    category: 'puzzle',
    gameUrl: 'https://html5.gamedistribution.com/sample',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80',
    description: 'A mind-bending chess variant with quantum superposition mechanics.',
    status: 'pending',
    date: '2026-09-07'
  }
];

export const DEFAULT_MESSAGES = [
  {
    id: 'msg-1',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    type: 'Bug Report',
    subject: 'Knife Clash leaderboard sync issue',
    message: 'I scored 450 points in Knife Clash, but my highscore didn’t update on restart. Please check.',
    date: '2026-09-09 09:15',
    read: false
  },
  {
    id: 'msg-2',
    name: 'Priya Patel',
    email: 'priya.games@gmail.com',
    type: 'Game Request',
    subject: 'Request for multiplayer mode in Neon Pong',
    message: 'Love the neon aesthetic! Is it possible to add online 1v1 matchmaking in Neon Pong?',
    date: '2026-09-08 18:30',
    read: true
  },
  {
    id: 'msg-3',
    name: 'Vikram Mehta',
    email: 'vikram.m@techzone.in',
    type: 'Partnership',
    subject: 'Game distribution inquiry',
    message: 'We have a library of 15 WebGL HTML5 action games and would love to partner with SKYGAMES.',
    date: '2026-09-07 14:20',
    read: true
  }
];

export const DEFAULT_BANNER = {
  active: true,
  badge: '🔥 TOURNAMENT LIVE',
  message: 'SkyGames Weekend Championship is live! Compete in Knife Clash & Cyber Runner for exclusive VIP badges & rewards!',
  ctaText: 'Play Now',
  ctaLink: '#arcade',
  bgColor: 'rgba(255, 0, 85, 0.15)',
  borderColor: '#ff0055'
};

export const DEFAULT_SETTINGS = {
  platformName: 'SKYGAMES Control Center',
  siteTitle: 'SKYGAMES - Next-Gen Web Gaming Arena',
  metaDescription: 'Play the best high-octane cyberpunk and neon arcade games in your browser instantly.',
  maintenanceMode: false,
  allowRegistrations: true,
  allowDevSubmissions: true,
  primaryColor: '#00ffcc',
  secondaryColor: '#8a2be2',
  announcementDuration: 7
};

export const WEEKLY_ANALYTICS = [
  { day: 'Mon', players: 4200, plays: 12500, time: 18 },
  { day: 'Tue', players: 4800, plays: 14100, time: 21 },
  { day: 'Wed', players: 5100, plays: 15800, time: 24 },
  { day: 'Thu', players: 4900, plays: 14900, time: 20 },
  { day: 'Fri', players: 6800, plays: 22400, time: 32 },
  { day: 'Sat', players: 9400, plays: 34100, time: 45 },
  { day: 'Sun', players: 8900, plays: 31200, time: 40 }
];
