import os
import joblib
import numpy as np   # ✅ ADD THIS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "relapse_model.pkl")

model = joblib.load(MODEL_PATH)




def preprocess_input(data):
    mood_map = {"Good": 0, "Okay": 1, "Sad": 2, "Anxious": 3, "Angry": 4}
    yes_no_map = {"yes": 1, "no": 0}

    duration_map = {
        "Minutes": 0,
        "Less than 1 hour": 1,
        "Several hours": 2,
        "Most of the day": 3
    }

    triggers = data.get("trigger_types", [])
    actions = data.get("positive_actions", [])

    return np.array([[

        # 🔹 CORE (11)
        mood_map.get(data["mood"], 0),
        data["mood_intensity"],
        data["stress_level"],
        data["energy_level"],
        data["sleep_hours"],
        data["confidence"],
        yes_no_map.get(data["had_craving"], 0),
        data.get("craving_strength") or 0,
        yes_no_map.get(data.get("resisted_craving"), 0),
        yes_no_map.get(data["had_triggers"], 0),
        yes_no_map.get(data["isolated"], 0),

        # 🔹 TRIGGERS (6)
        1 if "Stress" in triggers else 0,
        1 if "Boredom" in triggers else 0,
        1 if "Loneliness" in triggers else 0,
        1 if "Friends/Peer pressure" in triggers else 0,
        1 if "Environment (places)" in triggers else 0,
        1 if "Emotional distress" in triggers else 0,

        # 🔹 ACTIONS (5)
        1 if "Exercise" in actions else 0,
        1 if "Work/School" in actions else 0,
        1 if "Socializing" in actions else 0,
        1 if "Hobbies" in actions else 0,
        1 if "Therapy/Support group" in actions else 0,

        # 🔹 DURATION (1)
        duration_map.get(data.get("craving_duration"), 0)

    ]])

def predict_risk(data):
    processed = preprocess_input(data)

    prediction = model.predict(processed)[0]

    if hasattr(model, "predict_proba"):
        probability = model.predict_proba(processed)[0][1]
    else:
        probability = float(prediction)

    risk_score = round(probability * 100, 2)

    if probability > 0.6:
        risk = "High Risk"
        prediction_text = "High risk of relapse"
    else:
        risk = "Low Risk"
        prediction_text = "Low risk of relapse"

    reasons = []

    if data["stress_level"] > 7:
        reasons.append("High stress levels")

    if data["sleep_hours"] < 5:
        reasons.append("Poor sleep")

    if data["had_craving"] == "yes":
        reasons.append("Experienced cravings")

    if data["confidence"] < 4:
        reasons.append("Low confidence")

    if data["isolated"] == "yes":
        reasons.append("Social isolation")

    return {
        "risk": risk,
        "risk_score": risk_score,
        "prediction_text": prediction_text,
        "reasons": reasons
    }