// ============== CONFIGURAÇÕES E CONSTANTES ==============
const CONFIG = {
    UPDATE_INTERVAL: 600000,
    NEWS_CACHE_TIME: 600000,
    MAX_NEWS: 45,
    ITEMS_PER_PAGE: 15,
    MAX_PAGES: 3
};

const CRYPTO_LIST = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'ripple', name: 'XRP', symbol: 'XRP' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    { id: 'binancecoin', name: 'BNB', symbol: 'BNB' }
];

const pricesContainer = document.getElementById('prices-container'),
    newsContainer = document.getElementById('news-container'),
    searchInput = document.getElementById('search-input'),
    themeToggle = document.getElementById('theme-toggle'),
    chartSelect = document.getElementById('chart-select'),
    chartPeriodSelect = document.getElementById('chart-period'),
    walletAddress = document.getElementById('wallet-address'),
    walletText = document.getElementById('wallet-text');

let allNews = [], lastFetchTime = null, currentPage = 1;
let chartInstance = null;
let currentChartPeriod = 30;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
});

const walletAddresses = {
    bitcoin: '1Lkpq3cwVi7wYzN3zC38padBk2Sz58Df1j',
    ethereum: '0xeE06196aDfb6c2f459dB30FC01CeCa55Ff4FcF05',
    solana: '0xeE06196aDfb6c2f459dB30FC01CeCa55Ff4FcF05',
    bnb: '0xeE06196aDfb6c2f459dB30FC01CeCa55Ff4FcF05',
    polygon: '0xeE06196aDfb6c2f459dB30FC01CeCa55Ff4FcF05'
};

function showWallet(coin) {
    walletText.innerHTML = `<strong>Endereço de Carteira ${coin.charAt(0).toUpperCase() + coin.slice(1)}:</strong><br>${walletAddresses[coin]}<br><br><em>Obrigado pelo apoio! Ajude-nos a manter o site com suas doações. Toda contribuição é valorizada! 💚</em>`;
    walletAddress.style.display = 'block';
}

function hideWallet() {
    walletAddress.style.display = 'none';
}

