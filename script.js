// Global data storage
let rawData = [];
let filteredData = [];
let filteredDataAnnual = [];
let allQuarters = []; // Sorted list of all quarters
let allYears = []; // Sorted list of all years
let selectedQuarterIndex = 0; // 0 = All Time
let selectedYearIndex = 0; // 0 = All Time

// ERCOT Load data storage
let loadData = [];
let filteredLoadData = [];
const loadYears = ['All', '2026', '2027', '2028', '2029', '2030'];
let selectedLoadYearIndex = 0;

// Dark theme for Plotly charts
const darkTheme = {
    paper_bgcolor: '#161b22',
    plot_bgcolor: '#161b22',
    font: { color: '#e6edf3', size: 11 },
    gridcolor: '#30363d',
    colors: ['#58a6ff', '#3fb950', '#d29922', '#a371f7', '#39c5cf', '#f85149']
};

// Initialize
document.addEventListener('DOMContentLoaded', loadBESSData);

// Update loading status
function setStatus(msg) {
    const el = document.getElementById('loadingStatus');
    if (el) el.textContent = msg;
    console.log(msg);
}

// Load master Excel data
async function loadBESSData() {
    setStatus('Loading master-ercot-bess.xlsx...');

    try {
        const response = await fetch('master-ercot-bess.xlsx');
        if (!response.ok) throw new Error('Failed to fetch file');

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        setStatus('Parsing data...');

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON with headers
        rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        // Filter out empty rows
        rawData = rawData.filter(row => row['Technology Type'] && row['Capacity (MW)']);

        setStatus(`Loaded ${rawData.length} projects`);

        if (rawData.length === 0) {
            setStatus('No data found in file');
            return;
        }

        // Initialize filtered data
        filteredData = [...rawData];

        // Setup UI
        populateFilters();
        setupTimeSlider();
        setupAnnualSlider();
        setupTabs();
        updateStats();
        createAllCharts();

        // Now load ERCOT Load data
        await loadERCOTLoadData();

        // Show dashboard
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('timeSliderContainer').style.display = 'flex';
        document.getElementById('dashboardContent').style.display = 'flex';

    } catch (error) {
        console.error('Error:', error);
        setStatus('Error: ' + error.message);
    }
}

// Load ERCOT Load CSV data
async function loadERCOTLoadData() {
    setStatus('Loading ERCOT Load data...');

    try {
        const response = await fetch('Loads In ERCOT - November Cases.csv');
        if (!response.ok) {
            console.warn('ERCOT Load CSV not found');
            return;
        }

        const csvText = await response.text();

        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        loadData = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] ? values[idx].trim() : '';
            });

            // Only include rows with valid county data
            if (row['County'] && row['County'] !== '') {
                loadData.push(row);
            }
        }

        filteredLoadData = [...loadData];
        setStatus(`Loaded ${loadData.length} load entries`);
        
        // Setup load slider
        setupLoadSlider();

    } catch (error) {
        console.warn('Error loading ERCOT Load data:', error);
    }
}

// Parse CSV line handling commas in quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Setup ERCOT Load year slider
function setupLoadSlider() {
    const slider = document.getElementById('loadTimeSlider');
    const valueDisplay = document.getElementById('loadSliderValue');
    const ticksContainer = document.getElementById('loadSliderTicks');

    if (!slider) return;

    slider.max = loadYears.length - 1;
    slider.value = 0;

    // Create tick marks
    ticksContainer.innerHTML = '';
    loadYears.forEach((year, i) => {
        const tick = document.createElement('span');
        tick.className = 'tick';
        tick.textContent = year === 'All' ? 'All' : year;
        tick.style.left = `${(i / (loadYears.length - 1)) * 100}%`;
        ticksContainer.appendChild(tick);
    });

    slider.addEventListener('input', () => {
        selectedLoadYearIndex = parseInt(slider.value);
        valueDisplay.textContent = loadYears[selectedLoadYearIndex] === 'All' ? 'All Years' : loadYears[selectedLoadYearIndex];
        applyLoadFilters();
        createAllChartsLoad();
    });
}

// Apply filters to load data based on selected year
function applyLoadFilters() {
    if (selectedLoadYearIndex === 0) {
        // All years - use 2030 as the total
        filteredLoadData = [...loadData];
    } else {
        filteredLoadData = [...loadData];
    }
}

// Sort quarters chronologically helper
function sortQuarters(quarters) {
    return quarters.sort((a, b) => {
        const [qa, ya] = [a.charAt(1), a.split(' ')[1]];
        const [qb, yb] = [b.charAt(1), b.split(' ')[1]];
        if (ya !== yb) return parseInt(ya) - parseInt(yb);
        return parseInt(qa) - parseInt(qb);
    });
}

// Populate filter dropdowns
function populateFilters() {
    // Get unique quarters, filter out invalid ones, and sort chronologically
    allQuarters = sortQuarters(
        [...new Set(rawData.map(r => r['COD Quarter']).filter(q => q && q !== '' && !q.includes('1900')))]
    );

    // Get unique years from quarters and sort
    allYears = [...new Set(allQuarters.map(q => q.split(' ')[1]))].sort();

    // Get unique zones
    const zones = [...new Set(rawData.map(r => r['CDR Reporting Zone']).filter(z => z && z !== ''))];
    zones.sort();

    const zoneSelect = document.getElementById('zoneFilter');
    zoneSelect.innerHTML = '<option value="all">All Zones</option>';
    zones.forEach(z => {
        const opt = document.createElement('option');
        opt.value = z;
        opt.textContent = z;
        zoneSelect.appendChild(opt);
    });

    // Add event listener for zone filter
    zoneSelect.addEventListener('change', () => { applyFilters(); applyFiltersAnnual(); });
}

// Setup global time range slider (quarterly)
function setupTimeSlider() {
    const sliderMin = document.getElementById('rangeSliderMin');
    const sliderMax = document.getElementById('rangeSliderMax');
    const sliderRange = document.getElementById('sliderRange');
    const startLabel = document.getElementById('rangeStartLabel');
    const endLabel = document.getElementById('rangeEndLabel');
    const resetBtn = document.getElementById('resetTimeRange');
    const ticksContainer = document.getElementById('rangeTicks');

    const maxIndex = allQuarters.length - 1;

    // Set slider ranges
    sliderMin.min = 0;
    sliderMin.max = maxIndex;
    sliderMin.value = 0;

    sliderMax.min = 0;
    sliderMax.max = maxIndex;
    sliderMax.value = maxIndex;

    // Create tick marks - show Q1 of each year
    ticksContainer.innerHTML = '';
    const q1Quarters = allQuarters.filter(q => q.startsWith('Q1'));
    q1Quarters.forEach(q => {
        const tick = document.createElement('span');
        tick.textContent = q;
        ticksContainer.appendChild(tick);
    });

    // Update slider range highlight and labels
    function updateSliderUI() {
        const minVal = parseInt(sliderMin.value);
        const maxVal = parseInt(sliderMax.value);
        const percent1 = (minVal / maxIndex) * 100;
        const percent2 = (maxVal / maxIndex) * 100;

        sliderRange.style.left = percent1 + '%';
        sliderRange.style.width = (percent2 - percent1) + '%';

        startLabel.textContent = allQuarters[minVal];
        endLabel.textContent = allQuarters[maxVal];
    }

    // Event handlers
    sliderMin.addEventListener('input', function () {
        const minVal = parseInt(this.value);
        const maxVal = parseInt(sliderMax.value);

        // Prevent min from exceeding max
        if (minVal > maxVal) {
            this.value = maxVal;
        }

        updateSliderUI();
        applyFilters();
    });

    sliderMax.addEventListener('input', function () {
        const minVal = parseInt(sliderMin.value);
        const maxVal = parseInt(this.value);

        // Prevent max from going below min
        if (maxVal < minVal) {
            this.value = minVal;
        }

        updateSliderUI();
        applyFilters();
    });

    resetBtn.addEventListener('click', function () {
        sliderMin.value = 0;
        sliderMax.value = maxIndex;
        updateSliderUI();
        applyFilters();
    });

    updateSliderUI();
}

// Setup annual time slider
function setupAnnualSlider() {
    const slider = document.getElementById('annualTimeSlider');
    const valueDisplay = document.getElementById('annualSliderValue');
    const ticksContainer = document.getElementById('annualSliderTicks');

    // Set slider range: 0 = All Years, 1+ = specific years
    slider.min = 0;
    slider.max = allYears.length;
    slider.value = 0;

    // Create tick marks
    ticksContainer.innerHTML = '<span>All</span>';
    allYears.forEach(year => {
        const tick = document.createElement('span');
        tick.textContent = year;
        ticksContainer.appendChild(tick);
    });

    // Slider change handler
    slider.addEventListener('input', function () {
        selectedYearIndex = parseInt(this.value);

        if (selectedYearIndex === 0) {
            valueDisplay.textContent = 'All Years';
        } else {
            const year = allYears[selectedYearIndex - 1];
            valueDisplay.textContent = year;
        }

        applyFiltersAnnual();
    });
}

// Apply filters and refresh charts
function applyFilters() {
    const zone = document.getElementById('zoneFilter').value;
    const startIdx = parseInt(document.getElementById('rangeSliderMin').value);
    const endIdx = parseInt(document.getElementById('rangeSliderMax').value);

    // Get quarters in the selected range
    const selectedQuarters = allQuarters.slice(startIdx, endIdx + 1);

    // Filter data - exclude invalid quarters like Q1 1900
    filteredData = rawData.filter(row => {
        const rowQuarter = row['COD Quarter'];
        if (rowQuarter && rowQuarter.includes('1900')) return false;
        if (!selectedQuarters.includes(rowQuarter)) return false;
        if (zone !== 'all' && row['CDR Reporting Zone'] !== zone) return false;
        return true;
    });

    updateStats();
    createAllCharts();

    // Also update the large county map if Counties tab is active
    const countiesTab = document.getElementById('tab-counties');
    if (countiesTab && countiesTab.classList.contains('active')) {
        createCountyMapLarge();
    }
}

// Apply filters for annual view
function applyFiltersAnnual() {
    const zone = document.getElementById('zoneFilter').value;
    const sliderValue = parseInt(document.getElementById('annualTimeSlider').value);
    const year = sliderValue === 0 ? 'all' : allYears[sliderValue - 1];

    // Filter data by year (extract year from COD Quarter)
    filteredDataAnnual = rawData.filter(row => {
        const rowQuarter = row['COD Quarter'];
        if (rowQuarter && rowQuarter.includes('1900')) return false;

        if (year !== 'all') {
            const rowYear = rowQuarter ? rowQuarter.split(' ')[1] : '';
            if (rowYear !== year) return false;
        }
        if (zone !== 'all' && row['CDR Reporting Zone'] !== zone) return false;
        return true;
    });

    updateStatsAnnual();
    createAllChartsAnnual();
}

// Update stats for annual view
function updateStatsAnnual() {
    const totalCapacity = filteredDataAnnual.reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('statTotalCapacity').textContent = (totalCapacity / 1000).toFixed(1);

    document.getElementById('statProjects').textContent = formatNumber(filteredDataAnnual.length);

    const entities = new Set(filteredDataAnnual.map(r => r['Interconnecting Entity']).filter(e => e));
    document.getElementById('statEntities').textContent = formatNumber(entities.size);

    const counties = new Set(filteredDataAnnual.map(r => r['County']).filter(c => c));
    document.getElementById('statCounties').textContent = formatNumber(counties.size);

    // Technology breakdown
    const solarCap = filteredDataAnnual.filter(r => r['Technology Type'] === 'Solar Co-Location')
        .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('layerSolar').textContent = (solarCap / 1000).toFixed(2) + ' GW';

    const standaloneCap = filteredDataAnnual.filter(r => r['Technology Type'] === 'Standalone Storage')
        .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('layerStandalone').textContent = (standaloneCap / 1000).toFixed(2) + ' GW';

    const windCap = filteredDataAnnual.filter(r => r['Technology Type'] === 'Wind Co-Location')
        .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('layerWind').textContent = (windCap / 1000).toFixed(2) + ' GW';
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString('en-US');
}

// Update sidebar statistics
function updateStats() {
    const totalCapacity = filteredData.reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('statTotalCapacity').textContent = (totalCapacity / 1000).toFixed(1);

    document.getElementById('statProjects').textContent = formatNumber(filteredData.length);

    const entities = new Set(filteredData.map(r => r['Interconnecting Entity']).filter(e => e));
    document.getElementById('statEntities').textContent = formatNumber(entities.size);

    const counties = new Set(filteredData.map(r => r['County']).filter(c => c));
    document.getElementById('statCounties').textContent = formatNumber(counties.size);

    // Technology breakdown
    const solarCap = filteredData.filter(r => r['Technology Type'] === 'Solar Co-Location')
        .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('layerSolar').textContent = (solarCap / 1000).toFixed(2) + ' GW';

    const standaloneCap = filteredData.filter(r => r['Technology Type'] === 'Standalone Storage')
        .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('layerStandalone').textContent = (standaloneCap / 1000).toFixed(2) + ' GW';

    const windCap = filteredData.filter(r => r['Technology Type'] === 'Wind Co-Location')
        .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    document.getElementById('layerWind').textContent = (windCap / 1000).toFixed(2) + ' GW';
}

// Create all charts
function createAllCharts() {
    createZoneChart();
    createQuarterChart();
    createCountyChart();
    createEntityChart();
    createCountyMap();
}

// Create all annual charts
function createAllChartsAnnual() {
    createZoneChartAnnual();
    createCountyChartAnnual();
    createEntityChartAnnual();
    createCountyMapAnnual();
}

// Setup tab navigation
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('tab-' + tabId).classList.add('active');

            // Resize charts and switch sliders when tab becomes visible
            if (tabId === 'timeline') {
                document.getElementById('timeSliderContainer').style.display = 'flex';
                document.getElementById('annualSliderContainer').style.display = 'none';
                document.getElementById('loadSliderContainer').style.display = 'none';
                // Show sidebar
                document.querySelector('.sidebar').style.display = 'flex';
                document.querySelector('.main-content').style.marginLeft = '';
                Plotly.Plots.resize('quarterChart');
            } else if (tabId === 'counties') {
                // Hide all sliders for Counties Navigator tab
                document.getElementById('timeSliderContainer').style.display = 'none';
                document.getElementById('annualSliderContainer').style.display = 'none';
                document.getElementById('loadSliderContainer').style.display = 'none';
                // Hide main sidebar - Counties has its own navigator
                document.querySelector('.sidebar').style.display = 'none';
                document.querySelector('.main-content').style.marginLeft = '0';
                // Setup navigator and create scatter map
                setupNavigatorSidebar();
                createScatterMap();
            } else if (tabId === 'overview') {
                document.getElementById('timeSliderContainer').style.display = 'flex';
                document.getElementById('annualSliderContainer').style.display = 'none';
                document.getElementById('loadSliderContainer').style.display = 'none';
                // Show sidebar
                document.querySelector('.sidebar').style.display = 'flex';
                document.querySelector('.main-content').style.marginLeft = '';
                Plotly.Plots.resize('zoneChart');
                Plotly.Plots.resize('countyMap');
            } else if (tabId === 'annual') {
                // Show sidebar
                document.querySelector('.sidebar').style.display = 'flex';
                document.querySelector('.main-content').style.marginLeft = '';
                // Switch to annual slider
                document.getElementById('timeSliderContainer').style.display = 'none';
                document.getElementById('annualSliderContainer').style.display = 'flex';
                document.getElementById('loadSliderContainer').style.display = 'none';

                // Initialize annual data if not already done
                if (filteredDataAnnual.length === 0) {
                    filteredDataAnnual = rawData.filter(r => {
                        const q = r['COD Quarter'];
                        return q && !q.includes('1900');
                    });
                }
                createAllChartsAnnual();
            } else if (tabId === 'ercot-load') {
                // Show sidebar
                document.querySelector('.sidebar').style.display = 'flex';
                document.querySelector('.main-content').style.marginLeft = '';
                // Switch to load slider
                document.getElementById('timeSliderContainer').style.display = 'none';
                document.getElementById('annualSliderContainer').style.display = 'none';
                document.getElementById('loadSliderContainer').style.display = 'flex';

                createAllChartsLoad();
            } else if (tabId === 'pricing') {
                // Hide sidebar for full width experience or keep it?
                // Let's hide the main sidebar to give more room for charts
                document.querySelector('.sidebar').style.display = 'none';
                document.querySelector('.main-content').style.marginLeft = '0';

                // Hide sliders
                document.getElementById('timeSliderContainer').style.display = 'none';
                document.getElementById('annualSliderContainer').style.display = 'none';
                document.getElementById('loadSliderContainer').style.display = 'none';

                // Resize plots if they exist
                if (document.getElementById('pricingDashboard').style.display !== 'none') {
                    Plotly.Plots.resize('priceTrendChart');
                    Plotly.Plots.resize('priceDistChart');
                }
            }
        });
    });
}

