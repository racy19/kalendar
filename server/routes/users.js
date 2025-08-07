const express = require('express');
const router = express.Router();
const User = require('../models/User');

// get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name');
        if (!user) {
            return res.status(404).json({ error: 'Uživatel nenalezen' });
        }
        res.json(user?.name ? user.name : 'Uživatel bez jména');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Chyba při načítání uživatele' });
    }
});

module.exports = router;