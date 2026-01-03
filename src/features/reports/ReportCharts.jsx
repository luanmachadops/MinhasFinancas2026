import React from 'react';

/**
 * Donut Chart Component - Displays category breakdown
 */
export const DonutChart = ({ data, size = 200, strokeWidth = 40 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" width={size} height={size}>
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(51, 65, 85)"
                        strokeWidth={strokeWidth / 5}
                    />
                </svg>
                <p className="text-slate-500 text-sm mt-2">Sem dados</p>
            </div>
        );
    }

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let currentOffset = 0;

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 100 100" width={size} height={size} className="transform -rotate-90">
                {data.map((item, index) => {
                    const percentage = item.value / total;
                    const dashLength = circumference * percentage;
                    const dashOffset = circumference * currentOffset;
                    currentOffset += percentage;

                    return (
                        <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={strokeWidth / 5}
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={-dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                        />
                    );
                })}
                {/* Center circle for donut effect */}
                <circle cx="50" cy="50" r={radius - strokeWidth / 10} fill="rgb(15, 23, 42)" />
            </svg>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full max-w-xs">
                {data.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-300 text-xs truncate">{item.name}</span>
                        <span className="text-slate-500 text-xs ml-auto">
                            {((item.value / total) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Bar Chart Component - Monthly comparison
 */
export const BarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

    return (
        <div className="w-full">
            <div className="flex items-end justify-between gap-2" style={{ height }}>
                {data.map((item, index) => {
                    const incomeHeight = (item.income / maxValue) * 100;
                    const expenseHeight = (item.expense / maxValue) * 100;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center gap-1" style={{ height: height - 30 }}>
                                {/* Income bar */}
                                <div
                                    className="w-[40%] rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500"
                                    style={{ height: `${incomeHeight}%`, minHeight: item.income > 0 ? 4 : 0 }}
                                />
                                {/* Expense bar */}
                                <div
                                    className="w-[40%] rounded-t-md bg-gradient-to-t from-rose-600 to-rose-400 transition-all duration-500"
                                    style={{ height: `${expenseHeight}%`, minHeight: item.expense > 0 ? 4 : 0 }}
                                />
                            </div>
                            <span className="text-slate-500 text-[10px] font-medium">{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" />
                    <span className="text-slate-400 text-xs">Entradas</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-rose-600 to-rose-400" />
                    <span className="text-slate-400 text-xs">Saídas</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Mini Stat Card for PDF
 */
export const StatCard = ({ label, value, type = 'neutral', icon: Icon }) => {
    const colors = {
        income: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
        expense: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400',
        neutral: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400'
    };

    return (
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[type]} border backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className="w-4 h-4 opacity-80" />}
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    );
};
