import tkinter as tk
from tkinter import simpledialog
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

class StreakWidget:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title('Streak Tracker')
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = (screen_width // 2) - 60
        y = (screen_height // 2) - 60
        self.root.geometry(f'120x120+{x}+{y}')
        self.root.configure(bg='#E8B4B0')
        self.is_expanded = False
        self.data = check_streaks(load_data())
        self.drag_start = None
        self.click_start = None

        self.frame = tk.Frame(self.root, bg='#E8B4B0')
        self.frame.pack(fill='both', expand=True)

        self.draw_compact()

        self.root.bind('<Button-1>', self.on_click_start)
        self.root.bind('<B1-Motion>', self.on_drag)
        self.root.bind('<ButtonRelease-1>', self.on_click_end)

        self.root.after(1000, self.update_countdown)
        self.root.mainloop()

    def draw_compact(self):
        for widget in self.frame.winfo_children():
            widget.destroy()
        self.root.geometry('120x120')
        self.root.configure(bg='#E8B4B0')
        self.frame.config(bg='#E8B4B0')

        total = sum(t['streak'] for t in self.data['tasks'])

        canvas = tk.Canvas(self.frame, width=120, height=120, bg='#E8B4B0', highlightthickness=0)
        canvas.pack()
        canvas.create_oval(10, 10, 110, 110, fill='#E8B4B0', outline='#d09a95', width=3)
        canvas.create_text(60, 42, text='\U0001F525', font=('Segoe UI Emoji', 24))
        canvas.create_text(60, 78, text=str(total), font=('Segoe UI', 20, 'bold'), fill='#4A3F35')

    def draw_expanded(self):
        for widget in self.frame.winfo_children():
            widget.destroy()
        width = 300
        height = 400
        self.root.geometry(f'{width}x{height}')
        self.root.configure(bg='#FFFDF8')
        self.frame.config(bg='#FFFDF8')

        header = tk.Frame(self.frame, bg='#FFFDF8')
        header.pack(fill='x', pady=5)
        tk.Label(header, text='Streak Tracker', font=('Segoe UI', 12, 'bold'), bg='#FFFDF8', fg='#4A3F35').pack(side='left', padx=10)
        tk.Button(header, text='x', font=('Segoe UI', 10, 'bold'), bg='#FFFDF8', fg='#dc3545', relief='flat', cursor='hand2', command=self.collapse).pack(side='right', padx=10)

        current_date = get_today()
        all_completed = True
        total = 0

        for task in self.data['tasks']:
            is_completed = task['lastCompletedDate'] == current_date
            if not is_completed:
                all_completed = False
            total += task['streak']

            row = tk.Frame(self.frame, bg='#d4edda' if is_completed else '#F8F4ED', padx=10, pady=5)
            row.pack(fill='x', padx=10, pady=2)

            tk.Label(row, text=task['name'], font=('Segoe UI', 9), bg=row['bg'], fg='#6c757d' if is_completed else '#4A3F35').pack(side='left', fill='x', expand=True)
            tk.Label(row, text=str(task['streak']), font=('Segoe UI', 8, 'bold'), bg='#ff6b6b' if task['streak'] > 0 else '#adb5bd', fg='#fff', padx=5, pady=2).pack(side='left', padx=2)
            tk.Button(row, text='x', font=('Segoe UI', 8), bg=row['bg'], fg='#dc3545', relief='flat', cursor='hand2', command=lambda t=task: self.delete_task(t)).pack(side='right')

            row.bind('<Button-1>', lambda e, t=task: self.toggle_task(t))
            for child in row.winfo_children():
                child.bind('<Button-1>', lambda e, t=task: self.toggle_task(t))

        if not all_completed and self.data['tasks']:
            reminder = tk.Label(self.frame, text='Incomplete tasks today!', bg='#fff3cd', fg='#856404', font=('Segoe UI', 8))
            reminder.pack(fill='x', padx=10, pady=5)

        tk.Label(self.frame, text=f'Total: {total}', font=('Segoe UI', 9, 'bold'), bg='#FFFDF8', fg='#4A3F35').pack(pady=5)

        add_frame = tk.Frame(self.frame, bg='#FFFDF8')
        add_frame.pack(fill='x', padx=10, pady=5)
        entry = tk.Entry(add_frame, font=('Segoe UI', 9), bg='#F8F4ED', relief='solid', bd=1)
        entry.pack(side='left', fill='x', expand=True, padx=(0, 5))

        def add_from_entry():
            name = entry.get().strip()
            if name:
                self.data['tasks'].append({
                    'id': int(datetime.now().timestamp() * 1000),
                    'name': name,
                    'streak': 0,
                    'lastCompletedDate': None
                })
                save_data(self.data)
                self.draw_expanded()

        tk.Button(add_frame, text='Add', font=('Segoe UI', 8, 'bold'), bg='#E8B4B0', fg='#fff', relief='flat', cursor='hand2', command=add_from_entry).pack(side='right')
        entry.bind('<Return>', lambda e: add_from_entry())

        now = datetime.now()
        midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        diff = (midnight - now).total_seconds()
        hours_left = diff / 3600

        if hours_left <= 2:
            cd_frame = tk.Frame(self.frame, bg='#dc3545' if hours_left <= 0.5 else '#f8d7da')
            cd_frame.pack(fill='x', padx=10, pady=5)
            h = int(diff // 3600)
            m = int((diff % 3600) // 60)
            s = int(diff % 60)
            tk.Label(cd_frame, text='Day ends in', font=('Segoe UI', 8), bg=cd_frame['bg'], fg='#fff' if hours_left <= 0.5 else '#721c24').pack()
            tk.Label(cd_frame, text=f'{h:02d}:{m:02d}:{s:02d}', font=('Consolas', 14, 'bold'), bg=cd_frame['bg'], fg='#fff' if hours_left <= 0.5 else '#721c24').pack()

    def on_click_start(self, event):
        self.drag_start = (event.x, event.y)
        self.click_start = (event.x, event.y)

    def on_drag(self, event):
        if self.is_expanded or not self.drag_start:
            return
        x = self.root.winfo_x() + (event.x - self.drag_start[0])
        y = self.root.winfo_y() + (event.y - self.drag_start[1])
        self.root.geometry(f'+{x}+{y}')

    def on_click_end(self, event):
        if not self.is_expanded and self.click_start:
            moved = abs(event.x - self.click_start[0]) + abs(event.y - self.click_start[1])
            if moved < 5:
                self.is_expanded = True
                self.draw_expanded()
        self.drag_start = None
        self.click_start = None

    def collapse(self):
        self.is_expanded = False
        self.draw_compact()

    def toggle_task(self, task):
        current_date = get_today()
        if task['lastCompletedDate'] == current_date:
            task['streak'] = max(0, task['streak'] - 1)
            task['lastCompletedDate'] = None
        else:
            yesterday = get_yesterday()
            if task['lastCompletedDate'] == yesterday or task['streak'] == 0:
                task['streak'] += 1
            elif task['lastCompletedDate'] != current_date:
                task['streak'] = 1
            task['lastCompletedDate'] = current_date
        save_data(self.data)
        self.draw_expanded()

    def delete_task(self, task):
        self.data['tasks'] = [t for t in self.data['tasks'] if t['id'] != task['id']]
        save_data(self.data)
        self.draw_expanded()

    def update_countdown(self):
        if self.is_expanded:
            self.draw_expanded()
        self.root.after(1000, self.update_countdown)

if __name__ == '__main__':
    StreakWidget()
