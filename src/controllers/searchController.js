// src/controllers/searchController.js
const searchService = require('../services/searchService');

/**
 * Controller for handling search requests.
 * It proxies the request to an external API and streams the response.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
async function searchEntities(req, res) {
  try {
    // Extract payload from the request body
    const { query, identityType, limit, meta, torreGrams } = req.body;
    const payload = { query, identityType, limit, meta, torreGrams };

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush the headers to establish the connection

    // Call the service to handle the proxying and streaming
    await searchService.proxySearchStream(payload, res);
  } catch (error) {
    console.error('Error in searchController:', error);
    // If an error occurs before streaming starts, send a normal HTTP error
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process search request' });
    } else {
      // If streaming has started, attempt to send an error event
      // and then end the stream.
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'An error occurred during streaming.' })}\n\n`);
      res.end();
    }
  }
}

module.exports = {
  searchEntities,
};
