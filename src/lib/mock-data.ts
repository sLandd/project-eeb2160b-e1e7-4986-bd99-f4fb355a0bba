export type Status = "todo" | "progress" | "overdue" | "submitted" | "graded";

export const statusLabels: Record<Status, string> = {
  todo: "Не начато",
  progress: "В процессе",
  overdue: "Просрочено",
  submitted: "Сдано",
  graded: "Оценено",
};

export const statusClasses: Record<Status, string> = {
  todo: "bg-status-todo text-status-todo-foreground",
  progress: "bg-status-progress text-status-progress-foreground",
  overdue: "bg-status-overdue text-status-overdue-foreground",
  submitted: "bg-status-submitted text-status-submitted-foreground",
  graded: "bg-status-graded text-status-graded-foreground",
};

export type Subject = {
  id: string;
  name: string;
  emoji: string;
  teacher: string;
  nextLesson: string;
  averageGrade: number;
  color: string;
  grades: { title: string; date: string; grade: number; comment: string }[];
  schedule: { day: string; time: string; room: string }[];
  notes: { date: string; text: string }[];
  assignments: { title: string; deadline: string; status: Status }[];
};

export const subjects: Subject[] = [
  {
    id: "algebra",
    name: "Алгебра",
    emoji: "📐",
    teacher: "Иванова Мария Петровна",
    nextLesson: "2026-04-21, 09:00",
    averageGrade: 4.6,
    color: "oklch(0.7 0.18 250)",
    grades: [
      { title: "Контрольная №3", date: "2026-04-10", grade: 5, comment: "Отличная работа" },
      { title: "Самостоятельная", date: "2026-04-03", grade: 4, comment: "Внимательнее с дробями" },
      { title: "Домашняя работа", date: "2026-03-27", grade: 5, comment: "" },
    ],
    schedule: [
      { day: "Понедельник", time: "09:00–09:45", room: "204" },
      { day: "Среда", time: "10:00–10:45", room: "204" },
      { day: "Пятница", time: "11:00–11:45", room: "204" },
    ],
    notes: [
      { date: "2026-04-15", text: "В пятницу принести тетрадь для контрольных" },
      { date: "2026-04-08", text: "Повторить главу 4: квадратные уравнения" },
    ],
    assignments: [
      { title: "§14: №3 и №5", deadline: "2026-04-20", status: "progress" },
      { title: "Подготовка к контрольной", deadline: "2026-04-24", status: "todo" },
    ],
  },
  {
    id: "chemistry",
    name: "Химия",
    emoji: "⚗️",
    teacher: "Соколов Андрей Игоревич",
    nextLesson: "2026-04-22, 11:00",
    averageGrade: 4.2,
    color: "oklch(0.7 0.18 150)",
    grades: [
      { title: "Лабораторная №2", date: "2026-04-12", grade: 4, comment: "Хорошо, но не оформила вывод" },
      { title: "Тест по таблице Менделеева", date: "2026-04-05", grade: 5, comment: "" },
    ],
    schedule: [
      { day: "Вторник", time: "12:00–12:45", room: "311" },
      { day: "Четверг", time: "13:00–13:45", room: "311" },
    ],
    notes: [{ date: "2026-04-14", text: "Принести халат на лабораторную в четверг" }],
    assignments: [{ title: "Конспект §22", deadline: "2026-04-23", status: "todo" }],
  },
  {
    id: "physics",
    name: "Физика",
    emoji: "🔬",
    teacher: "Петров Сергей Васильевич",
    nextLesson: "2026-04-21, 13:00",
    averageGrade: 3.8,
    color: "oklch(0.7 0.18 60)",
    grades: [
      { title: "Контрольная №2", date: "2026-04-08", grade: 3, comment: "Повторить кинематику" },
      { title: "Лабораторная №1", date: "2026-03-30", grade: 4, comment: "" },
    ],
    schedule: [
      { day: "Понедельник", time: "13:00–13:45", room: "118" },
      { day: "Четверг", time: "10:00–10:45", room: "118" },
    ],
    notes: [{ date: "2026-04-10", text: "Лабораторная по электричеству — на следующей неделе" }],
    assignments: [
      { title: "Сдать лабораторную по физике", deadline: "2026-04-18", status: "overdue" },
      { title: "Задачи §12", deadline: "2026-04-25", status: "todo" },
    ],
  },
  {
    id: "russian",
    name: "Русский язык",
    emoji: "📖",
    teacher: "Кузнецова Ольга Дмитриевна",
    nextLesson: "2026-04-22, 09:00",
    averageGrade: 4.4,
    color: "oklch(0.7 0.18 25)",
    grades: [
      { title: "Диктант", date: "2026-04-11", grade: 4, comment: "Несколько пунктуационных ошибок" },
      { title: "Изложение", date: "2026-04-04", grade: 5, comment: "Хороший стиль" },
    ],
    schedule: [
      { day: "Вторник", time: "09:00–09:45", room: "207" },
      { day: "Четверг", time: "09:00–09:45", room: "207" },
    ],
    notes: [],
    assignments: [{ title: "Сочинение «Весна»", deadline: "2026-04-26", status: "progress" }],
  },
  {
    id: "literature",
    name: "Литература",
    emoji: "📚",
    teacher: "Кузнецова Ольга Дмитриевна",
    nextLesson: "2026-04-23, 10:00",
    averageGrade: 4.7,
    color: "oklch(0.7 0.18 320)",
    grades: [
      { title: "Анализ стихотворения", date: "2026-04-09", grade: 5, comment: "Глубокий разбор" },
    ],
    schedule: [
      { day: "Среда", time: "12:00–12:45", room: "207" },
      { day: "Пятница", time: "10:00–10:45", room: "207" },
    ],
    notes: [{ date: "2026-04-12", text: "Прочитать «Капитанская дочка» к 25 апреля" }],
    assignments: [{ title: 'Прочитать "Капитанская дочка" главы 1–2', deadline: "2026-04-25", status: "todo" }],
  },
  {
    id: "pe",
    name: "Физкультура",
    emoji: "🏃",
    teacher: "Морозов Дмитрий Олегович",
    nextLesson: "2026-04-21, 15:00",
    averageGrade: 5.0,
    color: "oklch(0.7 0.18 130)",
    grades: [{ title: "Норматив бег 100м", date: "2026-04-07", grade: 5, comment: "" }],
    schedule: [
      { day: "Понедельник", time: "15:00–15:45", room: "Спортзал" },
      { day: "Среда", time: "15:00–15:45", room: "Спортзал" },
    ],
    notes: [],
    assignments: [],
  },
  {
    id: "history",
    name: "История",
    emoji: "🏛️",
    teacher: "Белова Анна Сергеевна",
    nextLesson: "2026-04-22, 13:00",
    averageGrade: 4.0,
    color: "oklch(0.65 0.15 50)",
    grades: [
      { title: "Тест по XIX веку", date: "2026-04-06", grade: 4, comment: "" },
    ],
    schedule: [
      { day: "Вторник", time: "13:00–13:45", room: "302" },
      { day: "Четверг", time: "11:00–11:45", room: "302" },
    ],
    notes: [{ date: "2026-04-15", text: "Подготовить доклад о Петровских реформах" }],
    assignments: [{ title: "Доклад: Петровские реформы", deadline: "2026-04-21", status: "todo" }],
  },
  {
    id: "biology",
    name: "Биология",
    emoji: "🌿",
    teacher: "Зеленова Татьяна Ивановна",
    nextLesson: "2026-04-23, 12:00",
    averageGrade: 4.5,
    color: "oklch(0.7 0.18 140)",
    grades: [{ title: "Самостоятельная", date: "2026-04-10", grade: 5, comment: "" }],
    schedule: [{ day: "Среда", time: "13:00–13:45", room: "215" }],
    notes: [],
    assignments: [{ title: "Конспект §18", deadline: "2026-04-24", status: "submitted" }],
  },
  {
    id: "english",
    name: "Английский язык",
    emoji: "🇬🇧",
    teacher: "Smith John",
    nextLesson: "2026-04-21, 11:00",
    averageGrade: 4.3,
    color: "oklch(0.7 0.18 280)",
    grades: [
      { title: "Vocabulary Quiz", date: "2026-04-09", grade: 4, comment: "Good" },
      { title: "Essay", date: "2026-04-02", grade: 5, comment: "Excellent" },
    ],
    schedule: [
      { day: "Понедельник", time: "11:00–11:45", room: "108" },
      { day: "Пятница", time: "12:00–12:45", room: "108" },
    ],
    notes: [{ date: "2026-04-14", text: "Выучить неправильные глаголы list 3" }],
    assignments: [{ title: "Unit 7 exercises", deadline: "2026-04-22", status: "progress" }],
  },
  {
    id: "informatics",
    name: "Информатика",
    emoji: "💻",
    teacher: "Орлов Максим Андреевич",
    nextLesson: "2026-04-22, 14:00",
    averageGrade: 4.8,
    color: "oklch(0.65 0.18 220)",
    grades: [{ title: "Проект Python", date: "2026-04-13", grade: 5, comment: "Отличный код" }],
    schedule: [{ day: "Вторник", time: "14:00–14:45", room: "405" }],
    notes: [{ date: "2026-04-15", text: "Принести наушники на следующий урок" }],
    assignments: [{ title: "Лабораторная: списки", deadline: "2026-04-26", status: "graded" }],
  },
];

export const classOptions = [
  "5А","5Б","5В","6А","6Б","6В","7А","7Б","7В","8А","8Б","8В","9А","9Б","9В","10А","10Б","11А","11Б",
];

export const studentInfo = {
  name: "Анна Смирнова",
  email: "anna.smirnova@school.ru",
  class: "9Б",
  avatar: "",
};
