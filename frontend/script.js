document.addEventListener('DOMContentLoaded', () => {
    const stockSelect = document.getElementById('stock');
    const strategySelect = document.getElementById('strategy');
    const strategyParamsDiv = document.getElementById('strategy-params');
    const runBacktestButton = document.getElementById('run-backtest');
    const chartCanvas = document.getElementById('chart');
    const volatilityChartCanvas = document.getElementById('volatility-chart');
    let chart;
    let volatilityChart;

    const fetchStocks = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/stocks');
            const stocks = await response.json();
            stocks.forEach(stock => {
                const option = document.createElement('option');
                option.value = stock.Symbol;
                option.textContent = stock['Company Name'];
                stockSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
    };

    const renderStrategyParams = (strategy) => {
        strategyParamsDiv.innerHTML = '';
        if (strategy === 'moving_average_crossover') {
            strategyParamsDiv.innerHTML = `
                <label for="short-window">Short Window:</label>
                <input type="number" id="short-window" value="5">
                <label for="long-window">Long Window:</label>
                <input type="number" id="long-window" value="10">
            `;
        }
    };

    const fetchData = async (stock, strategy, params) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/backtest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stock_symbol: stock, strategy, params })
            });
            const data = await response.json();
            renderChart(data, strategy);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchVolatility = async (stock) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/volatility?stock_symbol=${stock}`);
            const data = await response.json();
            renderVolatilityChart(data);
        } catch (error) {
            console.error('Error fetching volatility data:', error);
        }
    };

    const renderChart = (data, strategy) => {
        if (chart) {
            chart.destroy();
        }

        const labels = data.map(d => d.Date);
        const closingPrices = data.map(d => d.Close);

        const datasets = [
            {
                label: 'Close Price',
                data: closingPrices,
                borderColor: 'blue',
                fill: false
            }
        ];

        if (strategy === 'moving_average_crossover') {
            const shortWindow = document.getElementById('short-window').value;
            const longWindow = document.getElementById('long-window').value;
            datasets.push({
                label: `SMA ${shortWindow}`,
                data: data.map(d => d[`SMA_${shortWindow}`]),
                borderColor: 'green',
                fill: false
            });
            datasets.push({
                label: `SMA ${longWindow}`,
                data: data.map(d => d[`SMA_${longWindow}`]),
                borderColor: 'red',
                fill: false
            });
        } else if (strategy === 'rsi') {
            const rsiData = data.map(d => d.RSI);
            const rsiDataset = {
                label: 'RSI',
                data: rsiData,
                borderColor: 'purple',
                fill: false,
                yAxisID: 'y1'
            };
            datasets.push(rsiDataset);
        }

        const chartData = {
            labels: labels,
            datasets: datasets
        };

        const chartOptions = {
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                }
            }
        };

        if (strategy === 'rsi') {
            chartOptions.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            };
        }

        chart = new Chart(chartCanvas, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
    };

    const renderVolatilityChart = (data) => {
        if (volatilityChart) {
            volatilityChart.destroy();
        }

        const labels = data.map(d => d.Date);
        const volatility = data.map(d => d.Volatility);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Volatility',
                    data: volatility,
                    borderColor: 'orange',
                    fill: false
                }
            ]
        };

        volatilityChart = new Chart(volatilityChartCanvas, {
            type: 'line',
            data: chartData,
            options: {
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    }
                }
            }
        });
    };

    strategySelect.addEventListener('change', () => {
        renderStrategyParams(strategySelect.value);
    });

    runBacktestButton.addEventListener('click', () => {
        const selectedStock = stockSelect.value;
        const selectedStrategy = strategySelect.value;
        let params = {};
        if (selectedStrategy === 'moving_average_crossover') {
            params = {
                short_window: document.getElementById('short-window').value,
                long_window: document.getElementById('long-window').value
            };
        }
        fetchData(selectedStock, selectedStrategy, params);
        fetchVolatility(selectedStock);
    });

    // Initial data load
    fetchStocks();
    renderStrategyParams(strategySelect.value);
});
