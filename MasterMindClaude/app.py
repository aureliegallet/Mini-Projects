# app.py
from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

## MASTERMIND
# Generate secret code
def generate_secret_code():
    colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange']
    return [random.choice(colors) for _ in range(4)]
# Global variable to store the secret code
SECRET_CODE = generate_secret_code()


@app.route('/')
def index():
    return render_template('index.html')


## MASTERMIND
@app.route('/mastermind')
def mastermind():
    return render_template('mastermind.html')

@app.route('/mastermind/check_guess', methods=['POST'])
def check_guess():
    guess = request.json['guess']
    
    # Create a copy of the secret code to work with
    code_copy = SECRET_CODE.copy()
    
    # Prepare feedback for each position
    feedback = []
    
    # First check for exact matches (right color, right position)
    for i in range(4):
        if guess[i] == SECRET_CODE[i]:
            feedback.append("correct-position")  # Green - right color, right position
        elif guess[i] in code_copy:
            feedback.append("correct-color")  # Orange - right color, wrong position
            code_copy.remove(guess[i])  # Remove the color to avoid double counting
        else:
            feedback.append("wrong")  # Black - wrong color
    
    # Check if won
    won = all(f == "correct-position" for f in feedback)
    
    return jsonify({
        'feedback': feedback,
        'won': won,
        'secretCode': SECRET_CODE if won else None
    })

@app.route('/mastermind/get_secret_code', methods=['GET'])
def get_secret_code():
    return jsonify({'secretCode': SECRET_CODE})

@app.route('/mastermind/new_game', methods=['POST'])
def new_game():
    global SECRET_CODE
    SECRET_CODE = generate_secret_code()
    return jsonify({'status': 'New game started'})
