"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.courses = exports.classrooms = exports.professors = void 0;
exports.addProfessor = addProfessor;
exports.addLesson = addLesson;
exports.findAvailableClassrooms = findAvailableClassrooms;
exports.getProfessorSchedule = getProfessorSchedule;
exports.validateLesson = validateLesson;
exports.getClassroomUtilization = getClassroomUtilization;
exports.getMostPopularCourseType = getMostPopularCourseType;
exports.reassignClassroom = reassignClassroom;
exports.cancelLesson = cancelLesson;
// ===== 3) СХОВИЩА ДАНИХ (масиви) =====
exports.professors = [];
exports.classrooms = [];
exports.courses = [];
exports.schedule = [];
// Для простого інкременту id уроків:
let lessonSeq = 1;
// ===== 4) ДОДАВАННЯ ДАНИХ =====
function addProfessor(professor) {
    // уникаємо дублікатів id
    const exists = exports.professors.some((p) => p.id === professor.id);
    if (!exists)
        exports.professors.push(professor);
}
function addLesson(lesson) {
    // Валідатор конфліктів
    const conflict = validateLesson(lesson);
    if (conflict !== null) {
        // можна логувати/кидати помилку; за умовою повертаємо false
        return false;
    }
    const stored = { ...lesson, id: lessonSeq++ };
    exports.schedule.push(stored);
    return true;
}
// ===== 5) ПОШУК / ФІЛЬТРИ =====
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    // аудиторії, які НЕ зайняті на цей час у цей день
    const occupied = exports.schedule
        .filter((l) => l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot)
        .map((l) => l.classroomNumber);
    const freeNumbers = exports.classrooms
        .map((c) => c.number)
        .filter((num) => !occupied.includes(num));
    return freeNumbers;
}
function getProfessorSchedule(professorId) {
    return exports.schedule.filter((l) => l.professorId === professorId);
}
function validateLesson(lesson) {
    // Перевірки існування сутностей (базова обробка помилок)
    const profExists = exports.professors.some((p) => p.id === lesson.professorId);
    const courseExists = exports.courses.some((c) => c.id === lesson.courseId);
    const roomExists = exports.classrooms.some((c) => c.number === lesson.classroomNumber);
    if (!profExists || !courseExists || !roomExists) {
        // Якщо сутності немає — у реальній системі можна кидати помилку.
        return {
            type: !roomExists ? "ClassroomConflict" : "ProfessorConflict",
            lessonDetails: lesson
        };
    }
    // Конфлікт викладача: один професор не може читати дві пари одночасно
    const professorClash = exports.schedule.some((l) => l.professorId === lesson.professorId &&
        l.dayOfWeek === lesson.dayOfWeek &&
        l.timeSlot === lesson.timeSlot);
    if (professorClash) {
        return { type: "ProfessorConflict", lessonDetails: lesson };
    }
    // Конфлікт аудиторії: одна аудиторія не може бути у двох місцях одночасно :)
    const roomClash = exports.schedule.some((l) => l.classroomNumber === lesson.classroomNumber &&
        l.dayOfWeek === lesson.dayOfWeek &&
        l.timeSlot === lesson.timeSlot);
    if (roomClash) {
        return { type: "ClassroomConflict", lessonDetails: lesson };
    }
    return null;
}
// ===== 7) АНАЛІТИКА / ЗВІТИ =====
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const ALL_SLOTS = [
    "8:30-10:00",
    "10:15-11:45",
    "12:15-13:45",
    "14:00-15:30",
    "15:45-17:15"
];
function getClassroomUtilization(classroomNumber) {
    // Максимально можливих занять за тиждень = днів * слотів
    const maxLessons = ALL_DAYS.length * ALL_SLOTS.length; // 5*5 = 25
    if (maxLessons === 0)
        return 0;
    const used = exports.schedule.filter((l) => l.classroomNumber === classroomNumber).length;
    const utilization = (used / maxLessons) * 100;
    return Math.round(utilization * 100) / 100; // до сотих
}
function getMostPopularCourseType() {
    // Рахуємо по реальним зайняттям у розкладі (schedule → courseId → course.type)
    const counts = {
        Lecture: 0,
        Seminar: 0,
        Lab: 0,
        Practice: 0
    };
    exports.schedule.forEach((l) => {
        const course = exports.courses.find((c) => c.id === l.courseId);
        if (course)
            counts[course.type] = counts[course.type] + 1;
    });
    // Знаходимо тип з максимумом
    let bestType = "Lecture";
    let bestCount = counts[bestType];
    ["Lecture", "Seminar", "Lab", "Practice"].forEach((t) => {
        if (counts[t] > bestCount) {
            bestType = t;
            bestCount = counts[t];
        }
    });
    return bestType;
}
// ===== 8) МОДИФІКАЦІЇ =====
function reassignClassroom(lessonId, newClassroomNumber) {
    const idx = exports.schedule.findIndex((l) => l.id === lessonId);
    if (idx === -1)
        return false;
    const candidate = exports.schedule[idx];
    const updated = {
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
    const roomExists = exports.classrooms.some((c) => c.number === newClassroomNumber);
    if (!roomExists)
        return false;
    // застосовуємо зміну
    exports.schedule[idx] = { ...candidate, classroomNumber: newClassroomNumber };
    return true;
}
function cancelLesson(lessonId) {
    const idx = exports.schedule.findIndex((l) => l.id === lessonId);
    if (idx !== -1) {
        exports.schedule.splice(idx, 1);
    }
}
// ===== 9) ТРОХИ ДЕМОДАНИХ (можна видалити у проді) =====
// Щоб швидко перевірити логіку — раскоментуй:
exports.professors.push({ id: 1, name: "Dr. Ivanenko", department: "CS" }, { id: 2, name: "Prof. Shevchenko", department: "Math" });
exports.classrooms.push({ number: "A101", capacity: 60, hasProjector: true }, { number: "B202", capacity: 30, hasProjector: false }, { number: "C303", capacity: 40, hasProjector: true });
exports.courses.push({ id: 10, name: "Algorithms", type: "Lecture" }, { id: 11, name: "Data Structures", type: "Practice" }, { id: 12, name: "Discrete Math", type: "Seminar" });
// додаємо уроки
addLesson({ courseId: 10, professorId: 1, classroomNumber: "A101", dayOfWeek: "Monday", timeSlot: "8:30-10:00" });
addLesson({ courseId: 11, professorId: 1, classroomNumber: "B202", dayOfWeek: "Monday", timeSlot: "10:15-11:45" });
addLesson({ courseId: 12, professorId: 2, classroomNumber: "C303", dayOfWeek: "Tuesday", timeSlot: "12:15-13:45" });
console.log(findAvailableClassrooms("8:30-10:00", "Monday")); // перевірка вільних аудиторій
console.log(getProfessorSchedule(1)); // розклад викладача
console.log(getClassroomUtilization("A101")); // %
console.log(getMostPopularCourseType()); // найпопулярніший тип
//# sourceMappingURL=index.js.map