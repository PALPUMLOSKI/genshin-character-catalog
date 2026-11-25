import React, { useState, useEffect } from "react";
import { CharacterCard } from "./components/CharacterCard";
import { CharacterModal } from "./components/CharacterModal";
import "./App.css";

// Use explicit localhost URL in development (Debug) mode, and relative in production (Release) build
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

/**
 * Root Presentation Layer (GUI) container.
 * Implements Event-Driven state updates and renders a scrollable list of CharacterCards.
 */
export default function App() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visionFilter, setVisionFilter] = useState('');
  const [weaponFilter, setWeaponFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch filtered Character Card ViewModels from Express Web-API
  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (visionFilter) params.append('vision', visionFilter);
        if (weaponFilter) params.append('weapon', weaponFilter);
        if (rarityFilter) params.append('rarity', rarityFilter);

        const response = await fetch(`${API_BASE_URL}/characters?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch character catalog from Web-API.');
        }
        const data = await response.json();
        setCharacters(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [searchQuery, visionFilter, weaponFilter, rarityFilter]);

  // Event handler for selecting a character card to view detailed ViewModel
  const handleSelectCharacter = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${id}`);
      if (!response.ok) {
        throw new Error('Failed to loda character details.');
      }
      const detailData = await response.json();
      setSelectedCharacter(detailData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Event handler for resetting all filter controls
  const handleResetFilters = () => {
    setSearchQuery('');
    setVisionFilter('');
    setWeaponFilter('');
    setRarityFilter('');
  };

  return (
    <div className="app-window">
      <header className="app-header">
        <h1>Genshin Character Catalog</h1>
        <p>Presentation Layer (React GUI) + Web-API (Express) + OOP Core</p>
      </header>

      <section className="filter-panel">
        <input
          type="text"
          placeholder="Search character by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="filter-input"
        />

        <select
          value={visionFilter}
          onChange={(e) => setVisionFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Elements</option>
          <option value="Pyro">Pyro</option>
          <option value="Hydro">Hydro</option>
          <option value="Anemo">Anemo</option>
          <option value="Electro">Electro</option>
          <option value="Dendro">Dendro</option>
          <option value="Cryo">Cryo</option>
          <option value="Geo">Geo</option>
        </select>

        <select
          value={weaponFilter}
          onChange={(e) => setWeaponFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Weapon</option>
          <option value="Sword">Sword</option>
          <option value="Claymore">Claymore</option>
          <option value="Polearm">Polearm</option>
          <option value="Bow">Bow</option>
          <option value="Catalyst">Catalyst</option>
        </select>

        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Rarities</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
        </select>

        <button onClick={handleResetFilters} className="reset-button">
          Reset
        </button>
      </section>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading characters...</div>
      ) : (
        <main className="catalog-scroll-container">
          {characters.length === 0 ? (
            <p className="empty-state">No characters match the selected filters.</p>
          ) : (
            <div className="cards-grid">
              {characters.map((char) => (
                <CharacterCard 
                  key={char.id}
                  character={char}
                  onSelect={handleSelectCharacter}
                />
              ))}
            </div>
          )}
        </main>
      )}

      <CharacterModal 
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
}