
import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { START_YEAR, COLORS } from '../constants';

interface EventRowProps {
    event: Event;
    maxYear: number;
    onUpdate: (id: string, updatedEvent: Partial<Event>) => void;
    onRemove: (id: string) => void;
}

export const EventRow: React.FC<EventRowProps> = ({ event, maxYear, onUpdate, onRemove }) => {
    const [amountStr, setAmountStr] = useState(event.belop.toLocaleString('nb-NO'));
    const absoluteMaxYear = START_YEAR + maxYear;

    useEffect(() => {
        setAmountStr(event.belop.toLocaleString('nb-NO'));
    }, [event.belop]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const str = e.target.value;
        setAmountStr(str);

        const num = parseFloat(str.replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(num)) {
            onUpdate(event.id, { belop: num });
        }
    };
    
    const handleAmountBlur = () => {
        const num = parseFloat(amountStr.replace(/\s/g, '').replace(',', '.'));
        if (isNaN(num)) {
            onUpdate(event.id, { belop: 0 });
            setAmountStr('0');
        } else {
            onUpdate(event.id, { belop: num });
            setAmountStr(num.toLocaleString('nb-NO'));
        }
    };

    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = parseInt(value, 10);
        let { startAar, sluttAar } = event;

        if (name === 'startAar') {
            startAar = numValue;
            if (startAar > sluttAar) {
                sluttAar = startAar;
            }
        } else { // sluttAar
            sluttAar = numValue;
            if (sluttAar < startAar) {
                startAar = sluttAar;
            }
        }
        onUpdate(event.id, { startAar, sluttAar });
    };

    const highlightLeft = ((event.startAar - START_YEAR) / maxYear) * 100;
    const highlightWidth = ((event.sluttAar - event.startAar) / maxYear) * 100;

    return (
        <div className="bg-black/20 border border-gray-700 rounded-lg p-3 grid grid-cols-12 gap-x-4 gap-y-2 items-center">
            <div className="col-span-12 md:col-span-3">
                 <input type="text" value={event.type} onChange={e => onUpdate(event.id, { type: e.target.value })} 
                    className="w-full bg-black/40 border border-gray-600 px-2 py-1 rounded-md text-sm" placeholder="Navn på hendelse" />
            </div>
            <div className="col-span-12 md:col-span-5 relative h-10">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#364A6E] rounded-full">
                    <div className="absolute h-full rounded-full" style={{ left: `${highlightLeft}%`, width: `${highlightWidth}%`, backgroundColor: COLORS.sliderThumb }}></div>
                </div>
                <input type="range" name="startAar" value={event.startAar} min={START_YEAR} max={absoluteMaxYear} onChange={handleRangeChange} className="absolute w-full top-1/2 -translate-y-1/2 bg-transparent pointer-events-auto" style={{ appearance: 'none', WebkitAppearance: 'none'}} />
                <input type="range" name="sluttAar" value={event.sluttAar} min={START_YEAR} max={absoluteMaxYear} onChange={handleRangeChange} className="absolute w-full top-1/2 -translate-y-1/2 bg-transparent pointer-events-auto" style={{ appearance: 'none', WebkitAppearance: 'none'}} />
                <div className="absolute -bottom-1 w-full flex justify-between text-xs text-gray-400">
                    <span>{event.startAar}</span>
                    <span>{event.sluttAar}</span>
                </div>
            </div>
            <div className="col-span-9 md:col-span-3">
                <input type="text" value={amountStr} onChange={handleAmountChange} onBlur={handleAmountBlur} 
                    className="w-full bg-black/40 border border-gray-600 px-2 py-1 rounded-md text-right text-sm" placeholder="Beløp" />
            </div>
            <div className="col-span-3 md:col-span-1 text-right">
                <button onClick={() => onRemove(event.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
            </div>
        </div>
    );
};
