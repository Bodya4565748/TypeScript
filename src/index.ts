// ===== 1) БАЗОВІ ТИПИ (union + type aliases) =====
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export type TimeSlot =
    | "8:30-10:00"
    | "10:15-11:45"
    | "12:15-13:45"
    | "14:00-15:30"
    | "15:45-17:15";

export type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

// ===== 2) ОСНОВНІ СТРУКТУРИ =====
export type Professor = {
    id: number;
    name: string;
    department: string;
};

export type Classroom = {
    number: string;
    capacity: number;
    hasProjector: boolean;
};

export type Course = {
    id: number;
    name: string;
    type: CourseType;
};

export type Lesson = {
    courseId: number;
    professorId: number;
    classroomNumber: string;
    dayOfWeek: DayOfWeek;
    timeSlot: TimeSlot;
};

// Оскільки нижче є операції за lessonId, зберігаємо розклад із власним id:
export type StoredLesson = Lesson & { id: number };

// ===== 3) СХОВИЩА ДАНИХ (масиви) =====
export const professors: Professor[] = [];
export const classrooms: Classroom[] = [];
export const courses: Course[] = [];
export const schedule: StoredLesson[] = [];

// Для простого інкременту id уроків:
let lessonSeq: number = 1;

// ===== 4) ДОДАВАННЯ ДАНИХ =====
export function addProfessor(professor: Professor): void {
    // уникаємо дублікатів id
    const exists: boolean = professors.some((p: Professor): boolean => p.id === professor.id);
    if (!exists) professors.push(professor);
}

export function addLesson(lesson: Lesson): boolean {
    // Валідатор конфліктів
    const conflict = validateLesson(lesson);
    if (conflict !== null) {
        // можна логувати/кидати помилку; за умовою повертаємо false
        return false;
    }
    const stored: StoredLesson = { ...lesson, id: lessonSeq++ };
    schedule.push(stored);
    return true;
}

// ===== 5) ПОШУК / ФІЛЬТРИ =====
export function findAvailableClassrooms(
    timeSlot: TimeSlot,
    dayOfWeek: DayOfWeek
): string[] {
    // аудиторії, які НЕ зайняті на цей час у цей день
    const occupied: string[] = schedule
        .filter(
            (l: StoredLesson): boolean =>
                l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot
        )
        .map((l: StoredLesson): string => l.classroomNumber);

    const freeNumbers: string[] = classrooms
        .map((c: Classroom): string => c.number)
        .filter((num: string): boolean => !occupied.includes(num));

    return freeNumbers;
}

export function getProfessorSchedule(professorId: number): StoredLesson[] {
    return schedule.filter((l: StoredLesson): boolean => l.professorId === professorId);
}

// ===== 6) КОНФЛІКТИ / ВАЛІДАЦІЯ =====
export type ScheduleConflict = {
    type: "ProfessorConflict" | "ClassroomConflict";
    lessonDetails: Lesson;
};

export function validateLesson(lesson: Lesson): ScheduleConflict | null {
    // Перевірки існування сутностей (базова обробка помилок)
    const profExists: boolean = professors.some((p: Professor): boolean => p.id === lesson.professorId);
    const courseExists: boolean = courses.some((c: Course): boolean => c.id === lesson.courseId);
    const roomExists: boolean = classrooms.some((c: Classroom): boolean => c.number === lesson.classroomNumber);

    if (!profExists || !courseExists || !roomExists) {
        // Якщо сутності немає — у реальній системі можна кидати помилку.
        return {
            type: !roomExists ? "ClassroomConflict" : "ProfessorConflict",
            lessonDetails: lesson
        };
    }

    // Конфлікт викладача: один професор не може читати дві пари одночасно
    const professorClash: boolean = schedule.some(
        (l: StoredLesson): boolean =>
            l.professorId === lesson.professorId &&
            l.dayOfWeek === lesson.dayOfWeek &&
            l.timeSlot === lesson.timeSlot
    );
    if (professorClash) {
        return { type: "ProfessorConflict", lessonDetails: lesson };
    }

    // Конфлікт аудиторії: одна аудиторія не може бути у двох місцях одночасно :)
    const roomClash: boolean = schedule.some(
        (l: StoredLesson): boolean =>
            l.classroomNumber === lesson.classroomNumber &&
            l.dayOfWeek === lesson.dayOfWeek &&
            l.timeSlot === lesson.timeSlot
    );
    if (roomClash) {
        return { type: "ClassroomConflict", lessonDetails: lesson };
    }

    return null;
}

