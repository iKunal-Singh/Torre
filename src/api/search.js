// src/api/search.js
const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// Define the POST /api/search route
router.post('/search', searchController.searchEntities);

module.exports = router;
