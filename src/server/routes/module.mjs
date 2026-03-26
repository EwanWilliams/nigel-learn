import express from 'express';
import Module from '../models/Module.mjs';

const router = express.Router();


// add new user generated module to DB
router.post('/new', async (req, res) => {
    try {
        const inputData = req.body;
        // TODO perform json validation to request body before bothering the database
        // currently just checks that the data exists, implement further validation to ensure schema match
        if (inputData) {
            const newModule = await Module.create(inputData);
            res.status(201).json({moduleId: newModule._id});
        } else {
            res.status(400).json({message: "error parsing input data"})
        }
    } catch (err) {
        console.error("New module error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router;