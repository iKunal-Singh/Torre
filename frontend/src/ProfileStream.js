import React, { useState, useEffect } from 'react';

const ProfileStream = () => {
  const [profiles, setProfiles] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/events');

    eventSource.onopen = () => {
      setConnectionStatus('Connected');
      console.log('SSE connection opened.');
    };

    eventSource.onmessage = (event) => {
      try {
        const profile = JSON.parse(event.data);
        setProfiles((prevProfiles) => [...prevProfiles, profile]);
      } catch (error) {
        console.error('Failed to parse message data:', event.data, error);
      }
    };

    eventSource.addEventListener('end-of-stream', (event) => {
      console.log('End of stream event received:', event.data);
      setConnectionStatus('Stream ended. No more profiles.');
      eventSource.close(); // Close the connection as the server indicated no more data
    });

    eventSource.addEventListener('connected', (event) => {
      console.log('Server connected event:', event.data);
      // You can use this to confirm connection if needed
    });

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setConnectionStatus('Error connecting. Will attempt to reconnect shortly...');
      // EventSource has built-in reconnection logic.
      // It will attempt to reconnect automatically after a few seconds.
      // You might want to implement a more sophisticated backoff strategy or UI feedback here.
      // For now, we just log the error. If it can't reconnect, it will keep trying.
      // If the server is permanently down, eventSource.close() might be called here after some attempts.
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
      console.log('Closing SSE connection.');
      eventSource.close();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <div>
      <h1>Live User Profiles</h1>
      <p>Connection Status: {connectionStatus}</p>
      {profiles.length === 0 && connectionStatus === 'Connected' && <p>Waiting for profiles...</p>}
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            <strong>{profile.name}</strong> ({profile.occupation})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileStream;