function toggleFavorite(coinId) {
    const index = favorites.indexOf(coinId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(coinId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    fetchCryptoPrices();
}

function isFavorite(coinId) {
    return favorites.includes(coinId);
}

async function fetchCryptoPrices() {
    try {
        const cryptoIds = CRYPTO_LIST.map(c => c.id).join(',');
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
        );
        
        if (!response.ok) throw new Error('Erro ao buscar preços');
        
        const data = await response.json();
        
        let html = '';
        const displayList = favorites.length > 0 
            ? CRYPTO_LIST.filter(c => isFavorite(c.id))
            : CRYPTO_LIST.slice(0, 8);        
        displayList.forEach(crypto => {
            const priceInfo = data[crypto.id];
            if (priceInfo) {
                const change = priceInfo.usd_24h_change || 0;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                const changeSymbol = change >= 0 ? '▲' : '▼';
                
                html += `
                    <div class="price-card">
                        <button class="favorite-btn ${isFavorite(crypto.id) ? 'favorited' : ''}" onclick="toggleFavorite('${crypto.id}')" title="Adicionar aos favoritos">
                            ${isFavorite(crypto.id) ? '⭐' : '☆'}
                        </button>
                        <h2>${crypto.name} (${crypto.symbol})</h2>
                        <p class="price">$${priceInfo.usd.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <p class="change ${changeClass}">
                            ${changeSymbol} ${Math.abs(change).toFixed(2)}% (24h)
                        </p>
                        <p class="market-cap">Cap: $${(priceInfo.usd_market_cap / 1e9).toFixed(2)}B</p>
                    </div>
                `;
            }
        });
        
        html += `<p class="timestamp">Última atualização: ${new Date().toLocaleTimeString('pt-BR')}</p>`;
        pricesContainer.innerHTML = `<div class="prices-track">${html}${html}</div>`;        
    } catch (error) {
        pricesContainer.innerHTML = '<p class="error">⚠️ Erro ao carregar preços. Tente novamente mais tarde.</p>';
        console.error('Erro ao buscar preços:', error);
    }
}

async function fetchChartData(coin, days = 30) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`);
        if (!response.ok) throw new Error('Erro ao buscar dados do gráfico');
        const data = await response.json();
        
        let step = days === 365 ? 7 : days === 90 ? 3 : 1;
        const filtered = data.prices.filter((_, index) => index % step === 0);
        
        const processedData = {
            labels: filtered.map(p => {
                const date = new Date(p[0]);
                if (days === 7) return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                if (days === 30) return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                if (days === 90) return date.toLocaleDateString('pt-BR', { month: 'short' });
                return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            }),
            data: filtered.map(p => p[1])
        };
        
        renderChart(coin, processedData, days);
    } catch (error) {
        console.error('Erro ao carregar gráfico:', error);
        document.querySelector('.chart-container').innerHTML += '<p style="color: var(--secondary);">⚠️ Erro ao carregar gráfico.</p>';
    }
}

function renderChart(coin, processedData, days) {
    const ctx = document.getElementById('crypto-chart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    
    const prices = processedData.data;
    const isPositive = prices[prices.length - 1] >= prices[0];
    const lineColor = isPositive ? '#50fa7b' : '#ff6b6b';
    
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, isPositive ? 'rgba(80, 250, 123, 0.3)' : 'rgba(255, 107, 107, 0.3)');
    gradientFill.addColorStop(1, 'rgba(80, 250, 123, 0)');
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: processedData.labels,
            datasets: [{
                label: `${coin.charAt(0).toUpperCase() + coin.slice(1)} (USD) - ${days} dias`,
                data: processedData.data,
                borderColor: lineColor,
                backgroundColor: gradientFill,
                fill: true,
                pointRadius: days > 90 ? 0 : 2,
                pointHoverRadius: 6,
                pointBackgroundColor: lineColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.3,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: lineColor,
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Preço: $${context.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                        maxTicksLimit: days === 7 ? 7 : days === 30 ? 10 : 12,
                        font: { size: 10 }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                        callback: function(value) {
                            return '$' + value.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                        },
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}

async function fetchRSSFeeds() {
    const now = new Date();
    if (lastFetchTime && (now - lastFetchTime) < CONFIG.NEWS_CACHE_TIME) {
        displayNews(allNews);
        return;
    }
    try {
        const RSS_FEEDS = [
            'https://www.coindesk.com/arc/outboundfeeds/rss/',
            'https://cointelegraph.com/rss',
            'https://livecoins.com.br/feed/rss/'
        ];
        allNews = [];
        for (const feed of RSS_FEEDS) {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feed}`);
            const data = await response.json();
            if (data.items) allNews.push(...data.items);
        }
        allNews = allNews.filter(news => (now - new Date(news.pubDate)) / (1000 * 60 * 60 * 24) <= 4);
        if (allNews.length > CONFIG.MAX_NEWS) allNews = allNews.slice(0, CONFIG.MAX_NEWS);
        lastFetchTime = now;
        displayNews(allNews);
    } catch (error) {
        newsContainer.innerHTML = '<p class="error">⚠️ Erro ao carregar notícias. Tente novamente mais tarde.</p>';
        console.error('Erro ao carregar notícias:', error);
    }
}

