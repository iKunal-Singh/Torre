import React, { useState, useEffect, useRef } from 'react';
import SkillInput from './SkillInput';
import TeamSizeSelector from './TeamSizeSelector';
import CandidateCard from './CandidateCard';
import DreamTeamDisplay from './DreamTeamDisplay';
import '../../styles/DreamTeamBuilder.css';

const DreamTeamBuilder = () => {
  const [skills, setSkills] = useState('');
  const [teamSize, setTeamSize] = useState(3);

  const [streamingCandidates, setStreamingCandidates] = useState([]);
  const [dreamTeam, setDreamTeam] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sseStatus, setSseStatus] = useState('Idle'); // Idle, Connecting, Connected, Error, Ended

  const eventSourceRef = useRef(null);

  const handleStartStream = () => {
    if (!skills.trim()) {
      setError('Please enter the required skills.');
      return;
    }

    setError(null);
    setStreamingCandidates([]); // Clear previous stream
    // setDreamTeam([]); // Optional: Clear dream team on new search
    setIsLoading(true);
    setIsStreaming(true);
    setSseStatus('Connecting...');
  };

  const handleStopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      console.log('SSE connection closed by user.');
    }
    setIsStreaming(false);
    setIsLoading(false);
    // Don't change sseStatus if it was already 'Ended' or 'Error'
    if (sseStatus !== 'Ended' && sseStatus !== 'Error') {
        setSseStatus('Stopped by user');
    }
  };

  useEffect(() => {
    if (!isStreaming) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      return;
    }

    const queryParams = new URLSearchParams({
      skills: skills.trim(),
      size: teamSize.toString(), // API expects 'size'
    });
    // The instructions specify '/api/search'.
    // The existing ProfileStream.js used 'http://localhost:3001/events'.
    // I will use '/api/search' as per the explicit instructions for this task.
    const sseUrl = `/api/search?${queryParams.toString()}`;

    console.log(`Connecting to SSE: ${sseUrl}`);
    eventSourceRef.current = new EventSource(sseUrl);

    eventSourceRef.current.onopen = () => {
      console.log('SSE connection opened.');
      setIsLoading(false); // Stream is open, actual data loading might still be pending
      setSseStatus('Connected');
    };

    eventSourceRef.current.onmessage = (event) => {
      setIsLoading(false); // Got some data
      try {
        const data = JSON.parse(event.data);

        // The backend might send different types of messages.
        // For example, individual candidates or the final dream team.
        // Based on instructions: "Emitting final result with a custom dreamTeam event"
        // This implies regular messages are candidates, and a special event for the final team.

        if (event.lastEventId === 'dreamTeam') { // Or a custom event type if backend sends it
            // This condition might not be standard; usually, custom events are via addEventListener
            // Assuming for now the backend sends a regular message with a way to identify it as the final team,
            // or we rely on the 'dreamTeam' custom event listener below.
            // For now, let's assume 'onmessage' primarily receives individual candidates.
            console.log('Received candidate:', data);
            setStreamingCandidates((prev) => {
                 // Avoid duplicates if stream resends
                if (!prev.find(c => c.id === data.id)) {
                    return [...prev, data];
                }
                return prev;
            });
        } else {
            // If it's not identifiable as a specific candidate object, log it.
            console.log('Received generic message or unrecognized data structure:', data);
            // Potentially, this could be where the final team is sent if not using custom event.
            // If `data.dreamTeam` exists, it's the final team.
            if(data.dreamTeam && Array.isArray(data.dreamTeam)) {
                console.log('Final Dream Team received via onmessage:', data.dreamTeam);
                setDreamTeam(data.dreamTeam);
                setSseStatus('Final team received');
                // Optionally stop the stream if this is the definitive end
                // handleStopStream();
            } else if(data.id && data.name && data.skills) { // Heuristic for a candidate
                 setStreamingCandidates((prev) => {
                    if (!prev.find(c => c.id === data.id)) {
                        return [...prev, data];
                    }
                    return prev;
                });
            }
        }
      } catch (e) {
        console.error('Failed to parse message data:', event.data, e);
        setError('Error processing data from stream.');
      }
    };

    // Specific listener for the final dream team
    eventSourceRef.current.addEventListener('dreamTeam', (event) => {
        console.log('Custom event "dreamTeam" received:', event.data);
        setIsLoading(false);
        try {
            const finalTeam = JSON.parse(event.data);
            setDreamTeam(finalTeam);
            setSseStatus('Final team received');
            // Stream might or might not end here, depends on backend.
            // If it also signals end-of-stream, that handler will take care of closing.
        } catch (e) {
            console.error('Failed to parse dreamTeam event data:', e);
            setError('Error processing final team data.');
        }
    });

    eventSourceRef.current.addEventListener('end-of-stream', (event) => {
      console.log('End of stream event received:', event.data);
      setSseStatus('Ended');
      setIsLoading(false);
      setIsStreaming(false);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (streamingCandidates.length === 0 && dreamTeam.length === 0) {
        // setError('No candidates found for the specified criteria.');
        // This message might be better handled based on sseStatus
      }
    });

    eventSourceRef.current.onerror = (err) => {
      console.error('EventSource failed:', err);
      setError('Connection to candidate stream failed. The server might be down or busy.');
      setIsLoading(false);
      setIsStreaming(false);
      setSseStatus('Error');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };

    return () => {
      console.log('Cleaning up DreamTeamBuilder SSE connection.');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setIsLoading(false);
      setIsStreaming(false);
    };
  }, [isStreaming, skills, teamSize]); // Effect depends on these to re-initiate stream if they change WHILE isStreaming is true (or becomes true)

  const addCandidateToDreamTeam = (candidate) => {
    if (dreamTeam.length < teamSize && !dreamTeam.find(member => member.id === candidate.id)) {
      setDreamTeam(prevTeam => [...prevTeam, candidate]);
      setError(null); // Clear any previous error like "Team full"
    } else if (dreamTeam.length >= teamSize) {
      setError(`Team is full. Maximum ${teamSize} members allowed.`);
    }
  };

  return (
    <div className="dream-team-builder">
      <header className="builder-header">
        <h1>Build Your Dream Team</h1>
        <p>Enter desired skills and team size to find candidates.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      <p className="sse-status-message">Status: {sseStatus}</p>

      <section className="controls-section">
        <SkillInput skills={skills} setSkills={setSkills} disabled={isStreaming || isLoading} />
        <TeamSizeSelector teamSize={teamSize} setTeamSize={setTeamSize} disabled={isStreaming || isLoading} />

        {!isStreaming ? (
          <button
            onClick={handleStartStream}
            disabled={isLoading || !skills.trim()}
            className="control-button start-button"
          >
            {isLoading ? 'Initializing...' : 'Build My Dream Team'}
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            className="control-button stop-button"
          >
            Stop Streaming
          </button>
        )}
      </section>

      {isStreaming && isLoading && streamingCandidates.length === 0 && (
        <p className="loading-message">Connecting to candidate stream...</p>
      )}

      {!isLoading && isStreaming && streamingCandidates.length === 0 && sseStatus === 'Connected' && (
        <p className="loading-message">Waiting for candidates to arrive...</p>
      )}


      <section className="results-section">
        <div className="streaming-candidates-container">
          <h2>Available Candidates ({streamingCandidates.length})</h2>
          {(!isStreaming && !isLoading && streamingCandidates.length === 0 && skills.trim() && sseStatus !== 'Idle' && sseStatus !== 'Connecting...') && (
            <p>No candidates found for this search, or stream ended.</p>
          )}
           {streamingCandidates.length > 0 ? (
            <div className="candidates-grid">
              {streamingCandidates.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onAddToTeam={addCandidateToDreamTeam}
                  isAdded={dreamTeam.some(member => member.id === candidate.id)}
                  canAdd={dreamTeam.length < teamSize}
                />
              ))}
            </div>
          ) : (
             !isLoading && !isStreaming && sseStatus !== 'Idle' && sseStatus !== 'Connecting...' && <p>Enter skills and start building to see candidates.</p>
          )}
        </div>

        <DreamTeamDisplay dreamTeam={dreamTeam} teamSize={teamSize} />
      </section>
    </div>
  );
};

export default DreamTeamBuilder;
