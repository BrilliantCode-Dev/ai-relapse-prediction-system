# utils.py - COMPLETE FIX WITH CORRECT MODEL PATH
import joblib
import numpy as np
from pathlib import Path
import os

# Load the model from the correct location
model_path = Path(__file__).parent  / 'relapse_model.pkl'

print(f"Looking for model at: {model_path}")
print(f"Model exists: {model_path.exists()}")

try:
    model = joblib.load(model_path)
    print("✅ Model loaded successfully!")
    print(f"Model type: {type(model)}")
    
    # Print model expectations
    if hasattr(model, 'feature_names_in_'):
        print(f"Model expects {len(model.feature_names_in_)} features")
        print(f"Features: {model.feature_names_in_}")
    if hasattr(model, 'classes_'):
        print(f"Classes: {model.classes_} (0=No relapse, 1=Relapse)")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

def predict_risk(checkin_data):
    """Predict relapse risk from check-in data"""
    
    print("\n" + "="*50)
    print("PREDICT_RISK CALLED")
    print(f"Input data: {checkin_data}")
    
    if model is None:
        print("❌ No model loaded!")
        return {
            "risk": "Medium Risk",
            "risk_score": 50,
            "prediction_text": "Model not loaded",
            "reasons": ["System error"]
        }
    
    # Helper to get values safely
    def get(key, default=0):
        val = checkin_data.get(key, default)
        if val is None or val == "":
            return default
        return val
    
    # Convert mood text to number
    mood_values = {"Good": 5, "Okay": 3, "Sad": 2, "Anxious": 2, "Angry": 1}
    mood_num = mood_values.get(get('mood', 'Okay'), 3)
    
    # Convert yes/no to 1/0
    had_craving = 1 if str(get('had_craving', 'no')).lower() == 'yes' else 0
    resisted = 1 if str(get('resisted_craving', 'no')).lower() == 'yes' else 0
    had_triggers = 1 if str(get('had_triggers', 'no')).lower() == 'yes' else 0
    isolated = 1 if str(get('isolated', 'no')).lower() == 'yes' else 0
    
    # Convert duration to number
    duration_map = {"Minutes": 1, "Less than 1 hour": 2, "Several hours": 3, "Most of the day": 4}
    duration_str = get('craving_duration', 'Minutes')
    duration_num = duration_map.get(duration_str, 1)
    
    # Get trigger list
    triggers = get('trigger_types', [])
    if isinstance(triggers, str):
        triggers = [triggers] if triggers else []
    
    # Get positive actions
    actions = get('positive_actions', [])
    if isinstance(actions, str):
        actions = [actions] if actions else []
    
    # Get all values with proper types
    mood_intensity = float(get('mood_intensity', 5))
    stress_level = float(get('stress_level', 5))
    energy_level = float(get('energy_level', 5))
    sleep_hours = float(get('sleep_hours', 7))
    confidence_val = float(get('confidence', 5))
    craving_strength = float(get('craving_strength', 5)) if had_craving else 1
    
    # Build feature array (23 features - based on your model)
    features = [
        mood_num,                                           # 0: mood
        mood_intensity,                                     # 1: mood_intensity
        stress_level,                                       # 2: stress_level
        energy_level,                                       # 3: energy_level
        sleep_hours,                                        # 4: sleep_hours
        confidence_val,                                     # 5: confidence
        had_craving,                                        # 6: had_craving
        craving_strength,                                   # 7: craving_strength
        resisted,                                           # 8: resisted_craving
        duration_num,                                       # 9: craving_duration
        had_triggers,                                       # 10: had_triggers
        isolated,                                           # 11: isolated
        1 if 'Stress' in triggers else 0,                   # 12: trigger_Stress
        1 if 'Boredom' in triggers else 0,                  # 13: trigger_Boredom
        1 if 'Loneliness' in triggers else 0,               # 14: trigger_Loneliness
        1 if 'Friends' in str(triggers) else 0,             # 15: trigger_Friends
        1 if 'Environment' in str(triggers) else 0,         # 16: trigger_Environment
        1 if 'Emotional' in str(triggers) else 0,           # 17: trigger_Emotional
        1 if 'Exercise' in actions else 0,                  # 18: action_Exercise
        1 if 'Work' in str(actions) or 'School' in str(actions) else 0,  # 19: action_Work
        1 if 'Socializing' in actions else 0,               # 20: action_Socializing
        1 if 'Hobbies' in actions else 0,                   # 21: action_Hobbies
        1 if 'Therapy' in str(actions) or 'Support' in str(actions) else 0,  # 22: action_Therapy
    ]
    
    print(f"\n🔢 Features (23 values): {features}")
    
    # Make prediction
    features_array = np.array([features])
    
    try:
        # Get probability of relapse
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features_array)[0]
            print(f"📊 Model probabilities: {probabilities}")
            risk_score = probabilities[1] * 100  # Probability of relapse (class 1)
        else:
            prediction = model.predict(features_array)[0]
            risk_score = 100 if prediction == 1 else 0
            print(f"📊 Model prediction: {prediction}")
        
        print(f"🎯 Calculated risk score: {risk_score}%")
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "High Risk"
            pred_text = "High risk of relapse"
        elif risk_score >= 40:
            risk_level = "Medium Risk"
            pred_text = "Moderate risk of relapse"
        else:
            risk_level = "Low Risk"
            pred_text = "Low risk of relapse"
        
        # Generate reasons
        reasons = []
        if stress_level >= 8:
            reasons.append("High stress levels")
        if had_craving and craving_strength >= 7:
            reasons.append("Experienced cravings")
        if isolated == 1:
            reasons.append("Social isolation")
        if confidence_val <= 3:
            reasons.append("Low confidence in recovery")
        if sleep_hours <= 5:
            reasons.append("Poor sleep")
        if had_craving and resisted == 0:
            reasons.append("Unable to resist cravings")
        
        # Add reasons to prediction text for high risk
        if risk_level == "High Risk" and reasons:
            pred_text = "High risk of relapse\n• " + "\n• ".join(reasons[:3])
        
        result = {
            "risk": risk_level,
            "risk_score": round(risk_score, 1),
            "prediction_text": pred_text,
            "reasons": reasons[:3]
        }
        
        print(f"✅ Result: {result}")
        print("="*50 + "\n")
        
        return result
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "risk": "Medium Risk",
            "risk_score": 50,
            "prediction_text": "Prediction error",
            "reasons": [str(e)]
        }