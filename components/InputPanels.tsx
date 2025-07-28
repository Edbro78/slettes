
import React from 'react';
import { AppState, Event } from '../types';
import { COLORS, STOCK_ALLOCATIONS, TAPERING_OPTIONS } from '../constants';
import { EventRow } from './EventRow';

interface InputPanelsProps {
    state: AppState;
    onStateChange: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
    onAddEvent: () => void;
    onUpdateEvent: (eventId: string, updatedEvent: Partial<Event>) => void;
    onRemoveEvent: (eventId: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const SliderInput: React.FC<{label: string, id: keyof AppState, value: number, min: number, max: number, step: number, state: AppState, onStateChange: InputPanelsProps['onStateChange'], displaySuffix?: string, valueFormatter?: (val: number) => string}> = 
    ({label, id, value, min, max, step, onStateChange, displaySuffix, valueFormatter}) => (
    <div>
        <label htmlFor={id.toString()} className="text-sm uppercase tracking-wider text-gray-300">{label}</label>
        <div className="flex items-center gap-4">
            <input type="range" id={id.toString()} name={id.toString()} value={value} min={min} max={max} step={step} onChange={e => onStateChange(id, parseFloat(e.target.value))} className="w-full mt-1" />
            <span className="text-white font-medium w-32 text-right">{valueFormatter ? valueFormatter(value) : `${value.toLocaleString('nb-NO')}${displaySuffix || ''}`}</span>
        </div>
    </div>
);

export const InputPanels: React.FC<InputPanelsProps> = ({ state, onStateChange, onAddEvent, onUpdateEvent, onRemoveEvent }) => {
    return (
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Assumptions Panel */}
            <aside className="w-full bg-[#24385B] rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6" style={{color: COLORS.textHeading}}>Fer</h2>
                <div className="space-y-6">
                    <SliderInput label="Porteføljestørrelse (NOK)" id="initialPortfolioSize" value={state.initialPortfolioSize} min={2500000} max={100000000} step={500000} state={state} onStateChange={onStateChange} valueFormatter={formatCurrency} />
                    <SliderInput label="Innskutt kapital (skattefri) (NOK)" id="investedCapital" value={state.investedCapital} min={0} max={state.initialPortfolioSize} step={100000} state={state} onStateChange={onStateChange} valueFormatter={formatCurrency} />
                    <SliderInput label={`Antall år investeringsperiode (${state.investmentYears})`} id="investmentYears" value={state.investmentYears} min={1} max={30} step={1} state={state} onStateChange={onStateChange} valueFormatter={(v) => `${v} år`} />
                    <SliderInput label={`Antall år med utbetaling (${state.payoutYears})`} id="payoutYears" value={state.payoutYears} min={0} max={30} step={1} state={state} onStateChange={onStateChange} valueFormatter={(v) => `${v} år`} />
                    <SliderInput label="Ønsket årlig utbetaling (etter skatt) (NOK)" id="desiredAnnualPayoutAfterTax" value={state.desiredAnnualPayoutAfterTax} min={0} max={3000000} step={50000} state={state} onStateChange={onStateChange} valueFormatter={formatCurrency} />
                    <SliderInput label="Årlig sparing (NOK)" id="annualSavings" value={state.annualSavings} min={0} max={1000000} step={10000} state={state} onStateChange={onStateChange} valueFormatter={formatCurrency} />
                </div>
            </aside>
            
            {/* Events and Settings Panel */}
            <footer className="w-full bg-[#24385B] rounded-xl p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold" style={{color: COLORS.textHeading}}>Innstillinger og Hendelser</h2>
                    <button onClick={onAddEvent} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors" style={{backgroundColor: COLORS.buttonSelectedBg}}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>Legg til hendelse</span>
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-sm uppercase tracking-wider text-gray-300">Aksjeandel nedtrapping</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {TAPERING_OPTIONS.map(opt => (
                                <label key={opt.value} className={`p-3 rounded-lg cursor-pointer text-center transition-colors ${state.taperingOption === opt.value ? 'bg-[#00A9E0]' : 'bg-[#002072] hover:bg-[#008CB8]'}`}>
                                    <input type="radio" name="taperingOption" value={opt.value} checked={state.taperingOption === opt.value} onChange={e => onStateChange('taperingOption', e.target.value)} className="hidden"/>
                                    <span className="block font-semibold text-sm">{opt.label}</span>
                                    <span className="block text-xs text-gray-300">{opt.subLabel}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                         <label className="text-sm uppercase tracking-wider text-gray-300">Aksjeandel første år (%)</label>
                         <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 mt-2">
                            {STOCK_ALLOCATIONS.map(alloc => (
                                <button key={alloc} onClick={() => onStateChange('initialStockAllocation', alloc)} className={`aspect-square rounded-lg flex items-center justify-center text-center text-sm font-semibold p-1 transition-colors ${state.initialStockAllocation === alloc ? 'bg-[#00A9E0] shadow-md shadow-[#00A9E0]/50' : 'bg-[#002072] hover:bg-[#008CB8]'}`}>
                                    {alloc === 0 ? '100% Renter' : `${alloc}% Aksjer`}
                                </button>
                            ))}
                         </div>
                    </div>
                    <SliderInput label="Forventet avkastning aksjer" id="stockReturnRate" value={state.stockReturnRate} min={5} max={10} step={0.1} state={state} onStateChange={onStateChange} displaySuffix="%" />
                    <SliderInput label="Forventet avkastning renter" id="bondReturnRate" value={state.bondReturnRate} min={4} max={8} step={0.1} state={state} onStateChange={onStateChange} displaySuffix="%" />
                    <SliderInput label="Skjermingsrente" id="shieldingRate" value={state.shieldingRate} min={0} max={10} step={0.1} state={state} onStateChange={onStateChange} displaySuffix="%" />
                     
                    <div className="flex justify-between items-center">
                        <label className="text-sm uppercase tracking-wider text-gray-300">Skattesats på uttak</label>
                        <div className="flex items-center gap-2 w-32">
                           <input type="number" value={state.taxRate} disabled className="w-full text-right px-2 py-1 bg-transparent border border-gray-600 rounded-md opacity-50 cursor-not-allowed"/>
                           <span>%</span>
                        </div>
                    </div>
                    <div id="events-container" className="space-y-3">
                         {state.events.map(event => (
                            <EventRow key={event.id} event={event} maxYear={state.investmentYears + state.payoutYears -1} onUpdate={onUpdateEvent} onRemove={onRemoveEvent} />
                         ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};
