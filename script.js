// Initialize AOS scroll animations
AOS.init({
  duration: 1000,
  once: true,
  offset: 50,
});

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
  });
}

// Close mobile menu when a link is clicked
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('show');
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============ STREAK WIDGET ============
(function () {
  const STORAGE_KEY = 'streakTrackerData';
  const today = () => new Date().toISOString().split('T')[0];

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { tasks: [], lastCheckedDate: null };
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function checkStreaks(data) {
    const currentDate = today();
    if (data.lastCheckedDate === currentDate) return data;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    data.tasks = data.tasks.map(task => {
      if (task.lastCompletedDate !== yesterdayStr && task.lastCompletedDate !== currentDate) {
        task.streak = 0;
      }
      return task;
    });

    data.lastCheckedDate = currentDate;
    saveData(data);
    return data;
  }

  function renderTasks(data) {
    const taskList = document.getElementById('task-list');
    const reminder = document.getElementById('streak-reminder');
    const summary = document.getElementById('streak-summary');
    const currentDate = today();

    taskList.innerHTML = '';
    let allCompleted = true;
    let totalStreak = 0;

    data.tasks.forEach(task => {
      const isCompleted = task.lastCompletedDate === currentDate;
      if (!isCompleted) allCompleted = false;
      totalStreak += task.streak;

      const li = document.createElement('li');
      li.className = `task-item${isCompleted ? ' completed' : ''}`;

      li.innerHTML = `
        <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${isCompleted ? 'checked' : ''} />
        <span class="task-name">${escapeHtml(task.name)}</span>
        <span class="streak-badge ${task.streak === 0 ? 'zero' : ''}">🔥 ${task.streak}</span>
        <button class="task-delete" data-id="${task.id}" aria-label="Delete task">&times;</button>
      `;

      taskList.appendChild(li);
    });

    if (data.tasks.length > 0 && !allCompleted) {
      reminder.classList.remove('hidden');
    } else {
      reminder.classList.add('hidden');
    }

    if (data.tasks.length > 0) {
      summary.innerHTML = `<span class="summary-badge">Total: ${totalStreak} 🔥</span>`;
    } else {
      summary.innerHTML = '<p style="font-size:0.85rem;color:#64748b;">No tasks yet. Add one below!</p>';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function addTask(name) {
    const data = loadData();
    const newTask = {
      id: Date.now(),
      name: name.trim(),
      streak: 0,
      lastCompletedDate: null
    };
    data.tasks.push(newTask);
    saveData(data);
    renderTasks(data);
  }

  function toggleTask(id) {
    const data = loadData();
    const currentDate = today();
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;

    if (task.lastCompletedDate === currentDate) {
      task.streak = Math.max(0, task.streak - 1);
      task.lastCompletedDate = null;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (task.lastCompletedDate === yesterdayStr || task.streak === 0) {
        task.streak += 1;
      } else if (task.lastCompletedDate !== currentDate) {
        task.streak = 1;
      }
      task.lastCompletedDate = currentDate;
    }

    saveData(data);
    renderTasks(data);
  }

  function deleteTask(id) {
    const data = loadData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    saveData(data);
    renderTasks(data);
  }

  function startCountdown() {
    const section = document.getElementById('countdown-section');
    const timer = document.getElementById('countdown-timer');

    function update() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      const hoursLeft = diff / (1000 * 60 * 60);

      if (hoursLeft <= 2) {
        section.classList.remove('hidden');
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        timer.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        if (hoursLeft <= 0.5) {
          section.classList.add('urgent');
        } else {
          section.classList.remove('urgent');
        }
      } else {
        section.classList.add('hidden');
      }
    }

    update();
    setInterval(update, 1000);
  }

  const toggleBtn = document.getElementById('streak-toggle');
  const panel = document.getElementById('streak-panel');
  const closeBtn = document.getElementById('streak-close');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));
  }
  if (closeBtn && panel) {
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  }

  const addBtn = document.getElementById('add-task-btn');
  const input = document.getElementById('new-task-input');

  if (addBtn && input) {
    addBtn.addEventListener('click', () => {
      if (input.value.trim()) {
        addTask(input.value.trim());
        input.value = '';
      }
    });

    input.addEventListener('keypress', e => {
      if (e.key === 'Enter' && input.value.trim()) {
        addTask(input.value.trim());
        input.value = '';
      }
    });
  }

  document.getElementById('task-list').addEventListener('click', e => {
    if (e.target.classList.contains('task-checkbox')) {
      toggleTask(Number(e.target.dataset.id));
    } else if (e.target.classList.contains('task-delete')) {
      deleteTask(Number(e.target.dataset.id));
    }
  });

  const data = checkStreaks(loadData());
  renderTasks(data);
  startCountdown();
})();
