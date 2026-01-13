// Global data storage
let rawData = [];
let filteredData = [];
let filteredDataAnnual = [];
let allQuarters = []; // Sorted list of all quarters
let allYears = []; // Sorted list of all years
let selectedQuarterIndex = 0; // 0 = All Time
let selectedYearIndex = 0; // 0 = All Time

// Dark theme for Plotly charts
const darkTheme = {
    paper_bgcolor: '#161b22',
    plot_bgcolor: '#161b22',
    font: { color: '#e6edf3', size: 11 },
    gridcolor: '#30363d',
    colors: ['#58a6ff', '#3fb950', '#d29922', '#a371f7', '#39c5cf', '#f85149']
};

// Initialize
document.addEventListener('DOMContentLoaded', loadData);

// Update loading status
function setStatus(msg) {
    const el = document.getElementById('loadingStatus');
    if (el) el.textContent = msg;
    console.log(msg);
}

// Load master Excel data
async function loadData() {
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
        
        // Show dashboard
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('timeSliderContainer').style.display = 'flex';
        document.getElementById('dashboardContent').style.display = 'flex';
        
    } catch (error) {
        console.error('Error:', error);
        setStatus('Error: ' + error.message);
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
    sliderMin.addEventListener('input', function() {
        const minVal = parseInt(this.value);
        const maxVal = parseInt(sliderMax.value);
        
        // Prevent min from exceeding max
        if (minVal > maxVal) {
            this.value = maxVal;
        }
        
        updateSliderUI();
        applyFilters();
    });
    
    sliderMax.addEventListener('input', function() {
        const minVal = parseInt(sliderMin.value);
        const maxVal = parseInt(this.value);
        
        // Prevent max from going below min
        if (maxVal < minVal) {
            this.value = minVal;
        }
        
        updateSliderUI();
        applyFilters();
    });
    
    resetBtn.addEventListener('click', function() {
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
    slider.addEventListener('input', function() {
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
                // Show sidebar
                document.querySelector('.sidebar').style.display = 'flex';
                document.querySelector('.main-content').style.marginLeft = '';
                Plotly.Plots.resize('quarterChart');
            } else if (tabId === 'counties') {
                document.getElementById('timeSliderContainer').style.display = 'flex';
                document.getElementById('annualSliderContainer').style.display = 'none';
                // Show sidebar for Counties tab (no longer fullscreen)
                document.querySelector('.sidebar').style.display = 'flex';
                document.querySelector('.main-content').style.marginLeft = '';
                createCountyMapLarge();
            } else if (tabId === 'overview') {
                document.getElementById('timeSliderContainer').style.display = 'flex';
                document.getElementById('annualSliderContainer').style.display = 'none';
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
                
                // Initialize annual data if not already done
                if (filteredDataAnnual.length === 0) {
                    filteredDataAnnual = rawData.filter(r => {
                        const q = r['COD Quarter'];
                        return q && !q.includes('1900');
                    });
                }
                createAllChartsAnnual();
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
