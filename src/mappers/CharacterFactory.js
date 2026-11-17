import { Character } from "../domain/Character.js";
import { SkillTalent } from "../domain/SkillTalent.js";

/**
 * Factory pattern implementation for parsing raw JSON payloads
 * from the Genshin API into strongly encapsulated Domain Models.
 */
export class CharacterFactory {
    /**
     * Creates a Character domain instance from raw JSON data.
     * @param {string} id - Character slug identifier (e.g., 'hu-tao').
     * @param {Object} rawJson - Parsed JSON object from API.
     * @param {string} baseUrl = Base API URL to construct asset links.
     * @returns {Character}
     */
    static createFromJson(id, rawJson, baseUrl = 'https://jmp.blue') {
        if (!rawJson || typeof rawJson !== 'object') {
            throw new Error(`Invalid JSON payload provided for character: ${id}`);
        }

        const parsedSkills = Array.isArray(rawJson.skillTalents)
        ? rawJson.skillTalents.map((skill) => new SkillTalent(skill))
        : [];

        const normalizedId = id.toLowerCase().trim();

        const imageUrls = {
            icon: `${baseUrl}/characters/${normalizedId}/icon-big`,
            card: `${baseUrl}/characters/${normalizedId}/card`,
            portrait: `${baseUrl}/characters/${normalizedId}/portrait`
        };


        return new Character({
            id: normalizedId,
            name: rawJson.name,
            title: rawJson.title,
            vision: rawJson.vision,
            weapon: rawJson.weapon,
            nation: rawJson.nation,
            affiliation: rawJson.affiliation,
            rarity: rawJson.rarity,
            constellation: rawJson.constellation,
            birthday: this.#formatBirthday(rawJson.birthday),
            description: rawJson.description,
            skillTalents: parsedSkills,
            imageUrls
        });
    }

    /**
     * Cleans up API date strings (e.g., '0000--7-15 ->' '07-15'),
     * @param {string} rawDate
     * @returns {string|null}
     */
    static #formatBirthday(rawDate) {
        if (!rawDate || typeof rawDate !== 'string') return null;
        return rawDate.replace(/^0000-/, '');
    }
}