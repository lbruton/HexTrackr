// StackTrackr Vision Pages - Interactive Features

document.addEventListener("DOMContentLoaded", function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll("a[href^=\"#\"]");
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector(".navbar");
    let lastScrollTop = 0;
    
    window.addEventListener("scroll", function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = "translateY(-100%)";
        } else {
            // Scrolling up
            navbar.style.transform = "translateY(0)";
        }
        
        // Add background when scrolled
        if (scrollTop > 50) {
            navbar.style.background = "rgba(255, 255, 255, 0.98)";
            navbar.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
        } else {
            navbar.style.background = "rgba(255, 255, 255, 0.95)";
            navbar.style.boxShadow = "none";
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add CSS transition to navbar
    navbar.style.transition = "all 0.3s ease-in-out";
    
    // Animate cards on scroll
    const cards = document.querySelectorAll(".component-card, .metric-card, .highlight-card, .stream-card");
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);
    
    cards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        cardObserver.observe(card);
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
        button.addEventListener("mouseenter", function() {
            this.style.transform = "translateY(-2px)";
        });
        
        button.addEventListener("mouseleave", function() {
            this.style.transform = "translateY(0)";
        });
    });
    
    // Add click handlers for demo buttons
    const demoButtons = document.querySelectorAll("a[href=\"#demo\"], .btn[href=\"#demo\"]");
    demoButtons.forEach(button => {
        button.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Show a modal or alert for demo request
            const modal = createDemoModal();
            document.body.appendChild(modal);
            
            // Animate modal in
            setTimeout(() => {
                modal.style.opacity = "1";
                modal.querySelector(".modal-content").style.transform = "translateY(0) scale(1)";
            }, 10);
        });
    });
    
    // Create demo request modal
    function createDemoModal() {
        const modal = document.createElement("div");
        modal.className = "demo-modal";
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚙️ Request Live Demo</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Ready to see rEngine Core transform your development workflow?</p>
                    <form class="demo-form">
                        <input type="text" placeholder="Your Name" required>
                        <input type="email" placeholder="Email Address" required>
                        <input type="text" placeholder="Company" required>
                        <select required>
                            <option value="">Team Size</option>
                            <option value="1-5">1-5 developers</option>
                            <option value="6-20">6-20 developers</option>
                            <option value="21-50">21-50 developers</option>
                            <option value="50+">50+ developers</option>
                        </select>
                        <textarea placeholder="What challenges are you facing with your current AI tools?"></textarea>
                        <button type="submit" class="btn btn-primary">Schedule Demo</button>
                    </form>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease-out;
        `;
        
        // Add styles for modal elements
        const style = document.createElement("style");
        style.textContent = `
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%) scale(0.9);
                background: white;
                border-radius: 1rem;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3);
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                transition: transform 0.3s ease-out;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #2563eb;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.15s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .demo-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .demo-form input,
            .demo-form select,
            .demo-form textarea {
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 0.5rem;
                font-family: inherit;
                font-size: 1rem;
                transition: border-color 0.15s ease;
            }
            
            .demo-form input:focus,
            .demo-form select:focus,
            .demo-form textarea:focus {
                outline: none;
                border-color: #2563eb;
            }
            
            .demo-form textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .demo-form button {
                margin-top: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
        
        // Add close functionality
        const closeBtn = modal.querySelector(".modal-close");
        const overlay = modal.querySelector(".modal-overlay");
        
        function closeModal() {
            modal.style.opacity = "0";
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        }
        
        closeBtn.addEventListener("click", closeModal);
        overlay.addEventListener("click", closeModal);
        
        // Handle form submission
        const form = modal.querySelector(".demo-form");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            
            // Simulate form submission
            const submitBtn = form.querySelector("button[type=\"submit\"]");
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Scheduling...";
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.textContent = "✅ Demo Scheduled!";
                submitBtn.style.background = "#10b981";
                
                setTimeout(() => {
                    closeModal();
                }, 1500);
            }, 2000);
        });
        
        return modal;
    }
    
    // Add copy-to-clipboard functionality for contact info
    const contactElements = document.querySelectorAll("[data-copy]");
    contactElements.forEach(element => {
        element.addEventListener("click", function() {
            const textToCopy = this.getAttribute("data-copy");
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show feedback
                const feedback = document.createElement("div");
                feedback.textContent = "Copied!";
                feedback.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    z-index: 10000;
                    animation: fadeInOut 2s ease-out forwards;
                `;
                
                document.body.appendChild(feedback);
                setTimeout(() => document.body.removeChild(feedback), 2000);
            });
        });
    });
    
    // Add CSS animation for copy feedback
    const style = document.createElement("style");
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
    
    // Performance metrics counter animation
    const metrics = document.querySelectorAll(".metric-number");
    const metricsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                metricsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    metrics.forEach(metric => {
        metricsObserver.observe(metric);
    });
    
    function animateNumber(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/\D/g, ""));
        const suffix = text.replace(/[\d]/g, "");
        
        if (number) {
            let current = 0;
            const increment = number / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    current = number;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current) + suffix;
            }, 30);
        }
    }
    
    console.log("⚙️ rEngine Core Vision Pages Loaded Successfully!");
});
