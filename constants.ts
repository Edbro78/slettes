
export const START_YEAR = new Date().getFullYear();

export const COLORS = {
    primaryBgDark: '#1A2A47',
    cardBgDark: '#24385B',
    hovedstol: '#4ADE80',
    avkastning: '#93C5FD',
    sparing: '#3B82F6',
    utbetaling_netto: '#9CA3AF',
    utbetaling_skatt: '#CD5C5C',
    event_total_color: '#FF6347',
    renteskatt: '#FFD700',
    aksjeandel: '#81C784',
    renteandel: '#64B5F6',
    innskutt_kapital: '#A78BFA',
    sliderTrack: '#364A6E',
    sliderThumb: '#60A5FA',
    textGeneral: '#FFFFFF',
    textHeading: '#FFFFFF',
    textLabel: '#E5E7EB',
    buttonDefaultBg: '#002072',
    buttonSelectedBg: '#00A9E0',
    buttonHoverBg: '#008CB8',
    inputBorder: '#475569'
};

export const LEGEND_DATA = [
    { label: 'Hovedstol', color: COLORS.hovedstol },
    { label: 'Avkastning', color: COLORS.avkastning },
    { label: 'Årlig sparing', color: COLORS.sparing },
    { label: 'Hendelser', color: COLORS.event_total_color },
    { label: 'Netto utbetaling', color: COLORS.utbetaling_netto },
    { label: 'Skatt', color: COLORS.utbetaling_skatt },
    { label: 'Løpende renteskatt', color: COLORS.renteskatt }
];

export const STOCK_ALLOCATIONS = [0, 20, 45, 55, 65, 85, 100];

export const TAPERING_OPTIONS = [
    { value: 'none', label: 'Ingen nedtrapping', subLabel: '(Standard)' },
    { value: '5', label: '5% nedtrapping', subLabel: 'per år' },
    { value: '10', label: '10% nedtrapping', subLabel: 'per år' },
    { value: '15', label: '15% nedtrapping', subLabel: 'per år' }
];
