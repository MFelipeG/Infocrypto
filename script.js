// Aguarda o carregamento completo da página
window.onload = function() {
    setTimeout(() => {
        // Log pra verificar se o script.js está executando
        console.log('script.js carregado.');

        // Verifica se o Firebase está disponível
        if (typeof firebase === 'undefined') {
            document.getElementById('login-status').textContent = 'Erro: Firebase não carregou. Desative adblockers, verifique sua conexão ou adicione mfelipeg.github.io no Firebase Console.';
            console.error('Firebase não carregou.');
            return;
        }

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
        const app = firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();

        // Mostrar/esconder a área de login
        document.getElementById('show-login').addEventListener('click', () => {
            document.getElementById('login-area').style.display = 'block';
            console.log('Botão de login clicado.');
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
                    console.log('Login com Google bem-sucedido:', user.displayName);
                })
                .catch((error) => {
                    document.getElementById('login-status').textContent = `Erro: ${error.message}`;
                    console.error('Erro no login com Google:', error);
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
                    console.log('Login com e-mail bem-sucedido:', user.email);
                })
                .catch((error) => {
                    document.getElementById('login-status').textContent = `Erro: ${error.message}`;
                    console.error('Erro no login com e-mail:', error);
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
                    console.log('Cadastro com e-mail bem-sucedido:', user.email);
                })
                .catch((error) => {
                    document.getElementById('login-status').textContent = `Erro: ${error.message}`;
                    console.error('Erro no cadastro com e-mail:', error);
                });
        });

        // Verificar estado de autenticação
        auth.onAuthStateChanged((user) => {
            if (user) {
                document.getElementById('show-login').textContent = `Olá, ${user.displayName || user.email}`;
                console.log('Usuário logado:', user.displayName || user.email);
            } else {
                document.getElementById('show-login').textContent = 'Login';
                console.log('Nenhum usuário logado.');
            }
        });

        // Teste simples com uma API que suporta CORS
        async function fetchTestData() {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
                const data = await response.json();
                document.getElementById('prices-container').innerHTML = `
                    <div class="price-card">
                        <h2>Teste API</h2>
                        <p>Título: ${data.title}</p>
                        <p>Body: ${data.body}</p>
                    </div>`;
                console.log('Dados de teste carregados:', data);
            } catch (error) {
                document.getElementById('prices-container').innerHTML = '<p>Erro ao carregar dados de teste.</p>';
                console.error('Erro ao carregar dados de teste:', error);
            }
        }

        fetchTestData();
    }, 2000); // Aguarda 2 segundos pra garantir que os scripts carreguem
};

// Função de alternar tema (mantida)
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
    console.log('Tema alternado:', document.body.classList.contains('light') ? 'light' : 'dark');
});

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
}
