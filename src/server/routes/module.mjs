import express from 'express';
import Module from '../models/Module.mjs';

const router = express.Router();


// add new user generated module to DB
router.post('/new', async (req, res) => {
    console.log("Received new module data: ", req.body);
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
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});


// find and return entire module by _id
router.get('/data/:id', async (req, res) => {
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


// return list of module titles and ids
router.get('/list', async (req, res) => {
    try {
        const allModules = await Module.find({}, 'title');
        if (!allModules) {
            res.status(404).json({ error: "No modules found." });
        } else {
            res.status(200).json(allModules);
        }
    } catch (err) {
        console.error("Get module list error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;