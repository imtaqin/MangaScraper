const express = require('express');
const apiKey = require('../config/key.js');
const mangaController = require('../controllers/manga.controller.js');

class MangaRouter {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Middleware to check the API Key
        const checkApiKey = (req, res, next) => {
            const providedApiKey = req.headers['x-api-key'];
            if (providedApiKey && providedApiKey === apiKey) {
                next(); // Valid API key
            } else {
                res.status(401).json({ error: 'Unauthorized: Invalid API key' });
            }
        };

        // Setting up routes with middleware
        this.router.get('/popular-today', checkApiKey, this.handlePopularToday);
        this.router.get('/latest', checkApiKey, this.handleLatestManga);
        this.router.get('/latest/page/:number', checkApiKey, this.handleLatestMangaWithPage);
        this.router.get('/manga/:detail', checkApiKey, this.handleMangaDetail);
        this.router.get('/chapter/:detail', checkApiKey, this.handleChapterDetail);
    }

    async handlePopularToday(req, res) {
        try {
            const data = await mangaController.PopularTodays();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async handleLatestManga(req, res) {
        try {
            const data = await mangaController.LatestManga();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async handleLatestMangaWithPage(req, res) {
        try {
            const pageNumber = req.params.number;
            const data = await mangaController.LatestMangawithPage(pageNumber);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async handleMangaDetail(req, res) {
        try {
            const detailId = req.params.detail;
            const data = await mangaController.Manga(detailId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async handleChapterDetail(req, res) {
        try {
            const detailId = req.params.detail;
            const data = await mangaController.Chapter(detailId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

}

module.exports = MangaRouter;
