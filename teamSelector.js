// Define data structures (as comments for now, will be implemented in code later)

// Candidate:
// {
//   id: "string" | number,
//   name: "string",
//   skills: { [skillName: string]: proficiencyLevel: number } // e.g., {"JavaScript": 4, "Python": 5}
// }

// Required Skills:
// string[] // e.g., ["JavaScript", "Node.js"]

// Team Size:
// number

// Skill Coverage Summary (Output):
// { [skillName: string]: boolean } // e.g., {"JavaScript": true, "Node.js": false}
// or more detailed:
// { [skillName: string]: { covered: boolean, proficiency?: number, coveredBy?: string[] } }

// Simulated database or source of candidate genome information
const candidateGenomes = {
  "candidate1": { id: "candidate1", name: "Alice", skills: { "JavaScript": 5, "React": 4, "Node.js": 3 } },
  "candidate2": { id: "candidate2", name: "Bob", skills: { "Python": 5, "DataAnalysis": 5, "MachineLearning": 4 } },
  "candidate3": { id: "candidate3", name: "Charlie", skills: { "JavaScript": 4, "HTML": 5, "CSS": 5, "React": 3 } },
  "candidate4": { id: "candidate4", name: "Diana", skills: { "Node.js": 5, "Databases": 4, "CloudArchitecture": 5 } },
  "candidate5": { id: "candidate5", name: "Edward", skills: { "Python": 3, "Java": 4, "ProjectManagement": 5 } },
  "candidate6": { id: "candidate6", name: "Fiona", skills: { "JavaScript": 5, "Node.js": 4, "React": 5, "GraphQL": 4 } },
};

/**
 * Simulates fetching genome information (skills) for a given candidate.
 * In a real application, this could involve an API call.
 * @param {string} candidateId The ID of the candidate.
 * @returns {Promise<object|null>} A promise that resolves with the candidate's data (including skills)
 *                                or null if the candidate is not found.
 */
async function fetchCandidateGenome(candidateId) {
  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => {
      const candidateData = candidateGenomes[candidateId];
      if (candidateData) {
        resolve(candidateData);
      } else {
        console.warn(`Genome data not found for candidate ${candidateId}`);
        resolve(null);
      }
    }, 100); // Simulate 100ms delay
  });
}

// Example usage (can be removed later or moved to a test section)
async function testFetch() {
  console.log("Fetching genome for candidate1...");
  const aliceGenome = await fetchCandidateGenome("candidate1");
  console.log("Alice's Genome:", aliceGenome);

  console.log("\nFetching genome for candidateX (non-existent)...");
  const unknownGenome = await fetchCandidateGenome("candidateX");
  console.log("Unknown Candidate's Genome:", unknownGenome);

  // Example of fetching for a list of candidate IDs
  const candidateIdsToFetch = ["candidate2", "candidate4"];
  console.log(`\nFetching genomes for: ${candidateIdsToFetch.join(', ')}`);
  const fetchedGenomes = await Promise.all(
    candidateIdsToFetch.map(id => fetchCandidateGenome(id))
  );
  console.log("Fetched Genomes:", fetchedGenomes.filter(g => g !== null));
}

// testFetch(); // Uncomment to run the test fetch

/**
 * Scores a candidate based on the number of currently uncovered skills they possess.
 *
 * @param {object} candidate The candidate object, containing their `skills` property.
 *                           Example: { id: "candidate1", name: "Alice", skills: { "JavaScript": 5, "React": 4 } }
 * @param {Set<string>} uncoveredSkills A Set of strings representing the skills still needed.
 *                                      Example: new Set(["JavaScript", "Node.js"])
 * @returns {number} The score of the candidate, representing the count of uncovered skills they can provide.
 */
