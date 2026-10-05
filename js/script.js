document.addEventListener("DOMContentLoaded", () => {
    console.log("Portfolio website loaded!");
});

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const menuLinks = document.querySelectorAll(".nav-links a");
const navIcon = navToggle.querySelector("i");

navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    const menuOpen = navMenu.classList.contains("active");
    if(menuOpen){
        navIcon.classList.remove("fa-bars");
        navIcon.classList.add("fa-xmark");
    } else {
        navIcon.classList.remove("fa-xmark");
        navIcon.classList.add("fa-bars");
    }
});

menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        navIcon.classList.remove("fa-xmark");
        navIcon.classList.add("fa-bars");
    });
});

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop;

        if (window.scrollY >= sectionTop - 150) {
            currentSection = section.getAttribute("id");
        }

    });

    //Detect if user has reached the bottom of the page
    const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

    if (atBottom) {
        currentSection = "contact";
    }

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

});

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    try {
        const response = await fetch(contactForm.action, {
            method: contactForm.method,
            body: formData,
            headers: {
                Accept: "application/json"
            }
        });

        if (response.ok) {
            formStatus.textContent = "Message sent successfully!";
            formStatus.className = "success";

            contactForm.reset();
        } else {
            formStatus.textContent =
                "Something went wrong. Please try again.";
            formStatus.className = "error";
        }
    } catch (error) {
        formStatus.textContent =
            "Something went wrong. Please try again.";
        formStatus.className = "error";
    }
});

/* =========================================
   Interactive Hero Fractal Background
========================================= */

const hero = document.querySelector(".hero");
const canvas = document.getElementById("fractal-canvas");
const heroObserver =
    new IntersectionObserver(
        (entries) => {

            const entry = entries[0];

            heroVisible =
                entry.isIntersecting;

            /*
             * Restart animation when the
             * hero comes back into view.
             */
            if (!heroVisible) {

                if(animationFrame !== null) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
                isAnimating = false;
                return;
            }

            if (
                !isAnimating &&
                !prefersReducedMotion.matches
            ) {
                drawScene();
                animateFractal();
            } 
        },
        {
            threshold: 0.05
        }
    );

heroObserver.observe(hero);

