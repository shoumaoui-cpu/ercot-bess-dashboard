/**
 * G-ZIP Large Loads / Data Centers Dataset
 * =========================================
 * Comprehensive dataset of data center loads coming online across all US power markets
 * Data includes current operational loads and projected loads for 2026, 2028, 2030
 */

const LARGE_LOADS_US = [
    // ============= NORTHERN VIRGINIA (PJM - Dominion) =============
    { id: 'NOVA-001', name: 'Loudoun Digital Campus A', operator: 'AWS', county: 'Loudoun', state: 'VA', lat: 39.05, lon: -77.62, iso: 'PJM', utility: 'Dominion', mw_2024: 450, mw_2026: 580, mw_2028: 720, mw_2030: 850, status: 'Operational', type: 'Hyperscale' },
    { id: 'NOVA-002', name: 'Ashburn Data Center Hub', operator: 'Equinix', county: 'Loudoun', state: 'VA', lat: 39.04, lon: -77.49, iso: 'PJM', utility: 'Dominion', mw_2024: 320, mw_2026: 420, mw_2028: 520, mw_2030: 600, status: 'Operational', type: 'Colocation' },
    { id: 'NOVA-003', name: 'Digital Realty Ashburn', operator: 'Digital Realty', county: 'Loudoun', state: 'VA', lat: 39.03, lon: -77.51, iso: 'PJM', utility: 'Dominion', mw_2024: 280, mw_2026: 380, mw_2028: 480, mw_2030: 550, status: 'Operational', type: 'Colocation' },
    { id: 'NOVA-004', name: 'Microsoft Azure East', operator: 'Microsoft', county: 'Loudoun', state: 'VA', lat: 39.06, lon: -77.55, iso: 'PJM', utility: 'Dominion', mw_2024: 520, mw_2026: 680, mw_2028: 850, mw_2030: 1000, status: 'Operational', type: 'Hyperscale' },
    { id: 'NOVA-005', name: 'Google Cloud Virginia', operator: 'Google', county: 'Loudoun', state: 'VA', lat: 39.02, lon: -77.58, iso: 'PJM', utility: 'Dominion', mw_2024: 380, mw_2026: 520, mw_2028: 680, mw_2030: 820, status: 'Operational', type: 'Hyperscale' },
    { id: 'NOVA-006', name: 'QTS Ashburn Mega', operator: 'QTS', county: 'Loudoun', state: 'VA', lat: 39.01, lon: -77.47, iso: 'PJM', utility: 'Dominion', mw_2024: 180, mw_2026: 280, mw_2028: 380, mw_2030: 450, status: 'Operational', type: 'Colocation' },
    { id: 'NOVA-007', name: 'Prince William Digital Gateway', operator: 'AWS', county: 'Prince William', state: 'VA', lat: 38.68, lon: -77.52, iso: 'PJM', utility: 'Dominion', mw_2024: 0, mw_2026: 350, mw_2028: 850, mw_2030: 1400, status: 'Under Development', type: 'Hyperscale' },
    { id: 'NOVA-008', name: 'Meta Virginia Campus', operator: 'Meta', county: 'Prince William', state: 'VA', lat: 38.72, lon: -77.45, iso: 'PJM', utility: 'Dominion', mw_2024: 220, mw_2026: 380, mw_2028: 550, mw_2030: 700, status: 'Operational', type: 'Hyperscale' },
    { id: 'NOVA-009', name: 'CoreSite Reston', operator: 'CoreSite', county: 'Fairfax', state: 'VA', lat: 38.95, lon: -77.35, iso: 'PJM', utility: 'Dominion', mw_2024: 85, mw_2026: 120, mw_2028: 150, mw_2030: 180, status: 'Operational', type: 'Colocation' },
    { id: 'NOVA-010', name: 'Vantage Ashburn Campus', operator: 'Vantage', county: 'Loudoun', state: 'VA', lat: 39.00, lon: -77.53, iso: 'PJM', utility: 'Dominion', mw_2024: 150, mw_2026: 250, mw_2028: 350, mw_2030: 420, status: 'Operational', type: 'Colocation' },

    // ============= DALLAS-FORT WORTH (ERCOT - Oncor) =============
    { id: 'DFW-001', name: 'Meta Ft Worth Campus', operator: 'Meta', county: 'Tarrant', state: 'TX', lat: 32.85, lon: -97.32, iso: 'ERCOT', utility: 'Oncor', mw_2024: 280, mw_2026: 420, mw_2028: 580, mw_2030: 720, status: 'Operational', type: 'Hyperscale' },
    { id: 'DFW-002', name: 'Google Midlothian', operator: 'Google', county: 'Ellis', state: 'TX', lat: 32.48, lon: -96.99, iso: 'ERCOT', utility: 'Oncor', mw_2024: 180, mw_2026: 320, mw_2028: 480, mw_2030: 620, status: 'Operational', type: 'Hyperscale' },
    { id: 'DFW-003', name: 'CyrusOne Carrollton', operator: 'CyrusOne', county: 'Dallas', state: 'TX', lat: 32.95, lon: -96.89, iso: 'ERCOT', utility: 'Oncor', mw_2024: 120, mw_2026: 180, mw_2028: 240, mw_2030: 300, status: 'Operational', type: 'Colocation' },
    { id: 'DFW-004', name: 'QTS Irving Mega Campus', operator: 'QTS', county: 'Dallas', state: 'TX', lat: 32.86, lon: -96.94, iso: 'ERCOT', utility: 'Oncor', mw_2024: 150, mw_2026: 220, mw_2028: 300, mw_2030: 380, status: 'Operational', type: 'Colocation' },
    { id: 'DFW-005', name: 'Stream Allen Campus', operator: 'Stream', county: 'Collin', state: 'TX', lat: 33.10, lon: -96.67, iso: 'ERCOT', utility: 'Oncor', mw_2024: 85, mw_2026: 150, mw_2028: 220, mw_2030: 280, status: 'Operational', type: 'Colocation' },
    { id: 'DFW-006', name: 'Skybox Garland', operator: 'Skybox', county: 'Dallas', state: 'TX', lat: 32.91, lon: -96.63, iso: 'ERCOT', utility: 'Oncor', mw_2024: 65, mw_2026: 120, mw_2028: 180, mw_2030: 240, status: 'Operational', type: 'Colocation' },
    { id: 'DFW-007', name: 'Meta Forney Hyperscale', operator: 'Meta', county: 'Kaufman', state: 'TX', lat: 32.75, lon: -96.47, iso: 'ERCOT', utility: 'Oncor', mw_2024: 0, mw_2026: 280, mw_2028: 550, mw_2030: 800, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'DFW-008', name: 'AWS Dallas Region', operator: 'AWS', county: 'Collin', state: 'TX', lat: 33.08, lon: -96.75, iso: 'ERCOT', utility: 'Oncor', mw_2024: 200, mw_2026: 350, mw_2028: 520, mw_2030: 680, status: 'Operational', type: 'Hyperscale' },

    // ============= PHOENIX (WECC - APS/SRP) =============
    { id: 'PHX-001', name: 'Microsoft Azure West', operator: 'Microsoft', county: 'Maricopa', state: 'AZ', lat: 33.42, lon: -111.94, iso: 'WECC', utility: 'APS', mw_2024: 420, mw_2026: 620, mw_2028: 850, mw_2030: 1100, status: 'Operational', type: 'Hyperscale' },
    { id: 'PHX-002', name: 'Google Mesa Campus', operator: 'Google', county: 'Maricopa', state: 'AZ', lat: 33.38, lon: -111.72, iso: 'WECC', utility: 'SRP', mw_2024: 320, mw_2026: 480, mw_2028: 680, mw_2030: 880, status: 'Operational', type: 'Hyperscale' },
    { id: 'PHX-003', name: 'Meta Phoenix', operator: 'Meta', county: 'Maricopa', state: 'AZ', lat: 33.35, lon: -112.02, iso: 'WECC', utility: 'APS', mw_2024: 280, mw_2026: 450, mw_2028: 650, mw_2030: 820, status: 'Operational', type: 'Hyperscale' },
    { id: 'PHX-004', name: 'CyrusOne Phoenix I', operator: 'CyrusOne', county: 'Maricopa', state: 'AZ', lat: 33.45, lon: -112.08, iso: 'WECC', utility: 'APS', mw_2024: 95, mw_2026: 150, mw_2028: 220, mw_2030: 280, status: 'Operational', type: 'Colocation' },
    { id: 'PHX-005', name: 'Stream Goodyear', operator: 'Stream', county: 'Maricopa', state: 'AZ', lat: 33.44, lon: -112.38, iso: 'WECC', utility: 'APS', mw_2024: 75, mw_2026: 140, mw_2028: 220, mw_2030: 300, status: 'Operational', type: 'Colocation' },
    { id: 'PHX-006', name: 'EdgeCore Mesa', operator: 'EdgeCore', county: 'Maricopa', state: 'AZ', lat: 33.32, lon: -111.65, iso: 'WECC', utility: 'SRP', mw_2024: 120, mw_2026: 220, mw_2028: 350, mw_2030: 480, status: 'Operational', type: 'Colocation' },
    { id: 'PHX-007', name: 'Aligned Phoenix', operator: 'Aligned', county: 'Maricopa', state: 'AZ', lat: 33.40, lon: -111.98, iso: 'WECC', utility: 'APS', mw_2024: 85, mw_2026: 180, mw_2028: 300, mw_2030: 420, status: 'Operational', type: 'Colocation' },
    { id: 'PHX-008', name: 'Pinal Hyperscale Campus', operator: 'AWS', county: 'Pinal', state: 'AZ', lat: 32.88, lon: -111.75, iso: 'WECC', utility: 'APS', mw_2024: 0, mw_2026: 180, mw_2028: 400, mw_2030: 650, status: 'Under Construction', type: 'Hyperscale' },

    // ============= CHICAGO (PJM/MISO - ComEd) =============
    { id: 'CHI-001', name: 'Digital Realty Chicago', operator: 'Digital Realty', county: 'Cook', state: 'IL', lat: 41.88, lon: -87.64, iso: 'PJM', utility: 'ComEd', mw_2024: 180, mw_2026: 250, mw_2028: 320, mw_2030: 380, status: 'Operational', type: 'Colocation' },
    { id: 'CHI-002', name: 'Equinix Chicago', operator: 'Equinix', county: 'Cook', state: 'IL', lat: 41.85, lon: -87.62, iso: 'PJM', utility: 'ComEd', mw_2024: 150, mw_2026: 210, mw_2028: 280, mw_2030: 340, status: 'Operational', type: 'Colocation' },
    { id: 'CHI-003', name: 'QTS Chicago', operator: 'QTS', county: 'DuPage', state: 'IL', lat: 41.92, lon: -88.05, iso: 'PJM', utility: 'ComEd', mw_2024: 120, mw_2026: 180, mw_2028: 250, mw_2030: 320, status: 'Operational', type: 'Colocation' },
    { id: 'CHI-004', name: 'Meta Chicago', operator: 'Meta', county: 'Will', state: 'IL', lat: 41.68, lon: -88.08, iso: 'MISO', utility: 'ComEd', mw_2024: 0, mw_2026: 200, mw_2028: 450, mw_2030: 700, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'CHI-005', name: 'Microsoft Chicago', operator: 'Microsoft', county: 'Will', state: 'IL', lat: 41.65, lon: -88.12, iso: 'MISO', utility: 'ComEd', mw_2024: 0, mw_2026: 180, mw_2028: 380, mw_2030: 580, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'CHI-006', name: 'Compass Aurora', operator: 'Compass', county: 'Kane', state: 'IL', lat: 41.76, lon: -88.32, iso: 'PJM', utility: 'ComEd', mw_2024: 65, mw_2026: 120, mw_2028: 200, mw_2030: 280, status: 'Operational', type: 'Colocation' },

    // ============= ATLANTA (SERC - Georgia Power) =============
    { id: 'ATL-001', name: 'Google Douglas County', operator: 'Google', county: 'Douglas', state: 'GA', lat: 33.72, lon: -84.75, iso: 'SERC', utility: 'Georgia Power', mw_2024: 180, mw_2026: 320, mw_2028: 500, mw_2030: 680, status: 'Operational', type: 'Hyperscale' },
    { id: 'ATL-002', name: 'Microsoft Atlanta', operator: 'Microsoft', county: 'Douglas', state: 'GA', lat: 33.68, lon: -84.78, iso: 'SERC', utility: 'Georgia Power', mw_2024: 150, mw_2026: 280, mw_2028: 450, mw_2030: 620, status: 'Operational', type: 'Hyperscale' },
    { id: 'ATL-003', name: 'QTS Atlanta Metro', operator: 'QTS', county: 'Fulton', state: 'GA', lat: 33.85, lon: -84.42, iso: 'SERC', utility: 'Georgia Power', mw_2024: 95, mw_2026: 150, mw_2028: 220, mw_2030: 280, status: 'Operational', type: 'Colocation' },
    { id: 'ATL-004', name: 'Switch Atlanta', operator: 'Switch', county: 'Douglas', state: 'GA', lat: 33.70, lon: -84.82, iso: 'SERC', utility: 'Georgia Power', mw_2024: 0, mw_2026: 150, mw_2028: 350, mw_2030: 550, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'ATL-005', name: 'Digital Realty Atlanta', operator: 'Digital Realty', county: 'Fulton', state: 'GA', lat: 33.78, lon: -84.39, iso: 'SERC', utility: 'Georgia Power', mw_2024: 85, mw_2026: 130, mw_2028: 180, mw_2030: 220, status: 'Operational', type: 'Colocation' },
    { id: 'ATL-006', name: 'Equinix Atlanta', operator: 'Equinix', county: 'Fulton', state: 'GA', lat: 33.80, lon: -84.38, iso: 'SERC', utility: 'Georgia Power', mw_2024: 75, mw_2026: 110, mw_2028: 150, mw_2030: 190, status: 'Operational', type: 'Colocation' },

    // ============= COLUMBUS (PJM - AEP Ohio) =============
    { id: 'CMH-001', name: 'AWS New Albany', operator: 'AWS', county: 'Licking', state: 'OH', lat: 40.08, lon: -82.78, iso: 'PJM', utility: 'AEP Ohio', mw_2024: 250, mw_2026: 450, mw_2028: 700, mw_2030: 950, status: 'Operational', type: 'Hyperscale' },
    { id: 'CMH-002', name: 'Google Columbus', operator: 'Google', county: 'Licking', state: 'OH', lat: 40.05, lon: -82.72, iso: 'PJM', utility: 'AEP Ohio', mw_2024: 180, mw_2026: 350, mw_2028: 580, mw_2030: 800, status: 'Operational', type: 'Hyperscale' },
    { id: 'CMH-003', name: 'Meta New Albany', operator: 'Meta', county: 'Licking', state: 'OH', lat: 40.12, lon: -82.75, iso: 'PJM', utility: 'AEP Ohio', mw_2024: 200, mw_2026: 380, mw_2028: 600, mw_2030: 820, status: 'Operational', type: 'Hyperscale' },
    { id: 'CMH-004', name: 'QTS Columbus', operator: 'QTS', county: 'Franklin', state: 'OH', lat: 39.98, lon: -82.95, iso: 'PJM', utility: 'AEP Ohio', mw_2024: 85, mw_2026: 140, mw_2028: 200, mw_2030: 260, status: 'Operational', type: 'Colocation' },
    { id: 'CMH-005', name: 'Cologix Columbus', operator: 'Cologix', county: 'Franklin', state: 'OH', lat: 39.97, lon: -83.02, iso: 'PJM', utility: 'AEP Ohio', mw_2024: 45, mw_2026: 80, mw_2028: 120, mw_2030: 160, status: 'Operational', type: 'Colocation' },

    // ============= PORTLAND/HILLSBORO (WECC - PGE) =============
    { id: 'PDX-001', name: 'Google The Dalles', operator: 'Google', county: 'Wasco', state: 'OR', lat: 45.62, lon: -121.18, iso: 'WECC', utility: 'PGE', mw_2024: 180, mw_2026: 280, mw_2028: 400, mw_2030: 520, status: 'Operational', type: 'Hyperscale' },
    { id: 'PDX-002', name: 'AWS Hillsboro', operator: 'AWS', county: 'Washington', state: 'OR', lat: 45.52, lon: -122.98, iso: 'WECC', utility: 'PGE', mw_2024: 150, mw_2026: 280, mw_2028: 420, mw_2030: 560, status: 'Operational', type: 'Hyperscale' },
    { id: 'PDX-003', name: 'Meta Prineville', operator: 'Meta', county: 'Crook', state: 'OR', lat: 44.30, lon: -120.83, iso: 'WECC', utility: 'PacifiCorp', mw_2024: 120, mw_2026: 200, mw_2028: 300, mw_2030: 400, status: 'Operational', type: 'Hyperscale' },
    { id: 'PDX-004', name: 'Vantage Hillsboro', operator: 'Vantage', county: 'Washington', state: 'OR', lat: 45.55, lon: -123.02, iso: 'WECC', utility: 'PGE', mw_2024: 85, mw_2026: 150, mw_2028: 240, mw_2030: 320, status: 'Operational', type: 'Colocation' },
    { id: 'PDX-005', name: 'Stack Hillsboro', operator: 'Stack', county: 'Washington', state: 'OR', lat: 45.50, lon: -122.95, iso: 'WECC', utility: 'PGE', mw_2024: 65, mw_2026: 120, mw_2028: 200, mw_2030: 280, status: 'Operational', type: 'Colocation' },

    // ============= LAS VEGAS (WECC - NV Energy) =============
    { id: 'LAS-001', name: 'Switch SuperNAP', operator: 'Switch', county: 'Clark', state: 'NV', lat: 36.05, lon: -115.15, iso: 'WECC', utility: 'NV Energy', mw_2024: 220, mw_2026: 350, mw_2028: 500, mw_2030: 650, status: 'Operational', type: 'Colocation' },
    { id: 'LAS-002', name: 'Switch Citadel', operator: 'Switch', county: 'Clark', state: 'NV', lat: 36.25, lon: -115.02, iso: 'WECC', utility: 'NV Energy', mw_2024: 0, mw_2026: 180, mw_2028: 400, mw_2030: 650, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'LAS-003', name: 'Flexential Las Vegas', operator: 'Flexential', county: 'Clark', state: 'NV', lat: 36.12, lon: -115.18, iso: 'WECC', utility: 'NV Energy', mw_2024: 45, mw_2026: 80, mw_2028: 120, mw_2030: 160, status: 'Operational', type: 'Colocation' },

    // ============= RENO (WECC - NV Energy) =============
    { id: 'RNO-001', name: 'Apple Reno', operator: 'Apple', county: 'Washoe', state: 'NV', lat: 39.52, lon: -119.72, iso: 'WECC', utility: 'NV Energy', mw_2024: 150, mw_2026: 250, mw_2028: 380, mw_2030: 500, status: 'Operational', type: 'Hyperscale' },
    { id: 'RNO-002', name: 'Switch TRIC', operator: 'Switch', county: 'Storey', state: 'NV', lat: 39.55, lon: -119.45, iso: 'WECC', utility: 'NV Energy', mw_2024: 85, mw_2026: 150, mw_2028: 250, mw_2030: 350, status: 'Operational', type: 'Colocation' },
    { id: 'RNO-003', name: 'Google Storey County', operator: 'Google', county: 'Storey', state: 'NV', lat: 39.58, lon: -119.48, iso: 'WECC', utility: 'NV Energy', mw_2024: 0, mw_2026: 120, mw_2028: 280, mw_2030: 450, status: 'Under Construction', type: 'Hyperscale' },

    // ============= SALT LAKE CITY (WECC - Rocky Mtn) =============
    { id: 'SLC-001', name: 'Meta Eagle Mountain', operator: 'Meta', county: 'Utah', state: 'UT', lat: 40.31, lon: -112.01, iso: 'WECC', utility: 'Rocky Mtn Power', mw_2024: 180, mw_2026: 320, mw_2028: 500, mw_2030: 680, status: 'Operational', type: 'Hyperscale' },
    { id: 'SLC-002', name: 'Novva West Jordan', operator: 'Novva', county: 'Salt Lake', state: 'UT', lat: 40.60, lon: -111.98, iso: 'WECC', utility: 'Rocky Mtn Power', mw_2024: 65, mw_2026: 120, mw_2028: 200, mw_2030: 280, status: 'Operational', type: 'Colocation' },
    { id: 'SLC-003', name: 'Flexential SLC', operator: 'Flexential', county: 'Salt Lake', state: 'UT', lat: 40.72, lon: -111.88, iso: 'WECC', utility: 'Rocky Mtn Power', mw_2024: 45, mw_2026: 80, mw_2028: 130, mw_2030: 180, status: 'Operational', type: 'Colocation' },
    { id: 'SLC-004', name: 'Microsoft Lehi', operator: 'Microsoft', county: 'Utah', state: 'UT', lat: 40.38, lon: -111.85, iso: 'WECC', utility: 'Rocky Mtn Power', mw_2024: 0, mw_2026: 150, mw_2028: 350, mw_2030: 550, status: 'Under Construction', type: 'Hyperscale' },

    // ============= HOUSTON (ERCOT - CenterPoint) =============
    { id: 'HOU-001', name: 'CyrusOne Houston West', operator: 'CyrusOne', county: 'Harris', state: 'TX', lat: 29.78, lon: -95.55, iso: 'ERCOT', utility: 'CenterPoint', mw_2024: 120, mw_2026: 200, mw_2028: 300, mw_2030: 400, status: 'Operational', type: 'Colocation' },
    { id: 'HOU-002', name: 'Digital Realty Houston', operator: 'Digital Realty', county: 'Harris', state: 'TX', lat: 29.75, lon: -95.38, iso: 'ERCOT', utility: 'CenterPoint', mw_2024: 95, mw_2026: 150, mw_2028: 220, mw_2030: 290, status: 'Operational', type: 'Colocation' },
    { id: 'HOU-003', name: 'QTS Houston', operator: 'QTS', county: 'Harris', state: 'TX', lat: 29.82, lon: -95.42, iso: 'ERCOT', utility: 'CenterPoint', mw_2024: 85, mw_2026: 140, mw_2028: 210, mw_2030: 280, status: 'Operational', type: 'Colocation' },
    { id: 'HOU-004', name: 'DataBank Houston', operator: 'DataBank', county: 'Harris', state: 'TX', lat: 29.70, lon: -95.48, iso: 'ERCOT', utility: 'CenterPoint', mw_2024: 55, mw_2026: 95, mw_2028: 150, mw_2030: 200, status: 'Operational', type: 'Colocation' },

    // ============= SEATTLE (WECC - PSE) =============
    { id: 'SEA-001', name: 'Sabey Intergate', operator: 'Sabey', county: 'King', state: 'WA', lat: 47.60, lon: -122.33, iso: 'WECC', utility: 'Seattle City Light', mw_2024: 120, mw_2026: 180, mw_2028: 250, mw_2030: 320, status: 'Operational', type: 'Colocation' },
    { id: 'SEA-002', name: 'Microsoft Quincy', operator: 'Microsoft', county: 'Grant', state: 'WA', lat: 47.23, lon: -119.85, iso: 'WECC', utility: 'Grant PUD', mw_2024: 280, mw_2026: 420, mw_2028: 580, mw_2030: 750, status: 'Operational', type: 'Hyperscale' },
    { id: 'SEA-003', name: 'AWS Moses Lake', operator: 'AWS', county: 'Grant', state: 'WA', lat: 47.12, lon: -119.28, iso: 'WECC', utility: 'Grant PUD', mw_2024: 0, mw_2026: 180, mw_2028: 400, mw_2030: 620, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'SEA-004', name: 'Digital Realty Seattle', operator: 'Digital Realty', county: 'King', state: 'WA', lat: 47.55, lon: -122.25, iso: 'WECC', utility: 'PSE', mw_2024: 65, mw_2026: 100, mw_2028: 140, mw_2030: 180, status: 'Operational', type: 'Colocation' },

    // ============= KANSAS CITY (SPP - Evergy) =============
    { id: 'MCI-001', name: 'QTS Overland Park', operator: 'QTS', county: 'Johnson', state: 'KS', lat: 38.92, lon: -94.68, iso: 'SPP', utility: 'Evergy', mw_2024: 75, mw_2026: 130, mw_2028: 200, mw_2030: 270, status: 'Operational', type: 'Colocation' },
    { id: 'MCI-002', name: 'Digital Realty KC', operator: 'Digital Realty', county: 'Johnson', state: 'KS', lat: 38.88, lon: -94.72, iso: 'SPP', utility: 'Evergy', mw_2024: 55, mw_2026: 95, mw_2028: 150, mw_2030: 200, status: 'Operational', type: 'Colocation' },
    { id: 'MCI-003', name: 'Flexential KC', operator: 'Flexential', county: 'Jackson', state: 'MO', lat: 39.05, lon: -94.58, iso: 'SPP', utility: 'Evergy', mw_2024: 40, mw_2026: 70, mw_2028: 110, mw_2030: 150, status: 'Operational', type: 'Colocation' },

    // ============= OMAHA (SPP - OPPD) =============
    { id: 'OMA-001', name: 'Meta Papillion', operator: 'Meta', county: 'Sarpy', state: 'NE', lat: 41.15, lon: -96.02, iso: 'SPP', utility: 'OPPD', mw_2024: 150, mw_2026: 280, mw_2028: 450, mw_2030: 620, status: 'Operational', type: 'Hyperscale' },
    { id: 'OMA-002', name: 'Google Papillion', operator: 'Google', county: 'Sarpy', state: 'NE', lat: 41.12, lon: -96.05, iso: 'SPP', utility: 'OPPD', mw_2024: 0, mw_2026: 120, mw_2028: 280, mw_2030: 450, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'OMA-003', name: 'NTT Omaha', operator: 'NTT', county: 'Douglas', state: 'NE', lat: 41.26, lon: -95.98, iso: 'SPP', utility: 'OPPD', mw_2024: 35, mw_2026: 65, mw_2028: 100, mw_2030: 140, status: 'Operational', type: 'Colocation' },

    // ============= WYOMING (WECC - Rocky Mtn) =============
    { id: 'WY-001', name: 'Prometheus Evanston', operator: 'Prometheus', county: 'Uinta', state: 'WY', lat: 41.27, lon: -110.96, iso: 'WECC', utility: 'Rocky Mtn Power', mw_2024: 0, mw_2026: 200, mw_2028: 600, mw_2030: 1200, status: 'Under Construction', type: 'Hyperscale' },

    // ============= SOUTH CAROLINA (SERC - Duke/Santee Cooper) =============
    { id: 'SC-001', name: 'Google Berkeley County', operator: 'Google', county: 'Berkeley', state: 'SC', lat: 33.18, lon: -79.92, iso: 'SERC', utility: 'Santee Cooper', mw_2024: 0, mw_2026: 150, mw_2028: 350, mw_2030: 550, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'SC-002', name: 'Meta Columbia', operator: 'Meta', county: 'Richland', state: 'SC', lat: 34.00, lon: -81.02, iso: 'SERC', utility: 'Duke Energy', mw_2024: 0, mw_2026: 120, mw_2028: 300, mw_2030: 500, status: 'Under Construction', type: 'Hyperscale' },

    // ============= RESEARCH TRIANGLE (SERC - Duke) =============
    { id: 'RDU-001', name: 'Google Durham', operator: 'Google', county: 'Durham', state: 'NC', lat: 35.98, lon: -78.92, iso: 'SERC', utility: 'Duke Energy', mw_2024: 85, mw_2026: 150, mw_2028: 250, mw_2030: 350, status: 'Operational', type: 'Hyperscale' },
    { id: 'RDU-002', name: 'Apple Maiden', operator: 'Apple', county: 'Catawba', state: 'NC', lat: 35.58, lon: -81.18, iso: 'SERC', utility: 'Duke Energy', mw_2024: 120, mw_2026: 180, mw_2028: 250, mw_2030: 320, status: 'Operational', type: 'Hyperscale' },
    { id: 'RDU-003', name: 'Meta Forest City', operator: 'Meta', county: 'Rutherford', state: 'NC', lat: 35.33, lon: -81.87, iso: 'SERC', utility: 'Duke Energy', mw_2024: 95, mw_2026: 160, mw_2028: 240, mw_2030: 320, status: 'Operational', type: 'Hyperscale' },

    // ============= INDIANAPOLIS (MISO - AES Indiana) =============
    { id: 'IND-001', name: 'AWS Indianapolis', operator: 'AWS', county: 'Hamilton', state: 'IN', lat: 40.02, lon: -86.05, iso: 'MISO', utility: 'AES Indiana', mw_2024: 0, mw_2026: 150, mw_2028: 350, mw_2030: 550, status: 'Under Construction', type: 'Hyperscale' },
    { id: 'IND-002', name: 'Flexential Indianapolis', operator: 'Flexential', county: 'Marion', state: 'IN', lat: 39.78, lon: -86.15, iso: 'MISO', utility: 'AES Indiana', mw_2024: 45, mw_2026: 80, mw_2028: 130, mw_2030: 180, status: 'Operational', type: 'Colocation' },

    // ============= RICHMOND (PJM - Dominion) =============
    { id: 'RIC-001', name: 'QTS Richmond', operator: 'QTS', county: 'Henrico', state: 'VA', lat: 37.58, lon: -77.42, iso: 'PJM', utility: 'Dominion', mw_2024: 95, mw_2026: 160, mw_2028: 250, mw_2030: 340, status: 'Operational', type: 'Colocation' },
    { id: 'RIC-002', name: 'Meta Richmond', operator: 'Meta', county: 'Henrico', state: 'VA', lat: 37.55, lon: -77.38, iso: 'PJM', utility: 'Dominion', mw_2024: 0, mw_2026: 180, mw_2028: 400, mw_2030: 620, status: 'Under Construction', type: 'Hyperscale' },

    // ============= NEW YORK/NEW JERSEY (NYISO/PJM) =============
    { id: 'NYC-001', name: 'Equinix NY5', operator: 'Equinix', county: 'Hudson', state: 'NJ', lat: 40.73, lon: -74.05, iso: 'PJM', utility: 'PSEG', mw_2024: 85, mw_2026: 120, mw_2028: 160, mw_2030: 200, status: 'Operational', type: 'Colocation' },
    { id: 'NYC-002', name: 'Digital Realty Secaucus', operator: 'Digital Realty', county: 'Hudson', state: 'NJ', lat: 40.78, lon: -74.08, iso: 'PJM', utility: 'PSEG', mw_2024: 75, mw_2026: 110, mw_2028: 150, mw_2030: 190, status: 'Operational', type: 'Colocation' },
    { id: 'NYC-003', name: 'CoreSite Secaucus', operator: 'CoreSite', county: 'Hudson', state: 'NJ', lat: 40.80, lon: -74.06, iso: 'PJM', utility: 'PSEG', mw_2024: 55, mw_2026: 90, mw_2028: 130, mw_2030: 170, status: 'Operational', type: 'Colocation' },

    // ============= MINNEAPOLIS (MISO - Xcel) =============
    { id: 'MSP-001', name: 'Cologix Minneapolis', operator: 'Cologix', county: 'Hennepin', state: 'MN', lat: 44.98, lon: -93.27, iso: 'MISO', utility: 'Xcel Energy', mw_2024: 65, mw_2026: 110, mw_2028: 170, mw_2030: 230, status: 'Operational', type: 'Colocation' },
    { id: 'MSP-002', name: 'Flexential MSP', operator: 'Flexential', county: 'Hennepin', state: 'MN', lat: 44.95, lon: -93.32, iso: 'MISO', utility: 'Xcel Energy', mw_2024: 45, mw_2026: 80, mw_2028: 130, mw_2030: 180, status: 'Operational', type: 'Colocation' },
    { id: 'MSP-003', name: 'DataBank Minneapolis', operator: 'DataBank', county: 'Hennepin', state: 'MN', lat: 45.02, lon: -93.45, iso: 'MISO', utility: 'Xcel Energy', mw_2024: 35, mw_2026: 65, mw_2028: 100, mw_2030: 140, status: 'Operational', type: 'Colocation' },

    // ============= DENVER (WECC - Xcel) =============
    { id: 'DEN-001', name: 'Vantage Denver', operator: 'Vantage', county: 'Douglas', state: 'CO', lat: 39.55, lon: -104.88, iso: 'WECC', utility: 'Xcel Energy', mw_2024: 85, mw_2026: 150, mw_2028: 240, mw_2030: 330, status: 'Operational', type: 'Colocation' },
    { id: 'DEN-002', name: 'CoreSite Denver', operator: 'CoreSite', county: 'Arapahoe', state: 'CO', lat: 39.65, lon: -104.85, iso: 'WECC', utility: 'Xcel Energy', mw_2024: 65, mw_2026: 110, mw_2028: 170, mw_2030: 230, status: 'Operational', type: 'Colocation' },
    { id: 'DEN-003', name: 'Flexential Denver', operator: 'Flexential', county: 'Arapahoe', state: 'CO', lat: 39.60, lon: -104.82, iso: 'WECC', utility: 'Xcel Energy', mw_2024: 55, mw_2026: 95, mw_2028: 150, mw_2030: 200, status: 'Operational', type: 'Colocation' },
    { id: 'DEN-004', name: 'DataBank Denver', operator: 'DataBank', county: 'Douglas', state: 'CO', lat: 39.52, lon: -104.92, iso: 'WECC', utility: 'Xcel Energy', mw_2024: 40, mw_2026: 75, mw_2028: 120, mw_2030: 165, status: 'Operational', type: 'Colocation' }
];

