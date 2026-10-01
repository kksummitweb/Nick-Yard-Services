(() => {
    const { protocol, hostname, href } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

    if (protocol === 'http:' && !isLocalhost) {
        window.location.replace(href.replace(/^http:/, 'https:'));
    }
})();

const CONTACT_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwXf8_y02lRwsqxkMK4j8BIOZzULvjl-NiIQXtOcDZkxyBoKsUXOfFl9Jd1ok2kDf1N/exec';
const SNOW_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwXf8_y02lRwsqxkMK4j8BIOZzULvjl-NiIQXtOcDZkxyBoKsUXOfFl9Jd1ok2kDf1N/exec';
const ESTIMATE_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwXf8_y02lRwsqxkMK4j8BIOZzULvjl-NiIQXtOcDZkxyBoKsUXOfFl9Jd1ok2kDf1N/exec';
const OWNER_NOTIFICATION_EMAIL = 'nicksyardservices9@gmail.com';
const SNOW_SPOTS_TOTAL = 20;
const SNOW_SPOTS_JSON_URL = 'data/snow-spots.json';

/**
 * Optional live count: add doGet to your Google Apps Script (same project as the contact form):
 * if (e.parameter.action === 'snowSpots') return JSON { total: 20, remaining: ... } counting snow_signup rows.
 * Until then, update data/snow-spots.json when a spot is filled.
 */
function applySnowSpotsAvailability(data) {
    const total = typeof data.total === 'number' ? data.total : SNOW_SPOTS_TOTAL;
    const remaining = Math.max(0, Math.min(total, typeof data.remaining === 'number' ? data.remaining : total));
    const fillPct = total > 0 ? (remaining / total) * 100 : 0;
    const isFull = remaining <= 0;

    document.querySelectorAll('[data-snow-spots-root]').forEach(root => {
        root.classList.toggle('is-full', isFull);
        const remainingEl = root.querySelector('[data-snow-spots-remaining]');
        const totalEl = root.querySelector('[data-snow-spots-total]');
        const barEl = root.querySelector('[data-snow-spots-bar]');
        const noteEl = root.querySelector('[data-snow-spots-note]');

        if (remainingEl) {
            remainingEl.textContent = String(remaining);
        }
        if (totalEl) {
            totalEl.textContent = String(total);
        }
        if (barEl) {
            barEl.style.width = `${fillPct}%`;
        }
        if (noteEl) {
            noteEl.textContent = isFull
                ? 'All 20 spots are filled. Call (608) 886-5468 to ask about a waitlist.'
                : 'Registration closes November 1, 2026. Spots are first come, first served.';
        }
    });

    const heroRemaining = document.querySelector('[data-snow-spots-remaining-hero]');
    if (heroRemaining) {
        heroRemaining.textContent = String(remaining);
    }

    const snowNext = document.getElementById('snowSignupNext');
    const snowSubmit = document.getElementById('snowSignupSubmit');
    if (isFull) {
        if (snowNext) {
            snowNext.disabled = true;
        }
        if (snowSubmit) {
            snowSubmit.disabled = true;
        }
    } else {
        if (snowNext) {
            snowNext.disabled = false;
        }
        if (snowSubmit) {
            snowSubmit.disabled = false;
        }
    }

    window.__snowSpotsRemaining = remaining;
}

