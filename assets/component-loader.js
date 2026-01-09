document.addEventListener('DOMContentLoaded', () => {
    
    // Function to load and inject components from external HTML files
    async function loadComponent(placeholderId, filePath) {
        try {
            const response = await fetch(filePath);
            const html = await response.text();
            document.getElementById(placeholderId).innerHTML = html;
        } catch (error) {
            console.error(`Error loading component from ${filePath}:`, error);
        }
    }

    // --- Component Injection ---
    loadComponent('nav-overlay-container', 'components/nav.html').then(() => {
        // Run Setup only after HTML is injected
        setupNavigation();
        highlightCurrentPage(); 
    });
    
    loadComponent('footer-container', 'components/footer.html').then(() => {
        setupFooterYear();
    });

    // --- 1. CORE NAVIGATION LOGIC (Open/Close/Scroll) ---
    function setupNavigation() {
        const trigger = document.getElementById('nav-trigger'); 
        const closeBtn = document.getElementById('nav-close');
        const overlay = document.getElementById('nav-overlay');

        if (!trigger || !overlay || !closeBtn) return;

        // A. OPEN MENU
        trigger.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Lock Scroll
            trigger.style.display = 'none'; // Hide trigger
        });

        // B. CLOSE MENU (With "Glow then Close" Animation)
        closeBtn.addEventListener('click', () => {
            // 1. Trigger the CSS Glow
            closeBtn.classList.add('glow-active');
            
            // 2. Wait 300ms for animation, THEN close
            setTimeout(() => {
                overlay.classList.remove('visible');
                overlay.classList.add('hidden');
                document.body.style.overflow = ''; // Unlock Scroll
                
                // Reset Button State
                closeBtn.classList.remove('glow-active');
                trigger.style.display = 'flex'; 
                
                // Optional: Close all submenus when main menu closes
                closeAllSubmenus();
            }, 300);
        });

        // C. SCROLL LOGIC (Hide Trigger on Scroll)
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const st = window.scrollY || document.documentElement.scrollTop;
            
            // Only toggle if menu is CLOSED
            if (overlay.classList.contains('hidden')) {
                if (st > lastScrollTop && st > 50) {
                    trigger.classList.add('is-hidden'); // Scroll Down -> Hide
                } else {
                    trigger.classList.remove('is-hidden'); // Scroll Up -> Show
                }
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }, false);
        
        // D. SUBMENU TOGGLE LOGIC (Integrated here for clarity)
        const toggles = document.querySelectorAll('.submenu-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 1. Toggle 'active' class on the clicked toggle (Rotates Chevron)
                this.classList.toggle('active');
                
                // 2. Show/Hide the list
                const submenu = this.nextElementSibling;
                if (submenu) {
                    submenu.classList.toggle('hidden');
                }
                
                // 3. Close OTHER open menus (Accordion Style)
                toggles.forEach(other => {
                    if (other !== this && other.classList.contains('active')) {
                        other.classList.remove('active');
                        if (other.nextElementSibling) {
                            other.nextElementSibling.classList.add('hidden');
                        }
                    }
                });
            });
        });
    }
    
    // Helper to reset menu state
    function closeAllSubmenus() {
        document.querySelectorAll('.submenu-toggle').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.submenu').forEach(s => s.classList.add('hidden'));
    }

    // --- 2. ACTIVE PAGE HIGHLIGHTER (Smart Parent/Child) ---
    function highlightCurrentPage() {
        // Get path (e.g. "/contact" or "/")
        let currentPath = window.location.pathname;
        if (currentPath.length > 1 && currentPath.endsWith('/')) {
            currentPath = currentPath.slice(0, -1);
        }
        
        // A. HIGHLIGHT MAIN LINKS
        document.querySelectorAll('.main-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active-page');
            }
        });

        // B. HIGHLIGHT SUB-LINKS & PARENT TOGGLES
        document.querySelectorAll('.submenu-item-text').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                // 1. Highlight the child link
                link.classList.add('active-page');
                
                // 2. Find and highlight parent
                const parentSubmenu = link.closest('.submenu');
                if (parentSubmenu) {
                    parentSubmenu.classList.remove('hidden'); // Auto-open menu
                    
                    const parentToggle = parentSubmenu.previousElementSibling;
                    if (parentToggle) {
                        parentToggle.classList.add('active'); // Rotate chevron
                        parentToggle.classList.add('child-active'); // Glow parent text
                    }
                }
            }
        });
    }

    // --- 3. FOOTER YEAR ---
    function setupFooterYear() {
        const yearElement = document.getElementById("currentYear");
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    // --- 4. FAQ ACCORDION (If present) ---
    function setupFAQAccordion() {
        document.querySelectorAll('.faq-question').forEach(item => {
            item.addEventListener('click', () => {
                const faqItem = item.parentElement;
                const answer = faqItem.querySelector('.faq-answer');
                const icon = faqItem.querySelector('.toggle-icon');

                // Toggle Active Class
                faqItem.classList.toggle('active');

                // Accordion Logic (Close others)
                if (faqItem.classList.contains('active')) {
                    document.querySelectorAll('.faq-item.active').forEach(otherItem => {
                        if (otherItem !== faqItem) {
                            otherItem.classList.remove('active');
                            otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                        }
                    });
                    answer.style.maxHeight = answer.scrollHeight + 'px'; 
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    }

    if (document.querySelector('.faq-container')) {
        setupFAQAccordion();
    }
});