function scoreCandidate(candidate, uncoveredSkills) {
  if (!candidate || !candidate.skills) {
    return 0;
  }

  let score = 0;
  for (const skill in candidate.skills) {
    if (uncoveredSkills.has(skill)) {
      score++;
      // Optional: Could add proficiency to the score here, e.g., score += candidate.skills[skill];
      // However, the primary goal is coverage of distinct skills first.
    }
  }
  return score;
}

// Example usage for scoreCandidate (can be removed or moved to a test section)
function testScoring() {
  const candidateA = { id: "candidateA", name: "Alice", skills: { "JavaScript": 5, "React": 4, "Node.js": 3 } };
  const candidateB = { id: "candidateB", name: "Bob", skills: { "Node.js": 5, "Databases": 4 } };
  const candidateC = { id: "candidateC", name: "Charlie", skills: { "Python": 5 } }; // Covers no required skills initially

  let currentUncoveredSkills = new Set(["JavaScript", "Node.js", "CloudArchitecture"]);

  console.log("Scoring Candidate A (Alice) against:", currentUncoveredSkills);
  let scoreA = scoreCandidate(candidateA, currentUncoveredSkills);
  console.log("Score for Alice:", scoreA); // Expected: 2 (JavaScript, Node.js)

  console.log("\nScoring Candidate B (Bob) against:", currentUncoveredSkills);
  let scoreB = scoreCandidate(candidateB, currentUncoveredSkills);
  console.log("Score for Bob:", scoreB); // Expected: 1 (Node.js)

  console.log("\nScoring Candidate C (Charlie) against:", currentUncoveredSkills);
  let scoreC = scoreCandidate(candidateC, currentUncoveredSkills);
  console.log("Score for Charlie:", scoreC); // Expected: 0

  // Simulate Alice being picked, update uncovered skills
  currentUncoveredSkills.delete("JavaScript");
  currentUncoveredSkills.delete("Node.js");
  console.log("\nUpdated uncovered skills after picking Alice (hypothetically):", currentUncoveredSkills); // Now: {"CloudArchitecture"}

  console.log("Re-scoring Candidate A (Alice) against updated skills:", currentUncoveredSkills);
  scoreA = scoreCandidate(candidateA, currentUncoveredSkills);
  console.log("New score for Alice:", scoreA); // Expected: 0

  console.log("\nRe-scoring Candidate B (Bob) against updated skills:", currentUncoveredSkills);
  scoreB = scoreCandidate(candidateB, currentUncoveredSkills);
  console.log("New score for Bob:", scoreB); // Expected: 0 (Bob's Node.js is already covered)

  const candidateD = { id: "candidateD", name: "Diana", skills: { "CloudArchitecture": 5, "JavaScript": 3 } };
  console.log("\nScoring Candidate D (Diana) against updated skills:", currentUncoveredSkills);
  let scoreD = scoreCandidate(candidateD, currentUncoveredSkills);
  console.log("Score for Diana:", scoreD); // Expected: 1 (CloudArchitecture)
}

// testScoring(); // Uncomment to run the test scoring logic

/**
 * Selects a team of size n from a pool of candidates using a greedy algorithm.
 *
 * @param {string[]} allCandidateIds List of all available candidate IDs to consider.
 * @param {string[]} requiredSkills An array of skill names that the team should ideally cover.
 * @param {number} teamSize The desired number of members in the team.
 * @returns {Promise<{selectedTeam: object[], skillCoverage: object}>}
 *          An object containing the selected team (array of candidate objects)
 *          and a skill coverage summary.
 */