if (hero && canvas) {

    const ctx = canvas.getContext("2d");

    /* =========================================
        Ripples
    ========================================= */

    const ripples = [];

    hero.addEventListener("pointerdown", (event) => {

        if(prefersReducedMotion.matches) {
            return;
        }

        const rect = hero.getBoundingClientRect();

        ripples.push({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            radius: 0,
            opacity: 0.6
        });

        if (ripples.length > 5) {
            ripples.shift();
        }

    });


    function drawRipples() {

        for (let i = ripples.length - 1; i >= 0; i--) {

            const ripple = ripples[i];

            ripple.radius += 2;
            ripple.opacity -= 0.008;

            ctx.beginPath();

            ctx.arc(
                ripple.x,
                ripple.y,
                ripple.radius,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                `rgba(255, 122, 0, ${Math.max(0, ripple.opacity)})`;

            ctx.lineWidth = 1;

            ctx.stroke();

            if (ripple.opacity <= 0) {
                ripples.splice(i, 1);
            }
        }
    }

    function getRippleForce(x, y) {

        let forceX = 0;
        let forceY = 0;

        for (const ripple of ripples) {

            const dx = x - ripple.x;
            const dy = y - ripple.y;

            const distance = Math.sqrt(
                dx * dx + dy * dy
            );

            /*
            * Width of the physical shockwave.
            * Branches are only affected when
            * the expanding ring reaches them.
            */
            const waveWidth = 40;

            const distanceFromWave =
                Math.abs(distance - ripple.radius);

            if (
                distanceFromWave < waveWidth &&
                distance > 0
            ) {

                /*
                * Strongest at the center of the
                * shockwave, weaker near its edges.
                */
                const waveStrength =
                    1 - distanceFromWave / waveWidth;

                /*
                * Fade the physical force as the
                * visual ripple disappears.
                */
                const fadeStrength =
                    ripple.opacity / 0.6;

                const strength =
                    waveStrength *
                    fadeStrength *
                    18;

                /*
                * Normalized direction pointing
                * AWAY from the click.
                */
                const directionX =
                    dx / distance;

                const directionY =
                    dy / distance;

                forceX +=
                    directionX * strength;

                forceY +=
                    directionY * strength;
            }
        }

        return {
            x: forceX,
            y: forceY
        };
    }

    let width;
    let height;
    let animationFrame = null;
    let heroVisible = true;
    let isAnimating = false;

    // Current mouse position
    let mouseX = 0;
    let mouseY = 0;

    // Target mouse position
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Whether cursor is currently inside hero
    let mouseActive = false;

    let time = 0;

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    /* =========================================
       Resize Canvas
    ========================================= */

    function resizeCanvas() {

        const rect = hero.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;

        width = rect.width;
        height = rect.height;

        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        // Default mouse position
        mouseX = width / 2;
        mouseY = height / 2;

        targetMouseX = width / 2;
        targetMouseY = height / 2;
    }


    /* =========================================
       Draw Fractal Branch
    ========================================= */

    function drawBranch(
        x,
        y,
        length,
        angle,
        depth,
        maxDepth,
        settings = {}
    ) {

        if (depth <= 0 || length < 2) {
            return;
        }

        const spread =
            settings.spread ?? 0.48;

        const shrink =
            settings.shrink ?? 0.72;

        const phase =
            settings.phase ?? 0;

        const breatheAmount =
            settings.breathe ?? 0.025;


        /* -------------------------------------
           Calculate cursor influence
        ------------------------------------- */

        const distanceX = mouseX - x;
        const distanceY = mouseY - y;

        const distance = Math.sqrt(
            distanceX * distanceX +
            distanceY * distanceY
        );

        // Cursor only affects nearby branches
        const influenceRadius = 250;
        const deadZone = 20;

        let influence = 0;

        if (distance > deadZone && distance < influenceRadius) {

            const normalizedDistance = (distance - deadZone) / (influenceRadius - deadZone);

            influence =
                1 - normalizedDistance;

            influence = 
                influence *
                influence *
                (3 - 2 * influence);


            if (!mouseActive) {
                influence *= 0.20;
            }
        }


        /* -------------------------------------
           Bend branches toward cursor
        ------------------------------------- */

        const angleToMouse = Math.atan2(
            distanceY,
            distanceX
        );

        const angleDifference =
            Math.atan2(
                Math.sin(angleToMouse - angle),
                Math.cos(angleToMouse - angle)
            );

        const rawBend =
            angleDifference *
            influence *
            0.18;

        const maxBend = 0.22;

        const cursorBend =
            Math.max(
                -maxBend,
                Math.min(maxBend, rawBend)
            );


        const finalAngle =
            angle + cursorBend;


        /* -------------------------------------
           Calculate branch endpoint
        ------------------------------------- */

        let endX =
            x + Math.cos(finalAngle) * length;

        let endY =
            y + Math.sin(finalAngle) * length;

         /* -------------------------------------
            Ripple displacement
        ------------------------------------- */   

        const rippleForce =
            getRippleForce(endX, endY);

        endX += rippleForce.x;
        endY += rippleForce.y;    

        /* -------------------------------------
           Draw branch
        ------------------------------------- */

        const depthRatio =
            depth / maxDepth;

        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.lineTo(
            endX,
            endY
        );

        ctx.strokeStyle =
            `rgba(255, 122, 0, ${
                0.05 + depthRatio * 0.22
            })`;

        ctx.lineWidth =
            Math.max(
                0.4,
                depthRatio * 1.4
            );

        ctx.stroke();


        /* -------------------------------------
           Draw small node
        ------------------------------------- */

        if (depth <= 4) {

            ctx.beginPath();

            const pulse =
                Math.sin(time * 3 + depth) * 0.3;

            ctx.arc(
                endX,
                endY,
                1.1 + 
                influence * 2 + pulse,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(255, 122, 0, ${
                    0.10 + influence * 0.35
                })`;

            ctx.fill();
        }


        /* -------------------------------------
           Recursive branches
        ------------------------------------- */

        const breathing =
            Math.sin(time + depth * 0.4) * breatheAmount;

        const branchSpread =
            spread +
            breathing +
            influence * 0.06;

        const nextLength =
            length * shrink;

        drawBranch(
            endX,
            endY,
            nextLength,
            finalAngle - branchSpread,
            depth - 1,
            maxDepth,
            settings
        );

        drawBranch(
            endX,
            endY,
            nextLength,
            finalAngle + branchSpread,
            depth - 1,
            maxDepth,
            settings
        );
    }


    /* =========================================
       Draw Entire Fractal Scene
    ========================================= */

    function drawScene() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        drawRipples();

         /* =========================================
            Cursor Glow
        ========================================= */

        if (mouseActive) {

            const gradient = ctx.createRadialGradient(
                mouseX,
                mouseY,
                0,
                mouseX,
                mouseY,
                250
            );

            gradient.addColorStop(
                0,
                "rgba(255, 122, 0, 0.04)"
            );

            gradient.addColorStop(
                1,
                "rgba(255, 122, 0, 0)"
            );

            ctx.fillStyle = gradient;

            ctx.fillRect(
                0,
                0,
                width,
                height
            );  
        }

        /*
         * Instead of one giant tree, several
         * fractals grow inward from the edges.
         */

        // Bottom center
        drawBranch(
            width * 0.5,
            height + 20,
            100,
            -Math.PI / 2,
            8,
            8,
            {
                spread: 0.48,
                shrink: 0.72,
                phase: 0,
                breathe: 0.025
            }
        );


        // Bottom left
        drawBranch(
            width * 0.12,
            height + 20,
            100,
            -Math.PI / 2.7,
            7,
            7,
            {
                spread: 0.40,
                shrink: 0.74,
                phase: 1.2,
                breathe: 0.018
            }
        );

        // Bottom right
        drawBranch(
            width * 0.88,
            height + 20,
            100,
            -Math.PI / 1.5,
            7,
            7,
            {
                spread: 0.57,
                shrink: 0.70,
                phase: 2.4,
                breathe: 0.03
            }
        );


        // Left side
        drawBranch(
            -20,
            height * 0.45,
            80,
            0,
            7,
            7,
            {
                spread: 0.44,
                shrink: 0.73,
                phase: 3.1,
                breathe: 0.02
            }
        );


        // Right side
        drawBranch(
            width + 20,
            height * 0.45,
            80,
            Math.PI,
            7,
            7,
            {
                spread: 0.52,
                shrink: 0.71,
                phase: 4.2,
                breathe: 0.028
            }
        );

         /* =========================================
            Ripples
        ========================================= */


        drawRipples();
    }


    /* =========================================
       Animation Loop
    ========================================= */

    function animateFractal() {

        if (!heroVisible) {
            isAnimating = false;
            animationFrame = null;
            return;
        }

        isAnimating = true;

        time += 0.008;

        /*
         * Smoothly move current cursor position
         * toward actual cursor position.
         */

        //Gentle idle movement
        if (!mouseActive) {

            targetMouseX =
                width / 2 +
                Math.sin(time * 0.7) * 70;

            targetMouseY =
                height / 2 +
                Math.cos(time * 0.5) * 45;
        }

        mouseX +=
            (targetMouseX - mouseX) * 0.06;

        mouseY +=
            (targetMouseY - mouseY) * 0.06;


        drawScene();


        animationFrame =
            requestAnimationFrame(
                animateFractal
            );
    }


    /* =========================================
       Mouse / Pointer Interaction
    ========================================= */

    hero.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                hero.getBoundingClientRect();

            targetMouseX =
                event.clientX - rect.left;

            targetMouseY =
                event.clientY - rect.top;

            mouseActive = true;
        }
    );


    hero.addEventListener(
        "pointerleave",
        () => {

            mouseActive = false;

            // Slowly return toward center
            targetMouseX =
                width / 2;

            targetMouseY =
                height / 2;
        }
    );


    /* =========================================
       Resize Handling
    ========================================= */

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* =========================================
       Start
    ========================================= */

    resizeCanvas();

    if (prefersReducedMotion.matches) {

        // Draw one static frame
        drawScene();

    } else {

        animateFractal();
    }
}