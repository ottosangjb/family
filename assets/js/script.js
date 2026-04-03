const DEFAULT_PRODUCT_IMAGE_URL = new URL('../images/default-product.svg', document.currentScript?.src || window.location.href).href;

// Countdown Timer
function updateCountdown() {
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const millisecondsElement = document.getElementById('milliseconds');

    if (!hoursElement || !minutesElement || !secondsElement || !millisecondsElement) {
        return;
    }

    // Set target time (24 hours from now)
    const now = new Date().getTime();
    const targetTime = now + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    // Update countdown every 100ms for smooth animation
    setInterval(function() {
        const currentTime = new Date().getTime();
        const distance = targetTime - currentTime;
        
        if (distance > 0) {
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const milliseconds = Math.floor((distance % 1000) / 10);
            
            // Update display with leading zeros
            hoursElement.textContent = String(hours).padStart(2, '0');
            minutesElement.textContent = String(minutes).padStart(2, '0');
            secondsElement.textContent = String(seconds).padStart(2, '0');
            millisecondsElement.textContent = String(milliseconds).padStart(2, '0');
        } else {
            // Countdown finished
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            millisecondsElement.textContent = '00';
        }
    }, 100);
}

function createDefaultProductImage(altText, extraClass) {
    const image = document.createElement('img');
    image.src = DEFAULT_PRODUCT_IMAGE_URL;
    image.alt = altText || 'Product image';
    image.className = ['default-product-image', extraClass].filter(Boolean).join(' ');
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
}

function getProductAltText(container) {
    const namedElement = container.closest('.card, .cart-item, .row, .product-detail')?.querySelector('.card-title, .product-title, h5, h6');
    return namedElement?.textContent?.trim() || 'Product image';
}

function replaceProductPlaceholders() {
    document.querySelectorAll('.product-placeholder-img').forEach((placeholder) => {
        if (placeholder.querySelector('img')) {
            return;
        }

        placeholder.replaceChildren(createDefaultProductImage(getProductAltText(placeholder)));
    });

    document.querySelectorAll('.product-thumbnails .thumbnail').forEach((thumbnail) => {
        if (thumbnail.querySelector('img')) {
            return;
        }

        thumbnail.replaceChildren(createDefaultProductImage('Product thumbnail', 'default-product-thumb'));
    });
}

