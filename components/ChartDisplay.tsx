
import React, { useRef, useEffect } from 'react';
import type { ChartData, ChartOptions, Chart } from 'chart.js';
import { PrognosisResult } from '../types';
import { COLORS, LEGEND_DATA } from '../constants';

interface ChartComponentProps {
    data: ChartData;
    options: ChartOptions;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, options }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new (window as any).Chart(ctx, {
            ...options,
            data: data
        });

        return () => {
            chartRef.current?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.data = data;
            chartRef.current.options = options;
            chartRef.current.update();
        }
    }, [data, options]);

    return <canvas ref={canvasRef}></canvas>;
};


interface ChartDisplayProps {
    prognosis: PrognosisResult;
    showAllocationChart: boolean;
}

const commonOptions: Partial<ChartOptions> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
    },
    scales: {
        x: { 
            stacked: true, 
            grid: { display: false }, 
            ticks: { color: COLORS.textGeneral, font: { size: 12 } } 
        },
        y: { 
            stacked: true, 
            grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
            ticks: { color: COLORS.textGeneral, font: { size: 12 } }
        }
    }
};

const formatCurrency = (value: number) => (value / 1000000).toLocaleString('no-NO', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' MNOK';


export const ChartDisplay: React.FC<ChartDisplayProps> = ({ prognosis, showAllocationChart }) => {
    const { labels, data } = prognosis;

    const investmentChartData: ChartData = {
        labels,
        datasets: [
            { label: 'Avkastning', data: data.avkastning, backgroundColor: COLORS.avkastning, stack: 'portfolio' },
            { label: 'Årlig sparing', data: data.sparing, backgroundColor: COLORS.sparing, stack: 'portfolio' },
            { label: 'Hovedstol', data: data.hovedstol, backgroundColor: COLORS.hovedstol, stack: 'portfolio' },
            { label: 'Netto utbetaling', data: data.nettoUtbetaling, backgroundColor: COLORS.utbetaling_netto, stack: 'portfolio' },
            { label: 'Skatt', data: data.skatt, backgroundColor: COLORS.utbetaling_skatt, stack: 'portfolio' },
            { label: 'Løpende renteskatt', data: data.renteskatt, backgroundColor: COLORS.renteskatt, stack: 'portfolio' },
            { label: 'Hendelser', data: data.event_total, backgroundColor: COLORS.event_total_color, stack: 'portfolio' }
        ]
    };
    
    const investmentChartOptions: ChartOptions = {
        ...commonOptions,
        type: 'bar',
        scales: {
            ...commonOptions.scales,
             y: {
                ...commonOptions.scales?.y,
                beginAtZero: false,
                ticks: {
                     ...commonOptions.scales?.y?.ticks,
                     callback: (value) => {
                        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                        return formatCurrency(numericValue);
                    }
                }
            }
        },
        plugins: {
            ...commonOptions.plugins,
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString('no-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0 })}`
                }
            }
        }
    };
    
    const allocationChartData: ChartData = {
        labels,
        datasets: [
            { label: 'Aksjeandel', data: data.annualStockPercentages, backgroundColor: COLORS.aksjeandel, borderColor: COLORS.aksjeandel, fill: true, stack: 'allocation', tension: 0.4 },
            { label: 'Renteandel', data: data.annualBondPercentages, backgroundColor: COLORS.renteandel, borderColor: COLORS.renteandel, fill: true, stack: 'allocation', tension: 0.4 }
        ]
    };

    const allocationChartOptions: ChartOptions = {
        ...commonOptions,
        type: 'line',
        plugins: {
             ...commonOptions.plugins,
             title: { display: true, text: 'Aksjeandel over tid', color: COLORS.textHeading, font: { size: 16, weight: 'bold' } },
             legend: { display: true, labels: { color: COLORS.textGeneral } },
             tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${Number(context.raw).toFixed(1)}%` } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: COLORS.textGeneral } },
            y: { stacked: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: COLORS.textGeneral, callback: (value) => `${value}%` } }
        }
    };

    const investedCapitalChartData: ChartData = {
        labels,
        datasets: [
            { label: 'Innskutt kapital', data: data.investedCapitalHistory, backgroundColor: COLORS.innskutt_kapital, borderColor: COLORS.innskutt_kapital, borderWidth: 1 }
        ]
    };

    const investedCapitalChartOptions: ChartOptions = {
        ...commonOptions,
        type: 'bar',
        plugins: {
            ...commonOptions.plugins,
            title: { display: true, text: 'Innskutt kapital over tid', color: COLORS.textHeading, font: { size: 16, weight: 'bold' } },
            legend: { display: true, labels: { color: COLORS.textGeneral } },
            tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString('no-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0 })}` } }
        },
        scales: {
             x: { grid: { display: false }, ticks: { color: COLORS.textGeneral } },
             y: {
                stacked: false,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: COLORS.textGeneral, callback: (value) => formatCurrency(Number(value)) },
                beginAtZero: true
             }
        }
    };

    return (
        <>
            <div className="flex-grow relative h-[500px]">
                <ChartComponent data={investmentChartData} options={investmentChartOptions} />
            </div>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                {LEGEND_DATA.map(item => (
                    <div key={item.label} className="flex items-center">
                        <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: item.color }}></div>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
            <div className={`w-full bg-[#24385B] flex-col mt-4 rounded-xl ${showAllocationChart ? 'flex' : 'hidden'}`}>
                <div className="flex-grow relative h-[300px] p-4">
                     <ChartComponent data={allocationChartData} options={allocationChartOptions} />
                </div>
            </div>
            <div className="w-full bg-[#24385B] flex flex-col mt-4 rounded-xl">
                 <div className="flex-grow relative h-[300px] p-4">
                     <ChartComponent data={investedCapitalChartData} options={investedCapitalChartOptions} />
                </div>
            </div>
        </>
    );
};
