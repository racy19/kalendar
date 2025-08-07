const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

// set new event
router.post('/', async (req, res) => {
    try {
        const { title, description, dates, userId } = req.body;

        // check required fields
        if (!title || !dates || !userId) {
            return res.status(400).json({ error: 'Chybí povinná pole' });
        }

        if (!Array.isArray(dates) || dates.length === 0) {
            return res.status(400).json({ error: 'Pole dates musí obsahovat alespoň jeden termín' });
        }

        // check if userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Neplatné userId' });
        }

        // create uniquie slug
        const slug = slugify(title, { lower: true, strict: true });
        const shortHash = uuidv4().split('-')[0];
        const publicId = `${slug}-${shortHash}`;

        // map obtained dates to array of options, option get automatically mongo ObjectId
        const options = dates.map(date => ({
            date: new Date(date), // convert to Date object
            votes: []
        }));

        const event = new Event({
            title,
            description,
            options,
            user: userId,
            publicId
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
router.get("/:publicId", async (req, res) => {
    try {
        const publicId = req.params.publicId;

        const event = await Event.findOne({ publicId: publicId });

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
router.delete("/:publicId", async (req, res) => {
    try {
        const publicId = req.params.publicId;
        await Event.findOneAndDelete({ publicId: publicId });
        res.status(200).json({ message: "Událost byla smazána." });
    } catch (err) {
        console.error("Chyba při mazání události:", err);
        res.status(500).json({ error: "Chyba serveru při mazání." });
    }
});

// update votes of an event
router.patch("/:publicId/vote", async (req, res) => {
    try {
        const { publicId } = req.params;
        // votes: {date: Date, status: string}[]
        const { userId, votes } = req.body;

        if (!userId || !Array.isArray(votes)) {
            return res.status(400).json({ error: "Neplatná data pro hlasování." });
        }

        const event = await Event.findOne({ publicId });
        if (!event) {
            return res.status(404).json({ error: "Událost nebyla nalezena." });
        }

        // for each vote, find the corresponding option and update or add the vote
        for (const vote of votes) {
            const { date, status } = vote;
            if (!date || !['yes', 'no', 'maybe'].includes(status)) {
                continue; // skip invalid votes
            }
            // find the option by date
            const option = event.options.find(opt =>
                new Date(opt.date).toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0]
              );
            if (!option) {
                continue; // skip non-existing dates
            }
            // check if userId has already voted for this option
            const existingVote = option.votes.find(v => v.userId.toString() === userId);

            if (existingVote) {
                existingVote.status = status; // update existing vote status
            } else {
                option.votes.push({
                    userId,
                    status: vote.status
                });
            }
        }

        await event.save();
        res.status(200).json({ message: "Hlasování bylo uloženo.", event });

    } catch (err) {
        console.error("Chyba při ukládání hlasování:", err);
        res.status(500).json({ error: "Chyba serveru při ukládání hlasování." });
    }
});


module.exports = router;