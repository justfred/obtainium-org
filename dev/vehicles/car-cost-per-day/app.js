// Configuration constants - edit these to change defaults
const CONFIG = {
    currentCarMPG: 15,
    currentInsurancePerMonth: 100,  // Liability only on 2010 Lexus GX
    
    // Used Lexus GX option (e.g., 2020 model)
    usedCarPrice: 40000,
    usedCarMPG: 18,  // GX gets slightly better than your 2010
    usedCarInterestRate: 5.5,
    usedCarLoanTermYears: 4,
    usedCarMaintenancePerDay: 2.5,
    usedCarInsurancePerMonth: 180,  // Full coverage required
    
    // New Toyota Land Cruiser option (e.g., 2024+ hybrid)
    newCarPrice: 80000,
    newCarMPG: 23,  // LC hybrid gets better MPG than GX
    newCarInterestRate: 4.5,
    newCarLoanTermYears: 6,
    newCarMaintenancePerDay: 2,
    newCarInsurancePerMonth: 220,  // Full coverage required, higher value
    
    milesPerYear: 20000,
    gasPricePerGallon: 4.00
};

// Hardcoded maintenance cost data
let costs = [
    { date: '2021-04-17', amount: 22500, description: 'Purchase' },
    { date: '2021-05-13', amount: 312.65, description: 'EFI And Power Steering' },
    { date: '2022-02-11', amount: 422.75, description: 'Stickers' },
    { date: '2022-02-23', amount: 459.72, description: 'Oil Change, Trans Fluid Flush' },
    { date: '2023-04-20', amount: 1567.73, description: 'Oil Change, Coolant, Rear Brakes, Check Airbag' },
    { date: '2023-09-30', amount: 58, description: 'Smog Check' },
    { date: '2023-10-10', amount: 6707.29, description: 'Timing Cover, Water Pump, Etc' },
    { date: '2023-10-25', amount: 1816.37, description: 'Tires' },
    { date: '2023-12-22', amount: 258.88, description: 'Hood Struts' },
    { date: '2024-04-22', amount: 2671.8, description: 'Front And Rear Brakes And Rotors' },
    { date: '2024-08-13', amount: 842.23, description: 'Cooling System' },
    { date: '2024-12-06', amount: 94.55, description: 'Oil Change' },
    { date: '2024-12-31', amount: 239.78, description: 'Battery' },
    { date: '2025-03-24', amount: 458.36, description: 'Oil Change, Fuel Inj Clean' },
    { date: '2025-03-24', amount: 1031.87, description: 'Fuel System, Trans Leak' },
    { date: '2025-11-25', amount: 4261.75, description: 'Radiator, Water Pump, Diff Service' }
];

// Fuel data from Road Trip CSV - 270 fill-ups from 2021-04-25 to 2025-12-01
let fuelData = [];

let chart = null;
let maintenanceChart = null;

// Load and display on page load
window.addEventListener('DOMContentLoaded', () => {
    // Set form defaults from CONFIG
    document.getElementById('usedCarPrice').value = CONFIG.usedCarPrice;
    document.getElementById('usedCarRate').value = CONFIG.usedCarInterestRate;
    document.getElementById('usedCarTerm').value = CONFIG.usedCarLoanTermYears;
    document.getElementById('usedCarMPG').value = CONFIG.usedCarMPG;
    document.getElementById('usedCarMaint').value = CONFIG.usedCarMaintenancePerDay;
    document.getElementById('usedCarIns').value = CONFIG.usedCarInsurancePerMonth;
    
    document.getElementById('newCarPrice').value = CONFIG.newCarPrice;
    document.getElementById('newCarRate').value = CONFIG.newCarInterestRate;
    document.getElementById('newCarTerm').value = CONFIG.newCarLoanTermYears;
    document.getElementById('newCarMPG').value = CONFIG.newCarMPG;
    document.getElementById('newCarMaint').value = CONFIG.newCarMaintenancePerDay;
    document.getElementById('newCarIns').value = CONFIG.newCarInsurancePerMonth;
    
    document.getElementById('milesPerYear').value = CONFIG.milesPerYear;
    document.getElementById('gasPrice').value = CONFIG.gasPricePerGallon;
    document.getElementById('currentIns').value = CONFIG.currentInsurancePerMonth;
    
    updateDisplay();
    updateComparison();
});

