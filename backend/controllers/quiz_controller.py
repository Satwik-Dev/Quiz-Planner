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
    
    # Add extensive debugging
    print(f"\n--- GET QUIZ REQUEST ---")
    print(f"Quiz ID: {quiz_id}")
    print(f"User ID: {user_id}")
    
    if not ObjectId.is_valid(quiz_id):
        print(f"Invalid quiz ID format: {quiz_id}")
        return jsonify({"error": "Invalid quiz ID"}), 400
    
    # Convert user_id to string if it's an ObjectId
    if isinstance(user_id, ObjectId):
        user_id = str(user_id)
    
    # Try to find the quiz
    quiz = db.quizzes.find_one({
        "_id": ObjectId(quiz_id),
        "user_id": user_id
    })
    
    if not quiz:
        print(f"Quiz not found for ID: {quiz_id}")
        
        # Check if quiz exists for any user to identify the issue
        any_quiz = db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if any_quiz:
            print(f"Quiz exists but belongs to user: {any_quiz['user_id']}")
        else:
            print(f"Quiz doesn't exist in database at all")
            
        return jsonify({"error": "Quiz not found"}), 404
    
    # Convert ObjectId to string and format dates
    quiz['_id'] = str(quiz['_id'])
    quiz['material_id'] = str(quiz['material_id'])
    quiz['created_at'] = quiz['created_at'].isoformat()
    quiz['updated_at'] = quiz['updated_at'].isoformat()
    
    print(f"Quiz found and returned successfully")
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

@quiz_bp.route('/<quiz_id>/attempt', methods=['OPTIONS'])
def quiz_attempt_options(quiz_id):
    """Handle OPTIONS request for quiz attempt endpoint"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

@quiz_bp.route('/<quiz_id>/attempt', methods=['POST'])
@jwt_required()
def submit_quiz_attempt(quiz_id):
    """Submit a quiz attempt"""
    print(f"\n--- SUBMIT QUIZ ATTEMPT ---")
    print(f"Quiz ID: {quiz_id}")
    print(f"Headers: {dict(request.headers)}")
    
    try:
        user_id = get_jwt_identity()
        print(f"User ID from JWT: {user_id}")
        
        data = request.get_json()
        print(f"Request data: {data}")
        
        # Check if data contains answers
        if not data or 'answers' not in data:
            print("Error: Missing answers in request")
            return jsonify({"error": "Quiz answers are required"}), 400
        
        answers = data['answers']
        print(f"Answers received: {answers}")
        
        # Validate quiz ID
        if not ObjectId.is_valid(quiz_id):
            return jsonify({"error": "Invalid quiz ID"}), 400
            
        # Get the quiz
        quiz = db.quizzes.find_one({
            "_id": ObjectId(quiz_id),
            "user_id": user_id
        })
        
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404
        
        # Grade the quiz
        score = 0
        results = []
        
        for i, question in enumerate(quiz['questions']):
            question_id = str(i)  # Use index as question ID
            user_answer = answers.get(question_id)
            
            # If question wasn't answered
            if user_answer is None:
                results.append({
                    "question_id": i,
                    "correct": False,
                    "correct_answer": question['correct_answer'],
                    "explanation": question['explanation']
                })
                continue
            
            # Check if answer is correct
            is_correct = False
            
            if question['type'] == 'multiple_choice':
                is_correct = user_answer == question['correct_answer']
            elif question['type'] == 'true_false':
                # Handle possible string/boolean conversion issues
                if isinstance(user_answer, str):
                    is_correct = (user_answer.lower() == 'true' and question['correct_answer'] is True) or \
                                (user_answer.lower() == 'false' and question['correct_answer'] is False)
                else:
                    is_correct = user_answer == question['correct_answer']
            elif question['type'] == 'short_answer':
                # Simple exact match for short answers
                if isinstance(user_answer, str) and isinstance(question['correct_answer'], str):
                    is_correct = user_answer.lower() == question['correct_answer'].lower()
                else:
                    is_correct = user_answer == question['correct_answer']
            
            if is_correct:
                score += 1
            
            results.append({
                "question_id": i,
                "correct": is_correct,
                "correct_answer": question['correct_answer'],
                "explanation": question['explanation']
            })
        
        # Calculate percentage
        total_questions = len(quiz['questions'])
        percentage = (score / total_questions) * 100 if total_questions > 0 else 0
        
        # Save attempt to database
        attempt = {
            "quiz_id": quiz_id,  # Store as string
            "user_id": user_id,
            "answers": answers,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "results": results,
            "created_at": datetime.now()
        }
        
        attempt_id = db.quiz_attempts.insert_one(attempt).inserted_id
        print(f"Attempt saved with ID: {attempt_id}")
        
        # Add CORS headers to response
        response = jsonify({
            "message": "Quiz attempt submitted successfully",
            "attempt_id": str(attempt_id),
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "results": results
        })
        
        return response, 201
        
    except Exception as e:
        print(f"Error in submit_quiz_attempt: {str(e)}")
        return jsonify({"error": f"Failed to submit quiz: {str(e)}"}), 500

@quiz_bp.route('/attempts', methods=['OPTIONS'])
def quiz_attempts_options():
    """Handle OPTIONS request for quiz attempts endpoint"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
    return response

