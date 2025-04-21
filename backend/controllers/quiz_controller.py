import os
import sys
from pathlib import Path
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
import pymongo
from datetime import datetime

# Initialize blueprint
quiz_bp = Blueprint('quiz', __name__)

# MongoDB connection
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client.quiz_planner

# Add parent directory to path to ensure imports work properly
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

# Import and initialize the question generator
try:
    from ai.question_generator import QuestionGenerator
    question_generator = QuestionGenerator()
    print("QuestionGenerator initialized successfully")
except Exception as e:
    print(f"Error initializing QuestionGenerator: {e}")
    question_generator = None

@quiz_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_quiz():
    """Generate a quiz from study material"""
    if not question_generator:
        return jsonify({"error": "Question generator not available"}), 500
    
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data or 'material_id' not in data:
        return jsonify({"error": "Material ID is required"}), 400
    
    material_id = data['material_id']
    
    # Validate ObjectId
    if not ObjectId.is_valid(material_id):
        return jsonify({"error": "Invalid material ID"}), 400
    
    # Get parameters
    num_questions = data.get('num_questions', 5)
    question_types = data.get('question_types', ["multiple_choice", "true_false", "short_answer"])
    
    # Get study material
    material = db.study_materials.find_one({
        "_id": ObjectId(material_id),
        "user_id": user_id
    })
    
    if not material:
        return jsonify({"error": "Study material not found"}), 404
    
    # Generate questions
    try:
        questions = question_generator.generate_questions(
            material['content'],
            num_questions=num_questions,
            question_types=question_types
        )
        
        # Create quiz document
        quiz = {
            "title": data.get('title', f"Quiz on {material['title']}"),
            "description": data.get('description', f"Generated quiz based on {material['title']}"),
            "questions": questions,
            "user_id": user_id,
            "material_id": material_id,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        quiz_id = db.quizzes.insert_one(quiz).inserted_id
        
        return jsonify({
            "message": "Quiz generated successfully",
            "quiz_id": str(quiz_id),
            "title": quiz["title"],
            "num_questions": len(questions)
        }), 201
    
    except Exception as e:
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500

@quiz_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_quizzes():
    """Get all quizzes for current user"""
    user_id = get_jwt_identity()
    
    quizzes = list(db.quizzes.find({"user_id": user_id}))
    
    # Convert ObjectId to string and format response
    formatted_quizzes = []
    for quiz in quizzes:
        quiz['_id'] = str(quiz['_id'])
        quiz['material_id'] = str(quiz['material_id'])
        formatted_quizzes.append({
            "id": quiz['_id'],
            "title": quiz['title'],
            "description": quiz['description'],
            "num_questions": len(quiz['questions']),
            "created_at": quiz['created_at'].isoformat(),
            "material_id": quiz['material_id']
        })
    
    return jsonify(formatted_quizzes), 200

@quiz_bp.route('/<quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    """Get a specific quiz with all questions"""
    user_id = get_jwt_identity()
    
    if not ObjectId.is_valid(quiz_id):
        return jsonify({"error": "Invalid quiz ID"}), 400
    
    quiz = db.quizzes.find_one({
        "_id": ObjectId(quiz_id),
        "user_id": user_id
    })
    
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404
    
    # Convert ObjectId to string and format dates
    quiz['_id'] = str(quiz['_id'])
    quiz['material_id'] = str(quiz['material_id'])
    quiz['created_at'] = quiz['created_at'].isoformat()
    quiz['updated_at'] = quiz['updated_at'].isoformat()
    
    return jsonify(quiz), 200

@quiz_bp.route('/<quiz_id>', methods=['DELETE'])
@jwt_required()
def delete_quiz(quiz_id):
    """Delete a quiz"""
    user_id = get_jwt_identity()
    
    if not ObjectId.is_valid(quiz_id):
        return jsonify({"error": "Invalid quiz ID"}), 400
    
    result = db.quizzes.delete_one({
        "_id": ObjectId(quiz_id),
        "user_id": user_id
    })
    
    if result.deleted_count == 0:
        return jsonify({"error": "Quiz not found or not owned by user"}), 404
    
    return jsonify({"message": "Quiz deleted successfully"}), 200