import React from 'react';
import '../../styles/TeamSizeSelector.css';

const TeamSizeSelector = ({ teamSize, setTeamSize, disabled }) => {
  const handleChange = (event) => {
    const value = parseInt(event.target.value, 10);
    // Basic validation: ensure it's a number and within a reasonable range (e.g., 1-10)
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setTeamSize(value);
    } else if (event.target.value === '') {
      // Allow clearing the input, default to 1 or handle as per preference
      setTeamSize(1);
    }
  };

  return (
    <div className="team-size-selector-container">
      <label htmlFor="team-size-input" className="team-size-selector-label">
        Team Size
      </label>
      <input
        type="number"
        id="team-size-input"
        value={teamSize}
        onChange={handleChange}
        min="1"
        max="10"
        className="team-size-selector-input"
        disabled={disabled}
      />
      <p className="team-size-selector-hint">Enter a number between 1 and 10.</p>
    </div>
  );
};

export default TeamSizeSelector;
