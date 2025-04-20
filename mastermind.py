import random

colors = ["RED", "GREEN", "BLUE", "YELLOW", "ORANGE", "PURPLE"]  # Red, Green, Blue, Yellow, Orange, Purple
code_length = 4
max_attempts = 10
attempts = 0

code = random.choices(colors, k=code_length)

print("Welcome to Mastermind!")
print(f"Available colors: {', '.join(colors)}")
print(f"Code length: {code_length}, Max attempts: {max_attempts}")

while attempts < max_attempts:
    guess = input(f"Attempt {attempts + 1}: Enter your guess (ex: Red Green Blue Yellow): ").strip().split()
    guess = [color.upper() for color in guess]  # Convert to all caps to match the colors list
        
    if len(guess) != code_length or not all(color in colors for color in guess):
        print(f"Invalid input. Please enter exactly {code_length} colors. Available colors: {', '.join(colors)}")
        continue
    
    attempts += 1
    correct_positions = sum(g == c for g, c in zip(guess, code))
    correct_colors = sum(min(guess.count(color), code.count(color)) for color in set(code))
    correct_colors -= correct_positions

    print(f"Correct positions: {correct_positions}, Correct colors in wrong position: {correct_colors}")

    if correct_positions == code_length:
        print(f"Congratulations! You've cracked the code: {code}")
        exit()
        
print(f"Sorry, you've used all your attempts. The correct code was: {code}")