async function selectTeam(allCandidateIds, requiredSkills, teamSize) {
  const selectedTeam = [];
  const coveredSkills = new Set();
  let uncoveredSkills = new Set(requiredSkills);

  // Fetch all candidate data first.
  // In a real scenario with many candidates, you might fetch them on demand
  // or use more sophisticated filtering if fetching is expensive.
  const allCandidatesData = (await Promise.all(
    allCandidateIds.map(id => fetchCandidateGenome(id))
  )).filter(candidate => candidate !== null); // Filter out nulls if any ID wasn't found

  let availableCandidates = [...allCandidatesData];

  while (selectedTeam.length < teamSize && uncoveredSkills.size > 0) {
    let bestCandidate = null;
    let bestScore = -1; // Use -1 to ensure any positive score is better

    if (availableCandidates.length === 0) {
      console.log("No more candidates available.");
      break;
    }

    for (const candidate of availableCandidates) {
      const score = scoreCandidate(candidate, uncoveredSkills);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
      // Simple tie-breaking: first candidate with max score wins.
      // More complex tie-breaking could be added here (e.g., higher total proficiency).
    }

    if (bestCandidate === null || bestScore === 0) {
      // No candidate can cover any more of the remaining uncovered skills.
      console.log("No candidate can improve skill coverage further.");
      break;
    }

    selectedTeam.push(bestCandidate);
    availableCandidates = availableCandidates.filter(c => c.id !== bestCandidate.id);

    // Update covered and uncovered skills
    for (const skill in bestCandidate.skills) {
      if (uncoveredSkills.has(skill)) {
        coveredSkills.add(skill);
        uncoveredSkills.delete(skill);
      }
    }
    console.log(`Selected: ${bestCandidate.name}, Score: ${bestScore}, Skills covered by this pick: ${Object.keys(bestCandidate.skills).filter(s => requiredSkills.includes(s) && !coveredSkills.has(s) && uncoveredSkills.has(s) === false )}`);
    console.log(`Uncovered skills remaining: ${uncoveredSkills.size}`);
  }

  // Prepare skill coverage summary
  const skillCoverageSummary = {};
  for (const skill of requiredSkills) {
    skillCoverageSummary[skill] = coveredSkills.has(skill);
  }

  return {
    selectedTeam,
    skillCoverage: skillCoverageSummary,
  };
}


// Example Usage for selectTeam
async function runTeamSelectionExample() {
  const allCandidateIds = Object.keys(candidateGenomes); // Using all candidates from our mock DB
  const requiredSkills = ["JavaScript", "Node.js", "React", "CloudArchitecture", "DataAnalysis"];
  const teamSize = 3;

  console.log(`\n--- Running Team Selection Example ---`);
  console.log(`Required Skills: ${requiredSkills.join(', ')}`);
  console.log(`Desired Team Size: ${teamSize}`);
  console.log(`Considering ${allCandidateIds.length} candidates.`);

  const result = await selectTeam(allCandidateIds, requiredSkills, teamSize);

  console.log("\n--- Team Selection Result ---");
  console.log("Selected Team Members:");
  result.selectedTeam.forEach(member => {
    console.log(`- ${member.name} (Skills: ${Object.keys(member.skills).join(', ')})`);
  });

  console.log("\nSkill Coverage Summary:");
  for (const skill in result.skillCoverage) {
    console.log(`- ${skill}: ${result.skillCoverage[skill] ? 'Covered' : 'NOT Covered'}`);
  }
  console.log("---------------------------------");
}

// runTeamSelectionExample(); // Uncomment to run the team selection example

