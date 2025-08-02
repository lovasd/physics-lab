// Pendulum Experiment JavaScript

// Global variables
let experimentData = [];
let chart = null;

// Initialize the experiment page
document.addEventListener('DOMContentLoaded', function() {
    initializeExperiment();
    setupNavigation();
    loadSampleData();
    initializeChart();
});

// Initialize experiment functionality
function initializeExperiment() {
    console.log('Pendulum Experiment initialized');
    
    // Add event listeners for experiment navigation
    const expNavLinks = document.querySelectorAll('.exp-nav-link');
    expNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            updateActiveNavLink(this);
        });
    });
}

// Setup smooth scrolling navigation
function setupNavigation() {
    // Experiment navigation highlighting
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.experiment-section');
        const navLinks = document.querySelectorAll('.exp-nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Scroll to section smoothly
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Update active navigation link
function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.exp-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Add a new data row to the table
function addDataRow() {
    const tableBody = document.getElementById('dataTableBody');
    const rowCount = tableBody.children.length + 1;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="number" step="0.01" class="data-input" placeholder="Length (m)" onchange="updateData()"></td>
        <td><input type="number" step="0.01" class="data-input" placeholder="Time (s)" onchange="updateData()"></td>
        <td class="period-cell">-</td>
        <td class="period-squared-cell">-</td>
    `;
    
    tableBody.appendChild(newRow);
}

// Update data when inputs change
function updateData() {
    const rows = document.querySelectorAll('#dataTableBody tr');
    experimentData = [];
    
    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('.data-input');
        if (inputs.length >= 2) {
            const length = parseFloat(inputs[0].value);
            const timeFor10 = parseFloat(inputs[1].value);
            
            if (!isNaN(length) && !isNaN(timeFor10) && timeFor10 > 0) {
                const period = timeFor10 / 10;
                const periodSquared = period * period;
                
                // Update calculated cells
                row.querySelector('.period-cell').textContent = period.toFixed(3);
                row.querySelector('.period-squared-cell').textContent = periodSquared.toFixed(3);
                
                // Add to experiment data
                experimentData.push({
                    trial: index + 1,
                    length: length,
                    timeFor10: timeFor10,
                    period: period,
                    periodSquared: periodSquared
                });
            }
        }
    });
    
    updateChart();
    updateRegressionResults();
}

// Load sample data
function loadSampleData() {
    const sampleData = [
        { length: 0.25, timeFor10: 10.0 },
        { length: 0.35, timeFor10: 11.9 },
        { length: 0.45, timeFor10: 13.5 },
        { length: 0.55, timeFor10: 14.9 },
        { length: 0.65, timeFor10: 16.2 },
        { length: 0.75, timeFor10: 17.4 },
        { length: 0.85, timeFor10: 18.5 }
    ];
    
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = '';
    
    sampleData.forEach((data, index) => {
        const period = data.timeFor10 / 10;
        const periodSquared = period * period;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${data.length.toFixed(2)}</td>
            <td>${data.timeFor10.toFixed(1)}</td>
            <td>${period.toFixed(3)}</td>
            <td>${periodSquared.toFixed(3)}</td>
        `;
        
        tableBody.appendChild(row);
        
        // Add to experiment data
        experimentData.push({
            trial: index + 1,
            length: data.length,
            timeFor10: data.timeFor10,
            period: period,
            periodSquared: periodSquared
        });
    });
    
    updateChart();
    updateRegressionResults();
}

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('pendulumChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'T² vs L',
                data: [],
                backgroundColor: '#3b82f6',
                borderColor: '#1d4ed8',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Length (m)'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Period² (s²)'
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Pendulum Period vs Length',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update chart with current data
function updateChart() {
    if (chart && experimentData.length > 0) {
        const chartData = experimentData.map(data => ({
            x: data.length,
            y: data.periodSquared
        }));
        
        chart.data.datasets[0].data = chartData;
        chart.update();
    }
}

// Calculate g from period and length
function calculateG() {
    const length = parseFloat(document.getElementById('lengthInput').value);
    const period = parseFloat(document.getElementById('periodInput').value);
    
    if (isNaN(length) || isNaN(period) || period <= 0) {
        document.getElementById('gResult').innerHTML = '<span style="color: #ef4444;">Please enter valid values</span>';
        return;
    }
    
    const g = (4 * Math.PI * Math.PI * length) / (period * period);
    const percentError = Math.abs((g - 9.81) / 9.81) * 100;
    
    document.getElementById('gResult').innerHTML = `
        <strong>Calculated g:</strong> ${g.toFixed(2)} m/s²<br>
        <strong>Percent Error:</strong> ${percentError.toFixed(1)}%
    `;
}

// Perform linear regression on T² vs L data
function performRegression() {
    if (experimentData.length < 2) {
        alert('Need at least 2 data points for regression analysis');
        return;
    }
    
    const n = experimentData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    experimentData.forEach(data => {
        sumX += data.length;
        sumY += data.periodSquared;
        sumXY += data.length * data.periodSquared;
        sumX2 += data.length * data.length;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R²
    const meanY = sumY / n;
    let ssRes = 0, ssTot = 0;
    
    experimentData.forEach(data => {
        const predictedY = slope * data.length + intercept;
        ssRes += Math.pow(data.periodSquared - predictedY, 2);
        ssTot += Math.pow(data.periodSquared - meanY, 2);
    });
    
    const rSquared = 1 - (ssRes / ssTot);
    
    // Calculate g from slope
    const g = (4 * Math.PI * Math.PI) / slope;
    
    // Update results
    document.getElementById('slopeResult').textContent = slope.toFixed(3) + ' s²/m';
    document.getElementById('gFromSlope').textContent = g.toFixed(2) + ' m/s²';
    document.getElementById('rSquared').textContent = rSquared.toFixed(4);
    
    // Add regression line to chart
    if (chart) {
        const minLength = Math.min(...experimentData.map(d => d.length));
        const maxLength = Math.max(...experimentData.map(d => d.length));
        
        const regressionData = [
            { x: minLength, y: slope * minLength + intercept },
            { x: maxLength, y: slope * maxLength + intercept }
        ];
        
        // Remove existing regression line if it exists
        chart.data.datasets = chart.data.datasets.filter(dataset => dataset.label !== 'Regression Line');
        
        // Add new regression line
        chart.data.datasets.push({
            label: 'Regression Line',
            data: regressionData,
            type: 'line',
            borderColor: '#ef4444',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        });
        
        chart.update();
    }
}

// Update regression results when data changes
function updateRegressionResults() {
    if (experimentData.length >= 2) {
        performRegression();
    } else {
        document.getElementById('slopeResult').textContent = '-';
        document.getElementById('gFromSlope').textContent = '-';
        document.getElementById('rSquared').textContent = '-';
    }
}

// Export data to CSV
function exportData() {
    if (experimentData.length === 0) {
        alert('No data to export');
        return;
    }
    
    let csvContent = 'Trial,Length (m),Time for 10 oscillations (s),Period (s),Period² (s²)\n';
    
    experimentData.forEach(data => {
        csvContent += `${data.trial},${data.length},${data.timeFor10},${data.period.toFixed(3)},${data.periodSquared.toFixed(3)}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pendulum_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Clear all data
function clearData() {
    if (confirm('Are you sure you want to clear all data?')) {
        experimentData = [];
        document.getElementById('dataTableBody').innerHTML = '';
        if (chart) {
            chart.data.datasets[0].data = [];
            chart.update();
        }
        updateRegressionResults();
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to add data row
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addDataRow();
    }
    
    // Ctrl/Cmd + S to export data
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportData();
    }
});

// Add tooltips and help text
function addHelpText() {
    const helpTexts = {
        'lengthInput': 'Enter the length of the pendulum from pivot to center of mass',
        'periodInput': 'Enter the period of oscillation (time for one complete cycle)',
        'dataTable': 'Add your experimental data here. The period and period² will be calculated automatically.'
    };
    
    Object.keys(helpTexts).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = helpTexts[id];
        }
    });
}

// Initialize help text
document.addEventListener('DOMContentLoaded', addHelpText);

// Console message for debugging
console.log(`
🧪 Simple Pendulum Experiment Loaded!

Features:
- Interactive data collection
- Real-time chart updates
- Linear regression analysis
- g calculation tools
- Data export functionality

Ready for experimental physics! ⚛️
`); 