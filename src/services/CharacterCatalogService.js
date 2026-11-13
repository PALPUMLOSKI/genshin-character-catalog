import { CharacterFactory } from "../mappers/CharacterFactory.js";
import { CharacterViewMapper } from "../mappers/CharacterViewMapper.js";

/**
 * Core Business Logic Layer service.
 * Orchestrates data retrieval, domain object creation, caching, filtering, and UI mapping.
 * Decoupled from concrete HTTP impementations via Dependency Injection.
 */
export class CharacterCatalogService {
    #apiClient;
    #characterCache;

    /**
     * @param {Object} apiClient - Must implement fetchCharacterIds() and fetchCharacterById(id).
     */
    constructor(apiClient) {
        if(!apiClient) {
            throw new Error('CharacterCatalogService requires an API client instance.');
        }
        this.#apiClient = apiClient;
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
     * Retrieves a single Character domain entity (uses cache if avaible).
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
     * Returns UI-ready card ViewModels with optional filtering and sorting.
     * @param {Object} filters
     * @param {string} [filters.vision] - Filter by element (e.g., 'Pyro').
     * @param {string} [filters.weapon] - Filter by weapon (e.g., 'Polearm').
     * @param {numbers} [filters.rarity] - Filter by rarity (4 or 5).
     * @param {string} [filters.searchQuerry] - Case-insensitive name search.
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

        // Sort by rarity descending, then alphabetically by name
        filtered.sort((a, b) => {
            if (b.rarity !== a.rarity) {
                return b.rarity - a.rarity;
            }
            return a.name.localeCompare(b.name);
        });

        return filtered.map((char) => CharacterViewMapper.toCardViewModel(char));
    }

    /**
     * Returns a detao;ed UI ViewModel for a specific character.
     * @param {string} id
     * @returns {Promise<Object>}
     */
    async getCharacterDetails(id) {
        const character = await this.getCharacterEntity(id);
        return CharacterViewMapper.toDetailViewModel(character);
    }
}