@quiz_bp.route('/attempts', methods=['GET'])
@jwt_required()
def get_user_attempts():
    """Get all quiz attempts for the current user"""
    user_id = get_jwt_identity()
    
    # Get all attempts for the user
    attempts = list(db.quiz_attempts.find({"user_id": user_id}))
    
    # Convert ObjectId to string for JSON serialization
    for attempt in attempts:
        attempt['_id'] = str(attempt['_id'])
        attempt['quiz_id'] = str(attempt['quiz_id'])
        
        # Simplify response by removing detailed results
        if 'results' in attempt:
            del attempt['results']
    
    return jsonify(attempts), 200

@quiz_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_quiz_dashboard():
    """Get quiz dashboard data for the current user"""
    user_id = get_jwt_identity()
    
    print(f"\n--- GET QUIZ DASHBOARD ---")
    print(f"User ID: {user_id}")
    
    try:
        # Get all attempts for the user
        attempts = list(db.quiz_attempts.find({"user_id": user_id}).sort("created_at", -1))
        
        # Get all quizzes for the user
        quizzes = list(db.quizzes.find({"user_id": user_id}))
        
        # Create a map of quiz_id to quiz data for easy lookup
        quiz_map = {str(quiz['_id']): quiz for quiz in quizzes}
        
        # Format the data for the dashboard
        dashboard_data = []
        for attempt in attempts:
            # Convert ObjectId to string
            attempt['_id'] = str(attempt['_id'])
            quiz_id = attempt['quiz_id']
            
            # Get quiz information
            quiz = None
            if ObjectId.is_valid(quiz_id):
                quiz_object_id = ObjectId(quiz_id)
                if str(quiz_object_id) in quiz_map:
                    quiz = quiz_map[str(quiz_object_id)]
            else:
                # If quiz_id is already a string, look it up directly
                if quiz_id in quiz_map:
                    quiz = quiz_map[quiz_id]
            
            # Add quiz details to the attempt data
            if quiz:
                attempt['quiz_title'] = quiz.get('title', 'Unknown Quiz')
                attempt['quiz_description'] = quiz.get('description', '')
            else:
                attempt['quiz_title'] = 'Quiz Not Found'
                attempt['quiz_description'] = ''
            
            # Format date
            if 'created_at' in attempt:
                attempt['created_at'] = attempt['created_at'].isoformat()
            
            # Remove detailed results to make the response lighter
            if 'results' in attempt:
                del attempt['results']
            
            if 'answers' in attempt:
                del attempt['answers']
            
            dashboard_data.append(attempt)
        
        # Get quiz performance stats
        total_attempts = len(dashboard_data)
        avg_score = sum([a.get('percentage', 0) for a in dashboard_data]) / total_attempts if total_attempts > 0 else 0
        
        response = {
            "attempts": dashboard_data,
            "stats": {
                "total_attempts": total_attempts,
                "average_score": round(avg_score, 2)
            }
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error in get_quiz_dashboard: {str(e)}")
        return jsonify({"error": f"Failed to retrieve dashboard data: {str(e)}"}), 500

@quiz_bp.route('/attempts/<quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz_attempts(quiz_id):
    """Get all attempts for a specific quiz"""
    user_id = get_jwt_identity()
    
    print(f"\n--- GET QUIZ ATTEMPTS ---")
    print(f"Quiz ID: {quiz_id}")
    print(f"User ID: {user_id}")
    
    try:
        # Get all attempts for the quiz
        attempts = list(db.quiz_attempts.find({
            "quiz_id": quiz_id,
            "user_id": user_id
        }).sort("created_at", -1))  # Most recent first
        
        # Convert ObjectId to string for JSON serialization
        for attempt in attempts:
            attempt['_id'] = str(attempt['_id'])
            attempt['quiz_id'] = str(attempt['quiz_id'])
            
            # Format date
            if 'created_at' in attempt:
                attempt['created_at'] = attempt['created_at'].isoformat()
        
        return jsonify(attempts), 200
    
    except Exception as e:
        print(f"Error in get_quiz_attempts: {str(e)}")
        return jsonify({"error": f"Failed to retrieve quiz attempts: {str(e)}"}), 500

@quiz_bp.route('/diagnostics', methods=['GET'])
@jwt_required()
def quiz_diagnostics():
    """Diagnostic endpoint to check quiz data structure"""
    user_id = get_jwt_identity()
    
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        # Check quizzes
        quizzes = list(db.quizzes.find({"user_id": user_id}).limit(5))
        formatted_quizzes = []
        
        for quiz in quizzes:
            formatted_quizzes.append({
                "id": str(quiz['_id']),
                "id_type": type(quiz['_id']).__name__,
                "user_id": quiz['user_id'],
                "user_id_type": type(quiz['user_id']).__name__,
                "title": quiz.get('title', 'Unknown'),
                "questions_count": len(quiz.get('questions', []))
            })
        
        # Check attempts
        attempts = list(db.quiz_attempts.find({"user_id": user_id}).limit(5))
        formatted_attempts = []
        
        for attempt in attempts:
            formatted_attempts.append({
                "id": str(attempt['_id']),
                "quiz_id": attempt['quiz_id'],
                "quiz_id_type": type(attempt['quiz_id']).__name__,
                "user_id": attempt['user_id'],
                "user_id_type": type(attempt['user_id']).__name__,
                "score": attempt.get('score', 0),
                "created_at": attempt.get('created_at', datetime.now()).isoformat()
            })
        
        return jsonify({
            "quizzes": formatted_quizzes,
            "attempts": formatted_attempts,
            "message": "This endpoint shows the first 5 quizzes and attempts for diagnostics"
        }), 200
        
    except Exception as e:
        print(f"Error in quiz_diagnostics: {str(e)}")
        return jsonify({"error": f"Failed to retrieve diagnostics: {str(e)}"}), 500