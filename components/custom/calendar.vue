<script setup lang="ts">
import { collection, getDocs, query, where } from "firebase/firestore";
import { useFirestore } from "vuefire";

import { useAuthStore } from "~/store/auth";

interface CalendarEvent {
  color: string;
  date: string;
  description?: string;
  endTime: string;
  expenseType?: string;
  id: string;
  is_all: boolean;
  is_mine: boolean | true;
  projectName?: string;
  startTime: string;
  title: string;
  userName?: string;
  users: number[];
}

const viewMode = ref<"day" | "month" | "week" | "year">("month");
const currentDate = ref(new Date());
const events = ref<CalendarEvent[]>([]);
const showEventDialog = ref(false);
const editingEvent = ref<CalendarEvent | null>(null);

// ── Day / Week drag-to-create ──────────────────────────────────────────────
const isDragging = ref(false);
const dragStart = ref<{ date: string; hour: number; minute: number } | null>(
  null
);
const dragCurrent = ref<{ date: string; hour: number; minute: number } | null>(
  null
);
const dragPreview = ref<any>(null);
// Week multi-day: set of dates currently covered by the drag
const weekDragDates = ref<string[]>([]);

// ── Month drag-to-select ───────────────────────────────────────────────────
// Keep month-drag state completely separate from week drag state
const monthDragStart = ref<null | string>(null);
const selectedDates = ref<string[]>([]);
const isMonthDragging = ref(false);

const isLoading = ref(false);
const isSaving = ref(false);

const eventForm = ref<{
  color: string;
  date: string;
  description: string;
  endTime: string;
  id?: string;
  is_all?: boolean;
  is_mine?: boolean;
  startTime: string;
  title: string;
  users: number[];
}>({
  color: "#1a73e8",
  date: "",
  description: "",
  endTime: "10:00",
  startTime: "09:00",
  title: "",
  users: [],
});

const eventColors = ref([
  { name: "Blue", value: "#1a73e8" },
  { name: "Red", value: "#d50000" },
  { name: "Green", value: "#0b8043" },
  { name: "Purple", value: "#8e24aa" },
  { name: "Orange", value: "#e67c73" },
  { name: "Teal", value: "#009688" },
  { name: "Gray", value: "#616161" },
  { name: "Pink", value: "#d81b60" },
]);

const viewModes = ref([
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
]);

const weekDays = ref(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
const weekDaysMin = ref(["M", "T", "W", "T", "F", "S", "S"]);

const currentTimePosition = ref("0px");
let timeInterval: any = null;

watch(showEventDialog, (newVal) => {
  if (!newVal) editingEvent.value = null;
});

onMounted(() => {
  loadEvents();
  updateCurrentTimePosition();
  timeInterval = setInterval(updateCurrentTimePosition, 60_000);
  // FIX: global mouseup so drag always ends even if cursor leaves the calendar
  window.addEventListener("mouseup", handleGlobalMouseUp);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
  window.removeEventListener("mouseup", handleGlobalMouseUp);
});

// ── Global mouseup handler ─────────────────────────────────────────────────
const handleGlobalMouseUp = () => {
  if (isDragging.value) endDragCreate();
  if (isMonthDragging.value) endMonthDragSelect();
};

const updateCurrentTimePosition = () => {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  currentTimePosition.value = `${mins * (48 / 60)}px`;
};

// ── Computed ──────────────────────────────────────────────────────────────

const formattedCurrentDate = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.toLocaleDateString("en-US", {
    month: "long",
  });

  if (viewMode.value === "day") {
    return `${currentDate.value.getDate()} ${month}, ${year}`;
  }
  if (viewMode.value === "week") {
    const weekStart = getWeekStart(currentDate.value);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekStart.getMonth() === weekEnd.getMonth()) return `${month} ${year}`;
    const endMonth = weekEnd.toLocaleDateString("en-US", { month: "long" });
    return `${month} – ${endMonth} ${year}`;
  }
  if (viewMode.value === "year") return `${year}`;
  return `${month} ${year}`;
});

const currentDayName = computed(() =>
  currentDate.value.toLocaleDateString("en-US", { weekday: "long" })
);
const currentDayNumber = computed(() => currentDate.value.getDate());
const isCurrentDayToday = computed(() => {
  return currentDate.value.toDateString() === new Date().toDateString();
});

