document.addEventListener('DOMContentLoaded', () => {
    // Device Detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLowPowerDevice = window.innerWidth < 768; // Simple proxy

    // Custom Cursor Elements - Always create and let CSS handle visibility
    let cursorMain = document.createElement('div');
    let cursorGlow = document.createElement('div');
    cursorMain.classList.add('cursor-main');
    cursorGlow.classList.add('cursor-glow');
    document.body.appendChild(cursorMain);
    document.body.appendChild(cursorGlow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let lastParticleTime = 0;
    const particleInterval = 30; // milliseconds between particles

    // 0. Theme Toggle Logic (Cosmic Shift)
    const profilePic = document.querySelector('.profile-pic');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    if (profilePic) {
        profilePic.style.cursor = 'pointer'; // Ensure it looks clickable
        profilePic.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (cursorMain) {
            // Main cursor follows immediately
            cursorMain.style.left = mouseX + 'px';
            cursorMain.style.top = mouseY + 'px';

            // Create particle trail
            const currentTime = Date.now();
            if (currentTime - lastParticleTime > particleInterval) {
                createParticle(mouseX, mouseY);
                lastParticleTime = currentTime;
            }
        }
    });

    // Create particle function
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.classList.add('cursor-particle');
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random size variation
        const size = Math.random() * 4 + 4; // 4-8px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 800);
    }

    // Smooth glow animation
    function animateGlow() {
        if (cursorGlow) {
            // Lerp for smooth trailing glow
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
        }
        
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // 6. Dynamic Cursor Interaction (Event Delegation)
    const smallTargets = '.tags span, .social-links a, .card-links a, .nav-links a, i, .ki-spark';
    const largeTargets = 'a, button, .btn, textarea, input, .project-card, .interests-container';

    document.body.addEventListener('mouseover', (e) => {
        const target = e.target;
        
        if (target.closest(smallTargets)) {
            document.body.classList.add('cursor-shrink');
        } else if (target.closest(largeTargets)) {
            document.body.classList.add('cursor-hover');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        document.body.classList.remove('cursor-hover');
        document.body.classList.remove('cursor-shrink');
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        if (cursorMain) cursorMain.style.opacity = '0';
        if (cursorGlow) cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        if (cursorMain) cursorMain.style.opacity = '1';
        if (cursorGlow) cursorGlow.style.opacity = '1';
    });

    // Initialize Supabase
    const SUPABASE_URL = 'https://mxkpcgmujyzuljspslqr.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_HxpoNXfpVP9GuiAD6y9-tA_OrnrkTXH';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Animated Gradient Mesh Background
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let time = 0;
        let gradientPoints = [];
        let mouse = { x: width / 2, y: height / 2 };

        // Resize
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            mouse.x = width / 2;
            mouse.y = height / 2;
            initGradientPoints();
        };

        // Gradient Point Class
        class GradientPoint {
            constructor(x, y, index) {
                this.baseX = x;
                this.baseY = y;
                this.x = x;
                this.y = y;
                this.index = index;
                this.radius = Math.random() * 200 + 150;
                this.speed = Math.random() * 0.0005 + 0.0002;
                this.angle = Math.random() * Math.PI * 2;
                this.color = index % 2 === 0 ? 
                    { r: 0, g: 229, b: 255, a: 0.1 } : // UI Cyan
                    { r: 224, g: 250, b: 255, a: 0.1 };  // UI Silver/White
            }

            update() {
                // Circular motion
                this.angle += this.speed;
                const offsetX = Math.cos(this.angle + time * 0.5) * 30;
                const offsetY = Math.sin(this.angle + time * 0.5) * 30;
                
                this.x = this.baseX + offsetX;
                this.y = this.baseY + offsetY;

                // Mouse influence
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 300) {
                        const force = (300 - distance) / 300 * 20;
                        this.x += (dx / distance) * force;
                        this.y += (dy / distance) * force;
                    }
                }
            }

            draw() {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );

                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`);
                gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a * 0.5})`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
        }

        const initGradientPoints = () => {
            gradientPoints = [];
            // Optimize grid density based on device performance
            const cols = isLowPowerDevice ? 3 : 4;
            const rows = isLowPowerDevice ? 2 : 3;
            const spacingX = width / (cols + 1);
            const spacingY = height / (rows + 1);

            let index = 0;
            for (let row = 1; row <= rows; row++) {
                for (let col = 1; col <= cols; col++) {
                    const x = col * spacingX;
                    const y = row * spacingY;
                    gradientPoints.push(new GradientPoint(x, y, index++));
                }
            }
        };

        const drawGrid = () => {
            // Ultra-subtle grid overlay
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.02)';
            ctx.lineWidth = 1;

            const spacing = 50;
            
            // Vertical lines
            for (let x = 0; x < width; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y < height; y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        };

        const drawNoise = () => {
            // Add subtle noise texture for depth
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (Math.random() > 0.98) {
                    const noise = Math.random() * 10;
                    data[i] += noise;     // R
                    data[i + 1] += noise; // G
                    data[i + 2] += noise; // B
                }
            }

            ctx.putImageData(imageData, 0, 0);
        };

        const animate = () => {
            time += 0.01;

            // Clear with transparency to show body background
            ctx.clearRect(0, 0, width, height);

            // Draw gradient points (layered)
            gradientPoints.forEach(point => {
                point.update();
                point.draw();
            });

            // Optional: Add subtle grid
            // drawGrid();

            // Optional: Add film grain effect (comment out if too heavy)
            // if (Math.random() > 0.95) drawNoise();

            requestAnimationFrame(animate);
        };

        // Mouse tracking
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = width / 2;
            mouse.y = height / 2;
        });

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // 2. Magnetic Buttons (New Feature)
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .social-links a');
    buttons.forEach(btn => {
        if (!isTouchDevice) {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Magnetic pull strength
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        }

        // Fire Blast Effect on click/touch
        const handleClick = (e) => {
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (Math.random() > 0.7) {
                createDragonFire(clientX, clientY);
            } else {
                createFireBlast(clientX, clientY);
            }
        };

        btn.addEventListener('mousedown', handleClick);
        btn.addEventListener('touchstart', handleClick, { passive: true });
    });

    // --- HYBRID INFINITE + SWIPEABLE CAROUSEL ---
    const marqueeContainer = document.querySelector('.carousel-3d-container');
    const marqueeTrack = document.querySelector('.carousel-3d-track');
    const firstGroup = document.querySelector('.carousel-3d');
    
    if (marqueeContainer && marqueeTrack && firstGroup) {
        // Clone the first group to ensure seamless looping
        const secondGroup = firstGroup.cloneNode(true);
        marqueeTrack.appendChild(secondGroup);

        let isDown = false;
        let startX;
        let scrollLeftBase;
        let isHovered = false;
        let driftSpeed = 0.8; // Refined slower speed
        let animationId;

        // Auto-drift function
        const drift = () => {
            if (!isDown && !isHovered) {
                marqueeContainer.scrollLeft += driftSpeed;
                
                // If we've scrolled past the first group, reset to start
                if (marqueeContainer.scrollLeft >= firstGroup.offsetWidth) {
                    marqueeContainer.scrollLeft = 0;
                }
            }
            animationId = requestAnimationFrame(drift);
        };

        // Start drifting
        // Start drifting
        drift();

        // Interaction Listeners (Mouse)
        marqueeContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - marqueeContainer.offsetLeft;
            scrollLeftBase = marqueeContainer.scrollLeft;
        });

        marqueeContainer.addEventListener('mouseleave', () => {
            isDown = false;
            isHovered = false;
        });

        marqueeContainer.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        marqueeContainer.addEventListener('mouseup', () => {
            isDown = false;
        });

        marqueeContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - marqueeContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            marqueeContainer.scrollLeft = scrollLeftBase - walk;
            
            // Loop while dragging
            if (marqueeContainer.scrollLeft >= firstGroup.offsetWidth) {
                marqueeContainer.scrollLeft = 0;
                startX = e.pageX - marqueeContainer.offsetLeft;
                scrollLeftBase = 0;
            } else if (marqueeContainer.scrollLeft <= 0) {
                marqueeContainer.scrollLeft = firstGroup.offsetWidth;
                startX = e.pageX - marqueeContainer.offsetLeft;
                scrollLeftBase = firstGroup.offsetWidth;
            }
        });

        // Interaction Listeners (Touch)
        marqueeContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            isHovered = true;
            startX = e.touches[0].pageX - marqueeContainer.offsetLeft;
            scrollLeftBase = marqueeContainer.scrollLeft;
        });

        marqueeContainer.addEventListener('touchend', () => {
            isDown = false;
            isHovered = false;
        });

        marqueeContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - marqueeContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            marqueeContainer.scrollLeft = scrollLeftBase - walk;
            
            if (marqueeContainer.scrollLeft >= firstGroup.offsetWidth) {
                marqueeContainer.scrollLeft = 0;
                startX = e.touches[0].pageX - marqueeContainer.offsetLeft;
                scrollLeftBase = 0;
            } else if (marqueeContainer.scrollLeft <= 0) {
                marqueeContainer.scrollLeft = firstGroup.offsetWidth;
                startX = e.touches[0].pageX - marqueeContainer.offsetLeft;
                scrollLeftBase = firstGroup.offsetWidth;
            }
        });
    }

    // Dragon Fire Function
    function createDragonFire(x, y) {
        const fire = document.createElement('div');
        fire.className = 'dragon-fire';
        fire.style.left = x + 'px';
        fire.style.top = y + 'px';
        document.body.appendChild(fire);
        
        // Screenshake effect
        document.body.style.animation = 'shake 0.2s cubic-bezier(.36,.07,.19,.97) both';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 200);

        setTimeout(() => fire.remove(), 1000);
    }

    // Fire Blast Animation Function
    function createFireBlast(x, y) {
        const blast = document.createElement('div');
        blast.className = 'fire-blast';
        blast.style.left = x + 'px';
        blast.style.top = y + 'px';
        document.body.appendChild(blast);

        // Add spark burst
        for (let i = 0; i < 20; i++) {
            const spark = document.createElement('div');
            spark.className = 'ki-spark';
            spark.style.left = x + 'px';
            spark.style.top = y + 'px';
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 10 + 5;
            const tx = Math.cos(angle) * 150;
            const ty = Math.sin(angle) * 150;
            
            spark.style.setProperty('--tx', `${tx}px`);
            spark.style.setProperty('--ty', `${ty}px`);
            
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 800);
        }

        setTimeout(() => blast.remove(), 600);
    }

    // 4. Subtle Professional Card Interaction
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set variables for the CSS gradient hover effect
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Very subtle tilt (minimal for professional look)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3; // 3 degrees max
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            card.style.willChange = 'transform';
        });

        // 'Hyper-Glow' Ignition Effect on Click
        card.addEventListener('mousedown', () => {
            // Remove from others for a single-focus 'Hero' feel
            document.querySelectorAll('.project-card').forEach(c => {
                if(c !== card) c.classList.remove('ki-active');
            });
            card.classList.toggle('ki-active');
        });

        // Touch interaction for mobile
        card.addEventListener('touchstart', () => {
            card.classList.add('ki-active');
            // Flash effect for touch
            setTimeout(() => card.classList.remove('ki-active'), 1500);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) translateY(0) rotateX(0) rotateY(0)';
        });
    });

    // Handle tilt for other containers separately with more standard tilt
    const otherContainers = document.querySelectorAll('.interests-container, .contact-form');
    otherContainers.forEach(container => {
        if (!isTouchDevice) {
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((e.clientY - rect.top - centerY) / centerY) * -5;
                const rotateY = ((e.clientX - rect.left - centerX) / centerX) * 5;
                container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            container.addEventListener('mouseleave', () => {
                container.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        }
    });

    // 5. Loop-Style Scroll & Marquee Reveal
    const observerOptions = {
        threshold: 0.2, // Trigger earlier/later for smoother loop
        rootMargin: '0px -50px 0px -50px' // Offset slightly for horizontal marquee cards
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            } else {
                // Return to 'down' state when exiting
                entry.target.classList.remove('reveal-active');
            }
        });
    }, observerOptions);

    // Dynamic selection to catch all revealable elements
    const revealElements = document.querySelectorAll('.project-card, .interests-list li, .section-title, .form-group, .interests-container, .contact-form, .hero-info, .profile-container');
    
    revealElements.forEach(el => {
        el.classList.add('reveal-item');
        observer.observe(el);
    });

    // 6. Typewriter Effect
    const roleElement = document.querySelector('.role');
    if (roleElement) {
        const roles = [
            "Creative Developer",
            "UI/UX Designer",
            "Full Stack Engineer",
            "Tech Enthusiast"
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 80;

        const type = () => {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                roleElement.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 40;
            } else {
                roleElement.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 80;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                typeSpeed = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 300;
            }

            setTimeout(type, typeSpeed);
        };
        setTimeout(type, 1000);
    }

    // 7. Supabase Handlers (Preserved Logic) - Contact form code follows...
    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            btn.textContent = 'Sending...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            try {
                if (SUPABASE_URL === 'YOUR_SUPABASE_URL') throw new Error('Configure Supabase keys!');

                const { error } = await supabase
                    .from('contacts')
                    .insert([{ name, email, message }]);

                if (error) throw error;

                btn.textContent = 'Message Sent!';
                btn.style.background = 'var(--accent-color)';
                btn.style.color = '#000';
                contactForm.reset();
            } catch (error) {
                console.error("Error sending message: ", error);
                if (error.message.includes('Configure Supabase')) alert('Check script.js for Supabase keys');
                btn.textContent = 'Error! Try Again.';
                btn.style.background = '#ff4444';
            }

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = 'transparent';
                btn.style.color = 'var(--accent-color)';
                btn.style.opacity = '1';
            }, 3000);
        });
    }

    // Rating Form Handler
    const ratingForm = document.getElementById('rating-form');
    if (ratingForm) {
        ratingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = ratingForm.querySelector('button');
            const originalText = btn.textContent;
            
            const name = document.getElementById('rating-name').value;
            const email = document.getElementById('rating-email').value;
            const rating = parseInt(document.getElementById('rating').value);
            const review = document.getElementById('review').value;

            if (rating === 0) {
                alert('Please select a star rating!');
                return;
            }

            btn.textContent = 'Submitting...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            try {
                if (SUPABASE_URL === 'YOUR_SUPABASE_URL') throw new Error('Configure Supabase keys!');

                const { error } = await supabase
                    .from('ratings')
                    .insert([{ name, email, rating, review }]);

                if (error) throw error;

                btn.textContent = 'Thank You!';
                btn.style.background = 'var(--accent-color)';
                btn.style.color = '#000';
                ratingForm.reset();
                
                // Reset stars
                const starRating = document.getElementById('star-rating');
                if (starRating) {
                    const stars = starRating.querySelectorAll('i');
                    stars.forEach(star => {
                        star.classList.remove('fa-solid', 'hover-active');
                        star.classList.add('fa-regular');
                    });
                    document.getElementById('rating').value = 0;
                }
            } catch (error) {
                console.error("Error submitting review: ", error);
                if (error.message.includes('Configure Supabase')) alert('Check script.js keys');
                btn.textContent = 'Error! Try Again.';
                btn.style.background = '#ff4444';
            }

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = 'transparent';
                btn.style.color = 'var(--accent-color)';
                btn.style.opacity = '1';
            }, 3000);
        });
    }

    // Rating Logic
    const avgContainer = document.getElementById('avg-rating-container');
     if(avgContainer) {
         
         const starRating = document.getElementById('star-rating');
         const ratingInput = document.getElementById('rating');
 
         if (starRating) {
             const stars = starRating.querySelectorAll('i');
             let selectedRating = 0;
 
             stars.forEach((star, index) => {
                 star.addEventListener('click', () => {
                     if (selectedRating === index + 1) {
                         selectedRating = 0;
                     } else {
                         selectedRating = index + 1;
                     }
                     ratingInput.value = selectedRating;
                     updateStars(selectedRating);
                 });
 
                 star.addEventListener('mouseenter', () => {
                     updateStars(index + 1, true);
                 });
             });
 
             starRating.addEventListener('mouseleave', () => {
                 updateStars(selectedRating);
             });
 
             function updateStars(rating, isHover = false) {
                 stars.forEach((star, index) => {
                     if (index < rating) {
                         star.classList.remove('fa-regular');
                         star.classList.add('fa-solid');
                         if (isHover) star.classList.add('hover-active');
                     } else {
                         star.classList.remove('fa-solid', 'hover-active');
                         star.classList.add('fa-regular');
                     }
                 });
             }
         }
         
         // Average Rating Fetch
         (async () => {
            const starsFill = document.getElementById('stars-fill');
            try {
                if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
                    avgContainer.style.opacity = '0';
                    return;
                }
                const { data, error } = await supabase.from('ratings').select('rating');
                if (data && data.length > 0) {
                    const total = data.reduce((sum, item) => sum + item.rating, 0);
                    const average = total / data.length;
                    const percentage = (average / 5) * 100;
                    if (starsFill) starsFill.style.width = `${percentage}%`;
                    avgContainer.querySelector('.star-rating-display').title = `${average.toFixed(1)} / 5 (${data.length} reviews)`;
                    avgContainer.style.opacity = '1';
                } else {
                    avgContainer.style.opacity = '1';
                }
            } catch (e) { console.error(e); }
         })();
     }

});
