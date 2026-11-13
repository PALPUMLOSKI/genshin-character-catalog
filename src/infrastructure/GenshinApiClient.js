/**
 * Infrastructure Layer adapter for communicating with the external Genshin API.
 */
export class GenshinApiClient {
    #baseUrl;

    constructor(baseUrl = 'https://jmp.blue') {
        this.#baseUrl = baseUrl;
    }

    get baseUrl() {
        return this.#baseUrl;
    }

    /**
     * Fetches the list of avaible character IDs.
     * @returns {Promise<string[]>}
     */
    async fetchCharacterIds() {
        const response = await fetch(`${this.#baseUrl}/characters`);
        if (!response.ok) {
            throw new Error(`API Error (${response.status}): Failed to fetch character list.`);
        }
        return response.json();
    }

    /**
     * Fetches raw JSON data for a single character by ID.
     * @param {string} id
     * @returns {Promise<Object>}
     */
    async fetchCharacterById(id) {
        const response = await fetch(`${this.#baseUrl}/characters/${id}`);
        if (!response.ok) {
            throw new Error(`API Error (${response.status}): Failed to fetch character '${id}'.`);
        }
        return response.json();
    }
}