const currentWeekDays = computed(() => {
  const weekStart = getWeekStart(currentDate.value);
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      date: formatDateString(d),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
});

const monthDates = computed(() => getMonthDates(currentDate.value));

// ── Date Utilities ─────────────────────────────────────────────────────────

const formatDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;

const getMonthName = (idx: number) =>
  new Date(2024, idx, 1).toLocaleDateString("en-US", { month: "long" });

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - day + 1);
  return d;
};

const getMonthDates = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const dow = first.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const today = new Date();

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      currentMonth: d.getMonth() === month,
      date: formatDateString(d),
      day: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
    };
  });
};

const getYearMonthDates = (monthIndex: number) =>
  getMonthDates(new Date(currentDate.value.getFullYear(), monthIndex, 1));

// ── Navigation ─────────────────────────────────────────────────────────────

const navigatePrev = () => {
  const d = new Date(currentDate.value);
  if (viewMode.value === "day") d.setDate(d.getDate() - 1);
  if (viewMode.value === "week") d.setDate(d.getDate() - 7);
  if (viewMode.value === "month") d.setMonth(d.getMonth() - 1);
  if (viewMode.value === "year") d.setFullYear(d.getFullYear() - 1);
  currentDate.value = d;
};

const navigateNext = () => {
  const d = new Date(currentDate.value);
  if (viewMode.value === "day") d.setDate(d.getDate() + 1);
  if (viewMode.value === "week") d.setDate(d.getDate() + 7);
  if (viewMode.value === "month") d.setMonth(d.getMonth() + 1);
  if (viewMode.value === "year") d.setFullYear(d.getFullYear() + 1);
  currentDate.value = d;
};

const jumpToMonth = (month: number) => {
  const d = new Date(currentDate.value);
  d.setMonth(month - 1);
  currentDate.value = d;
  viewMode.value = "month";
};

// ── Event Helpers ──────────────────────────────────────────────────────────