// Chart 1: Capacity by Reporting Zone (stacked by technology)
function createZoneChart() {
    const zones = ['SOUTH', 'WEST', 'COASTAL', 'NORTH', 'PANHANDLE', 'HOUSTON'];
    const techTypes = ['Solar Co-Location', 'Standalone Storage', 'Wind Co-Location'];

    const traces = techTypes.map((tech, i) => {
        const values = zones.map(zone => {
            return filteredData
                .filter(r => r['CDR Reporting Zone'] === zone && r['Technology Type'] === tech)
                .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
        });

        return {
            x: zones,
            y: values,
            name: tech,
            type: 'bar',
            marker: { color: darkTheme.colors[i] }
        };
    });

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        barmode: 'stack',
        xaxis: { gridcolor: darkTheme.gridcolor },
        yaxis: { title: { text: 'Capacity (MW)', standoff: 10 }, gridcolor: darkTheme.gridcolor, tickformat: ',' },
        legend: { orientation: 'h', y: -0.15 },
        margin: { t: 10, b: 60, l: 65, r: 10 },
        height: 280
    };

    Plotly.newPlot('zoneChart', traces, layout, { responsive: true, displayModeBar: false });
}

// Chart 2: Capacity by Quarter (timeline) - Stacked by Technology
function createQuarterChart() {
    const techTypes = ['Solar Co-Location', 'Standalone Storage', 'Wind Co-Location'];

    // Get all quarters from raw data (not filtered) to show full timeline
    const allQuartersSet = new Set();
    rawData.forEach(r => {
        const q = r['COD Quarter'];
        if (q && q !== '' && !q.includes('1900')) {
            allQuartersSet.add(q);
        }
    });

    // Sort quarters chronologically
    const quarters = sortQuarters([...allQuartersSet]);

    // Calculate totals for each quarter for annotations
    const quarterTotals = quarters.map(quarter => {
        return filteredData
            .filter(r => r['COD Quarter'] === quarter)
            .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
    });

    // Build data by technology and quarter
    const traces = techTypes.map((tech, i) => {
        const values = quarters.map(quarter => {
            return filteredData
                .filter(r => r['COD Quarter'] === quarter && r['Technology Type'] === tech)
                .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
        });

        return {
            x: quarters,
            y: values,
            name: tech,
            type: 'bar',
            marker: { color: darkTheme.colors[i] }
        };
    });

    // Add annotations for total capacity on top of each bar
    const annotations = quarters.map((quarter, i) => {
        const total = quarterTotals[i];
        if (total === 0) return null;
        return {
            x: quarter,
            y: total,
            text: formatNumber(Math.round(total)),
            showarrow: false,
            font: { color: '#e6edf3', size: 9 },
            yanchor: 'bottom',
            yshift: 3
        };
    }).filter(a => a !== null);

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        barmode: 'stack',
        xaxis: { gridcolor: darkTheme.gridcolor, tickangle: -45 },
        yaxis: { title: 'Capacity (MW)', gridcolor: darkTheme.gridcolor, tickformat: ',' },
        legend: { orientation: 'h', y: -0.25 },
        margin: { t: 30, b: 100, l: 60, r: 20 },
        annotations: annotations
    };

    Plotly.newPlot('quarterChart', traces, layout, { responsive: true, displayModeBar: false });
}

// Zone colors mapping
const zoneColors = {
    'SOUTH': '#3fb950',
    'WEST': '#58a6ff',
    'COASTAL': '#39c5cf',
    'NORTH': '#d29922',
    'PANHANDLE': '#a371f7',
    'HOUSTON': '#f85149'
};

// Get county to zone mapping from data
function getCountyZoneMap() {
    const countyZone = {};
    rawData.forEach(r => {
        const county = r['County'];
        const zone = r['CDR Reporting Zone'];
        if (county && zone) {
            countyZone[county] = zone;
        }
    });
    return countyZone;
}

// Chart 3: Top 10 Counties
function createCountyChart() {
    const countyData = {};
    filteredData.forEach(r => {
        const county = r['County'];
        if (!county || county === '') return;
        if (!countyData[county]) countyData[county] = 0;
        countyData[county] += parseFloat(r['Capacity (MW)']) || 0;
    });

    // Sort and get top 10
    const sorted = Object.entries(countyData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reverse();

    // Get zone colors for each county
    const countyZoneMap = getCountyZoneMap();
    const barColors = sorted.map(s => zoneColors[countyZoneMap[s[0]]] || darkTheme.colors[1]);

    const trace = {
        x: sorted.map(s => s[1]),
        y: sorted.map(s => s[0]),
        type: 'bar',
        orientation: 'h',
        marker: { color: barColors },
        text: sorted.map(s => formatNumber(Math.round(s[1])) + ' MW'),
        textposition: 'outside',
        textfont: { color: '#e6edf3', size: 9 },
        cliponaxis: false
    };

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        xaxis: { title: 'Capacity (MW)', gridcolor: darkTheme.gridcolor, tickformat: ',' },
        yaxis: { gridcolor: darkTheme.gridcolor, tickfont: { size: 8 }, automargin: true },
        margin: { t: 10, b: 50, l: 85, r: 65 },
        height: 400
    };

    Plotly.newPlot('countyChart', [trace], layout, { responsive: true, displayModeBar: false });
}

// Chart 4: Top 10 Entities
function createEntityChart() {
    const entityData = {};
    filteredData.forEach(r => {
        const entity = r['Interconnecting Entity'];
        if (!entity || entity === '') return;
        if (!entityData[entity]) entityData[entity] = 0;
        entityData[entity] += parseFloat(r['Capacity (MW)']) || 0;
    });

    // Sort and get top 10
    const sorted = Object.entries(entityData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reverse();

    const trace = {
        x: sorted.map(s => s[1]),
        y: sorted.map(s => s[0]),
        type: 'bar',
        orientation: 'h',
        marker: { color: darkTheme.colors[3] },
        text: sorted.map(s => formatNumber(Math.round(s[1])) + ' MW'),
        textposition: 'outside',
        textfont: { color: '#e6edf3', size: 9 },
        cliponaxis: false
    };

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        xaxis: { title: 'Capacity (MW)', gridcolor: darkTheme.gridcolor, tickformat: ',' },
        yaxis: { gridcolor: darkTheme.gridcolor, tickfont: { size: 10 }, automargin: true },
        margin: { t: 10, b: 50, l: 180, r: 65 },
        height: 400
    };

    Plotly.newPlot('entityChart', [trace], layout, { responsive: true, displayModeBar: false });
}

// Annual Chart 1: Capacity by Reporting Zone (stacked by technology) - Annual
function createZoneChartAnnual() {
    const zones = ['SOUTH', 'WEST', 'COASTAL', 'NORTH', 'PANHANDLE', 'HOUSTON'];
    const techTypes = ['Solar Co-Location', 'Standalone Storage', 'Wind Co-Location'];

    const traces = techTypes.map((tech, i) => {
        const values = zones.map(zone => {
            return filteredDataAnnual
                .filter(r => r['CDR Reporting Zone'] === zone && r['Technology Type'] === tech)
                .reduce((sum, r) => sum + (parseFloat(r['Capacity (MW)']) || 0), 0);
        });

        return {
            x: zones,
            y: values,
            name: tech,
            type: 'bar',
            marker: { color: darkTheme.colors[i] }
        };
    });

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        barmode: 'stack',
        xaxis: { gridcolor: darkTheme.gridcolor },
        yaxis: { title: { text: 'Capacity (MW)', standoff: 10 }, gridcolor: darkTheme.gridcolor, tickformat: ',' },
        legend: { orientation: 'h', y: -0.15 },
        margin: { t: 10, b: 60, l: 65, r: 10 },
        height: 280
    };

    Plotly.newPlot('zoneChartAnnual', traces, layout, { responsive: true, displayModeBar: false });
}

// Annual Chart 2: Top 10 Counties - Annual
function createCountyChartAnnual() {
    const countyData = {};
    filteredDataAnnual.forEach(r => {
        const county = r['County'];
        if (!county || county === '') return;
        if (!countyData[county]) countyData[county] = 0;
        countyData[county] += parseFloat(r['Capacity (MW)']) || 0;
    });

    const sorted = Object.entries(countyData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reverse();

    // Get zone colors for each county
    const countyZoneMap = getCountyZoneMap();
    const barColors = sorted.map(s => zoneColors[countyZoneMap[s[0]]] || darkTheme.colors[1]);

    const trace = {
        x: sorted.map(s => s[1]),
        y: sorted.map(s => s[0]),
        type: 'bar',
        orientation: 'h',
        marker: { color: barColors },
        text: sorted.map(s => formatNumber(Math.round(s[1])) + ' MW'),
        textposition: 'outside',
        textfont: { color: '#e6edf3', size: 9 },
        cliponaxis: false
    };

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        xaxis: { title: 'Capacity (MW)', gridcolor: darkTheme.gridcolor, tickformat: ',' },
        yaxis: { gridcolor: darkTheme.gridcolor, tickfont: { size: 8 }, automargin: true },
        margin: { t: 10, b: 50, l: 85, r: 65 },
        height: 400
    };

    Plotly.newPlot('countyChartAnnual', [trace], layout, { responsive: true, displayModeBar: false });
}

// Annual Chart 3: Top 10 Entities - Annual
function createEntityChartAnnual() {
    const entityData = {};
    filteredDataAnnual.forEach(r => {
        const entity = r['Interconnecting Entity'];
        if (!entity || entity === '') return;
        if (!entityData[entity]) entityData[entity] = 0;
        entityData[entity] += parseFloat(r['Capacity (MW)']) || 0;
    });

    const sorted = Object.entries(entityData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reverse();

    const trace = {
        x: sorted.map(s => s[1]),
        y: sorted.map(s => s[0]),
        type: 'bar',
        orientation: 'h',
        marker: { color: darkTheme.colors[3] },
        text: sorted.map(s => formatNumber(Math.round(s[1])) + ' MW'),
        textposition: 'outside',
        textfont: { color: '#e6edf3', size: 9 },
        cliponaxis: false
    };

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        xaxis: { title: 'Capacity (MW)', gridcolor: darkTheme.gridcolor, tickformat: ',' },
        yaxis: { gridcolor: darkTheme.gridcolor, tickfont: { size: 10 }, automargin: true },
        margin: { t: 10, b: 50, l: 180, r: 65 },
        height: 400
    };

    Plotly.newPlot('entityChartAnnual', [trace], layout, { responsive: true, displayModeBar: false });
}

// Annual County Map
async function createCountyMapAnnual() {
    const geoJSON = await loadTexasGeoJSON();
    if (!geoJSON) return;

    const countyData = {};
    filteredDataAnnual.forEach(r => {
        const county = r['County'];
        if (!county || county === '') return;
        if (!countyData[county]) countyData[county] = 0;
        countyData[county] += parseFloat(r['Capacity (MW)']) || 0;
    });

    const locations = [];
    const values = [];
    const hoverText = [];

    Object.entries(countyData).forEach(([county, capacity]) => {
        const fips = texasCountyFIPS[county];
        if (fips) {
            locations.push(fips);
            values.push(capacity);
            hoverText.push(`${county}: ${capacity.toFixed(1)} MW`);
        }
    });

    const maxVal = Math.max(...values, 1);

    const trace = {
        type: 'choropleth',
        geojson: geoJSON,
        locations: locations,
        z: values,
        text: hoverText,
        hoverinfo: 'text',
        colorscale: [
            [0, '#0d1117'],
            [0.2, '#1a4a6e'],
            [0.4, '#2d7d9a'],
            [0.6, '#3fb950'],
            [0.8, '#7ee87e'],
            [1, '#b8f4b8']
        ],
        zmin: 0,
        zmax: maxVal,
        marker: { line: { color: '#30363d', width: 0.5 } },
        colorbar: {
            title: { text: 'MW', font: { color: '#e6edf3', size: 10 } },
            tickfont: { color: '#8b949e', size: 9 },
            thickness: 12,
            len: 0.8,
            tickformat: ','
        }
    };

    const layout = {
        geo: {
            scope: 'usa',
            projection: { type: 'albers usa' },
            center: { lat: 31.5, lon: -99.5 },
            fitbounds: 'locations',
            bgcolor: '#0d1117',
            lakecolor: '#161b22',
            landcolor: '#21262d',
            subunitcolor: '#30363d'
        },
        paper_bgcolor: '#161b22',
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: 280
    };

    Plotly.newPlot('countyMapAnnual', [trace], layout, { responsive: true, displayModeBar: false });
}

