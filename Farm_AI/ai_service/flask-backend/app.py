from flask import Flask, render_template, request, jsonify, redirect
from flask_cors import CORS
import numpy as np
import pandas as pd
from utils.disease import disease_dic
import requests
import pickle
import io
import config
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
from utils.model import ResNet9
import google.generativeai as genai
import os
import json
import re

disease_classes = ["Apple___Apple_scab",
                   "Apple___Black_rot",
                   "Apple___Cedar_apple_rust",
                   "Apple___healthy",
                   "Blueberry___healthy",
                   "Cherry_(including_sour)___Powdery_mildew",
                   "Cherry_(including_sour)___healthy",
                   "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
                   "Corn_(maize)___Common_rust_",
                   "Corn_(maize)___Northern_Leaf_Blight",
                   "Corn_(maize)___healthy",
                   "Grape___Black_rot",
                   "Grape___Esca_(Black_Measles)",
                   "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
                   "Grape___healthy",
                   "Orange___Haunglongbing_(Citrus_greening)",
                   "Peach___Bacterial_spot",
                   "Peach___healthy",
                   "Pepper,_bell___Bacterial_spot",
                   "Pepper,_bell___healthy",
                   "Potato___Early_blight",
                   "Potato___Late_blight",
                   "Potato___healthy",
                   "Raspberry___healthy",
                   "Soybean___healthy",
                   "Squash___Powdery_mildew",
                   "Strawberry___Leaf_scorch",
                   "Strawberry___healthy",
                   "Tomato___Bacterial_spot",
                   "Tomato___Early_blight",
                   "Tomato___Late_blight",
                   "Tomato___Leaf_Mold",
                   "Tomato___Septoria_leaf_spot",
                   "Tomato___Spider_mites Two-spotted_spider_mite",
                   "Tomato___Target_Spot",
                   "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
                   "Tomato___Tomato_mosaic_virus",
                   "Tomato___healthy"]

def weather_fetch(city_name):
    api_key = config.weather_api_key
    base_url = "http://api.openweathermap.org/data/2.5/weather?"

    complete_url = base_url + "appid=" + api_key + "&q=" + city_name
    response = requests.get(complete_url)
    x = response.json()

    if x["cod"] != "404":
        y = x["main"]

        temperature = round((y["temp"] - 273.15), 2)
        humidity = y["humidity"]
        return temperature, humidity
    else:
        return None

# Load models once at startup for efficiency
disease_model_path = 'models/plant_disease_model.pth'
disease_model = ResNet9(3, len(disease_classes))
disease_model.load_state_dict(torch.load(disease_model_path, map_location=torch.device('cpu')))
disease_model.eval() # Set to evaluation mode

crop_recommendation_model_path = 'models/RandomForest.pkl'
try:
    with open(crop_recommendation_model_path, 'rb') as f:
        crop_recommendation_model = pickle.load(f)
except Exception as e:
    print(f"Error loading crop model: {e}")
    crop_recommendation_model = None

def predict_image(img):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.ToTensor(),
    ])
    image = Image.open(io.BytesIO(img)).convert('RGB')
    img_t = transform(image)
    img_u = torch.unsqueeze(img_t, 0)
    
    with torch.no_grad():
        yb = disease_model(img_u)
        # Get probabilities using softmax
        probs = F.softmax(yb, dim=1)
        conf, preds = torch.max(probs, dim=1)
        
    prediction = disease_classes[preds[0].item()]
    confidence = conf[0].item()
    return prediction, confidence

app = Flask(__name__)
CORS(app)

# Configure Gemini
if hasattr(config, 'gemini_api_key') and config.gemini_api_key:
    genai.configure(api_key=config.gemini_api_key)
    # Using gemini-1.5-flash for speed and vision support
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini AI initialized")
else:
    gemini_model = None
    print("Gemini AI key not found, running with local model only")

