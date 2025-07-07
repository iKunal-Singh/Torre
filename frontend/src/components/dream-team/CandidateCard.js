import React from 'react';
import '../../styles/CandidateCard.css';

// Default placeholder image function (simple initials)
const getPlaceholderImageUrl = (name) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  // Simple SVG placeholder to avoid external calls for placeholders in this example
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                 <rect width="100" height="100" fill="#e0e0e0"/>
                 <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#333">${initials}</text>
               </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};


const CandidateCard = ({ candidate, onAddToTeam, isAdded, canAdd }) => {
  const { id, name, skills, photoUrl } = candidate;

  return (
    <div className={`candidate-card ${isAdded ? 'added' : ''}`}>
      <img
        src={photoUrl || getPlaceholderImageUrl(name || 'NN')}
        alt={`${name || 'Candidate'}'s profile`}
        className="candidate-photo"
      />
      <div className="candidate-info">
        <h3 className="candidate-name">{name || 'N/A'}</h3>
        <p className="candidate-skills">
          Skills: {skills && skills.length > 0 ? skills.join(', ') : 'Not specified'}
        </p>
      </div>
      <button
        onClick={() => onAddToTeam(candidate)}
        disabled={!canAdd || isAdded}
        className="candidate-add-button"
      >
        {isAdded ? 'Added' : (canAdd ? 'Add to Team' : 'Team Full')}
      </button>
    </div>
  );
};

export default CandidateCard;
