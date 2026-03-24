document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progressBar');
    const container = document.getElementById('mainContainer');
    const canvas = document.getElementById('masterpieceCanvas');
    const ctx = canvas.getContext('2d');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    const navItems = document.querySelectorAll('.nav-item');

    // 1. Canvas Masterpiece (Hearts + Bokeh)
    let particles = [];
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(type) {
            this.type = type;
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 200;
            if (this.type === 'heart') {
                this.size = Math.random() * 14 + 5;
                this.speed = Math.random() * 1.0 + 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                // Gold and Rose colors
                const colors = ['rgba(212, 175, 55, ', 'rgba(255, 182, 193, ', 'rgba(255, 105, 180, '];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            } else {
                this.size = Math.random() * 100 + 30;
                this.speed = Math.random() * 0.5 + 0.1;
                this.opacity = Math.random() * 0.15 + 0.05;
                this.color = `rgba(212, 175, 55, `;
            }
            this.angle = Math.random() * Math.PI * 2;
            this.drift = Math.random() * 0.6 - 0.3;
        }
        update() {
            this.y -= this.speed;
            this.x += Math.sin(this.angle) * this.drift;
            this.angle += 0.015;
            if (this.y < -100) this.reset();
        }
        draw() {
            ctx.fillStyle = this.color + this.opacity + ')';
            if (this.type === 'heart') {
                this.drawHeart(this.x, this.y, this.size);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        drawHeart(x, y, s) {
            ctx.beginPath();
            ctx.moveTo(x, y + s / 4);
            ctx.quadraticCurveTo(x, y, x + s / 4, y);
            ctx.quadraticCurveTo(x + s / 2, y, x + s / 2, y + s / 4);
            ctx.quadraticCurveTo(x + s / 2, y, x + s * 3 / 4, y);
            ctx.quadraticCurveTo(x + s, y, x + s, y + s / 4);
            ctx.quadraticCurveTo(x + s, y + s / 2, x + s / 2, y + s * 3 / 4);
            ctx.quadraticCurveTo(x, y + s / 2, x, y + s / 4);
            ctx.fill();
        }
    }

    const pCount = window.innerWidth < 768 ? 50 : 100;
    for (let i = 0; i < pCount; i++) {
        particles.push(new Particle(i % 4 === 0 ? 'bokeh' : 'heart'));
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();

    // 2. 3D Mouse Tilt (Limited on Hero for better centering stability)
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 15;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 15;
        
        document.querySelectorAll('.glass').forEach(glass => {
            const speed = 0.05;
            const gx = mouseX * speed * 2;
            const gy = mouseY * speed * 2;
            // Apply only subtle tilt, keep translate minimal for centering
            glass.style.transform = `rotateX(${-gy}deg) rotateY(${gx}deg) translateZ(10px)`;
        });
    });

    // 3. Scroll Logic
    container.addEventListener('scroll', () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const scrollFraction = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollFraction + '%';

        let current = "";
        document.querySelectorAll('.section').forEach(section => {
            if (scrollTop >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === current) {
                item.classList.add('active');
            }
        });
    });

    window.scrollToId = (id) => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            scrollToId(item.getAttribute('data-target'));
        });
    });

    // 4. Reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const v = entry.target.querySelector('video');
                if (v) v.play().catch(() => {});
            } else {
                const v = entry.target.querySelector('video');
                if (v) v.pause();
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .glass').forEach(el => {
        revealObserver.observe(el);
    });

    // 5. Music Logic
    let isPlaying = false;

    const startMusic = (e) => {
        if (!isPlaying) {
            console.log("Attempting to start music...");
            bgMusic.play().then(() => {
                console.log("Music started successfully");
                isPlaying = true;
                musicToggle.querySelector('.status-text').innerText = 'Музыка вкл.';
            }).catch((error) => {
                console.error("Music playback failed:", error);
                // If it's the toggle button, show the alert
                if (e && e.currentTarget === musicToggle) {
                    alert("Ошибка: Не удалось воспроизвести 'music.mp3'. Убедитесь, что файл в правильном формате и находится в папке с сайтом.");
                }
            });
        }
    };

    // Try to play on first click anywhere
    document.addEventListener('click', startMusic, { once: true });

    musicToggle.addEventListener('click', (e) => {
        // We don't stop propagation so the global listener can also try to fire (once)
        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
            musicToggle.querySelector('.status-text').innerText = 'Музыка выкл.';
        } else {
            startMusic(e);
        }
    });

    // Burst Click Effect
    document.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'VIDEO') {
            for (let i = 0; i < 6; i++) {
                const h = document.createElement('div');
                h.innerHTML = '❤️';
                h.style.cssText = `
                    position: fixed;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    font-size: ${Math.random() * 25 + 10}px;
                    pointer-events: none;
                    transition: all 1.8s cubic-bezier(0.19, 1, 0.22, 1);
                    z-index: 10000;
                    color: ${Math.random() > 0.5 ? '#d4af37' : '#ffb2c1'};
                `;
                document.body.appendChild(h);
                const tx = (Math.random() - 0.5) * 350;
                const ty = (Math.random() - 0.5) * 350 - 100;
                requestAnimationFrame(() => {
                    h.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg) scale(0)`;
                    h.style.opacity = '0';
                });
                setTimeout(() => h.remove(), 1800);
            }
        }
    });
});