// --- Main Function to Run Examples/Tests ---
async function main() {
  console.log("========= Running Team Selection Examples =========");

  // Example 1: Standard run (already defined as runTeamSelectionExample)
  await runTeamSelectionExample();

  // Example 2: All skills covered before team size limit
  console.log("\n--- Example 2: All skills covered early ---");
  const skillsForEarlyCover = ["JavaScript", "React"]; // Only 2 skills
  const teamSizeForEarlyCover = 3; // Team size is 3
  // Candidate6 (Fiona) covers both JS and React.
  // The team should ideally pick Fiona and then stop if only these skills are required,
  // or pick one more if the logic strictly adheres to teamSize unless no one adds value.
  // Current logic will continue to pick up to teamSize if candidates still have >0 score,
  // which means they cover at least one of the *initially* required skills that are *still uncovered*.
  // If all *initially* required skills are covered, score becomes 0 for everyone on those skills.
  // Let's test this:
  const resultEarly = await selectTeam(
    Object.keys(candidateGenomes),
    skillsForEarlyCover,
    teamSizeForEarlyCover
  );
  console.log("Selected Team (Early Cover Test):");
  resultEarly.selectedTeam.forEach(member => console.log(`- ${member.name}`));
  console.log("Skill Coverage (Early Cover Test):", resultEarly.skillCoverage);
  // Expected: Fiona selected. If teamSize allows and others have 0 score for JS/React,
  // it might pick more if they have other skills from the original list (not applicable here).
  // If the score is strictly for *uncovered* skills, subsequent picks should be 0 if Fiona covers all.

  // Example 3: Team size limit reached, skills uncovered
  console.log("\n--- Example 3: Team size limit, skills pending ---");
  const limitedSkills = ["JavaScript", "Node.js", "React", "CloudArchitecture", "DataAnalysis", "NonExistentSkill1", "NonExistentSkill2"];
  const limitedTeamSize = 2;
  const resultLimited = await selectTeam(
    Object.keys(candidateGenomes),
    limitedSkills,
    limitedTeamSize
  );
  console.log(`Selected Team (Limited Size ${limitedTeamSize}):`);
  resultLimited.selectedTeam.forEach(member => console.log(`- ${member.name} (Score contributing to this pick would be interesting to see)`));
  console.log("Skill Coverage (Limited Size Test):", resultLimited.skillCoverage);
  // Expected: Team of 2, some skills likely still false.

  // Example 4: No candidates
  console.log("\n--- Example 4: No candidates ---");
  const resultNoCandidates = await selectTeam([], ["JavaScript"], 3);
  console.log("Selected Team (No Candidates):", resultNoCandidates.selectedTeam.length); // Expected: 0
  console.log("Skill Coverage (No Candidates):", resultNoCandidates.skillCoverage); // Expected: {"JavaScript": false}

  // Example 5: No candidate can cover required skills
  console.log("\n--- Example 5: No candidate has the skill ---");
  const resultNoMatchingSkill = await selectTeam(Object.keys(candidateGenomes), ["KlingonProgramming"], 2);
  console.log("Selected Team (No Matching Skill):", resultNoMatchingSkill.selectedTeam.length); // Expected: 0
  console.log("Skill Coverage (No Matching Skill):", resultNoMatchingSkill.skillCoverage); // Expected: {"KlingonProgramming": false}

  // Example 6: Team Size 0
  console.log("\n--- Example 6: Team Size 0 ---");
  const resultTeamSizeZero = await selectTeam(Object.keys(candidateGenomes), ["JavaScript"], 0);
  console.log("Selected Team (Team Size 0):", resultTeamSizeZero.selectedTeam.length); // Expected: 0
  console.log("Skill Coverage (Team Size 0):", resultTeamSizeZero.skillCoverage); // Expected: {"JavaScript": false}

  // Example 7: Team size > available candidates
  console.log("\n--- Example 7: Team size > available candidates ---");
  // Use only a subset of candidates for this test
  const fewCandidateIds = ["candidate1", "candidate2"]; // Alice (JS, React, Node), Bob (Python, DataAnalysis)
  const resultTeamSizeTooLarge = await selectTeam(fewCandidateIds, ["JavaScript", "Python", "Fortran"], 3);
  console.log("Selected Team (Team Size > Available):");
  resultTeamSizeTooLarge.selectedTeam.forEach(member => console.log(`- ${member.name}`)); // Expected: Alice, Bob
  console.log("Skill Coverage (Team Size > Available):", resultTeamSizeTooLarge.skillCoverage);
  // Expected: JS: true, Python: true, Fortran: false. Team size will be 2.


  console.log("\n===============================================");
}

// To run the examples:
main(); // Uncomment this line

console.log("teamSelector.js updated with the selectTeam greedy algorithm and example runner.");
