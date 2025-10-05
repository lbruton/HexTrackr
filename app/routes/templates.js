/**
 * Template Routes
 * Part of v1.0.21 Template Editor feature implementation.
 *
 * Routes:
 * - GET /api/templates - List all templates
 * - GET /api/templates/:id - Get specific template by ID
 * - GET /api/templates/by-name/:name - Get template by name
 * - PUT /api/templates/:id - Update template content
 * - POST /api/templates/:id/reset - Reset template to default
 * - POST /api/templates/:id/preview - Preview template with ticket data
 *
 * @module TemplateRoutes
 * @version 1.0.21
 */

const express = require("express");
const TemplateController = require("../controllers/templateController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Get all templates
 * GET /api/templates
 */
router.get("/", requireAuth, async (req, res) => {
    const controller = TemplateController.getInstance();
    await controller.getAllTemplates(req, res);
});

/**
 * Create template
 * POST /api/templates
 */
router.post("/", requireAuth, async (req, res) => {
    const controller = TemplateController.getInstance();
    await controller.createTemplate(req, res);
});

/**
 * Get template by name (convenience endpoint for frontend)
 * GET /api/templates/by-name/:name
 */
router.get("/by-name/:name", requireAuth, async (req, res) => {
    const controller = TemplateController.getInstance();
    await controller.getTemplateByName(req, res);
});

/**
 * Get template by ID
 * GET /api/templates/:id
 */
router.get("/:id", requireAuth, async (req, res) => {
    const controller = TemplateController.getInstance();
    await controller.getTemplateById(req, res);
});

/**
 * Update template content
 * PUT /api/templates/:id
 * Body: { template_content: string, description?: string }
 */
router.put("/:id", requireAuth, async (req, res) => {
    const controller = TemplateController.getInstance();
    await controller.updateTemplate(req, res);
});

/**
 * Reset template to default content
 * POST /api/templates/:id/reset
 */
router.post("/:id/reset", requireAuth, async (req, res) => {
    const controller = TemplateController.getInstance();
    await controller.resetTemplate(req, res);
});

/**
 * Preview template with ticket data
 * POST /api/templates/:id/preview
 * Body: { ticketData: object }
 */
router.post("/:id/preview", requireAuth, async (req, res) => {
    const controller = TemplateController.getInstance();
    await controller.previewTemplate(req, res);
});

module.exports = router;