def get_gemini_prediction(img_data):
    if not gemini_model:
        return None
        
    try:
        # Construct the prompt
        prompt = """
        Analyze this plant leaf image and identify any disease. 
        Provide the response in the JSON format below. Do not include any other text, just the JSON.
        If the plant is healthy, write 'Healthy' in the Disease field.
        {
            "Crop": "Name of the crop",
            "Disease": "Name of the disease",
            "Cause": ["Cause 1", "Cause 2"],
            "Prevent_Cure": ["Step 1", "Step 2"]
        }
        """
        
        # Prepare image for Gemini
        img = Image.open(io.BytesIO(img_data))
        
        # Call Gemini Vision
        response = gemini_model.generate_content([prompt, img])
        
        # Parse response (Gemini might return markdown blocks)
        text = response.text
        print(f"Gemini raw response: {text}")
        
        # Simple regex to find the JSON object in the text
        json_match = re.search(r'\{(?:[^{}]|(?R))*\}', text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            # Ensure Cause and Prevent_Cure are lists
            if isinstance(data.get('Cause'), str):
                data['Cause'] = [data['Cause']]
            if isinstance(data.get('Prevent_Cure'), str):
                data['Prevent_Cure'] = [data['Prevent_Cure']]
            return data
        return None
    except Exception as e:
        print(f"Gemini Error: {e}")
        return None

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/check-get',methods=['GET'])
def check():
    data = {
        "message":"hello world"
    }
    return jsonify(data)

@app.route('/check-post',methods=['POST'])
def check_post():
    if request.method == 'POST':
        Name = request.json['name']
        return jsonify(Name)
    else:
        S="something went wrong!"
        return jsonify(S)

@app.route('/disease-predict', methods=['POST'])
def disease_prediction():
    if request.method == 'POST':
        file = request.files.get('file') or request.files.get('image')
        if not file:
            return jsonify({"err": "No file or image uploaded"}), 400

        try:
            print(f"Processing image: {file.filename}")
            img_data = file.read()
            
            res_data = None
            source = "Gemini AI"
            
            # --- 1. Primary: Try Gemini API first ---
            if gemini_model:
                print("Connecting to Gemini as primary analysis service...")
                res_data = get_gemini_prediction(img_data)
                if res_data:
                    print("✅ Gemini successfully identified the disease.")
            
            # --- 2. Fallback: Local Model ---
            if not res_data:
                print("⚠️ Gemini unavailable or failed. Falling back to Local Model...")
                prediction, confidence = predict_image(img_data)
                print(f"Local model predicts: {prediction} (Confidence: {confidence:.2f})")
                
                source = "Local Model"
                local_info = disease_dic.get(prediction)
                
                if local_info:
                    # Normalize local keys
                    res_data = {}
                    for k, v in local_info.items():
                        clean_key = k.strip()
                        if clean_key == "Disease": res_data["Disease"] = v
                        elif clean_key == "Crop": res_data["Crop"] = v
                        elif clean_key == "Cause": res_data["Cause"] = v if isinstance(v, list) else [v]
                        elif clean_key == "Prevent_Cure": res_data["Prevent_Cure"] = v if isinstance(v, list) else [v]
                else:
                    # Last resort fallback
                    res_data = {
                        "Crop": prediction.split('___')[0] if '___' in prediction else "Unknown",
                        "Disease": prediction.split('___')[-1].replace('_', ' ') if '___' in prediction else prediction,
                        "Cause": ["Detailed information not available in local database."],
                        "Prevent_Cure": ["Please consult an expert or try a clearer photo."]
                    }
            
            # Ensure all required fields exist and are normalized
            final_res = {
                "Crop": res_data.get("Crop", "Unknown"),
                "Disease": res_data.get("Disease", "Unknown"),
                "Cause": res_data.get("Cause", ["Information not available"]),
                "Prevent_Cure": res_data.get("Prevent_Cure", ["Information not available"]),
                "analysis_method": source
            }
            
            return jsonify(final_res)
        except Exception  as e:
            print('hello')
            print(str(e))
            err={
                "err":"something went wrong!"
            }
            return err
    else:
        s={
            "err":"oops!!"
        }
        return jsonify(s)
    
@ app.route('/crop-predict', methods=['POST'])
def crop_prediction():
    if request.method == 'POST':
        data = request.json
        if not data:
            return jsonify({"err": "No data provided"}), 400
            
        N = data.get('nitrogen')
        P = data.get('phosphorous')
        K = data.get('potassium') or data.get('pottasium')
        ph = data.get('ph')
        rainfall = data.get('rainfall')
        city = data.get('city')
        
        if not all([N, P, K, ph, rainfall, city]):
            return jsonify({"err": "Missing required fields"}), 400

        if crop_recommendation_model and weather_fetch(city) is not None:
            try:
                temperature, humidity = weather_fetch(city)
                # Convert inputs to float to ensure model compatibility
                input_data = np.array([[
                    float(N), float(P), float(K), 
                    float(temperature), float(humidity), 
                    float(ph), float(rainfall)
                ]])
                my_prediction = crop_recommendation_model.predict(input_data)
                final_prediction = my_prediction[0]
                return jsonify(final_prediction)
            except Exception as e:
                print(f"Prediction error: {e}")
                return jsonify({"err": f"Error during prediction: {str(e)}"}), 500


        else:
            ans_data="something went wrong"
            return jsonify(ans_data)
    
if __name__ == '__main__':
    app.run(port=7000)