import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { GenshinApiClient } from "./src/infrastructure/GenshinApiClient.js";
import { MockGenshinApiClient } from "./src/infrastructure/MockGenshinApiClient.js";
import { LocalImageCacheRepository } from "./src/infrastructure/LocalImageCacheRepository.js";
import { CharacterCatalogService } from "./src/services/CharacterCatalogService.js"

// Resolve root directory sagely in both ES Module (Debug) and bundled Common (Release) modes
const rootDir = process.pkg
    ? path.resolve(__dirname, '..')
    : path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request Lagger: every incoming request to the terminal
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const useMock = true;
const apiClient = useMock ? new MockGenshinApiClient() : new GenshinApiClient();
const imageCacheRepo = new LocalImageCacheRepository();
const catalogService = new CharacterCatalogService(apiClient, imageCacheRepo);

// Serve locally buffered character portraits
app.use(`/cached-images`, express.static(imageCacheRepo.cacheDir));

// Serve compiled React frontend static files (Release build)
const clientDistPath = path.join(rootDir, 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('/api/characters', async (req, res) => {
    try {
        const filters = {
            vision: req.query.vision || '',
            weapon: req.query.weapon || '',
            rarity: req.query.rarity || '',
            searchQuery: req.query.search || ''
        };

        const cards = await catalogService.getCatalogCards(filters);

        const enrichedCards = await Promise.all(
            cards.map(async (card) => {
                try {
                    const buffered = await catalogService.bufferCharacterPortrait(card.id);
                    const filename = buffered.localPath.split(/[\\/]/).pop();
                    return {
                        ...card,
                        bufferedImageUrl: `/cached-images/${filename}`,
                        imageSource: buffered.source
                    };
                } catch {
                    return {
                        ...card,
                        bufferedImageUrl: card.thumbnailUrl,
                        imageSource: 'REMOTE_FALLBACK'
                    };
                }
            })
        );

        res.json(enrichedCards);
    } catch(error) {
        console.error('ERROR in GET /api/characters:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/characters/:id', async (req, res) => {
    try {
        const details = await catalogService.getCharacterDetails(req.params.id);

        if (details.localPortraitPath) {
            const filename = details.localPortraitPath.split(/[\\/]/).pop();
            details.bufferedPortraitUrl = `/cached-images/${filename}`;
        }

        res.json(details);
    } catch (error) {
        console.error(`ERROR in GET /api/characters/${req.params.id}:`, error);
        res.status(404).json({ error: error.message });
    }
});

// Fallback route to serve React SPA index.html for any non-API routes
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

/**
 * Automatically opens the default web browser on the user's OS.
 * @param {string} url
 */
function openBrowser(url) {
    const command =
        process.platform === 'win32'
        ? `start "" "${url}"`
        : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;

    exec(command, (err) => {
        if (err) {
            console.log(`Please open your browser manually at: ${url}`);
        }
    });
}

app.listen(PORT, () => {
    const appUrl = `http://localhost:${PORT}`;
    console.log(`====================================================`);
    console.log(`Genshin Character Catalog is running at: ${appUrl}`);
    console.log(`Press Ctrl+C in this window to stop the application.`);
    console.log(`====================================================`);

    // Automatically open browser in production/packaged mode
    if (process.env.NODE_ENV === 'production' || process.pkg) {
        openBrowser(appUrl);
    }
});