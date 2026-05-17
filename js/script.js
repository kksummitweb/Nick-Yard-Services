(() => {
    const { protocol, hostname, href } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

    if (protocol === 'http:' && !isLocalhost) {
        window.location.replace(href.replace(/^http:/, 'https:'));
    }
})();

const CONTACT_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby7xg_LdnFY2Ze_ozFfFSDvmw4CNsBYXg5V_QJfUuSgl8KwsDZqEQZIEAitCSzNIb2t/exec';
const ESTIMATE_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz-wC6KlxnOmsuuOOvFwjH8-uIzKUlSrdlSwgagi1dRfXqDF10SP-gZWPK7C7SIAfJe/exec';
const OWNER_NOTIFICATION_EMAIL = 'nicksyardservices9@gmail.com';

// Contact form AJAX submission (URL-encoded for Google Apps Script)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '#333';
            const formPayload = new URLSearchParams(new FormData(contactForm));
            formPayload.set('ownerEmail', OWNER_NOTIFICATION_EMAIL);
            const formData = formPayload.toString();
            fetch(CONTACT_FORM_ENDPOINT, {
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
        const rangeValue = document.getElementById('estimateRange');
        const estimateSummary = document.getElementById('estimateSummary');
        const estimateNotes = document.getElementById('estimateNotes');
        const estimateLotSize = document.getElementById('estimateLotSize');
        const estimateTerrain = document.getElementById('estimateTerrain');
        const estimateTiming = document.getElementById('estimateTiming');
        const squareFeetError = document.getElementById('squareFeetError');
        const resetButton = document.getElementById('startOverEstimate');
        const backButton = document.getElementById('estimateBack');
        const nextButton = document.getElementById('estimateNext');
        const estimatorActions = document.querySelector('.estimator-actions');
        const progressBar = document.getElementById('estimatorProgressBar');
        const milestoneItems = Array.from(document.querySelectorAll('.milestone'));
        const terrainLearnMore = document.getElementById('terrainLearnMore');
        const terrainHelp = document.getElementById('terrainHelp');
        const estimateSendForm = document.getElementById('estimateSendForm');
        const estimateSendBtn = document.getElementById('estimateSendBtn');
        const estimateSendStatus = document.getElementById('estimateSendStatus');

        const terrainPricePerSqFt = {
            flat: { low: 0.0035, high: 0.0040, label: 'Flat / easy' },
            mild: { low: 0.0040, high: 0.0050, label: 'Mild slope' },
            moderate: { low: 0.0050, high: 0.0065, label: 'Moderate slope' },
            steep: { low: 0.0065, high: 0.0090, label: 'Very steep / difficult' }
        };

        const timingMultipliers = {
            asap: 1.05,         // +5%
            nextWeek: 1.02,     // +2%
            nextMonth: 1.00,    // Standard pricing
            flexible: 0.95      // -5%
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
            const terrain = getCheckedValue(terrainInputs) || 'flat';
            const timing = getCheckedValue(timingInputs) || 'nextMonth';
            const terrainRate = terrainPricePerSqFt[terrain] || terrainPricePerSqFt.flat;
            const timingLabel = timing === 'asap' ? 'ASAP' : timing === 'nextWeek' ? 'Next week' : timing === 'nextMonth' ? 'Next month' : 'Flexible';

            if (squareFeet <= 0) {
                rangeValue.textContent = 'Add yard size';
                estimateSummary.textContent = 'Enter your square footage to see your instant lawn mowing estimate.';
                estimateNotes.textContent = 'Estimate includes terrain and scheduling adjustments. Final pricing may vary after on-site review.';
                if (estimateLotSize) {
                    estimateLotSize.textContent = '-';
                }
                if (estimateTerrain) {
                    estimateTerrain.textContent = '-';
                }
                if (estimateTiming) {
                    estimateTiming.textContent = '-';
                }
                return;
            }

            const timingMultiplier = timingMultipliers[timing] || 1;
            const lowEstimate = squareFeet * terrainRate.low * timingMultiplier;
            const highEstimate = squareFeet * terrainRate.high * timingMultiplier;

            rangeValue.textContent = `${formatMoney(lowEstimate)} - ${formatMoney(highEstimate)}`;
            estimateSummary.textContent = `Estimated mowing range for ${Math.round(squareFeet).toLocaleString()} sq ft on ${terrainRate.label.toLowerCase()} terrain with ${timingLabel.toLowerCase()} start timing.`;
            estimateNotes.textContent = 'Estimate includes terrain and scheduling adjustments. Final pricing may vary after on-site review.';
            if (estimateLotSize) {
                estimateLotSize.textContent = `${Math.round(squareFeet).toLocaleString()} sq ft`;
            }
            if (estimateTerrain) {
                estimateTerrain.textContent = terrainRate.label;
            }
            if (estimateTiming) {
                estimateTiming.textContent = timingLabel;
            }
        };

        const stepHasRequiredValue = stepNumber => {
            if (stepNumber === 1) {
                return Number(sqftInput.value || 0) >= 2000;
            }

            if (stepNumber === 2) {
                return Boolean(getCheckedValue(terrainInputs));
            }

            if (stepNumber === 3) {
                return Boolean(getCheckedValue(timingInputs));
            }

            return true;
        };

        const updateSquareFeetError = () => {
            if (!squareFeetError) {
                return;
            }

            const hasMinimumSqFt = Number(sqftInput.value || 0) >= 2000;
            squareFeetError.hidden = hasMinimumSqFt;
        };

        const showStep = stepNumber => {
            currentStep = Math.min(Math.max(stepNumber, 1), totalSteps);

            estimatorSteps.forEach((step, index) => {
                const isActive = index + 1 === currentStep;
                step.hidden = !isActive;
                step.classList.toggle('active', isActive);
            });

            if (progressBar) {
                progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
            }

            if (milestoneItems.length > 0) {
                milestoneItems.forEach((item, index) => {
                    const stepIndex = index + 1;
                    item.classList.toggle('active', stepIndex === currentStep);
                    item.classList.toggle('completed', stepIndex < currentStep);
                });
            }

            if (backButton) {
                backButton.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
            }

            if (resetButton) {
                resetButton.style.visibility = currentStep <= 1 ? 'hidden' : 'visible';
            }

            if (nextButton) {
                if (currentStep === totalSteps) {
                    nextButton.style.display = 'none';
                    if (estimatorActions) {
                        estimatorActions.classList.add('final-step-actions');
                    }
                } else {
                    nextButton.style.display = 'inline-flex';
                    if (estimatorActions) {
                        estimatorActions.classList.remove('final-step-actions');
                    }
                }

                if (currentStep < totalSteps - 1) {
                    nextButton.textContent = 'Next';
                } else if (currentStep === totalSteps - 1) {
                    nextButton.textContent = 'View Estimate';
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

        // Step 1: Square Feet input (already handled)
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

        // Step 2: Terrain radio group
        if (terrainInputs && terrainInputs.length) {
            terrainInputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key !== 'Enter' || currentStep !== 2) return;
                    event.preventDefault();
                    if (stepHasRequiredValue(2)) {
                        showStep(3);
                    }
                });
            });
        }

        // Step 3: Timing radio group
        if (timingInputs && timingInputs.length) {
            timingInputs.forEach(input => {
                input.addEventListener('keydown', event => {
                    if (event.key !== 'Enter' || currentStep !== 3) return;
                    event.preventDefault();
                    if (stepHasRequiredValue(3)) {
                        showStep(4);
                    }
                });
            });
        }

        // Step 4: Send step (name/email fields)
        const customerNameInput = document.getElementById('estimateCustomerName');
        const customerEmailInput = document.getElementById('estimateCustomerEmail');
        if (customerNameInput) {
            customerNameInput.addEventListener('keydown', event => {
                if (event.key === 'Enter' && currentStep === 4) {
                    event.preventDefault();
                    if (estimateSendBtn) estimateSendBtn.click();
                }
            });
        }
        if (customerEmailInput) {
            customerEmailInput.addEventListener('keydown', event => {
                if (event.key === 'Enter' && currentStep === 4) {
                    event.preventDefault();
                    if (estimateSendBtn) estimateSendBtn.click();
                }
            });
        }

        if (terrainLearnMore && terrainHelp) {
            terrainLearnMore.addEventListener('click', event => {
                event.preventDefault();
                terrainHelp.hidden = !terrainHelp.hidden;
            });
        }

        if (estimateSendForm && estimateSendStatus && estimateSendBtn) {
            estimateSendBtn.addEventListener('click', async event => {
                event.preventDefault();
                calculateEstimate();

                estimateSendStatus.textContent = 'Sending estimate...';
                estimateSendStatus.style.color = '#d4e4d6';

                const terrain = getCheckedValue(terrainInputs) || 'flat';
                const timing = getCheckedValue(timingInputs) || 'nextMonth';
                const terrainRate = terrainPricePerSqFt[terrain] || terrainPricePerSqFt.flat;

                const payload = new URLSearchParams({
                    formType: 'estimate',
                    customerName: document.getElementById('estimateCustomerName')?.value || '',
                    customerEmail: document.getElementById('estimateCustomerEmail')?.value || '',
                    ownerEmail: OWNER_NOTIFICATION_EMAIL,
                    squareFeet: String(Number(sqftInput.value || 0)),
                    terrain: terrainRate.label,
                    startTiming: timing,
                    estimateRange: rangeValue?.textContent || '',
                    estimateSummary: estimateSummary?.textContent || '',
                    estimateNotes: estimateNotes?.textContent || ''
                }).toString();

                try {
                    const response = await fetch(ESTIMATE_FORM_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: payload
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    let result = null;
                    try {
                        result = await response.json();
                    } catch (parseError) {
                        throw new Error('Invalid response from estimate service');
                    }

                    if (!result || result.result !== 'success') {
                        const serverMessage = result && result.message ? result.message : 'Estimate service returned an error';
                        throw new Error(serverMessage);
                    }

                    estimateSendStatus.textContent = 'Success! Your estimate was sent. Please check your email for a copy.';
                    estimateSendStatus.style.color = '#27ae60';
                } catch (error) {
                    estimateSendStatus.textContent = `Sorry, the estimate could not be sent right now. ${error.message || 'Please try again.'}`;
                    estimateSendStatus.style.color = '#ffb7b7';
                }
            });
        }

        refreshSelectedStyles();
        updateSquareFeetError();
        // Only call showStep(1) on initial load, not after send, to prevent resetting the wizard step.
        if (!window._estimatorInitialized) {
            showStep(1);
            window._estimatorInitialized = true;
        }
    }
});

