document.addEventListener('DOMContentLoaded', () => {
    const slides = [
        { id: 'slide1', duration: 2000, transition: 'fade' }, //fade, slide-left, slide-right, slide-up, none
        { id: 'slide2', duration: 1000, transition: 'fade' },
        { id: 'slide3', duration: 1000, transition: 'fade' },
        { id: 'slide4', duration: 1000, transition: 'slide-up' },
        { id: 'slide-next-activity', duration: 1000, transition: 'fade' },
        //{ id: 'slide5', duration: 40000, transition: 'fade' },
        //{ id: 'slide6', duration: 60000, transition: 'none' },
    ];

    let currentSlideIndex = 0;
    const slideElements = document.querySelectorAll('.slide');

    function showSlide(index) {
        slideElements.forEach((slide, i) => {
            slide.classList.remove('active', 'transition-slide-up', 'transition-slide-down', 'transition-slide-left', 'transition-slide-right', 'transition-fade');
            if (i === index) {
                slide.classList.add('active');
                if (slides[i].transition !== 'none') {
                    slide.classList.add(`transition-${slides[i].transition}`);
                }
            }
        });

        // Special handling for physics slide
        if (slides[index].id === 'slide5') {
            initPhysicsAnimation();
        } else {
            stopPhysicsAnimation();
        }
        
        // Special handling for dino slide
        if (slides[index].id === 'slide6') {
            startDinoAnimation();
        } else {
            stopDinoAnimation();
        }

        // Special handling for next activity slide
        if (slides[index].id === 'slide-next-activity') {
            updateNextActivity();
        }
    }

    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
        setTimeout(nextSlide, slides[currentSlideIndex].duration);
    }

    // --- Slide: Next Activity ---
    const nextActivityNameEl = document.getElementById('next-activity-name');
    const nextActivityTimeEl = document.getElementById('next-activity-time');
    const schedule = [
        { time: new Date('2025-07-03T13:30:00'), name: '選修課程' },
        { time: new Date('2025-07-03T15:10:00'), name: '黑客松時間' },
        { time: new Date('2025-07-03T17:30:00'), name: '晚餐時間' },
        { time: new Date('2025-07-03T19:00:00'), name: '鑰匙掉了' },
        { time: new Date('2025-07-03T21:00:00'), name: '黑客松時間' },
        { time: new Date('2025-07-03T22:30:00'), name: '返回飯店' },
        { time: new Date('2025-07-04T09:10:00'), name: '哈哈是我啦' },
        { time: new Date('2025-07-04T09:40:00'), name: '黑客松時間' },
        { time: new Date('2025-07-04T13:10:00'), name: '黑客松報告' },
        { time: new Date('2025-07-04T14:40:00'), name: '結戲' },
        { time: new Date('2025-07-04T15:10:00'), name: '頒獎' },
        { time: new Date('2025-07-04T16:40:00'), name: '拍照' },
        { time: new Date('2025-07-04T17:00:00'), name: '掰掰' },
    ];

    function updateNextActivity() {
        const now = new Date();
        let nextActivity = null;

        for (const event of schedule) {
            if (event.time > now) {
                nextActivity = event;
                break;
            }
        }

        if (nextActivity) {
            nextActivityNameEl.textContent = nextActivity.name;
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
            nextActivityTimeEl.textContent = nextActivity.time.toLocaleTimeString('zh-TW', timeOptions);
        } else {
            nextActivityNameEl.textContent = '營期活動已全部結束！';
            nextActivityTimeEl.textContent = '';
        }
    }

    // --- Slide 4: Countdown Timer ---
    const countdownTitleEl = document.getElementById('countdown-title');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const countdownTargets = [
        { target: new Date('2025-07-01T10:00:00'), title: '距離活動開始剩餘' },
        { target: new Date('2025-07-01T17:40:00'), title: '距離好吃的晚餐剩餘' },
        { target: new Date('2025-07-01T21:10:00'), title: '距離黑客松開幕剩餘' },
        { target: new Date('2025-07-04T13:10:00'), title: '距離黑客松結束剩餘' },
        { target: new Date('2025-07-04T17:00:00'), title: '距離活動結束剩餘' }
    ];

    function getCurrentCountdown() {
        const now = new Date();
        // Since the current date is July 1, 2025, we find the first applicable target.
        for (const countdown of countdownTargets) {
            if (now < countdown.target) {
                return countdown;
            }
        }
        return null; // All events are over.
    }

    let prevCountdown = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	};

	const interval = setInterval(() => {
        const currentCountdown = getCurrentCountdown();

        if (!currentCountdown) {
            clearInterval(interval);
            countdownTitleEl.textContent = '活動已圓滿結束！';
            daysEl.textContent = '0';
            hoursEl.textContent = '0';
            minutesEl.textContent = '0';
            secondsEl.textContent = '0';
            return;
        }

        countdownTitleEl.textContent = currentCountdown.title;
		const now = new Date();
		const diff = currentCountdown.target.getTime() - now.getTime();

		if (diff <= 0) {
            // This will be handled by the next tick calling getCurrentCountdown
			return;
		}

		const countdown = {
			days: Math.floor(diff / (1000 * 60 * 60 * 24)),
			hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
			minutes: Math.floor((diff / (1000 * 60)) % 60),
			seconds: Math.floor((diff / 1000) % 60)
		};

		if (prevCountdown.days !== countdown.days) {
			flash(daysEl.parentElement);
		}
		if (prevCountdown.hours !== countdown.hours) {
			flash(hoursEl.parentElement);
		}
		if (prevCountdown.minutes !== countdown.minutes) {
			flash(minutesEl.parentElement);
		}
		flash(secondsEl.parentElement); // Always flash seconds

		daysEl.textContent = countdown.days;
		hoursEl.textContent = countdown.hours;
		minutesEl.textContent = countdown.minutes;
		secondsEl.textContent = countdown.seconds;

		prevCountdown = { ...countdown };

	}, 1000);

	function flash(element) {
		element.classList.add('flash');
		setTimeout(() => {
			element.classList.remove('flash');
		}, 500);
	}

    // --- Slide 5: Physics Animation ---
    let engine, render, runner;
    const fallingObjectsContainer = document.getElementById('falling-objects-container');
    const objectImages = [
        { src: 'assets/binary-one.png', min: 10, max: 25 },
        { src: 'assets/binary-zero.png', min: 10, max: 25 },
        { src: 'assets/block.png', min: 10, max: 25 },
        { src: 'assets/cube.png', min: 10, max: 25 },
        { src: 'assets/dino.png', min: 10, max: 25 },
        { src: 'assets/dino-wifi.png', min: 10, max: 25 },
        { src: 'assets/3d-discord.png', min: 10, max: 25 },
        { src: 'assets/3d-python.png', min: 10, max: 25 },
        { src: 'assets/blue-dice2.png', min: 10, max: 25 },
        { src: 'assets/cloud.png', min: 10, max: 25 },
        { src: 'assets/computer-case-side.png', min: 10, max: 25 },
        { src: 'assets/dice.png', min: 10, max: 25 },
        { src: 'assets/earth.png', min: 10, max: 25 },
        { src: 'assets/email.png', min: 10, max: 25 },
        { src: 'assets/image-icon.png', min: 10, max: 25 },
        { src: 'assets/computer.png', min: 10, max: 25 },
        { src: 'assets/mushroom.png', min: 10, max: 25 },
    ];

    function initPhysicsAnimation() {
        const { Engine, Render, Runner, World, Bodies, Body } = Matter;

        engine = Engine.create({ gravity: { y: 0.7 } });
        render = Render.create({
            element: fallingObjectsContainer,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'transparent'
            }
        });

        const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
        World.add(engine.world, [ground]);

        Render.run(render);
        runner = Runner.create();
        Runner.run(runner, engine);

        // Add objects periodically
        const addObjectInterval = setInterval(() => {
            if (document.getElementById('slide5').classList.contains('active')) {
                const x = Math.random() * (window.innerWidth - 80) + 40;
                const objInfo = objectImages[Math.floor(Math.random() * objectImages.length)];
                const size = Math.floor(Math.random() * (objInfo.max - objInfo.min + 1)) + objInfo.min;
                const obj = Bodies.rectangle(x, -size, size, size, {
                    restitution: 0.5,
                    friction: 0.3,
                    render: {
                        sprite: { texture: objInfo.src, xScale: size / 100, yScale: size / 100 }
                    }
                });
                World.add(engine.world, obj);
            } else {
                clearInterval(addObjectInterval);
            }
        }, 500);
    }

    function stopPhysicsAnimation() {
        if (engine) {
            Matter.Runner.stop(runner);
            Matter.Render.stop(render);
            Matter.World.clear(engine.world);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            engine = null;
            render = null;
            runner = null;
        }
    }

    // --- Slide 6: Dino Animation ---
    const dino = document.getElementById('dino');
    let dinoInterval;

    function startDinoAnimation() {
        dinoInterval = setInterval(() => {
            dino.src = dino.src.includes('dino.png') ? 'assets/dino-wifi.png' : 'assets/dino.png';
        }, 300);
    }

    function stopDinoAnimation() {
        clearInterval(dinoInterval);
    }

    // Start the slideshow
    showSlide(currentSlideIndex);
    setTimeout(nextSlide, slides[currentSlideIndex].duration);
});
