const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

// get all events for a specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Neplatné userId" });
        }

        const events = await Event.find({ user: new mongoose.Types.ObjectId(userId) });

        res.json(events);
    } catch (err) {
        console.error("Chyba při načítání událostí:", err);
        res.status(500).json({ error: "Chyba serveru" });
    }
});

// get an event by ID
router.get("/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ error: "Neplatné eventId" });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ error: "Událost nenalezena" });
        }

        res.json(event);
    } catch (err) {
        console.error("Chyba při načítání události:", err);
        res.status(500).json({ error: "Chyba serveru" });
    }
});

// delete an event by ID
router.delete("/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;
        await Event.findByIdAndDelete(eventId);
        res.status(200).json({ message: "Událost byla smazána." });
    } catch (err) {
        console.error("Chyba při mazání události:", err);
        res.status(500).json({ error: "Chyba serveru při mazání." });
    }
});

module.exports = router;
