import React from 'react';
import DreamTeamBuilder from '../components/dream-team/DreamTeamBuilder';
// Styles for this page wrapper, if any, could be added here or in a global CSS.
// For now, assuming DreamTeamBuilder handles its own layout comprehensively.

const DreamTeamPage = () => {
  return (
    <div className="dream-team-page-container">
      <DreamTeamBuilder />
    </div>
  );
};

export default DreamTeamPage;
