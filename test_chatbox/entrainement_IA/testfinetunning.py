import pandas as pd
import numpy as np

# Création d'un dataset RH d'exemple
np.random.seed(42)

# Données d'exemple pour les entretiens RH
questions_rh = [
    "Parlez-moi de votre expérience professionnelle",
    "Quelles sont vos principales compétences ?",
    "Pourquoi voulez-vous rejoindre notre entreprise ?",
    "Comment gérez-vous le stress au travail ?",
    "Décrivez un défi professionnel que vous avez surmonté",
    "Quels sont vos objectifs de carrière ?",
    "Comment travaillez-vous en équipe ?",
    "Quelle est votre plus grande force ?",
    "Quelle est votre plus grande faiblesse ?",
    "Où vous voyez-vous dans 5 ans ?"
]

reponses_exemples = [
    "J'ai 5 ans d'expérience en développement logiciel, principalement en Python et JavaScript. J'ai travaillé sur des projets web et des APIs REST.",
    "Mes principales compétences incluent la programmation Python, l'analyse de données, la gestion de projet et la communication interpersonnelle.",
    "Votre entreprise est leader dans l'innovation technologique et partage mes valeurs de développement durable et d'excellence technique.",
    "Je gère le stress en priorisant mes tâches, en pratiquant la méditation et en maintenant un équilibre vie professionnelle/personnelle.",
    "J'ai dû migrer un système legacy vers une nouvelle architecture en 3 mois. J'ai planifié méthodiquement et coordonné avec toutes les équipes.",
    "Je souhaite évoluer vers un poste de lead technique tout en continuant à développer mes compétences en management d'équipe.",
    "Je privilégie la communication ouverte, l'écoute active et la collaboration. J'aime partager mes connaissances et apprendre des autres.",
    "Ma plus grande force est ma capacité d'adaptation et mon approche analytique pour résoudre les problèmes complexes.",
    "Je peux parfois être perfectionniste, mais j'apprends à équilibrer qualité et délais en définissant des priorités claires.",
    "Dans 5 ans, je me vois dans un rôle de leadership technique, contribuant à l'innovation et au développement d'une équipe talentueuse."
]

# Génération du dataset
data = []
for i in range(100):
    question = np.random.choice(questions_rh)
    # Simulation de réponses variées
    if "expérience" in question.lower():
        reponse = reponses_exemples[0]
    elif "compétences" in question.lower():
        reponse = reponses_exemples[1]
    elif "entreprise" in question.lower():
        reponse = reponses_exemples[2]
    elif "stress" in question.lower():
        reponse = reponses_exemples[3]
    elif "défi" in question.lower():
        reponse = reponses_exemples[4]
    elif "objectifs" in question.lower():
        reponse = reponses_exemples[5]
    elif "équipe" in question.lower():
        reponse = reponses_exemples[6]
    elif "force" in question.lower():
        reponse = reponses_exemples[7]
    elif "faiblesse" in question.lower():
        reponse = reponses_exemples[8]
    else:
        reponse = reponses_exemples[9]

    data.append({
        'question': question,
        'reponse': reponse,
        'contexte': 'entretien_rh'
    })

df = pd.DataFrame(data)
df.to_csv('dataset_rh.csv', index=False, encoding='utf-8')
print("Dataset RH créé avec succès!")
print(f"Nombre d'exemples: {len(df)}")
print("\nAperçu du dataset:")
print(df.head())