// Texas county FIPS codes mapping
const texasCountyFIPS = {
    'Anderson': '48001', 'Andrews': '48003', 'Angelina': '48005', 'Aransas': '48007', 'Archer': '48009',
    'Armstrong': '48011', 'Atascosa': '48013', 'Austin': '48015', 'Bailey': '48017', 'Bandera': '48019',
    'Bastrop': '48021', 'Baylor': '48023', 'Bee': '48025', 'Bell': '48027', 'Bexar': '48029',
    'Blanco': '48031', 'Borden': '48033', 'Bosque': '48035', 'Bowie': '48037', 'Brazoria': '48039',
    'Brazos': '48041', 'Brewster': '48043', 'Briscoe': '48045', 'Brooks': '48047', 'Brown': '48049',
    'Burleson': '48051', 'Burnet': '48053', 'Caldwell': '48055', 'Calhoun': '48057', 'Callahan': '48059',
    'Cameron': '48061', 'Camp': '48063', 'Carson': '48065', 'Cass': '48067', 'Castro': '48069',
    'Chambers': '48071', 'Cherokee': '48073', 'Childress': '48075', 'Clay': '48077', 'Cochran': '48079',
    'Coke': '48081', 'Coleman': '48083', 'Collin': '48085', 'Collingsworth': '48087', 'Colorado': '48089',
    'Comal': '48091', 'Comanche': '48093', 'Concho': '48095', 'Cooke': '48097', 'Coryell': '48099',
    'Cottle': '48101', 'Crane': '48103', 'Crockett': '48105', 'Crosby': '48107', 'Culberson': '48109',
    'Dallam': '48111', 'Dallas': '48113', 'Dawson': '48115', 'Deaf Smith': '48117', 'Delta': '48119',
    'Denton': '48121', 'DeWitt': '48123', 'Dickens': '48125', 'Dimmit': '48127', 'Donley': '48129',
    'Duval': '48131', 'Eastland': '48133', 'Ector': '48135', 'Edwards': '48137', 'Ellis': '48139',
    'El Paso': '48141', 'Erath': '48143', 'Falls': '48145', 'Fannin': '48147', 'Fayette': '48149',
    'Fisher': '48151', 'Floyd': '48153', 'Foard': '48155', 'Fort Bend': '48157', 'Franklin': '48159',
    'Freestone': '48161', 'Frio': '48163', 'Gaines': '48165', 'Galveston': '48167', 'Garza': '48169',
    'Gillespie': '48171', 'Glasscock': '48173', 'Goliad': '48175', 'Gonzales': '48177', 'Gray': '48179',
    'Grayson': '48181', 'Gregg': '48183', 'Grimes': '48185', 'Guadalupe': '48187', 'Hale': '48189',
    'Hall': '48191', 'Hamilton': '48193', 'Hansford': '48195', 'Hardeman': '48197', 'Hardin': '48199',
    'Harris': '48201', 'Harrison': '48203', 'Hartley': '48205', 'Haskell': '48207', 'Hays': '48209',
    'Hemphill': '48211', 'Henderson': '48213', 'Hidalgo': '48215', 'Hill': '48217', 'Hockley': '48219',
    'Hood': '48221', 'Hopkins': '48223', 'Houston': '48225', 'Howard': '48227', 'Hudspeth': '48229',
    'Hunt': '48231', 'Hutchinson': '48233', 'Irion': '48235', 'Jack': '48237', 'Jackson': '48239',
    'Jasper': '48241', 'Jeff Davis': '48243', 'Jefferson': '48245', 'Jim Hogg': '48247', 'Jim Wells': '48249',
    'Johnson': '48251', 'Jones': '48253', 'Karnes': '48255', 'Kaufman': '48257', 'Kendall': '48259',
    'Kenedy': '48261', 'Kent': '48263', 'Kerr': '48265', 'Kimble': '48267', 'King': '48269',
    'Kinney': '48271', 'Kleberg': '48273', 'Knox': '48275', 'Lamar': '48277', 'Lamb': '48279',
    'Lampasas': '48281', 'La Salle': '48283', 'Lavaca': '48285', 'Lee': '48287', 'Leon': '48289',
    'Liberty': '48291', 'Limestone': '48293', 'Lipscomb': '48295', 'Live Oak': '48297', 'Llano': '48299',
    'Loving': '48301', 'Lubbock': '48303', 'Lynn': '48305', 'McCulloch': '48307', 'McLennan': '48309',
    'McMullen': '48311', 'Madison': '48313', 'Marion': '48315', 'Martin': '48317', 'Mason': '48319',
    'Matagorda': '48321', 'Maverick': '48323', 'Medina': '48325', 'Menard': '48327', 'Midland': '48329',
    'Milam': '48331', 'Mills': '48333', 'Mitchell': '48335', 'Montague': '48337', 'Montgomery': '48339',
    'Moore': '48341', 'Morris': '48343', 'Motley': '48345', 'Nacogdoches': '48347', 'Navarro': '48349',
    'Newton': '48351', 'Nolan': '48353', 'Nueces': '48355', 'Ochiltree': '48357', 'Oldham': '48359',
    'Orange': '48361', 'Palo Pinto': '48363', 'Panola': '48365', 'Parker': '48367', 'Parmer': '48369',
    'Pecos': '48371', 'Polk': '48373', 'Potter': '48375', 'Presidio': '48377', 'Rains': '48379',
    'Randall': '48381', 'Reagan': '48383', 'Real': '48385', 'Red River': '48387', 'Reeves': '48389',
    'Refugio': '48391', 'Roberts': '48393', 'Robertson': '48395', 'Rockwall': '48397', 'Runnels': '48399',
    'Rusk': '48401', 'Sabine': '48403', 'San Augustine': '48405', 'San Jacinto': '48407', 'San Patricio': '48409',
    'San Saba': '48411', 'Schleicher': '48413', 'Scurry': '48415', 'Shackelford': '48417', 'Shelby': '48419',
    'Sherman': '48421', 'Smith': '48423', 'Somervell': '48425', 'Starr': '48427', 'Stephens': '48429',
    'Sterling': '48431', 'Stonewall': '48433', 'Sutton': '48435', 'Swisher': '48437', 'Tarrant': '48439',
    'Taylor': '48441', 'Terrell': '48443', 'Terry': '48445', 'Throckmorton': '48447', 'Titus': '48449',
    'Tom Green': '48451', 'Travis': '48453', 'Trinity': '48455', 'Tyler': '48457', 'Upshur': '48459',
    'Upton': '48461', 'Uvalde': '48463', 'Val Verde': '48465', 'Van Zandt': '48467', 'Victoria': '48469',
    'Walker': '48471', 'Waller': '48473', 'Ward': '48475', 'Washington': '48477', 'Webb': '48479',
    'Wharton': '48481', 'Wheeler': '48483', 'Wichita': '48485', 'Wilbarger': '48487', 'Willacy': '48489',
    'Williamson': '48491', 'Wilson': '48493', 'Winkler': '48495', 'Wise': '48497', 'Wood': '48499',
    'Yoakum': '48501', 'Young': '48503', 'Zapata': '48505', 'Zavala': '48507'
};

// Load Texas GeoJSON
let texasGeoJSON = null;

async function loadTexasGeoJSON() {
    if (texasGeoJSON) return texasGeoJSON;

    try {
        const response = await fetch('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json');
        const data = await response.json();
        // Filter for Texas counties only (FIPS starting with 48)
        texasGeoJSON = {
            type: 'FeatureCollection',
            features: data.features.filter(f => f.id && f.id.startsWith('48'))
        };
        return texasGeoJSON;
    } catch (error) {
        console.error('Error loading GeoJSON:', error);
        return null;
    }
}

// Create county choropleth map (small version for Overview tab)
async function createCountyMap() {
    const geoJSON = await loadTexasGeoJSON();
    if (!geoJSON) return;

    // Aggregate capacity by county
    const countyData = {};
    filteredData.forEach(r => {
        const county = r['County'];
        if (!county || county === '') return;
        if (!countyData[county]) countyData[county] = 0;
        countyData[county] += parseFloat(r['Capacity (MW)']) || 0;
    });

    // Map county names to FIPS codes
    const locations = [];
    const values = [];
    const hoverText = [];

    Object.entries(countyData).forEach(([county, capacity]) => {
        const fips = texasCountyFIPS[county];
        if (fips) {
            locations.push(fips);
            values.push(capacity);
            hoverText.push(`${county}: ${capacity.toFixed(1)} MW`);
        }
    });

    const maxVal = Math.max(...values, 1);

    const trace = {
        type: 'choropleth',
        geojson: geoJSON,
        locations: locations,
        z: values,
        text: hoverText,
        hoverinfo: 'text',
        colorscale: [
            [0, '#0d1117'],
            [0.2, '#1a4a6e'],
            [0.4, '#2d7d9a'],
            [0.6, '#3fb950'],
            [0.8, '#7ee87e'],
            [1, '#b8f4b8']
        ],
        zmin: 0,
        zmax: maxVal,
        marker: { line: { color: '#30363d', width: 0.5 } },
        colorbar: {
            title: { text: 'MW', font: { color: '#e6edf3', size: 10 } },
            tickfont: { color: '#8b949e', size: 9 },
            thickness: 12,
            len: 0.8,
            tickformat: ','
        }
    };

    const layout = {
        geo: {
            scope: 'usa',
            projection: { type: 'albers usa' },
            center: { lat: 31.5, lon: -99.5 },
            fitbounds: 'locations',
            bgcolor: '#161b22',
            lakecolor: '#161b22',
            landcolor: '#21262d',
            subunitcolor: '#30363d'
        },
        paper_bgcolor: '#161b22',
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: 280
    };

    Plotly.newPlot('countyMap', [trace], layout, { responsive: true, displayModeBar: false });
}

// Create large county map for Counties tab
async function createCountyMapLarge() {
    const geoJSON = await loadTexasGeoJSON();
    if (!geoJSON) return;

    // Aggregate capacity by county
    const countyData = {};
    filteredData.forEach(r => {
        const county = r['County'];
        if (!county || county === '') return;
        if (!countyData[county]) countyData[county] = 0;
        countyData[county] += parseFloat(r['Capacity (MW)']) || 0;
    });

    // Map county names to FIPS codes
    const locations = [];
    const values = [];
    const hoverText = [];

    Object.entries(countyData).forEach(([county, capacity]) => {
        const fips = texasCountyFIPS[county];
        if (fips) {
            locations.push(fips);
            values.push(capacity);
            hoverText.push(`<b>${county}</b><br>${capacity.toFixed(1)} MW`);
        }
    });

    const maxVal = Math.max(...values, 1);

    const trace = {
        type: 'choropleth',
        geojson: geoJSON,
        locations: locations,
        z: values,
        text: hoverText,
        hoverinfo: 'text',
        colorscale: [
            [0, '#0d1117'],
            [0.15, '#1a3a5c'],
            [0.3, '#2d6a8a'],
            [0.5, '#39c5cf'],
            [0.7, '#3fb950'],
            [0.85, '#7ee87e'],
            [1, '#d4f4d4']
        ],
        zmin: 0,
        zmax: maxVal,
        marker: { line: { color: '#30363d', width: 0.5 } },
        colorbar: {
            title: { text: 'Capacity (MW)', font: { color: '#e6edf3' } },
            tickfont: { color: '#8b949e' },
            thickness: 15,
            tickformat: ','
        }
    };

    const layout = {
        geo: {
            scope: 'usa',
            projection: { type: 'albers usa' },
            center: { lat: 31.5, lon: -99.5 },
            fitbounds: 'locations',
            bgcolor: '#0d1117',
            lakecolor: '#161b22',
            landcolor: '#21262d',
            subunitcolor: '#30363d'
        },
        paper_bgcolor: '#161b22',
        margin: { t: 10, b: 10, l: 10, r: 10 },
        height: 650
    };

    Plotly.newPlot('countyMapLarge', [trace], layout, { responsive: true, displayModeBar: false });
}

// ==================== ERCOT LOAD CHARTS ====================

// Get load value for selected year
function getLoadValue(row) {
    const year = loadYears[selectedLoadYearIndex];
    if (year === 'All') {
        // Sum all years or use 2030 as cumulative
        return parseFloat(row['2030']) || 0;
    }
    return parseFloat(row[year]) || 0;
}

// Create all ERCOT Load charts
function createAllChartsLoad() {
    createLoadZoneChart();
    createLoadCountyChart();
    createLoadSubstationChart();
    createLoadCountyMap();
}

