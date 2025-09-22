# v1.0.23 Ticket Filters - Implementation Tasks

## Implementation Overview

This feature will be implemented in 5 focused sessions, each targeting specific functionality with clear checkpoints. Each session should take 1-2 hours and include testing to ensure quality.

---

## Session 1: Card Click Infrastructure (1.5 hours)

### Prerequisites
- [ ] **Git Status Check**: Ensure working directory is clean
- [ ] **Commit Current Work**: If any uncommitted changes exist
  ```bash
  git add .
  git commit -m "docs: Update documentation for v1.0.22"
  ```
- [ ] **Create Feature Branch**:
  ```bash
  git checkout -b feature/v1.0.23-ticket-filters
  ```
- [ ] **Start Docker**: Ensure application runs on port 8989
  ```bash
  docker-compose up -d
  ```

### Task 1.1: Add CSS for Clickable Cards (30 minutes)

#### Files to Modify
- `/app/public/tickets2.html`

#### Tasks
- [ ] **Add CSS classes to statistics cards section** (around line 361)
  ```html
  <!-- Add this CSS in the <style> section around line 189 -->
  .stats-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 8px;
  }

  .stats-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .stats-card-active {
      border: 2px solid var(--hextrackr-primary, #206bc4);
      background: var(--hextrackr-surface-active, rgba(32, 107, 196, 0.05));
      transform: translateY(-1px);
  }

  [data-bs-theme="dark"] .stats-card:hover {
      box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
  }
  ```

- [ ] **Add stats-card class to each card**
  - Total Tickets card (line ~364): `<div class="card stats-card" data-filter-type="all">`
  - Open Tickets card (line ~384): `<div class="card stats-card" data-filter-type="open">`
  - Overdue card (line ~405): `<div class="card stats-card" data-filter-type="overdue">`
  - Completed card (line ~426): `<div class="card stats-card" data-filter-type="completed">`

#### Checkpoint 1.1
- [ ] Cards show pointer cursor on hover
- [ ] Hover effects work (slight lift and shadow)
- [ ] No console errors
- [ ] Dark theme hover effects work

### Task 1.2: Add Click Event Handlers (30 minutes)

#### Files to Modify
- `/app/public/tickets2.html`

#### Tasks
- [ ] **Add onclick handlers to each card div**
  ```html
  <!-- Total Tickets Card -->
  <div class="card stats-card" data-filter-type="all"
       onclick="window.ticketManager?.applyCardFilter('all')"
       role="button" tabindex="0"
       aria-label="Filter to show all tickets">

  <!-- Open Tickets Card -->
  <div class="card stats-card" data-filter-type="open"
       onclick="window.ticketManager?.applyCardFilter('open')"
       role="button" tabindex="0"
       aria-label="Filter to show open tickets">

  <!-- Overdue Card -->
  <div class="card stats-card" data-filter-type="overdue"
       onclick="window.ticketManager?.applyCardFilter('overdue')"
       role="button" tabindex="0"
       aria-label="Filter to show overdue tickets">

  <!-- Completed Card -->
  <div class="card stats-card" data-filter-type="completed"
       onclick="window.ticketManager?.applyCardFilter('completed')"
       role="button" tabindex="0"
       aria-label="Filter to show completed tickets">
  ```

- [ ] **Add keyboard event support**
  ```html
  <!-- Add this script before closing </body> tag -->
  <script>
  // Keyboard support for card filtering
  document.addEventListener('keydown', function(e) {
      if (e.target.classList.contains('stats-card') && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.target.click();
      }
  });
  </script>
  ```

#### Checkpoint 1.2
- [ ] Clicking cards calls `applyCardFilter()` function
- [ ] Keyboard (Enter/Space) works on focused cards
- [ ] Console shows function calls (even if undefined)
- [ ] Accessibility attributes are present

### Task 1.3: Create Basic Filter Function Stub (30 minutes)

#### Files to Modify
- `/app/public/scripts/pages/tickets.js`

#### Tasks
- [ ] **Add filter state property** (around line 50, in constructor)
  ```javascript
  constructor() {
      // ... existing code ...
      this.activeCardFilter = null; // 'all', 'open', 'overdue', 'completed'
  }
  ```

