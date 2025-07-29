const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// signup new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, authType, passwordHash, googleId, avatar } = req.body;

    // check existing user by email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Uživatel už existuje' });
    }

    // hash password if authType is local
    const hashedPassword = passwordHash
      ? await bcrypt.hash(passwordHash, 10)
      : undefined;

    const user = new User({
      name,
      email,
      authType: authType || 'local',
      passwordHash: hashedPassword,
      googleId,
      avatar
    });

    await user.save();
    res.status(201).json({user: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při ukládání uživatele' });
  }
});

// login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });
    if (!user || !password) {
      return res.status(401).json({ error: 'Neplatný e-mail nebo heslo' });
    }

    // if user uses Google auth, return error if password is provided
    if (!user.passwordHash) {
      return res.status(403).json({ error: 'Tento účet se přihlašuje přes Google' });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Neplatný e-mail nebo heslo' });
    }

    // successful login
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      authType: user.authType
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při přihlášení' });
  }
});


module.exports = router;
