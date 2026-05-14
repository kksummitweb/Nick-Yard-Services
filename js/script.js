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
            fetch('https://script.google.com/macros/s/AKfycby7xg_LdnFY2Ze_ozFfFSDvmw4CNsBYXg5V_QJfUuSgl8KwsDZqEQZIEAitCSzNIb2t/exec', {
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

    // Lawn estimator behavior
    const estimatorForm = document.getElementById('lawnEstimatorForm');

    if (estimatorForm) {
        const estimatorSteps = Array.from(document.querySelectorAll('.estimator-step'));
        const totalSteps = estimatorSteps.length;
        let currentStep = 1;

        const sqftInput = document.getElementById('squareFeet');
        const terrainInputs = document.querySelectorAll('input[name="terrain"]');
        const timingInputs = document.querySelectorAll('input[name="startTiming"]');
        const serviceInputs = document.querySelectorAll('input[name="services"]');
        const rangeValue = document.getElementById('estimateRange');
        const estimateSummary = document.getElementById('estimateSummary');
        const estimateNotes = document.getElementById('estimateNotes');
        const squareFeetError = document.getElementById('squareFeetError');
        const resetButton = document.getElementById('startOverEstimate');
        const backButton = document.getElementById('estimateBack');
        const nextButton = document.getElementById('estimateNext');
        const stepCount = document.getElementById('estimatorStepCount');
        const progressBar = document.getElementById('estimatorProgressBar');
        const terrainLearnMore = document.getElementById('terrainLearnMore');
        const terrainHelp = document.getElementById('terrainHelp');

        const terrainPricePerSqFt = {
            flat: { low: 0.0035, high: 0.0040, label: 'Flat' },
            slight: { low: 0.0040, high: 0.0050, label: 'Slightly sloped' },
            steep: { low: 0.0065, high: 0.0090, label: 'Steep' }
        };

        const timingMultipliers = {
            asap: 1.06,
            nextWeek: 1.03,
            nextMonth: 1,
            flexible: 0.97
        };

        const getCheckedValue = inputList => {
            const checked = Array.from(inputList).find(input => input.checked);
            return checked ? checked.value : null;
        };

        const refreshSelectedStyles = () => {
            const allSelectableOptions = document.querySelectorAll('.selectable-option');
            allSelectableOptions.forEach(option => {
                const field = option.querySelector('input');
                option.classList.toggle('selected', Boolean(field && field.checked));
            });
        };

        const formatMoney = value => `$${Math.round(value).toLocaleString()}`;

        const calculateEstimate = () => {
            const squareFeet = Number(sqftInput.value || 0);
            const chosenServices = Array.from(serviceInputs)
                .filter(input => input.checked)
                .map(input => input.value);
            const terrain = getCheckedValue(terrainInputs) || 'flat';
            const timing = getCheckedValue(timingInputs) || 'nextMonth';
            const terrainRate = terrainPricePerSqFt[terrain] || terrainPricePerSqFt.flat;

            if (squareFeet <= 0 || chosenServices.length === 0) {
                rangeValue.textContent = 'Add yard size and services';
                estimateSummary.textContent = 'Choose at least one service and enter your square footage to see your instant estimate.';
                estimateNotes.textContent = 'Base mowing guide uses $0.0036-$0.0047 per sq ft depending on terrain. Final pricing may vary after on-site review.';
                return;
            }

            const serviceMultiplier = 1 + Math.max(chosenServices.length - 1, 0) * 0.22;
            const timingMultiplier = timingMultipliers[timing] || 1;
            const lowEstimate = squareFeet * terrainRate.low * serviceMultiplier * timingMultiplier;
            const highEstimate = squareFeet * terrainRate.high * serviceMultiplier * timingMultiplier;

            rangeValue.textContent = `${formatMoney(lowEstimate)} - ${formatMoney(highEstimate)}`;
            estimateSummary.textContent = `Estimated for ${Math.round(squareFeet).toLocaleString()} sq ft, ${chosenServices.length} selected service${chosenServices.length > 1 ? 's' : ''}, ${terrainRate.label.toLowerCase()} terrain, and ${timing === 'asap' ? 'ASAP' : timing === 'nextWeek' ? 'next week' : timing === 'nextMonth' ? 'next month' : 'flexible'} start timing.`;
            estimateNotes.textContent = `Terrain rate used: $${terrainRate.low.toFixed(4)}-$${terrainRate.high.toFixed(4)} per sq ft. Additional selected services and scheduling preference adjust the final range.`;
        };

        const stepHasRequiredValue = stepNumber => {
            if (stepNumber === 1) {
                return Number(sqftInput.value || 0) >= 5000;
            }

            if (stepNumber === 2) {
                return Array.from(serviceInputs).some(input => input.checked);
            }

            if (stepNumber === 3) {
                return Boolean(getCheckedValue(terrainInputs));
            }

            if (stepNumber === 4) {
                return Boolean(getCheckedValue(timingInputs));
            }

            return true;
        };

        const updateSquareFeetError = () => {
            if (!squareFeetError) {
                return;
            }

            const hasMinimumSqFt = Number(sqftInput.value || 0) >= 5000;
            squareFeetError.hidden = hasMinimumSqFt;
        };

        const showStep = stepNumber => {
            currentStep = Math.min(Math.max(stepNumber, 1), totalSteps);

            estimatorSteps.forEach((step, index) => {
                const isActive = index + 1 === currentStep;
                step.hidden = !isActive;
                step.classList.toggle('active', isActive);
            });

            if (stepCount) {
                stepCount.textContent = `${currentStep} of ${totalSteps}`;
            }

            if (progressBar) {
                progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
            }

            if (backButton) {
                backButton.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
            }

            if (resetButton) {
                resetButton.style.visibility = currentStep <= 2 ? 'hidden' : 'visible';
            }

            if (nextButton) {
                if (currentStep < totalSteps - 1) {
                    nextButton.textContent = 'Next';
                } else if (currentStep === totalSteps - 1) {
                    nextButton.textContent = 'View Estimate';
                } else {
                    nextButton.textContent = 'Get a Quote';
                }
            }

            if (currentStep === totalSteps) {
                calculateEstimate();
            }
        };

        estimatorForm.addEventListener('input', () => {
            refreshSelectedStyles();

            if (currentStep === 1) {
                updateSquareFeetError();
            }

            if (currentStep === totalSteps) {
                calculateEstimate();
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                estimatorForm.reset();
                refreshSelectedStyles();
                showStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (backButton) {
            backButton.addEventListener('click', () => {
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentStep < totalSteps) {
                    if (!stepHasRequiredValue(currentStep)) {
                        if (currentStep === 1) {
                            updateSquareFeetError();
                            sqftInput.focus();
                        }
                        return;
                    }

                    showStep(currentStep + 1);
                    return;
                }

                window.location.href = 'contact.html';
            });
        }

        if (sqftInput) {
            sqftInput.addEventListener('keydown', event => {
                if (event.key !== 'Enter' || currentStep !== 1) {
                    return;
                }

                event.preventDefault();

                if (stepHasRequiredValue(1)) {
                    updateSquareFeetError();
                    showStep(2);
                } else {
                    updateSquareFeetError();
                    sqftInput.focus();
                }
            });
        }

        if (terrainLearnMore && terrainHelp) {
            terrainLearnMore.addEventListener('click', event => {
                event.preventDefault();
                terrainHelp.hidden = !terrainHelp.hidden;
            });
        }

        refreshSelectedStyles();
        updateSquareFeetError();
        showStep(1);
    }
});