- [ ] **Add applyCardFilter method** (add after updateStatistics method, around line 1590)
  ```javascript
  /**
   * Apply card-based filter to tickets table.
   * Updates visual state and refreshes table display.
   *
   * @param {string} filterType - Type of filter: 'all', 'open', 'overdue', 'completed'
   * @returns {void}
   */
  applyCardFilter(filterType) {
      console.log(`Applying card filter: ${filterType}`);

      // Store active filter type
      this.activeCardFilter = filterType;

      // Update card visual states
      this.updateCardStyles(filterType);

      // Reset status dropdown since card filter takes priority
      const statusFilter = document.getElementById('statusFilter');
      if (statusFilter) {
          statusFilter.value = '';
      }

      // Re-render tickets with new filter
      this.renderTickets();

      // Update statistics to reflect filtered view
      this.updateStatistics();
  }
  ```

- [ ] **Add updateCardStyles method**
  ```javascript
  /**
   * Update visual styling of cards to show active state.
   *
   * @param {string} activeFilter - Currently active filter type
   * @returns {void}
   */
  updateCardStyles(activeFilter) {
      // Remove active class from all cards
      document.querySelectorAll('.stats-card').forEach(card => {
          card.classList.remove('stats-card-active');
      });

      // Add active class to selected card
      if (activeFilter && activeFilter !== 'all') {
          const activeCard = document.querySelector(`[data-filter-type="${activeFilter}"]`);
          if (activeCard) {
              activeCard.classList.add('stats-card-active');
          }
      }
  }
  ```

#### Checkpoint 1.3
- [ ] Clicking cards logs filter type to console
- [ ] Active card gets visual highlighting
- [ ] Status dropdown resets when card clicked
- [ ] No JavaScript errors

### Session 1 Final Testing (30 minutes)
- [ ] **Test all four cards**
  - Total Tickets: Logs "all", no highlighting
  - Open Tickets: Logs "open", gets active styling
  - Overdue: Logs "overdue", gets active styling
  - Completed: Logs "completed", gets active styling

- [ ] **Test visual feedback**
  - Hover effects work on all cards
  - Active styling applies correctly
  - Only one card highlighted at a time

- [ ] **Test accessibility**
  - Tab navigation works through cards
  - Enter/Space keys trigger clicks
  - Screen reader announces button role

- [ ] **Cross-browser check**
  - Test in Chrome, Firefox, Safari
  - Test in both light and dark themes

#### Session 1 Success Criteria
✅ All cards are visually clickable with hover effects
✅ Click handlers are attached and functional
✅ Basic filter state management works
✅ Visual feedback system operates correctly
✅ No console errors or accessibility issues

---

## Session 2: Filter Logic Implementation (2 hours)

### Task 2.1: Modify getFilteredTickets Method (45 minutes)

#### Files to Modify
- `/app/public/scripts/pages/tickets.js`

#### Tasks
- [ ] **Update getFilteredTickets method** (around line 1538)
  ```javascript
  /**
   * Get tickets filtered by search term, card filter, status, location, and supervisor.
   * Applies filters in priority order: search -> card -> status -> location.
   *
   * @returns {Array} Array of filtered ticket objects
   */
  getFilteredTickets() {
      const searchTerm = document.getElementById("searchInput").value.toLowerCase();
      const statusFilter = document.getElementById("statusFilter").value;
      const locationFilter = document.getElementById("locationFilter").value;

      return this.tickets.filter(ticket => {
          // 1. Search filter (applies to all fields)
          const matchesSearch = !searchTerm ||
              (ticket.xtNumber && ticket.xtNumber.toLowerCase().includes(searchTerm)) ||
              (ticket.hexagonTicket && ticket.hexagonTicket.toString().toLowerCase().includes(searchTerm)) ||
              (ticket.serviceNowTicket && ticket.serviceNowTicket.toLowerCase().includes(searchTerm)) ||
              (ticket.location && ticket.location.toLowerCase().includes(searchTerm)) ||
              (ticket.site && ticket.site.toLowerCase().includes(searchTerm)) ||
              (ticket.supervisor && ticket.supervisor.toLowerCase().includes(searchTerm)) ||
              (ticket.tech && ticket.tech.toLowerCase().includes(searchTerm)) ||
              (ticket.devices && Array.isArray(ticket.devices) && ticket.devices.some(device => device && device.toLowerCase().includes(searchTerm)));

          // 2. Card filter (primary status filter)
          const matchesCardFilter = this.applyCardFilterLogic(ticket);

          // 3. Status dropdown (only if no card filter active)
          const matchesStatus = this.activeCardFilter ? true : (!statusFilter || ticket.status === statusFilter);

          // 4. Location filter
          const matchesLocation = !locationFilter || ticket.location === locationFilter;

          return matchesSearch && matchesCardFilter && matchesStatus && matchesLocation;
      });
  }
  ```