const getDayEvents = (dateStr: string) =>
  events.value
    .filter((e) => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

const dateHasEvents = (dateStr: string) =>
  events.value.some((e) => e.date === dateStr);

// FIX: overlap-aware layout — overlapping events rendered side-by-side
const getEventsWithLayout = (dateStr: string) => {
  const dayEvts = getDayEvents(dateStr);
  const columns: CalendarEvent[][] = [];

  for (const event of dayEvts) {
    const startMin = timeToMinutes(event.startTime);
    let placed = false;
    for (const col of columns) {
      const last = col[col.length - 1];
      const lastEnd = timeToMinutes(last.endTime);
      if (lastEnd <= startMin) {
        col.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([event]);
  }

  const totalCols = columns.length;
  return columns.flatMap((col, colIndex) =>
    col.map((event) => ({ colIndex, event, totalCols }))
  );
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// FIX: getEventStyle now accepts column info for overlap layout
const getEventStyle = (event: CalendarEvent, colIndex = 0, totalCols = 1) => {
  const startMin = timeToMinutes(event.startTime);
  const endMin = Math.max(timeToMinutes(event.endTime), startMin + 15);
  const duration = endMin - startMin;
  const ppm = 48 / 60; // pixels per minute
  const gutter = 4;

  const top = startMin * ppm;
  const height = Math.max(duration * ppm, 20);
  const left = `calc(${gutter}px + (100% - ${gutter * 2}px) / ${totalCols} * ${colIndex})`;
  const width = `calc((100% - ${gutter * 2}px) / ${totalCols})`;

  return {
    backgroundColor: event.color,
    height: `${height}px`,
    left,
    position: "absolute" as const,
    right: "auto",
    top: `${top}px`,
    width,
  };
};

// ── Day / Week drag-to-create ──────────────────────────────────────────────

const getSlotInfo = (
  e: MouseEvent
): { hour: number; minute: number } | null => {
  const slot = (e.target as HTMLElement).closest(".time-slot") as HTMLElement;
  if (!slot) return null;
  const hour = parseInt(slot.dataset.hour ?? "0");
  const rect = slot.getBoundingClientRect();
  const minute = e.clientY - rect.top < rect.height / 2 ? 0 : 30;
  return { hour, minute };
};

// Returns sorted list of dates between two date strings (inclusive)
const getDateRange = (a: string, b: string): string[] => {
  const start = new Date(a);
  const end = new Date(b);
  const [from, to] = start <= end ? [start, end] : [end, start];
  const result: string[] = [];
  const iter = new Date(from);
  while (iter <= to) {
    result.push(formatDateString(iter));
    iter.setDate(iter.getDate() + 1);
  }
  return result;
};

const startDragCreate = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (
    !target.classList.contains("time-slot") &&
    !target.classList.contains("slot-half")
  )
    return;

  const hm = getSlotInfo(e);
  if (!hm) return;

  let date = formatDateString(currentDate.value);
  if (viewMode.value === "week") {
    const col = target.closest(".week-day-column") as HTMLElement;
    if (col?.dataset.date) date = col.dataset.date;
  }

  isDragging.value = true;
  selectedDates.value = []; // never pollute month selection
  weekDragDates.value = [date]; // start with single day
  dragStart.value = { date, ...hm };
  dragCurrent.value = { date, ...hm };
  updateDragPreview();
};

const handleDragMove = (e: MouseEvent) => {
  if (!isDragging.value || !dragStart.value) return;
  const hm = getSlotInfo(e);
  if (!hm) return;

  let date = dragStart.value.date;

  if (viewMode.value === "week") {
    const col = (e.target as HTMLElement).closest(
      ".week-day-column"
    ) as HTMLElement;
    if (col?.dataset.date) date = col.dataset.date;
    // Build range from drag-start date to current hovered column
    weekDragDates.value = getDateRange(dragStart.value.date, date);
  }

  dragCurrent.value = { date, ...hm };
  updateDragPreview();
};

const endDragCreate = () => {
  if (!isDragging.value || !dragStart.value || !dragCurrent.value) {
    isDragging.value = false;
    dragPreview.value = null;
    weekDragDates.value = [];
    return;
  }

  const startMin = dragStart.value.hour * 60 + dragStart.value.minute;
  let endMin = dragCurrent.value.hour * 60 + dragCurrent.value.minute;
  if (endMin <= startMin) endMin = startMin + 60;
  endMin = Math.min(endMin, 23 * 60 + 59);

  const pad = (n: number) => String(n).padStart(2, "0");
  const sh = Math.floor(startMin / 60),
    sm = startMin % 60;
  const eh = Math.floor(endMin / 60),
    em = endMin % 60;

  // For week multi-day drag: store all covered dates so handleSaveEvent sends them
  if (viewMode.value === "week" && weekDragDates.value.length > 1) {
    selectedDates.value = [...weekDragDates.value].sort();
  }

  eventForm.value = {
    color: "#1a73e8",
    date: dragStart.value.date,
    description: "",
    endTime: `${pad(eh)}:${pad(em)}`,
    is_all: false,
    is_mine: true,
    startTime: `${pad(sh)}:${pad(sm)}`,
    title: "",
    users: [],
  };

  isDragging.value = false;
  dragStart.value = null;
  dragCurrent.value = null;
  dragPreview.value = null;
  weekDragDates.value = [];
  openEventDialog();
};

const updateDragPreview = () => {
  if (!dragStart.value || !dragCurrent.value) return;

  const startMin = dragStart.value.hour * 60 + dragStart.value.minute;
  let endMin = dragCurrent.value.hour * 60 + dragCurrent.value.minute;
  if (endMin <= startMin) endMin = startMin + 30;

  const ppm = 48 / 60;
  dragPreview.value = {
    height: `${(endMin - startMin) * ppm}px`,
    left: "4px",
    right: "4px",
    top: `${startMin * ppm}px`,
  };
};

// Helper: is this week column inside the current drag range?
const isWeekDateInDrag = (dateStr: string) =>
  isDragging.value && weekDragDates.value.includes(dateStr);

// ── Month drag-to-select ───────────────────────────────────────────────────

const startMonthDragSelect = (e: MouseEvent) => {
  const cell = (e.target as HTMLElement).closest(
    ".month-date-cell"
  ) as HTMLElement;
  if (!cell?.dataset.date) return;

  isMonthDragging.value = true;
  monthDragStart.value = cell.dataset.date;
  selectedDates.value = [cell.dataset.date];
};

const handleMonthDragMove = (e: MouseEvent) => {
  if (!isMonthDragging.value || !monthDragStart.value) return;

  const cell = (e.target as HTMLElement).closest(
    ".month-date-cell"
  ) as HTMLElement;
  if (!cell?.dataset.date) return;

  const a = new Date(monthDragStart.value);
  const b = new Date(cell.dataset.date);
  const [start, end] = a <= b ? [a, b] : [b, a];

  selectedDates.value = [];
  const iter = new Date(start);
  while (iter <= end) {
    selectedDates.value.push(formatDateString(iter));
    iter.setDate(iter.getDate() + 1);
  }
};

const endMonthDragSelect = () => {
  if (!isMonthDragging.value) return;
  isMonthDragging.value = false;

  if (selectedDates.value.length > 0) {
    eventForm.value = {
      color: "#1a73e8",
      date: selectedDates.value[0],
      description: "",
      endTime: "10:00",
      is_all: false,
      is_mine: true,
      startTime: "09:00",
      title: "",
      users: [],
    };
    openEventDialog();
  }
  monthDragStart.value = null;
};

const isDateInSelection = (dateStr: string) =>
  isMonthDragging.value && selectedDates.value.includes(dateStr);

// ── Dialog helpers ─────────────────────────────────────────────────────────

const openEventDialog = () => {
  showEventDialog.value = true;
};

const closeEventDialog = () => {
  showEventDialog.value = false;
  editingEvent.value = null;
  selectedDates.value = [];
};

const openEventDetails = (event: CalendarEvent) => {
  editingEvent.value = event;
  eventForm.value = {
    color: event.color,
    date: event.date,
    description: event.description ?? "",
    endTime: event.endTime,
    expenseType: event.expenseType,
    id: event.id,
    is_all: event.is_all,
    is_mine: event.is_mine,
    projectName: event.projectName,
    startTime: event.startTime,
    title: event.title,
    userName: event.userName,
    users: event.users ?? [],
  };
  openEventDialog();
};

// ── API ────────────────────────────────────────────────────────────────────

const loadEvents = async () => {
  isLoading.value = true;
  try {
    const db = useFirestore();
    const authStore = useAuthStore();
    const role = authStore.role;
    const userId = authStore.myId;

    let q = query(collection(db, "transactions"));
    if (role === "employee") {
      q = query(collection(db, "transactions"), where("userId", "==", userId));
    }

    // Load extra lookups concurrently
    const [snapTx, snapUsers, snapProjects] = await Promise.all([
      getDocs(q),
      getDocs(collection(db, "users")),
      getDocs(collection(db, "projects")),
    ]);

    const usersMap = new Map();
    snapUsers.forEach((doc) => {
      const d = doc.data();
      usersMap.set(doc.id, d.name || d.email || "—");
    });

    const projectsMap = new Map();
    snapProjects.forEach((doc) => {
      projectsMap.set(doc.id, doc.data().name || "—");
    });

    const loadedEvents: CalendarEvent[] = [];

    snapTx.forEach((doc) => {
      const data = doc.data();
      if (!data.createdAt) return;
      const dateObj = data.createdAt.toDate();
      const dateStr = formatDateString(dateObj);
      const h = String(dateObj.getHours()).padStart(2, "0");
      const m = String(dateObj.getMinutes()).padStart(2, "0");

      const isIncome = data.type === "income";

      loadedEvents.push({
        color: isIncome ? "#0b8043" : "#d50000",
        date: dateStr,
        description: data.description,
        endTime: `${String(dateObj.getHours() + 1).padStart(2, "0")}:${m}`,
        expenseType: data.expenseType || "—",
        id: doc.id,
        is_all: false,
        is_mine: true,
        projectName: projectsMap.get(data.projectId) || "—",
        startTime: `${h}:${m}`,
        title: `${isIncome ? "+" : "-"}${data.amount}`,
        userName: usersMap.get(data.userId) || "—",
        users: [],
      });
    });

    events.value = loadedEvents;
  } catch (err) {
    console.error("Транзакцияларни юклашда хатолик:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleSaveEvent = async (_formData: any) => {
  // Read-only calendar for transactions for now
  ElMessage.info(
    'Добавление транзакций через календарь временно отключено. Используйте раздел "Мои транзакции"'
  );
  closeEventDialog();
};

const handleDeleteEvent = async () => {
  ElMessage.info("Удаление транзакций временно недоступно.");
  closeEventDialog();
};
</script>

<template>
  <div class="custom-calendar">
    <div
      v-if="isLoading"
      class="calendar-loading">
      <span>Loading...</span>
    </div>

    <!-- ── Header ── -->
    <div class="calendar-header">
      <div class="header-center">
        <button
          class="nav-btn"
          @click="navigatePrev">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20">
            <path
              d="M12 4L6 10l6 6"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <h2 class="current-date">{{ formattedCurrentDate }}</h2>
        <button
          class="nav-btn"
          @click="navigateNext">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20">
            <path
              d="M8 4l6 6-6 6"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <div class="header-right">
        <div class="view-selector">
          <button
            v-for="view in viewModes"
            :key="view.value"
            :class="['view-btn', { active: viewMode === view.value }]"
            @click="viewMode = view.value as 'day' | 'week' | 'month' | 'year'">
            {{ view.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="calendar-body">
      <div class="view-container">
        <!-- ════════════ DAY VIEW ════════════ -->
        <div
          v-if="viewMode === 'day'"
          class="day-view">
          <div class="time-grid">
            <div class="time-labels">
              <div class="time-gutter"></div>
              <div
                v-for="hour in 24"
                :key="hour"
                class="time-label">
                {{ formatHour(hour - 1) }}
              </div>
            </div>

            <div
              class="day-column"
              @mousedown="startDragCreate"
              @mousemove="handleDragMove">
              <div class="day-header">
                <div class="day-name">{{ currentDayName }}</div>
                <div
                  class="day-number"
                  :class="{ today: isCurrentDayToday }">
                  {{ currentDayNumber }}
                </div>
              </div>

              <div class="time-slots">
                <div
                  v-for="hour in 24"
                  :key="hour"
                  class="time-slot"
                  :data-hour="hour - 1">
                  <div class="slot-half"></div>
                  <div class="slot-half"></div>
                </div>

                <div
                  v-if="isCurrentDayToday"
                  class="current-time-indicator"
                  :style="{ top: currentTimePosition }">
                  <div class="time-marker"></div>
                  <div class="time-line"></div>
                </div>

                <!-- FIX: overlap-aware rendering -->
                <template
                  v-for="{ event, colIndex, totalCols } in getEventsWithLayout(
                    formatDateString(currentDate)
                  )"
                  :key="event.id">
                  <div
                    class="day-event"
                    :style="getEventStyle(event, colIndex, totalCols)"
                    @click="openEventDetails(event)">
                    <div class="event-time">
                      {{ event.startTime }} – {{ event.endTime }}
                    </div>
                    <div class="event-title">{{ event.title }}</div>
                  </div>
                </template>

                <div
                  v-if="isDragging && dragPreview"
                  class="drag-preview"
                  :style="dragPreview" />
              </div>
            </div>
          </div>
        </div>

        <!-- ════════════ WEEK VIEW ════════════ -->
        <div
          v-if="viewMode === 'week'"
          class="week-view">
          <div class="week-grid-container">
            <div class="time-labels">
              <div class="time-gutter">GMT+5</div>
              <div
                v-for="hour in 24"
                :key="hour"
                class="time-label">
                {{ formatHour(hour - 1) }}
              </div>
            </div>

            <div class="week-columns">
              <div class="week-header-row">
                <div
                  v-for="day in currentWeekDays"
                  :key="day.date"
                  class="week-day-header"
                  :class="{ today: day.isToday }">
                  <div class="day-name">{{ day.dayName }}</div>
                  <div class="day-number">{{ day.dayNumber }}</div>
                </div>
              </div>

              <div
                class="week-grid"
                @mousedown="startDragCreate"
                @mousemove="handleDragMove">
                <div
                  v-for="day in currentWeekDays"
                  :key="day.date"
                  class="week-day-column"
                  :class="{ 'week-drag-active': isWeekDateInDrag(day.date) }"
                  :data-date="day.date">
                  <div class="time-slots">
                    <div
                      v-for="hour in 24"
                      :key="hour"
                      class="time-slot"
                      :data-hour="hour - 1">
                      <div class="slot-half"></div>
                      <div class="slot-half"></div>
                    </div>

                    <div
                      v-if="day.isToday"
                      class="current-time-indicator"
                      :style="{ top: currentTimePosition }">
                      <div class="time-marker"></div>
                      <div class="time-line"></div>
                    </div>

                    <!-- overlap-aware rendering per column -->
                    <template
                      v-for="{
                        event,
                        colIndex,
                        totalCols,
                      } in getEventsWithLayout(day.date)"
                      :key="event.id">
                      <div
                        class="week-event"
                        :style="getEventStyle(event, colIndex, totalCols)"
                        @click="openEventDetails(event)">
                        <div class="event-title">{{ event.title }}</div>
                        <div class="event-time">{{ event.startTime }}</div>
                      </div>
                    </template>

                    <!-- Preview shown in every column covered by the drag range -->
                    <div
                      v-if="isWeekDateInDrag(day.date) && dragPreview"
                      class="drag-preview"
                      :style="dragPreview" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════════ MONTH VIEW ════════════ -->
        <div
          v-if="viewMode === 'month'"
          class="month-view">
          <div class="month-grid">
            <div class="month-header">
              <div
                v-for="day in weekDays"
                :key="day"
                class="month-day-label">
                {{ day }}
              </div>
            </div>

            <div
              class="month-dates"
              @mousedown="startMonthDragSelect"
              @mousemove="handleMonthDragMove">
              <div
                v-for="date in monthDates"
                :key="date.key"
                :class="[
                  'month-date-cell',
                  {
                    'other-month': !date.currentMonth,
                    today: date.isToday,
                    selected: selectedDates.includes(date.date),
                    'in-selection': isDateInSelection(date.date),
                  },
                ]"
                :data-date="date.date">
                <div class="date-number">{{ date.day }}</div>
                <div class="date-events">
                  <div
                    v-for="event in getDayEvents(date.date)"
                    :key="event.id"
                    class="month-event"
                    :style="{ backgroundColor: event.color }"
                    @click.stop="openEventDetails(event)">
                    <span
                      v-if="event.startTime"
                      class="event-time">
                      {{ event.startTime }}
                    </span>
                    <span class="event-title">{{ event.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════════ YEAR VIEW ════════════ -->
        <div
          v-if="viewMode === 'year'"
          class="year-view">
          <div class="year-grid">
            <div
              v-for="month in 12"
              :key="month"
              class="year-month"
              @click="jumpToMonth(month)">
              <div class="year-month-header">{{ getMonthName(month - 1) }}</div>
              <div class="year-month-mini">
                <div class="year-mini-days">
                  <div
                    v-for="day in weekDaysMin"
                    :key="day"
                    class="year-day-label">
                    {{ day }}
                  </div>
                </div>
                <div class="year-mini-dates">
                  <div
                    v-for="date in getYearMonthDates(month - 1)"
                    :key="date.key"
                    :class="[
                      'year-date',
                      {
                        'other-month': !date.currentMonth,
                        'has-events': dateHasEvents(date.date),
                        today: date.isToday,
                      },
                    ]">
                    {{ date.day }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Event Dialog ── -->
    <CustomCalendarEventDialog
      v-model:is-visible="showEventDialog"
      v-model:event-form="eventForm"
      :is-editing="!!editingEvent"
      :is-saving="isSaving"
      :event-colors="eventColors"
      @save="handleSaveEvent"
      @delete="handleDeleteEvent" />
  </div>
</template>

<style scoped>
.week-day-column.week-drag-active {
  background-color: rgb(26 115 232 / 6%);
}

.week-day-column.week-drag-active .drag-preview {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  background-color: rgb(26 115 232 / 25%);
  border: 1.5px solid rgb(26 115 232 / 60%);
  border-radius: 4px;
}
</style>
