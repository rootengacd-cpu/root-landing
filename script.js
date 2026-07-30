/* ==========================================================================
   AUTO-PLC PRO - INTERACTIVE SCRIPT & SIMULATOR LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. PRELOADER & INITIALIZATION
       -------------------------------------------------------------------------- */
    const loader = document.getElementById('loader');
    setTimeout(() => {
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 900);

    /* --------------------------------------------------------------------------
       2. PERMANENT LIGHT THEME CONFIGURATION
       -------------------------------------------------------------------------- */
    document.documentElement.setAttribute('data-theme', 'light');

    /* --------------------------------------------------------------------------
       3. NAVIGATION, STICKY HEADER & SCROLL OFFSET
       -------------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Automatically calculate height of the announcement bar + navbar
    const getHeaderOffset = () => {
        const topBar = document.getElementById('stickyTopBar');
        const topBarHeight = topBar ? topBar.offsetHeight : 0;
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        return topBarHeight + navbarHeight;
    };

    const updateCSSOffset = () => {
        const offset = getHeaderOffset();
        document.documentElement.style.setProperty('--scroll-padding', `${offset} + 16px`);
    };

    window.addEventListener('resize', updateCSSOffset);
    window.addEventListener('load', updateCSSOffset);
    // Call immediately
    setTimeout(updateCSSOffset, 100);

    // Scrollspy logic: update active link on scroll
    const sections = document.querySelectorAll('section[id], footer[id]');
    
    function scrollSpy() {
        const scrollPos = window.scrollY || document.documentElement.scrollTop;
        const offset = getHeaderOffset() + 60; // buffer offset

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop - offset && scrollPos < sectionTop + sectionHeight - offset) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', () => {
        // Toggle scrolled class for visual change
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scrollspy updates
        scrollSpy();

        // Back to top button visibility
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (window.scrollY > 400) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    });

    // Smooth Scroll to target element with offset
    const smoothScrollTo = (targetSelector) => {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        const offset = getHeaderOffset();
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    // Handle clicks on navigation links and CTAs
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();

            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }

            smoothScrollTo(targetId);
        });
    });

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            menuToggle.classList.toggle('active');
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !expanded);
        });
    }

    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* --------------------------------------------------------------------------
       4. HERO BACKGROUND CIRCUIT CANVAS ANIMATION
       -------------------------------------------------------------------------- */
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const numParticles = 45;

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#00f0ff' : '#7000ff'
            });
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Draw circuit connections
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 * (1 - dist / 140)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    /* --------------------------------------------------------------------------
       5. HERO INTERACTIVE PLC & HMI WIDGET
       -------------------------------------------------------------------------- */
    const hmiStartBtn = document.getElementById('hmiStartBtn');
    const hmiStopBtn = document.getElementById('hmiStopBtn');
    const contactX0 = document.getElementById('contactX0');
    const wireLine = document.getElementById('wireLine');
    const coilY0 = document.getElementById('coilY0');
    const ledRun = document.getElementById('ledRun');
    const ledX0 = document.getElementById('ledX0');
    const ledY0 = document.getElementById('ledY0');
    const motorRpmText = document.getElementById('motorRpmText');
    const tankFill = document.getElementById('tankFill');
    const tankVal = document.getElementById('tankVal');
    const hmiTime = document.getElementById('hmiTime');

    let motorRunning = false;
    let tankPercent = 65;

    function updateHmiClock() {
        if (hmiTime) {
            const now = new Date();
            hmiTime.textContent = now.toLocaleTimeString();
        }
    }
    setInterval(updateHmiClock, 1000);
    updateHmiClock();

    if (hmiStartBtn) {
        hmiStartBtn.addEventListener('click', () => {
            motorRunning = true;
            contactX0.classList.add('active');
            wireLine.classList.add('active');
            coilY0.classList.add('active');

            if (ledRun) ledRun.classList.add('on');
            if (ledX0) ledX0.classList.add('on');
            if (ledY0) ledY0.classList.add('on');

            if (motorRpmText) motorRpmText.textContent = '1450 RPM (RUNNING)';
            if (motorRpmText) motorRpmText.style.color = '#10b981';

            // Tank animation
            tankPercent = Math.min(100, tankPercent + 20);
            if (tankFill) tankFill.style.height = tankPercent + '%';
            if (tankVal) tankVal.textContent = tankPercent + '%';
        });
    }

    if (hmiStopBtn) {
        hmiStopBtn.addEventListener('click', () => {
            motorRunning = false;
            contactX0.classList.remove('active');
            wireLine.classList.remove('active');
            coilY0.classList.remove('active');

            if (ledRun) ledRun.classList.remove('on');
            if (ledX0) ledX0.classList.remove('on');
            if (ledY0) ledY0.classList.remove('on');

            if (motorRpmText) motorRpmText.textContent = '0 RPM (STOPPED)';
            if (motorRpmText) motorRpmText.style.color = '#ef4444';

            tankPercent = 30;
            if (tankFill) tankFill.style.height = tankPercent + '%';
            if (tankVal) tankVal.textContent = tankPercent + '%';
        });
    }

    /* --------------------------------------------------------------------------
       6. INTERACTIVE DEMO SIMULATOR TABS & LADDER LOGIC TESTER
       -------------------------------------------------------------------------- */
    const simTabBtns = document.querySelectorAll('.sim-tab-btn');
    const simTabContents = document.querySelectorAll('.sim-tab-content');

    simTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            simTabBtns.forEach(b => b.classList.remove('active'));
            simTabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetElem = document.getElementById(target);
            if (targetElem) targetElem.classList.add('active');
        });
    });

    // Ladder logic interactive elements
    const elementX0 = document.getElementById('elementX0');
    const elementX1 = document.getElementById('elementX1');
    const conn1 = document.getElementById('conn1');
    const elementY0 = document.getElementById('elementY0');
    const elementT0 = document.getElementById('elementT0');
    const conn2 = document.getElementById('conn2');
    const elementY1 = document.getElementById('elementY1');
    const resetSimBtn = document.getElementById('resetSimBtn');
    const ladderExpText = document.getElementById('ladderExpText');

    let isX0On = false;
    let isX1On = true; // NC contact

    function updateLadderState() {
        if (isX0On && isX1On) {
            elementX0.classList.add('active');
            elementX0.querySelector('.elem-state').textContent = 'ON';
            conn1.classList.add('active');
            elementY0.classList.add('active');
            elementY0.querySelector('.elem-state').textContent = 'ENERGIZED';

            // Timer triggers
            elementT0.classList.add('active');
            elementT0.querySelector('.elem-state').textContent = 'TIMED OUT';
            conn2.classList.add('active');
            elementY1.classList.add('active');
            elementY1.querySelector('.elem-state').textContent = 'ACTIVE';

            if (ladderExpText) {
                ladderExpText.innerHTML = '⚡ <strong>Power Flow Complete!</strong> X0 Start is CLOSED and X1 Stop is NC. Circuit path energized Pump Motor Y0 and triggered Solenoid Y1!';
            }
        } else {
            elementX0.classList.remove('active');
            elementX0.querySelector('.elem-state').textContent = 'OFF';
            conn1.classList.remove('active');
            elementY0.classList.remove('active');
            elementY0.querySelector('.elem-state').textContent = 'OFF';

            elementT0.classList.remove('active');
            elementT0.querySelector('.elem-state').textContent = 'OFF';
            conn2.classList.remove('active');
            elementY1.classList.remove('active');
            elementY1.querySelector('.elem-state').textContent = 'OFF';

            if (ladderExpText) {
                ladderExpText.innerHTML = 'Click on <strong>START (X0)</strong> contact to energize Pump Motor <strong>(Y0)</strong>. Test how opening X1 breaks continuity!';
            }
        }
    }

    if (elementX0) {
        elementX0.addEventListener('click', () => {
            isX0On = !isX0On;
            updateLadderState();
        });
    }

    if (elementX1) {
        elementX1.addEventListener('click', () => {
            isX1On = !isX1On;
            elementX1.querySelector('.elem-state').textContent = isX1On ? 'NC' : 'OPEN (TRIPPED)';
            updateLadderState();
        });
    }

    if (resetSimBtn) {
        resetSimBtn.addEventListener('click', () => {
            isX0On = false;
            isX1On = true;
            elementX1.querySelector('.elem-state').textContent = 'NC';
            updateLadderState();
        });
    }

    /* --------------------------------------------------------------------------
       7. SYLLABUS ACCORDION & CATEGORY FILTERING
       -------------------------------------------------------------------------- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const moduleItems = document.querySelectorAll('.module-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            moduleItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    const moduleHeaders = document.querySelectorAll('.module-header');
    moduleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const expanded = header.getAttribute('aria-expanded') === 'true';

            header.setAttribute('aria-expanded', !expanded);
            body.classList.toggle('open');
        });
    });



    /* --------------------------------------------------------------------------
       10. FAQ ACCORDION & INSTANT SEARCH FILTER
       -------------------------------------------------------------------------- */
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const answer = q.nextElementSibling;
            const expanded = q.getAttribute('aria-expanded') === 'true';

            q.setAttribute('aria-expanded', !expanded);
            answer.classList.toggle('open');
        });
    });

    const faqSearchInput = document.getElementById('faqSearchInput');
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            faqItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    /* --------------------------------------------------------------------------
       11. UPI COPY ID & OFFER COUNTDOWN TIMER
       -------------------------------------------------------------------------- */
    const copyUpiBtn = document.getElementById('copyUpiBtn');
    const copyToast = document.getElementById('copyToast');

    if (copyUpiBtn) {
        copyUpiBtn.addEventListener('click', () => {
            const upiIdElem = document.getElementById('upiId');
            if (!upiIdElem) return;
            const upiIdText = upiIdElem.textContent.trim();
            navigator.clipboard.writeText(upiIdText).then(() => {
                const btnSpan = copyUpiBtn.querySelector('span');
                const originalText = btnSpan ? btnSpan.textContent : 'Copy UPI ID';
                if (btnSpan) btnSpan.textContent = 'Copied!';
                if (copyToast) copyToast.classList.add('show');

                setTimeout(() => {
                    if (btnSpan) btnSpan.textContent = originalText;
                    if (copyToast) copyToast.classList.remove('show');
                }, 2000);
            });
        });
    }

    /* --------------------------------------------------------------------------
       11. STICKY ENROLLMENT COUNTDOWN & OFFER DEADLINE (Target: 1st August 2026, 3:00 PM IST)
       -------------------------------------------------------------------------- */
    const DEADLINE_TIMESTAMP = new Date('2026-08-01T15:00:00+05:30').getTime();

    function updateCountdownTimer() {
        const now = new Date().getTime();
        const diff = DEADLINE_TIMESTAMP - now;

        const timerDays = document.getElementById('timerDays');
        const timerHours = document.getElementById('timerHours');
        const timerMins = document.getElementById('timerMins');
        const timerSecs = document.getElementById('timerSecs');
        const timerBoxes = document.getElementById('timerBoxes');
        const timerLabel = document.getElementById('timerLabel');
        const timerClosedText = document.getElementById('timerClosedText');
        const paymentExpiredAlert = document.getElementById('paymentExpiredAlert');

        if (diff > 0) {
            // Before Deadline
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            if (timerDays) timerDays.textContent = days.toString().padStart(2, '0');
            if (timerHours) timerHours.textContent = hours.toString().padStart(2, '0');
            if (timerMins) timerMins.textContent = mins.toString().padStart(2, '0');
            if (timerSecs) timerSecs.textContent = secs.toString().padStart(2, '0');
        } else {
            // After Deadline (Expired State)
            if (timerBoxes) timerBoxes.style.display = 'none';
            if (timerLabel) timerLabel.style.display = 'none';
            if (timerClosedText) {
                timerClosedText.textContent = '⛔ Offer Expired';
                timerClosedText.style.display = 'inline-block';
            }

            // Disable all Enroll Now buttons
            const enrollBtns = document.querySelectorAll('.nav-enroll-btn, .glow-btn, .mobile-enroll-btn, .btn-submit, .btn-top-enroll');
            enrollBtns.forEach(btn => {
                btn.classList.add('disabled-btn');
                btn.setAttribute('disabled', 'true');
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.55';
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = 'Offer Expired';
                } else {
                    btn.textContent = 'Offer Expired';
                }
            });

            // Display exact requested message:
            if (paymentExpiredAlert) {
                paymentExpiredAlert.textContent = 'The Early Enrollment Offer has ended. Please contact our Academic Counsellor for upcoming batches.';
                paymentExpiredAlert.style.display = 'block';
            }

            // Update urgency badges to closed message
            document.querySelectorAll('.hero-urgency-badge, .payment-urgency-badge').forEach(el => {
                el.innerHTML = '⛔ <strong>Offer Expired:</strong> The Early Enrollment Offer has ended. Please contact our Academic Counsellor for upcoming batches.';
                el.classList.add('closed');
            });
            const mobileUrgencyText = document.getElementById('mobileUrgencyText');
            if (mobileUrgencyText) mobileUrgencyText.textContent = '⛔ Offer Expired';
        }
    }

    updateCountdownTimer();
    setInterval(updateCountdownTimer, 1000);

    /* --------------------------------------------------------------------------
       12. PAYMENT FORM HANDLING & FILE UPLOAD PREVIEW
       -------------------------------------------------------------------------- */
    const fileUpload = document.getElementById('fileUpload');
    const screenshotInput = document.getElementById('screenshot');
    const filePreviewBox = document.getElementById('filePreviewBox');
    const filePreviewImg = document.getElementById('filePreviewImg');
    const fileName = document.getElementById('fileName');
    const removeFileBtn = document.getElementById('removeFileBtn');

    if (fileUpload && screenshotInput) {
        fileUpload.addEventListener('click', () => screenshotInput.click());

        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.style.borderColor = 'var(--accent-cyan)';
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.style.borderColor = 'var(--border-color)';
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.style.borderColor = 'var(--border-color)';
            if (e.dataTransfer.files.length) {
                screenshotInput.files = e.dataTransfer.files;
                handleFilePreview(e.dataTransfer.files[0]);
            }
        });

        screenshotInput.addEventListener('change', () => {
            if (screenshotInput.files.length) {
                handleFilePreview(screenshotInput.files[0]);
            }
        });
    }

    function handleFilePreview(file) {
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (filePreviewImg) filePreviewImg.src = e.target.result;
                if (fileName) fileName.textContent = file.name;
                if (filePreviewBox) filePreviewBox.classList.add('active');
            };
            reader.readAsDataURL(file);
        }
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            screenshotInput.value = '';
            filePreviewBox.classList.remove('active');
        });
    }

    // Google Apps Script Web App URL - Paste your deployment URL here to connect to Google Sheets
    const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyDdtLgysM50r5HXws1D08_C4BRPkHJl8G-93BOTPuu5w5l251MEwa3HqMhCMxHQ3VBRQ/exec"; 

    const paymentForm = document.getElementById('paymentForm');
    const formSuccess = document.getElementById('formSuccess');

    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = paymentForm.querySelector('.btn-submit');
            const submitBtnText = submitBtn ? submitBtn.querySelector('span') : null;
            const originalBtnText = submitBtnText ? submitBtnText.textContent : 'Submit Enrollment Confirmation';

            // Get form values
            const fullName = document.getElementById('fullName').value.trim();
            const mobile = document.getElementById('mobile').value.trim();
            const email = document.getElementById('email').value.trim();
            const transactionId = document.getElementById('transactionId').value.trim();
            const screenshotFile = screenshotInput.files[0];

            if (!fullName || !mobile || !email || !transactionId || !screenshotFile) {
                alert('Please fill out all required fields and upload the payment screenshot.');
                return;
            }

            // Disable button and show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
            }
            if (submitBtnText) submitBtnText.textContent = 'Submitting...';

            const showSuccessState = () => {
                paymentForm.style.display = 'none';
                if (formSuccess) formSuccess.classList.add('active');
            };

            const resetSubmitButton = () => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }
                if (submitBtnText) submitBtnText.textContent = originalBtnText;
            };

            // Read the file as base64 to send to Google Sheets
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result.split(',')[1];
                
                const payload = {
                    fullName: fullName,
                    mobile: mobile,
                    email: email,
                    transactionId: transactionId,
                    screenshotData: base64Data,
                    screenshotName: screenshotFile.name,
                    screenshotType: screenshotFile.type
                };

                if (!GOOGLE_SHEET_WEBAPP_URL) {
                    console.log("No GOOGLE_SHEET_WEBAPP_URL configured. Simulating submission:", payload);
                    setTimeout(() => {
                        showSuccessState();
                        resetSubmitButton();
                    }, 1000);
                    return;
                }

                // POST to Google Apps Script Web App
                fetch(GOOGLE_SHEET_WEBAPP_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Apps Script requires no-cors for simple fetch redirects
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(payload)
                })
                .then(() => {
                    // With no-cors, the response is opaque, so we assume success if the promise resolves
                    showSuccessState();
                    resetSubmitButton();
                })
                .catch((error) => {
                    console.error("Submission error:", error);
                    alert("There was an issue sending your registration. Please try again or contact support.");
                    resetSubmitButton();
                });
            };

            reader.onerror = function() {
                alert("Error reading the screenshot file. Please try again.");
                resetSubmitButton();
            };

            reader.readAsDataURL(screenshotFile);
        });
    }

    /* --------------------------------------------------------------------------
       13. WHATSAPP POPOVER & CLOSE
       -------------------------------------------------------------------------- */
    const popoverClose = document.getElementById('popoverClose');
    const whatsappPopover = document.getElementById('whatsappPopover');

    if (popoverClose && whatsappPopover) {
        popoverClose.addEventListener('click', () => {
            whatsappPopover.style.display = 'none';
        });
    }

    /* --------------------------------------------------------------------------
       14. SCROLL REVEAL OBSERVER
       -------------------------------------------------------------------------- */
    const observerOptions = {
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    /* --------------------------------------------------------------------------
       15. QR CODE PAYMENT MODAL LOGIC
       -------------------------------------------------------------------------- */
    const qrModal = document.getElementById('qrModal');
    const openQrBtn = document.getElementById('openQrBtn');
    const closeQrBtn = document.getElementById('closeQrBtn');

    const openModal = () => {
        if (qrModal) {
            qrModal.style.display = 'flex';
            // Trigger layout reflow for css animation
            qrModal.offsetHeight; 
            qrModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Disable scroll under popup
        }
    };

    const closeModal = () => {
        if (qrModal) {
            qrModal.classList.remove('active');
            setTimeout(() => {
                qrModal.style.display = 'none';
            }, 300);
            document.body.style.overflow = ''; // Enable scroll
        }
    };

    if (openQrBtn) {
        openQrBtn.addEventListener('click', openModal);
    }

    if (closeQrBtn) {
        closeQrBtn.addEventListener('click', closeModal);
    }

    // Close on overlay background click
    if (qrModal) {
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                closeModal();
            }
        });
    }

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qrModal && qrModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Also auto-open modal when any "Enroll Now" links/buttons are clicked
    // and they scroll down to the payment section
    document.querySelectorAll('.nav-enroll-btn, .mobile-enroll-btn, .btn-top-enroll, .hero-enroll-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (href === '#payment') {
                e.preventDefault();
                const targetElement = document.querySelector('#payment');
                if (targetElement) {
                    const offset = getHeaderOffset();
                    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Open the modal after the scroll finishes
                    setTimeout(openModal, 600);
                }
            }
        });
    });

});
