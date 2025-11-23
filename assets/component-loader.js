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
        // Run Navigation setup after the nav.html content has been injected
        setupNavigation();
        setupSubmenuLogic();
        highlightCurrentPage(); 
    });
    loadComponent('footer-container', 'components/footer.html').then(() => {
        // Run Footer script after injection
        setupFooterYear();
    });

    // --- Navigation and Floating Icon Logic ---
    function setupNavigation() {
        // *** CRITICAL FIX: Reverting to the original, correct ID: #nav-trigger ***
        const trigger = document.getElementById('nav-trigger'); 
        const closeBtn = document.getElementById('nav-close');
        const overlay = document.getElementById('nav-overlay');

        if (!trigger || !overlay || !closeBtn) return;

        // Open Menu Function
        trigger.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            overlay.classList.add('visible');
            trigger.style.display = 'none'; // Hide trigger when menu opens
        });

        // Close Menu Function
        closeBtn.addEventListener('click', () => {
            // AI Decision: Spin/Fade-Out Animation
            closeBtn.classList.add('animate-close');
            overlay.classList.remove('visible');
            overlay.classList.add('hidden');
            
            setTimeout(() => {
                closeBtn.classList.remove('animate-close');
                trigger.style.display = 'flex'; // Show trigger when menu closes
            }, 500); // Matches CSS transition time
            
            // Close any open submenus when the main menu closes
            document.querySelectorAll('.has-submenu .submenu').forEach(sub => {
                sub.classList.add('hidden');
                const arrow = sub.closest('.has-submenu').querySelector('.submenu-arrow');
                if (arrow) {
                    arrow.classList.remove('rotate');
                }
            });
        });

        // Floating Icon Visibility Control (Scroll Logic)
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const st = window.scrollY || document.documentElement.scrollTop;
            
            // Check if menu is closed AND we are scrolling down
            if (overlay.classList.contains('hidden')) {
                if (st > lastScrollTop) {
                    // Scrolling Down (Hide Icon)
                    trigger.classList.add('is-hidden');
                } else {
                    // Scrolling Up (Show Icon)
                    trigger.classList.remove('is-hidden');
                }
            }
            lastScrollTop = st <= 0 ? 0 : st; // For mobile browsers
        }, false);
    }
    
       // --- Active Page Glow Logic (Highlight Current Page) ---
    function highlightCurrentPage() {
        const currentPath = window.location.pathname.replace(/\/$/, ''); // Get clean path (/faq)
        
        document.querySelectorAll('.overlay-menu a').forEach(link => {
            const linkPath = link.getAttribute('href').replace(/\/$/, '');
            
            // 1. Check for the definitive home path (domain root)
            // Fix: Added currentPath === '/' check for Vercel root URL handling
            if (linkPath === '/' && (currentPath === '' || currentPath === '/index.html' || currentPath === '/index' || currentPath === '/')) {
                 link.classList.add('active-page');
            }
            // 2. Check for other pages
            // Fix: Changed includes() to startsWith() for more precise matching
            // We use startsWith() to match /faq/subpage to /faq
            else if (linkPath !== '/' && currentPath.startsWith(linkPath) && currentPath.length === linkPath.length) {
                // To prevent partial matches (e.g., matching /affiliates if the page is /affiliate-partners)
                link.classList.add('active-page');
            } else if (linkPath !== '/' && currentPath.startsWith(linkPath) && linkPath !== '/') {
                 // Fallback for pages where path segments might be needed, but added length check above is better
                 // For now, let's keep it simple to fix the root issue and avoid accidental highlighting
                 if (currentPath === linkPath) { // Simple exact match for most pages
                    link.classList.add('active-page');
                 }
            }
        });
    }

    
    // --- Submenu Dropdown Logic for Multiple Menus ---
    function setupSubmenuLogic() {
        document.querySelectorAll('.submenu-toggle').forEach(toggle => {
            
            const parentLi = toggle.closest('.has-submenu');
            const submenu = parentLi.querySelector('.submenu');
            const arrow = parentLi.querySelector('.submenu-arrow'); 

            if (!submenu) return;

            toggle.addEventListener('click', (e) => {
                
                if (toggle.tagName === 'SPAN' || submenu.classList.contains('hidden') || e.target.classList.contains('submenu-arrow') || e.target.closest('.submenu-arrow')) {
                    
                    e.preventDefault(); 
                    
                    submenu.classList.toggle('hidden');
                    
                    if (arrow) {
                        arrow.classList.toggle('rotate');
                    }

                    // Close other open submenus (ONE AT A TIME requirement)
                    document.querySelectorAll('.has-submenu').forEach(otherLi => {
                        if (otherLi !== parentLi) {
                            const otherSubmenu = otherLi.querySelector('.submenu');
                            if (otherSubmenu && !otherSubmenu.classList.contains('hidden')) {
                                otherSubmenu.classList.add('hidden');
                                const otherArrow = otherLi.querySelector('.submenu-arrow');
                                if (otherArrow) {
                                    otherArrow.classList.remove('rotate');
                                }
                            }
                        }
                    });
                }
            });
            
            // Handle non-clickable sub-links (spans) inside the submenu
            submenu.querySelectorAll('li > span').forEach(subSpan => {
                subSpan.addEventListener('click', (e) => {
                    e.preventDefault(); // Explicitly prevent any default action on these static links
                });
            });

        });
    }

    // --- Footer Year Script ---
    function setupFooterYear() {
        const yearElement = document.getElementById("currentYear");
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    // --- FAQ Accordion Logic (Your Custom Script) ---
    function setupFAQAccordion() {
        document.querySelectorAll('.faq-question').forEach(item => {
            item.addEventListener('click', () => {
                const faqItem = item.parentElement;
                const answer = faqItem.querySelector('.faq-answer');

                faqItem.classList.toggle('active');

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

    // Run the FAQ setup if we are on a page with the FAQ content
    if (document.querySelector('.faq-container')) {
        setupFAQAccordion();
    }
});