- [ ] **Add applyCardFilterLogic method**
  ```javascript
  /**
   * Apply card filter logic to a single ticket.
   * Determines if ticket matches the currently active card filter.
   *
   * @param {Object} ticket - Ticket object to test
   * @returns {boolean} True if ticket matches active card filter
   */
  applyCardFilterLogic(ticket) {
      if (!this.activeCardFilter) {
          return true; // No card filter active, include all tickets
      }

      switch (this.activeCardFilter) {
          case 'all':
              return true; // Include all tickets

          case 'open':
              // Include all except terminal/failed statuses
              return !['Closed', 'Completed', 'Failed'].includes(ticket.status);

          case 'overdue':
              // Include overdue and failed tickets (both need attention)
              return ['Overdue', 'Failed'].includes(ticket.status);

          case 'completed':
              // Include successfully completed tickets
              return ['Completed', 'Closed'].includes(ticket.status);

          default:
              console.warn(`Unknown card filter type: ${this.activeCardFilter}`);
              return true;
      }
  }
  ```

#### Checkpoint 2.1
- [ ] Filter logic compiles without errors
- [ ] Console shows appropriate filtering behavior
- [ ] Cards still trigger visual updates

### Task 2.2: Fix Statistics Calculations (45 minutes)

#### Files to Modify
- `/app/public/scripts/pages/tickets.js`

#### Tasks
- [ ] **Update updateStatistics method** (around line 1578)
  ```javascript
  /**
   * Update ticket statistics display with current data.
   * Calculates and displays total tickets, open tickets, overdue tickets, and completed tickets.
   * Uses same logic as card filters for consistency.
   *
   * @returns {void}
   */
  updateStatistics() {
      const total = this.tickets.length;

      // Open = all tickets except terminal/failed statuses (matches 'open' card filter)
      const open = this.tickets.filter(t =>
          !['Closed', 'Completed', 'Failed'].includes(t.status)
      ).length;

      // Completed = successfully resolved tickets (matches 'completed' card filter)
      const completed = this.tickets.filter(t =>
          ['Completed', 'Closed'].includes(t.status)
      ).length;

      // Overdue = problematic tickets needing attention (matches 'overdue' card filter)
      const overdue = this.tickets.filter(t =>
          ['Overdue', 'Failed'].includes(t.status)
      ).length;

      // Update DOM elements
      document.getElementById("totalTickets").textContent = total;
      document.getElementById("openTickets").textContent = open;
      document.getElementById("completedTickets").textContent = completed;
      document.getElementById("overdueTickets").textContent = overdue;
  }
  ```

#### Checkpoint 2.2
- [ ] Statistics calculations match card filter logic
- [ ] Numbers update correctly when data changes
- [ ] No console errors in calculations

### Task 2.3: Add Filter Coordination (30 minutes)

#### Files to Modify
- `/app/public/scripts/pages/tickets.js`

#### Tasks
- [ ] **Extend existing status dropdown handler** (modify existing setupEventListeners method around line 318)
  ```javascript
  // Modify the existing status filter listener in setupEventListeners()
  document.getElementById("statusFilter").addEventListener("change", () => {
      this.currentPage = 1; // Reset to first page when filtering (existing)

      // NEW: Clear card filter when status dropdown is used
      if (document.getElementById("statusFilter").value && this.activeCardFilter) {
          this.activeCardFilter = null;
          this.updateCardStyles(null);
      }

      this.renderTickets(); // existing
  });
  ```

