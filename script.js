// Sample forex data
const forexData = {
    'EUR/USD': { rate: 1.0850, change: 0.25 },
    'GBP/USD': { rate: 1.2750, change: 0.15 },
    'USD/JPY': { rate: 149.50, change: -0.10 },
    'AUD/USD': { rate: 0.6750, change: 0.20 },
    'USD/CAD': { rate: 1.3650, change: 0.05 },
    'USD/CHF': { rate: 0.8850, change: -0.08 }
};

// Initialize chart on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
});

function searchCurrency() {
    const input = document.getElementById('currencyInput').value.toUpperCase();
    
    if (forexData[input]) {
        alert(`${input}\nRate: ${forexData[input].rate}\nChange: ${forexData[input].change}%`);
    } else {
        alert('Currency pair not found. Try EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, or USD/CHF');
    }
}

function initializeChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Sample data for the chart
    const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    const data = [1.0800, 1.0820, 1.0835, 1.0850, 1.0840, 1.0855, 1.0850];
    
    // Simple line chart drawing
    drawLineChart(ctx, labels, data, canvas.width, canvas.height);
}

function drawLineChart(ctx, labels, data, width, height) {
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find min and max values
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw data line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth / (data.length - 1)) * i;
        const y = height - padding - ((data[i] - minValue) / range) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#764ba2';
    for (let i = 0; i < data.length; i++) {
        const x = padding + (chartWidth / (data.length - 1)) * i;
        const y = height - padding - ((data[i] - minValue) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < labels.length; i++) {
        const x = padding + (chartWidth / (labels.length - 1)) * i;
        ctx.fillText(labels[i], x, height - padding + 20);
    }
}

// Allow Enter key to search
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchCurrency();
    }
});
