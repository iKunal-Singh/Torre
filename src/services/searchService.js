// src/services/searchService.js
const fetch = require('node-fetch');
const { JSONParser } = require('@streamparser/json');

const EXTERNAL_API_URL = 'https://torre.ai/api/entities/_searchStream';

/**
 * Proxies the search request to an external API and streams the newline-delimited JSON response.
 * Each JSON object is parsed and sent to the client as a Server-Sent Event.
 * @param {object} payload - The payload to send to the external API.
 * @param {object} clientResponseStream - The Express response object to stream data to.
 */
async function proxySearchStream(payload, clientResponseStream) {
  try {
    // Make a POST request to the external API
    const apiResponse = await fetch(EXTERNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      // Handle non-successful API responses
      const errorBody = await apiResponse.text();
      console.error(`External API error: ${apiResponse.status} ${apiResponse.statusText}`, errorBody);
      clientResponseStream.write(`event: error\ndata: ${JSON.stringify({ message: `External API error: ${apiResponse.status}` })}\n\n`);
      clientResponseStream.end();
      return;
    }

    // Create a JSON parser for newline-delimited JSON
    const parser = new JSONParser({
      stringBufferSize: undefined, // Use default buffer size
      paths: ['$.*'], // Parse each object in the stream
      keepStack: false, // Don't keep the stack
      jsonStreaming: true, // Enable newline-delimited JSON streaming
    });

    parser.onValue = ({ value }) => {
      // When a JSON object is parsed, send it as an SSE data event
      try {
        clientResponseStream.write(`data: ${JSON.stringify(value)}\n\n`);
      } catch (e) {
        // This can happen if the client closes the connection prematurely
        console.error('Error writing to client stream, client might have disconnected:', e);
        // Clean up parser and potentially the fetch stream if possible
        parser.end();
        if (apiResponse.body && typeof apiResponse.body.destroy === 'function') {
          apiResponse.body.destroy();
        }
      }
    };

    parser.onError = (err) => {
      console.error('Error parsing JSON stream:', err);
      if (!clientResponseStream.writableEnded) {
        clientResponseStream.write(`event: error\ndata: ${JSON.stringify({ message: 'Error parsing data stream.' })}\n\n`);
        // We might not want to end the stream immediately,
        // as more valid data might come. Or we might decide to end it.
        // For now, let's log and continue, assuming the stream might recover or errors are isolated.
      }
    };

    parser.onEnd = () => {
        if (!clientResponseStream.writableEnded) {
            clientResponseStream.end();
        }
    };

    // Pipe the API response body to the parser
    if (apiResponse.body) {
      apiResponse.body.on('data', chunk => {
        if (!clientResponseStream.writableEnded) {
          parser.write(chunk);
        } else {
            // If client stream is ended, stop processing.
            if (apiResponse.body && typeof apiResponse.body.destroy === 'function') {
              apiResponse.body.destroy(); // Stop fetching more data
            }
        }
      });
      apiResponse.body.on('end', () => {
        if (!clientResponseStream.writableEnded) {
          parser.end(); // Signal the end of the stream to the parser
        }
      });
      apiResponse.body.on('error', (err) => {
        console.error('Error reading from external API stream:', err);
        if (!clientResponseStream.writableEnded) {
          clientResponseStream.write(`event: error\ndata: ${JSON.stringify({ message: 'Error reading from external API.' })}\n\n`);
          clientResponseStream.end();
        }
      });
    } else {
      console.error('No body in API response');
      if (!clientResponseStream.writableEnded) {
        clientResponseStream.write(`event: error\ndata: ${JSON.stringify({ message: 'No data from external API.' })}\n\n`);
        clientResponseStream.end();
      }
    }

  } catch (error) {
    console.error('Error in proxySearchStream:', error);
    if (!clientResponseStream.writableEnded) {
      clientResponseStream.write(`event: error\ndata: ${JSON.stringify({ message: 'Failed to connect to the search service.' })}\n\n`);
      clientResponseStream.end();
    }
  }
}

module.exports = {
  proxySearchStream,
};
