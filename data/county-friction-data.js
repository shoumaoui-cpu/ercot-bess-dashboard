/**
 * G-ZIP County-Level Friction Scores
 * All US counties actively engaged in data center siting policy
 */

const COUNTY_FRICTION_DATA = {
    // ===== NORTHERN VIRGINIA (PJM) =====
    'Loudoun_VA': { lat: 39.08, lon: -77.64, market: 'NOVA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 2800, projectedMW: 4500, overlay: true, oz: true },
    'Prince William_VA': { lat: 38.70, lon: -77.48, market: 'NOVA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 850, projectedMW: 2200, overlay: true, oz: true },
    'Fairfax_VA': { lat: 38.85, lon: -77.27, market: 'NOVA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 450, projectedMW: 700, overlay: false, oz: true },
    'Fauquier_VA': { lat: 38.72, lon: -77.81, market: 'NOVA', zoning: 'conditional', sentiment: 'hostile', tax: 'standard', frictionScore: 68, currentMW: 50, projectedMW: 150, overlay: false, oz: false },
    'Stafford_VA': { lat: 38.42, lon: -77.45, market: 'NOVA', zoning: 'conditional', sentiment: 'welcoming', tax: 'abatement', frictionScore: 24, currentMW: 100, projectedMW: 400, overlay: false, oz: true },
    
    // ===== MARYLAND =====
    'Frederick_MD': { lat: 39.47, lon: -77.41, market: 'NOVA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 80, projectedMW: 250, overlay: true, oz: true },
    'Montgomery_MD': { lat: 39.14, lon: -77.20, market: 'NOVA', zoning: 'moratorium', sentiment: 'hostile', tax: 'high', frictionScore: 100, currentMW: 120, projectedMW: 120, overlay: false, oz: false },
    'Howard_MD': { lat: 39.25, lon: -76.93, market: 'NOVA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 150, overlay: false, oz: true },
    'Anne Arundel_MD': { lat: 38.95, lon: -76.56, market: 'NOVA', zoning: 'conditional', sentiment: 'welcoming', tax: 'abatement', frictionScore: 24, currentMW: 40, projectedMW: 120, overlay: false, oz: true },
    
    // ===== DALLAS-FORT WORTH (ERCOT) =====
    'Dallas_TX': { lat: 32.77, lon: -96.80, market: 'DFW', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 650, projectedMW: 1100, overlay: false, oz: true },
    'Collin_TX': { lat: 33.19, lon: -96.57, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 380, projectedMW: 950, overlay: true, oz: true },
    'Denton_TX': { lat: 33.21, lon: -97.13, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 280, projectedMW: 700, overlay: true, oz: true },
    'Tarrant_TX': { lat: 32.77, lon: -97.29, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'standard', frictionScore: 13, currentMW: 320, projectedMW: 650, overlay: false, oz: true },
    'Ellis_TX': { lat: 32.35, lon: -96.79, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 150, projectedMW: 500, overlay: false, oz: true },
    'Kaufman_TX': { lat: 32.60, lon: -96.29, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 400, overlay: true, oz: false },
    'Rockwall_TX': { lat: 32.89, lon: -96.41, market: 'DFW', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 80, overlay: false, oz: false },
    
    // ===== HOUSTON (ERCOT) =====
    'Harris_TX': { lat: 29.79, lon: -95.39, market: 'HOU', zoning: 'by-right', sentiment: 'welcoming', tax: 'standard', frictionScore: 13, currentMW: 420, projectedMW: 1100, overlay: false, oz: true },
    'Fort Bend_TX': { lat: 29.53, lon: -95.77, market: 'HOU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 350, overlay: false, oz: true },
    'Montgomery_TX': { lat: 30.32, lon: -95.50, market: 'HOU', zoning: 'by-right', sentiment: 'neutral', tax: 'standard', frictionScore: 22, currentMW: 60, projectedMW: 200, overlay: false, oz: false },
    'Brazoria_TX': { lat: 29.17, lon: -95.43, market: 'HOU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 200, overlay: false, oz: true },
    
    // ===== AUSTIN (ERCOT) =====
    'Travis_TX': { lat: 30.27, lon: -97.74, market: 'AUS', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 280, projectedMW: 500, overlay: false, oz: true },
    'Williamson_TX': { lat: 30.65, lon: -97.60, market: 'AUS', zoning: 'by-right', sentiment: 'neutral', tax: 'abatement', frictionScore: 22, currentMW: 120, projectedMW: 450, overlay: true, oz: true },
    'Hays_TX': { lat: 30.05, lon: -98.00, market: 'AUS', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 180, overlay: false, oz: true },
    'Bastrop_TX': { lat: 30.11, lon: -97.32, market: 'AUS', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 60, projectedMW: 280, overlay: false, oz: true },
    
    // ===== SAN ANTONIO (ERCOT) =====
    'Bexar_TX': { lat: 29.45, lon: -98.52, market: 'SAT', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 180, projectedMW: 500, overlay: false, oz: true },
    'Comal_TX': { lat: 29.81, lon: -98.26, market: 'SAT', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: false, oz: false },
    'Guadalupe_TX': { lat: 29.58, lon: -97.95, market: 'SAT', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    
    // ===== PHOENIX (WECC) =====
    'Maricopa_AZ': { lat: 33.35, lon: -112.49, market: 'PHX', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 1200, projectedMW: 2800, overlay: true, oz: true },
    'Pinal_AZ': { lat: 32.90, lon: -111.35, market: 'PHX', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 150, projectedMW: 350, overlay: false, oz: true },
    'Pima_AZ': { lat: 32.10, lon: -111.68, market: 'PHX', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 100, overlay: false, oz: true },
    
    // ===== CHICAGO (PJM/MISO) =====
    'Cook_IL': { lat: 41.84, lon: -87.82, market: 'CHI', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 350, projectedMW: 650, overlay: false, oz: true },
    'DuPage_IL': { lat: 41.85, lon: -88.09, market: 'CHI', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 200, projectedMW: 450, overlay: false, oz: true },
    'Will_IL': { lat: 41.45, lon: -87.98, market: 'CHI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 120, projectedMW: 400, overlay: true, oz: true },
    'Kane_IL': { lat: 41.94, lon: -88.43, market: 'CHI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 250, overlay: false, oz: true },
    'Lake_IL': { lat: 42.35, lon: -87.96, market: 'CHI', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 120, overlay: false, oz: false },
    
    // ===== ATLANTA (SERC) =====
    'Fulton_GA': { lat: 33.79, lon: -84.39, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 280, projectedMW: 500, overlay: false, oz: true },
    'Douglas_GA': { lat: 33.70, lon: -84.77, market: 'ATL', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 180, projectedMW: 550, overlay: true, oz: true },
    'Cobb_GA': { lat: 33.94, lon: -84.58, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 120, projectedMW: 250, overlay: false, oz: true },
    'DeKalb_GA': { lat: 33.77, lon: -84.23, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 100, projectedMW: 200, overlay: false, oz: true },
    'Gwinnett_GA': { lat: 33.96, lon: -84.02, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 80, projectedMW: 200, overlay: false, oz: true },
    'Henry_GA': { lat: 33.45, lon: -84.15, market: 'ATL', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 50, projectedMW: 200, overlay: false, oz: true },
    
    // ===== COLUMBUS (PJM) =====
    'Franklin_OH': { lat: 39.97, lon: -83.00, market: 'CMH', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 200, projectedMW: 550, overlay: true, oz: true },
    'Licking_OH': { lat: 40.09, lon: -82.45, market: 'CMH', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 120, projectedMW: 450, overlay: true, oz: true },
    'Delaware_OH': { lat: 40.28, lon: -83.07, market: 'CMH', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 40, projectedMW: 120, overlay: false, oz: false },
    'Union_OH': { lat: 40.30, lon: -83.38, market: 'CMH', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 30, projectedMW: 150, overlay: false, oz: true },
    'Madison_OH': { lat: 39.89, lon: -83.40, market: 'CMH', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    
    // ===== SILICON VALLEY (CAISO) =====
    'Santa Clara_CA': { lat: 37.36, lon: -121.97, market: 'SV', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 500, projectedMW: 700, overlay: false, oz: true },
    'San Mateo_CA': { lat: 37.43, lon: -122.35, market: 'SV', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 120, projectedMW: 200, overlay: false, oz: true },
    'Alameda_CA': { lat: 37.65, lon: -121.92, market: 'SV', zoning: 'conditional', sentiment: 'neutral', tax: 'high', frictionScore: 56, currentMW: 80, projectedMW: 150, overlay: false, oz: true },
    
    // ===== LAS VEGAS (WECC) =====
    'Clark_NV': { lat: 36.21, lon: -115.02, market: 'LAS', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 250, projectedMW: 700, overlay: true, oz: true },
    'Nye_NV': { lat: 38.04, lon: -117.07, market: 'LAS', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 50, projectedMW: 180, overlay: false, oz: true },
    
    // ===== RENO (WECC) =====
    'Washoe_NV': { lat: 39.65, lon: -119.75, market: 'RNO', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 150, projectedMW: 450, overlay: true, oz: true },
    'Storey_NV': { lat: 39.40, lon: -119.53, market: 'RNO', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: true, oz: true },
    'Lyon_NV': { lat: 39.02, lon: -119.19, market: 'RNO', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    
    // ===== SALT LAKE CITY (WECC) =====
    'Salt Lake_UT': { lat: 40.67, lon: -111.93, market: 'SLC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 280, projectedMW: 650, overlay: false, oz: true },
    'Utah_UT': { lat: 40.12, lon: -111.67, market: 'SLC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 250, overlay: true, oz: true },
    'Tooele_UT': { lat: 40.45, lon: -112.90, market: 'SLC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    'Davis_UT': { lat: 41.00, lon: -112.00, market: 'SLC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 50, overlay: false, oz: false },
    
    // ===== DENVER (WECC) =====
    'Douglas_CO': { lat: 39.33, lon: -104.93, market: 'DEN', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 150, projectedMW: 350, overlay: false, oz: false },
    'Arapahoe_CO': { lat: 39.65, lon: -104.34, market: 'DEN', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 100, projectedMW: 280, overlay: false, oz: true },
    'Adams_CO': { lat: 39.87, lon: -104.33, market: 'DEN', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: false, oz: true },
    'Jefferson_CO': { lat: 39.59, lon: -105.25, market: 'DEN', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 60, overlay: false, oz: true },
    'Weld_CO': { lat: 40.55, lon: -104.39, market: 'DEN', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    
    // ===== PORTLAND (WECC) =====
    'Washington_OR': { lat: 45.56, lon: -123.11, market: 'PDX', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 280, projectedMW: 700, overlay: true, oz: true },
    'Multnomah_OR': { lat: 45.55, lon: -122.42, market: 'PDX', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 50, projectedMW: 80, overlay: false, oz: true },
    'Clackamas_OR': { lat: 45.19, lon: -122.22, market: 'PDX', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 100, overlay: false, oz: true },
    
    // ===== SEATTLE (WECC) =====
    'King_WA': { lat: 47.49, lon: -121.84, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 280, projectedMW: 500, overlay: false, oz: true },
    'Pierce_WA': { lat: 47.04, lon: -122.14, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 40, projectedMW: 120, overlay: false, oz: true },
    'Snohomish_WA': { lat: 48.04, lon: -121.75, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 80, overlay: false, oz: false },
    'Kitsap_WA': { lat: 47.64, lon: -122.65, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 10, projectedMW: 30, overlay: false, oz: true },
    
    // ===== MINNEAPOLIS (MISO) =====
    'Hennepin_MN': { lat: 45.00, lon: -93.47, market: 'MSP', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 120, projectedMW: 280, overlay: false, oz: true },
    'Ramsey_MN': { lat: 45.02, lon: -93.10, market: 'MSP', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 100, overlay: false, oz: true },
    'Dakota_MN': { lat: 44.67, lon: -93.07, market: 'MSP', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 30, projectedMW: 120, overlay: false, oz: true },
    'Anoka_MN': { lat: 45.27, lon: -93.25, market: 'MSP', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 10, projectedMW: 40, overlay: false, oz: false },
    
    // ===== KANSAS CITY (SPP) =====
    'Johnson_KS': { lat: 38.88, lon: -94.82, market: 'MCI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 250, overlay: false, oz: true },
    'Jackson_MO': { lat: 39.05, lon: -94.35, market: 'MCI', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 120, overlay: false, oz: true },
    'Wyandotte_KS': { lat: 39.11, lon: -94.76, market: 'MCI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    'Leavenworth_KS': { lat: 39.19, lon: -95.00, market: 'MCI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    
    // ===== OMAHA (SPP) =====
    'Douglas_NE': { lat: 41.29, lon: -96.15, market: 'OMA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 280, overlay: false, oz: true },
    'Sarpy_NE': { lat: 41.11, lon: -96.11, market: 'OMA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    'Washington_NE': { lat: 41.53, lon: -96.22, market: 'OMA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    
    // ===== NEW YORK/NEW JERSEY (NYISO/PJM) =====
    'Hudson_NJ': { lat: 40.73, lon: -74.08, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 180, projectedMW: 300, overlay: false, oz: true },
    'Essex_NJ': { lat: 40.79, lon: -74.25, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 80, projectedMW: 150, overlay: false, oz: true },
    'Bergen_NJ': { lat: 40.96, lon: -74.07, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 120, overlay: false, oz: false },
    'Middlesex_NJ': { lat: 40.44, lon: -74.39, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 100, projectedMW: 220, overlay: false, oz: true },
    'Somerset_NJ': { lat: 40.57, lon: -74.62, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 80, projectedMW: 180, overlay: false, oz: true },
    'Westchester_NY': { lat: 41.12, lon: -73.76, market: 'NYC', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 50, projectedMW: 80, overlay: false, oz: true },
    'Queens_NY': { lat: 40.73, lon: -73.82, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'high', frictionScore: 56, currentMW: 40, projectedMW: 70, overlay: false, oz: true },
    'Nassau_NY': { lat: 40.74, lon: -73.59, market: 'NYC', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 30, projectedMW: 50, overlay: false, oz: false },
    
    // ===== RICHMOND (PJM) =====
    'Henrico_VA': { lat: 37.55, lon: -77.35, market: 'RIC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 280, overlay: true, oz: true },
    'Chesterfield_VA': { lat: 37.38, lon: -77.58, market: 'RIC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: false, oz: true },
    'Hanover_VA': { lat: 37.77, lon: -77.48, market: 'RIC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 50, overlay: false, oz: false },
    'Goochland_VA': { lat: 37.69, lon: -77.91, market: 'RIC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 10, projectedMW: 40, overlay: false, oz: true },
    
    // ===== INDIANAPOLIS (MISO) =====
    'Marion_IN': { lat: 39.78, lon: -86.15, market: 'IND', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 180, overlay: false, oz: true },
    'Hamilton_IN': { lat: 40.05, lon: -86.02, market: 'IND', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: true, oz: true },
    'Hendricks_IN': { lat: 39.77, lon: -86.52, market: 'IND', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    'Boone_IN': { lat: 40.05, lon: -86.47, market: 'IND', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    
    // ===== SOUTH CAROLINA (SERC) =====
    'Berkeley_SC': { lat: 33.20, lon: -79.95, market: 'SC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 200, overlay: true, oz: true },
    'Dorchester_SC': { lat: 33.08, lon: -80.22, market: 'SC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    'Charleston_SC': { lat: 32.85, lon: -79.98, market: 'SC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 80, overlay: false, oz: true },
    'Lexington_SC': { lat: 33.90, lon: -81.24, market: 'SC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 80, overlay: false, oz: true },
    'Richland_SC': { lat: 34.02, lon: -80.90, market: 'SC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 50, overlay: false, oz: true },
    
    // ===== RESEARCH TRIANGLE (SERC) =====
    'Wake_NC': { lat: 35.79, lon: -78.64, market: 'RDU', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 100, projectedMW: 280, overlay: false, oz: true },
    'Durham_NC': { lat: 36.00, lon: -78.90, market: 'RDU', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 120, overlay: false, oz: true },
    'Orange_NC': { lat: 36.07, lon: -79.12, market: 'RDU', zoning: 'conditional', sentiment: 'hostile', tax: 'standard', frictionScore: 56, currentMW: 10, projectedMW: 30, overlay: false, oz: false },
    'Chatham_NC': { lat: 35.71, lon: -79.35, market: 'RDU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 80, overlay: true, oz: true },
    'Johnston_NC': { lat: 35.52, lon: -78.37, market: 'RDU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 60, overlay: false, oz: true }
};

// Summary statistics
const DATASET_SUMMARY = {
    totalCounties: Object.keys(COUNTY_FRICTION_DATA).length,
    totalMarkets: 24,
    sweetSpotCounties: Object.values(COUNTY_FRICTION_DATA).filter(c => c.frictionScore === 0).length,
    lowFrictionCounties: Object.values(COUNTY_FRICTION_DATA).filter(c => c.frictionScore > 0 && c.frictionScore <= 40).length,
    moderateCounties: Object.values(COUNTY_FRICTION_DATA).filter(c => c.frictionScore > 40 && c.frictionScore <= 60).length,
    highFrictionCounties: Object.values(COUNTY_FRICTION_DATA).filter(c => c.frictionScore > 60).length,
    totalCurrentMW: Object.values(COUNTY_FRICTION_DATA).reduce((sum, c) => sum + c.currentMW, 0),
    totalProjectedMW: Object.values(COUNTY_FRICTION_DATA).reduce((sum, c) => sum + c.projectedMW, 0),
    overlayDistricts: Object.values(COUNTY_FRICTION_DATA).filter(c => c.overlay).length,
    opportunityZones: Object.values(COUNTY_FRICTION_DATA).filter(c => c.oz).length
};
