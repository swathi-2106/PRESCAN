
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = Math.random() * 3 + 'px';
            star.style.height = star.style.width;
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }

        function showPage(pageId) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
        }

        function handleLogin(e) {
            e.preventDefault();
            showPage('terms');
        }

        function handleSignup(e) {
            e.preventDefault();
            showPage('terms');
        }

        // Parallax effect
        document.addEventListener('mousemove', (e) => {
            const stars = document.querySelectorAll('.star');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            stars.forEach((star, i) => {
                const speed = (i % 3 + 1) * 0.5;
                star.style.transform = `translate(${x * speed * 10}px, ${y * speed * 10}px)`;
            });
        });
   