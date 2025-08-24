// Option 1: Toast-Based Progress (Simple & Reliable)
class ToastProgressManager {
    showProgress(message) {
        this.hideProgress(); // Clean up any existing
        
        const toastHtml = `
            <div class="toast show position-fixed top-0 end-0 m-3" id="progressToast" style="z-index: 9999;">
                <div class="toast-header bg-primary text-white">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    <strong class="me-auto">Processing</strong>
                </div>
                <div class="toast-body">${message}</div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        
        // Auto-hide after 10 seconds as safety
        setTimeout(() => this.hideProgress(), 10000);
    }
    
    hideProgress() {
        const toast = document.getElementById('progressToast');
        if (toast) toast.remove();
    }
}

// Option 2: Clean Modal with Timeout Protection
class SafeModalManager {
    showModal(message) {
        this.hideModal(); // Always clean up first
        
        // Update content
        document.getElementById('loadingMessage').textContent = message;
        
        // Simple show
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        modal.show();
        
        // Safety timeout - auto-hide after 15 seconds
        this.safetyTimeout = setTimeout(() => {
            console.warn('Modal auto-hiding due to timeout');
            this.forceHideModal();
        }, 15000);
    }
    
    hideModal() {
        if (this.safetyTimeout) {
            clearTimeout(this.safetyTimeout);
        }
        
        try {
            const modalEl = document.getElementById('loadingModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        } catch (e) {
            this.forceHideModal();
        }
    }
    
    forceHideModal() {
        // Nuclear option - remove everything
        const modalEl = document.getElementById('loadingModal');
        if (modalEl) modalEl.style.display = 'none';
        
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
    }
}

// Option 3: Inline Progress Bar
class InlineProgressManager {
    showProgress(message) {
        // Remove any existing progress
        this.hideProgress();
        
        // Create inline progress bar
        const progressHtml = `
            <div id="inlineProgress" class="alert alert-info d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-3" role="status"></div>
                <div class="flex-grow-1">
                    <strong>${message}</strong>
                    <div class="progress mt-2" style="height: 4px;">
                        <div class="progress-bar progress-bar-animated" style="width: 100%"></div>
                    </div>
                </div>
                <button type="button" class="btn-close" onclick="progressManager.hideProgress()"></button>
            </div>
        `;
        
        // Insert at top of main content
        const mainContent = document.querySelector('.container-fluid');
        mainContent.insertAdjacentHTML('afterbegin', progressHtml);
    }
    
    hideProgress() {
        const progress = document.getElementById('inlineProgress');
        if (progress) progress.remove();
    }
}
