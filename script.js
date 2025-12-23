/**
 * SoftPioneers Website JavaScript
 * Handles animations, navigation, and form submission
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initCounterAnimation();
    initContactForm();
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = navLinks.querySelectorAll('a');

    // Header scroll effect
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Scroll animations using Intersection Observer
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * Counter animation for hero stats
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const duration = 2000; // 2 seconds
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(updateCounter);
}

/**
 * Contact form handling with EmailJS
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validate form
        if (!name || !email || !subject || !message) {
            showFormStatus('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showFormStatus('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Send email using EmailJS
            const response = await sendEmail({ name, email, subject, message });

            if (response.success) {
                showFormStatus('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
                form.reset();
            } else {
                throw new Error(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            // Fallback to mailto if email service fails
            openMailtoFallback(name, email, subject, message);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

/**
 * Send email using FormSubmit.co (free service, no API key needed)
 * First submission will require email confirmation from appbukata@gmail.com
 */
async function sendEmail(data) {
    const { name, email, subject, message } = data;

    // Using FormSubmit.co - a free form submission service
    // First time: They'll send a confirmation email to appbukata@gmail.com
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('_subject', `[SoftPioneers Inquiry] ${subject}`);
    formData.append('message', message);
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');

    try {
        const response = await fetch('https://formsubmit.co/ajax/appbukata@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                _subject: `[SoftPioneers Inquiry] ${subject}`,
                message: message
            })
        });

        const result = await response.json();

        if (result.success === "true" || result.success === true) {
            return { success: true };
        } else {
            return { success: false, message: result.message || 'Service unavailable' };
        }
    } catch (error) {
        // Network error - use mailto fallback
        return { success: false, message: 'Network error' };
    }
}

/**
 * Fallback to mailto link if email service fails
 */
function openMailtoFallback(name, email, subject, message) {
    const recipientEmail = 'appbukata@gmail.com';
    const emailSubject = encodeURIComponent(`[SoftPioneers Inquiry] ${subject}`);
    const emailBody = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject}\n\n` +
        `Message:\n${message}`
    );

    const mailtoLink = `mailto:${recipientEmail}?subject=${emailSubject}&body=${emailBody}`;

    // Show info message
    showFormStatus('Opening your email client... If it doesn\'t open, please email us directly at appbukata@gmail.com', 'success');

    // Open mailto link
    window.location.href = mailtoLink;
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show form status message
 */
function showFormStatus(message, type) {
    const formStatus = document.getElementById('formStatus');
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        formStatus.className = 'form-status';
    }, 5000);
}

/**
 * Add typing effect to code window (optional enhancement)
 */
function initTypingEffect() {
    const codeElement = document.querySelector('.code-body code');
    if (!codeElement) return;

    const originalHTML = codeElement.innerHTML;
    const text = codeElement.textContent;

    // Only animate on larger screens
    if (window.innerWidth < 768) return;

    codeElement.innerHTML = '';
    let index = 0;

    function type() {
        if (index < text.length) {
            codeElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 30);
        } else {
            // Restore original HTML with syntax highlighting
            codeElement.innerHTML = originalHTML;
        }
    }

    // Start typing after a delay
    setTimeout(type, 1000);
}

/**
 * Parallax effect for hero shapes
 */
function initParallax() {
    const shapes = document.querySelectorAll('.shape');

    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.02;
            const x = (clientX - centerX) * speed;
            const y = (clientY - centerY) * speed;

            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Initialize parallax on larger screens
if (window.innerWidth > 1024) {
    initParallax();
}
