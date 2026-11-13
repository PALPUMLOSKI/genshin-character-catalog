import { GenshinApiClient } from "./src/infrastructure/GenshinApiClient.js";
import { MockGenshinApiClient } from "./src/infrastructure/MockGenshinApiClient.js";
import { CharacterCatalogService } from "./src/services/CharacterCatalogService.js";

/**
 * Demonstration entry point acting as a temporart Presentation Layer (CLI).
 */
async function main() {
    // Switch between real API and Mock stub easily due to Dependency Injection
    const useMock = true;
    const apiClient = useMock ? new MockGenshinApiClient() : new GenshinApiClient();

    const catalogService = new CharacterCatalogService(apiClient);

    try {
        console.log('--- Fetching and parsing characters from API ---');
        // Preload a few characters or Load all
        await catalogService.getCharacterEntity('hu-tao');
        await catalogService.getCharacterEntity('bennett');
        await catalogService.getCharacterEntity('kaedehara-kazuha');

        console.log('\n--- 1. UI Card ViewModels (Filtered by Vision: Pyro) ---');
        const pyroCards = await catalogService.getCatalogCards({ vision: 'Pyro' });
        console.table(pyroCards);

        console.log('\n--- 2. UI Detail ViewModel (Hu Tao) ---');
        const huTaoDetails = await catalogService.getCharacterDetails('hu-tao');
        console.dir(huTaoDetails, { depth: null });
    } catch (error) {
        console.error('Application Error:', error.message);
    }
}

main();