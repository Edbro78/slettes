
import React, { useState } from 'react';
import { AppState, Event } from './types';
import { useInvestmentCalculator } from './hooks/useInvestmentCalculator';
import { COLORS, START_YEAR } from './constants';
import { ChartDisplay } from './components/ChartDisplay';
import { InputPanels } from './components/InputPanels';

const initialState: AppState = {
    initialPortfolioSize: 10000000,
    investedCapital: 5000000,
    investmentYears: 10,
    payoutYears: 10,
    desiredAnnualPayoutAfterTax: 1000000,
    initialStockAllocation: 85,
    stockReturnRate: 8.0,
    bondReturnRate: 5.0,
    shieldingRate: 3.9,
    taxRate: 37.8,
    annualSavings: 0,
    events: [],
    taperingOption: 'none',
};

const App: React.FC = () => {
    const [state, setState] = useState<AppState>(initialState);

    const prognosis = useInvestmentCalculator(state);

    const handleStateChange = <K extends keyof AppState>(key: K, value: AppState[K]) => {
        setState(prevState => {
            const newState = { ...prevState, [key]: value };

            if (key === 'initialPortfolioSize') {
                const newPortfolioSize = value as number;
                if (newState.investedCapital > newPortfolioSize) {
                    newState.investedCapital = newPortfolioSize;
                }
            }
            
            return newState;
        });
    };

    const addEvent = () => {
        const totalSimulatedYears = state.investmentYears + state.payoutYears;
        const maxYear = START_YEAR + totalSimulatedYears - 1;
        const defaultStartYear = Math.min(maxYear, START_YEAR + 5);
        
        const newEvent: Event = {
            id: `event-${Date.now()}`,
            type: 'Uttak',
            belop: -100000,
            startAar: defaultStartYear,
            sluttAar: defaultStartYear,
        };
        handleStateChange('events', [...state.events, newEvent]);
    };

    const updateEvent = (eventId: string, updatedEvent: Partial<Event>) => {
        const updatedEvents = state.events.map(event =>
            event.id === eventId ? { ...event, ...updatedEvent } : event
        );
        handleStateChange('events', updatedEvents);
    };

    const removeEvent = (eventId: string) => {
        const updatedEvents = state.events.filter(event => event.id !== eventId);
        handleStateChange('events', updatedEvents);
    };

    return (
        <div className="p-4 sm:p-8 w-full max-w-[1840px] mx-auto text-white">
            <div className="dashboard-container flex flex-col gap-6">
                <main className="w-full bg-[#24385B] rounded-xl p-6 flex flex-col">
                    <h1 style={{ color: COLORS.textHeading }} className="text-3xl lg:text-4xl font-bold text-center w-full mb-4">
                        Investeringsprognose
                    </h1>
                    <ChartDisplay prognosis={prognosis} showAllocationChart={state.taperingOption !== 'none'} />
                </main>

                <InputPanels 
                    state={state} 
                    onStateChange={handleStateChange} 
                    onAddEvent={addEvent}
                    onUpdateEvent={updateEvent}
                    onRemoveEvent={removeEvent}
                />
            </div>
        </div>
    );
};

export default App;
