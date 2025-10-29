/**
 * Hostname Routes
 * HEX-350: Hostname parsing API endpoints
 *
 * Routes:
 * - GET /api/hostname/parse/:hostname - Parse hostname using HostnameParserService
 */

const express = require("express");
const HostnameController = require("../controllers/hostnameController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Hostname parsing endpoint
router.get("/parse/:hostname", requireAuth, HostnameController.parseHostname);

module.exports = router;
