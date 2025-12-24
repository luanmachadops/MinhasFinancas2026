import React from 'react';

export const DonutChart = ({ data, size = 160, thickness = 20 }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    const radius = (size - thickness) / 2;
    const center = size / 2;

    if (total === 0) {
        return (
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth={thickness}
                    />
                </svg>
            </div>
        );
    }

    let currentAngle = 0;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                {data.map((item, index) => {
                    const angle = (item.value / total) * 360;

                    if (data.length === 1 || angle === 360) {
                        return (
                            <circle
                                key={index}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={thickness}
                            />
                        );
                    }

                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const x1 = center + radius * Math.cos(Math.PI * currentAngle / 180);
                    const y1 = center + radius * Math.sin(Math.PI * currentAngle / 180);
                    const x2 = center + radius * Math.cos(Math.PI * (currentAngle + angle) / 180);
                    const y2 = center + radius * Math.sin(Math.PI * (currentAngle + angle) / 180);

                    const pathd = [
                        `M ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
                    ].join(' ');

                    currentAngle += angle;

                    return (
                        <path
                            key={index}
                            d={pathd}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={thickness}
                            strokeLinecap="round"
                        />
                    );
                })}
            </svg>
        </div>
    );
};
