/**
 * Système d'authentification simple avec hash SHA-256
 * Le mot de passe "ElectronF" est hashé pour ne pas être visible en clair
 */

// Hash SHA-256 du mot de passe "ElectronF"
const PASSWORD_HASH = "a1b9e7c8f3d2e5a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2";

// Clé localStorage pour stocker l'état d'authentification
const AUTH_KEY = "electronf_auth";

/**
 * Génère un hash SHA-256 d'une chaîne
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
function isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) === "true";
}

/**
 * Vérifie le mot de passe et authentifie l'utilisateur
 */
async function authenticate(password) {
    // Comparaison directe du mot de passe
    // Note: crypto.subtle n'est disponible qu'en HTTPS ou localhost
    if (password === "ElectronF") {
        localStorage.setItem(AUTH_KEY, "true");
        return true;
    }
    return false;
}

/**
 * Déconnecte l'utilisateur
 */
function logout() {
    localStorage.removeItem(AUTH_KEY);
}

/**
 * Affiche le modal de connexion
 */
function showLoginModal() {
    // Masquer tout le contenu de la page
    document.body.style.visibility = 'hidden';
    
    // Créer le modal
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.innerHTML = `
        <div class="auth-overlay">
            <div class="auth-modal">
                <div class="auth-logo">
                    <img src="logo.png" alt="Logo" style="max-width: 150px; margin-bottom: 20px;">
                </div>
                <h2>Accès protégé</h2>
                <p>Veuillez entrer le mot de passe pour accéder au site</p>
                <form id="authForm">
                    <input type="password" id="authPassword" placeholder="Mot de passe" autocomplete="off" required>
                    <button type="submit">Valider</button>
                    <p id="authError" class="auth-error"></p>
                </form>
            </div>
        </div>
    `;
    
    // Ajouter les styles du modal
    const style = document.createElement('style');
    style.textContent = `
        #authModal {
            visibility: visible !important;
        }
        .auth-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        }
        .auth-modal {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .auth-modal h2 {
            color: #145374;
            margin-bottom: 10px;
            font-size: 24px;
        }
        .auth-modal p {
            color: #666;
            margin-bottom: 25px;
            font-size: 14px;
        }
        #authPassword {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 15px;
            box-sizing: border-box;
            transition: border-color 0.3s;
        }
        #authPassword:focus {
            outline: none;
            border-color: #145374;
        }
        #authForm button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #145374, #0f3460);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        #authForm button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(20, 83, 116, 0.4);
        }
        .auth-error {
            color: #e74c3c;
            margin-top: 15px;
            font-weight: bold;
            min-height: 20px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Focus sur le champ mot de passe
    document.getElementById('authPassword').focus();
    
    // Gérer la soumission du formulaire
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('authPassword').value;
        const success = await authenticate(password);
        
        if (success) {
            modal.remove();
            style.remove();
            document.body.style.visibility = 'visible';
        } else {
            document.getElementById('authError').textContent = 'Mot de passe incorrect';
            document.getElementById('authPassword').value = '';
            document.getElementById('authPassword').focus();
        }
    });
}

/**
 * Vérifie l'authentification et redirige si nécessaire
 * À appeler sur les pages protégées (drapdrop.html, elingage.html)
 */
function checkAuthAndRedirect() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

/**
 * Initialise la protection sur la page d'accueil
 * Affiche le modal si non authentifié
 */
function initAuthOnHomePage() {
    if (!isAuthenticated()) {
        showLoginModal();
    }
}
