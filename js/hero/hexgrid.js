/* =========================================
   Hex Grid Configuration
========================================= */

const HEX_SIZE = 48;

const GRID_OPACITY = 0.07;
const NODE_OPACITY = 0.16;

const INTERACTION_RADIUS = 220;
const CONNECTION_RADIUS = 160;

const ENERGY_SPEED = 3.5;
const ENERGY_FADE = 0.018;

const NODE_KEY_PRECISION = 2;

const MAX_ACTIVE_PULSES = 20;

const BREATH_SPEED = 0.65;
const BREATH_STRENGTH = 0.016;

/* =========================================
   Neural Activity
========================================= */

const MIN_SIGNAL_SEGMENTS = 1;
const MAX_SIGNAL_SEGMENTS = 5;

const NEURAL_FIRE_CHANCE = 0.025;
const MAX_NEURAL_SIGNALS = 8;

const SIGNAL_SPEED = 0.045;
const SIGNAL_SIZE = 2.2;
const SIGNAL_GLOW_SIZE = 10;


/* =========================================
   Create Hex Grid
========================================= */

export function createHexGrid() {

    let nodes = [];
    let edges = [];
    let activePulses = [];
    let neuralSignals = [];

    let cachedWidth = 0;
    let cachedHeight = 0;


    /* =====================================
       Helpers
    ===================================== */

    function getNodeKey(x, y) {

        return (
            x.toFixed(NODE_KEY_PRECISION) +
            "," +
            y.toFixed(NODE_KEY_PRECISION)
        );
    }


    function distanceBetween(a, b) {

        return Math.hypot(
            b.x - a.x,
            b.y - a.y
        );
    }


    /* =====================================
       Build Graph
    ===================================== */

    function build(width, height) {

        nodes = [];
        edges = [];

        cachedWidth = width;
        cachedHeight = height;


        const nodeMap =
            new Map();

        const edgeMap =
            new Set();


        const hexWidth =
            Math.sqrt(3) * HEX_SIZE;

        const verticalSpacing =
            HEX_SIZE * 1.5;


        const columns =
            Math.ceil(
                width / hexWidth
            ) + 3;

        const rows =
            Math.ceil(
                height / verticalSpacing
            ) + 3;


        /* =================================
           Get or Create Node
        ================================= */

        function getOrCreateNode(x, y) {

            const key =
                getNodeKey(x, y);


            if (nodeMap.has(key)) {
                return nodeMap.get(key);
            }


            const node = {

                id: nodes.length,

                x,
                y,

                baseX: x,
                baseY: y,

                neighbors: [],

                energy: 0,
                neuralGlow: 0,

                phase:
                    Math.random() *
                    Math.PI *
                    2
            };


            nodes.push(node);

            nodeMap.set(
                key,
                node
            );


            return node;
        }


        /* =================================
           Create Edge
        ================================= */

        function createEdge(
            nodeA,
            nodeB
        ) {

            const first =
                Math.min(
                    nodeA.id,
                    nodeB.id
                );

            const second =
                Math.max(
                    nodeA.id,
                    nodeB.id
                );


            const edgeKey =
                `${first}-${second}`;


            if (edgeMap.has(edgeKey)) {
                return;
            }


            edgeMap.add(edgeKey);


            const edge = {

                nodeA,
                nodeB,

                energy: 0,

                pulseProgress: -1
            };


            edges.push(edge);


            nodeA.neighbors.push({
                node: nodeB,
                edge
            });


            nodeB.neighbors.push({
                node: nodeA,
                edge
            });
        }


        /* =================================
           Generate Hexagons
        ================================= */

        for (
            let row = -2;
            row < rows;
            row++
        ) {

            for (
                let column = -2;
                column < columns;
                column++
            ) {

                const centerX =
                    column *
                    hexWidth +
                    (
                        row % 2 !== 0
                            ? hexWidth / 2
                            : 0
                    );


                const centerY =
                    row *
                    verticalSpacing;


                const vertices = [];


                for (
                    let side = 0;
                    side < 6;
                    side++
                ) {

                    const angle =
                        Math.PI / 3 *
                        side -
                        Math.PI / 2;


                    const x =
                        centerX +
                        HEX_SIZE *
                        Math.cos(angle);


                    const y =
                        centerY +
                        HEX_SIZE *
                        Math.sin(angle);


                    vertices.push(
                        getOrCreateNode(
                            x,
                            y
                        )
                    );
                }


                /* Connect hex vertices */

                for (
                    let side = 0;
                    side < 6;
                    side++
                ) {

                    const nodeA =
                        vertices[side];

                    const nodeB =
                        vertices[
                            (side + 1) % 6
                        ];


                    createEdge(
                        nodeA,
                        nodeB
                    );
                }
            }
        }
    }


    /* =====================================
       Find Nearest Node
    ===================================== */

    function findNearestNode(x, y) {

        let nearestNode = null;
        let nearestDistance = Infinity;


        for (const node of nodes) {

            const distance =
                Math.hypot(
                    x - node.x,
                    y - node.y
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearestNode =
                    node;
            }
        }


        return nearestNode;
    }

    function spawnNeuralSignal() {

        if (
            neuralSignals.length >=
            MAX_NEURAL_SIGNALS
        ) {
            return;
        }


        if (
            Math.random() >
            NEURAL_FIRE_CHANCE
        ) {
            return;
        }


        if (nodes.length === 0) {
            return;
        }


        /* =============================
        Choose Starting Node
        ============================= */

        const startNode =
            nodes[
                Math.floor(
                    Math.random() *
                    nodes.length
                )
            ];


        /* =============================
        Random Path Length
        1 - 5 segments
        ============================= */

        const pathOptions = [
            1,
            2, 2,
            3, 3, 3,
            4, 4,
            5
        ];

        const pathLength =
            pathOptions[
                Math.floor(
                    Math.random() *
                    pathOptions.length
                )
            ];


        /* =============================
        Build Random Path
        ============================= */

        const path = [
            startNode
        ];


        const visited =
            new Set([
                startNode.id
            ]);


        let currentNode =
            startNode;


        for (
            let i = 0;
            i < pathLength;
            i++
        ) {

            /*
            * Don't immediately travel back
            * through nodes we've already used.
            */
            const availableNeighbors =
                currentNode.neighbors
                    .map(
                        connection =>
                            connection.node
                    )
                    .filter(
                        node =>
                            !visited.has(
                                node.id
                            )
                    );


            /*
            * We've hit a dead end.
            */
            if (
                availableNeighbors.length === 0
            ) {
                break;
            }


            const nextNode =
                availableNeighbors[
                    Math.floor(
                        Math.random() *
                        availableNeighbors.length
                    )
                ];


            path.push(
                nextNode
            );


            visited.add(
                nextNode.id
            );


            currentNode =
                nextNode;
        }


        /*
        * We need at least one edge.
        */
        if (path.length < 2) {
            return;
        }


        neuralSignals.push({

            path,

            segmentIndex: 0,

            progress: 0,

            speed:
                SIGNAL_SPEED *
                (
                    0.8 +
                    Math.random() *
                    0.4
                )
        });
    }

    function updateNeuralSignals() {

        spawnNeuralSignal();


        /* =============================
        Fade Neuron Glows
        ============================= */

        for (const node of nodes) {

            node.neuralGlow *= 0.90;


            if (
                node.neuralGlow < 0.01
            ) {
                node.neuralGlow = 0;
            }
        }


        /* =============================
        Move Signals
        ============================= */

        for (
            let i =
                neuralSignals.length - 1;

            i >= 0;

            i--
        ) {

            const signal =
                neuralSignals[i];


            signal.progress +=
                signal.speed;


            /*
            * Current segment finished.
            */
            if (
                signal.progress >= 1
            ) {

                const reachedNode =
                    signal.path[
                        signal.segmentIndex + 1
                    ];


                /*
                * Flash neuron.
                */
                if (reachedNode) {
                    reachedNode.neuralGlow = 1;
                }


                /*
                * Move to next segment.
                */
                signal.segmentIndex++;

                signal.progress = 0;


                /*
                * Entire path finished.
                */
                if (
                    signal.segmentIndex >=
                    signal.path.length - 1
                ) {

                    neuralSignals.splice(
                        i,
                        1
                    );
                }
            }
        }
    }

    function drawNeuralSignals(ctx) {

        for (
            const signal
            of neuralSignals
        ) {

            const from =
                signal.path[
                    signal.segmentIndex
                ];


            const to =
                signal.path[
                    signal.segmentIndex + 1
                ];


            if (!from || !to) {
                continue;
            }


            /* =============================
            Position Along Current Edge
            ============================= */

            const x =
                from.x +
                (
                    to.x -
                    from.x
                ) *
                signal.progress;


            const y =
                from.y +
                (
                    to.y -
                    from.y
                ) *
                signal.progress;


            /* =============================
            Outer Glow
            ============================= */

            const gradient =
                ctx.createRadialGradient(
                    x,
                    y,
                    0,
                    x,
                    y,
                    SIGNAL_GLOW_SIZE
                );


            gradient.addColorStop(
                0,
                "rgba(255, 190, 110, 0.85)"
            );


            gradient.addColorStop(
                0.3,
                "rgba(255, 122, 0, 0.35)"
            );


            gradient.addColorStop(
                1,
                "rgba(255, 122, 0, 0)"
            );


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                SIGNAL_GLOW_SIZE,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                gradient;

            ctx.fill();


            /* =============================
            Signal Core
            ============================= */

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                SIGNAL_SIZE,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(255, 200, 130, 0.95)";


            ctx.fill();
        }
    }

    /* =====================================
       Trigger Energy Pulse
    ===================================== */

    function triggerPulse(x, y) {

        const startNode =
            findNearestNode(x, y);


        if (!startNode) {
            return;
        }

        const distances =
            new Map();

        const queue = [
            {
                node: startNode,
                depth: 0
            }
        ]

        const visited = 
            new Set([
                startNode.id
            ]);
         
        /* =============================
            Calculate BFS distances
        ============================= */

        while (queue.length > 0) {
            const {
                node,
                depth
            } = queue.shift();

            distances.set(node.id, depth);

            for (
                const connection
                of node.neighbors
            ) {

                const neighbor =
                    connection.node;


                if (
                    visited.has(
                        neighbor.id
                    )
                ) {
                    continue;
                }


                visited.add(
                    neighbor.id
                );


                queue.push({
                    node: neighbor,
                    depth: depth + 1
                });
            }
        }


        /* =============================
        Create independent pulse
        ============================= */

        activePulses.push({

            startNode,

            age: 0,

            distances
        });

        if (
        activePulses.length >
        MAX_ACTIVE_PULSES
    ) {
        activePulses.shift();
    }
    }


    /* =====================================
       Update Energy
    ===================================== */

    function updateEnergy() {

        /*
        * Reset visual energy for this frame.
        * We will rebuild it from all pulses.
        */
        for (const node of nodes) {
            node.energy = 0;
        }


        /* =============================
        Update Active Pulses
        ============================= */

        for (
            let i =
                activePulses.length - 1;

            i >= 0;

            i--
        ) {

            const pulse =
                activePulses[i];


            pulse.age++;


            for (const node of nodes) {

                const depth =
                    pulse.distances.get(
                        node.id
                    );


                if (depth === undefined) {
                    continue;
                }


                /*
                * Delay based on graph distance.
                */
                const arrivalTime =
                    depth * 7;


                const localAge =
                    pulse.age -
                    arrivalTime;


                /*
                * Pulse has not reached
                * this node yet.
                */
                if (localAge < 0) {
                    continue;
                }


                let energy = 0;


                /* -------------------------
                Fast charge
                ------------------------- */

                const chargeDuration = 8;


                if (
                    localAge <
                    chargeDuration
                ) {

                    energy =
                        localAge /
                        chargeDuration;
                }


                /* -------------------------
                Smooth fade
                ------------------------- */

                else {

                    const fadeAge =
                        localAge -
                        chargeDuration;


                    const fadeDuration =
                        55;


                    energy =
                        1 -
                        fadeAge /
                        fadeDuration;


                    energy =
                        Math.max(
                            0,
                            energy
                        );
                }


                /*
                * Combine overlapping pulses.
                */
                node.energy =
                    Math.min(
                        1,
                        node.energy +
                        energy
                    );
            }


            /* =============================
            Remove finished pulse
            ============================= */

            const maxDepth =
                Math.max(
                    ...pulse.distances.values()
                );


            const totalDuration =
                maxDepth * 7 +
                8 +
                55;


            if (
                pulse.age >
                totalDuration
            ) {

                activePulses.splice(
                    i,
                    1
                );
            }
        }


        /* =============================
        Edge Energy
        ============================= */

        for (const edge of edges) {

            edge.energy =
                Math.max(
                    edge.nodeA.energy,
                    edge.nodeB.energy
                ) * 0.8;
        }
    }


    /* =====================================
       Draw Edges
    ===================================== */

    function drawEdges(ctx) {

        for (const edge of edges) {

            const energy =
                edge.energy;


            ctx.beginPath();


            ctx.moveTo(
                edge.nodeA.x,
                edge.nodeA.y
            );


            ctx.lineTo(
                edge.nodeB.x,
                edge.nodeB.y
            );


            ctx.strokeStyle =
                `rgba(
                    255,
                    122,
                    0,
                    ${
                        GRID_OPACITY +
                        energy * 0.55
                    }
                )`;


            ctx.lineWidth =
                0.7 +
                energy * 1.4;


            ctx.stroke();
        }
    }


    /* =====================================
       Draw Nodes
    ===================================== */

    function drawNodes(
        ctx,
        mouse,
        time
    ) {

        for (const node of nodes) {

            const dx =
                mouse.x -
                node.x;

            const dy =
                mouse.y -
                node.y;


            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            let influence = 0;


            if (
                mouse.active &&
                distance <
                INTERACTION_RADIUS
            ) {

                influence =
                    1 -
                    distance /
                    INTERACTION_RADIUS;


                influence =
                    influence *
                    influence *
                    (
                        3 -
                        2 * influence
                    );
            }


            const pulse =
                (
                    Math.sin(
                        time * 2 +
                        node.phase
                    ) +
                    1
                ) / 2;


            const radius =
                1 +
                pulse * 0.35 +
                influence * 1.8 +
                node.energy * 2.5 +
                node.neuralGlow * 2.5;

            const opacity =
                Math.min(
                    1,
                    NODE_OPACITY +
                    pulse * 0.05 +
                    influence * 0.55 +
                    node.energy * 0.7 +
                    node.neuralGlow * 0.7
                );
            
            ctx.fillStyle =
                `rgba(
                    255,
                    122,
                    0,
                    ${opacity}
                )`;


            ctx.beginPath();


            ctx.arc(
                node.x,
                node.y,
                radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `rgba(
                    255,
                    122,
                    0,
                    ${
                        NODE_OPACITY +
                        pulse * 0.05 +
                        influence * 0.55 +
                        node.energy * 0.7
                    }
                )`;


            ctx.fill();
        }
    }


    /* =====================================
       Cursor Connections
    ===================================== */

    function drawCursorConnections(
        ctx,
        mouse
    ) {

        if (!mouse.active) {
            return;
        }


        /*
         * Find nearby nodes.
         */

        const nearbyNodes =
            nodes
                .map((node) => ({
                    node,

                    distance:
                        distanceBetween(
                            node,
                            mouse
                        )
                }))

                .filter(
                    ({ distance }) =>
                        distance <
                        CONNECTION_RADIUS
                )

                .sort(
                    (a, b) =>
                        a.distance -
                        b.distance
                )

                /*
                 * Only connect to the
                 * closest four nodes.
                 */
                .slice(0, 4);


        for (
            const {
                node,
                distance
            }
            of nearbyNodes
        ) {

            const strength =
                1 -
                distance /
                CONNECTION_RADIUS;


            ctx.beginPath();


            ctx.moveTo(
                node.x,
                node.y
            );


            ctx.lineTo(
                mouse.x,
                mouse.y
            );


            ctx.strokeStyle =
                `rgba(
                    255,
                    122,
                    0,
                    ${strength * 0.4}
                )`;


            ctx.lineWidth =
                0.5 +
                strength * 0.8;


            ctx.stroke();
        }
    }

    function updateBreathing(
        width,
        height,
        scale
    ) {

        const centerX =
            width / 2;

        const centerY =
            height / 2;


        for (const node of nodes) {

            const offsetX =
                node.baseX -
                centerX;

            const offsetY =
                node.baseY -
                centerY;


            node.x =
                centerX +
                offsetX * scale;

            node.y =
                centerY +
                offsetY * scale;
        }
    }


    /* =====================================
       Render
    ===================================== */

    function draw({
        ctx,
        width,
        height,
        mouse,
        time
    }) {

        if (
            nodes.length === 0 ||
            width !== cachedWidth ||
            height !== cachedHeight
        ) {

            build(
                width,
                height
            );
        }

        /* =============================
            Grid Breathing
        ============================= */

        const currentBreathSpeed = mouse.active ? BREATH_SPEED * 1.15 : BREATH_SPEED;

        const primaryBreath = Math.sin(time * currentBreathSpeed);
        const secondaryBreath = Math.sin(time * currentBreathSpeed * 0.43 + 1.7) * 0.25;

        const breath = primaryBreath + secondaryBreath;

        const breathScale = 1 + breath * BREATH_STRENGTH;

        updateBreathing(
            width,
            height,
            breathScale
        );


        updateEnergy();

        updateNeuralSignals();


        /*
         * Draw order matters.
         */

        drawEdges(ctx);

        drawCursorConnections(
            ctx,
            mouse
        );

        drawNeuralSignals(ctx);

        drawNodes(
            ctx,
            mouse,
            time
        );
    }


    return {

        draw,
        build,
        triggerPulse
    };
}