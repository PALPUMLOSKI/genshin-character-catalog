import { CharacterFactory } from "../mappers/CharacterFactory.js";
import { CharacterViewMapper } from "../mappers/CharacterViewMapper.js";

/**
 * Core Business Logic Layer service.
 * Orchestrates data retrieval, domain object creation, in-memory caching,
 * persistent image buffering, filtering, and UI mapping.
 */
export class CharacterCatalogService {
    #apiClient;
    #imageCacheRepository;
    #characterCache;

    /**
     * @param {Object} apiClient - Must implement fetchCharacterIds() and fetchCharacterById(id).
     * @param {Object} [imageCacheRepository] - Optional Persistence Layer repository for image buffering.
     */
    constructor(apiClient, imageCacheRepository = null) {
        if(!apiClient) {
            throw new Error('CharacterCatalogService requires an API client instance.');
        }
        this.#apiClient = apiClient;
        this.#imageCacheRepository = imageCacheRepository;
        this.#characterCache = new Map();
    }

    /**
     * Loads all characters from the data source and caches them as Domain Models.
     * @returns {Promise<import('../domain/Character.js').Character[]>}
     */
    async loadAllCharacters() {
        const ids = await this.#apiClient.fetchCharacterIds();
        const promises = ids.map((id) => this.getCharacterEntity(id));
        return Promise.all(promises);
    }

    /**
     * Retrieves a single Character domain entity (uses memory cache if avaible).
     * @param {string} id
     * @returns {Promise<import('../domain/Character.js').Character>}
     */
    async getCharacterEntity(id) {
        const normalizedId = id.toLowerCase().trim();

        if (this.#characterCache.has(normalizedId)) {
            return this.#characterCache.get(normalizedId);
        }

        const rawJson = await this.#apiClient.fetchCharacterById(normalizedId);
        const character = CharacterFactory.createFromJson(
            normalizedId,
            rawJson,
            this.#apiClient.baseUrl
        );

        this.#characterCache.set(normalizedId, character);
        return character;
    }

    /**
     * Buffers a character's portrait image on local disk via Persistance Layer
     * and returns the local along with cache status.
     * @param {string} id
     * @returns {Promise<{ characterId: string, localPath: string, source: string }>}
     */
    async bufferCharacterPortrait(id) {
        if (!this.#imageCacheRepository) {
            throw new Error('ImageCacheRepository is not condifured in CharacterCatalogService.');
        }

        const character = await this.getCharacterEntity(id);
        const remotePortraitUrl = character.imageUrls.portrait;

        const result = await this.#imageCacheRepository.getOrDownloadImage(
            character.id,
            remotePortraitUrl,
            'portrait'
        );

        return {
            characterId: character.id,
            localPath: result.filePath,
            source: result.source
        };
    }

    /**
     * Returns UI-ready card ViewModels with optional filtering and sorting.
     * @param {Object} filters
     * @returns {Promise<Object[]>}
     */
    async getCatalogCards(filters = {}) {
        let characters = Array.from(this.#characterCache.values());

        if (characters.length === 0) {
            characters = await this.loadAllCharacters();
        }

    const filtered = characters.filter((char) => {
      if (filters.vision && (char.vision || '').toLowerCase() !== filters.vision.toLowerCase()) {
        return false;
      }
      if (filters.weapon && (char.weapon || '').toLowerCase() !== filters.weapon.toLowerCase()) {
        return false;
      }
      if (filters.rarity && char.rarity !== Number(filters.rarity)) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!(char.name || '').toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });

        filtered.sort((a, b) => {
            if (b.rarity !== a.rarity) {
                return b.rarity - a.rarity;
            }
            return a.name.localeCompare(b.name);
        });

        return filtered.map((char) => CharacterViewMapper.toCardViewModel(char));
    }

    /**
     * Returns a detailed UI ViewModel for a specific character,
     * automatically attaching the locally buffered portrait path if avaible.
     * @param {string} id
     * @returns {Promise<Object>}
     */
    async getCharacterDetails(id) {
        const character = await this.getCharacterEntity(id);
        const viewModel = CharacterViewMapper.toDetailViewModel(character);

        if (this.#imageCacheRepository) {
            const buffered = await this.bufferCharacterPortrait(id);
            viewModel.localPortraitPath = buffered.localPath;
            viewModel.imageSource = buffered.source;
        }

        return viewModel;
    }
}