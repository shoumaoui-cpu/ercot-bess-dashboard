/**
 * G-ZIP Data Center Market Regions
 * GW-scale load capacity data
 */

const DC_MARKET_REGIONS = {
    'NOVA': { name: 'Northern Virginia', rank: 1, iso: 'PJM', currentGW: 4.2, projectedGW_2028: 7.8, pipelineGW: 3.6 },
    'DFW': { name: 'Dallas-Fort Worth', rank: 2, iso: 'ERCOT', currentGW: 2.1, projectedGW_2028: 4.5, pipelineGW: 2.4 },
    'PHX': { name: 'Phoenix Metro', rank: 3, iso: 'WECC', currentGW: 1.4, projectedGW_2028: 3.2, pipelineGW: 1.8 },
    'CHI': { name: 'Chicago Metro', rank: 4, iso: 'PJM/MISO', currentGW: 0.9, projectedGW_2028: 2.1, pipelineGW: 1.2 },
    'ATL': { name: 'Atlanta Metro', rank: 5, iso: 'SERC', currentGW: 0.8, projectedGW_2028: 1.9, pipelineGW: 1.1 },
    'SV': { name: 'Silicon Valley', rank: 6, iso: 'CAISO', currentGW: 0.7, projectedGW_2028: 1.2, pipelineGW: 0.5 },
    'HOU': { name: 'Houston Metro', rank: 7, iso: 'ERCOT', currentGW: 0.6, projectedGW_2028: 1.8, pipelineGW: 1.2 },
    'AUS': { name: 'Austin Metro', rank: 8, iso: 'ERCOT', currentGW: 0.5, projectedGW_2028: 1.4, pipelineGW: 0.9 },
    'NYC': { name: 'NY/NJ Metro', rank: 9, iso: 'NYISO/PJM', currentGW: 0.6, projectedGW_2028: 1.1, pipelineGW: 0.5 },
    'SLC': { name: 'Salt Lake City', rank: 10, iso: 'WECC', currentGW: 0.4, projectedGW_2028: 1.0, pipelineGW: 0.6 },
    'PDX': { name: 'Portland/Hillsboro', rank: 11, iso: 'WECC', currentGW: 0.35, projectedGW_2028: 0.9, pipelineGW: 0.55 },
    'DEN': { name: 'Denver Metro', rank: 12, iso: 'WECC', currentGW: 0.3, projectedGW_2028: 0.8, pipelineGW: 0.5 },
    'CMH': { name: 'Columbus', rank: 13, iso: 'PJM', currentGW: 0.4, projectedGW_2028: 1.2, pipelineGW: 0.8 },
    'SAT': { name: 'San Antonio', rank: 14, iso: 'ERCOT', currentGW: 0.25, projectedGW_2028: 0.7, pipelineGW: 0.45 },
    'LAS': { name: 'Las Vegas', rank: 15, iso: 'WECC', currentGW: 0.3, projectedGW_2028: 0.85, pipelineGW: 0.55 },
    'MSP': { name: 'Minneapolis', rank: 16, iso: 'MISO', currentGW: 0.2, projectedGW_2028: 0.5, pipelineGW: 0.3 },
    'SEA': { name: 'Seattle/Tacoma', rank: 17, iso: 'WECC', currentGW: 0.35, projectedGW_2028: 0.7, pipelineGW: 0.35 },
    'MCI': { name: 'Kansas City', rank: 18, iso: 'SPP', currentGW: 0.15, projectedGW_2028: 0.45, pipelineGW: 0.3 },
    'RNO': { name: 'Reno/Sparks', rank: 19, iso: 'WECC', currentGW: 0.2, projectedGW_2028: 0.6, pipelineGW: 0.4 },
    'RIC': { name: 'Richmond', rank: 20, iso: 'PJM', currentGW: 0.15, projectedGW_2028: 0.5, pipelineGW: 0.35 },
    'IND': { name: 'Indianapolis', rank: 21, iso: 'MISO', currentGW: 0.12, projectedGW_2028: 0.4, pipelineGW: 0.28 },
    'SC': { name: 'South Carolina', rank: 22, iso: 'SERC', currentGW: 0.1, projectedGW_2028: 0.5, pipelineGW: 0.4 },
    'RDU': { name: 'Research Triangle', rank: 23, iso: 'SERC', currentGW: 0.18, projectedGW_2028: 0.55, pipelineGW: 0.37 },
    'OMA': { name: 'Omaha', rank: 24, iso: 'SPP', currentGW: 0.1, projectedGW_2028: 0.35, pipelineGW: 0.25 }
};

// Total US Data Center Load Summary
const US_DC_LOAD_SUMMARY = {
    totalCurrentGW: 14.45,
    totalProjectedGW_2028: 32.65,
    totalPipelineGW: 18.2,
    cagr: 0.226 // 22.6% compound annual growth
};
