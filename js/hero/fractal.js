export function drawFractalScene({
    ctx,
    width,
    height,
    mouse,
    time,
    rippleSystem
}) {

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


        /* ==============================
           Cursor Influence
        ============================== */

        const distanceX =
            mouse.x - x;

        const distanceY =
            mouse.y - y;

        const distance =
            Math.hypot(
                distanceX,
                distanceY
            );


        const influenceRadius = 250;
        const deadZone = 20;

        let influence = 0;


        if (
            distance > deadZone &&
            distance < influenceRadius
        ) {

            const normalizedDistance =
                (distance - deadZone) /
                (influenceRadius - deadZone);


            influence =
                1 - normalizedDistance;


            influence =
                influence *
                influence *
                (3 - 2 * influence);


            if (!mouse.active) {
                influence *= 0.20;
            }

        }


        /* ==============================
           Cursor Bend
        ============================== */

        const angleToMouse =
            Math.atan2(
                distanceY,
                distanceX
            );


        const angleDifference =
            Math.atan2(
                Math.sin(
                    angleToMouse - angle
                ),
                Math.cos(
                    angleToMouse - angle
                )
            );


        const rawBend =
            angleDifference *
            influence *
            0.18;


        const maxBend = 0.22;


        const cursorBend =
            Math.max(
                -maxBend,
                Math.min(
                    maxBend,
                    rawBend
                )
            );


        const finalAngle =
            angle + cursorBend;


        /* ==============================
           Endpoint
        ============================== */

        let endX =
            x +
            Math.cos(finalAngle) *
            length;

        let endY =
            y +
            Math.sin(finalAngle) *
            length;


        const rippleForce =
            rippleSystem.getForce(
                endX,
                endY
            );


        endX += rippleForce.x;
        endY += rippleForce.y;


        /* ==============================
           Branch
        ============================== */

        const depthRatio =
            depth / maxDepth;


        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.lineTo(
            endX,
            endY
        );


        ctx.strokeStyle =
            `rgba(
                255,
                122,
                0,
                ${0.05 + depthRatio * 0.22}
            )`;


        ctx.lineWidth =
            Math.max(
                0.4,
                depthRatio * 1.4
            );


        ctx.stroke();


        /* ==============================
           Node
        ============================== */

        if (depth <= 4) {

            const pulse =
                Math.sin(
                    time * 3 +
                    depth
                ) * 0.3;


            ctx.beginPath();

            ctx.arc(
                endX,
                endY,
                1.1 +
                influence * 2 +
                pulse,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(
                    255,
                    122,
                    0,
                    ${0.10 + influence * 0.35}
                )`;

            ctx.fill();

        }


        /* ==============================
           Recursion
        ============================== */

        const breathing =
            Math.sin(
                time +
                phase +
                depth * 0.4
            ) * breatheAmount;


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


    /* ==============================
       Fractal Origins
    ============================== */

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
}