function initializeProductViewToggle() {
    const productGrid = document.querySelector('[data-product-grid]');
    const toggleButtons = document.querySelectorAll('[data-view-toggle]');

    if (!productGrid || toggleButtons.length === 0) {
        return;
    }

    const storageKey = 'demomart-product-view';
    const setView = (view) => {
        const isListView = view === 'list';
        productGrid.classList.toggle('list-view', isListView);

        toggleButtons.forEach((button) => {
            const isActive = button.dataset.viewToggle === view;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        try {
            localStorage.setItem(storageKey, view);
        } catch (error) {
            // Ignore storage errors and keep the UI functional.
        }
    };

    let initialView = 'grid';

    try {
        const storedView = localStorage.getItem(storageKey);
        if (storedView === 'grid' || storedView === 'list') {
            initialView = storedView;
        }
    } catch (error) {
        // Ignore storage errors and keep the default view.
    }

    setView(initialView);

    toggleButtons.forEach((button) => {
        button.addEventListener('click', function() {
            setView(this.dataset.viewToggle);
        });
    });
}

function initializeMobileNavbarDrawer() {
    const navbarCollapse = document.querySelector('.header-section .navbar-collapse');
    const navbarToggler = document.querySelector('.header-section .navbar-toggler');

    if (!navbarCollapse || !navbarToggler) {
        return;
    }

    navbarToggler.removeAttribute('data-bs-toggle');
    navbarToggler.removeAttribute('data-bs-target');
    navbarToggler.removeAttribute('aria-controls');

    let drawerHeader = navbarCollapse.querySelector('.mobile-nav-header');
    if (!drawerHeader) {
        drawerHeader = document.createElement('div');
        drawerHeader.className = 'mobile-nav-header';

        const drawerTitle = document.createElement('div');
        drawerTitle.className = 'mobile-nav-title';
        drawerTitle.textContent = 'Menu';
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'mobile-nav-close';
        closeButton.setAttribute('aria-label', 'Close menu');
        closeButton.innerHTML = '<i class="bi bi-x-lg"></i>';

        drawerHeader.appendChild(drawerTitle);
        drawerHeader.appendChild(closeButton);
        navbarCollapse.prepend(drawerHeader);
    }

    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('button');
        backdrop.type = 'button';
        backdrop.className = 'mobile-nav-backdrop';
        backdrop.setAttribute('aria-label', 'Close menu backdrop');
        document.body.appendChild(backdrop);
    }

    const setDrawerState = (isOpen) => {
        navbarCollapse.classList.toggle('show', isOpen);
        document.body.classList.toggle('mobile-nav-open', isOpen);
        backdrop.classList.toggle('is-visible', isOpen);
        navbarToggler.setAttribute('aria-expanded', String(isOpen));
    };

    const closeDrawer = () => setDrawerState(false);
    const toggleDrawer = () => setDrawerState(!navbarCollapse.classList.contains('show'));

    drawerHeader.querySelector('.mobile-nav-close')?.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    navbarToggler.addEventListener('click', (event) => {
        if (window.innerWidth < 992) {
            event.preventDefault();
            event.stopPropagation();
            toggleDrawer();
        }
    });

    navbarCollapse.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (window.innerWidth >= 992) {
                return;
            }

            const href = link.getAttribute('href') || '';
            const isToggle = link.classList.contains('dropdown-toggle');
            const isHashOnly = href === '#' || href.startsWith('#');

            if (isToggle || isHashOnly) {
                event.stopPropagation();
                return;
            }

            closeDrawer();
        });
    });

    navbarCollapse.querySelectorAll('.dropdown-toggle').forEach((toggle) => {
        toggle.addEventListener('click', (event) => {
            if (window.innerWidth >= 992) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const dropdown = toggle.closest('.dropdown');
            const menu = dropdown?.querySelector('.dropdown-menu');
            if (!dropdown || !menu) {
                return;
            }

            const isOpen = dropdown.classList.contains('show');

            navbarCollapse.querySelectorAll('.dropdown.show').forEach((openDropdown) => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('show');
                    openDropdown.querySelector('.dropdown-menu')?.classList.remove('show');
                }
            });

            dropdown.classList.toggle('show', !isOpen);
            menu.classList.toggle('show', !isOpen);
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            closeDrawer();
        }
    });
}

