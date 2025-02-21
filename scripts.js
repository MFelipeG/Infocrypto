const pricesContainer = document.getElementById('prices-container');
const newsContainer = document.getElementById('news-container');
const marketIndicators = document.getElementById('market-indicators');

// Buscar preços ao vivo
async function fetchCryptoPrices() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const data = await response.json();
    pricesContainer.innerHTML = `
        <div class="price-card"><h2>Bitcoin (BTC)</h2><p>$${data.bitcoin.usd}</p></div>
        <div class="price-card"><h2>Ethereum (ETH)</h2><p>$${data.ethereum.usd}</p></div>
        <div class="price-card"><h2>Solana (SOL)</h2><p>$${data.solana.usd}</p></div>`;
}

// Buscar histórico de preços para o gráfico
async function fetchPriceHistory() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1');
    const data = await response.json();
    const prices = data.prices.map(price => ({ time: new Date(price[0]).toLocaleTimeString(), value: price[1] }));

    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: prices.map(p => p.time),
            datasets: [{ label: 'Preço do Bitcoin (USD)', data: prices.map(p => p.value), borderColor: '#50fa7b', borderWidth: 2 }]
        }
    });
}

// Conversor de moedas
async function convertCrypto() {
    const amount = document.getElementById('cryptoAmount').value;
    const crypto = document.getElementById('cryptoSelect').value;

    if (!amount || amount <= 0) return alert("Insira um valor válido.");
    
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`);
    const data = await response.json();
    
    document.getElementById('conversionResult').innerText = `Valor em USD: $${(amount * data[crypto].usd).toFixed(2)}`;
}

// Buscar indicadores de mercado
async function fetchMarketData() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_market_cap=true&include_24hr_high_low=true');
    const data = await response.json();
    
    marketIndicators.innerHTML = `
        ${Object.keys(data).map(coin => `
            <div class="indicator"><h3>${coin.toUpperCase()}</h3><p>Market Cap: $${data[coin].usd_market_cap.toLocaleString()}</p></div>`).join('')}`;
}

// Inicialização
fetchCryptoPrices();
fetchPriceHistory();
fetchMarketData();
                                 
