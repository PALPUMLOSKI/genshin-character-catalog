/**
 * Prepares Domain Models into flat, UI-ready ViewModels
 * specifically tailored for the Presentation Layer (GUI).
 */
export class CharacterViewMapper {
    static #visionColorMap = {
        Pyro: '#EF7938',
        Hydro: '#4CC2F1',
        Anemo: '#74C2A8',
        Electro: '#AF8EC1',
        Dendro: '#A5C83B',
        Cryo: '#9FD6E3',
        Geo: '#FAB632',
        None: '#888888'
    }

    /**
     * Maps a Character domain object to a Lightweight Card ViewModel for catalog grids.
     * @param {import('../domain/Character.js').Character} character
     * @returns {Object}
     */
    static toCardViewModel(character) {
        return {
            id: character.id,
            displayName: character.name,
            subtitle: character.title,
            element: character.vision,
            elementThemeColor: this.#visionColorMap[character.vision] || '#888888',
            weaponType: character.weapon,
            rarityLevel: character.rarity,
            rarityBadge: character.getRarityStars(),
            isFeatured: character.isFiveStar(),
            thumbnailUrl: character.imageUrls.icon
        };
    }

    /**
     * Maps a Characters domain object to a comprehensive Detail ViewModel for modal/profile views.
     * @param {import('../domain/Character.js').Character} character
     * @returns {Object}
     */
    static toDetailViewModel(character) {
        return {
            ...this.toCardViewModel(character),
            nation: character.nation,
            affiliation: character.affiliation,
            constellation: character.constellation,
            birthday: character.birthday || 'Unknown',
            biography: character.description,
            portraitUrl: character.imageUrls.portraitUrl,
            skills: character.skillTalents.map((skill) => ({
                title: skill.name,
                unlockCondition: skill.unlock,
                summary: skill.description
            }))
        };
    }
}