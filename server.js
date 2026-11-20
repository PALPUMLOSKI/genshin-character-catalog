import express from 'express';
import cors from 'cors';
import { GenshinApiClient } from './src/infrastructure/GenshinApiClient.js';
import { MockGenshinApiClient } from './src/infrastructure/MockGenshinApiClient.js';
import { LocalImageCacheRepository } from './src/infrastructure/LocalImageCacheRepository.js';
import { CharacterCatalogService } from './src/services/CharacterCatalogService.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Request logger: prints every incoming request to the terminal
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const useMock = true;
const apiClient = useMock ? new MockGenshinApiClient() : new GenshinApiClient();
const imageCacheRepo = new LocalImageCacheRepository();
const catalogService = new CharacterCatalogService(apiClient, imageCacheRepo);

app.use('/cached-images', express.static(imageCacheRepo.cacheDir));

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
                    const fileName = buffered.localPath.split(/[\\/]/).pop();
                    return {
                        ...card,
                        bufferedImageUrl: `http://localhost:${PORT}/cached-images/${fileName}`,
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
    } catch (error) {
        console.error('ERROR in GET /api/characters:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/characters/:id', async (req, res) => {
    try {
        const details = await catalogService.getCharacterDetails(req.params.id);

        if (details.localPortraitPath) {
            const fileName = details.localPortraitPath.split(/[\\/]/).pop();
            details.bufferedPortraitUrl = `http://localhost:${PORT}/cached-images/${fileName}`;
        }

        res.json(details);
    } catch (error) {
        console.error(`ERROR in GET /api/characters/${req.params.id}:`, error);
        res.status(404).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Character Catalog Web-API running on http://localhost:${PORT}`);
});
