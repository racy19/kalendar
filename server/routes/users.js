const express = require('express');
const router = express.Router();
const User = require('../models/User');

// get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'Uživatel nenalezen' });
        }
        const userObject = {
            _id: user._id.toString(),
            name: user.name,
        };
        res.json(userObject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Chyba při načítání uživatele' });
    }
});


module.exports = router;