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
        setupSubmenuLogic(); // NEW: Run submenu logic after nav is loaded
    });
    loadComponent('footer-container', 'components/footer.html').then(() => {
        // Run Footer script after injection
        setupFooterYear();
    });

    // --- Navigation and Floating Icon Logic ---
    function setupNavigation() {
        const trigger = document.getElementById('nav-trigger');
        const closeBtn = document.getElementById('nav-close');
        const overlay = document.getElementById('nav-overlay');

        if (!trigger || !overlay || !closeBtn) return; // Exit if components not found

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
                sub.previousElementSibling.querySelector('.submenu-arrow').classList.remove('rotate');
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
    
    // --- NEW: Submenu Dropdown Logic ---
    function setupSubmenuLogic() {
        // Listen for clicks on the main link that has the submenu
        const submenuToggle = document.querySelector('.submenu-toggle');
        
        if (!submenuToggle) return;
        
        // We use the parent list item (li) to listen for the click
        submenuToggle.addEventListener('click', (e) => {
            e.preventDefault(); // Prevents navigating to our-creations-showcase.html immediately

            const parentLi = submenuToggle.parentElement;
            const submenu = parentLi.querySelector('.submenu');
            const arrow = parentLi.querySelector('.submenu-arrow');

            // Toggle visibility of the submenu
            submenu.classList.toggle('hidden');
            
            // Toggle arrow rotation
            arrow.classList.toggle('rotate');
            
            // OPTIONAL: If the link is the main destination, you can navigate on a second click
            // if (submenu.classList.contains('hidden')) {
            //     window.location.href = submenuToggle.getAttribute('href');
            // }
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

                // Toggle active class on the clicked item
                faqItem.classList.toggle('active');

                // Show or hide the answer with a smooth animation
                if (faqItem.classList.contains('active')) {
                    // Close other active items when a new one is opened (optional but clean)
                    document.querySelectorAll('.faq-item.active').forEach(otherItem => {
                        if (otherItem !== faqItem) {
                            otherItem.classList.remove('active');
                            otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                        }
                    });
                    
                    answer.style.maxHeight = answer.scrollHeight + 'px'; // Set height to scroll height
                } else {
                    answer.style.maxHeight = '0'; // Collapse
                }
            });
        });
    }

    // Run the FAQ setup if we are on a page with the FAQ content
    if (document.querySelector('.faq-container')) {
        setupFAQAccordion();
    }
});