// Summary by ISO/Market
const LOAD_SUMMARY_BY_ISO = {
    'PJM': { current_gw: LARGE_LOADS_US.filter(l => l.iso === 'PJM').reduce((s, l) => s + l.mw_2024, 0) / 1000 },
    'ERCOT': { current_gw: LARGE_LOADS_US.filter(l => l.iso === 'ERCOT').reduce((s, l) => s + l.mw_2024, 0) / 1000 },
    'WECC': { current_gw: LARGE_LOADS_US.filter(l => l.iso === 'WECC').reduce((s, l) => s + l.mw_2024, 0) / 1000 },
    'MISO': { current_gw: LARGE_LOADS_US.filter(l => l.iso === 'MISO').reduce((s, l) => s + l.mw_2024, 0) / 1000 },
    'SPP': { current_gw: LARGE_LOADS_US.filter(l => l.iso === 'SPP').reduce((s, l) => s + l.mw_2024, 0) / 1000 },
    'SERC': { current_gw: LARGE_LOADS_US.filter(l => l.iso === 'SERC').reduce((s, l) => s + l.mw_2024, 0) / 1000 },
    'NYISO': { current_gw: LARGE_LOADS_US.filter(l => l.iso === 'NYISO').reduce((s, l) => s + l.mw_2024, 0) / 1000 }
};

// Total US Data Center Load Timeline
const US_LOAD_TIMELINE = {
    mw_2024: LARGE_LOADS_US.reduce((s, l) => s + l.mw_2024, 0),
    mw_2026: LARGE_LOADS_US.reduce((s, l) => s + l.mw_2026, 0),
    mw_2028: LARGE_LOADS_US.reduce((s, l) => s + l.mw_2028, 0),
    mw_2030: LARGE_LOADS_US.reduce((s, l) => s + l.mw_2030, 0),
    facility_count: LARGE_LOADS_US.length,
    hyperscale_count: LARGE_LOADS_US.filter(l => l.type === 'Hyperscale').length,
    colocation_count: LARGE_LOADS_US.filter(l => l.type === 'Colocation').length
};
