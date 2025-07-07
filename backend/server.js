const http = require('http');

const PORT = 3001;

// Sample user profiles data
const profiles = [
  { id: 1, name: 'John Doe', occupation: 'Software Engineer' },
  { id: 2, name: 'Jane Smith', occupation: 'Product Manager' },
  { id: 3, name: 'Alice Johnson', occupation: 'UX Designer' },
  { id: 4, name: 'Bob Brown', occupation: 'Data Scientist' },
  { id: 5, name: 'Charlie Davis', occupation: 'DevOps Engineer' },
];

let clientIdCounter = 0;
const clients = {}; // Store connected clients

const server = http.createServer((req, res) => {
  if (req.url === '/events' && req.method === 'GET') {
    const clientId = clientIdCounter++;
    console.log(`Client ${clientId} connected`);

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Allow requests from any origin (for development)
    });

    clients[clientId] = res;

    // Send an initial connection message (optional)
    res.write('event: connected\ndata: You are connected!\n\n');

    // Simulate streaming data
    let profileIndex = 0;
    const intervalId = setInterval(() => {
      if (profileIndex < profiles.length) {
        const profile = profiles[profileIndex];
        const data = JSON.stringify(profile);
        res.write(`data: ${data}\n\n`);
        console.log(`Sent profile ${profile.id} to client ${clientId}`);
        profileIndex++;
      } else {
        // Send an end-of-stream message (custom event)
        res.write('event: end-of-stream\ndata: No more profiles\n\n');
        console.log(`Sent end-of-stream to client ${clientId}`);
        // Keep the connection open for potential future updates or close it
        // For this example, we'll just stop sending more of these profiles
        // In a real app, you might keep it open or have a specific signal to close.
      }
    }, 2000); // Send a profile every 2 seconds

    // Handle client disconnect
    req.on('close', () => {
      console.log(`Client ${clientId} disconnected`);
      clearInterval(intervalId); // Stop sending data to this client
      delete clients[clientId]; // Remove client from the list
      res.end(); // Ensure the response is properly ended
    });

  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SSE Server is running. Connect to /events to get data.');
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`SSE server listening on port ${PORT}`);
});
