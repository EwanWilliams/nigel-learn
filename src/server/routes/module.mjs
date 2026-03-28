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
            res.status(201).json({ moduleId: newModule._id });
        } else {
            res.status(400).json({ error: "error parsing input data" });
        }
    } catch (err) {
        console.error("New module error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// find and return entire module by _id
router.get('/:id', async (req, res) => {
    try {
        const foundModule = await Module.findById(req.params.id);
        if (!foundModule) {
            res.status(404).json({ error: "Module not found" });
        } else {
            res.status(200).json(foundModule);
        }
    } catch (err) {
        console.error("Get module error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;