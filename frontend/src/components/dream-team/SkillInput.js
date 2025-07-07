import React from 'react';
import '../../styles/SkillInput.css';

const SkillInput = ({ skills, setSkills, disabled }) => {
  const handleChange = (event) => {
    setSkills(event.target.value);
  };

  return (
    <div className="skill-input-container">
      <label htmlFor="skills-input" className="skill-input-label">
        Required Skills
      </label>
      <input
        type="text"
        id="skills-input"
        value={skills}
        onChange={handleChange}
        placeholder="e.g., JavaScript, React, Node.js"
        className="skill-input-field"
        disabled={disabled}
      />
      <p className="skill-input-hint">Enter skills separated by commas.</p>
    </div>
  );
};

export default SkillInput;