function updateDisplay() {
    displayCostsList();
    updateStats();
    updateChart();
    updateMaintenanceChart();
}

function displayCostsList() {
    const listDiv = document.getElementById('costsList');
    
    if (costs.length === 0) {
        listDiv.innerHTML = '<p style="color: #666; text-align: center;">No costs loaded from file.</p>';
        return;
    }
    
    listDiv.innerHTML = costs.map((cost, index) => `
        <div class="cost-item">
            <div class="cost-info">
                <span class="cost-date">${formatDate(cost.date)}</span>
                <span class="cost-amount">$${cost.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span class="cost-description">${cost.description}</span>
            </div>
        </div>
    `).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function updateStats() {
    if (costs.length === 0) {
        document.getElementById('totalCost').textContent = '$0.00';
        document.getElementById('purchasePrice').textContent = '$0.00';
        document.getElementById('maintenanceCost').textContent = '$0.00';
        document.getElementById('daysOwned').textContent = '0';
        document.getElementById('currentAvg').textContent = '$0.00';
        document.getElementById('maintenanceAvg').textContent = '$0.00';
        return;
    }
    
    const purchasePrice = costs[0].amount;  // Assume first entry is purchase
    const maintenanceCost = costs.slice(1).reduce((sum, cost) => sum + cost.amount, 0);
    const totalCost = purchasePrice + maintenanceCost;
    
    const firstDate = new Date(costs[0].date + 'T00:00:00');
    const today = new Date();
    const daysOwned = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const currentAvg = totalCost / daysOwned;
    const maintenanceAvg = maintenanceCost / daysOwned;
    
    document.getElementById('totalCost').textContent = '$' + totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('purchasePrice').textContent = '$' + purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('maintenanceCost').textContent = '$' + maintenanceCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('daysOwned').textContent = daysOwned.toLocaleString();
    document.getElementById('currentAvg').textContent = '$' + currentAvg.toFixed(2);
    document.getElementById('maintenanceAvg').textContent = '$' + maintenanceAvg.toFixed(2);
}

function calculateDailyAverages() {
    if (costs.length === 0) return [];
    
    const firstDate = new Date(costs[0].date + 'T00:00:00');
    const lastDate = new Date(costs[costs.length - 1].date + 'T00:00:00');
    const today = new Date();
    const endDate = today > lastDate ? today : lastDate;
    
    const dailyData = [];
    let cumulativeCost = 0;
    let costEventDates = costs.map(c => new Date(c.date + 'T00:00:00').getTime());
    
    // Build a map of costs by date
    const costsByDate = {};
    costs.forEach(cost => {
        const dateKey = new Date(cost.date + 'T00:00:00').getTime();
        if (!costsByDate[dateKey]) {
            costsByDate[dateKey] = 0;
        }
        costsByDate[dateKey] += cost.amount;
    });
    
    // Calculate daily averages
    for (let d = new Date(firstDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const dateKey = currentDate.getTime();
        const daysSinceStart = Math.floor((currentDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Check if there's a cost on this date
        const costOnThisDate = costsByDate[dateKey] || 0;
        const isCostDay = costOnThisDate > 0;
        
        // For cost days (except day 1), add point BEFORE adding the cost (creates the jump)
        if (isCostDay && daysSinceStart > 1 && daysSinceStart > 30) {
            const avgBeforeCost = cumulativeCost / daysSinceStart;
            dailyData.push({
                date: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                avgCostPerDay: avgBeforeCost,
                isCostDay: false
            });
        }
        
        // Add the cost
        cumulativeCost += costOnThisDate;
        
        // Calculate average after adding cost
        const avgCostPerDay = cumulativeCost / daysSinceStart;
        
        // Skip first 30 days in the display
        if (daysSinceStart <= 30) {
            continue;
        }
        
        // Decide whether to include this point
        // One point per month (every 30 days)
        const isMonthlyPoint = daysSinceStart % 30 === 0;
        const isLastDay = currentDate.getTime() === endDate.getTime();
        
        if (isCostDay || isMonthlyPoint || isLastDay) {
            dailyData.push({
                date: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                avgCostPerDay: avgCostPerDay,
                isCostDay: isCostDay
            });
        }
    }
    
    return dailyData;
}

function updateChart() {
    const dailyData = calculateDailyAverages();
    
    if (dailyData.length === 0) {
        if (chart) {
            chart.destroy();
            chart = null;
        }
        return;
    }
    
    const ctx = document.getElementById('costChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailyData.map(d => d.date),
            datasets: [{
                label: 'Average Cost Per Day',
                data: dailyData.map(d => d.avgCostPerDay),
                borderColor: '#9a5b34',
                backgroundColor: 'rgba(154, 91, 52, 0.1)',
                borderWidth: 3,
                tension: 0,  // No smoothing - show the sharp lines
                pointRadius: dailyData.map(d => d.isCostDay ? 6 : 2),
                pointHoverRadius: 8,
                pointBackgroundColor: dailyData.map(d => d.isCostDay ? '#dc3545' : '#9a5b34'),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = dailyData[context.dataIndex];
                            let label = 'Avg/Day: $' + context.parsed.y.toFixed(2);
                            if (dataPoint.isCostDay) {
                                label += ' (Cost Event)';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        },
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        },
                        autoSkip: true,
                        maxTicksLimit: 30
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

function calculateMaintenanceDailyAverages() {
    if (costs.length <= 1) return [];
    
    const firstDate = new Date(costs[0].date + 'T00:00:00');
    const lastDate = new Date(costs[costs.length - 1].date + 'T00:00:00');
    const today = new Date();
    const endDate = today > lastDate ? today : lastDate;
    
    const dailyData = [];
    let cumulativeMaintCost = 0;
    
    // Build a map of maintenance costs by date (skip first entry = purchase)
    const costsByDate = {};
    costs.slice(1).forEach(cost => {
        const dateKey = new Date(cost.date + 'T00:00:00').getTime();
        if (!costsByDate[dateKey]) {
            costsByDate[dateKey] = 0;
        }
        costsByDate[dateKey] += cost.amount;
    });
    
    // Calculate daily maintenance averages
    for (let d = new Date(firstDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const dateKey = currentDate.getTime();
        const daysSinceStart = Math.floor((currentDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Check if there's a maintenance cost on this date
        const costOnThisDate = costsByDate[dateKey] || 0;
        const isCostDay = costOnThisDate > 0;
        
        // For cost days, add point BEFORE adding the cost (creates the jump)
        if (isCostDay && daysSinceStart > 30) {
            const avgBeforeCost = cumulativeMaintCost / daysSinceStart;
            dailyData.push({
                date: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                avgCostPerDay: avgBeforeCost,
                isCostDay: false
            });
        }
        
        // Add the cost
        cumulativeMaintCost += costOnThisDate;
        
        // Calculate average after adding cost
        const avgCostPerDay = cumulativeMaintCost / daysSinceStart;
        
        // Skip first 30 days in the display
        if (daysSinceStart <= 30) {
            continue;
        }
        
        // Decide whether to include this point
        const isMonthlyPoint = daysSinceStart % 30 === 0;
        const isLastDay = currentDate.getTime() === endDate.getTime();
        
        if (isCostDay || isMonthlyPoint || isLastDay) {
            dailyData.push({
                date: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                avgCostPerDay: avgCostPerDay,
                isCostDay: isCostDay
            });
        }
    }
    
    return dailyData;
}

function updateMaintenanceChart() {
    const dailyData = calculateMaintenanceDailyAverages();
    
    if (dailyData.length === 0) {
        if (maintenanceChart) {
            maintenanceChart.destroy();
            maintenanceChart = null;
        }
        return;
    }
    
    const ctx = document.getElementById('maintenanceChart').getContext('2d');
    
    if (maintenanceChart) {
        maintenanceChart.destroy();
    }
    
    maintenanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailyData.map(d => d.date),
            datasets: [{
                label: 'Maintenance Cost Per Day',
                data: dailyData.map(d => d.avgCostPerDay),
                borderColor: '#3f6e8c',
                backgroundColor: 'rgba(63, 110, 140, 0.1)',
                borderWidth: 3,
                tension: 0,
                pointRadius: dailyData.map(d => d.isCostDay ? 6 : 2),
                pointHoverRadius: 8,
                pointBackgroundColor: dailyData.map(d => d.isCostDay ? '#dc3545' : '#3f6e8c'),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = dailyData[context.dataIndex];
                            let label = 'Maint/Day: $' + context.parsed.y.toFixed(2);
                            if (dataPoint.isCostDay) {
                                label += ' (Cost Event)';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        },
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        },
                        autoSkip: true,
                        maxTicksLimit: 30
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

function updateComparison() {
    if (costs.length === 0) return;
    
    const purchasePrice = costs[0].amount;
    const maintenanceCost = costs.slice(1).reduce((sum, cost) => sum + cost.amount, 0);
    const totalCost = purchasePrice + maintenanceCost;
    
    const firstDate = new Date(costs[0].date + 'T00:00:00');
    const today = new Date();
    const daysOwned = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const yourCarMaintPerDay = totalCost / daysOwned;
    
    // Shared values
    const milesPerYear = parseFloat(document.getElementById('milesPerYear').value) || CONFIG.milesPerYear;
    const gasPrice = parseFloat(document.getElementById('gasPrice').value) || CONFIG.gasPricePerGallon;
    const currentInsPerMonth = parseFloat(document.getElementById('currentIns').value) || CONFIG.currentInsurancePerMonth;
    
    // Current car costs
    const currentMPG = CONFIG.currentCarMPG;
    const currentFuelPerDay = (milesPerYear / currentMPG * gasPrice) / 365;
    const currentInsPerDay = (currentInsPerMonth * 12) / 365;
    const yourTotalPerDay = yourCarMaintPerDay + currentFuelPerDay + currentInsPerDay;
    
    // Used car calculations
    const usedCarPrice = parseFloat(document.getElementById('usedCarPrice').value) || CONFIG.usedCarPrice;
    const usedCarRate = parseFloat(document.getElementById('usedCarRate').value) || CONFIG.usedCarInterestRate;
    const usedCarTerm = parseFloat(document.getElementById('usedCarTerm').value) || CONFIG.usedCarLoanTermYears;
    const usedCarMPG = parseFloat(document.getElementById('usedCarMPG').value) || CONFIG.usedCarMPG;
    const usedCarMaint = parseFloat(document.getElementById('usedCarMaint').value) || CONFIG.usedCarMaintenancePerDay;
    const usedCarIns = parseFloat(document.getElementById('usedCarIns').value) || CONFIG.usedCarInsurancePerMonth;
    
    const usedLoanPerDay = calculateLoanPaymentPerDay(usedCarPrice, usedCarRate, usedCarTerm);
    const usedFuelPerDay = (milesPerYear / usedCarMPG * gasPrice) / 365;
    const usedInsPerDay = (usedCarIns * 12) / 365;
    const usedTotalPerDay = usedLoanPerDay + usedFuelPerDay + usedCarMaint + usedInsPerDay;
    
    // New car calculations
    const newCarPrice = parseFloat(document.getElementById('newCarPrice').value) || CONFIG.newCarPrice;
    const newCarRate = parseFloat(document.getElementById('newCarRate').value) || CONFIG.newCarInterestRate;
    const newCarTerm = parseFloat(document.getElementById('newCarTerm').value) || CONFIG.newCarLoanTermYears;
    const newCarMPG = parseFloat(document.getElementById('newCarMPG').value) || CONFIG.newCarMPG;
    const newCarMaint = parseFloat(document.getElementById('newCarMaint').value) || CONFIG.newCarMaintenancePerDay;
    const newCarIns = parseFloat(document.getElementById('newCarIns').value) || CONFIG.newCarInsurancePerMonth;
    
    const newLoanPerDay = calculateLoanPaymentPerDay(newCarPrice, newCarRate, newCarTerm);
    const newFuelPerDay = (milesPerYear / newCarMPG * gasPrice) / 365;
    const newInsPerDay = (newCarIns * 12) / 365;
    const newTotalPerDay = newLoanPerDay + newFuelPerDay + newCarMaint + newInsPerDay;
    
    // Update current car display
    document.getElementById('compYourTotal').textContent = '$' + yourCarMaintPerDay.toFixed(2);
    document.getElementById('compYourFuel').textContent = '$' + currentFuelPerDay.toFixed(2);
    document.getElementById('compYourIns').textContent = '$' + currentInsPerDay.toFixed(2);
    document.getElementById('compYourGrandTotal').textContent = '$' + yourTotalPerDay.toFixed(2);
    
    // Update used car display
    document.getElementById('compUsedLoan').textContent = '$' + usedLoanPerDay.toFixed(2);
    document.getElementById('compUsedFuel').textContent = '$' + usedFuelPerDay.toFixed(2);
    document.getElementById('compUsedMaint').textContent = '$' + usedCarMaint.toFixed(2);
    document.getElementById('compUsedIns').textContent = '$' + usedInsPerDay.toFixed(2);
    document.getElementById('compUsedTotal').textContent = '$' + usedTotalPerDay.toFixed(2);
    
    // Update new car display
    document.getElementById('compNewLoan').textContent = '$' + newLoanPerDay.toFixed(2);
    document.getElementById('compNewFuel').textContent = '$' + newFuelPerDay.toFixed(2);
    document.getElementById('compNewMaint').textContent = '$' + newCarMaint.toFixed(2);
    document.getElementById('compNewIns').textContent = '$' + newInsPerDay.toFixed(2);
    document.getElementById('compNewTotal').textContent = '$' + newTotalPerDay.toFixed(2);
    
    // Verdicts
    const usedSavings = usedTotalPerDay - yourTotalPerDay;
    const newSavings = newTotalPerDay - yourTotalPerDay;
    
    // Keep vs Used
    if (usedSavings > 0) {
        document.getElementById('verdictUsed').innerHTML = '✓ Keep it!';
        document.getElementById('verdictUsed').className = 'verdict-text-small keep';
        document.getElementById('verdictUsedDetail').textContent = 
            `Save $${usedSavings.toFixed(2)}/day ($${(usedSavings * 365).toFixed(0)}/yr)`;
    } else {
        document.getElementById('verdictUsed').innerHTML = '→ Used might be better';
        document.getElementById('verdictUsed').className = 'verdict-text-small neutral';
        document.getElementById('verdictUsedDetail').textContent = 
            `Cost $${Math.abs(usedSavings).toFixed(2)}/day more ($${(Math.abs(usedSavings) * 365).toFixed(0)}/yr)`;
    }
    
    // Keep vs New
    if (newSavings > 0) {
        document.getElementById('verdictNew').innerHTML = '✓ Keep it!';
        document.getElementById('verdictNew').className = 'verdict-text-small keep';
        document.getElementById('verdictNewDetail').textContent = 
            `Save $${newSavings.toFixed(2)}/day ($${(newSavings * 365).toFixed(0)}/yr)`;
    } else {
        document.getElementById('verdictNew').innerHTML = '→ New might be better';
        document.getElementById('verdictNew').className = 'verdict-text-small neutral';
        document.getElementById('verdictNewDetail').textContent = 
            `Cost $${Math.abs(newSavings).toFixed(2)}/day more ($${(Math.abs(newSavings) * 365).toFixed(0)}/yr)`;
    }
    
    // Best option overall
    const options = [
        { name: 'Keep your 2010', cost: yourTotalPerDay },
        { name: 'Buy used (~2020)', cost: usedTotalPerDay },
        { name: 'Buy new (2025)', cost: newTotalPerDay }
    ];
    options.sort((a, b) => a.cost - b.cost);
    
    document.getElementById('verdictBest').innerHTML = options[0].name;
    document.getElementById('verdictBest').className = 'verdict-text-small best';
    document.getElementById('verdictBestDetail').textContent = 
        `$${options[0].cost.toFixed(2)}/day ($${(options[0].cost * 365).toFixed(0)}/yr)`;
}

function calculateLoanPaymentPerDay(principal, annualRate, years) {
    const monthlyRate = (annualRate / 100) / 12;
    const numPayments = years * 12;
    
    if (annualRate === 0) {
        return (principal / numPayments * 12) / 365;
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    return (monthlyPayment * 12) / 365;
}