// Load Chart 1: Load by TSP Region (stacked bar)
function createLoadZoneChart() {
    // Get unique TSP regions
    const tspData = {};
    filteredLoadData.forEach(r => {
        const tsp = r['Area Name/TSP'] || 'Unknown';
        if (!tspData[tsp]) tspData[tsp] = 0;
        tspData[tsp] += getLoadValue(r);
    });

    // Sort by value and get top regions
    const sorted = Object.entries(tspData)
        .filter(([k, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const trace = {
        x: sorted.map(s => s[0]),
        y: sorted.map(s => s[1]),
        type: 'bar',
        marker: { color: darkTheme.colors[4] }
    };

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        xaxis: { gridcolor: darkTheme.gridcolor, tickangle: -45 },
        yaxis: { title: { text: 'Load (MW)', standoff: 10 }, gridcolor: darkTheme.gridcolor, tickformat: ',' },
        margin: { t: 10, b: 80, l: 65, r: 10 },
        height: 280
    };

    Plotly.newPlot('loadZoneChart', [trace], layout, { responsive: true, displayModeBar: false });
}

// Load Chart 2: Top 10 Counties by Load
function createLoadCountyChart() {
    const countyData = {};
    filteredLoadData.forEach(r => {
        const county = r['County'];
        if (!county || county === '') return;
        // Normalize county name (capitalize first letter)
        const normalizedCounty = county.charAt(0).toUpperCase() + county.slice(1).toLowerCase();
        if (!countyData[normalizedCounty]) countyData[normalizedCounty] = 0;
        countyData[normalizedCounty] += getLoadValue(r);
    });

    // Sort and get top 10
    const sorted = Object.entries(countyData)
        .filter(([k, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reverse();

    const trace = {
        x: sorted.map(s => s[1]),
        y: sorted.map(s => s[0]),
        type: 'bar',
        orientation: 'h',
        marker: { color: darkTheme.colors[3] },
        text: sorted.map(s => formatNumber(Math.round(s[1])) + ' MW'),
        textposition: 'outside',
        textfont: { color: '#e6edf3', size: 9 },
        cliponaxis: false
    };

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        xaxis: { title: 'Load (MW)', gridcolor: darkTheme.gridcolor, tickformat: ',' },
        yaxis: { gridcolor: darkTheme.gridcolor, tickfont: { size: 10 }, automargin: true },
        margin: { t: 10, b: 50, l: 100, r: 65 },
        height: 400
    };

    Plotly.newPlot('loadCountyChart', [trace], layout, { responsive: true, displayModeBar: false });
}

// Load Chart 3: Top 10 Substations by Load
function createLoadSubstationChart() {
    const substationData = {};
    filteredLoadData.forEach(r => {
        const substation = r['Substation'] || r['Large Load Bus Name'];
        if (!substation || substation === '') return;
        if (!substationData[substation]) substationData[substation] = 0;
        substationData[substation] += getLoadValue(r);
    });

    // Sort and get top 10
    const sorted = Object.entries(substationData)
        .filter(([k, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reverse();

    const trace = {
        x: sorted.map(s => s[1]),
        y: sorted.map(s => s[0]),
        type: 'bar',
        orientation: 'h',
        marker: { color: darkTheme.colors[5] },
        text: sorted.map(s => formatNumber(Math.round(s[1])) + ' MW'),
        textposition: 'outside',
        textfont: { color: '#e6edf3', size: 9 },
        cliponaxis: false
    };

    const layout = {
        paper_bgcolor: darkTheme.paper_bgcolor,
        plot_bgcolor: darkTheme.plot_bgcolor,
        font: darkTheme.font,
        xaxis: { title: 'Load (MW)', gridcolor: darkTheme.gridcolor, tickformat: ',' },
        yaxis: { gridcolor: darkTheme.gridcolor, tickfont: { size: 10 }, automargin: true },
        margin: { t: 10, b: 50, l: 120, r: 65 },
        height: 400
    };

    Plotly.newPlot('loadSubstationChart', [trace], layout, { responsive: true, displayModeBar: false });
}

// Load Chart 4: Texas County Load Map
async function createLoadCountyMap() {
    const geoJSON = await loadTexasGeoJSON();
    if (!geoJSON) return;

    // Aggregate load by county
    const countyData = {};
    filteredLoadData.forEach(r => {
        const county = r['County'];
        if (!county || county === '') return;
        // Normalize county name
        const normalizedCounty = county.charAt(0).toUpperCase() + county.slice(1).toLowerCase();
        if (!countyData[normalizedCounty]) countyData[normalizedCounty] = 0;
        countyData[normalizedCounty] += getLoadValue(r);
    });

    // Map county names to FIPS codes
    const locations = [];
    const values = [];
    const hoverText = [];

    Object.entries(countyData).forEach(([county, load]) => {
        const fips = texasCountyFIPS[county];
        if (fips) {
            locations.push(fips);
            values.push(load);
            hoverText.push(`${county}: ${formatNumber(Math.round(load))} MW`);
        }
    });

    const maxVal = Math.max(...values, 1);

    const trace = {
        type: 'choropleth',
        geojson: geoJSON,
        locations: locations,
        z: values,
        text: hoverText,
        hoverinfo: 'text',
        colorscale: [
            [0, '#0d1117'],
            [0.2, '#4a1a6e'],
            [0.4, '#7d2d9a'],
            [0.6, '#b93fb9'],
            [0.8, '#e87ee8'],
            [1, '#f4b8f4']
        ],
        zmin: 0,
        zmax: maxVal,
        marker: { line: { color: '#30363d', width: 0.5 } },
        colorbar: {
            title: { text: 'MW', font: { color: '#e6edf3', size: 10 } },
            tickfont: { color: '#8b949e', size: 9 },
            thickness: 12,
            len: 0.8,
            tickformat: ','
        }
    };

    const layout = {
        geo: {
            scope: 'usa',
            projection: { type: 'albers usa' },
            center: { lat: 31.5, lon: -99.5 },
            fitbounds: 'locations',
            bgcolor: '#0d1117',
            lakecolor: '#161b22',
            landcolor: '#21262d',
            subunitcolor: '#30363d'
        },
        paper_bgcolor: '#161b22',
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: 280
    };

    Plotly.newPlot('loadCountyMap', [trace], layout, { responsive: true, displayModeBar: false });
}

// ==================== COUNTIES NAVIGATOR TAB ====================

// Texas county coordinates (approximate centers)
const texasCountyCoords = {
    'Anderson': { lat: 31.8, lon: -95.65 },
    'Andrews': { lat: 32.3, lon: -102.64 },
    'Angelina': { lat: 31.25, lon: -94.61 },
    'Aransas': { lat: 28.09, lon: -96.99 },
    'Archer': { lat: 33.62, lon: -98.69 },
    'Armstrong': { lat: 34.96, lon: -101.36 },
    'Atascosa': { lat: 28.89, lon: -98.53 },
    'Austin': { lat: 29.88, lon: -96.28 },
    'Bailey': { lat: 34.07, lon: -102.83 },
    'Bandera': { lat: 29.73, lon: -99.25 },
    'Bastrop': { lat: 30.1, lon: -97.31 },
    'Baylor': { lat: 33.62, lon: -99.21 },
    'Bee': { lat: 28.42, lon: -97.75 },
    'Bell': { lat: 31.04, lon: -97.48 },
    'Bexar': { lat: 29.45, lon: -98.52 },
    'Blanco': { lat: 30.26, lon: -98.4 },
    'Borden': { lat: 32.74, lon: -101.43 },
    'Bosque': { lat: 31.9, lon: -97.63 },
    'Bowie': { lat: 33.45, lon: -94.42 },
    'Brazoria': { lat: 29.17, lon: -95.43 },
    'Brazos': { lat: 30.66, lon: -96.3 },
    'Brewster': { lat: 29.81, lon: -103.25 },
    'Briscoe': { lat: 34.53, lon: -101.21 },
    'Brooks': { lat: 27.03, lon: -98.22 },
    'Brown': { lat: 31.77, lon: -99.01 },
    'Burleson': { lat: 30.49, lon: -96.62 },
    'Burnet': { lat: 30.79, lon: -98.18 },
    'Caldwell': { lat: 29.84, lon: -97.62 },
    'Calhoun': { lat: 28.44, lon: -96.62 },
    'Callahan': { lat: 32.3, lon: -99.37 },
    'Cameron': { lat: 26.15, lon: -97.47 },
    'Camp': { lat: 32.97, lon: -94.98 },
    'Carson': { lat: 35.4, lon: -101.35 },
    'Cass': { lat: 33.08, lon: -94.34 },
    'Castro': { lat: 34.52, lon: -102.26 },
    'Chambers': { lat: 29.71, lon: -94.67 },
    'Cherokee': { lat: 31.84, lon: -95.16 },
    'Childress': { lat: 34.53, lon: -100.21 },
    'Clay': { lat: 33.79, lon: -98.21 },
    'Cochran': { lat: 33.6, lon: -102.83 },
    'Coke': { lat: 31.89, lon: -100.53 },
    'Coleman': { lat: 31.77, lon: -99.45 },
    'Collin': { lat: 33.19, lon: -96.57 },
    'Collingsworth': { lat: 34.96, lon: -100.27 },
    'Colorado': { lat: 29.62, lon: -96.53 },
    'Comal': { lat: 29.81, lon: -98.26 },
    'Comanche': { lat: 31.95, lon: -98.56 },
    'Concho': { lat: 31.33, lon: -99.86 },
    'Cooke': { lat: 33.64, lon: -97.21 },
    'Coryell': { lat: 31.39, lon: -97.8 },
    'Cottle': { lat: 34.08, lon: -100.28 },
    'Crane': { lat: 31.43, lon: -102.35 },
    'Crockett': { lat: 30.73, lon: -101.41 },
    'Crosby': { lat: 33.61, lon: -101.3 },
    'Culberson': { lat: 31.45, lon: -104.52 },
    'Dallam': { lat: 36.28, lon: -102.6 },
    'Dallas': { lat: 32.77, lon: -96.77 },
    'Dawson': { lat: 32.74, lon: -101.95 },
    'Deaf Smith': { lat: 34.97, lon: -102.6 },
    'Delta': { lat: 33.39, lon: -95.67 },
    'Denton': { lat: 33.2, lon: -97.12 },
    'DeWitt': { lat: 29.08, lon: -97.36 },
    'Dickens': { lat: 33.62, lon: -100.78 },
    'Dimmit': { lat: 28.42, lon: -99.76 },
    'Donley': { lat: 34.96, lon: -100.81 },
    'Duval': { lat: 27.69, lon: -98.51 },
    'Eastland': { lat: 32.33, lon: -98.83 },
    'Ector': { lat: 31.87, lon: -102.54 },
    'Edwards': { lat: 29.98, lon: -100.3 },
    'Ellis': { lat: 32.35, lon: -96.79 },
    'El Paso': { lat: 31.77, lon: -106.24 },
    'Erath': { lat: 32.24, lon: -98.22 },
    'Falls': { lat: 31.25, lon: -96.93 },
    'Fannin': { lat: 33.59, lon: -96.11 },
    'Fayette': { lat: 29.88, lon: -96.92 },
    'Fisher': { lat: 32.74, lon: -100.4 },
    'Floyd': { lat: 34.07, lon: -101.3 },
    'Foard': { lat: 33.97, lon: -99.78 },
    'Fort Bend': { lat: 29.53, lon: -95.77 },
    'Franklin': { lat: 33.18, lon: -95.22 },
    'Freestone': { lat: 31.71, lon: -96.15 },
    'Frio': { lat: 28.87, lon: -99.11 },
    'Gaines': { lat: 32.74, lon: -102.64 },
    'Galveston': { lat: 29.38, lon: -94.86 },
    'Garza': { lat: 33.18, lon: -101.3 },
    'Gillespie': { lat: 30.32, lon: -98.95 },
    'Glasscock': { lat: 31.87, lon: -101.52 },
    'Goliad': { lat: 28.66, lon: -97.42 },
    'Gonzales': { lat: 29.46, lon: -97.49 },
    'Gray': { lat: 35.4, lon: -100.81 },
    'Grayson': { lat: 33.62, lon: -96.68 },
    'Gregg': { lat: 32.48, lon: -94.82 },
    'Grimes': { lat: 30.54, lon: -95.99 },
    'Guadalupe': { lat: 29.58, lon: -97.94 },
    'Hale': { lat: 34.07, lon: -101.82 },
    'Hall': { lat: 34.53, lon: -100.68 },
    'Hamilton': { lat: 31.7, lon: -98.11 },
    'Hansford': { lat: 36.28, lon: -101.35 },
    'Hardeman': { lat: 34.29, lon: -99.75 },
    'Hardin': { lat: 30.33, lon: -94.39 },
    'Harris': { lat: 29.86, lon: -95.39 },
    'Harrison': { lat: 32.55, lon: -94.37 },
    'Hartley': { lat: 35.84, lon: -102.6 },
    'Haskell': { lat: 33.18, lon: -99.73 },
    'Hays': { lat: 30.05, lon: -98.03 },
    'Hemphill': { lat: 35.84, lon: -100.27 },
    'Henderson': { lat: 32.21, lon: -95.85 },
    'Hidalgo': { lat: 26.4, lon: -98.27 },
    'Hill': { lat: 32.0, lon: -97.13 },
    'Hockley': { lat: 33.6, lon: -102.35 },
    'Hood': { lat: 32.43, lon: -97.83 },
    'Hopkins': { lat: 33.15, lon: -95.56 },
    'Houston': { lat: 31.32, lon: -95.42 },
    'Howard': { lat: 32.31, lon: -101.43 },
    'Hudspeth': { lat: 31.46, lon: -105.39 },
    'Hunt': { lat: 33.13, lon: -96.09 },
    'Hutchinson': { lat: 35.84, lon: -101.35 },
    'Irion': { lat: 31.3, lon: -100.98 },
    'Jack': { lat: 33.23, lon: -98.17 },
    'Jackson': { lat: 28.96, lon: -96.58 },
    'Jasper': { lat: 30.74, lon: -94.02 },
    'Jeff Davis': { lat: 30.72, lon: -104.14 },
    'Jefferson': { lat: 29.86, lon: -94.14 },
    'Jim Hogg': { lat: 27.05, lon: -98.7 },
    'Jim Wells': { lat: 27.73, lon: -98.09 },
    'Johnson': { lat: 32.38, lon: -97.37 },
    'Jones': { lat: 32.74, lon: -99.88 },
    'Karnes': { lat: 28.91, lon: -97.86 },
    'Kaufman': { lat: 32.6, lon: -96.29 },
    'Kendall': { lat: 29.95, lon: -98.71 },
    'Kenedy': { lat: 26.93, lon: -97.63 },
    'Kent': { lat: 33.18, lon: -100.78 },
    'Kerr': { lat: 30.06, lon: -99.35 },
    'Kimble': { lat: 30.48, lon: -99.75 },
    'King': { lat: 33.62, lon: -100.25 },
    'Kinney': { lat: 29.35, lon: -100.42 },
    'Kleberg': { lat: 27.42, lon: -97.65 },
    'Knox': { lat: 33.61, lon: -99.74 },
    'Lamar': { lat: 33.67, lon: -95.58 },
    'Lamb': { lat: 34.07, lon: -102.35 },
    'Lampasas': { lat: 31.2, lon: -98.24 },
    'La Salle': { lat: 28.35, lon: -99.1 },
    'Lavaca': { lat: 29.38, lon: -96.93 },
    'Lee': { lat: 30.31, lon: -96.96 },
    'Leon': { lat: 31.29, lon: -95.99 },
    'Liberty': { lat: 30.15, lon: -94.81 },
    'Limestone': { lat: 31.55, lon: -96.58 },
    'Lipscomb': { lat: 36.28, lon: -100.27 },
    'Live Oak': { lat: 28.35, lon: -98.12 },
    'Llano': { lat: 30.71, lon: -98.68 },
    'Loving': { lat: 31.85, lon: -103.79 },
    'Lubbock': { lat: 33.61, lon: -101.82 },
    'Lynn': { lat: 33.18, lon: -101.82 },
    'Madison': { lat: 30.97, lon: -95.93 },
    'Marion': { lat: 32.8, lon: -94.36 },
    'Martin': { lat: 32.31, lon: -101.95 },
    'Mason': { lat: 30.72, lon: -99.23 },
    'Matagorda': { lat: 28.79, lon: -95.99 },
    'Maverick': { lat: 28.74, lon: -100.31 },
    'McCulloch': { lat: 31.2, lon: -99.35 },
    'McLennan': { lat: 31.55, lon: -97.2 },
    'McMullen': { lat: 28.35, lon: -98.57 },
    'Medina': { lat: 29.36, lon: -99.11 },
    'Menard': { lat: 30.89, lon: -99.82 },
    'Midland': { lat: 31.87, lon: -102.03 },
    'Milam': { lat: 30.79, lon: -96.98 },
    'Mills': { lat: 31.49, lon: -98.59 },
    'Mitchell': { lat: 32.31, lon: -100.92 },
    'Montague': { lat: 33.67, lon: -97.72 },
    'Montgomery': { lat: 30.3, lon: -95.5 },
    'Moore': { lat: 35.84, lon: -101.89 },
    'Morris': { lat: 33.14, lon: -94.73 },
    'Motley': { lat: 34.07, lon: -100.78 },
    'Nacogdoches': { lat: 31.61, lon: -94.62 },
    'Navarro': { lat: 32.05, lon: -96.47 },
    'Newton': { lat: 30.79, lon: -93.74 },
    'Nolan': { lat: 32.31, lon: -100.4 },
    'Nueces': { lat: 27.73, lon: -97.52 },
    'Ochiltree': { lat: 36.28, lon: -100.81 },
    'Oldham': { lat: 35.4, lon: -102.6 },
    'Orange': { lat: 30.13, lon: -93.89 },
    'Palo Pinto': { lat: 32.75, lon: -98.31 },
    'Panola': { lat: 32.16, lon: -94.31 },
    'Parker': { lat: 32.78, lon: -97.8 },
    'Parmer': { lat: 34.53, lon: -102.78 },
    'Pecos': { lat: 30.75, lon: -102.73 },
    'Polk': { lat: 30.79, lon: -94.83 },
    'Potter': { lat: 35.4, lon: -101.89 },
    'Presidio': { lat: 29.99, lon: -104.24 },
    'Rains': { lat: 32.87, lon: -95.79 },
    'Randall': { lat: 34.96, lon: -101.89 },
    'Reagan': { lat: 31.36, lon: -101.52 },
    'Real': { lat: 29.83, lon: -99.82 },
    'Red River': { lat: 33.62, lon: -95.05 },
    'Reeves': { lat: 31.32, lon: -103.69 },
    'Refugio': { lat: 28.31, lon: -97.16 },
    'Roberts': { lat: 35.84, lon: -100.81 },
    'Robertson': { lat: 31.03, lon: -96.51 },
    'Rockwall': { lat: 32.89, lon: -96.41 },
    'Runnels': { lat: 31.83, lon: -99.97 },
    'Rusk': { lat: 32.11, lon: -94.76 },
    'Sabine': { lat: 31.34, lon: -93.85 },
    'San Augustine': { lat: 31.4, lon: -94.17 },
    'San Jacinto': { lat: 30.58, lon: -95.06 },
    'San Patricio': { lat: 28.01, lon: -97.52 },
    'San Saba': { lat: 31.15, lon: -98.72 },
    'Schleicher': { lat: 30.89, lon: -100.53 },
    'Scurry': { lat: 32.74, lon: -100.92 },
    'Shackelford': { lat: 32.74, lon: -99.35 },
    'Shelby': { lat: 31.79, lon: -94.14 },
    'Sherman': { lat: 36.28, lon: -101.89 },
    'Smith': { lat: 32.38, lon: -95.27 },
    'Somervell': { lat: 32.22, lon: -97.77 },
    'Starr': { lat: 26.56, lon: -98.74 },
    'Stephens': { lat: 32.74, lon: -98.83 },
    'Sterling': { lat: 31.83, lon: -101.05 },
    'Stonewall': { lat: 33.18, lon: -100.25 },
    'Sutton': { lat: 30.49, lon: -100.53 },
    'Swisher': { lat: 34.53, lon: -101.73 },
    'Tarrant': { lat: 32.77, lon: -97.29 },
    'Taylor': { lat: 32.3, lon: -99.88 },
    'Terrell': { lat: 30.22, lon: -102.08 },
    'Terry': { lat: 33.17, lon: -102.35 },
    'Throckmorton': { lat: 33.18, lon: -99.21 },
    'Titus': { lat: 33.22, lon: -94.97 },
    'Tom Green': { lat: 31.4, lon: -100.46 },
    'Travis': { lat: 30.33, lon: -97.77 },
    'Trinity': { lat: 31.09, lon: -95.14 },
    'Tyler': { lat: 30.79, lon: -94.37 },
    'Upshur': { lat: 32.74, lon: -94.94 },
    'Upton': { lat: 31.36, lon: -102.03 },
    'Uvalde': { lat: 29.36, lon: -99.76 },
    'Val Verde': { lat: 29.89, lon: -101.15 },
    'Van Zandt': { lat: 32.56, lon: -95.84 },
    'Victoria': { lat: 28.79, lon: -96.97 },
    'Walker': { lat: 30.74, lon: -95.57 },
    'Waller': { lat: 30.01, lon: -95.99 },
    'Ward': { lat: 31.51, lon: -103.1 },
    'Washington': { lat: 30.22, lon: -96.4 },
    'Webb': { lat: 27.76, lon: -99.33 },
    'Wharton': { lat: 29.28, lon: -96.22 },
    'Wheeler': { lat: 35.4, lon: -100.27 },
    'Wichita': { lat: 33.99, lon: -98.7 },
    'Wilbarger': { lat: 34.08, lon: -99.24 },
    'Willacy': { lat: 26.47, lon: -97.59 },
    'Williamson': { lat: 30.65, lon: -97.6 },
    'Wilson': { lat: 29.17, lon: -98.08 },
    'Winkler': { lat: 31.85, lon: -103.03 },
    'Wise': { lat: 33.21, lon: -97.66 },
    'Wood': { lat: 32.79, lon: -95.38 },
    'Yoakum': { lat: 33.17, lon: -102.83 },
    'Young': { lat: 33.18, lon: -98.69 },
    'Zapata': { lat: 27.0, lon: -99.17 },
    'Zavala': { lat: 28.87, lon: -99.76 }
};

// HIFLD Transmission Lines API endpoint
const HIFLD_TRANSMISSION_API = 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/US_Electric_Power_Transmission_Lines/FeatureServer/0/query';

// Current selected region
let currentRegion = 'ERCOT';

// Regional configuration for ISO/RTOs
const regionConfig = {
    USA: {
        name: 'All US Markets',
        center: { lat: 39.0, lon: -98.0 },
        bbox: { xmin: -125, ymin: 24, xmax: -66, ymax: 50 },
        states: ['ALL'],
        scale: 1200
    },
    ERCOT: {
        name: 'ERCOT (Texas)',
        center: { lat: 31.0, lon: -99.5 },
        bbox: { xmin: -106.7, ymin: 25.8, xmax: -93.5, ymax: 36.5 },
        states: ['TX']
    },
    MISO: {
        name: 'MISO (Midwest)',
        center: { lat: 42.0, lon: -90.0 },
        bbox: { xmin: -104, ymin: 29, xmax: -82, ymax: 49 },
        states: ['ND', 'SD', 'MN', 'WI', 'MI', 'IA', 'IL', 'IN', 'MO', 'AR', 'LA', 'MS', 'KY', 'MT']
    },
    SPP: {
        name: 'SPP (Central)',
        center: { lat: 37.0, lon: -98.0 },
        bbox: { xmin: -108, ymin: 31, xmax: -90, ymax: 49 },
        states: ['NE', 'KS', 'OK', 'NM', 'SD', 'ND', 'MT', 'WY', 'MO', 'AR', 'LA', 'TX']
    },
    PJM: {
        name: 'PJM (Mid-Atlantic)',
        center: { lat: 39.5, lon: -77.0 },
        bbox: { xmin: -90, ymin: 35, xmax: -73, ymax: 43 },
        states: ['PA', 'NJ', 'DE', 'MD', 'VA', 'WV', 'OH', 'KY', 'NC', 'IN', 'IL', 'MI', 'DC']
    },
    WECC: {
        name: 'WECC (Western)',
        center: { lat: 40.0, lon: -115.0 },
        bbox: { xmin: -125, ymin: 31, xmax: -102, ymax: 49 },
        states: ['WA', 'OR', 'CA', 'NV', 'AZ', 'UT', 'CO', 'WY', 'MT', 'ID', 'NM']
    },
    SERC: {
        name: 'SERC (Southeast)',
        center: { lat: 34.0, lon: -82.0 },
        bbox: { xmin: -92, ymin: 28, xmax: -75, ymax: 39 },
        states: ['GA', 'SC', 'NC', 'FL', 'AL', 'MS', 'TN', 'KY', 'VA']
    }
};

// State centroids for mapping (approximate centers)
const stateCoordinates = {
    // ERCOT
    'TX': { lat: 31.0, lon: -99.5 },
    // MISO States
    'ND': { lat: 47.5, lon: -100.5 },
    'SD': { lat: 44.5, lon: -100.2 },
    'MN': { lat: 46.3, lon: -94.3 },
    'WI': { lat: 44.6, lon: -89.7 },
    'MI': { lat: 44.3, lon: -85.6 },
    'IA': { lat: 42.0, lon: -93.5 },
    'IL': { lat: 40.0, lon: -89.2 },
    'IN': { lat: 40.0, lon: -86.3 },
    'MO': { lat: 38.5, lon: -92.5 },
    'AR': { lat: 34.9, lon: -92.4 },
    'LA': { lat: 31.0, lon: -92.0 },
    'MS': { lat: 32.7, lon: -89.7 },
    'KY': { lat: 37.8, lon: -85.7 },
    'MT': { lat: 47.0, lon: -110.0 },
    // SPP States
    'NE': { lat: 41.5, lon: -99.8 },
    'KS': { lat: 38.5, lon: -98.4 },
    'OK': { lat: 35.5, lon: -97.5 },
    'NM': { lat: 34.4, lon: -106.1 },
    'WY': { lat: 43.0, lon: -107.5 },
    // PJM States
    'PA': { lat: 41.0, lon: -77.5 },
    'NJ': { lat: 40.2, lon: -74.7 },
    'DE': { lat: 39.0, lon: -75.5 },
    'MD': { lat: 39.0, lon: -76.8 },
    'VA': { lat: 37.5, lon: -78.8 },
    'WV': { lat: 38.9, lon: -80.5 },
    'OH': { lat: 40.4, lon: -82.8 },
    'NC': { lat: 35.5, lon: -79.8 },
    'DC': { lat: 38.9, lon: -77.0 }
};

// Cache for HIFLD transmission data per region
const hifldTransmissionCache = {};

// G-ZIP Voltage class colors (PRD spec: 230kV+ only)
// 230kV = Yellow, 345kV = Orange, 500kV+ = Red
const voltageColors = {
    '220-287': { color: 'rgba(255, 220, 50, 0.8)', width: 1.5, label: '230 kV' },
    '345': { color: 'rgba(255, 140, 0, 0.85)', width: 2.0, label: '345 kV' },
    '500': { color: 'rgba(255, 60, 30, 0.9)', width: 2.5, label: '500 kV' },
    '735 AND ABOVE': { color: 'rgba(255, 30, 30, 0.95)', width: 3.0, label: '735+ kV' },
    'DC': { color: 'rgba(0, 200, 255, 0.85)', width: 2.5, label: 'HVDC' }
};

// G-ZIP Friction Score weights (PRD spec)
const FRICTION_WEIGHTS = {
    regulatory: 0.40,
    community: 0.30,
    economic: 0.30
};

// Friction score value mappings
const FRICTION_VALUES = {
    zoning: { 'by-right': 0, 'conditional': 20, 'moratorium': 40 },
    sentiment: { 'welcoming': 0, 'neutral': 15, 'hostile': 30 },
    tax: { 'abatement': 0, 'standard': 15, 'high': 30 }
};

// ============================================
// G-ZIP COMPREHENSIVE DATA CENTER SITING DATA
// ============================================

// PRIMARY ZONE DATA - Authoritative source for key DC siting zones
// Schema: zone_id, jurisdiction, state, zone_type, friction_score, current_gw, projected_gw_2030, utility, constraint_notes
const PRIMARY_ZONES = [
    {
        zone_id: 'VA-LOU-01',
        jurisdiction: 'Loudoun County',
        state: 'VA',
        zone_type: 'Overlay_District',
        friction_score: 85,
        current_gw: 5.90,
        projected_gw_2030: 6.35,
        utility: 'Dominion',
        constraint_notes: "Zoning ended 'By-Right' use; 4+ year transmission backlog.",
        lat: 39.08,
        lon: -77.64,
        iso: 'PJM',
        market: 'NOVA'
    },
    {
        zone_id: 'VA-PWC-01',
        jurisdiction: 'Prince William Co',
        state: 'VA',
        zone_type: 'Overlay_District',
        friction_score: 95,
        current_gw: 2.75,
        projected_gw_2030: 5.15,
        utility: 'Dominion',
        constraint_notes: 'Digital Gateway (2.1GW) overturned by court in Aug 2025.',
        lat: 38.70,
        lon: -77.48,
        iso: 'PJM',
        market: 'NOVA'
    },
    {
        zone_id: 'MD-FRE-01',
        jurisdiction: 'Frederick County',
        state: 'MD',
        zone_type: 'Critical_Infra_Zone',
        friction_score: 60,
        current_gw: 0.20,
        projected_gw_2030: 1.50,
        utility: 'Potomac Ed',
        constraint_notes: 'Limited to 2600 acres (Adamstown); 1% land cap enforced.',
        lat: 39.47,
        lon: -77.41,
        iso: 'PJM',
        market: 'NOVA'
    },
    {
        zone_id: 'AZ-MAR-01',
        jurisdiction: 'Maricopa County',
        state: 'AZ',
        zone_type: 'Industrial_Zone',
        friction_score: 55,
        current_gw: 3.44,
        projected_gw_2030: 5.97,
        utility: 'APS/SRP',
        constraint_notes: 'Water priority restrictions; only IND-2/IND-3 zoning allowed.',
        lat: 33.35,
        lon: -112.49,
        iso: 'WECC',
        market: 'PHX'
    },
    {
        zone_id: 'OH-COL-01',
        jurisdiction: 'New Albany',
        state: 'OH',
        zone_type: 'Business_Park',
        friction_score: 40,
        current_gw: 1.25,
        projected_gw_2030: 3.00,
        utility: 'AEP Ohio',
        constraint_notes: "New tariff requires 85% take-or-pay; 'Financial Friction' only.",
        lat: 40.09,
        lon: -82.80,
        iso: 'PJM',
        market: 'CMH'
    },
    {
        zone_id: 'GA-ATL-01',
        jurisdiction: 'Fulton/Douglas',
        state: 'GA',
        zone_type: 'Metro_Cluster',
        friction_score: 70,
        current_gw: 0.88,
        projected_gw_2030: 2.99,
        utility: 'Georgia Power',
        constraint_notes: 'Atlanta City Council requiring Special Use permits; 705MW absorbed 2024.',
        lat: 33.75,
        lon: -84.58,
        iso: 'SERC',
        market: 'ATL'
    },
    {
        zone_id: 'IL-CHI-01',
        jurisdiction: 'Cook County',
        state: 'IL',
        zone_type: 'Incentive_Zone',
        friction_score: 45,
        current_gw: 1.48,
        projected_gw_2030: 2.00,
        utility: 'ComEd',
        constraint_notes: '27 active tax-exempt projects; capacity shortfall forecast by 2029.',
        lat: 41.84,
        lon: -87.82,
        iso: 'PJM',
        market: 'CHI'
    },
    {
        zone_id: 'WY-EVA-01',
        jurisdiction: 'Evanston',
        state: 'WY',
        zone_type: 'Hyperscale_Campus',
        friction_score: 10,
        current_gw: 0.00,
        projected_gw_2030: 1.20,
        utility: 'Rocky Mtn Power',
        constraint_notes: 'Prometheus Hyperscale project; Carbon-negative branding; High welcome.',
        lat: 41.27,
        lon: -110.96,
        iso: 'WECC',
        market: 'WY'
    },
    {
        zone_id: 'TX-DAL-01',
        jurisdiction: 'Dallas/Fort Worth',
        state: 'TX',
        zone_type: 'Industrial_Hub',
        friction_score: 30,
        current_gw: 1.29,
        projected_gw_2030: 2.91,
        utility: 'Oncor (ERCOT)',
        constraint_notes: 'Low reg friction; constraint is purely transmission line build speed.',
        lat: 32.85,
        lon: -96.85,
        iso: 'ERCOT',
        market: 'DFW'
    },
    {
        zone_id: 'OR-MOR-01',
        jurisdiction: 'Morrow County',
        state: 'OR',
        zone_type: 'Enterprise_Zone',
        friction_score: 25,
        current_gw: 1.18,
        projected_gw_2030: 1.50,
        utility: 'Umatilla Elec',
        constraint_notes: 'Hydro-heavy; very welcoming to AWS/Google expansions.',
        lat: 45.48,
        lon: -119.55,
        iso: 'WECC',
        market: 'PDX'
    }
];

// Create lookup map for primary zones by jurisdiction
const PRIMARY_ZONE_MAP = {};
PRIMARY_ZONES.forEach(zone => {
    const key = `${zone.jurisdiction.replace(/\s+/g, '_')}_${zone.state}`;
    PRIMARY_ZONE_MAP[key] = zone;
});

// Market Regions with GW-scale load capacity
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
    'OMA': { name: 'Omaha', rank: 24, iso: 'SPP', currentGW: 0.1, projectedGW_2028: 0.35, pipelineGW: 0.25 },
    'WY': { name: 'Wyoming', rank: 25, iso: 'WECC', currentGW: 0.0, projectedGW_2028: 1.2, pipelineGW: 1.2 }
};

// Comprehensive County Friction Data (120+ counties across 24 markets)
const countyFrictionData = {
    // NORTHERN VIRGINIA (PJM)
    'Loudoun_VA': { lat: 39.08, lon: -77.64, market: 'NOVA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 2800, projectedMW: 4500, overlay: true, oz: true },
    'Prince William_VA': { lat: 38.70, lon: -77.48, market: 'NOVA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 850, projectedMW: 2200, overlay: true, oz: true },
    'Fairfax_VA': { lat: 38.85, lon: -77.27, market: 'NOVA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 450, projectedMW: 700, overlay: false, oz: true },
    'Fauquier_VA': { lat: 38.72, lon: -77.81, market: 'NOVA', zoning: 'conditional', sentiment: 'hostile', tax: 'standard', frictionScore: 68, currentMW: 50, projectedMW: 150, overlay: false, oz: false },
    'Stafford_VA': { lat: 38.42, lon: -77.45, market: 'NOVA', zoning: 'conditional', sentiment: 'welcoming', tax: 'abatement', frictionScore: 24, currentMW: 100, projectedMW: 400, overlay: false, oz: true },
    // MARYLAND
    'Frederick_MD': { lat: 39.47, lon: -77.41, market: 'NOVA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 80, projectedMW: 250, overlay: true, oz: true },
    'Montgomery_MD': { lat: 39.14, lon: -77.20, market: 'NOVA', zoning: 'moratorium', sentiment: 'hostile', tax: 'high', frictionScore: 100, currentMW: 120, projectedMW: 120, overlay: false, oz: false },
    'Howard_MD': { lat: 39.25, lon: -76.93, market: 'NOVA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 150, overlay: false, oz: true },
    'Anne Arundel_MD': { lat: 38.95, lon: -76.56, market: 'NOVA', zoning: 'conditional', sentiment: 'welcoming', tax: 'abatement', frictionScore: 24, currentMW: 40, projectedMW: 120, overlay: false, oz: true },
    // DALLAS-FORT WORTH (ERCOT)
    'Dallas_TX': { lat: 32.77, lon: -96.80, market: 'DFW', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 650, projectedMW: 1100, overlay: false, oz: true },
    'Collin_TX': { lat: 33.19, lon: -96.57, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 380, projectedMW: 950, overlay: true, oz: true },
    'Denton_TX': { lat: 33.21, lon: -97.13, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 280, projectedMW: 700, overlay: true, oz: true },
    'Tarrant_TX': { lat: 32.77, lon: -97.29, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'standard', frictionScore: 13, currentMW: 320, projectedMW: 650, overlay: false, oz: true },
    'Ellis_TX': { lat: 32.35, lon: -96.79, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 150, projectedMW: 500, overlay: false, oz: true },
    'Kaufman_TX': { lat: 32.60, lon: -96.29, market: 'DFW', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 400, overlay: true, oz: false },
    'Rockwall_TX': { lat: 32.89, lon: -96.41, market: 'DFW', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 80, overlay: false, oz: false },
    // HOUSTON (ERCOT)
    'Harris_TX': { lat: 29.79, lon: -95.39, market: 'HOU', zoning: 'by-right', sentiment: 'welcoming', tax: 'standard', frictionScore: 13, currentMW: 420, projectedMW: 1100, overlay: false, oz: true },
    'Fort Bend_TX': { lat: 29.53, lon: -95.77, market: 'HOU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 350, overlay: false, oz: true },
    'Montgomery_TX': { lat: 30.32, lon: -95.50, market: 'HOU', zoning: 'by-right', sentiment: 'neutral', tax: 'standard', frictionScore: 22, currentMW: 60, projectedMW: 200, overlay: false, oz: false },
    'Brazoria_TX': { lat: 29.17, lon: -95.43, market: 'HOU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 200, overlay: false, oz: true },
    // AUSTIN (ERCOT)
    'Travis_TX': { lat: 30.27, lon: -97.74, market: 'AUS', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 280, projectedMW: 500, overlay: false, oz: true },
    'Williamson_TX': { lat: 30.65, lon: -97.60, market: 'AUS', zoning: 'by-right', sentiment: 'neutral', tax: 'abatement', frictionScore: 22, currentMW: 120, projectedMW: 450, overlay: true, oz: true },
    'Hays_TX': { lat: 30.05, lon: -98.00, market: 'AUS', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 180, overlay: false, oz: true },
    'Bastrop_TX': { lat: 30.11, lon: -97.32, market: 'AUS', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 60, projectedMW: 280, overlay: false, oz: true },
    // SAN ANTONIO (ERCOT)
    'Bexar_TX': { lat: 29.45, lon: -98.52, market: 'SAT', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 180, projectedMW: 500, overlay: false, oz: true },
    'Comal_TX': { lat: 29.81, lon: -98.26, market: 'SAT', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: false, oz: false },
    'Guadalupe_TX': { lat: 29.58, lon: -97.95, market: 'SAT', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    // PHOENIX (WECC)
    'Maricopa_AZ': { lat: 33.35, lon: -112.49, market: 'PHX', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 1200, projectedMW: 2800, overlay: true, oz: true },
    'Pinal_AZ': { lat: 32.90, lon: -111.35, market: 'PHX', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 150, projectedMW: 350, overlay: false, oz: true },
    'Pima_AZ': { lat: 32.10, lon: -111.68, market: 'PHX', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 100, overlay: false, oz: true },
    // CHICAGO (PJM/MISO)
    'Cook_IL': { lat: 41.84, lon: -87.82, market: 'CHI', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 350, projectedMW: 650, overlay: false, oz: true },
    'DuPage_IL': { lat: 41.85, lon: -88.09, market: 'CHI', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 200, projectedMW: 450, overlay: false, oz: true },
    'Will_IL': { lat: 41.45, lon: -87.98, market: 'CHI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 120, projectedMW: 400, overlay: true, oz: true },
    'Kane_IL': { lat: 41.94, lon: -88.43, market: 'CHI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 250, overlay: false, oz: true },
    'Lake_IL': { lat: 42.35, lon: -87.96, market: 'CHI', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 120, overlay: false, oz: false },
    // ATLANTA (SERC)
    'Fulton_GA': { lat: 33.79, lon: -84.39, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 280, projectedMW: 500, overlay: false, oz: true },
    'Douglas_GA': { lat: 33.70, lon: -84.77, market: 'ATL', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 180, projectedMW: 550, overlay: true, oz: true },
    'Cobb_GA': { lat: 33.94, lon: -84.58, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 120, projectedMW: 250, overlay: false, oz: true },
    'DeKalb_GA': { lat: 33.77, lon: -84.23, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 100, projectedMW: 200, overlay: false, oz: true },
    'Gwinnett_GA': { lat: 33.96, lon: -84.02, market: 'ATL', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 80, projectedMW: 200, overlay: false, oz: true },
    'Henry_GA': { lat: 33.45, lon: -84.15, market: 'ATL', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 50, projectedMW: 200, overlay: false, oz: true },
    // COLUMBUS (PJM)
    'Franklin_OH': { lat: 39.97, lon: -83.00, market: 'CMH', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 200, projectedMW: 550, overlay: true, oz: true },
    'Licking_OH': { lat: 40.09, lon: -82.45, market: 'CMH', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 120, projectedMW: 450, overlay: true, oz: true },
    'Delaware_OH': { lat: 40.28, lon: -83.07, market: 'CMH', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 40, projectedMW: 120, overlay: false, oz: false },
    'Union_OH': { lat: 40.30, lon: -83.38, market: 'CMH', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 30, projectedMW: 150, overlay: false, oz: true },
    'Madison_OH': { lat: 39.89, lon: -83.40, market: 'CMH', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    // SILICON VALLEY (CAISO)
    'Santa Clara_CA': { lat: 37.36, lon: -121.97, market: 'SV', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 500, projectedMW: 700, overlay: false, oz: true },
    'San Mateo_CA': { lat: 37.43, lon: -122.35, market: 'SV', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 120, projectedMW: 200, overlay: false, oz: true },
    'Alameda_CA': { lat: 37.65, lon: -121.92, market: 'SV', zoning: 'conditional', sentiment: 'neutral', tax: 'high', frictionScore: 56, currentMW: 80, projectedMW: 150, overlay: false, oz: true },
    // LAS VEGAS (WECC)
    'Clark_NV': { lat: 36.21, lon: -115.02, market: 'LAS', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 250, projectedMW: 700, overlay: true, oz: true },
    'Nye_NV': { lat: 38.04, lon: -117.07, market: 'LAS', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 50, projectedMW: 180, overlay: false, oz: true },
    // RENO (WECC)
    'Washoe_NV': { lat: 39.65, lon: -119.75, market: 'RNO', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 150, projectedMW: 450, overlay: true, oz: true },
    'Storey_NV': { lat: 39.40, lon: -119.53, market: 'RNO', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: true, oz: true },
    'Lyon_NV': { lat: 39.02, lon: -119.19, market: 'RNO', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    // SALT LAKE CITY (WECC)
    'Salt Lake_UT': { lat: 40.67, lon: -111.93, market: 'SLC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 280, projectedMW: 650, overlay: false, oz: true },
    'Utah_UT': { lat: 40.12, lon: -111.67, market: 'SLC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 250, overlay: true, oz: true },
    'Tooele_UT': { lat: 40.45, lon: -112.90, market: 'SLC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    'Davis_UT': { lat: 41.00, lon: -112.00, market: 'SLC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 50, overlay: false, oz: false },
    // DENVER (WECC)
    'Douglas_CO': { lat: 39.33, lon: -104.93, market: 'DEN', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 150, projectedMW: 350, overlay: false, oz: false },
    'Arapahoe_CO': { lat: 39.65, lon: -104.34, market: 'DEN', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 100, projectedMW: 280, overlay: false, oz: true },
    'Adams_CO': { lat: 39.87, lon: -104.33, market: 'DEN', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: false, oz: true },
    'Jefferson_CO': { lat: 39.59, lon: -105.25, market: 'DEN', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 60, overlay: false, oz: true },
    'Weld_CO': { lat: 40.55, lon: -104.39, market: 'DEN', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    // PORTLAND (WECC)
    'Washington_OR': { lat: 45.56, lon: -123.11, market: 'PDX', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 280, projectedMW: 700, overlay: true, oz: true },
    'Multnomah_OR': { lat: 45.55, lon: -122.42, market: 'PDX', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 50, projectedMW: 80, overlay: false, oz: true },
    'Clackamas_OR': { lat: 45.19, lon: -122.22, market: 'PDX', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 100, overlay: false, oz: true },
    // SEATTLE (WECC)
    'King_WA': { lat: 47.49, lon: -121.84, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 280, projectedMW: 500, overlay: false, oz: true },
    'Pierce_WA': { lat: 47.04, lon: -122.14, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 40, projectedMW: 120, overlay: false, oz: true },
    'Snohomish_WA': { lat: 48.04, lon: -121.75, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 80, overlay: false, oz: false },
    'Kitsap_WA': { lat: 47.64, lon: -122.65, market: 'SEA', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 10, projectedMW: 30, overlay: false, oz: true },
    // MINNEAPOLIS (MISO)
    'Hennepin_MN': { lat: 45.00, lon: -93.47, market: 'MSP', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 120, projectedMW: 280, overlay: false, oz: true },
    'Ramsey_MN': { lat: 45.02, lon: -93.10, market: 'MSP', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 100, overlay: false, oz: true },
    'Dakota_MN': { lat: 44.67, lon: -93.07, market: 'MSP', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 30, projectedMW: 120, overlay: false, oz: true },
    'Anoka_MN': { lat: 45.27, lon: -93.25, market: 'MSP', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 10, projectedMW: 40, overlay: false, oz: false },
    // KANSAS CITY (SPP)
    'Johnson_KS': { lat: 38.88, lon: -94.82, market: 'MCI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 250, overlay: false, oz: true },
    'Jackson_MO': { lat: 39.05, lon: -94.35, market: 'MCI', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 120, overlay: false, oz: true },
    'Wyandotte_KS': { lat: 39.11, lon: -94.76, market: 'MCI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    'Leavenworth_KS': { lat: 39.19, lon: -95.00, market: 'MCI', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    // OMAHA (SPP)
    'Douglas_NE': { lat: 41.29, lon: -96.15, market: 'OMA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 280, overlay: false, oz: true },
    'Sarpy_NE': { lat: 41.11, lon: -96.11, market: 'OMA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    'Washington_NE': { lat: 41.53, lon: -96.22, market: 'OMA', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    // NEW YORK/NEW JERSEY (NYISO/PJM)
    'Hudson_NJ': { lat: 40.73, lon: -74.08, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 180, projectedMW: 300, overlay: false, oz: true },
    'Essex_NJ': { lat: 40.79, lon: -74.25, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 80, projectedMW: 150, overlay: false, oz: true },
    'Bergen_NJ': { lat: 40.96, lon: -74.07, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 120, overlay: false, oz: false },
    'Middlesex_NJ': { lat: 40.44, lon: -74.39, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 100, projectedMW: 220, overlay: false, oz: true },
    'Somerset_NJ': { lat: 40.57, lon: -74.62, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 80, projectedMW: 180, overlay: false, oz: true },
    'Westchester_NY': { lat: 41.12, lon: -73.76, market: 'NYC', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 50, projectedMW: 80, overlay: false, oz: true },
    'Queens_NY': { lat: 40.73, lon: -73.82, market: 'NYC', zoning: 'conditional', sentiment: 'neutral', tax: 'high', frictionScore: 56, currentMW: 40, projectedMW: 70, overlay: false, oz: true },
    'Nassau_NY': { lat: 40.74, lon: -73.59, market: 'NYC', zoning: 'conditional', sentiment: 'hostile', tax: 'high', frictionScore: 68, currentMW: 30, projectedMW: 50, overlay: false, oz: false },
    // RICHMOND (PJM)
    'Henrico_VA': { lat: 37.55, lon: -77.35, market: 'RIC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 80, projectedMW: 280, overlay: true, oz: true },
    'Chesterfield_VA': { lat: 37.38, lon: -77.58, market: 'RIC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: false, oz: true },
    'Hanover_VA': { lat: 37.77, lon: -77.48, market: 'RIC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 50, overlay: false, oz: false },
    'Goochland_VA': { lat: 37.69, lon: -77.91, market: 'RIC', zoning: 'conditional', sentiment: 'neutral', tax: 'abatement', frictionScore: 33, currentMW: 10, projectedMW: 40, overlay: false, oz: true },
    // INDIANAPOLIS (MISO)
    'Marion_IN': { lat: 39.78, lon: -86.15, market: 'IND', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 60, projectedMW: 180, overlay: false, oz: true },
    'Hamilton_IN': { lat: 40.05, lon: -86.02, market: 'IND', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 150, overlay: true, oz: true },
    'Hendricks_IN': { lat: 39.77, lon: -86.52, market: 'IND', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 80, overlay: false, oz: true },
    'Boone_IN': { lat: 40.05, lon: -86.47, market: 'IND', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 50, overlay: false, oz: true },
    // SOUTH CAROLINA (SERC)
    'Berkeley_SC': { lat: 33.20, lon: -79.95, market: 'SC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 40, projectedMW: 200, overlay: true, oz: true },
    'Dorchester_SC': { lat: 33.08, lon: -80.22, market: 'SC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 20, projectedMW: 100, overlay: false, oz: true },
    'Charleston_SC': { lat: 32.85, lon: -79.98, market: 'SC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 30, projectedMW: 80, overlay: false, oz: true },
    'Lexington_SC': { lat: 33.90, lon: -81.24, market: 'SC', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 80, overlay: false, oz: true },
    'Richland_SC': { lat: 34.02, lon: -80.90, market: 'SC', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 20, projectedMW: 50, overlay: false, oz: true },
    // RESEARCH TRIANGLE (SERC)
    'Wake_NC': { lat: 35.79, lon: -78.64, market: 'RDU', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 100, projectedMW: 280, overlay: false, oz: true },
    'Durham_NC': { lat: 36.00, lon: -78.90, market: 'RDU', zoning: 'conditional', sentiment: 'neutral', tax: 'standard', frictionScore: 44, currentMW: 50, projectedMW: 120, overlay: false, oz: true },
    'Orange_NC': { lat: 36.07, lon: -79.12, market: 'RDU', zoning: 'conditional', sentiment: 'hostile', tax: 'standard', frictionScore: 56, currentMW: 10, projectedMW: 30, overlay: false, oz: false },
    'Chatham_NC': { lat: 35.71, lon: -79.35, market: 'RDU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 80, overlay: true, oz: true },
    'Johnston_NC': { lat: 35.52, lon: -78.37, market: 'RDU', zoning: 'by-right', sentiment: 'welcoming', tax: 'abatement', frictionScore: 0, currentMW: 10, projectedMW: 60, overlay: false, oz: true }
};

// Generate opportunity zones from county data (counties with oz: true)
const opportunityZones = Object.entries(countyFrictionData)
    .filter(([_, data]) => data.oz)
    .map(([key, data]) => {
        const [county, state] = key.split('_');
        return {
            id: `oz-${key}`,
            name: `${county} Opportunity Zone`,
            state: state,
            center: { lat: data.lat, lon: data.lon },
            radius: Math.max(0.05, Math.min(0.15, data.currentMW / 3000))
        };
    });

// Generate overlay districts from county data (counties with overlay: true)
const dataCenterOverlayDistricts = Object.entries(countyFrictionData)
    .filter(([_, data]) => data.overlay)
    .map(([key, data]) => {
        const [county, state] = key.split('_');
        const market = DC_MARKET_REGIONS[data.market];
        return {
            id: `overlay-${key}`,
            name: `${county} DC Zone`,
            county: county,
            state: state,
            market: data.market,
            type: 'overlay',
            bounds: {
                north: data.lat + 0.15,
                south: data.lat - 0.15,
                east: data.lon + 0.2,
                west: data.lon - 0.2
            },
            incentives: { tax_break: data.tax === 'abatement', expedited_permits: data.zoning === 'by-right' },
            frictionAttrs: { zoning: data.zoning, sentiment: data.sentiment, tax: data.tax }
        };
    });

// Dataset summary statistics - combining PRIMARY_ZONES and countyFrictionData
const DATASET_SUMMARY = {
    // Primary zones (authoritative data)
    primaryZones: PRIMARY_ZONES.length,
    primaryCurrentGW: PRIMARY_ZONES.reduce((sum, z) => sum + z.current_gw, 0),
    primaryProjectedGW: PRIMARY_ZONES.reduce((sum, z) => sum + z.projected_gw_2030, 0),
    primaryAvgFriction: Math.round(PRIMARY_ZONES.reduce((sum, z) => sum + z.friction_score, 0) / PRIMARY_ZONES.length),
    // Secondary county data
    totalCounties: Object.keys(countyFrictionData).length,
    totalMarkets: Object.keys(DC_MARKET_REGIONS).length,
    sweetSpotCounties: PRIMARY_ZONES.filter(z => z.friction_score <= 30).length,
    lowFrictionCounties: PRIMARY_ZONES.filter(z => z.friction_score > 30 && z.friction_score <= 50).length,
    moderateCounties: PRIMARY_ZONES.filter(z => z.friction_score > 50 && z.friction_score <= 70).length,
    highFrictionCounties: PRIMARY_ZONES.filter(z => z.friction_score > 70).length,
    // Use PRIMARY_ZONES GW data as authoritative source
    totalCurrentGW: PRIMARY_ZONES.reduce((sum, z) => sum + z.current_gw, 0),
    totalProjectedGW: PRIMARY_ZONES.reduce((sum, z) => sum + z.projected_gw_2030, 0),
    overlayDistricts: Object.values(countyFrictionData).filter(c => c.overlay).length,
    opportunityZones: Object.values(countyFrictionData).filter(c => c.oz).length
};

// Calculate Friction Score from attributes
function calculateFrictionScore(attrs) {
    const zoningScore = FRICTION_VALUES.zoning[attrs.zoning] || 20;
    const sentimentScore = FRICTION_VALUES.sentiment[attrs.sentiment] || 15;
    const taxScore = FRICTION_VALUES.tax[attrs.tax] || 15;
    
    return Math.round(
        (zoningScore * FRICTION_WEIGHTS.regulatory +
         sentimentScore * FRICTION_WEIGHTS.community +
         taxScore * FRICTION_WEIGHTS.economic) * (100 / 40)
    );
}

// Get friction color based on score (0=green, 50=yellow, 100=red)
function getFrictionColor(score) {
    if (score <= 20) return 'rgba(34, 197, 94, 0.6)';  // Green - Sweet Spot
    if (score <= 40) return 'rgba(132, 204, 22, 0.6)'; // Lime
    if (score <= 60) return 'rgba(250, 204, 21, 0.6)'; // Yellow
    if (score <= 80) return 'rgba(249, 115, 22, 0.6)'; // Orange
    return 'rgba(239, 68, 68, 0.6)';                    // Red - High Friction
}

let hifldLoadingPromise = null;

// Fetch HIFLD transmission lines for selected region
async function fetchHIFLDTransmissionLines() {
    const region = currentRegion;
    const bbox = regionConfig[region].bbox;
    
    // Check cache for this region
    if (hifldTransmissionCache[region]) {
        return hifldTransmissionCache[region];
    }
    
    if (hifldLoadingPromise) {
        return hifldLoadingPromise;
    }
    
    hifldLoadingPromise = (async () => {
        try {
            console.log(`Fetching HIFLD transmission lines for ${region}...`);
            
            // Query parameters - get lines within region bbox, voltage >= 230kV (G-ZIP spec)
            const params = new URLSearchParams({
                where: "VOLTAGE >= 230",
                geometry: JSON.stringify({
                    xmin: bbox.xmin,
                    ymin: bbox.ymin,
                    xmax: bbox.xmax,
                    ymax: bbox.ymax,
                    spatialReference: { wkid: 4326 }
                }),
                geometryType: 'esriGeometryEnvelope',
                spatialRel: 'esriSpatialRelIntersects',
                outFields: 'OBJECTID,VOLTAGE,VOLT_CLASS,OWNER,STATUS,TYPE',
                returnGeometry: true,
                f: 'geojson',
                outSR: '4326'
            });
            
            const response = await fetch(`${HIFLD_TRANSMISSION_API}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HIFLD API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Loaded ${data.features?.length || 0} transmission line segments for ${region}`);
            
            hifldTransmissionCache[region] = data;
            return data;
        } catch (error) {
            console.error('Error fetching HIFLD data:', error);
            // Return fallback data on error
            return { features: [] };
        } finally {
            hifldLoadingPromise = null;
        }
    })();
    
    return hifldLoadingPromise;
}

// Get selected voltage classes from checkboxes
function getSelectedVoltageClasses() {
    const selected = new Set();
    document.querySelectorAll('.voltage-checkbox:checked').forEach(cb => {
        const voltage = cb.dataset.voltage;
        // Map checkbox values to HIFLD VOLT_CLASS values
        if (voltage === '500') {
            selected.add('500');
            selected.add('735 AND ABOVE');
        } else if (voltage === '345') {
            selected.add('345');
        } else if (voltage === '220-287') {
            selected.add('220-287');
        } else if (voltage === '100-161') {
            selected.add('100-161');
        } else if (voltage === 'UNDER 100') {
            selected.add('UNDER 100');
        }
    });
    return selected;
}

// Get selected BESS layer types from checkboxes
function getSelectedBessLayers() {
    const selected = new Set();
    const solarCb = document.querySelector('.layer-checkbox[data-layer="solar"]');
    const standaloneCb = document.querySelector('.layer-checkbox[data-layer="standalone"]');
    const windCb = document.querySelector('.layer-checkbox[data-layer="wind"]');
    
    // If checkboxes don't exist yet, return all layers
    if (!solarCb && !standaloneCb && !windCb) {
        return new Set(['solar', 'standalone', 'wind']);
    }
    
    if (solarCb?.checked) selected.add('solar');
    if (standaloneCb?.checked) selected.add('standalone');
    if (windCb?.checked) selected.add('wind');
    return selected;
}

// Get selected Load years from checkboxes
function getSelectedLoadYears() {
    const selected = new Set();
    const cb2026 = document.querySelector('.layer-checkbox[data-layer="loads-2026"]');
    const cb2028 = document.querySelector('.layer-checkbox[data-layer="loads-2028"]');
    const cb2030 = document.querySelector('.layer-checkbox[data-layer="loads-2030"]');
    
    // If checkboxes don't exist yet, return all years
    if (!cb2026 && !cb2028 && !cb2030) {
        return new Set(['2026', '2028', '2030']);
    }
    
    if (cb2026?.checked) selected.add('2026');
    if (cb2028?.checked) selected.add('2028');
    if (cb2030?.checked) selected.add('2030');
    return selected;
}

// Process HIFLD GeoJSON into Plotly traces (filtered by selected voltage classes)
function processHIFLDToTraces(geojsonData) {
    const tracesByVoltage = {};
    const selectedVoltages = getSelectedVoltageClasses();
    
    if (!geojsonData.features) return [];
    
    geojsonData.features.forEach(feature => {
        const voltClass = feature.properties.VOLT_CLASS || 'NOT AVAILABLE';
        const voltage = feature.properties.VOLTAGE || 0;
        const owner = feature.properties.OWNER || 'Unknown';
        const coords = feature.geometry?.coordinates;
        
        // Skip if voltage class is not selected
        if (!selectedVoltages.has(voltClass)) return;
        
        if (!coords || coords.length < 2) return;
        
        if (!tracesByVoltage[voltClass]) {
            tracesByVoltage[voltClass] = {
                lats: [],
                lons: [],
                texts: []
            };
        }
        
        // For LineString geometry
        if (feature.geometry.type === 'LineString') {
            coords.forEach(coord => {
                tracesByVoltage[voltClass].lons.push(coord[0]);
                tracesByVoltage[voltClass].lats.push(coord[1]);
            });
            // Add null to create line breaks between segments
            tracesByVoltage[voltClass].lons.push(null);
            tracesByVoltage[voltClass].lats.push(null);
            tracesByVoltage[voltClass].texts.push(`${voltage}kV - ${owner}`);
        }
        // For MultiLineString geometry
        else if (feature.geometry.type === 'MultiLineString') {
            coords.forEach(line => {
                line.forEach(coord => {
                    tracesByVoltage[voltClass].lons.push(coord[0]);
                    tracesByVoltage[voltClass].lats.push(coord[1]);
                });
                tracesByVoltage[voltClass].lons.push(null);
                tracesByVoltage[voltClass].lats.push(null);
            });
            tracesByVoltage[voltClass].texts.push(`${voltage}kV - ${owner}`);
        }
    });
    
    // Convert to Plotly traces
    const traces = [];
    const voltageOrder = ['735 AND ABOVE', '500', '345', '220-287', '100-161', 'UNDER 100', 'DC', 'NOT AVAILABLE'];
    
    voltageOrder.forEach(voltClass => {
        if (tracesByVoltage[voltClass] && tracesByVoltage[voltClass].lats.length > 0) {
            const style = voltageColors[voltClass] || voltageColors['NOT AVAILABLE'];
            traces.push({
                type: 'scattergeo',
                lat: tracesByVoltage[voltClass].lats,
                lon: tracesByVoltage[voltClass].lons,
                mode: 'lines',
                name: `${voltClass} kV`,
                legendgroup: 'transmission',
                line: {
                    width: style.width,
                    color: style.color
                },
                hoverinfo: 'text',
                text: voltClass + ' kV Transmission'
            });
        }
    });
    
    return traces;
}

// Create scatter map for Counties Navigator tab
async function createScatterMap() {
    const showBessEl = document.getElementById('showBessLayer');
    const showLoadsEl = document.getElementById('showLoadsLayer');
    const showTransmissionEl = document.getElementById('showTransmissionLayer');
    const sizeByCapacityEl = document.getElementById('sizeByCapacity');
    const showZonesEl = document.getElementById('showZonesLayer');
    const showFrictionEl = document.getElementById('showFrictionLayer');
    
    // Default to true if checkbox doesn't exist or is checked
    const showBess = showBessEl ? showBessEl.checked : true;
    const showLoads = showLoadsEl ? showLoadsEl.checked : true;
    const showTransmission = showTransmissionEl ? showTransmissionEl.checked : true;
    const sizeByCapacity = sizeByCapacityEl ? sizeByCapacityEl.checked : true;
    const showZones = showZonesEl ? showZonesEl.checked : true;
    const showFriction = showFrictionEl ? showFrictionEl.checked : true;
    
    const traces = [];
    
    // G-ZIP: Add PRIMARY ZONES layer (authoritative high-priority zones with detailed data)
    if (showFriction) {
        const primaryTraceData = { lat: [], lon: [], text: [], color: [], size: [] };
        
        PRIMARY_ZONES.forEach(zone => {
            primaryTraceData.lat.push(zone.lat);
            primaryTraceData.lon.push(zone.lon);
            primaryTraceData.color.push(zone.friction_score);
            // Size based on projected GW capacity (larger = more capacity)
            primaryTraceData.size.push(Math.max(20, Math.min(50, zone.projected_gw_2030 * 8)));
            primaryTraceData.text.push(
                `<b>🎯 ${zone.zone_id}</b><br>` +
                `<b>${zone.jurisdiction}, ${zone.state}</b><br>` +
                `<b>Zone Type:</b> ${zone.zone_type.replace(/_/g, ' ')}<br>` +
                `<b>Friction Score:</b> ${zone.friction_score}/100<br>` +
                `<b>Current Load:</b> ${zone.current_gw.toFixed(2)} GW<br>` +
                `<b>Projected 2030:</b> ${zone.projected_gw_2030.toFixed(2)} GW<br>` +
                `<b>Utility:</b> ${zone.utility}<br>` +
                `<b>ISO:</b> ${zone.iso}<br>` +
                `<b>⚠️ Constraints:</b> ${zone.constraint_notes}`
            );
        });
        
        // Add PRIMARY ZONES trace (diamond markers for emphasis)
        if (primaryTraceData.lat.length > 0) {
            traces.push({
                type: 'scattergeo',
                lat: primaryTraceData.lat,
                lon: primaryTraceData.lon,
                mode: 'markers',
                name: 'Primary Zones',
                legendgroup: 'primary',
                hovertemplate: '%{text}<extra></extra>',
                text: primaryTraceData.text,
                marker: {
                    size: primaryTraceData.size,
                    color: primaryTraceData.color,
                    colorscale: [
                        [0, 'rgb(34, 197, 94)'],
                        [0.25, 'rgb(132, 204, 22)'],
                        [0.5, 'rgb(250, 204, 21)'],
                        [0.75, 'rgb(249, 115, 22)'],
                        [1, 'rgb(239, 68, 68)']
                    ],
                    cmin: 0,
                    cmax: 100,
                    opacity: 0.9,
                    symbol: 'diamond',
                    line: { width: 2, color: '#ffffff' }
                }
            });
        }
        
        // G-ZIP: Add secondary county friction data (smaller markers)
        const frictionTraceData = { lat: [], lon: [], text: [], color: [], size: [] };
        
        Object.entries(countyFrictionData).forEach(([key, data]) => {
            const [county, state] = key.split('_');
            const market = DC_MARKET_REGIONS[data.market] || {};
            // Use lat/lon directly from the comprehensive data
            frictionTraceData.lat.push(data.lat);
            frictionTraceData.lon.push(data.lon);
            frictionTraceData.color.push(data.frictionScore);
            // Size based on projected capacity
            frictionTraceData.size.push(Math.max(10, Math.min(30, data.projectedMW / 60)));
            frictionTraceData.text.push(
                `<b>${county}, ${state}</b><br>` +
                `<b>Market:</b> ${market.name || data.market}<br>` +
                `<b>Friction Score:</b> ${data.frictionScore}/100<br>` +
                `<b>Current Load:</b> ${data.currentMW} MW<br>` +
                `<b>Projected 2028:</b> ${data.projectedMW} MW<br>` +
                `<b>Zoning:</b> ${data.zoning}<br>` +
                `<b>Sentiment:</b> ${data.sentiment}<br>` +
                `<b>Tax:</b> ${data.tax}` +
                (data.overlay ? '<br>✓ Overlay District' : '') +
                (data.oz ? '<br>✓ Opportunity Zone' : '')
            );
        });
        
        if (frictionTraceData.lat.length > 0) {
            traces.push({
                type: 'scattergeo',
                lat: frictionTraceData.lat,
                lon: frictionTraceData.lon,
                mode: 'markers',
                name: 'Friction Score',
                legendgroup: 'friction',
                hovertemplate: '%{text}<extra></extra>',
                text: frictionTraceData.text,
                marker: {
                    size: frictionTraceData.size,
                    color: frictionTraceData.color,
                    colorscale: [
                        [0, 'rgb(34, 197, 94)'],
                        [0.25, 'rgb(132, 204, 22)'],
                        [0.5, 'rgb(250, 204, 21)'],
                        [0.75, 'rgb(249, 115, 22)'],
                        [1, 'rgb(239, 68, 68)']
                    ],
                    cmin: 0,
                    cmax: 100,
                    opacity: 0.5,
                    symbol: 'square',
                    line: { width: 1, color: '#ffffff' }
                }
            });
        }
    }
    
    // G-ZIP: Add Economic Zones (Opportunity Zones + Overlay Districts)
    if (showZones) {
        // Opportunity Zones as circles
        const ozTraceData = { lat: [], lon: [], text: [], size: [] };
        opportunityZones.forEach(oz => {
            ozTraceData.lat.push(oz.center.lat);
            ozTraceData.lon.push(oz.center.lon);
            ozTraceData.size.push(oz.radius * 200);
            ozTraceData.text.push(`<b>${oz.name}</b><br>Type: Opportunity Zone<br>State: ${oz.state}`);
        });
        
        if (ozTraceData.lat.length > 0) {
            traces.push({
                type: 'scattergeo',
                lat: ozTraceData.lat,
                lon: ozTraceData.lon,
                mode: 'markers',
                name: 'Opportunity Zones',
                legendgroup: 'zones',
                hovertemplate: '%{text}<extra></extra>',
                text: ozTraceData.text,
                marker: {
                    size: ozTraceData.size,
                    color: 'rgba(59, 130, 246, 0.3)',
                    symbol: 'circle',
                    line: { width: 2, color: 'rgba(59, 130, 246, 0.8)' }
                }
            });
        }
        
        // Data Center Overlay Districts as rectangles (approximated as markers)
        const overlayTraceData = { lat: [], lon: [], text: [] };
        dataCenterOverlayDistricts.forEach(district => {
            const centerLat = (district.bounds.north + district.bounds.south) / 2;
            const centerLon = (district.bounds.east + district.bounds.west) / 2;
            overlayTraceData.lat.push(centerLat);
            overlayTraceData.lon.push(centerLon);
            overlayTraceData.text.push(
                `<b>${district.name}</b><br>` +
                `${district.county}, ${district.state}<br>` +
                `Type: ${district.type}<br>` +
                `Tax Break: ${district.incentives.tax_break ? 'Yes' : 'No'}<br>` +
                `Expedited Permits: ${district.incentives.expedited_permits ? 'Yes' : 'No'}`
            );
        });
        
        if (overlayTraceData.lat.length > 0) {
            traces.push({
                type: 'scattergeo',
                lat: overlayTraceData.lat,
                lon: overlayTraceData.lon,
                mode: 'markers',
                name: 'DC Overlay Districts',
                legendgroup: 'zones',
                hovertemplate: '%{text}<extra></extra>',
                text: overlayTraceData.text,
                marker: {
                    size: 30,
                    color: 'rgba(16, 185, 129, 0.4)',
                    symbol: 'square',
                    line: { width: 2, color: 'rgba(16, 185, 129, 0.9)' }
                }
            });
        }
    }
    
    // Add HIFLD transmission lines first (so they appear behind markers)
    if (showTransmission) {
        try {
            const hifldData = await fetchHIFLDTransmissionLines();
            const transmissionTraces = processHIFLDToTraces(hifldData);
            traces.push(...transmissionTraces);
            
            // Update transmission line count in navigator
            const lineCount = hifldData.features?.length || 0;
            const transmissionCountEl = document.getElementById('transmissionCount');
            if (transmissionCountEl) {
                transmissionCountEl.textContent = formatNumber(lineCount);
            }
        } catch (error) {
            console.error('Error loading transmission lines:', error);
        }
    }
    
    // BESS Projects trace (filtered by selected layers) - ERCOT only
    const isERCOT = currentRegion === 'ERCOT';
    
    if (showBess && rawData.length > 0 && isERCOT) {
        const selectedBessLayers = getSelectedBessLayers();
        const bessTraceData = {
            solar: { lat: [], lon: [], text: [], size: [], customdata: [] },
            standalone: { lat: [], lon: [], text: [], size: [], customdata: [] },
            wind: { lat: [], lon: [], text: [], size: [], customdata: [] }
        };
        
        rawData.forEach(r => {
            const county = r['County'];
            const coords = texasCountyCoords[county];
            if (!coords) return;
            
            const capacity = parseFloat(r['Capacity (MW)']) || 0;
            const techType = r['Technology Type'];
            const entity = r['Interconnecting Entity'] || 'Unknown';
            const zone = r['CDR Reporting Zone'] || 'Unknown';
            
            // Determine trace key
            let traceKey = 'standalone';
            if (techType === 'Solar Co-Location') traceKey = 'solar';
            else if (techType === 'Wind Co-Location') traceKey = 'wind';
            
            // Skip if layer is not selected
            if (!selectedBessLayers.has(traceKey)) return;
            
            // Add small random offset to prevent overlap
            const latOffset = (Math.random() - 0.5) * 0.3;
            const lonOffset = (Math.random() - 0.5) * 0.3;
            
            bessTraceData[traceKey].lat.push(coords.lat + latOffset);
            bessTraceData[traceKey].lon.push(coords.lon + lonOffset);
            bessTraceData[traceKey].text.push(`<b>${county}</b><br>${techType}<br>${formatNumber(Math.round(capacity))} MW<br>${entity}`);
            bessTraceData[traceKey].size.push(sizeByCapacity ? Math.max(5, Math.sqrt(capacity) * 1.5) : 8);
            bessTraceData[traceKey].customdata.push({ county, capacity, techType, entity, zone, type: 'bess' });
        });
        
        // Add BESS traces (only if layer is selected)
        if (selectedBessLayers.has('solar') && bessTraceData.solar.lat.length > 0) {
            traces.push({
                type: 'scattergeo',
                lat: bessTraceData.solar.lat,
                lon: bessTraceData.solar.lon,
                text: bessTraceData.solar.text,
                customdata: bessTraceData.solar.customdata,
                hoverinfo: 'text',
                mode: 'markers',
                name: 'Solar Co-Location',
                marker: {
                    size: bessTraceData.solar.size,
                    color: '#58a6ff',
                    opacity: 0.8,
                    line: { width: 1, color: '#ffffff' }
                }
            });
        }
        
        if (selectedBessLayers.has('standalone') && bessTraceData.standalone.lat.length > 0) {
            traces.push({
                type: 'scattergeo',
                lat: bessTraceData.standalone.lat,
                lon: bessTraceData.standalone.lon,
                text: bessTraceData.standalone.text,
                customdata: bessTraceData.standalone.customdata,
                hoverinfo: 'text',
                mode: 'markers',
                name: 'Standalone Storage',
                marker: {
                    size: bessTraceData.standalone.size,
                    color: '#3fb950',
                    opacity: 0.8,
                    line: { width: 1, color: '#ffffff' }
                }
            });
        }
        
        if (selectedBessLayers.has('wind') && bessTraceData.wind.lat.length > 0) {
            traces.push({
                type: 'scattergeo',
                lat: bessTraceData.wind.lat,
                lon: bessTraceData.wind.lon,
                text: bessTraceData.wind.text,
                customdata: bessTraceData.wind.customdata,
                hoverinfo: 'text',
                mode: 'markers',
                name: 'Wind Co-Location',
                marker: {
                    size: bessTraceData.wind.size,
                    color: '#d29922',
                    opacity: 0.8,
                    line: { width: 1, color: '#ffffff' }
                }
            });
        }
    }
    
    // Large Loads / Data Centers trace (filtered by selected years) - ALL US MARKETS
    if (showLoads && typeof LARGE_LOADS_US !== 'undefined') {
        const selectedYears = getSelectedLoadYears();
        const loadTraceData = {
            '2026': { lat: [], lon: [], text: [], size: [], customdata: [], color: '#a371f7' },
            '2028': { lat: [], lon: [], text: [], size: [], customdata: [], color: '#f778ba' },
            '2030': { lat: [], lon: [], text: [], size: [], customdata: [], color: '#ff7b72' }
        };
        
        // Filter loads by current region
        const regionConfig_current = regionConfig[currentRegion];
        const filteredLoads = LARGE_LOADS_US.filter(load => {
            if (currentRegion === 'USA') return true;
            // Match by ISO or check if state is in region
            if (load.iso === currentRegion) return true;
            if (regionConfig_current && regionConfig_current.states.includes(load.state)) return true;
            // Special handling for PJM which includes multiple ISOs
            if (currentRegion === 'PJM' && ['PJM', 'NYISO'].includes(load.iso)) return true;
            return false;
        });
        
        filteredLoads.forEach(load => {
            // Process each selected year
            ['2026', '2028', '2030'].forEach(year => {
                if (!selectedYears.has(year)) return;
                
                const loadValue = load[`mw_${year}`] || 0;
                if (loadValue <= 0) return;
                
                const statusIcon = load.status === 'Operational' ? '🟢' : load.status === 'Under Construction' ? '🟡' : '🔵';
                const typeIcon = load.type === 'Hyperscale' ? '🏢' : '🖥️';
                
                loadTraceData[year].lat.push(load.lat);
                loadTraceData[year].lon.push(load.lon);
                loadTraceData[year].text.push(
                    `<b>${typeIcon} ${load.name}</b><br>` +
                    `<b>Operator:</b> ${load.operator}<br>` +
                    `<b>Location:</b> ${load.county} County, ${load.state}<br>` +
                    `<b>ISO:</b> ${load.iso} | <b>Utility:</b> ${load.utility}<br>` +
                    `<b>Type:</b> ${load.type}<br>` +
                    `<b>${statusIcon} Status:</b> ${load.status}<br>` +
                    `<b>Load Timeline:</b><br>` +
                    `  2024: ${formatNumber(load.mw_2024)} MW<br>` +
                    `  2026: ${formatNumber(load.mw_2026)} MW<br>` +
                    `  2028: ${formatNumber(load.mw_2028)} MW<br>` +
                    `  2030: ${formatNumber(load.mw_2030)} MW`
                );
                loadTraceData[year].size.push(sizeByCapacity ? Math.max(8, Math.sqrt(loadValue) * 1.8) : 12);
                loadTraceData[year].customdata.push({ 
                    id: load.id,
                    county: load.county, 
                    state: load.state,
                    capacity: loadValue, 
                    operator: load.operator,
                    utility: load.utility,
                    iso: load.iso,
                    year, 
                    type: 'load',
                    status: load.status
                });
            });
        });
        
        // Add traces for each selected year
        ['2026', '2028', '2030'].forEach(year => {
            if (selectedYears.has(year) && loadTraceData[year].lat.length > 0) {
                traces.push({
                    type: 'scattergeo',
                    lat: loadTraceData[year].lat,
                    lon: loadTraceData[year].lon,
                    text: loadTraceData[year].text,
                    customdata: loadTraceData[year].customdata,
                    hoverinfo: 'text',
                    mode: 'markers',
                    name: `${year} Load`,
                    marker: {
                        size: loadTraceData[year].size,
                        color: loadTraceData[year].color,
                        opacity: 0.8,
                        symbol: 'square',
                        line: { width: 1, color: '#ffffff' }
                    }
                });
            }
        });
    }
    
    // Get current region config for map center
    const region = regionConfig[currentRegion];
    
    const layout = {
        geo: {
            scope: 'usa',
            projection: { type: 'albers usa' },
            center: { lat: region.center.lat, lon: region.center.lon },
            bgcolor: '#0d1117',
            lakecolor: '#161b22',
            landcolor: '#21262d',
            subunitcolor: '#30363d',
            showsubunits: true,
            subunitwidth: 0.5,
            showland: true,
            showlakes: true
        },
        paper_bgcolor: '#0d1117',
        plot_bgcolor: '#0d1117',
        margin: { t: 10, b: 10, l: 10, r: 10 },
        showlegend: true,
        legend: {
            x: 0.02,
            y: 0.02,
            bgcolor: 'rgba(22,27,34,0.8)',
            bordercolor: '#30363d',
            borderwidth: 1,
            font: { color: '#e6edf3', size: 10 }
        },
        dragmode: 'pan'
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        displaylogo: false
    };
    
    Plotly.newPlot('scatterMapLarge', traces, layout, config);
    
    // Add click handler for info panel
    document.getElementById('scatterMapLarge').on('plotly_click', function(data) {
        if (data.points && data.points[0]) {
            const point = data.points[0];
            const customdata = point.customdata;
            showInfoPanel(customdata);
        }
    });
    
    // Update counts in navigator
    updateNavigatorCounts();
}

// Show info panel with point details
function showInfoPanel(data) {
    const panel = document.getElementById('mapInfoPanel');
    panel.style.display = 'block';
    
    document.getElementById('infoPanelTitle').textContent = data.county || data.substation || 'Unknown';
    document.getElementById('infoPanelSubtitle').textContent = data.type === 'bess' ? 'BESS Project' : 'Large Load / Data Center';
    document.getElementById('infoPanelCapacity').textContent = formatNumber(Math.round(data.capacity)) + ' MW';
    document.getElementById('infoPanelType').textContent = data.techType || data.tsp || '--';
    document.getElementById('infoPanelZone').textContent = data.zone || '--';
    
    // Find related projects in same county
    const relatedList = document.getElementById('relatedProjectsList');
    let relatedHtml = '';
    
    if (data.type === 'bess') {
        const related = rawData.filter(r => r['County'] === data.county && r['Interconnecting Entity'] !== data.entity).slice(0, 5);
        if (related.length > 0) {
            related.forEach(r => {
                relatedHtml += `<div class="related-item">${r['Interconnecting Entity']} - ${formatNumber(Math.round(parseFloat(r['Capacity (MW)']) || 0))} MW</div>`;
            });
        } else {
            relatedHtml = '<p class="no-data">No other projects in this county</p>';
        }
    } else {
        const related = loadData.filter(r => {
            const county = r['County']?.charAt(0).toUpperCase() + r['County']?.slice(1).toLowerCase();
            return county === data.county && r['Substation'] !== data.substation;
        }).slice(0, 5);
        if (related.length > 0) {
            related.forEach(r => {
                relatedHtml += `<div class="related-item">${r['Substation']} - ${formatNumber(Math.round(parseFloat(r['2030']) || 0))} MW</div>`;
            });
        } else {
            relatedHtml = '<p class="no-data">No other loads in this county</p>';
        }
    }
    
    relatedList.innerHTML = relatedHtml;
}

// Update navigator sidebar counts based on selected region
function updateNavigatorCounts() {
    const isERCOT = currentRegion === 'ERCOT';
    const bessCountEl = document.getElementById('bessProjectCount');
    const loadCountEl = document.getElementById('loadCount');
    
    // Count loads from LARGE_LOADS_US for current region
    let loadCount = 0;
    if (typeof LARGE_LOADS_US !== 'undefined') {
        const regionCfg = regionConfig[currentRegion];
        loadCount = LARGE_LOADS_US.filter(load => {
            if (currentRegion === 'USA') return true;
            if (load.iso === currentRegion) return true;
            if (regionCfg && regionCfg.states && regionCfg.states.includes(load.state)) return true;
            if (currentRegion === 'PJM' && ['PJM', 'NYISO'].includes(load.iso)) return true;
            return false;
        }).length;
    }
    
    // BESS Projects - only available for ERCOT
    if (isERCOT) {
        bessCountEl.textContent = formatNumber(rawData.length);
        bessCountEl.classList.remove('na');
    } else {
        bessCountEl.textContent = 'N/A';
        bessCountEl.classList.add('na');
    }
    
    // Large Loads / Data Centers - available for ALL regions via LARGE_LOADS_US
    if (loadCount > 0) {
        loadCountEl.textContent = formatNumber(loadCount);
        loadCountEl.classList.remove('na');
    } else {
        loadCountEl.textContent = 'N/A';
        loadCountEl.classList.add('na');
    }
    
    // Update G-ZIP Capacity Summary stats
    updateCapacitySummary();
}

// Update G-ZIP capacity summary panel
function updateCapacitySummary() {
    const stats = DATASET_SUMMARY;
    
    document.getElementById('statTotalCounties').textContent = stats.totalCounties;
    document.getElementById('statCurrentGW').textContent = stats.totalCurrentGW.toFixed(1) + ' GW';
    document.getElementById('statProjectedGW').textContent = stats.totalProjectedGW.toFixed(1) + ' GW';
    document.getElementById('statSweetSpots').textContent = stats.sweetSpotCounties;
    document.getElementById('statLowFriction').textContent = stats.lowFrictionCounties;
    document.getElementById('statHighFriction').textContent = stats.highFrictionCounties;
    document.getElementById('statOverlays').textContent = stats.overlayDistricts;
    document.getElementById('statOZones').textContent = stats.opportunityZones;
    
    // Update economic zone count in sidebar
    const econZoneCountEl = document.getElementById('econZoneCount');
    if (econZoneCountEl) {
        econZoneCountEl.textContent = stats.overlayDistricts + stats.opportunityZones;
    }
}

// Setup navigator sidebar interactions
function setupNavigatorSidebar() {
    // Collapsible sections
    document.querySelectorAll('.nav-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const sectionId = header.dataset.section + '-content';
            const content = document.getElementById(sectionId);
            if (content) {
                content.classList.toggle('collapsed');
                header.classList.toggle('collapsed');
            }
        });
    });
    
    // Region selector
    document.getElementById('regionSelect')?.addEventListener('change', (e) => {
        currentRegion = e.target.value;
        createScatterMap();
    });
    
    // Map control checkboxes
    document.getElementById('showBessLayer')?.addEventListener('change', createScatterMap);
    document.getElementById('showLoadsLayer')?.addEventListener('change', createScatterMap);
    document.getElementById('showTransmissionLayer')?.addEventListener('change', createScatterMap);
    document.getElementById('showZonesLayer')?.addEventListener('change', createScatterMap);
    document.getElementById('showFrictionLayer')?.addEventListener('change', createScatterMap);
    document.getElementById('sizeByCapacity')?.addEventListener('change', createScatterMap);
    
    // Voltage filter checkboxes - clicking row or checkbox toggles the filter
    document.querySelectorAll('.voltage-filter').forEach(item => {
        const checkbox = item.querySelector('.voltage-checkbox');
        
        // Click on the row (but not checkbox) toggles
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                item.classList.toggle('active', checkbox.checked);
                createScatterMap();
            }
        });
        
        // Checkbox change also updates the row state
        checkbox?.addEventListener('change', () => {
            item.classList.toggle('active', checkbox.checked);
            createScatterMap();
        });
    });
    
    // Layer filter checkboxes (BESS Projects and Large Loads) - clicking row or checkbox toggles
    document.querySelectorAll('.layer-filter').forEach(item => {
        const checkbox = item.querySelector('.layer-checkbox');
        
        // Click on the row (but not checkbox) toggles
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                item.classList.toggle('active', checkbox.checked);
                createScatterMap();
            }
        });
        
        // Checkbox change also updates the row state
        checkbox?.addEventListener('change', () => {
            item.classList.toggle('active', checkbox.checked);
            createScatterMap();
        });
    });
    
    // Close info panel
    document.getElementById('closeInfoPanel')?.addEventListener('click', () => {
        document.getElementById('mapInfoPanel').style.display = 'none';
    });
}
