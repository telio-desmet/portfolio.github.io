# app.py
from langchain_ollama import OllamaLLM
from flask import Flask, render_template, request, jsonify
import traceback

app = Flask(__name__)

# Initialisation du modèle avec gestion d'erreur
try:
    model = OllamaLLM(model="moondream")
    print("✅ Modèle Ollama initialisé avec succès")
except Exception as e:
    print(f"❌ Erreur lors de l'initialisation du modèle: {e}")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    print(f"📍 Méthode de la requête: {request.method}")
    print(f"📍 URL demandée: {request.url}")
    print(f"📍 Headers: {dict(request.headers)}")
    
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        print("📨 Requête reçue sur /chat")
        
        # Vérifier si le modèle est disponible
        if model is None:
            return jsonify({'error': 'Modèle Ollama non disponible. Vérifiez qu\'Ollama est démarré et que le modèle moondream est installé.'}), 500
        
        # Vérifier le contenu de la requête
        if not request.json:
            return jsonify({'error': 'Aucune donnée JSON reçue'}), 400
            
        user_message = request.json.get('message')
        print(f"💬 Message reçu: {user_message}")
        
        if not user_message:
            return jsonify({'error': 'Aucun message fourni'}), 400
        
        # Utiliser le modèle Ollama pour générer une réponse
        print("🤖 Génération de la réponse...")
        response = model.invoke(user_message)
        print(f"✅ Réponse générée: {response[:100]}...")
        
        return jsonify({'response': response})
        
    except Exception as e:
        print(f"❌ Erreur dans /chat: {e}")
        print(traceback.format_exc())
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

@app.route('/test')
def test():
    return jsonify({'status': 'Server is running', 'model_available': model is not None})

if __name__ == '__main__':
    print("🚀 Démarrage du serveur Flask...")
    app.run(debug=True, host='127.0.0.1', port=5000)