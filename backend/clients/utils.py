import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "relapse_model.pkl")
COLUMNS_PATH = os.path.join(BASE_DIR, "model_columns.pkl")

model = joblib.load(MODEL_PATH)
columns = joblib.load(COLUMNS_PATH)

def predict_risk(data):
    # 🔥 FIX LISTS HERE
    data["trigger_count"] = len(data.get("trigger_types", []))
    data["positive_actions_count"] = len(data.get("positive_actions", []))

    # REMOVE original lists
    data.pop("trigger_types", None)
    data.pop("positive_actions", None)

    # Convert yes/no → numbers
    data["isolated"] = 1 if data.get("isolated") == "yes" else 0
    data["had_craving"] = 1 if data.get("had_craving") == "yes" else 0
    data["resisted_craving"] = 1 if data.get("resisted_craving") == "yes" else 0

    # Handle null craving strength
    if data["craving_strength"] is None:
        data["craving_strength"] = 0

    df = pd.DataFrame([data])

    # Encode categorical
    df = pd.get_dummies(df)

    df = df.reindex(columns=columns, fill_value=0)

    probs = model.predict_proba(df)

    high_idx = list(model.classes_).index("High")
    probability = probs[0][high_idx]

    percentage = round(probability * 100, 2)

    if percentage < 40:
        risk = "Low Risk"
    elif percentage < 70:
        risk = "Medium Risk"
    else:
        risk = "High Risk"

    return {
        "risk": risk,
        "risk_score": percentage
    }