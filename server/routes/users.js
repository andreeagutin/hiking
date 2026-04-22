import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireUserAuth } from '../middleware/auth.js';

const router = Router();
const USER_JWT_SECRET = process.env.JWT_USER_SECRET || process.env.JWT_SECRET;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function serializeUser(user) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    children: user.children,
    subscription: user.subscription,
    subExpiresAt: user.subExpiresAt,
    createdAt: user.createdAt,
  };
}

function signUserToken(user) {
  return jwt.sign(
    {
      type: 'user',
      userId: user._id.toString(),
      email: user.email,
    },
    USER_JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function normalizeChildren(children) {
  if (!Array.isArray(children)) {
    throw new Error('Children must be an array');
  }

  const currentYear = new Date().getFullYear();

  return children.map((child) => {
    const name = typeof child?.name === 'string' ? child.name.trim() : '';
    const rawBirthYear = child?.birthYear;

    if (rawBirthYear == null || rawBirthYear === '') {
      return { name, birthYear: null };
    }

    const birthYear = Number(rawBirthYear);
    if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > currentYear + 1) {
      throw new Error('Invalid child birth year');
    }

    return { name, birthYear };
  });
}

async function loadUser(userId) {
  return User.findById(userId);
}

router.post('/register', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      name,
    });

    return res.status(201).json({ user: serializeUser(user) });
  } catch (err) {
    console.error('[users/register] error:', err.message);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!email || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      token: signUserToken(user),
      user: serializeUser(user),
    });
  } catch (err) {
    console.error('[users/login] error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireUserAuth, async (req, res) => {
  try {
    const user = await loadUser(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(serializeUser(user));
  } catch (err) {
    console.error('[users/me] error:', err.message);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.put('/me', requireUserAuth, async (req, res) => {
  try {
    const user = await loadUser(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
      const email = normalizeEmail(req.body.email);
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      user.email = email;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      user.name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'children')) {
      user.children = normalizeChildren(req.body.children);
    }

    await user.save();
    return res.json(serializeUser(user));
  } catch (err) {
    const status = ['Invalid child birth year', 'Children must be an array'].includes(err.message) ? 400 : 500;
    console.error('[users/update-me] error:', err.message);
    return res.status(status).json({ error: status === 400 ? err.message : 'Failed to update profile' });
  }
});

// ── Saved items ──────────────────────────────────────────────────────────────
router.get('/me/saved', requireUserAuth, async (req, res) => {
  try {
    const user = await loadUser(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const populated = await user.populate([
      { path: 'savedHikes', select: 'name slug distance time up difficulty mountains zone mainPhoto photos imageUrl familyFriendly' },
      { path: 'savedRestaurants', select: 'name type mountains zone address link' },
      { path: 'savedPois', select: 'name slug poiType mountains zone mainPhoto photos' },
    ]);

    return res.json({
      hikes:       populated.savedHikes,
      restaurants: populated.savedRestaurants,
      pois:        populated.savedPois,
    });
  } catch (err) {
    console.error('[users/saved] error:', err.message);
    return res.status(500).json({ error: 'Failed to load saved items' });
  }
});

const SAVED_FIELD = { hike: 'savedHikes', restaurant: 'savedRestaurants', poi: 'savedPois' };

router.post('/me/saved/:type/:itemId', requireUserAuth, async (req, res) => {
  const field = SAVED_FIELD[req.params.type];
  if (!field) return res.status(400).json({ error: 'Invalid type' });

  try {
    const user = await loadUser(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const id = req.params.itemId;
    if (!user[field].some(x => x.toString() === id)) {
      user[field].push(id);
      await user.save();
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[users/save-item] error:', err.message);
    return res.status(500).json({ error: 'Failed to save item' });
  }
});

router.delete('/me/saved/:type/:itemId', requireUserAuth, async (req, res) => {
  const field = SAVED_FIELD[req.params.type];
  if (!field) return res.status(400).json({ error: 'Invalid type' });

  try {
    const user = await loadUser(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user[field] = user[field].filter(x => x.toString() !== req.params.itemId);
    await user.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('[users/unsave-item] error:', err.message);
    return res.status(500).json({ error: 'Failed to unsave item' });
  }
});

router.get('/me/subscription', requireUserAuth, async (req, res) => {
  try {
    const user = await loadUser(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      subscription: user.subscription,
      subExpiresAt: user.subExpiresAt,
    });
  } catch (err) {
    console.error('[users/subscription] error:', err.message);
    return res.status(500).json({ error: 'Failed to load subscription' });
  }
});

export default router;
