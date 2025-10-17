/* eslint-env browser */
/* global agGrid */

/**
 * HexTrackr Documentation Table Converter
 * Transforms HTML tables into AG-Grid for consistent styling and functionality
 */
class DocumentationTableConverter {
    constructor() {
        this.gridInstances = [];
        this.initialized = false;
    }

    /**
     * Initialize table conversion for all tables in the documentation
     */
    init() {
        if (typeof agGrid === "undefined") {
            console.warn("AG-Grid not available, keeping HTML tables");
            return;
        }

        this.convertAllTables();
        this.initialized = true;
        console.log("Documentation Table Converter initialized");
    }

    /**
     * Convert all HTML tables in the content area to AG-Grid
     */
    convertAllTables() {
        const contentArea = document.getElementById("contentArea");
        if (!contentArea) {return;}

        const tables = contentArea.querySelectorAll("table");
        tables.forEach((table, index) => {
            this.convertTableToGrid(table, index);
        });
    }

    /**
     * Convert a single HTML table to AG-Grid
     * @param {HTMLTableElement} table - The table element to convert
     * @param {number} index - Table index for unique ID
     */
    convertTableToGrid(table, index) {
        try {
            // Extract table data
            const { columnDefs, rowData } = this.extractTableData(table);

            if (columnDefs.length === 0 || rowData.length === 0) {
                console.log(` Skipping empty table ${index}`);
                return;
            }

            // Create grid container
            const gridContainer = document.createElement("div");
            gridContainer.id = `docs-grid-${index}`;
            gridContainer.className = "ag-theme-quartz docs-grid";
            gridContainer.style.height = Math.min(400, (rowData.length + 1) * 42 + 50) + "px";
            gridContainer.style.width = "100%";

            // Apply dark theme if needed
            if (document.documentElement.getAttribute("data-bs-theme") === "dark") {
                gridContainer.classList.add("ag-theme-quartz-dark");
            }

            // Replace table with grid container
            table.parentNode.insertBefore(gridContainer, table);
            table.style.display = "none"; // Keep original table hidden as fallback

            // Create AG-Grid
            const gridOptions = {
                columnDefs: columnDefs,
                rowData: rowData,
                defaultColDef: {
                    sortable: true,
                    filter: true,
                    resizable: true,
                    minWidth: 100
                },
                animateRows: true,
                // enableRangeSelection: true, // Enterprise feature - removed
                suppressMovableColumns: false,
                suppressMenuHide: true,
                onGridReady: (params) => {
                    console.log(` Grid ${index} ready with ${rowData.length} rows`);
                    // Ensure columns fill available width
                    setTimeout(() => {
                        if (params.api) {
                            params.api.sizeColumnsToFit();
                        }
                    }, 100);
                },
                onGridSizeChanged: (params) => {
                    // Resize columns when grid container changes size
                    if (params.api) {
                        params.api.sizeColumnsToFit();
                    }
                }
            };

            const gridApi = agGrid.createGrid(gridContainer, gridOptions);

            // Store grid instance for cleanup
            this.gridInstances.push({
                id: `docs-grid-${index}`,
                api: gridApi,
                originalTable: table
            });

            console.log(` Converted table ${index} to AG-Grid (${rowData.length} rows, ${columnDefs.length} columns)`);

        } catch (error) {
            console.error(` Failed to convert table ${index}:`, error);
        }
    }

    /**
     * Extract column definitions and row data from HTML table
     * @param {HTMLTableElement} table - The table to extract data from
     * @returns {Object} Object containing columnDefs and rowData
     */
    extractTableData(table) {
        const columnDefs = [];
        const rowData = [];

        // Extract headers
        const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
        if (!headerRow) {return { columnDefs: [], rowData: [] };}

        const headers = Array.from(headerRow.querySelectorAll("th, td")).map((cell, index, array) => {
            const headerText = cell.textContent.trim();
            const columnDef = {
                headerName: headerText,
                field: this.sanitizeFieldName(headerText),
                cellClass: "docs-cell",
                tooltipField: this.sanitizeFieldName(headerText),
                resizable: true,
                minWidth: 100
            };

            // Make the last column flexible to fill available space
            if (index === array.length - 1) {
                columnDef.flex = 1;
            }

            return columnDef;
        });

        columnDefs.push(...headers);

        // Extract data rows
        const dataRows = table.querySelectorAll("tbody tr, tr:not(:first-child)");
        dataRows.forEach(row => {
            const rowObj = {};
            const cells = row.querySelectorAll("td, th");

            cells.forEach((cell, cellIndex) => {
                if (columnDefs[cellIndex]) {
                    const fieldName = columnDefs[cellIndex].field;
                    const cellValue = cell.textContent.trim();

                    // Preserve HTML links
                    const link = cell.querySelector("a");
                    if (link) {
                        rowObj[fieldName] = {
                            text: cellValue,
                            link: link.href
                        };
                        // Update column definition to handle links
                        columnDefs[cellIndex].cellRenderer = this.linkCellRenderer;
                    } else {
                        rowObj[fieldName] = cellValue;
                    }
                }
            });

            if (Object.keys(rowObj).length > 0) {
                rowData.push(rowObj);
            }
        });

        return { columnDefs, rowData };
    }

    /**
     * Sanitize field names for AG-Grid compatibility
     * @param {string} fieldName - Raw field name
     * @returns {string} Sanitized field name
     */
    sanitizeFieldName(fieldName) {
        return fieldName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");
    }

    /**
     * Cell renderer for links
     * @param {Object} params - AG-Grid cell renderer params
     * @returns {string} HTML for the cell
     */
    linkCellRenderer(params) {
        if (params.value && typeof params.value === "object" && params.value.link) {
            return `<a href="${params.value.link}" target="_blank" rel="noopener noreferrer">${params.value.text}</a>`;
        }
        return params.value || "";
    }

    /**
     * Update grid themes when theme changes
     * @param {string} theme - 'light' or 'dark'
     */
    updateTheme(theme) {
        this.gridInstances.forEach(instance => {
            const container = document.getElementById(instance.id);
            if (container) {
                container.classList.remove("ag-theme-quartz", "ag-theme-quartz-dark");
                container.classList.add(theme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz");
            }
        });
    }

    /**
     * Clean up all grid instances
     */
    destroy() {
        this.gridInstances.forEach(instance => {
            if (instance.api && instance.api.destroy) {
                instance.api.destroy();
            }
            // Restore original table
            if (instance.originalTable) {
                instance.originalTable.style.display = "";
            }
        });
        this.gridInstances = [];
        this.initialized = false;
    }

    /**
     * Refresh grids after content changes
     */
    refresh() {
        if (this.initialized) {
            this.destroy();
            this.init();
        }
    }
}

// Global instance
window.DocumentationTableConverter = DocumentationTableConverter;