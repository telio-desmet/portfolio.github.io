# app.py
from langchain_ollama import OllamaLLM
from flask import Flask, render_template_string, request, jsonify
import traceback
import os

app = Flask(__name__)

# Template HTML intégré directement dans le code Python
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat avec Gemma 3-1B</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #141414;
        }
        .chat-container {
            margin: 0 auto;
            padding: 20px;
            max-width: 800px;
            background: linear-gradient(90deg, #5f0e0e, #3722edab);
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            font-size: 1.2rem;
            color: #ffffff;
            line-height: 1.6;
            text-align: center;
            font-family: 'Arial', sans-serif;
            font-weight: normal;
        }
        .messages {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #222222;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            background-color: #222222;
        }
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
        }
        .user-message {
            background-color: #012b58;
            color: white;
            text-align: right;
        }
        .bot-message {
            background-color: #000000;
            color: #ffffff;
            text-align: left;
        }
        .input-container {
            display: flex;
            gap: 10px;
        }
        #messageInput {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        #sendButton {
            background-color: rgb(0, 0, 0);
            border: none;
            color: rgb(255, 255, 255);
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 12px;
            width: 130px;
            height: 50px;
        }
        #sendButton:hover {
            transition: 0.5s;
            background-color: #000146;
            color: white;
        }
        #sendButton:disabled {
            background-color: #ff6666;
            cursor: not-allowed;
        }
        .loading {
            color: #666;
            font-style: italic;
        }
        .header_warning {
        margin: 0 auto;
        padding: 20px;
        max-width: 800px;
        background: linear-gradient(25deg, #220000, #6b0101c5);
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        font-size: 1.2rem;
        color: #ffffff;
        line-height: 1.6;
        text-align: center;
        font-family: 'Arial', sans-serif;
        font-weight: normal;
}
        .status {
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
            text-align: center;
        }
        .status.success {
            background-color: #d4edda;
            color: #155724;
        }
        .status.error {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="header_warning">
        <h1>Attention - Messagerie en cours de développement !</h1>
        <p>Cette messagerie est un test alpha en cours de développement et peut contenir des erreurs. Merci de votre compréhension.</p>
    </div>
    <br>
    <hr>
    <br>
    <main>
    <div class="chat-container">
        <h1>Chat avec Gemma 3</h1>
        <p>Chat avec un modèle Gemma 3 en LLM local</p>
        <div id="status" class="status"></div>
        <div id="messages" class="messages"></div>
        <div class="input-container">
            <input type="text" id="messageInput" placeholder="Tapez votre message..." />
            <button id="sendButton">Envoyer</button>
        </div>
    </div>

    <script>
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const statusDiv = document.getElementById('status');

        // Vérifier la connexion au démarrage
        fetch('/test')
            .then(response => response.json())
            .then(data => {
                if (data.model_available) {
                    statusDiv.textContent = '✅ Gemma 3-1B connecté et prêt';
                    statusDiv.className = 'status success';
                } else {
                    statusDiv.textContent = '⚠️ Gemma 3-1B non disponible - Mode test activé';
                    statusDiv.className = 'status error';
                }
            })
            .catch(error => {
                statusDiv.textContent = '❌ Erreur de connexion au serveur';
                statusDiv.className = 'status error';
            });

        function addMessage(message, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = message;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            // Afficher le message de l'utilisateur
            addMessage(message, true);
            messageInput.value = '';
            sendButton.disabled = true;
            
            // Afficher un indicateur de chargement
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message bot-message loading';
            loadingDiv.textContent = 'Génération de la réponse...';
            loadingDiv.id = 'loading-message';
            messagesDiv.appendChild(loadingDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // Envoyer la requête au serveur
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => {
                console.log('Status:', response.status);
                console.log('Headers:', response.headers);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    return response.text().then(text => {
                        throw new Error('Réponse non-JSON reçue: ' + text);
                    });
                }
                
                return response.json();
            })
            .then(data => {
                // Supprimer l'indicateur de chargement
                const loadingMessage = document.getElementById('loading-message');
                if (loadingMessage) {
                    loadingMessage.remove();
                }
                
                // Afficher la réponse du bot
                if (data.response) {
                    addMessage(data.response);
                } else if (data.error) {
                    addMessage('Erreur: ' + data.error);
                } else {
                    addMessage('Erreur: Réponse invalide du serveur');
                }
            })
            .catch(error => {
                // Supprimer l'indicateur de chargement
                const loadingMessage = document.getElementById('loading-message');
                if (loadingMessage) {
                    loadingMessage.remove();
                }
                addMessage('Erreur de connexion: ' + error.message);
                console.error('Erreur complète:', error);
            })
            .finally(() => {
                sendButton.disabled = false;
            });
        }

        // Événements
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Message de bienvenue
        addMessage('Bonjour ! Comment puis-je vous aider ?');
    </script>
    </main>
</body>
</html>
"""

# Initialisation du modèle avec gestion d'erreur
print("🔧 Initialisation de l'application...")
try:
    model = OllamaLLM(model="gemma3:1b", temperature=0.1, max_tokens=1000)
    print("✅ Modèle Ollama initialisé avec succès")
except Exception as e:
    print(f"❌ Erreur lors de l'initialisation du modèle: {e}")
    print("🔄 L'application fonctionnera en mode test")
    model = None

@app.route('/')
def home():
    print("📄 Page d'accueil demandée")
    return render_template_string(HTML_TEMPLATE)

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    print(f"📍 Méthode: {request.method}")
    print(f"📍 URL: {request.url}")
    
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        print("📨 Requête POST reçue sur /chat")
        
        # Vérifier le contenu de la requête
        if not request.is_json:
            print("❌ Pas de données JSON")
            return jsonify({'error': 'Content-Type doit être application/json'}), 400
            
        data = request.get_json()
        if not data:
            print("❌ Données JSON vides")
            return jsonify({'error': 'Aucune donnée JSON reçue'}), 400
            
        user_message = data.get('message')
        print(f"💬 Message reçu: {user_message}")
        
        if not user_message:
            return jsonify({'error': 'Aucun message fourni'}), 400
        
        # Générer la réponse
        if model:
            print("🤖 Utilisation du modèle Ollama...")
            try:
                response = model.invoke(user_message)
                print(f"✅ Réponse générée: {response[:50]}...")
            except Exception as e:
                print(f"❌ Erreur modèle: {e}")
                response = f"Erreur du modèle: {str(e)}"
        else:
            print("🔄 Mode test - pas de modèle")
            response = f"Mode test - Echo: {user_message}"
        
        return jsonify({'response': response})
        
    except Exception as e:
        print(f"❌ Erreur dans /chat: {e}")
        print(traceback.format_exc())
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

@app.route('/test')
def test():
    print("🧪 Test endpoint appelé")
    return jsonify({
        'status': 'Server is running', 
        'model_available': model is not None,
        'python_version': f"{os.sys.version_info.major}.{os.sys.version_info.minor}"
    })

if __name__ == '__main__':
    print("🚀 Démarrage du serveur Flask...")
    print("📍 URL: http://127.0.0.1:5000")
    print("📍 Test: http://127.0.0.1:5000/test")
    print("🛑 CTRL+C pour arrêter")
    print("-" * 40)
    
    try:
        app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=False)
    except KeyboardInterrupt:
        print("\n👋 Serveur arrêté")
    except Exception as e:
        print(f"\n❌ Erreur de démarrage: {e}")