
import { useMemo } from 'react';
import { AppState, PrognosisResult, PrognosisData } from '../types';
import { START_YEAR } from '../constants';

const calculatePrognosis = (state: AppState): PrognosisResult => {
    const {
        initialPortfolioSize, investedCapital, investmentYears, payoutYears,
        desiredAnnualPayoutAfterTax, initialStockAllocation, stockReturnRate,
        bondReturnRate, shieldingRate, taxRate, annualSavings, events, taperingOption
    } = state;

    const totalSimulatedYears = investmentYears + payoutYears;
    const stockReturnDecimal = stockReturnRate / 100;
    const bondReturnDecimal = bondReturnRate / 100;
    const shieldingDecimal = shieldingRate / 100;
    const taxDecimal = taxRate / 100;
    const bondTaxDecimal = 0.22;

    const annualStockPercentages = Array(totalSimulatedYears).fill(0);
    for (let i = 0; i < totalSimulatedYears; i++) {
        if (i < investmentYears) {
            annualStockPercentages[i] = initialStockAllocation;
        } else {
            if (taperingOption !== 'none') {
                const taperRate = parseFloat(taperingOption) / 100;
                const payoutYearIndex = i - investmentYears;
                const basePercentage = (investmentYears > 0 ? annualStockPercentages[investmentYears - 1] : initialStockAllocation);
                const reductionAmount = payoutYearIndex * (taperRate * 100);
                annualStockPercentages[i] = Math.max(0, basePercentage - reductionAmount);
            } else {
                annualStockPercentages[i] = (investmentYears > 0 ? annualStockPercentages[investmentYears - 1] : initialStockAllocation);
            }
        }
    }

    const labels: string[] = [];
    const data: PrognosisData = {
        hovedstol: [], avkastning: [], sparing: [], nettoUtbetaling: [], skatt: [], renteskatt: [],
        event_total: [], annualStockPercentages: [], annualBondPercentages: [], investedCapitalHistory: []
    };

    let currentPortfolioValue = initialPortfolioSize;
    let taxFreeCapitalRemaining = investedCapital;

    for (let i = 0; i < totalSimulatedYears; i++) {
        const year = START_YEAR + i;
        labels.push(year.toString());

        const startOfYearPortfolioValue = currentPortfolioValue;
        
        taxFreeCapitalRemaining *= (1 + shieldingDecimal);

        let currentYearEventNetAmount = 0;
        events.forEach(event => {
            if (year >= event.startAar && year <= event.sluttAar) {
                currentYearEventNetAmount += event.belop;
            }
        });

        currentPortfolioValue += currentYearEventNetAmount;
        taxFreeCapitalRemaining += currentYearEventNetAmount;
        currentPortfolioValue += annualSavings;
        taxFreeCapitalRemaining += annualSavings;

        const stockAlloc = annualStockPercentages[i] / 100;
        const bondAlloc = 1 - stockAlloc;
        const stockValue = currentPortfolioValue * stockAlloc;
        const bondValue = currentPortfolioValue * bondAlloc;

        const grossStockReturn = stockValue * stockReturnDecimal;
        const grossBondReturn = bondValue * bondReturnDecimal;
        const annualBondTaxAmount = grossBondReturn * bondTaxDecimal;
        const totalGrossReturn = grossStockReturn + grossBondReturn;
        const netReturnAfterBondTax = totalGrossReturn - annualBondTaxAmount;

        currentPortfolioValue += netReturnAfterBondTax;
        
        let annualNetWithdrawalAmountForChart = 0;
        let withdrawalTax = 0;
        const isPayoutYear = i >= investmentYears;

        if (isPayoutYear && desiredAnnualPayoutAfterTax > 0) {
            let desiredNet = desiredAnnualPayoutAfterTax;
            
            let fromTaxFree = Math.min(desiredNet, taxFreeCapitalRemaining);
            taxFreeCapitalRemaining -= fromTaxFree;
            currentPortfolioValue -= fromTaxFree;
            annualNetWithdrawalAmountForChart += fromTaxFree;

            let remainingDesiredNet = desiredNet - fromTaxFree;
            if (remainingDesiredNet > 0 && currentPortfolioValue > 0) {
                let grossNeededFromTaxable = remainingDesiredNet / (1 - taxDecimal);
                let taxableAmount = Math.min(grossNeededFromTaxable, currentPortfolioValue);
                
                let taxForPension = taxableAmount * taxDecimal;
                withdrawalTax += taxForPension;
                
                let netAfterTaxForPension = taxableAmount - taxForPension;
                annualNetWithdrawalAmountForChart += netAfterTaxForPension;
                currentPortfolioValue -= taxableAmount;
            }
        }
        
        currentPortfolioValue = Math.max(0, currentPortfolioValue);
        taxFreeCapitalRemaining = Math.max(0, taxFreeCapitalRemaining);

        data.hovedstol.push(Math.round(startOfYearPortfolioValue));
        data.avkastning.push(Math.round(totalGrossReturn));
        data.sparing.push(Math.round(annualSavings));
        data.event_total.push(Math.round(currentYearEventNetAmount));
        data.nettoUtbetaling.push(Math.round(-annualNetWithdrawalAmountForChart));
        data.skatt.push(Math.round(-withdrawalTax));
        data.renteskatt.push(Math.round(-annualBondTaxAmount));
        data.annualStockPercentages.push(stockAlloc * 100);
        data.annualBondPercentages.push(bondAlloc * 100);
        data.investedCapitalHistory.push(Math.round(taxFreeCapitalRemaining));
    }

    return { labels, data };
};

export const useInvestmentCalculator = (state: AppState): PrognosisResult => {
    return useMemo(() => calculatePrognosis(state), [state]);
};
