
export interface AppState {
    initialPortfolioSize: number;
    investedCapital: number;
    investmentYears: number;
    payoutYears: number;
    desiredAnnualPayoutAfterTax: number;
    initialStockAllocation: number;
    stockReturnRate: number;
    bondReturnRate: number;
    shieldingRate: number;
    taxRate: number;
    annualSavings: number;
    events: Event[];
    taperingOption: string;
}

export interface Event {
    id: string;
    type: string;
    belop: number;
    startAar: number;
    sluttAar: number;
}

export interface PrognosisData {
    hovedstol: number[];
    avkastning: number[];
    sparing: number[];
    nettoUtbetaling: number[];
    skatt: number[];
    renteskatt: number[];
    event_total: number[];
    annualStockPercentages: number[];
    annualBondPercentages: number[];
    investedCapitalHistory: number[];
}

export interface PrognosisResult {
    labels: string[];
    data: PrognosisData;
}
