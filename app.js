const storageKeys = {
  memories: "baby-companion-memories",
  todos: "baby-companion-todos",
  sleepHistory: "baby-companion-sleep-history",
  sleepPreset: "baby-companion-sleep-preset",
  sleepTrackIndex: "baby-companion-sleep-track-index",
  activeSleepSession: "baby-companion-active-sleep-session",
};

const sleepTracks = [
  {
    name: "雨夜白噪音",
    mood: "适合洗澡后快速收心",
    duration: "30 分钟",
    note: "压低环境噪声，帮助家里进入固定睡前节奏。",
  },
  {
    name: "柔和钢琴",
    mood: "适合陪睡和房间灯光渐暗",
    duration: "20 分钟",
    note: "适合入睡前的最后整理和轻声互动。",
  },
  {
    name: "森林风声",
    mood: "适合午睡前稳定情绪",
    duration: "25 分钟",
    note: "和轻拍、摇篮椅节奏配合更自然。",
  },
  {
    name: "海浪摇篮曲",
    mood: "适合傍晚过渡到夜间",
    duration: "45 分钟",
    note: "适合容易被外界打断的晚间入睡场景。",
  },
];

const defaultMemories = [
  {
    id: "memory-1",
    title: "今天第一次主动拍手",
    date: "今天 17:20",
    type: "视频",
    summary: "抓到一段 12 秒的小视频，情绪很稳，笑点很明确。",
    tags: ["成长瞬间", "客厅", "晚上"],
    favorite: true,
  },
  {
    id: "memory-2",
    title: "午睡前翻绘本",
    date: "今天 13:10",
    type: "照片组",
    summary: "一边翻绘本一边指图，适合后面做语言启蒙时间线。",
    tags: ["阅读", "午睡前"],
    favorite: false,
  },
  {
    id: "memory-3",
    title: "外出散步观察树叶",
    date: "昨天 18:45",
    type: "照片",
    summary: "可归到自然感知主题，后面适合配一条成长日记。",
    tags: ["户外", "感官体验"],
    favorite: false,
  },
];

const defaultTodos = [
  {
    id: "todo-1",
    title: "补 13 价肺炎第 3 针预约",
    due: "本周六前",
    priority: "high",
    owner: "家长",
    completed: false,
  },
  {
    id: "todo-2",
    title: "整理本周照片并挑 5 张入册",
    due: "今晚",
    priority: "medium",
    owner: "家长",
    completed: false,
  },
  {
    id: "todo-3",
    title: "准备周末绘本清单",
    due: "明天",
    priority: "low",
    owner: "一起",
    completed: false,
  },
];

const defaultSleepHistory = [
  {
    id: "sleep-1",
    trackName: "柔和钢琴",
    preset: "20 分钟",
    startedAt: "昨天 20:40",
    status: "completed",
    outcome: "14 分钟后入睡",
  },
  {
    id: "sleep-2",
    trackName: "森林风声",
    preset: "25 分钟",
    startedAt: "昨天 13:05",
    status: "completed",
    outcome: "8 分钟后午睡成功",
  },
];

let trackIndex = loadNumber(storageKeys.sleepTrackIndex, 0);
let selectedPreset = loadString(storageKeys.sleepPreset, "20 分钟");
let activeMemoryFilter = "全部";
let activeTodoFilter = "进行中";
let memories = loadCollection(storageKeys.memories, defaultMemories);
let todos = loadCollection(storageKeys.todos, defaultTodos);
let sleepHistory = loadCollection(storageKeys.sleepHistory, defaultSleepHistory);
let activeSleepSession = loadObject(storageKeys.activeSleepSession, null);

