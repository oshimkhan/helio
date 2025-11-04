from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from typing import Optional
import os

# Load model
try:
    model = joblib.load("disease_model.joblib")
    print("Model loaded successfully")
    
    # Try to get feature names if available
    if hasattr(model, 'feature_names_in_'):
        print(f"Model expects features: {model.feature_names_in_}")
    elif hasattr(model, 'n_features_in_'):
        print(f"Model expects {model.n_features_in_} features")
        
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

app = FastAPI(title="Health Analysis ML API", version="1.0.0")

# Add CORS middleware
# Allow all origins in development, but you can restrict this in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define input schema
class HealthData(BaseModel):
    ammonia_ppm: Optional[float] = None
    co2_ppm_mq: Optional[float] = None
    benzene_ppm: Optional[float] = None
    co2_ppm_mhz19: Optional[float] = None
    ethanol_ppm: Optional[float] = None
    vocs_ppm_mics: Optional[float] = None
    acetone_ppm_qcm: Optional[float] = None
    voc_type_chemo: Optional[str] = None
    voc_value_ppm_chemo: Optional[float] = None
    heart_rate_bpm: Optional[int] = None
    pulse_bpm: Optional[int] = None
    spo2_percent: Optional[float] = None
    body_temp_c: Optional[float] = None
    ecg_signal_raw: Optional[str] = None
    ecg_rhythm_type: Optional[str] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    mean_bp: Optional[int] = None

@app.get("/")
def read_root():
    return {"message": "Health Analysis ML API", "status": "running", "model_loaded": model is not None}

@app.post("/predict")
def predict(data: HealthData):
    if model is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    try:
        # Convert input to DataFrame
        df = pd.DataFrame([data.dict()])
        
        # Handle the exact data format - all features as expected by model
        input_data = data.dict()
        
        # All features in the exact order the model expects
        all_features = [
            'ammonia_ppm', 'co2_ppm_mq', 'benzene_ppm', 'co2_ppm_mhz19', 
            'ethanol_ppm', 'vocs_ppm_mics', 'acetone_ppm_qcm', 'voc_type_chemo',
            'voc_value_ppm_chemo', 'heart_rate_bpm', 'pulse_bpm', 'spo2_percent', 
            'body_temp_c', 'ecg_signal_raw', 'ecg_rhythm_type', 'systolic_bp', 
            'diastolic_bp', 'mean_bp'
        ]
        
        # Create clean data with all features
        clean_data = {}
        for feature in all_features:
            value = input_data.get(feature)
            if feature in ['voc_type_chemo', 'ecg_signal_raw', 'ecg_rhythm_type']:
                # Handle categorical features - encode them as numeric
                if value is not None and str(value).strip():
                    # Simple encoding: convert to hash for consistency
                    clean_data[feature] = hash(str(value)) % 1000  # Keep it small
                else:
                    clean_data[feature] = 0
            else:
                # Handle numeric features
                if value is not None:
                    clean_data[feature] = float(value)
                else:
                    clean_data[feature] = 0.0
        
        # Create DataFrame for prediction
        df = pd.DataFrame([clean_data])
        
        print(f"Input data shape: {df.shape}")
        print(f"Features: {list(df.columns)}")
        print(f"Sample values: {df.iloc[0].to_dict()}")
        
        # Get predictions
        probs = model.predict_proba(df)
        
        # Define disease labels (adjust based on your model)
        labels = ["Lung Infection", "Hypotension", "Inflammation"]
        
        # Convert probabilities to dict
        output = {}
        for i, label in enumerate(labels):
            if i < probs.shape[1]:
                output[label] = float(probs[0][i])
        
        return {
            "success": True,
            "probabilities": output,
            "model_info": {
                "features_used": len(df.columns),
                "prediction_confidence": float(np.max(probs))
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)