/**
 * Represents a character skill or talent in the domain layer.
 */
export class SkillTalent {
    #name;
    #unlock;
    #description;
    #type;

    constructor({ name, unlock, description, type }) {
        this.#name = name || 'Unknown Skill';
        this.#unlock = unlock || 'Base';
        this.#description = description || 'No description avaible.';
        this.#type = type || 'NORMAL_ATTACK';
    }

    get name() {
        return this.#name;
    }

    get unlock() {
        return this.#unlock;
    }

    get description() {
        return this.#description;
    }

    get type() {
        return this.#type;
    }
}