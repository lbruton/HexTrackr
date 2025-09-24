/**
 * Template Controller
 * Handles HTTP requests for email template operations.
 * Part of v1.0.21 Template Editor feature implementation.
 *
 * Provides CRUD operations for customizable email templates with:
 * - Get all templates
 * - Get specific template by ID or name
 * - Update template content
 * - Reset template to default
 *
 * @module TemplateController
 * @version 1.0.21
 */

const TemplateService = require("../services/templateService");

class TemplateController {
    constructor() {
        this.templateService = new TemplateService();
    }

    /**
     * Initialize controller with database connection
     * Called from server.js during setup
     * @param {sqlite3.Database} database - Database connection
     */
    static initialize(database) {
        if (!TemplateController.instance) {
            TemplateController.instance = new TemplateController();
        }
        TemplateController.instance.templateService.initialize(database);
        return TemplateController.instance;
    }

    /**
     * Get instance (singleton pattern)
     * @returns {TemplateController} Controller instance
     */
    static getInstance() {
        if (!TemplateController.instance) {
            throw new Error("TemplateController not initialized. Call initialize() first.");
        }
        return TemplateController.instance;
    }

    /**
     * Get all email templates
     * GET /api/templates
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async getAllTemplates(req, res) {
        try {
            const templates = await this.templateService.getAllTemplates();
            res.json({
                success: true,
                data: templates,
                count: templates.length
            });
        } catch (error) {
            console.error("Error fetching templates:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch templates",
                details: error.message
            });
        }
    }

    /**
     * Get specific template by ID
     * GET /api/templates/:id
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async getTemplateById(req, res) {
        try {
            const { id } = req.params;
            const template = await this.templateService.getTemplateById(id);

            if (!template) {
                return res.status(404).json({
                    success: false,
                    error: "Template not found"
                });
            }

            res.json({
                success: true,
                data: template
            });
        } catch (error) {
            console.error("Error fetching template:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch template",
                details: error.message
            });
        }
    }

    /**
     * Get template by name (for frontend ease of use)
     * GET /api/templates/by-name/:name
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async getTemplateByName(req, res) {
        try {
            const { name } = req.params;
            const template = await this.templateService.getTemplateByName(name);

            if (!template) {
                return res.status(404).json({
                    success: false,
                    error: "Template not found"
                });
            }

            res.json({
                success: true,
                data: template
            });
        } catch (error) {
            console.error("Error fetching template by name:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch template",
                details: error.message
            });
        }
    }

    /**
 * Update template content
 * PUT /api/templates/:id
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
    async updateTemplate(req, res) {
        try {
            const { id } = req.params;
            const { template_content, description, category, template_name } = req.body;

            if (!template_content) {
                return res.status(400).json({
                    success: false,
                    error: "template_content is required"
                });
            }

            // Validate template content (basic bracket matching)
            const validationResult = this.templateService.validateTemplate(template_content);
            if (!validationResult.valid) {
                return res.status(400).json({
                    success: false,
                    error: "Template validation failed",
                    details: validationResult.errors
                });
            }

            const updatedTemplate = await this.templateService.updateTemplate(id, {
                template_content,
                description,
                category,
                template_name
            });

            if (!updatedTemplate) {
                return res.status(404).json({
                    success: false,
                    error: "Template not found"
                });
            }

            res.json({
                success: true,
                data: updatedTemplate,
                message: "Template updated successfully"
            });
        } catch (error) {
            console.error("Error updating template:", error);
            res.status(500).json({
                success: false,
                error: "Failed to update template",
                details: error.message
            });
        }
    }

    /**
     * Create template content
     * POST /api/templates
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async createTemplate(req, res) {
        try {
            const { name, template_content, default_content, variables, category, description } = req.body;

            if (!name || !template_content) {
                return res.status(400).json({
                    success: false,
                    error: "name and template_content are required"
                });
            }

            const createdTemplate = await this.templateService.createTemplate({
                name,
                template_content,
                default_content,
                variables,
                category,
                description
            });

            res.status(201).json({
                success: true,
                data: createdTemplate,
                message: "Template created successfully"
            });
        } catch (error) {
            console.error("Error creating template:", error);
            if (error.message && error.message.includes("UNIQUE")) {
                return res.status(409).json({
                    success: false,
                    error: "Template already exists",
                    details: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: "Failed to create template",
                details: error.message
            });
        }
    }

    /**
     * Reset template to default content
     * POST /api/templates/:id/reset
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async resetTemplate(req, res) {
        try {
            const { id } = req.params;

            const resetTemplate = await this.templateService.resetTemplateToDefault(id);

            if (!resetTemplate) {
                return res.status(404).json({
                    success: false,
                    error: "Template not found"
                });
            }

            res.json({
                success: true,
                data: resetTemplate,
                message: "Template reset to default successfully"
            });
        } catch (error) {
            console.error("Error resetting template:", error);
            res.status(500).json({
                success: false,
                error: "Failed to reset template",
                details: error.message
            });
        }
    }

    /**
     * Process template with ticket data for preview
     * POST /api/templates/:id/preview
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     */
    async previewTemplate(req, res) {
        try {
            const { id } = req.params;
            const { ticketData } = req.body;

            if (!ticketData) {
                return res.status(400).json({
                    success: false,
                    error: "ticketData is required for preview"
                });
            }

            const processedTemplate = await this.templateService.processTemplate(id, ticketData);

            if (!processedTemplate) {
                return res.status(404).json({
                    success: false,
                    error: "Template not found"
                });
            }

            res.json({
                success: true,
                data: {
                    processed_content: processedTemplate
                }
            });
        } catch (error) {
            console.error("Error previewing template:", error);
            res.status(500).json({
                success: false,
                error: "Failed to preview template",
                details: error.message
            });
        }
    }
}

module.exports = TemplateController;