- [ ] **Update applyCardFilter method** to handle interactions and pagination
  ```javascript
  applyCardFilter(filterType) {
      console.log(`Applying card filter: ${filterType}`);

      // Handle clicking same card twice - reset to 'all'
      if (this.activeCardFilter === filterType && filterType !== 'all') {
          filterType = 'all';
      }

      // Store active filter type
      this.activeCardFilter = filterType === 'all' ? null : filterType;

      // Update card visual states
      this.updateCardStyles(filterType);

      // Reset status dropdown since card filter takes priority
      const statusFilter = document.getElementById('statusFilter');
      if (statusFilter) {
          statusFilter.value = '';
      }

      // Reset pagination to first page (CRITICAL)
      this.currentPage = 1;

      // Re-render tickets with new filter
      this.renderTickets();

      // Update statistics (though they shouldn't change)
      this.updateStatistics();
  }
  ```

#### Checkpoint 2.3
- [ ] Status dropdown clears card filter when used
- [ ] Clicking same card twice resets to "all"
- [ ] Filter coordination works smoothly

### Session 2 Testing (20 minutes)
- [ ] **Test each card filter**
  - Total: Shows all tickets
  - Open: Excludes Closed, Completed, Failed
  - Overdue: Shows only Overdue and Failed
  - Completed: Shows only Completed and Closed

- [ ] **Test filter combinations**
  - Card + Search term
  - Card + Location filter
  - Status dropdown overrides card

- [ ] **Test edge cases**
  - Empty dataset
  - Dataset with only one status type
  - Rapid clicking between cards

#### Session 2 Success Criteria
✅ All card filters work according to requirements
✅ Statistics calculations are accurate
✅ Filter combinations behave correctly
✅ No performance issues with filtering

---

## Session 3: AG-Grid Integration & Polish (1.5 hours)

### Task 3.1: Verify AG-Grid Updates (30 minutes)

#### Files to Test
- `/app/public/scripts/pages/tickets-aggrid.js`

#### Tasks
- [ ] **Test AG-Grid data updates**
  - Verify `renderTickets()` method still works
  - Check that filtered data reaches AG-Grid
  - Ensure pagination resets appropriately
  - Test empty state display

- [ ] **Test performance with large datasets**
  - Import CSV with 500+ tickets if available
  - Measure filter operation time (should be < 100ms)
  - Check for memory leaks with rapid filtering

#### Checkpoint 3.1
- [ ] AG-Grid updates correctly with filtered data
- [ ] Pagination handles filter changes
- [ ] Performance is acceptable

### Task 3.2: Enhanced Visual Polish (45 minutes)

#### Files to Modify
- `/app/public/tickets2.html`

#### Tasks
- [ ] **Improve card styling** (update CSS in style section)
  ```css
  .stats-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
  }

  .stats-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%);
      opacity: 0;
      transition: opacity 0.2s ease;
  }

  .stats-card:hover::before {
      opacity: 1;
  }

  .stats-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .stats-card-active {
      border: 2px solid var(--hextrackr-primary, #206bc4);
      background: var(--hextrackr-surface-active, rgba(32, 107, 196, 0.05));
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(32, 107, 196, 0.2);
  }

  .stats-card-active::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--hextrackr-primary, #206bc4);
  }

  [data-bs-theme="dark"] .stats-card:hover {
      box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
  }

  [data-bs-theme="dark"] .stats-card-active {
      box-shadow: 0 6px 20px rgba(32, 107, 196, 0.3);
  }

  .stats-card-active .font-weight-medium {
      color: var(--hextrackr-primary, #206bc4);
      font-weight: 600;
  }
  ```

- [ ] **OPTIONAL - Add loading state handling** (Skip for v1.0.23 - adds complexity)
  ```javascript
  // OPTIONAL: Can be added in future version if needed
  // Loading state prevents double-clicks during filter operations
  ```

#### Checkpoint 3.2
- [ ] Enhanced visual effects work smoothly
- [ ] Loading states prevent double-clicks
- [ ] Active card styling is prominent but not overwhelming

### Task 3.3: OPTIONAL - Filter Status Indicator (SKIP for v1.0.23)

**DECISION: Removing this task to reduce scope and risk**

- Filter status display adds significant complexity
- Not required for core functionality
- Can be added in future version if needed
- Focus on core card filtering behavior first

