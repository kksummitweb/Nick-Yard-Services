(() => {
    const { protocol, hostname, href } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

    if (protocol === 'http:' && !isLocalhost) {
        window.location.replace(href.replace(/^http:/, 'https:'));
    }
})();

// Contact form AJAX submission (URL-encoded for Google Apps Script)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '#333';
            const formData = new URLSearchParams(new FormData(contactForm)).toString();
            fetch('https://script.google.com/macros/s/AKfycbwUDkXP2r4njNaTKTjtdcprmGj9CeMb-iYlmd7Jpv1a34q27pc-UWyWoQwdiTQAEHw3/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            })
            .then(async response => {
                if (response.ok) {
                    let msg = 'Thank you! Your message has been sent.';
                    try {
                        const data = await response.json();
                        if (data && data.result === 'success') {
                            msg = 'Thank you! Your message has been sent.';
                        } else {
                            msg = 'Thank you! Your message was received.';
                        }
                    } catch (e) {
                        msg = 'Thank you! Your message has been sent.';
                    }
                    formStatus.textContent = msg;
                    formStatus.style.color = 'green';
                    contactForm.reset();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                formStatus.textContent = 'Sorry, there was an error sending your message. Please try again later.';
                formStatus.style.color = 'red';
            });
        });
    }
});
// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    // Scroll animations
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

    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.service-card, .feature-item, .testimonial-card, .gallery-item');
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Before/after sliders
    const beforeAfterSliders = document.querySelectorAll('.before-after');

    beforeAfterSliders.forEach(slider => {
        let isDragging = false;

        const updateSliderPosition = event => {
            const rect = slider.getBoundingClientRect();
            const clampedX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
            const percent = (clampedX / rect.width) * 100;
            slider.style.setProperty('--before-after-position', `${percent}%`);
        };

        slider.addEventListener('pointerdown', event => {
            isDragging = true;
            slider.classList.add('is-dragging');
            slider.setPointerCapture(event.pointerId);
            updateSliderPosition(event);
        });

        slider.addEventListener('pointermove', event => {
            if (!isDragging) {
                return;
            }

            updateSliderPosition(event);
        });

        const stopDragging = event => {
            if (!isDragging) {
                return;
            }

            isDragging = false;
            slider.classList.remove('is-dragging');
            slider.releasePointerCapture(event.pointerId);
        };

        slider.addEventListener('pointerup', stopDragging);
        slider.addEventListener('pointercancel', stopDragging);
    });

    // Back to top button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Active navigation highlighting based on scroll position
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavigation() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

            if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // Gallery lightbox functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Future enhancement: Implement lightbox functionality here
            // Example: Open modal with full-size image
        });
    });
});

// Spring special popup
document.addEventListener('DOMContentLoaded', function() {
    const validUntilDate = new Date('2026-05-16T00:00:00');
    const path = window.location.pathname.toLowerCase();
    const lastSegment = path.substring(path.lastIndexOf('/') + 1);
    const isHomePage = lastSegment === '' || lastSegment === 'index.html';

    if (new Date() >= validUntilDate || !isHomePage) {
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'promo-popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Spring special promotion');

    overlay.innerHTML = `
        <div class="promo-popup" role="document">
            <button class="promo-popup-close" type="button" aria-label="Close spring special popup">&times;</button>
            <div class="promo-popup-media">
                <div class="promo-popup-slider" aria-label="Spring project slideshow">
                    <img src="src/image23.jpeg" alt="Spring lawn care project photo 1" loading="lazy">
                    <img src="src/image24.jpeg" alt="Spring lawn care project photo 2" loading="lazy">
                    <img src="src/image25.jpeg" alt="Spring lawn care project photo 3" loading="lazy">
                    <img src="src/image26.jpeg" alt="Spring lawn care project photo 4" loading="lazy">
                </div>
            </div>
            <div class="promo-popup-content">
                <span class="promo-popup-badge">Spring Service Promotion</span>
                <p class="promo-popup-kicker">Spring Special</p>
                <h3>10% Off Bundle</h3>
                <p>Get <strong>10% off spring aeration, dethatching, and overseeding</strong> when you mention this ad.</p>
                <ul class="promo-popup-list" aria-label="Services included in spring bundle">
                    <li>Aeration</li>
                    <li>Dethatching</li>
                    <li>Overseeding</li>
                </ul>
                <p class="promo-popup-note">Valid through May 15.</p>
                <a class="promo-popup-cta" href="contact.html">Request This Service Bundle</a>
            </div>
        </div>
    `;

    let isClosing = false;
    let slideshowInterval = null;

    const slider = overlay.querySelector('.promo-popup-slider');
    const slides = slider ? slider.querySelectorAll('img') : [];

    if (slider && slides.length > 1) {
        let activeSlideIndex = 0;
        const shouldReduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const showSlide = function(index) {
            slider.style.transform = `translateX(-${index * 100}%)`;
        };

        showSlide(activeSlideIndex);

        if (!shouldReduceMotion) {
            slideshowInterval = window.setInterval(function() {
                activeSlideIndex = (activeSlideIndex + 1) % slides.length;
                showSlide(activeSlideIndex);
            }, 4800);
        }
    }

    const closePopup = function() {
        if (isClosing) {
            return;
        }

        isClosing = true;
        if (slideshowInterval) {
            window.clearInterval(slideshowInterval);
            slideshowInterval = null;
        }
        overlay.classList.remove('show');
        document.body.classList.remove('promo-popup-open');

        setTimeout(function() {
            document.removeEventListener('keydown', handleEscapeClose);
            overlay.remove();
        }, 250);
    };

    document.body.appendChild(overlay);

    setTimeout(function() {
        overlay.classList.add('show');
        document.body.classList.add('promo-popup-open');
    }, 350);

    overlay.addEventListener('click', function(event) {
        if (event.target.closest('.promo-popup-close')) {
            event.preventDefault();
            closePopup();
            return;
        }

        if (event.target === overlay) {
            closePopup();
        }
    });

    const handleEscapeClose = function(event) {
        if (event.key === 'Escape' && overlay.classList.contains('show')) {
            closePopup();
        }
    };

    document.addEventListener('keydown', handleEscapeClose);
});
