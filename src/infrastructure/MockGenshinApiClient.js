/**
 * Stub/Mock implementation of the API client for offline testing
 * and unit verification without external network dependencies.
 */
export class MockGenshinApiClient {
    #baseUrl = 'https://jmp.blue';
    #mockDatabase;

    constructor() {
        this.#mockDatabase = {
            'hu-tao': {
                name: 'Hu Tao',
                title: 'Fragrance in Thaw',
                vision: 'Pyro',
                weapon: 'Polearm',
                nation: 'Liyue',
                affiliation: 'Wangsheng Funeral Parlor',
                rarity: 5,
                constellation: 'Papilio Charontis',
                birthday: '0000-07-15',
                description: 'The 77-th Director of the Wangsheng Funeral Parlor.',
                SkillTalent: [
                    {
                        name: 'Secret Spear of Wangsheng',
                        unlock: 'Normal Attack',
                        description: 'Performs up to 6 consecutive spear strikes.',
                        type: 'NORMAL_ATTACK'
                    }
                ]
            },
            'kaedehara-kazuha': {
                name: 'Kaedehara Kazuha',
                title: 'Scarlet Leaves Pursue Wild Waves',
                vision: 'Anemo',
                weapon: 'Sword',
                nation: 'Inazuma',
                affiliation: 'The Crux',
                rarity: 5,
                constellation: 'Acer Palmatum',
                birthday: '0000-10-29',
                description: 'A wandering samurai from Inazuma.',
                skillTalents: []
            },
            'bennett': {
                name: 'Bennett',
                title: 'Trial by Fire',
                vision: 'Pyro',
                weapon: 'Sword',
                nation: 'Mondstadt',
                affiliation: 'Adventures Guild',
                rarity: 4,
                constellation: 'Rota Calamitas',
                birthday: '0000-02-29',
                description: 'A good-natured adventurer from Mondstadt.',
                skillTalents: []
            }
        };
    }

    get baseUrl() {
        return this.#baseUrl;
    }

    async fetchCharacterIds() {
        return Object.keys(this.#mockDatabase);
    }

    async fetchCharacterById(id) {
        const data = this.#mockDatabase[id];
        if (!data) {
            throw new Error(`Mock Error: Character '${id}' not found.`);
        }
        return structuredClone(data);
    }
}