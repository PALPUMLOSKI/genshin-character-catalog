/**
 * Core domain entity representing a playable character.
 * Encapsulates raw attributes and provides domain-specific methods/
 */
export class Character {
    #id;
    #name;
    #title;
    #vision;
    #weapon;
    #nation;
    #affiliation;
    #rarity;
    #constellation;
    #birthday;
    #description;
    #skillTalents;
    #imageUrls;

    constructor({
        id,
        name,
        title,
        vision,
        weapon,
        nation,
        affiliation,
        rarity,
        constellation,
        birthday,
        description,
        skillTalents = [],
        imageUrls = {}
    }) {
        if (!id || !name) {
            throw new Error('Character entity requires a valid id and name.');
        }

        this.#id = id;
        this.#name = name;
        this.#title = title || 'Traveler';
        this.#vision = vision || 'None';
        this.#weapon = weapon || 'Unknown';
        this.#nation = nation || 'Unknown';
        this.#affiliation = affiliation || 'Independent';
        this.#rarity = Number(rarity) || 4;
        this.#constellation = constellation || 'Unknown';
        this.#birthday = birthday || null;
        this.#description = description || '';
        this.#skillTalents = skillTalents;
        this.#imageUrls = imageUrls;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get title() { return this.#title; }
    get vision() { return this.#vision; }
    get weapon() { return this.#weapon; }
    get nation() { return this.#nation; }
    get affiliation() { return this.#affiliation }
    get rarity() { return this.#rarity; }
    get constellation() { return this.#constellation; }
    get birthday() { return this.#birthday; }
    get description() { return this.#description; }
    get birthday() { return this.#birthday }
    get description() { return this.#description; }
    get skillTalents() { return [...this.#skillTalents]; }
    get imageUrls() { return { ...this.#imageUrls }; }

    /**
     * Cheks if the character belongs to the highest rarity tier (S-star)
     * @returns {boolean}
     */
    isFiveStar() {
        return this.#rarity === 5;
    }

    /**
     * Formats rarity as a visual star string.
     * @returns {string}
     */
    getRarityStars() {
        return '★'.repeat(this.#rarity);
    }
}