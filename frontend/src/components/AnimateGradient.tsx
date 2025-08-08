import React, { useId } from "react";

/**
 * AnimatedGradientBlob
 * - Pure SVG (no libs): animated turbulence + displacement for organic wobble
 * - Rainbow gradient clipped to a noise-distorted blob
 * - Optional “scanlines” overlay for that rippled look
 */
export default function AnimatedGradientBlob({
    width = 600,
    height = 600,
    speed = 1,          // 0.5 = slower, 2 = faster
    lineIntensity = 0.15,// 0 to 0.4 (strength of the ripple/scanline overlay)
    blur = 12,           // gaussian blur for softness
}: {
    width?: number;
    height?: number;
    speed?: number;
    lineIntensity?: number;
    blur?: number;
}) {
    // Unique ids so multiple instances don’t collide
    const uid = useId().replace(/[:]/g, "");
    const ids = {
        grad: `grad-${uid}`,
        mask: `mask-${uid}`,
        blobFilter: `blobFilter-${uid}`,
        linesPattern: `linesPattern-${uid}`,
        linesMask: `linesMask-${uid}`,
    };

    // Animation timing derived from speed
    const freqDur = `${18 / speed}s`;
    const dispDur = `${22 / speed}s`;
    const rotDur = `${40 / speed}s`;

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
        >
            <defs>
                {/* Multicolor gradient (feel free to adjust stops) */}
                <radialGradient id={ids.grad} cx="35%" cy="30%" r="85%">
                    <stop offset="0%" stopColor="#ffcf33" />
                    <stop offset="18%" stopColor="#ff7a21" />
                    <stop offset="33%" stopColor="#ff3c3c" />
                    <stop offset="51%" stopColor="#7a28ff" />
                    <stop offset="70%" stopColor="#1f59ff" />
                    <stop offset="85%" stopColor="#12d7a9" />
                    <stop offset="100%" stopColor="#b7ff5f" />
                </radialGradient>

                {/* Organic blob filter: animated noise + displacement + blur */}
                <filter id={ids.blobFilter} x="-30%" y="-30%" width="160%" height="160%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.006 0.009"
                        numOctaves="3"
                        seed="2"
                        result="noise"
                    >
                        <animate
                            attributeName="baseFrequency"
                            values="0.006 0.009; 0.011 0.006; 0.006 0.009"
                            dur={freqDur}
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="seed"
                            values="2;5;9;2"
                            dur={dispDur}
                            repeatCount="indefinite"
                        />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="90"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    >
                        <animate
                            attributeName="scale"
                            values="60;110;80;60"
                            dur={dispDur}
                            repeatCount="indefinite"
                        />
                    </feDisplacementMap>

                    <feGaussianBlur stdDeviation={blur} />
                </filter>

                {/* The blob mask: start from a soft circle, then distort it */}
                <mask id={ids.mask}>
                    <g filter={`url(#${ids.blobFilter})`}>
                        <circle cx="300" cy="320" r="220" fill="white" />
                    </g>
                </mask>

                {/* Fine “scanlines” overlay pattern (rotated/animated) */}
                <pattern id={ids.linesPattern} width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="8" height="8" fill="black" opacity="0" />
                    <rect x="0" y="0" width="8" height="1.5" fill="white" opacity={lineIntensity} />
                </pattern>

                {/* Mask for the lines so they only appear inside the blob */}
                <mask id={ids.linesMask}>
                    <g filter={`url(#${ids.blobFilter})`}>
                        <circle cx="300" cy="320" r="220" fill="white" />
                    </g>
                </mask>
            </defs>

            {/* Background */}
            <rect x="0" y="0" width="600" height="600" fill="#efe9d2" />

            {/* Gradient rectangle masked to blob */}
            <g mask={`url(#${ids.mask})`}>
                <rect x="0" y="0" width="600" height="600" fill={`url(#${ids.grad})`} />
            </g>

            {/* Subtle moving scanlines to mimic ripples */}
            <g mask={`url(#${ids.linesMask})`}>
                <rect
                    x="-150"
                    y="-150"
                    width="900"
                    height="900"
                    fill={`url(#${ids.linesPattern})`}
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 300 300"
                        to="360 300 300"
                        dur={rotDur}
                        repeatCount="indefinite"
                    />
                </rect>
            </g>
        </svg>
    );
}