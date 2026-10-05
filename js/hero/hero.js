//Fractal Tree Import
/* 
import {
    drawFractalScene
} from "./fractal.js";
*/

import {
    createHexGrid
} from "./hexGrid.js";


export function initHero() {

    const hero =
        document.querySelector(".hero");

    const canvas =
        document.getElementById(
            "fractal-canvas"
        );


    if (!hero || !canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    const mouse = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        active: false
    };


    let width = 0;
    let height = 0;

    let time = 0;

    let animationFrame = null;
    let heroVisible = true;
    let isAnimating = false;

    const hexGrid =
        createHexGrid();


    /* ==============================
       Resize
    ============================== */

    function resizeCanvas() {

        const rect =
            hero.getBoundingClientRect();

        const pixelRatio =
            window.devicePixelRatio || 1;


        width = rect.width;
        height = rect.height;


        canvas.width =
            width * pixelRatio;

        canvas.height =
            height * pixelRatio;


        canvas.style.width =
            `${width}px`;

        canvas.style.height =
            `${height}px`;


        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );


        mouse.x = width / 2;
        mouse.y = height / 2;

        mouse.targetX = width / 2;
        mouse.targetY = height / 2;
    }


    /* ==============================
       Draw
    ============================== */

    function drawScene() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        /* ==============================
            Cursor Glow
        ============================== */

        if (mouse.active) {

            const gradient =
                ctx.createRadialGradient(
                    mouse.x,
                    mouse.y,
                    0,
                    mouse.x,
                    mouse.y,
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

        //Fractal Tree Scene
        /*
        drawFractalScene({
            ctx,
            width,
            height,
            mouse,
            time,
            rippleSystem
        });
        */

        /* ==============================
            Hex Grid
        ============================== */
       hexGrid.draw({
            ctx,
            width,
            height,
            mouse,
            time
        });
    }


    /* ==============================
       Animation
    ============================== */

    function animate() {

        if (!heroVisible) {

            isAnimating = false;
            animationFrame = null;

            return;
        }


        isAnimating = true;

        time += 0.008;


        if (!mouse.active) {

            mouse.targetX =
                width / 2 +
                Math.sin(time * 0.7) *
                70;

            mouse.targetY =
                height / 2 +
                Math.cos(time * 0.5) *
                45;
        }


        mouse.x +=
            (mouse.targetX - mouse.x) *
            0.06;

        mouse.y +=
            (mouse.targetY - mouse.y) *
            0.06;


        drawScene();


        animationFrame =
            requestAnimationFrame(
                animate
            );
    }


    /* ==============================
       Pointer
    ============================== */

    hero.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                hero.getBoundingClientRect();


            mouse.targetX =
                event.clientX -
                rect.left;

            mouse.targetY =
                event.clientY -
                rect.top;

            mouse.active = true;
        }
    );


    hero.addEventListener(
        "pointerleave",
        () => {

            mouse.active = false;
        }
    );


    hero.addEventListener(
        "pointerdown",
        (event) => {

            if (
                prefersReducedMotion.matches
            ) {
                return;
            }


            /*
            * Don't trigger effects when
            * clicking interactive controls.
            */
            if (
                event.target.closest(
                    "a, button, input, textarea"
                )
            ) {
                return;
            }


            const rect =
                hero.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;

            const y =
                event.clientY -
                rect.top;


            hexGrid.triggerPulse(
                x,
                y
            );
        }
    );


    /* ==============================
       Visibility
    ============================== */

    const observer =
        new IntersectionObserver(
            ([entry]) => {

                heroVisible =
                    entry.isIntersecting;


                if (!heroVisible) {

                    if (
                        animationFrame !== null
                    ) {

                        cancelAnimationFrame(
                            animationFrame
                        );

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
                    animate();
                }

            },
            {
                threshold: 0.05
            }
        );


    observer.observe(hero);


    /* ==============================
       Start
    ============================== */

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    resizeCanvas();


    if (prefersReducedMotion.matches) {
        drawScene();
    } else {
        animate();
    }
}