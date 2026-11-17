import { GenshinApiClient } from "./src/infrastructure/GenshinApiClient.js";
import { MockGenshinApiClient } from "./src/infrastructure/MockGenshinApiClient.js";
import { LocalImageCacheRepository } from "./src/infrastructure/LocalImageCacheRepository.js";
import { CharacterCatalogService } from "./src/services/CharacterCatalogService.js";

/**
 * Demonstration entry point acting as a temporart Presentation Layer (CLI).
 * Demonstrates both Business Logic (CORE) and Persistent Image Buffering (DATA)
 */
async function main() {
    const useMock = true;
    const apiClient = useMock ? new MockGenshinApiClient() : new GenshinApiClient();
    const imageCacheRepo = new LocalImageCacheRepository();

    const catalogService = new CharacterCatalogService(apiClient, imageCacheRepo);

    try {
        console.log('--- 1. Initializing Persistance Layer (Image Buffering) ---');
        console.log(`Cache Directory: ${imageCacheRepo.cacheDir}\n`);

        // Fisrt request: downloads and writes portrait image to local disk
        const firstFetch = await catalogService.bufferCharacterPortrait('hu-tao');
        console.log('Fisrt request (Hu Tao portrait):', firstFetch);

        // Second request: reads directly from local disk without hitting network
        const secondFetch = await catalogService.bufferCharacterPortrait('hu-tao');
        console.log('Second request (Hu Tao portrait):', secondFetch);

        // Buffer another character portrait
        const kazuhaFetch = await catalogService.bufferCharacterPortrait('kaedehara-kazuha');
        console.log('Fisrt request (Kazuha portrait):', kazuhaFetch);

        console.log('\n--- 2. UI Detail ViewModel with Local Buffered Portrait ---');
        const huTaoDetails = await catalogService.getCharacterDetails('hu-tao');
        console.dir(huTaoDetails, { depth: null });
        
    } catch (error) {
        console.error('Application Error:', error.message);
    }
}

main();