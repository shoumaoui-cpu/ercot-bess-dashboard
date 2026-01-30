// Pricing Data Storage
let pricingData = [];
let pricingStats = {
    avgRtm: 0,
    maxRtm: 0,
    avgDam: 0,
    spikes: 0
};

// Initialize Pricing Module
document.addEventListener('DOMContentLoaded', () => {
    setupPricingUpload();
    setupPricingFilters();
});

// Setup Drag & Drop and File Input
function setupPricingUpload() {
    const dropZone = document.getElementById('pricingDropZone');
    const fileInput = document.getElementById('pricingFileInput');

    if (!dropZone || !fileInput) return;

    // Click handler
    dropZone.addEventListener('click', (e) => {
        if(e.target !== fileInput && e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processPricingFile(e.target.files[0]);
        }
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            processPricingFile(e.dataTransfer.files[0]);
        }
    });
}

// Process Uploaded CSV
function processPricingFile(file) {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please upload a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parsePricingCSV(text);
    };
    reader.readAsText(file);
}

// Parse CSV Content
function parsePricingCSV(csvText) {
    // Simple CSV parser assuming standard ERCOT format
    // Expected headers for RTM: DeliveryDate, DeliveryHour, DeliveryInterval, SettlementPointName, SettlementPointType, SettlementPointPrice
    // Expected headers for DAM: DeliveryDate, HourEnding, SettlementPointName, SettlementPointType, SettlementPointPrice
    
    // We will try to detect if it's RTM or DAM or combined. 
    // For simplicity, let's assume a normalized format or try to map:
    // Date, Time, Point, Price, Type (RTM/DAM)

    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Identify columns
    const dateIdx = headers.findIndex(h => h.includes('Date'));
    const priceIdx = headers.findIndex(h => h.includes('Price') || h.includes('LMP'));
    const pointIdx = headers.findIndex(h => h.includes('Point Name') || h === 'SettlementPoint');
    const typeIdx = headers.findIndex(h => h.includes('Market') || h.includes('Type')); // If explicitly stated
    
    // Heuristic for RTM vs DAM based on headers if type column missing
    let defaultType = 'RTM';
    if (headers.includes('HourEnding') && !headers.includes('DeliveryInterval')) {
        defaultType = 'DAM';
    }

    pricingData = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const row = parseCSVLine(lines[i]); // Use existing helper from script.js if available, or duplicate
        
        const price = parseFloat(row[priceIdx]);
        if (isNaN(price)) continue;

        pricingData.push({
            date: row[dateIdx],
            point: row[pointIdx],
            price: price,
            type: typeIdx !== -1 ? row[typeIdx] : defaultType,
            timestamp: new Date(row[dateIdx]).getTime() // Approximate for sorting
        });
    }

    if (pricingData.length === 0) {
        alert('No valid pricing data found.');
        return;
    }

    // Populate Filters
    populatePricingFilters();
    
    // Show Dashboard
    document.querySelector('.upload-section').style.display = 'none';
    document.getElementById('pricingDashboard').style.display = 'block';
    
    // Update Views
    updatePricingView();
}

// Populate Settlement Point Filter
function populatePricingFilters() {
    const points = [...new Set(pricingData.map(d => d.point))].sort();
    const select = document.getElementById('settlementPointFilter');
    
    select.innerHTML = '<option value="all">All Points</option>';
    points.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });

    select.addEventListener('change', updatePricingView);
}

// Setup Filters
function setupPricingFilters() {
    // Already handled in populate for now
}

// Update Charts and Stats based on filters
function updatePricingView() {
    const selectedPoint = document.getElementById('settlementPointFilter').value;
    
    let filtered = pricingData;
    if (selectedPoint !== 'all') {
        filtered = pricingData.filter(d => d.point === selectedPoint);
    }

    calculatePricingStats(filtered);
    renderPricingCharts(filtered);
}

