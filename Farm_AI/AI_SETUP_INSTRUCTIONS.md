# AI Plant Disease Detection Setup

To enable the AI features, you need to set up the Python environment.

## 1. Install Python
Please install Python 3.8 or later from [python.org](https://www.python.org/downloads/).
**Important:** During installation, check the box **"Add Python to PATH"**.

## 2. Setup the AI Service
Open a new terminal in the `Farm_AI` directory and run:

```bash
cd ai_service/flask-backend
pip install -r requirements.txt
python app.py
```

This will start the AI service on port 5000 (or similar).
**Note:** The Node.js backend also runs on port 5000. You might need to change the port of the Flask app in `app.py` to 5001.

## 3. Configuration
The AI service runs on port **7000** by default.
Ensure your `app.py` has:
```python
if __name__ == '__main__':
    app.run(port=7000)
```