async function refreshSnowSpotsAvailability() {
    const roots = document.querySelectorAll('[data-snow-spots-root]');
    if (!roots.length && !document.querySelector('[data-snow-spots-remaining-hero]')) {
        return;
    }

    try {
        const apiResponse = await fetch(`${CONTACT_FORM_ENDPOINT}?action=snowSpots`, { cache: 'no-store' });
        if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            if (typeof apiData.remaining === 'number') {
                applySnowSpotsAvailability(apiData);
                return;
            }
        }
    } catch (error) {
        /* fall through to JSON file */
    }

    try {
        const jsonResponse = await fetch(`${SNOW_SPOTS_JSON_URL}?v=${Date.now()}`, { cache: 'no-store' });
        if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            applySnowSpotsAvailability(jsonData);
            return;
        }
    } catch (error) {
        /* use default */
    }

    applySnowSpotsAvailability({ total: SNOW_SPOTS_TOTAL, remaining: SNOW_SPOTS_TOTAL });
}

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

    const revealOnScroll = document.querySelectorAll('.reveal-on-scroll');
    if (revealOnScroll.length > 0) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealOnScroll.forEach(el => revealObserver.observe(el));
    }

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
            flat: { low: 0.0030, high: 0.0040, label: 'Flat / easy' },
            mild: { low: 0.0038, high: 0.0049, label: 'Mild slope' },
            moderate: { low: 0.0046, high: 0.0056, label: 'Moderate slope' },
            steep: { low: 0.0060, high: 0.0085, label: 'Very steep / difficult' }
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
                estimateSummary.textContent = 'Enter your square footage to see your instant weekly lawn mowing estimate.';
                estimateNotes.textContent = 'Estimate includes terrain and scheduling adjustments. Pricing may be cheaper or more expensive based on our property evaluation.';
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
            estimateNotes.textContent = 'Estimate includes terrain and scheduling adjustments. Pricing may be cheaper or more expensive based on our property evaluation.';
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
        const customerPhoneInput = document.getElementById('estimateCustomerPhone');
        const customerEmailInput = document.getElementById('estimateCustomerEmail');
        const customerAddressInput = document.getElementById('estimateCustomerAddress');
        if (customerNameInput) {
            customerNameInput.addEventListener('keydown', event => {
                if (event.key === 'Enter' && currentStep === 4) {
                    event.preventDefault();
                    if (estimateSendBtn) estimateSendBtn.click();
                }
            });
        }
        if (customerPhoneInput) {
            customerPhoneInput.addEventListener('keydown', event => {
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

        const submitEstimateByFormPost = params => {
            const frameName = `estimateSubmitFrame_${Date.now()}`;
            const iframe = document.createElement('iframe');
            iframe.name = frameName;
            iframe.style.display = 'none';

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = ESTIMATE_FORM_ENDPOINT;
            form.target = frameName;
            form.style.display = 'none';

            params.forEach((value, key) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(iframe);
            document.body.appendChild(form);
            form.submit();

            setTimeout(() => {
                form.remove();
                iframe.remove();
            }, 8000);
        };

        if (estimateSendForm && estimateSendStatus && estimateSendBtn) {
            estimateSendBtn.addEventListener('click', async event => {
                event.preventDefault();

                const requiredEstimateInputs = [customerNameInput, customerPhoneInput, customerEmailInput, customerAddressInput].filter(Boolean);
                const firstInvalidInput = requiredEstimateInputs.find(input => !input.checkValidity());
                if (firstInvalidInput) {
                    firstInvalidInput.reportValidity();
                    firstInvalidInput.focus();
                    return;
                }

                calculateEstimate();

                estimateSendStatus.textContent = 'Sending estimate...';
                estimateSendStatus.style.color = '#d4e4d6';

                const terrain = getCheckedValue(terrainInputs) || 'flat';
                const timing = getCheckedValue(timingInputs) || 'nextMonth';
                const terrainRate = terrainPricePerSqFt[terrain] || terrainPricePerSqFt.flat;

                const payloadParams = new URLSearchParams({
                    formType: 'estimate',
                    customerName: document.getElementById('estimateCustomerName')?.value || '',
                    customerPhone: document.getElementById('estimateCustomerPhone')?.value || '',
                    customerEmail: document.getElementById('estimateCustomerEmail')?.value || '',
                    customerAddress: document.getElementById('estimateCustomerAddress')?.value || '',
                    ownerEmail: OWNER_NOTIFICATION_EMAIL,
                    squareFeet: String(Number(sqftInput.value || 0)),
                    terrain: terrainRate.label,
                    startTiming: timing,
                    estimateRange: rangeValue?.textContent || '',
                    estimateSummary: estimateSummary?.textContent || '',
                    estimateNotes: estimateNotes?.textContent || ''
                });

                try {
                    const response = await fetch(ESTIMATE_FORM_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: payloadParams.toString()
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
                    // Apps Script web apps can return redirect/CORS-limited responses even when doPost succeeds.
                    // Fall back to a plain form POST that avoids fetch response restrictions.
                    try {
                        submitEstimateByFormPost(payloadParams);
                        estimateSendStatus.textContent = 'Estimate submitted. If you do not receive an email shortly, please contact us directly.';
                        estimateSendStatus.style.color = '#27ae60';
                    } catch (fallbackError) {
                        estimateSendStatus.textContent = `Sorry, the estimate could not be sent right now. ${error.message || 'Please try again.'}`;
                        estimateSendStatus.style.color = '#ffb7b7';
                    }
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

    refreshSnowSpotsAvailability();

    // Snow removal signup wizard
    const snowSignupForm = document.getElementById('snowSignupForm');
    if (snowSignupForm) {
        const snowSteps = Array.from(document.querySelectorAll('.snow-signup-step'));
        const snowTotalSteps = snowSteps.length;
        let snowCurrentStep = 1;

        const snowTierSelect = document.getElementById('snowTierSelect');
        const snowTierId = document.getElementById('snowTierId');
        const snowTierLabel = document.getElementById('snowTierLabel');
        const snowSelectedTierDisplay = document.getElementById('snowSelectedTierDisplay');
        const snowSignupStepTitle = document.getElementById('snowSignupStepTitle');
        const snowWizardProgress = document.getElementById('snowWizardProgress');
        const snowWizardProgressFill = document.getElementById('snowWizardProgressFill');
        const snowWizardNav = document.getElementById('snowWizardNav');
        const snowSignupBack = document.getElementById('snowSignupBack');
        const snowSignupNext = document.getElementById('snowSignupNext');
        const snowSignupSubmit = document.getElementById('snowSignupSubmit');
        const snowSignupStatus = document.getElementById('snowSignupStatus');
        const tierButtons = document.querySelectorAll('.snow-tier-cta');
        const tierCards = document.querySelectorAll('.snow-tier-card');

        const stepTitles = [
            'Step 1 of 4 · Your plan',
            'Step 2 of 4 · Property details',
            'Step 3 of 4 · Review terms',
            'Step 4 of 4 · Sign & submit'
        ];

        const tierLabels = {
            '500': '0–500 sq. ft. — $70/push',
            '1000': '750–1,000 sq. ft. — $85–$100/push',
            '1500': '1,000–1,500 sq. ft. — $100–$125/push',
            '2000': '1,500–2,000 sq. ft. — $150/push',
            '2500': '2,000–2,500 sq. ft. — Custom pricing',
            custom: '2,500+ sq. ft. — Custom pricing'
        };

        const updateTierDisplay = (label, empty) => {
            if (!snowSelectedTierDisplay) {
                return;
            }
            if (empty) {
                snowSelectedTierDisplay.textContent = 'No driveway size selected yet';
                snowSelectedTierDisplay.classList.add('is-empty');
            } else {
                snowSelectedTierDisplay.textContent = label;
                snowSelectedTierDisplay.classList.remove('is-empty');
            }
        };

        const highlightTierCard = tier => {
            tierCards.forEach(card => {
                card.classList.toggle('is-selected', card.getAttribute('data-tier') === tier);
            });
        };

        const applyTierSelection = (tier, label) => {
            if (snowTierSelect) {
                snowTierSelect.value = tier;
            }
            if (snowTierId) {
                snowTierId.value = tier;
            }
            if (snowTierLabel) {
                snowTierLabel.value = label || tierLabels[tier] || '';
            }
            updateTierDisplay(label || tierLabels[tier] || 'Tier selected', false);
            highlightTierCard(tier);
        };

        const showSnowStep = stepNumber => {
            snowCurrentStep = Math.min(Math.max(stepNumber, 1), snowTotalSteps);

            snowSteps.forEach((step, index) => {
                const isActive = index + 1 === snowCurrentStep;
                step.hidden = !isActive;
                step.classList.toggle('is-active', isActive);
            });

            if (snowSignupStepTitle) {
                snowSignupStepTitle.textContent = stepTitles[snowCurrentStep - 1] || '';
            }

            const progressPct = `${(snowCurrentStep / snowTotalSteps) * 100}%`;
            if (snowWizardProgressFill) {
                snowWizardProgressFill.style.width = progressPct;
            }
            if (snowWizardProgress) {
                snowWizardProgress.setAttribute('aria-valuenow', String(snowCurrentStep));
            }

            if (snowWizardNav) {
                snowWizardNav.querySelectorAll('li').forEach(item => {
                    const step = Number(item.getAttribute('data-step'));
                    item.classList.toggle('is-active', step === snowCurrentStep);
                    item.classList.toggle('is-complete', step < snowCurrentStep);
                });
            }

            if (snowSignupBack) {
                snowSignupBack.hidden = snowCurrentStep === 1;
            }
            if (snowSignupNext) {
                snowSignupNext.hidden = snowCurrentStep === snowTotalSteps;
            }
            if (snowSignupSubmit) {
                snowSignupSubmit.hidden = snowCurrentStep !== snowTotalSteps;
            }
        };

        const snowStepValid = stepNumber => {
            if (stepNumber === 1) {
                if (!snowTierSelect?.value) {
                    if (snowTierSelect?.reportValidity) {
                        snowTierSelect.reportValidity();
                    }
                    snowTierSelect?.focus();
                    return false;
                }
                return true;
            }

            if (stepNumber === 2) {
                const fields = [
                    document.getElementById('snowCustomerName'),
                    document.getElementById('snowCustomerEmail'),
                    document.getElementById('snowCustomerPhone'),
                    document.getElementById('snowCustomerAddress'),
                    document.getElementById('snowOregonConfirm')
                ].filter(Boolean);

                const firstInvalid = fields.find(field => {
                    if (field.type === 'checkbox') {
                        return !field.checked;
                    }
                    return !field.checkValidity();
                });

                if (firstInvalid) {
                    if (firstInvalid.type === 'checkbox') {
                        firstInvalid.focus();
                    } else if (firstInvalid.reportValidity) {
                        firstInvalid.reportValidity();
                    }
                    return false;
                }
                return true;
            }

            if (stepNumber === 3) {
                const termsAck = document.getElementById('snowTermsAck');
                if (termsAck && !termsAck.checked) {
                    termsAck.focus();
                    return false;
                }
                return true;
            }

            if (stepNumber === 4) {
                const signature = document.getElementById('snowSignature');
                if (signature && !signature.checkValidity()) {
                    signature.reportValidity();
                    return false;
                }
                const checks = ['snowContractAck', 'snowCardAck']
                    .map(id => document.getElementById(id))
                    .filter(Boolean);
                const missing = checks.find(box => !box.checked);
                if (missing) {
                    missing.focus();
                    return false;
                }
            }

            return true;
        };

        tierButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tier = button.getAttribute('data-tier');
                const label = button.getAttribute('data-label') || tierLabels[tier] || '';
                applyTierSelection(tier, label);
                const signupSection = document.getElementById('snow-signup');
                if (signupSection) {
                    signupSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                showSnowStep(2);
            });
        });

        if (snowTierSelect) {
            snowTierSelect.addEventListener('change', () => {
                const tier = snowTierSelect.value;
                if (tier) {
                    applyTierSelection(tier, tierLabels[tier]);
                } else {
                    if (snowTierId) snowTierId.value = '';
                    if (snowTierLabel) snowTierLabel.value = '';
                    highlightTierCard('');
                    updateTierDisplay('', true);
                }
            });
        }

        if (snowSignupBack) {
            snowSignupBack.addEventListener('click', () => {
                if (snowCurrentStep > 1) {
                    showSnowStep(snowCurrentStep - 1);
                }
            });
        }

        if (snowSignupNext) {
            snowSignupNext.addEventListener('click', () => {
                if (!snowStepValid(snowCurrentStep)) {
                    return;
                }
                if (snowCurrentStep < snowTotalSteps) {
                    showSnowStep(snowCurrentStep + 1);
                }
            });
        }

        snowSignupForm.addEventListener('submit', event => {
            event.preventDefault();

            if (snowCurrentStep !== snowTotalSteps) {
                return;
            }

            for (let step = 1; step <= snowTotalSteps; step += 1) {
                if (!snowStepValid(step)) {
                    showSnowStep(step);
                    return;
                }
            }

            if (snowSignupStatus) {
                snowSignupStatus.textContent = 'Submitting signup request...';
                snowSignupStatus.style.color = '#333';
            }

            const messageLines = [
                'Snow Removal Seasonal Signup Request',
                `Driveway tier: ${snowTierLabel?.value || snowTierSelect?.value || 'Not specified'}`,
                `Salt & Ice Treatment: ${document.getElementById('snowSaltTreatment')?.checked ? '$20 per application (selected)' : 'Not selected'}`,
                `Corner lot: ${document.getElementById('snowCornerLot')?.checked ? '$15 additional per snow service' : 'No'}`,
                'Acknowledgments: seasonal agreement, 2-inch service trigger, possible initial and final clearing during larger storms, card on file, Village of Oregon only.',
                `Electronic signature: ${document.getElementById('snowSignature')?.value || ''}`
            ];

            const formPayload = new URLSearchParams({
                formType: 'snow_signup',
                service: 'snow-removal',
                name: document.getElementById('snowCustomerName')?.value || '',
                email: document.getElementById('snowCustomerEmail')?.value || '',
                phone: document.getElementById('snowCustomerPhone')?.value || '',
                address: document.getElementById('snowCustomerAddress')?.value || '',
                drivewayTier: snowTierId?.value || snowTierSelect?.value || '',
                drivewayTierLabel: snowTierLabel?.value || '',
                saltTreatment: document.getElementById('snowSaltTreatment')?.checked ? 'Yes' : 'No',
                cornerLot: document.getElementById('snowCornerLot')?.checked ? 'Yes' : 'No',
                signature: document.getElementById('snowSignature')?.value || '',
                oregonConfirm: document.getElementById('snowOregonConfirm')?.checked ? 'Yes' : 'No',
                termsAck: document.getElementById('snowTermsAck')?.checked ? 'Yes' : 'No',
                contractAck: document.getElementById('snowContractAck')?.checked ? 'Yes' : 'No',
                cardAck: document.getElementById('snowCardAck')?.checked ? 'Yes' : 'No',
                message: messageLines.join('\n'),
                ownerEmail: OWNER_NOTIFICATION_EMAIL
            });

            fetch(SNOW_FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formPayload.toString()
            })
                .then(async response => {
                    let result = null;
                    try {
                        result = await response.json();
                    } catch (parseError) {
                        // Apps Script sometimes returns a non-JSON redirect body even on success.
                        result = response.ok ? { result: 'success' } : null;
                    }

                    if (!result || result.result !== 'success') {
                        const serverMessage = result && result.message ? result.message : 'Please try again later or call (608) 886-5468.';
                        throw new Error(serverMessage);
                    }

                    if (snowSignupStatus) {
                        snowSignupStatus.textContent = 'Thank you for submitting your snow removal request! Nick will be in contact with you shortly to follow up, answer any questions, and finalize the contract details.';
                        snowSignupStatus.style.color = 'green';
                    }
                    snowSignupForm.reset();
                    if (snowTierId) snowTierId.value = '';
                    if (snowTierLabel) snowTierLabel.value = '';
                    highlightTierCard('');
                    updateTierDisplay('', true);
                    showSnowStep(1);
                    const prevRemaining = typeof window.__snowSpotsRemaining === 'number'
                        ? window.__snowSpotsRemaining
                        : SNOW_SPOTS_TOTAL;
                    applySnowSpotsAvailability({
                        total: SNOW_SPOTS_TOTAL,
                        remaining: Math.max(0, prevRemaining - 1)
                    });
                })
                .catch(error => {
                    if (snowSignupStatus) {
                        snowSignupStatus.textContent = `Sorry, your request could not be submitted. ${error.message || 'Please try again later or call (608) 886-5468.'}`;
                        snowSignupStatus.style.color = 'red';
                    }
                    refreshSnowSpotsAvailability();
                });
        });

        const params = new URLSearchParams(window.location.search);
        const tierFromUrl = params.get('tier');
        if (tierFromUrl && tierLabels[tierFromUrl]) {
            applyTierSelection(tierFromUrl, tierLabels[tierFromUrl]);
        }

        showSnowStep(1);
    }
});

