// Import CSS for Vite hot reloading
import './input.css';

// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const dots = document.querySelectorAll('.dot');
    const viewport = document.querySelector('.carousel-viewport');
    const track = document.querySelector('.carousel-track');
    const originalItems = Array.from(track.querySelectorAll('.carousel-item'));
    const totalItems = originalItems.length;
    let currentIndex = 0;

    // Clone items for infinite loop: add last item before first, first item after last
    if (!track.dataset.cloned && originalItems.length > 1) {
        // Clone last item and prepend
        const lastClone = originalItems[totalItems - 1].cloneNode(true);
        lastClone.removeAttribute('data-index');
        lastClone.dataset.cloneOf = totalItems - 1;
        track.insertBefore(lastClone, originalItems[0]);

        // Clone first item and append
        const firstClone = originalItems[0].cloneNode(true);
        firstClone.removeAttribute('data-index');
        firstClone.dataset.cloneOf = 0;
        track.appendChild(firstClone);

        track.dataset.cloned = 'true';
    }

    const allItems = Array.from(track.querySelectorAll('.carousel-item'));

    // Responsive dimensions
    function getCarouselDimensions() {
        const isMobile = window.innerWidth < 768;
        return {
            ITEM_WIDTH: isMobile ? 380 : 900,
            GAP: isMobile ? 12 : 20
        };
    }

    function setActiveClasses(activeTrackIndex) {
        allItems.forEach((item, i) => {
            item.classList.remove('is-active', 'is-adjacent');
            if (i === activeTrackIndex) {
                item.classList.add('is-active');
            } else if (i === activeTrackIndex - 1 || i === activeTrackIndex + 1) {
                item.classList.add('is-adjacent');
            }
        });
    }

    function updateCarousel(index, instant = false) {
        currentIndex = index;

        // Update tab buttons
        tabBtns.forEach(b => {
            b.classList.remove('active', 'bg-gray-200');
            b.classList.add('bg-transparent');
        });
        tabBtns[index].classList.add('active', 'bg-gray-200');
        tabBtns[index].classList.remove('bg-transparent');

        // Update dots
        dots.forEach(d => d.classList.replace('bg-gray-800', 'bg-gray-400'));
        dots[index].classList.replace('bg-gray-400', 'bg-gray-800');

        // Track index accounts for the prepended clone
        const trackIndex = index + 1;

        // Get responsive dimensions
        const { ITEM_WIDTH, GAP } = getCarouselDimensions();

        // Calculate offset to center the active item
        const viewportWidth = viewport.getBoundingClientRect().width;
        const itemTotalWidth = ITEM_WIDTH + GAP;
        const offset = (trackIndex * itemTotalWidth) - (viewportWidth / 2) + (ITEM_WIDTH / 2);

        track.style.transition = instant ? 'none' : 'transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)';
        track.style.transform = `translateX(${-offset}px)`;

        setActiveClasses(trackIndex);
    }

    // Tab button clicks
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index, 10);
            updateCarousel(index);
        });
    });

    // Dot clicks
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index, 10);
            updateCarousel(index);
        });
    });

    // Carousel item clicks
    allItems.forEach((item) => {
        item.addEventListener('click', () => {
            let index = parseInt(item.dataset.index, 10);
            if (Number.isNaN(index)) {
                index = parseInt(item.dataset.cloneOf, 10);
            }
            if (!Number.isNaN(index)) {
                updateCarousel(index);
            }
        });
    });

    window.addEventListener('resize', () => updateCarousel(currentIndex, true));
    window.addEventListener('load', () => updateCarousel(currentIndex, true));

    // Initial render
    updateCarousel(0, true);

    // Contact Form Handling with Spam Protection
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    // Anti-spam measures
    const formLoadTime = Date.now();
    const RATE_LIMIT_MS = 60000; // 1 minute between submissions
    const MIN_FILL_TIME_MS = 3000; // Must spend at least 3 seconds on form
    const MAX_DAILY_SUBMISSIONS = 3; // Max 3 submissions per day per browser

    // Check localStorage for submission history
    function getSubmissionHistory() {
        try {
            const history = localStorage.getItem('form_submissions');
            return history ? JSON.parse(history) : [];
        } catch {
            return [];
        }
    }

    function addSubmissionRecord() {
        try {
            const history = getSubmissionHistory();
            history.push(Date.now());
            // Keep only last 24 hours
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            const recentHistory = history.filter(time => time > oneDayAgo);
            localStorage.setItem('form_submissions', JSON.stringify(recentHistory));
            return recentHistory.length;
        } catch {
            return 0;
        }
    }

    function getTodaySubmissionCount() {
        const history = getSubmissionHistory();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return history.filter(time => time > oneDayAgo).length;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check daily submission limit
            const todayCount = getTodaySubmissionCount();
            if (todayCount >= MAX_DAILY_SUBMISSIONS) {
                formStatus.textContent = 'You have reached the maximum number of submissions for today. Please try again tomorrow.';
                formStatus.classList.remove('hidden', 'bg-green-500/20', 'text-green-400');
                formStatus.classList.add('bg-red-500/20', 'text-red-400');
                setTimeout(() => formStatus.classList.add('hidden'), 7000);
                return;
            }

            // Check if form was filled too quickly (bot detection)
            const timeSinceLoad = Date.now() - formLoadTime;
            if (timeSinceLoad < MIN_FILL_TIME_MS) {
                formStatus.textContent = 'Please take your time filling out the form.';
                formStatus.classList.remove('hidden', 'bg-green-500/20', 'text-green-400');
                formStatus.classList.add('bg-red-500/20', 'text-red-400');
                setTimeout(() => formStatus.classList.add('hidden'), 5000);
                return;
            }

            // Check rate limiting (from last submission)
            const history = getSubmissionHistory();
            if (history.length > 0) {
                const lastSubmitTime = history[history.length - 1];
                const timeSinceLastSubmit = Date.now() - lastSubmitTime;
                if (timeSinceLastSubmit < RATE_LIMIT_MS) {
                    const remainingSeconds = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000);
                    formStatus.textContent = `Please wait ${remainingSeconds} seconds before submitting again.`;
                    formStatus.classList.remove('hidden', 'bg-green-500/20', 'text-green-400');
                    formStatus.classList.add('bg-red-500/20', 'text-red-400');
                    setTimeout(() => formStatus.classList.add('hidden'), 5000);
                    return;
                }
            }

            // Update button state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);

                // Check honeypot field (if filled, it's a bot)
                const gotcha = formData.get('_gotcha');
                if (gotcha) {
                    throw new Error('Spam detected');
                }

                // Get Turnstile token
                const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
                if (!turnstileResponse || !turnstileResponse.value) {
                    formStatus.textContent = 'Please complete the security verification.';
                    formStatus.classList.remove('hidden', 'bg-green-500/20', 'text-green-400');
                    formStatus.classList.add('bg-red-500/20', 'text-red-400');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    setTimeout(() => formStatus.classList.add('hidden'), 5000);
                    return;
                }

                // Add Turnstile token to form data
                formData.append('cf-turnstile-response', turnstileResponse.value);

                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    addSubmissionRecord(); // Track this submission
                    const remaining = MAX_DAILY_SUBMISSIONS - getTodaySubmissionCount();
                    formStatus.textContent = `Thank you! Your message has been sent successfully.${remaining > 0 ? ` (${remaining} submissions remaining today)` : ''}`;
                    formStatus.classList.remove('hidden', 'bg-red-500/20', 'text-red-400');
                    formStatus.classList.add('bg-green-500/20', 'text-green-400');
                    contactForm.reset();

                    // Reset Turnstile widget
                    if (window.turnstile) {
                        const widget = document.querySelector('.cf-turnstile');
                        if (widget) {
                            window.turnstile.reset(widget);
                        }
                    }
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Error
                formStatus.textContent = 'Oops! Something went wrong. Please try again.';
                formStatus.classList.remove('hidden', 'bg-green-500/20', 'text-green-400');
                formStatus.classList.add('bg-red-500/20', 'text-red-400');
            }

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Hide status after 5 seconds
            setTimeout(() => {
                formStatus.classList.add('hidden');
            }, 5000);
        });
    }
});
