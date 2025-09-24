/**
 * roadmap-table-sorter.js
 * Adds sorting functionality to ROADMAP specification tables
 */

(function() {
    "use strict";

    /**
     * Initialize table sorting when DOM is ready
     */
    function initTableSorter() {
        // Find the specifications table
        const tables = document.querySelectorAll("table");
        console.log("[RoadmapSorter] Found " + tables.length + " tables");
        
        tables.forEach(table => {
            // Check if this is the specifications table
            const headers = table.querySelectorAll("th");
            if (headers.length >= 5 && 
                headers[0].textContent === "Spec" && 
                headers[1].textContent === "Title" &&
                headers[2].textContent === "Progress" &&
                headers[3].textContent === "Priority") {
                
                console.log("[RoadmapSorter] Initializing sortable table");
                makeTableSortable(table);
            }
        });
    }

    /**
     * Make a table sortable by clicking headers
     */
    function makeTableSortable(table) {
        // Check if already initialized
        if (table.getAttribute("data-sortable") === "true") {
            console.log("[RoadmapSorter] Table already sortable, skipping");
            return;
        }
        
        const headers = table.querySelectorAll("thead th");
        const tbody = table.querySelector("tbody");
        
        if (!tbody) {
            console.log("[RoadmapSorter] No tbody found, skipping");
            return;
        }
        
        // Mark as initialized
        table.setAttribute("data-sortable", "true");
        
        // Add sorting indicators and click handlers
        headers.forEach((header, index) => {
            // Skip the "Next Tasks" column (too complex to sort)
            if (index === 4) {return;}
            
            header.style.cursor = "pointer";
            header.style.userSelect = "none";
            header.setAttribute("data-sort", "none");
            
            // Add visual indicator
            const indicator = document.createElement("span");
            indicator.style.marginLeft = "5px";
            indicator.style.fontSize = "0.8em";
            indicator.style.opacity = "0.5";
            indicator.textContent = "↕";
            header.appendChild(indicator);
            
            header.addEventListener("click", () => {
                console.log("[RoadmapSorter] Sorting by column", index);
                sortTable(table, index, header, indicator);
            });
        });
        
        console.log("[RoadmapSorter] Table is now sortable");
    }

    /**
     * Sort table by column
     */
    function sortTable(table, columnIndex, header, indicator) {
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const currentSort = header.getAttribute("data-sort");
        
        // Determine new sort direction
        const newSort = currentSort === "asc" ? "desc" : "asc";
        
        // Reset all headers
        table.querySelectorAll("th").forEach(th => {
            th.setAttribute("data-sort", "none");
            const ind = th.querySelector("span");
            if (ind && ind !== indicator) {
                ind.textContent = "↕";
                ind.style.opacity = "0.5";
            }
        });
        
        // Update current header
        header.setAttribute("data-sort", newSort);
        indicator.textContent = newSort === "asc" ? "↑" : "↓";
        indicator.style.opacity = "1";
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = getCellValue(a, columnIndex);
            const bValue = getCellValue(b, columnIndex);
            
            let comparison = 0;
            
            if (columnIndex === 0) {
                // Spec column - numeric sort
                comparison = parseInt(aValue) - parseInt(bValue);
            } else if (columnIndex === 2) {
                // Progress column - sort by percentage
                const aMatch = aValue.match(/\((\d+)%\)/);
                const bMatch = bValue.match(/\((\d+)%\)/);
                const aPercent = aMatch ? parseInt(aMatch[1]) : 0;
                const bPercent = bMatch ? parseInt(bMatch[1]) : 0;
                comparison = aPercent - bPercent;
            } else if (columnIndex === 3) {
                // Priority column - custom order
                const priorityOrder = {
                    "🔴 CRIT": 1,
                    "🟠 HIGH": 2,
                    "🟡 MED": 3,
                    "⚪ NORM": 4,
                    "🔵 LOW": 5
                };
                const aPriority = priorityOrder[aValue] || 99;
                const bPriority = priorityOrder[bValue] || 99;
                comparison = aPriority - bPriority;
            } else {
                // Title column - alphabetical sort
                comparison = aValue.localeCompare(bValue);
            }
            
            return newSort === "asc" ? comparison : -comparison;
        });
        
        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
    }

    /**
     * Get cell value for sorting
     */
    function getCellValue(row, columnIndex) {
        const cell = row.cells[columnIndex];
        return cell ? cell.textContent.trim() : "";
    }

    // Initialize when DOM is ready or when content changes
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTableSorter);
    } else {
        // For dynamic content loading
        setTimeout(initTableSorter, 500);
    }

    // Also watch for content changes (for SPA navigation)
    const observer = new MutationObserver((mutations) => {
        // Debounce to avoid multiple calls
        clearTimeout(window.tableSorterTimeout);
        window.tableSorterTimeout = setTimeout(() => {
            initTableSorter();
        }, 500);
    });

    // Start observing the content container
    const contentContainer = document.getElementById("content-container");
    if (contentContainer) {
        observer.observe(contentContainer, { 
            childList: true, 
            subtree: true 
        });
    }
    
    // Also try to initialize periodically in case the observer misses it
    let retryCount = 0;
    const retryInterval = setInterval(() => {
        const tables = document.querySelectorAll("table");
        if (tables.length > 0) {
            initTableSorter();
            clearInterval(retryInterval);
        }
        retryCount++;
        if (retryCount > 20) { // Stop after 10 seconds
            clearInterval(retryInterval);
        }
    }, 500);

})();