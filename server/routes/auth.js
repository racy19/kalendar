const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, authType, password, googleId, avatar } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.authType === 'google') {
        return res.status(409).json({
          error: 'Tento e-mail je již registrován přes Google. Přihlaste se přes Google.',
        });
      }
      return res.status(409).json({ error: 'Uživatel s tímto e-mailem již existuje.' });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const user = new User({
      name,
      email,
      authType: authType || 'local',
      passwordHash: hashedPassword,
      googleId,
      avatar,
    });

    await user.save();
    res.status(201).json({ user: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při ukládání uživatele' });
  }
});

// login with local credentials and return JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !password) {
      return res.status(401).json({ error: 'Neplatný e-mail nebo heslo' });
    }

    if (!user.passwordHash) {
      return res.status(403).json({ error: 'Tento účet nemá nastavené heslo, nebo se přihlašuje přes Google SSO' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Neplatný e-mail nebo heslo' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při přihlášení' });
  }
});

router.post('/google-login', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: 'Neplatný token' });

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (user && user.authType === 'local') {
      return res.status(409).json({
        error: 'Tento e-mail je registrován klasicky. Přihlaste se heslem.',
      });
    }

    if (!user) {
      // new user
      user = new User({
        name,
        email,
        googleId,
        authType: 'google',
        avatar: picture,
      });
      await user.save();
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Chyba při ověření Google tokenu' });
  }
});

// get user profile by ID
router.get('/user/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Nemáte oprávnění' });
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při načítání uživatele' });
  }
});

// update user profile
router.put('/user/:id', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Nemáte oprávnění' });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Jméno je povinné' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při aktualizaci uživatele' });
  }
});

// pwd change endpoint
router.put('/user/:id/password', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== id) {
    return res.status(403).json({ error: 'Nemáte oprávnění' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Zadejte staré i nové heslo' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }

    // block password change for Google accounts
    if (user.authType === 'google') {
      return res.status(403).json({ error: 'Google účty nemohou měnit heslo' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Tento účet nemá heslo' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Staré heslo není správné' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Heslo bylo úspěšně změněno' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při změně hesla' });
  }
});

module.exports = router;