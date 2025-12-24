import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTHS = [
    { short: 'JAN', full: 'Janeiro' },
    { short: 'FEV', full: 'Fevereiro' },
    { short: 'MAR', full: 'Março' },
    { short: 'ABR', full: 'Abril' },
    { short: 'MAI', full: 'Maio' },
    { short: 'JUN', full: 'Junho' },
    { short: 'JUL', full: 'Julho' },
    { short: 'AGO', full: 'Agosto' },
    { short: 'SET', full: 'Setembro' },
    { short: 'OUT', full: 'Outubro' },
    { short: 'NOV', full: 'Novembro' },
    { short: 'DEZ', full: 'Dezembro' },
];

export const MonthPicker = ({ isOpen, onClose, month, year, onSelect }) => {
    const [tempYear, setTempYear] = useState(year);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (!isOpen) return null;

    const handleMonthSelect = (monthIndex) => {
        onSelect(monthIndex, tempYear);
        onClose();
    };

    const goToCurrentMonth = () => {
        onSelect(currentMonth, currentYear);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-[fadeIn_0.2s_ease-out]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto animate-[scaleIn_0.2s_ease-out]">
                <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">

                    {/* Year Selector */}
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between">
                        <button
                            onClick={() => setTempYear(tempYear - 1)}
                            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="text-2xl font-bold text-white">{tempYear}</span>
                        <button
                            onClick={() => setTempYear(tempYear + 1)}
                            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Months Grid */}
                    <div className="p-4 grid grid-cols-6 gap-2">
                        {MONTHS.map((m, index) => {
                            const isSelected = index === month && tempYear === year;
                            const isCurrent = index === currentMonth && tempYear === currentYear;

                            return (
                                <button
                                    key={m.short}
                                    onClick={() => handleMonthSelect(index)}
                                    className={`
                                        py-3 rounded-xl text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'bg-violet-500 text-white'
                                            : isCurrent
                                                ? 'text-violet-400 bg-violet-500/10'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }
                                    `}
                                >
                                    {m.short}
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={goToCurrentMonth}
                            className="px-4 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            MÊS ATUAL
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// Simplified MonthSelector that opens the picker
export const MonthSelector = ({ month, year, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handlePrev = () => {
        let newMonth = month - 1;
        let newYear = year;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        onChange(newMonth, newYear);
    };

    const handleNext = () => {
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        onChange(newMonth, newYear);
    };

    return (
        <>
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={handlePrev}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={() => setShowPicker(true)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-medium min-w-[160px] text-center transition-colors border border-slate-700"
                >
                    {MONTHS[month].full} {year}
                </button>

                <button
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <MonthPicker
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
                month={month}
                year={year}
                onSelect={onChange}
            />
        </>
    );
};
