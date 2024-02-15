import express from "express";
const router = express.Router();

// path magic
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let leaderboard = router.get('/game', function(req, res,) {
    res.sendFile(path.join(__dirname, '../views/leaderboard.html'));
});