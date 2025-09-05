/* eslint-env browser */
/* exported PaginationController */

/**
 * @fileoverview
 * Reusable pagination controller for managing paginated data display.
 * Extracted from vulnerability-manager.js as part of modularization effort.
 * 
 * This class provides:
 * - Pagination logic and state management
 * - Dynamic UI generation with Bootstrap styling
 * - Page size selection and navigation controls
 * - Smart page number display with ellipsis for large datasets
 * 
 * @version 1.0.0
 * @author HexTrackr Team
 * @date 2025-09-05
 */

/**
 * PaginationController - Handles pagination logic and UI generation
 * 
 * Usage:
 * ```javascript
 * const pagination = new PaginationController(12, [6, 12, 24, 48]);
 * pagination.setTotalItems(150);
 * pagination.renderPaginationControls('pagination-container', 
 *   () => renderCurrentPage(), 
 *   () => renderCurrentPage()
 * );
 * ```
 */
class PaginationController {
    constructor(defaultPageSize = 12, availableSizes = [6, 12, 24, 48, 64, 96]) {
        this.pageSize = defaultPageSize;
        this.currentPage = 1;
        this.availableSizes = availableSizes;
        this.totalItems = 0;
    }

    setTotalItems(count) {
        this.totalItems = count;
        // Reset to page 1 if current page is out of bounds
        const maxPage = this.getTotalPages();
        if (this.currentPage > maxPage && maxPage > 0) {
            this.currentPage = 1;
        }
    }

    getTotalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    getCurrentPageData(items) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return items.slice(startIndex, endIndex);
    }

    setPageSize(size) {
        const validSize = this.availableSizes.includes(parseInt(size)) ? parseInt(size) : this.availableSizes[0];
        this.pageSize = validSize;
        this.currentPage = 1; // Reset to first page when changing page size
    }

    setCurrentPage(page) {
        const pageNum = parseInt(page);
        const maxPage = this.getTotalPages();
        if (pageNum >= 1 && pageNum <= maxPage) {
            this.currentPage = pageNum;
        }
    }

    getPageInfo() {
        const startItem = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
        
        return {
            currentPage: this.currentPage,
            totalPages: this.getTotalPages(),
            pageSize: this.pageSize,
            totalItems: this.totalItems,
            startItem,
            endItem,
            availableSizes: this.availableSizes
        };
    }

    renderPaginationControls(containerId, onPageChange, onPageSizeChange) {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        const info = this.getPageInfo();
        
        if (info.totalItems === 0) {
            container.innerHTML = "";
            return;
        }

        const prevDisabled = info.currentPage === 1 ? "disabled" : "";
        const nextDisabled = info.currentPage === info.totalPages ? "disabled" : "";

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div class="pagination-info">
                    <span class="text-muted">
                        Showing ${info.startItem} to ${info.endItem} of ${info.totalItems} items
                    </span>
                </div>
                
                <div class="d-flex align-items-center gap-3 flex-wrap">
                    <div class="d-flex align-items-center gap-2">
                        <label for="${containerId}PageSize" class="form-label mb-0 text-muted small">Items per page:</label>
                        <select id="${containerId}PageSize" class="form-select form-select-sm" style="width: auto;">
                            ${info.availableSizes.map(size => 
                                `<option value="${size}" ${size === info.pageSize ? "selected" : ""}>${size}</option>`
                            ).join("")}
                        </select>
                    </div>
                    
                    <nav aria-label="Card pagination">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item ${prevDisabled}">
                                <button class="page-link" data-page="1" ${prevDisabled ? "disabled" : ""}>
                                    <i class="fas fa-angle-double-left"></i>
                                </button>
                            </li>
                            <li class="page-item ${prevDisabled}">
                                <button class="page-link" data-page="${info.currentPage - 1}" ${prevDisabled ? "disabled" : ""}>
                                    <i class="fas fa-angle-left"></i>
                                </button>
                            </li>
                            
                            ${this.generatePageNumbers(info).map(page => {
                                if (page === "...") {
                                    return "<li class=\"page-item disabled\"><span class=\"page-link\">...</span></li>";
                                }
                                const isActive = page === info.currentPage ? "active" : "";
                                return `<li class="page-item ${isActive}">
                                    <button class="page-link" data-page="${page}">${page}</button>
                                </li>`;
                            }).join("")}
                            
                            <li class="page-item ${nextDisabled}">
                                <button class="page-link" data-page="${info.currentPage + 1}" ${nextDisabled ? "disabled" : ""}>
                                    <i class="fas fa-angle-right"></i>
                                </button>
                            </li>
                            <li class="page-item ${nextDisabled}">
                                <button class="page-link" data-page="${info.totalPages}" ${nextDisabled ? "disabled" : ""}>
                                    <i class="fas fa-angle-double-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;

        // Add event listeners
        const pageSizeSelect = container.querySelector(`#${containerId}PageSize`);
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener("change", (e) => {
                this.setPageSize(e.target.value);
                onPageSizeChange();
            });
        }

        container.querySelectorAll(".page-link[data-page]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                if (!btn.disabled) {
                    this.setCurrentPage(btn.getAttribute("data-page"));
                    onPageChange();
                }
            });
        });
    }

    generatePageNumbers(info) {
        const pages = [];
        const current = info.currentPage;
        const total = info.totalPages;
        
        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            if (current <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(total);
            } else if (current >= total - 3) {
                pages.push(1);
                pages.push("...");
                for (let i = total - 4; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = current - 1; i <= current + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(total);
            }
        }
        
        return pages;
    }
}