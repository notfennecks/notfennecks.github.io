/*
    Creating the ripple system for user clicks on the hero section
*/

/*
    Modifiable parameters for ripple effect
*/
const MAX_RIPPLES = 5;

const RIPPLE_SPEED = 2;
const RIPPLE_FADE = 0.008;

const WAVE_WIDTH = 40;
const WAVE_FORCE = 12;


export function createRippleSystem(ctx) {

    const ripples = [];


    function addRipple(x, y) {

        ripples.push({
            x,
            y,
            radius: 0,
            opacity: 0.6
        });


        if (ripples.length > MAX_RIPPLES) {
            ripples.shift();
        }

    }


    function draw() {

        for (
            let i = ripples.length - 1;
            i >= 0;
            i--
        ) {

            const ripple = ripples[i];

            ripple.radius += RIPPLE_SPEED;
            ripple.opacity -= RIPPLE_FADE;


            ctx.beginPath();

            ctx.arc(
                ripple.x,
                ripple.y,
                ripple.radius,
                0,
                Math.PI * 2
            );


            ctx.strokeStyle =
                `rgba(
                    255,
                    122,
                    0,
                    ${Math.max(0, ripple.opacity)}
                )`;

            ctx.lineWidth = 1;

            ctx.stroke();


            if (ripple.opacity <= 0) {
                ripples.splice(i, 1);
            }

        }

    }


    function getForce(x, y) {

        let forceX = 0;
        let forceY = 0;


        for (const ripple of ripples) {

            const dx =
                x - ripple.x;

            const dy =
                y - ripple.y;

            const distance =
                Math.hypot(dx, dy);


            if (distance === 0) {
                continue;
            }


            const distanceFromWave = distance - ripple.radius;
            
            /*
            * Only affect nodes at or just ahead
            * of the expanding shockwave.
            */

            if (
                distanceFromWave < 0 ||
                distanceFromWave >= WAVE_WIDTH
            ) {
                continue;
            }


            let waveStrength = 
                1 -
                distanceFromWave /
                WAVE_WIDTH;

            waveStrength =
                waveStrength *
                waveStrength *
                (3 - 2 * waveStrength);

            const fadeStrength =
                ripple.opacity / 0.6;

            const strength =
                waveStrength *
                fadeStrength *
                WAVE_FORCE;


            forceX +=
                (dx / distance) *
                strength;

            forceY +=
                (dy / distance) *
                strength;

        }


        return {
            x: forceX,
            y: forceY
        };

    }


    return {
        addRipple,
        draw,
        getForce
    };
}