function getSkeletonLayout() {
    const path = window.location.pathname.toLowerCase();
    const page = path.split('/').pop() || 'index.html';

    const templates = {
        'index.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-20"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-button"></div>
                </div>
                <div class="skeleton-card tall"><div class="skeleton-media large"></div></div>
            </div>
            <div class="skeleton-row cols-3">
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
            </div>
            <div class="skeleton-row cols-3">
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
            </div>
            <div class="skeleton-row cols-4">
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div></div>
            </div>
        `,
        'products.html': `
            <div class="skeleton-row cols-1-2">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-30"></div>
                    <div class="skeleton-line w-60"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-50"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-line w-20"></div>
                    <div class="skeleton-row cols-3">
                        <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div></div>
                        <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div></div>
                        <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div></div>
                    </div>
                    <div class="skeleton-row cols-3">
                        <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                        <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                        <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                    </div>
                </div>
            </div>
        `,
        'product-detail.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall"><div class="skeleton-media large"></div><div class="skeleton-row cols-4"><div class="skeleton-card short"></div><div class="skeleton-card short"></div><div class="skeleton-card short"></div><div class="skeleton-card short"></div></div></div>
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-60"></div>
                    <div class="skeleton-line w-30"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-button"></div>
                </div>
            </div>
            <div class="skeleton-row cols-4">
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
            </div>
        `,
        'member.html': `
            <div class="skeleton-row cols-1-2">
                <div class="skeleton-card tall">
                    <div class="skeleton-media"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-80"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-row cols-4">
                        <div class="skeleton-card short"></div>
                        <div class="skeleton-card short"></div>
                        <div class="skeleton-card short"></div>
                        <div class="skeleton-card short"></div>
                    </div>
                    <div class="skeleton-table">
                        <div class="skeleton-table-row">
                            <div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-40"></div>
                        </div>
                        <div class="skeleton-table-row">
                            <div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-40"></div>
                        </div>
                        <div class="skeleton-table-row">
                            <div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-40"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="skeleton-row cols-3">
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
            </div>
        `,
        'cart.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-30"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-card short"></div>
                </div>
            </div>
            <div class="skeleton-row cols-4">
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div></div>
            </div>
        `,
        'checkout.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
            </div>
        `,
        'payment.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-35"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-row cols-3">
                        <div class="skeleton-card short"></div>
                        <div class="skeleton-card short"></div>
                        <div class="skeleton-card short"></div>
                    </div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
            </div>
        `,
        'complete.html': `
            <div class="skeleton-row cols-1-2">
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
            </div>
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
            </div>
            <div class="skeleton-row cols-3">
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
            </div>
        `,
        'tracking-order.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-25"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-40"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
            </div>
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall"><div class="skeleton-table"><div class="skeleton-table-row"><div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-40"></div></div><div class="skeleton-table-row"><div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-50"></div><div class="skeleton-line w-40"></div></div></div></div>
                <div class="skeleton-card tall"><div class="skeleton-card short"></div><div class="skeleton-card short"></div><div class="skeleton-card short"></div></div>
            </div>
        `,
        'how-to-order.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-30"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-55"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
            </div>
            <div class="skeleton-row cols-2">
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
            </div>
            <div class="skeleton-card tight">
                <div class="skeleton-line w-40"></div>
                <div class="skeleton-line w-85"></div>
                <div class="skeleton-line w-70"></div>
            </div>
        `,
        'terms-conditions.html': `
            <div class="skeleton-row cols-1-2">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-25"></div>
                    <div class="skeleton-line w-65"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-50"></div>
                </div>
                <div class="skeleton-card tight">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-60"></div>
                </div>
            </div>
            <div class="skeleton-card tall">
                <div class="skeleton-line w-35"></div>
                <div class="skeleton-line w-95"></div>
                <div class="skeleton-line w-90"></div>
                <div class="skeleton-line w-30"></div>
                <div class="skeleton-line w-95"></div>
                <div class="skeleton-line w-90"></div>
                <div class="skeleton-line w-30"></div>
                <div class="skeleton-line w-95"></div>
                <div class="skeleton-line w-90"></div>
            </div>
            <div class="skeleton-card tight">
                <div class="skeleton-line w-40"></div>
                <div class="skeleton-line w-70"></div>
                <div class="skeleton-button"></div>
            </div>
        `,
        'find-store.html': `
            <div class="skeleton-row cols-1-2">
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
            </div>
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
                <div class="skeleton-card tall"><div class="skeleton-media large"></div></div>
            </div>
        `,
        'faq.html': `
            <div class="skeleton-row cols-1-2">
                <div class="skeleton-card short"></div>
                <div class="skeleton-card tight">
                    <div class="skeleton-line w-60"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-80"></div>
                </div>
            </div>
            <div class="skeleton-chip-row">
                <div class="skeleton-chip"></div>
                <div class="skeleton-chip"></div>
                <div class="skeleton-chip"></div>
                <div class="skeleton-chip"></div>
                <div class="skeleton-chip"></div>
            </div>
            <div class="skeleton-card tall">
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
                <div class="skeleton-card short"></div>
            </div>
            <div class="skeleton-card tight">
                <div class="skeleton-line w-40"></div>
                <div class="skeleton-line w-70"></div>
                <div class="skeleton-button"></div>
            </div>
        `,
        'contact.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
                <div class="skeleton-card tall">
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
            </div>
            <div class="skeleton-row cols-3">
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
            </div>
            <div class="skeleton-card tall"><div class="skeleton-media large"></div></div>
        `,
        'about-us.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-30"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-button"></div>
                </div>
                <div class="skeleton-card tall"><div class="skeleton-media large"></div></div>
            </div>
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
            </div>
            <div class="skeleton-row cols-3">
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
            </div>
            <div class="skeleton-row cols-4">
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-50"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-50"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-50"></div></div>
                <div class="skeleton-card tight"><div class="skeleton-media"></div><div class="skeleton-line w-50"></div></div>
            </div>
            <div class="skeleton-row cols-4">
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
                <div class="skeleton-card tight"></div>
            </div>
        `,
        'login.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
                <div class="skeleton-card tall"><div class="skeleton-media large"></div></div>
            </div>
        `,
        'signup.html': `
            <div class="skeleton-row cols-2-1">
                <div class="skeleton-card tall">
                    <div class="skeleton-line w-50"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-card short"></div>
                </div>
                <div class="skeleton-card tall"><div class="skeleton-media large"></div></div>
            </div>
        `
    };

    return templates[page] || `
        <div class="skeleton-row cols-3">
            <div class="skeleton-card tall"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-80"></div></div>
            <div class="skeleton-card tall"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-80"></div></div>
            <div class="skeleton-card tall"><div class="skeleton-media"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-80"></div></div>
        </div>
    `;
}

