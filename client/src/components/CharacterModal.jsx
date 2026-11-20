import React from "react";

/**
 * Modal window displaying the full DetailViewModel of a selected character.
 */
export function CharacterModal({ character, onClose }) {
    if (!character) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content"
                style={{ borderTop: `6px solid ${character.elementThemeColor}` }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-button" onClick={onClose}>
                    Close
                </button>

                <div className="modal-header">
                    <img 
                        src={character.bufferedPortraitUrl || character.portraitUrl}
                        alt={character.displayName}
                        className="modal-portrait"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placeholder.com';
                        }}
                    />
                    <div className="modal-info">
                        <h2>{character.displayName}</h2>
                        <p className="subtitle">{character.subtitle}</p>
                        <p><strong>Element:</strong> {character.element}</p>
                        <p><strong>Weapon:</strong>{character.weaponType}</p>
                        <p><strong>Rarity:</strong>{character.rarityBadge}</p>
                        <p><strong>Nation:</strong>{character.nation}</p>
                        <p><strong>Affiliation:</strong>{character.affiliation}</p>
                        <p><strong>Constellation:</strong>{character.constellation}</p>
                        <p><strong>Birthday:</strong>{character.birthday}</p>
                        <p className="cache-status">
                            <strong>Image Source (DATA Layer):</strong> {character.imageSource || 'N/A'}
                        </p>
                    </div>

                    <div className="modal-bio">
                        <h4>Biography</h4>
                        <p>{character.biography}</p>
                    </div>

                    {character.skills && character.skills.length > 0 && (
                        <div className="modal-skills">
                            <h4>Skill Talents</h4>
                            <ul>
                                {character.skills.map((skill, idx) => (
                                    <li key={idx}>
                                        <strong>{skill.title}</strong> ({skill.unlockCondition}) : {skill.summary}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}