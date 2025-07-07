import React from 'react';
import CandidateCard from './CandidateCard'; // Assuming CandidateCard is in the same directory
import '../../styles/DreamTeamDisplay.css';

const DreamTeamDisplay = ({ dreamTeam, teamSize }) => {
  return (
    <div className="dream-team-display-container">
      <h2 className="dream-team-title">
        Your Dream Team ({dreamTeam.length}/{teamSize})
      </h2>
      {dreamTeam.length === 0 ? (
        <p className="dream-team-empty-message">
          Select candidates from the list above to add them to your dream team.
        </p>
      ) : (
        <div className="dream-team-grid">
          {dreamTeam.map(member => (
            <CandidateCard
              key={member.id}
              candidate={member}
              onAddToTeam={() => {}} // No action needed here, already in team
              isAdded={true} // Mark as added
              canAdd={false} // Cannot add again
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DreamTeamDisplay;