#### Session 3 Success Criteria
✅ AG-Grid integration works flawlessly
✅ Visual polish is complete and professional
✅ Filter status system provides clear feedback
✅ Performance remains excellent

---

## Session 4: Accessibility & Cross-Browser Testing (1.5 hours)

### Task 4.1: Accessibility Enhancements (45 minutes)

#### Files to Modify
- `/app/public/tickets2.html`

#### Tasks
- [ ] **Enhance ARIA attributes** (Fix ID conflicts and update labels)
  ```html
  <!-- Total Tickets Card -->
  <div class="card stats-card" data-filter-type="all"
       onclick="window.ticketManager?.applyCardFilter('all')"
       role="button" tabindex="0"
       aria-label="Show all tickets"
       aria-describedby="allTicketsDesc">

  <!-- Open Tickets Card -->
  <div class="card stats-card" data-filter-type="open"
       onclick="window.ticketManager?.applyCardFilter('open')"
       role="button" tabindex="0"
       aria-label="Show open tickets"
       aria-describedby="openTicketsDesc">

  <!-- Overdue Card -->
  <div class="card stats-card" data-filter-type="overdue"
       onclick="window.ticketManager?.applyCardFilter('overdue')"
       role="button" tabindex="0"
       aria-label="Show overdue tickets"
       aria-describedby="overdueTicketsDesc">

  <!-- Completed Card -->
  <div class="card stats-card" data-filter-type="completed"
       onclick="window.ticketManager?.applyCardFilter('completed')"
       role="button" tabindex="0"
       aria-label="Show completed tickets"
       aria-describedby="completedTicketsDesc">

  <!-- Hidden descriptions (unique IDs) -->
  <div id="allTicketsDesc" class="sr-only">Show all tickets regardless of status</div>
  <div id="openTicketsDesc" class="sr-only">Show active tickets that need attention</div>
  <div id="overdueTicketsDesc" class="sr-only">Show overdue and failed tickets</div>
  <div id="completedTicketsDesc" class="sr-only">Show completed and closed tickets</div>
  ```

- [ ] **Add screen reader announcements** (and wire into applyCardFilter)
  ```javascript
  // Add this method to tickets.js
  announceFilterChange(filterType) {
      const messages = {
          'all': 'Showing all tickets',
          'open': 'Showing open tickets only',
          'overdue': 'Showing overdue and failed tickets',
          'completed': 'Showing completed tickets only'
      };

      // Create/update live region for screen readers
      let announcement = document.getElementById('filterAnnouncement');
      if (!announcement) {
          announcement = document.createElement('div');
          announcement.id = 'filterAnnouncement';
          announcement.setAttribute('aria-live', 'polite');
          announcement.setAttribute('aria-atomic', 'true');
          announcement.className = 'sr-only';
          document.body.appendChild(announcement);
      }

      announcement.textContent = messages[filterType] || 'Filter applied';
  }

  // MODIFY applyCardFilter to call this:
  applyCardFilter(filterType) {
      // ... existing logic ...

      // Re-render tickets with new filter
      this.renderTickets();

      // Announce change for screen readers (ADD THIS LINE)
      this.announceFilterChange(filterType);

      // Update statistics
      this.updateStatistics();
  }
  ```

### Task 4.2: Cross-Browser Testing (30 minutes)

#### Testing Matrix
- [ ] **Chrome (latest)**
  - Card hover effects
  - Click functionality
  - Keyboard navigation
  - Dark/light theme switching

- [ ] **Firefox (latest)**
  - All interactive elements
  - CSS transitions
  - Filter functionality

- [ ] **Safari (latest)**
  - WebKit-specific issues
  - Mobile Safari if possible

- [ ] **Edge (latest)**
  - Chromium-based Edge testing

### Task 4.3: Performance Optimization (35 minutes)

#### Files to Modify
- `/app/public/scripts/pages/tickets.js`

#### Tasks
- [ ] **OPTIONAL - Add debouncing** (Skip for v1.0.23 - adds complexity)
  ```javascript
  // OPTIONAL: Simple filtering should be fast enough without debouncing
  // Can add if performance issues arise
  ```

- [ ] **SKIP - Filter caching optimization** (Not needed for initial version)
  ```javascript
  // SKIP: Current filter operations should be fast enough
  // Premature optimization - add only if performance issues confirmed
  ```