// Calculate Statistics
function calculatePricingStats(data) {
    const rtmData = data.filter(d => d.type.includes('RTM') || d.type === 'Real-Time');
    const damData = data.filter(d => d.type.includes('DAM') || d.type === 'Day-Ahead');

    // RTM Stats
    const rtmPrices = rtmData.map(d => d.price);
    const avgRtm = rtmPrices.length ? rtmPrices.reduce((a,b) => a+b, 0) / rtmPrices.length : 0;
    const maxRtm = rtmPrices.length ? Math.max(...rtmPrices) : 0;
    
    // DAM Stats
    const damPrices = damData.map(d => d.price);
    const avgDam = damPrices.length ? damPrices.reduce((a,b) => a+b, 0) / damPrices.length : 0;

    // Spikes (Arbitrary > $100)
    const spikes = data.filter(d => d.price > 100).length;

    document.getElementById('statAvgLmpRtm').textContent = avgRtm.toFixed(2);
    document.getElementById('statMaxLmpRtm').textContent = maxRtm.toFixed(2);
    document.getElementById('statAvgLmpDam').textContent = avgDam.toFixed(2);
    document.getElementById('statPriceSpikes').textContent = spikes;
}

// Render Charts
function renderPricingCharts(data) {
    // 1. Price Trend (Time Series)
    // Group by Date/Time
    const rtmData = data.filter(d => d.type.includes('RTM'));
    const damData = data.filter(d => d.type.includes('DAM'));

    const traceRTM = {
        x: rtmData.map(d => d.date), // Should ideally parse to meaningful datetime
        y: rtmData.map(d => d.price),
        name: 'RTM Price',
        type: 'scatter',
        line: { color: '#3fb950' }
    };

    const traceDAM = {
        x: damData.map(d => d.date),
        y: damData.map(d => d.price),
        name: 'DAM Price',
        type: 'scatter',
        line: { color: '#a371f7' }
    };

    const layoutTrend = {
        paper_bgcolor: '#161b22',
        plot_bgcolor: '#161b22',
        font: { color: '#e6edf3' },
        xaxis: { gridcolor: '#30363d', title: 'Time' },
        yaxis: { gridcolor: '#30363d', title: 'Price ($/MWh)' },
        margin: { t: 10, b: 40, l: 60, r: 20 },
        height: 350
    };

    Plotly.newPlot('priceTrendChart', [traceRTM, traceDAM], layoutTrend, { responsive: true });

    // 2. Price Distribution (Histogram)
    const traceDist = {
        x: rtmData.map(d => d.price),
        type: 'histogram',
        marker: { color: '#39c5cf', opacity: 0.7 },
        nbinsx: 50
    };

    const layoutDist = {
        paper_bgcolor: '#161b22',
        plot_bgcolor: '#161b22',
        font: { color: '#e6edf3' },
        xaxis: { gridcolor: '#30363d', title: 'Price ($/MWh)' },
        yaxis: { gridcolor: '#30363d', title: 'Frequency' },
        margin: { t: 10, b: 40, l: 60, r: 20 },
        height: 280
    };

    Plotly.newPlot('priceDistChart', [traceDist], layoutDist, { responsive: true });

    // 3. Daily Profile (Avg per hour) - Simplified assumption on data format
    // We would need parsed hours for this. For now let's skip or show simplified.
    // Let's rely on data ordering or basic index if timestamp not fully parsed
    
    // Placeholder for Daily Profile
    // If we can't parse hours easily, maybe just show stats or a different view.
    // Let's leaving it blank or simple message if complexity high.
    document.getElementById('dailyProfileChart').innerHTML = '<p style="text-align:center; padding-top:100px; color:#6e7681">Daily profile requires granular time data.</p>';
}

// Helper to duplicate CSV parsing from script.js if needed or standalone
// (Assumes global scope or duplicate)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
        else { current += char; }
    }
    result.push(current);
    return result;
}
