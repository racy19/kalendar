const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// set new event
router.post('/', async (req, res) => {
  try {
    const { title, description, dates, userId } = req.body;

    // check required fields
    if (!title || !dates || !userId) {
      return res.status(400).json({ error: 'Chybí povinná pole' });
    }

    const event = new Event({
      title,
      description,
      dates,
      user: userId
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba při vytváření události' });
  }
});

module.exports = router;