function loadCollection(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadObject(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadString(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function loadNumber(key, fallback) {
  const value = Number(loadString(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

function saveState() {
  try {
    localStorage.setItem(storageKeys.memories, JSON.stringify(memories));
    localStorage.setItem(storageKeys.todos, JSON.stringify(todos));
    localStorage.setItem(storageKeys.sleepHistory, JSON.stringify(sleepHistory));
    localStorage.setItem(storageKeys.sleepPreset, selectedPreset);
    localStorage.setItem(storageKeys.sleepTrackIndex, String(trackIndex));

    if (activeSleepSession) {
      localStorage.setItem(storageKeys.activeSleepSession, JSON.stringify(activeSleepSession));
    } else {
      localStorage.removeItem(storageKeys.activeSleepSession);
    }
  } catch {
    // The app remains usable even if persistence is blocked.
  }
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

function getPriorityLabel(priority) {
  return {
    high: "高优先级",
    medium: "中优先级",
    low: "低优先级",
  }[priority];
}

function formatNow() {
  const now = new Date();
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function minutesSince(timestamp) {
  const diff = Math.max(Date.now() - timestamp, 60 * 1000);
  return Math.round(diff / (60 * 1000));
}

function renderStats() {
  const openTodos = todos.filter((item) => !item.completed);
  const favoriteMemories = memories.filter((item) => item.favorite);
  const latestSleep = sleepHistory[0];

  const stats = [
    {
      label: "待处理事项",
      value: `${openTodos.length} 项`,
      detail: `${openTodos.filter((item) => item.priority === "high").length} 个高优先级`,
    },
    {
      label: "重点成长记录",
      value: `${favoriteMemories.length} 条`,
      detail: `总记录 ${memories.length} 条`,
    },
    {
      label: "最近哄睡",
      value: latestSleep ? latestSleep.preset : "暂无",
      detail: latestSleep ? `${latestSleep.trackName} · ${latestSleep.outcome}` : "还没有记录",
    },
  ];

  document.getElementById("hero-stats").innerHTML = stats
    .map(
      ({ label, value, detail }) => `
        <article class="stat">
          <p class="section-kicker">${escapeHtml(label)}</p>
          <strong>${escapeHtml(value)}</strong>
          <p class="meta">${escapeHtml(detail)}</p>
        </article>
      `,
    )
    .join("");
}

function renderSleep() {
  const track = sleepTracks[trackIndex];
  const currentStatus = activeSleepSession
    ? `进行中 · ${escapeHtml(activeSleepSession.startedAt)} 开始`
    : "尚未开始本轮哄睡";

  document.getElementById("sleep-card").innerHTML = `
    <p class="section-kicker">Now Playing</p>
    <h3>${escapeHtml(track.name)}</h3>
    <p class="meta">${escapeHtml(track.mood)} · 建议 ${escapeHtml(track.duration)}</p>
    <p class="body-copy">${escapeHtml(track.note)}</p>
    <div class="tags">
      <span class="tag">${escapeHtml(selectedPreset)} 定时</span>
      <span class="tag">${activeSleepSession ? "已开始流程" : "等待开始"}</span>
    </div>
    <p class="sleep-status">${currentStatus}</p>
  `;

  document.getElementById("preset-row").innerHTML = ["15 分钟", "20 分钟", "25 分钟", "30 分钟", "45 分钟"]
    .map(
      (preset) =>
        `<button class="chip ${preset === selectedPreset ? "active" : ""}" data-preset="${preset}" type="button">${preset}</button>`,
    )
    .join("");

  document.getElementById("finish-session").disabled = !activeSleepSession;
  document.getElementById("start-session").textContent = activeSleepSession ? "重新开始本次哄睡" : "开始本次哄睡";
}

function renderSleepHistory() {
  document.getElementById("sleep-history-badge").textContent = `${sleepHistory.length} 条记录`;
  document.getElementById("sleep-history").innerHTML = sleepHistory
    .slice(0, 4)
    .map(
      (item) => `
        <article class="list-item">
          <div class="list-item-top">
            <h3>${escapeHtml(item.trackName)}</h3>
            <span class="tag">${escapeHtml(item.preset)}</span>
          </div>
          <p class="meta">${escapeHtml(item.startedAt)}</p>
          <p class="body-copy">${escapeHtml(item.outcome)}</p>
        </article>
      `,
    )
    .join("");
}

function renderMemoryFilters() {
  const filters = ["全部", "重点", ...new Set(memories.flatMap((item) => item.tags))];
  document.getElementById("memory-filters").innerHTML = filters
    .map(
      (filter) =>
        `<button class="chip ${filter === activeMemoryFilter ? "active" : ""}" data-memory-filter="${escapeHtml(filter)}" type="button">${escapeHtml(filter)}</button>`,
    )
    .join("");
}

function getFilteredMemories() {
  if (activeMemoryFilter === "全部") return memories;
  if (activeMemoryFilter === "重点") return memories.filter((item) => item.favorite);
  return memories.filter((item) => item.tags.includes(activeMemoryFilter));
}

function renderMemories() {
  const filtered = getFilteredMemories();
  document.getElementById("memory-list").innerHTML = filtered
    .map(
      (item) => `
        <article class="list-item">
          <div class="list-item-top">
            <div>
              <p class="section-kicker">${escapeHtml(item.type)}</p>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            <button class="icon-btn" data-memory-favorite="${item.id}" type="button">${item.favorite ? "已重点" : "设重点"}</button>
          </div>
          <p class="meta">${escapeHtml(item.date)}</p>
          <p class="body-copy">${escapeHtml(item.summary)}</p>
          <div class="tags">${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
        </article>
      `,
    )
    .join("");
}

function renderTodoFilters() {
  const filters = ["进行中", "已完成", "全部"];
  document.getElementById("todo-filters").innerHTML = filters
    .map(
      (filter) =>
        `<button class="chip ${filter === activeTodoFilter ? "active" : ""}" data-todo-filter="${filter}" type="button">${filter}</button>`,
    )
    .join("");
}

function getFilteredTodos() {
  if (activeTodoFilter === "进行中") return todos.filter((item) => !item.completed);
  if (activeTodoFilter === "已完成") return todos.filter((item) => item.completed);
  return todos;
}

function renderTodos() {
  const filtered = getFilteredTodos();
  document.getElementById("todo-list").innerHTML = filtered
    .map(
      (item) => `
        <article class="list-item todo-item ${item.completed ? "is-complete" : ""}" data-priority="${item.priority}">
          <div class="list-item-top">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p class="todo-meta">截止：${escapeHtml(item.due)} · 负责人：${escapeHtml(item.owner)}</p>
            </div>
            <button class="icon-btn" data-todo-toggle="${item.id}" type="button">${item.completed ? "转回进行中" : "标记完成"}</button>
          </div>
          <div class="tags">
            <span class="tag">${escapeHtml(getPriorityLabel(item.priority))}</span>
            <span class="tag">${item.completed ? "已完成" : "待处理"}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function rerender() {
  renderStats();
  renderSleep();
  renderSleepHistory();
  renderMemoryFilters();
  renderMemories();
  renderTodoFilters();
  renderTodos();
}

function addMemory(form) {
  const formData = new FormData(form);
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  memories = [
    {
      id: createId("memory"),
      title: String(formData.get("title")).trim(),
      summary: String(formData.get("summary")).trim(),
      type: String(formData.get("type")).trim(),
      date: formatNow(),
      tags: tags.length ? tags : ["未分类"],
      favorite: false,
    },
    ...memories,
  ];

  form.reset();
  saveState();
  rerender();
}

function addTodo(form) {
  const formData = new FormData(form);
  todos = [
    {
      id: createId("todo"),
      title: String(formData.get("title")).trim(),
      due: String(formData.get("due")).trim(),
      owner: String(formData.get("owner")).trim(),
      priority: String(formData.get("priority")).trim(),
      completed: false,
    },
    ...todos,
  ];

  form.reset();
  form.elements.priority.value = "medium";
  saveState();
  rerender();
}

function startSleepSession() {
  const track = sleepTracks[trackIndex];
  activeSleepSession = {
    id: createId("sleep-session"),
    trackName: track.name,
    preset: selectedPreset,
    startedAt: formatNow(),
    timestamp: Date.now(),
  };
  saveState();
  rerender();
}

function finishSleepSession() {
  if (!activeSleepSession) return;

  const elapsedMinutes = minutesSince(activeSleepSession.timestamp);
  sleepHistory = [
    {
      id: createId("sleep"),
      trackName: activeSleepSession.trackName,
      preset: activeSleepSession.preset,
      startedAt: activeSleepSession.startedAt,
      status: "completed",
      outcome: `${elapsedMinutes} 分钟后入睡`,
    },
    ...sleepHistory,
  ].slice(0, 8);

  activeSleepSession = null;
  saveState();
  rerender();
}

function bindEvents() {
  document.getElementById("next-track").addEventListener("click", () => {
    trackIndex = (trackIndex + 1) % sleepTracks.length;
    saveState();
    renderSleep();
  });

  document.getElementById("preset-row").addEventListener("click", (event) => {
    const preset = event.target.dataset.preset;
    if (!preset) return;
    selectedPreset = preset;
    saveState();
    renderSleep();
  });

  document.getElementById("start-session").addEventListener("click", startSleepSession);
  document.getElementById("finish-session").addEventListener("click", finishSleepSession);

  document.getElementById("memory-form").addEventListener("submit", (event) => {
    event.preventDefault();
    addMemory(event.currentTarget);
  });

  document.getElementById("todo-form").addEventListener("submit", (event) => {
    event.preventDefault();
    addTodo(event.currentTarget);
  });

  document.getElementById("memory-filters").addEventListener("click", (event) => {
    const filter = event.target.dataset.memoryFilter;
    if (!filter) return;
    activeMemoryFilter = filter;
    renderMemoryFilters();
    renderMemories();
  });

  document.getElementById("todo-filters").addEventListener("click", (event) => {
    const filter = event.target.dataset.todoFilter;
    if (!filter) return;
    activeTodoFilter = filter;
    renderTodoFilters();
    renderTodos();
  });

  document.getElementById("memory-list").addEventListener("click", (event) => {
    const id = event.target.dataset.memoryFavorite;
    if (!id) return;
    memories = memories.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item));
    saveState();
    renderStats();
    renderMemoryFilters();
    renderMemories();
  });

  document.getElementById("todo-list").addEventListener("click", (event) => {
    const id = event.target.dataset.todoToggle;
    if (!id) return;
    todos = todos.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
    saveState();
    renderStats();
    renderTodos();
  });
}

rerender();
bindEvents();
