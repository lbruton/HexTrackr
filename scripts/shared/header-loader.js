// HexTrackr Shared Header Loader
(function() {
  'use strict';
  
  async function loadHeader() {
    try {
      // Fetch the header HTML
      const response = await fetch('/scripts/shared/header.html');
      if (!response.ok) {
        throw new Error(`Failed to load header: ${response.status}`);
      }
      
      const headerHtml = await response.text();
      
      // Find the header container or create one if it doesn't exist
      let headerContainer = document.getElementById('headerContainer');
      if (!headerContainer) {
        headerContainer = document.createElement('div');
        headerContainer.id = 'headerContainer';
        document.body.insertBefore(headerContainer, document.body.firstChild);
      }
      
      // Inject the header HTML
      headerContainer.innerHTML = headerHtml;
      
      // Initialize header functionality
      initHeaderFunctionality();
      
      console.log('✅ HexTrackr Header (shared) loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load shared header:', error);
      // Fallback: show basic navigation if loading fails
      showFallbackHeader();
    }
  }
  
  function initHeaderFunctionality() {
    // Set active navigation item based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Handle Import CSV Data link to open settings modal with specific tab
    const importCsvLink = document.querySelector('a[data-settings-tab="data-management"]');
    if (importCsvLink) {
      importCsvLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Wait for settings modal to be loaded, then open specific tab
        setTimeout(() => {
          const dataManagementTab = document.getElementById('data-management-tab');
          if (dataManagementTab) {
            dataManagementTab.click();
          }
        }, 100);
      });
    }
    
    // Initialize Bootstrap components if needed
    if (typeof bootstrap !== 'undefined') {
      // Initialize any Bootstrap tooltips in the header
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }
  
  function showFallbackHeader() {
    let headerContainer = document.getElementById('headerContainer');
    if (!headerContainer) {
      headerContainer = document.createElement('div');
      headerContainer.id = 'headerContainer';
      document.body.insertBefore(headerContainer, document.body.firstChild);
    }
    
    headerContainer.innerHTML = `
      <header class="navbar navbar-expand-md navbar-light d-print-none">
        <div class="container-xl">
          <h1 class="navbar-brand">
            <a href="tickets.html">HexTrackr</a>
          </h1>
          <div class="navbar-nav">
            <a class="nav-link" href="tickets.html">Tickets</a>
            <a class="nav-link" href="vulnerabilities.html">Vulnerabilities</a>
          </div>
        </div>
      </header>
    `;
    
    console.log('⚠️ HexTrackr Header fallback loaded');
  }
  
  // Load header when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
  
  // Export for testing purposes
  window.HexTrackrHeader = {
    loadHeader,
    initHeaderFunctionality
  };
  
})();
