import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from datetime import datetime

# Import config
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Setup CORS
CORS(app)

# Setup JWT
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient(app.config['MONGO_URI'])
db = client.quiz_planner

# Import controllers
from controllers.auth_controller import auth_bp
from controllers.material_controller import material_bp
from controllers.quiz_controller import quiz_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(material_bp, url_prefix='/api/materials')
app.register_blueprint(quiz_bp, url_prefix='/api/quizzes')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True)