function displayNews(newsList) {
    newsContainer.innerHTML = '';
    const start = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const paginatedNews = newsList.slice(start, start + CONFIG.ITEMS_PER_PAGE);
    paginatedNews.forEach(article => {
        const div = document.createElement('div');
        div.className = 'news-item';
        let imageUrl = article.enclosure?.link || article.thumbnail;
        if (!imageUrl && article.description) {
            const imgMatch = article.description.match(/<img[^>]+src=["'](.*?)["']/i);
            imageUrl = imgMatch ? imgMatch[1] : 'https://via.placeholder.com/300x200';
        }
        const description = article.description?.replace(/<img[^>]*>/g, '') || 'Descrição não disponível.';
        div.innerHTML = `
            <img src="${imageUrl}" alt="Imagem da notícia" loading="lazy">
            <h3>${article.title}</h3>
            <p>${description}</p>
            <div class="like-dislike-container">
                <button class="like-btn" onclick="toggleLike(this, '${article.link}')">👍 <span>0</span></button>
                <button class="dislike-btn" onclick="toggleDislike(this, '${article.link}')">👎 <span>0</span></button>
            </div>
              <button class="share-btn">📤 Compartilhar</button>                <div class="share-options">
                    <a href="#" onclick="shareOnFacebook('${article.link}', '${article.title}')">Facebook</a>
                    <a href="#" onclick="shareOnInstagram('${article.link}', '${article.title}')">Instagram</a>
                    <a href="#" onclick="shareOnTwitter('${article.link}', '${article.title}')">X (Twitter)</a>
                    <a href="#" onclick="shareOnWhatsApp('${article.link}', '${article.title}')">WhatsApp</a>
                    <a href="#" onclick="shareByEmail('${article.link}', '${article.title}')">E-mail</a>
                    <a href="#" onclick="copyLink('${article.link}')">Copiar Link</a>
                </div>
            </div>
            <a href="${article.link}" target="_blank">Leia mais</a>`;
        newsContainer.appendChild(div);
    });
    updatePaginationControls(newsList.length);
}

function updatePaginationControls(totalItems) {
    const totalPages = Math.min(Math.ceil(totalItems / CONFIG.ITEMS_PER_PAGE), CONFIG.MAX_PAGES);
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} title="Página Anterior">&lt;</button>
        <span>${currentPage}/${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} title="Próxima Página">&gt;</button>`;
    newsContainer.appendChild(pagination);
}

function changePage(page) {
    if (page >= 1 && page <= Math.min(Math.ceil(allNews.length / CONFIG.ITEMS_PER_PAGE), CONFIG.MAX_PAGES)) {
        currentPage = page;
        displayNews(allNews);
    }
}

function searchNews() {
    const query = searchInput.value.toLowerCase();
    const filteredNews = allNews.filter(news => 
        news.title.toLowerCase().includes(query) || 
        news.description.toLowerCase().includes(query)
    );
    currentPage = 1;
    displayNews(filteredNews);
}

function toggleLike(button, articleLink) {
    const likeCount = button.querySelector('span');
    if (button.classList.contains('liked')) {
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
        button.classList.remove('liked');
    } else {
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
        button.classList.add('liked');
    }
}

function toggleDislike(button, articleLink) {
    const dislikeCount = button.querySelector('span');
    if (button.classList.contains('disliked')) {
        dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
        button.classList.remove('disliked');
    } else {
        dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;
        button.classList.add('disliked');
    }
}

function shareOnFacebook(url, title) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`, '_blank');
}

function shareOnInstagram(url, title) {
    alert('Compartilhe no Instagram manualmente!');
}

function shareOnTwitter(url, title) {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
}

function shareOnWhatsApp(url, title) {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + url)}`, '_blank');
}

function shareByEmail(url, title) {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
}

function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copiado para a área de transferência!');
    });
}

fetchCryptoPrices();
fetchChartData('bitcoin');
fetchRSSFeeds();
setInterval(fetchCryptoPrices, CONFIG.UPDATE_INTERVAL);
setInterval(fetchRSSFeeds, CONFIG.UPDATE_INTERVAL);
searchInput.addEventListener('input', searchNews);
chartSelect.addEventListener('change', (e) => {
    fetchChartData(e.target.value, currentChartPeriod);
});
if (chartPeriodSelect) {
    chartPeriodSelect.addEventListener('change', (e) => {
        currentChartPeriod = parseInt(e.target.value);
        fetchChartData(chartSelect.value, currentChartPeriod);
    });
}


// ============= FUNÇÕES PARA APOIE O CANAL =============
const WALLET_ADDRESSES = {
    bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    solana: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    bnb: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
};

function showWallet(crypto) {
    const address = WALLET_ADDRESSES[crypto];
    const walletDiv = document.getElementById('wallet-address');
    const walletText = document.getElementById('wallet-text');
    
    walletText.innerHTML = `
        <h3>Endereço ${crypto.toUpperCase()}</h3>
        <p>${address}</p>
        <button onclick="copyAddress('${address}')">📋 Copiar Endereço</button>
    `;
    
    walletDiv.classList.add('show');
    walletDiv.style.display = 'block';
}

function hideWallet() {
    const walletDiv = document.getElementById('wallet-address');
    walletDiv.classList.remove('show');
    walletDiv.style.display = 'none';
}

function copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        alert('💰 Endereço copiado! Obrigado pelo apoio!');
    }).catch(() => {
        alert('Erro ao copiar. Por favor, copie manualmente: ' + address);
    });
}