// ===== 7) АНАЛІТИКА / ЗВІТИ =====
const ALL_DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const ALL_SLOTS: TimeSlot[] = [
    "8:30-10:00",
    "10:15-11:45",
    "12:15-13:45",
    "14:00-15:30",
    "15:45-17:15"
];

export function getClassroomUtilization(classroomNumber: string): number {
    // Максимально можливих занять за тиждень = днів * слотів
    const maxLessons: number = ALL_DAYS.length * ALL_SLOTS.length;
    if (maxLessons === 0) return 0;

    const used: number = schedule.filter(
        (l: StoredLesson): boolean => l.classroomNumber === classroomNumber
    ).length;

    const utilization: number = (used / maxLessons) * 100;
    return Math.round(utilization * 100) / 100;
}

export function getMostPopularCourseType(): CourseType {
    // Рахуємо по реальним зайняттям у розкладі (schedule → courseId → course.type)
    const counts: { [K in CourseType]: number } = {
        Lecture: 0,
        Seminar: 0,
        Lab: 0,
        Practice: 0
    };

    schedule.forEach((l: StoredLesson): void => {
        const course: Course | undefined = courses.find((c: Course): boolean => c.id === l.courseId);
        if (course) counts[course.type] = counts[course.type] + 1;
    });

    // Знаходимо тип з максимумом
    let bestType: CourseType = "Lecture";
    let bestCount: number = counts[bestType];

    (["Lecture", "Seminar", "Lab", "Practice"] as CourseType[]).forEach((t: CourseType): void => {
        if (counts[t] > bestCount) {
            bestType = t;
            bestCount = counts[t];
        }
    });

    return bestType;
}

// ===== 8) МОДИФІКАЦІЇ =====
export function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
    const idx: number = schedule.findIndex((l: StoredLesson): boolean => l.id === lessonId);
    if (idx === -1) return false;

    const candidate: StoredLesson = schedule[idx];
    const updated: Lesson = {
        courseId: candidate.courseId,
        professorId: candidate.professorId,
        classroomNumber: newClassroomNumber,
        dayOfWeek: candidate.dayOfWeek,
        timeSlot: candidate.timeSlot
    };

    // валідатор: перевіряємо тільки конфлікти (professor той самий, але може бути room clash)
    const conflict = validateLesson(updated);
    if (conflict !== null && conflict.type === "ClassroomConflict") {
        return false;
    }

    // якщо нової аудиторії не існує — теж не міняємо
    const roomExists: boolean = classrooms.some((c: Classroom): boolean => c.number === newClassroomNumber);
    if (!roomExists) return false;

    // застосовуємо зміну
    schedule[idx] = { ...candidate, classroomNumber: newClassroomNumber };
    return true;
}

export function cancelLesson(lessonId: number): void {
    const idx: number = schedule.findIndex((l: StoredLesson): boolean => l.id === lessonId);
    if (idx !== -1) {
        schedule.splice(idx, 1);
    }
}

// ===== 9) ТРОХИ ДЕМОДАНИХ (можна видалити у проді) =====
// Щоб швидко перевірити логіку — раскоментуй:


professors.push(
  { id: 1, name: "Dr. Ivanenko", department: "CS" },
  { id: 2, name: "Prof. Shevchenko", department: "Math" }
);

classrooms.push(
  { number: "A101", capacity: 60, hasProjector: true },
  { number: "B202", capacity: 30, hasProjector: false },
  { number: "C303", capacity: 40, hasProjector: true }
);

courses.push(
  { id: 10, name: "Algorithms", type: "Lecture" },
  { id: 11, name: "Data Structures", type: "Practice" },
  { id: 12, name: "Discrete Math", type: "Seminar" }
);

// додаємо уроки
addLesson({ courseId: 10, professorId: 1, classroomNumber: "A101", dayOfWeek: "Monday", timeSlot: "8:30-10:00" });
addLesson({ courseId: 11, professorId: 1, classroomNumber: "B202", dayOfWeek: "Monday", timeSlot: "10:15-11:45" });
addLesson({ courseId: 12, professorId: 2, classroomNumber: "C303", dayOfWeek: "Tuesday", timeSlot: "12:15-13:45" });

console.log(findAvailableClassrooms("8:30-10:00", "Monday"));
console.log(getProfessorSchedule(1));
console.log(getClassroomUtilization("A101"));
console.log(getMostPopularCourseType());
