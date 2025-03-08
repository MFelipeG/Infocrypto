/* Estilos pra área de login (atualizado) */
.login-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #1a1a1a; /* Fundo escuro pra destacar */
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
    display: none;
    z-index: 1000;
    width: 300px; /* Largura fixa pra organização */
    text-align: center;
}

.login-title {
    font-size: 1.5em;
    color: #50fa7b; /* Verde neon pra título */
    margin-bottom: 15px;
}

.login-options {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Espaçamento entre os elementos */
}

.login-btn {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}

.google-btn {
    background-color: #4285f4; /* Azul do Google */
    color: white;
}

.google-btn:hover {
    background-color: #3267d6; /* Azul mais escuro no hover */
}

.email-btn {
    background-color: #50fa7b; /* Verde neon */
    color: black;
}

.email-btn:hover {
    background-color: #38c664; /* Verde mais escuro no hover */
}

.signup-btn {
    background-color: #bd93f9; /* Roxo suave */
    color: white;
}

.signup-btn:hover {
    background-color: #9a6fe0; /* Roxo mais escuro no hover */
}

.login-input {
    width: 100%;
    padding: 8px;
    margin: 5px 0;
    border: 1px solid #333;
    border-radius: 5px;
    background-color: #2a2a2a;
    color: #fff;
    box-sizing: border-box;
}

#login-status {
    margin-top: 10px;
    color: #ff5555; /* Vermelho pra erros */
    text-align: center;
    font-size: 0.9em;
}
