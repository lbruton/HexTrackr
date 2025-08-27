import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * HexTrackr Documentation Sidebar Configuration
 * 
 * This configuration creates organized documentation sections for:
 * - API Reference: All endpoints, request/response formats
 * - Architecture: System design, data flow, component interactions  
 * - Frameworks: What's used where, version tracking
 * - Sprint Documentation: Task tracking, code review findings
 */
const sidebars: SidebarsConfig = {
  // API Reference Sidebar - Comprehensive endpoint documentation
  apiSidebar: [
    'api/overview',
    {
      type: 'category',
      label: 'Ticket Management',
      items: ['api/tickets/endpoints'],
    },
    {
      type: 'category',
      label: 'Vulnerability Management', 
      items: ['api/vulnerabilities/endpoints'],
    },
  ],

  // Architecture Documentation Sidebar
  architectureSidebar: [
    {
      type: 'category',
      label: 'Function Reference',
      items: ['architecture/functions/overview', 'architecture/functions/tickets'],
    },
  ],

  // Framework and Technology Tracking Sidebar
  frameworksSidebar: [
    'frameworks/overview',
    {
      type: 'category',
      label: 'Frontend Frameworks',
      items: ['frameworks/frontend/tabler-io', 'frameworks/frontend/bootstrap-usage', 'frameworks/frontend/apexcharts', 'frameworks/frontend/ag-grid'],
    },
  ],

  // Sprint Documentation and Code Review Sidebar
  sprintsSidebar: [
    'sprints/current-sprint',
    {
      type: 'category',
      label: 'Code Review',
      items: ['sprints/code-review/bugs-found'],
    },
    {
      type: 'category',
      label: 'Handoff Documentation',
      items: ['sprints/handoffs/template'],
    },
    {
      type: 'category',
      label: 'Roadmap Updates',
      items: ['sprints/roadmaps/strategic'],
    },
  ],
};

export default sidebars;
