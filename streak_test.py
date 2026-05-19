import tkinter as tk
import json
import os
from datetime import datetime, timedelta

STORAGE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'streak_data.json')

def get_today():
    return datetime.now().strftime('%Y-%m-%d')

def get_yesterday():
    return (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

def load_data():
    if os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, 'r') as f:
            return json.load(f)
    return {'tasks': [], 'lastCheckedDate': None}

def save_data(data):
    with open(STORAGE_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def check_streaks(data):
    current_date = get_today()
    if data['lastCheckedDate'] == current_date:
        return data
    yesterday = get_yesterday()
    for task in data['tasks']:
        if task['lastCompletedDate'] != yesterday and task['lastCompletedDate'] != current_date:
            task['streak'] = 0
    data['lastCheckedDate'] = current_date
    save_data(data)
    return data

root = tk.Tk()
root.title('Streak Tracker')
root.overrideredirect(True)
root.attributes('-topmost', True)
root.geometry('120x120+600+300')
root.configure(bg='#E8B4B0')

data = check_streaks(load_data())
total = sum(t['streak'] for t in data['tasks'])

canvas = tk.Canvas(root, width=120, height=120, bg='#E8B4B0', highlightthickness=0)
canvas.pack()
canvas.create_oval(10, 10, 110, 110, fill='#E8B4B0', outline='#d09a95', width=3)
canvas.create_text(60, 42, text='\U0001F525', font=('Segoe UI Emoji', 24))
canvas.create_text(60, 78, text=str(total), font=('Segoe UI', 20, 'bold'), fill='#4A3F35')

def on_close():
    root.destroy()

canvas.bind('<Double-1>', lambda e: on_close())

root.mainloop()