#### Session 4 Success Criteria
✅ Full accessibility compliance achieved
✅ Cross-browser compatibility verified
✅ Performance optimized for large datasets
✅ No usability issues identified

---

## Session 5: Final Testing & Documentation (1 hour)

### Task 5.1: Comprehensive Feature Testing (30 minutes)

#### Test Scenarios
- [ ] **Basic Functionality**
  - [ ] Each card filters correctly
  - [ ] Visual feedback works
  - [ ] Statistics are accurate

- [ ] **Filter Combinations**
  - [ ] Card + Search
  - [ ] Card + Location
  - [ ] Status dropdown overrides card
  - [ ] Clear all filters

- [ ] **Edge Cases**
  - [ ] Empty dataset
  - [ ] Single ticket
  - [ ] All tickets same status
  - [ ] Rapid clicking
  - [ ] Network slow/disconnected

- [ ] **User Experience**
  - [ ] Intuitive behavior
  - [ ] Fast response times
  - [ ] Smooth animations
  - [ ] Clear visual feedback

### Task 5.2: Code Quality Review (20 minutes)

#### Tasks
- [ ] **Remove debug code**
  - Console.log statements
  - Temporary variables
  - Test data

- [ ] **Add JSDoc comments**
  - All new methods properly documented
  - Parameter types specified
  - Return values documented

- [ ] **Run linters**
  ```bash
  npm run lint:all
  ```

- [ ] **Code cleanup**
  - Remove unused variables
  - Consistent formatting
  - Remove dead code

### Task 5.3: Documentation Updates (10 minutes)

#### Files to Update
- `/app/public/docs-source/CHANGELOG.md`

#### Tasks
- [ ] **Add changelog entry**
  ```markdown
  ## [1.0.23] - 2025-09-22

  ### Added

  #### Interactive Card Filtering System

  - **Clickable Statistics Cards**: All four ticket statistics cards are now interactive filters
    - Total Tickets card shows all tickets (reset view)
    - Open Tickets card shows active tickets (excludes Closed, Completed, Failed)
    - Overdue card shows urgent tickets (Overdue and Failed statuses)
    - Completed card shows finished tickets (Completed and Closed statuses)

  - **Visual Feedback System**: Professional hover effects and active state styling
    - Smooth transitions and shadow effects on card interaction
    - Clear visual indication of active filter with border and accent styling
    - Dark theme compatibility with appropriate contrast adjustments

  - **Smart Filter Integration**: Card filters work seamlessly with existing functionality
    - Combines with search and location filters using AND logic
    - Overrides status dropdown when active (mutual exclusivity)
    - Clicking same card twice resets to "all tickets" view

  ### Fixed

  #### Statistics Calculation Corrections

  - **Open Tickets Count**: Fixed calculation to include all non-terminal statuses
    - Previous: Only counted "Open" and "In Progress"
    - Current: Excludes "Closed", "Completed", "Failed" (includes Pending, Staged, Open, Overdue)
    - Provides accurate count of tickets requiring active attention

  - **Filter Logic Consistency**: Statistics now match their respective filter behaviors
    - All card counts use same logic as their filter implementations
    - Ensures numbers displayed match the actual filtered results
  ```

#### Final Session Success Criteria
✅ All tests pass with no issues
✅ Code quality meets HexTrackr standards
✅ Documentation is complete and accurate
✅ Feature is ready for production use

---

## Implementation Summary

### Total Estimated Time: 7-8 hours
- Session 1: 1.5 hours (Infrastructure)
- Session 2: 2 hours (Core Logic)
- Session 3: 1.5 hours (Integration)
- Session 4: 1.5 hours (Quality)
- Session 5: 1 hour (Final)

### Key Success Metrics
1. **Functional**: All cards filter according to requirements
2. **Performance**: < 100ms filter operations
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Quality**: No console errors, clean code
5. **Integration**: Seamless with existing features

### Risk Mitigation Completed
- Incremental implementation with testing
- Preservation of existing functionality
- Comprehensive cross-browser testing
- Performance optimization for large datasets

This implementation plan provides a structured approach to delivering the card filtering feature with high quality and minimal risk.