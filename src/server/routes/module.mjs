import express from "express";


const router = express.Router();



// test API call
router.get('/test', (req, res) => {
    res.status(200).json({message: "this message came from the server"});
});

export default router;