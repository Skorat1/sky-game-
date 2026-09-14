import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO, recordActivity } from '../services/socketService.js';
import { signToken, verifyPassword } from '../utils/crypto.js';
import { sanitizeUser } from '../utils/sanitize.js';

/**
 * Admin Login Endpoint
 * POST /api/admin/login
 */
export async function loginAdmin(req, res) {
  try {
    const { identifier, email, password } = req.body;
    const loginIdent = String(identifier || email || '').toLowerCase().trim();
    const loginPass = String(password || '').trim();

    if (!loginIdent || !loginPass) {
      return res.status(400).json({ error: 'Admin Email/Username and Password are required.' });
    }

    // 1. Check Default SuperAdmin master credentials
    const isMasterAdmin =
      (loginIdent === 'admin@skygames.io' || loginIdent === 'superadmin' || loginIdent === 'admin') &&
      (loginPass === 'Admin@123' || loginPass === 'admin123' || loginPass === 'admin');

    let adminUser = null;

    // 2. Lookup in Database (MongoDB or local store)
    if (mongoose.connection.readyState === 1) {
      try {
        adminUser = await User.findOne({
          $or: [
            { email: loginIdent },
            { username: { $regex: new RegExp(`^${loginIdent}$`, 'i') } }
          ]
        }).lean();
      } catch (err) {
        adminUser = null;
      }
    }

    if (!adminUser) {
      adminUser = (localStore.users || []).find(
        u => (u.email && u.email.toLowerCase() === loginIdent) ||
          (u.username && u.username.toLowerCase() === loginIdent)
      );
    }

    // If master admin used but not in DB yet, create or fallback
    if (!adminUser && isMasterAdmin) {
      adminUser = {
        id: 'usr-admin-1',
        username: 'SuperAdmin',
        name: 'SuperAdmin',
        email: 'admin@skygames.io',
        role: 'admin',
        status: 'active',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SuperAdmin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
    }

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // 3. Verify admin role
    if (adminUser.role !== 'admin' && adminUser.role !== 'moderator') {
      return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
    }

    // 4. Verify password (unless validated via master password)
    if (!isMasterAdmin) {
      const isPasswordValid = verifyPassword(loginPass, adminUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      }
    }

    // 5. Update lastLogin
    const nowIso = new Date().toISOString();
    const idx = (localStore.users || []).findIndex(u => u.id === adminUser.id);
    if (idx !== -1) {
      localStore.users[idx].lastLogin = nowIso;
      persistStore();
    }
    if (mongoose.connection.readyState === 1) {
      await User.findOneAndUpdate({ id: adminUser.id }, { $set: { lastLogin: new Date() } }).catch(() => { });
    }

    // 6. Generate Admin JWT Token
    const token = signToken({
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role || 'admin',
      isAdmin: true
    }, 14 * 24 * 60 * 60); // 14 days expiry

    recordActivity('admin_login', 'Admin Access Granted', `Admin "${adminUser.username || adminUser.name}" signed into Control Center`);

    res.json({
      success: true,
      message: 'Admin authorization successful!',
      user: sanitizeUser(adminUser),
      token
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: err.message || 'Server error during admin authentication' });
  }
}

/**
 * Get Current Admin Profile
 * GET /api/admin/me
 */
export async function getAdminMe(req, res) {
  try {
    const adminId = req.admin?.id;
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ id: adminId }).lean();
    }
    if (!user) {
      user = (localStore.users || []).find(u => u.id === adminId);
    }
    if (!user) {
      user = req.admin;
    }

    res.json({
      success: true,
      admin: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Create New Administrator / Moderator
 * POST /api/admin/create
 */
export async function createAdmin(req, res) {
  try {
    const { username, email, password, name, role = 'admin' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanUsername = String(username).trim();

    // Check duplicate
    let exists = false;
    if (mongoose.connection.readyState === 1) {
      const found = await User.findOne({
        $or: [{ email: cleanEmail }, { username: cleanUsername }]
      });
      if (found) exists = true;
    }
    if (!exists) {
      exists = (localStore.users || []).some(
        u => (u.email && u.email.toLowerCase() === cleanEmail) ||
          (u.username && u.username.toLowerCase() === cleanUsername.toLowerCase())
      );
    }

    if (exists) {
      return res.status(409).json({ error: 'An account with this email or username already exists.' });
    }

    const adminId = 'usr-admin-' + Date.now().toString(36);
    const hashedPassword = hashPassword(password);
    const newAdmin = {
      id: adminId,
      username: cleanUsername,
      name: name ? String(name).trim() : cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
      provider: 'email',
      role: (role === 'moderator') ? 'moderator' : 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    if (!localStore.users) localStore.users = [];
    localStore.users.unshift(newAdmin);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await User.create(newAdmin).catch(() => {});
    }

    const io = getIO();
    if (io) io.emit('user:registered', sanitizeUser(newAdmin));
    recordActivity('admin_created', 'New Admin Registered', `Admin account "${cleanUsername}" created with role "${newAdmin.role}"`);

    res.status(201).json({
      success: true,
      message: `Admin account "${cleanUsername}" created successfully!`,
      user: sanitizeUser(newAdmin)
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: err.message || 'Server error creating admin' });
  }
}

/**
 * Admin Logout
 * POST /api/admin/logout
 */
export async function logoutAdmin(req, res) {
  try {
    recordActivity('admin_logout', 'Admin Signed Out', `Admin session ended`);
    res.json({ success: true, message: 'Admin logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
