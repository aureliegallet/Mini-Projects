import requests
import tkinter as tk
import ttkbootstrap as ttk

URL = "https://thequoteshub.com/api/"

def fetch_quote():
    try:
        response = requests.get(URL)
        response.raise_for_status() 
        data = response.json()
        quote = data["text"]
        author = data["author"]
        return quote, author
    except requests.RequestException as e:
        return "Error fetching quote", "N/A"

def update_quote():
    quote, author = fetch_quote()
    quote_label.config(text=quote)
    author_label.config(text=f"~ {author}")

root=ttk.Window(themename="darkly")
root.title("Random Quote Generator")
root.geometry("700x250")

frame = ttk.Frame(root)
frame.pack(padx=30, pady=40)

quote_label = ttk.Label(root, text="", font=("Helvetica", 16), wraplength=650)
quote_label.pack()

author_label = ttk.Label(root, text="", font=("Helvetica", 14))
author_label.pack()

ttk.Button(frame, text="Get Random Quote", command=update_quote).pack(pady=10)

root.mainloop()
