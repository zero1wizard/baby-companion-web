const sleepTracks = [
  {
    name: "雨夜白噪音",
    mood: "更适合快速安静下来",
    duration: "30 分钟",
    note: "适合刚洗完澡到入睡前的过渡。",
  },
  {
    name: "柔和钢琴",
    mood: "适合陪睡和灯光渐暗",
    duration: "20 分钟",
    note: "给家长留出整理房间和记录当天的窗口。",
  },
  {
    name: "森林风声",
    mood: "适合午睡前稳定情绪",
    duration: "25 分钟",
    note: "和轻拍、摇篮椅节奏更搭。",
  },
];

const presets = ["15 分钟", "20 分钟", "30 分钟", "45 分钟"];

const memories = [
  {
    title: "今天第一次主动拍手",
    date: "今天 17:20",
    type: "视频",
    summary: "抓到一段 12 秒的小视频，情绪很稳，笑点很明确。",
    tags: ["成长瞬间", "客厅", "晚上"],
  },
  {
    title: "午睡前翻绘本",
    date: "今天 13:10",
    type: "照片组",
    summary: "一边翻绘本一边指图，适合后面做语言启蒙时间线。",
    tags: ["阅读", "午睡前"],
  },
  {
    title: "外出散步观察树叶",
    date: "昨天 18:45",
    type: "照片",
    summary: "可归到自然感知主题，后面适合配一条成长日记。",
    tags: ["户外", "感官体验"],
  },
];

const todos = [
  {
    title: "补 13 价肺炎第 3 针预约",
    due: "本周六前",
    priority: "high",
    owner: "家长",
  },
  {
    title: "整理本周照片并挑 5 张入册",
    due: "今晚",
    priority: "medium",
    owner: "家长",
  },
  {
    title: "准备周末绘本清单",
    due: "明天",
    priority: "low",
    owner: "一起",
  },
];

let trackIndex = 0;
let activeFilter = "全部";

function renderStats() {
  const stats = [
    { label: "今日记录", value: "3 条", detail: "1 个视频 / 2 组图片" },
    { label: "待办任务", value: `${todos.length} 项`, detail: "高优 1 项待处理" },
    { label: "最近哄睡", value: "20:40", detail: "柔和钢琴 · 20 分钟" },
  ];

  document.getElementById("hero-stats").innerHTML = stats
    .map(
      ({ label, value, detail }) => `
        <article class="stat">
          <p class="section-kicker">${label}</p>
          <strong>${value}</strong>
          <p class="meta">${detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderSleep() {
  const track = sleepTracks[trackIndex];
  document.getElementById("sleep-card").innerHTML = `
    <p class="section-kicker">Now Playing</p>
    <h3>${track.name}</h3>
    <p class="meta">${track.mood} · 默认 ${track.duration}</p>
    <p style="margin-top: 14px; line-height: 1.7;">${track.note}</p>
    <div class="tags">
      <span class="tag">最近常用</span>
      <span class="tag">可离线缓存</span>
    </div>
  `;

  document.getElementById("preset-row").innerHTML = presets
    .map((preset, index) => `<button class="chip ${index === 2 ? "active" : ""}">${preset}</button>`)
    .join("");
}

function renderFilters() {
  const filters = ["全部", ...new Set(memories.flatMap((item) => item.tags))];
  document.getElementById("memory-filters").innerHTML = filters
    .map(
      (filter) => `<button class="chip ${filter === activeFilter ? "active" : ""}" data-filter="${filter}">${filter}</button>`,
    )
    .join("");
}

function renderMemories() {
  const filtered =
    activeFilter === "全部"
      ? memories
      : memories.filter((item) => item.tags.includes(activeFilter));

  document.getElementById("memory-list").innerHTML = filtered
    .map(
      (item) => `
        <article class="memory-item">
          <p class="section-kicker">${item.type}</p>
          <h3>${item.title}</h3>
          <p class="meta">${item.date}</p>
          <p style="margin-top: 10px; line-height: 1.7;">${item.summary}</p>
          <div class="tags">${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </article>
      `,
    )
    .join("");
}

function renderTodos() {
  document.getElementById("todo-badge").textContent = `${todos.filter((item) => item.priority === "high").length} 个高优先级`;
  document.getElementById("todo-list").innerHTML = todos
    .map(
      (item) => `
        <article class="todo-item" data-priority="${item.priority}">
          <div class="todo-top">
            <h3>${item.title}</h3>
            <span class="tag">${item.priority.toUpperCase()}</span>
          </div>
          <p class="todo-meta">截止：${item.due} · 负责人：${item.owner}</p>
        </article>
      `,
    )
    .join("");
}

function bindEvents() {
  document.getElementById("next-track").addEventListener("click", () => {
    trackIndex = (trackIndex + 1) % sleepTracks.length;
    renderSleep();
  });

  document.getElementById("memory-filters").addEventListener("click", (event) => {
    const filter = event.target.dataset.filter;
    if (!filter) return;
    activeFilter = filter;
    renderFilters();
    renderMemories();
  });
}

renderStats();
renderSleep();
renderFilters();
renderMemories();
renderTodos();
bindEvents();
