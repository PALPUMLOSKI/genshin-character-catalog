import React from "react";

/**
 * Components GUI representing a single character card in the scrollable catalog.
 * Displays buffered portrait graphics, name, element badge, and brief metadata.
 */
export function CharacterCard({ character, onSelect }) {
    return (
        <div
            className="character-card"
            style={{ borderBlockColor: character.elementThemeColor }}       
            onClick={() => onSelect(character.id)}
        >
            <div
                className="card-header"
                style={{ backgroundColor: character.elementThemeColor }}
            >
                <span className="element-badge">{character.element}</span>
                <span className="rarity-badge">{character.rarityBadge}</span>
            </div>
            <div className="card-image-container">
                <img 
                    src={character.bufferedImageUrl || character.thumbnailUrl}
                    alt={character.displayName}
                    className="character-portrait"
                    onError={(e) => {
                        e.currentTarget.src = 'https://placeholder.com';
                    }}
                />
            </div>

            <div className="card-body">
                <h3 className="character-name">{character.displayName}</h3>
                <p className="character-subtitle">{character.subtitle}</p>
                <div className="character-meta">
                    <span>Weapon: {character.weaponType}</span>
                </div>
            </div>
        </div>
    );
}