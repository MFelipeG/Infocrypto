// Aguarda o carregamento completo da página pra garantir que o Firebase esteja disponível
window.onload = function() {
    // Configuração do Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyC-1lZOaGZLOZ-RWL1IX9FnY4LJXUPyXW0",
        authDomain: "infocrypto-2025.firebaseapp.com",
        projectId: "infocrypto-2025",
        storageBucket: "infocrypto-2025.firebasestorage.app",
        messagingSenderId: "817973626061",
        appId: "1:817973626061:web:1aeaf14ea9b908592e9584",
        measurementId: "G-5HKM77NY9B"
    };

    // Inicializa o Firebase
    if (typeof firebase === 'undefined') {
        document.getElementById('login-status').textContent = 'Erro: Firebase não carregou corretamente. Verifique sua conexão ou bloqueadores.';
        return;
    }
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Mostrar/esconder a área de login
    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('login-area').style.display = 'block';
    });

    // Login com Google
    document.getElementById('google-login').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                document.getElementById('login-status').textContent = `Bem-vindo, ${user.displayName}!`;
                document.getElementById('login-area').style.display = 'none';
                document.getElementById('show-login').textContent = `Olá, ${user.displayName}`;
            })
            .catch((error) => {
                document.getElementById('login-status').textContent = `Erro: ${error.message}`;
            });
    });

    // Login com E-mail
    document.getElementById('email-login-btn').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                document.getElementById('login-status').textContent = `Bem-vindo, ${user.email}!`;
                document.getElementById('login-area').style.display = 'none';
                document.getElementById('show-login').textContent = `Olá, ${user.email}`;
            })
            .catch((error) => {
                document.getElementById('login-status').textContent = `Erro: ${error.message}`;
            });
    });

    // Cadastro com E-mail
    document.getElementById('email-signup-btn').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                document.getElementById('login-status').textContent = `Cadastrado como ${user.email}!`;
                document.getElementById('login-area').style.display = 'none';
                document.getElementById('show-login').textContent = `Olá, ${user.email}`;
            })
            .catch((error) => {
                document.getElementById('login-status').textContent = `Erro: ${error.message}`;
            });
    });

    // Verificar se o usuário já está logado
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('show-login').textContent = `Olá, ${user.displayName || user.email}`;
        } else {
            document.getElementById('show-login').textContent = 'Login';
        }
    });

    // Teste de preços com proxy CORS (temporário)
    async function fetchCryptoPrices() {
        try {
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd';
            const response = await fetch(proxyUrl + apiUrl);
            const data = await response.json();
            document.getElementById('prices-container').innerHTML = `
                <div class="price-card"><h2>Bitcoin (BTC)</h2><p>Preço Atual: $${data.bitcoin.usd}</p></div>
                <div class="price-card"><h2>Ethereum (ETH)</h2><p>Preço Atual: $${data.ethereum.usd}</p></div>
                <div class="price-card"><h2>Solana (SOL)</h2><p>Preço Atual: $${data.solana.usd}</p></div>
                <p class="timestamp">Última atualização: ${new Date().toLocaleTimeString()}</p>`;
        } catch (error) {
            document.getElementById('prices-container').innerHTML = '<p>Erro ao carregar preços. Tente novamente mais tarde.</p>';
            console.error('Erro ao buscar preços:', error);
        }
    }

    fetchCryptoPrices();
};