function initializePageSkeleton() {
    document.body.classList.add('page-loading');

    const skeleton = document.createElement('div');
    skeleton.className = 'page-skeleton';
    skeleton.setAttribute('aria-hidden', 'true');
    skeleton.innerHTML = `
        <div class="page-skeleton-inner">
            <div class="skeleton-header">
                <div class="skeleton-brand"></div>
                <div class="skeleton-nav">
                    <div class="skeleton-nav-item"></div>
                    <div class="skeleton-nav-item"></div>
                    <div class="skeleton-nav-item"></div>
                    <div class="skeleton-nav-item"></div>
                    <div class="skeleton-nav-item"></div>
                </div>
                <div class="skeleton-actions">
                    <div class="skeleton-icon"></div>
                    <div class="skeleton-icon"></div>
                    <div class="skeleton-icon"></div>
                    <div class="skeleton-auth"></div>
                </div>
            </div>
            <div class="skeleton-breadcrumb">
                <div class="skeleton-crumb"></div>
                <div class="skeleton-crumb-sep"></div>
                <div class="skeleton-crumb current"></div>
            </div>
            <div class="skeleton-main">${getSkeletonLayout()}</div>
            <div class="skeleton-footer">
                <div class="skeleton-footer-col">
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-line w-90"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-chip-row">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-icon"></div>
                    </div>
                </div>
                <div class="skeleton-footer-col">
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-line w-60"></div>
                    <div class="skeleton-line w-65"></div>
                </div>
                <div class="skeleton-footer-col">
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-line w-70"></div>
                    <div class="skeleton-line w-65"></div>
                    <div class="skeleton-line w-55"></div>
                </div>
                <div class="skeleton-footer-col">
                    <div class="skeleton-line w-40"></div>
                    <div class="skeleton-card short"></div>
                    <div class="skeleton-line w-60"></div>
                    <div class="skeleton-line w-50"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(skeleton);

    const reveal = () => {
        skeleton.classList.add('is-hidden');
        document.body.classList.remove('page-loading');
        window.setTimeout(() => skeleton.remove(), 400);
    };

    const startTime = Date.now();
    const minDuration = 500;

    window.addEventListener('load', () => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minDuration - elapsed);
        window.setTimeout(reveal, delay);
    }, { once: true });
}

// Initialize countdown when page loads
initializePageSkeleton();

document.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    replaceProductPlaceholders();
    initializeProductViewToggle();
    initializeMobileNavbarDrawer();
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || this.classList.contains('dropdown-toggle') || this.classList.contains('navbar-toggler')) {
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            e.preventDefault();
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.product-card, .stat-card, .product-item').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
});

