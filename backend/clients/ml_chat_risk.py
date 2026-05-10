import joblib
import os
from django.conf import settings

BASE_DIR = settings.BASE_DIR

vectorizer = joblib.load(
    os.path.join(BASE_DIR, "tfidf_vectorizer.pkl")
)

model = joblib.load(
    os.path.join(BASE_DIR, "risk_classifier.pkl")
)

def predict_chat_risk(message):

    vector = vectorizer.transform([message])

    prediction = model.predict(vector)[0]

    probability = model.predict_proba(vector)[0]

    confidence = max(probability)

    return {
        "prediction": prediction,
        "confidence": float(confidence)
    }