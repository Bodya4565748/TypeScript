/* =========================
 * ENUMS
 * ========================= */

enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled",
}

enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special",
}

enum Semester {
    First = "First",
    Second = "Second",
}

/** Оцінки — значення фіксуємо відповідно до умови */
enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2,
}

enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering",
}

/* =========================
 * ІНТЕРФЕЙСИ
 * ========================= */

interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number; // курс (1..6)
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

/**
 * У вимогах назва «interface Grade», але це конфліктує з enum Grade.
 * Тому використовуємо неймінг GradeRecord — це один-до-одного відповідник.
 */
interface GradeRecord {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}

/* =========================
 * ДОПОМІЖНІ ПЕРЕВІРКИ (type guards / валідація)
 * ========================= */

function assertPositiveInt(n: number, field: string): void {
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`${field} має бути додатним цілим числом`);
    }
}
function assertNonNegativeInt(n: number, field: string): void {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error(`${field} має бути невід’ємним цілим числом`);
    }
}
function deepClone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}

/* =========================
 * КЛАС UMS
 * ========================= */

class UniversityManagementSystem {
    // «База даних» у пам’яті (демо-рівень)
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: GradeRecord[] = [];

    // реєстрація на курси
    // courseId -> Set<studentId>
    private courseEnrollments: Map<number, Set<number>> = new Map();
    // studentId -> Set<courseId>
    private studentCourses: Map<number, Set<number>> = new Map();

    // автоінкремент ідентифікаторів (спрощено)
    private studentSeq: number = 1;
    private courseSeq: number = 1;

    /** Додати курс до системи (необов’язковий допоміжний метод для тестів) */
    public createCourse(input: Omit<Course, "id">): Course {
        const id = this.courseSeq++;
        const course: Course = { id, ...input };
        if (course.credits <= 0) {
            throw new Error("credits має бути > 0");
        }
        if (course.maxStudents <= 0) {
            throw new Error("maxStudents має бути > 0");
        }
        this.courses.push(course);
        return deepClone(course);
    }

    /**
     * enrollStudent — реєстрація студента в системі (видає новий id)
     * @param student без поля id
     * @returns створений Student
     */
    public enrollStudent(student: Omit<Student, "id">): Student {
        if (student.fullName.trim().length < 3) {
            throw new Error("fullName занадто коротке");
        }
        assertPositiveInt(student.year, "year");
        const id = this.studentSeq++;
        const created: Student = { id, ...student };
        this.students.push(created);
        return deepClone(created);
    }

    /**
     * registerForCourse — реєстрація студента на курс
     * Валідації:
     * 1) студент і курс існують
     * 2) студент активний (лише Active може записуватись)
     * 3) відповідність факультету студента та курсу
     * 4) ліміт місць не перевищено
     * 5) не дублюємо реєстрацію
     */
    public registerForCourse(studentId: number, courseId: number): void {
        assertPositiveInt(studentId, "studentId");
        assertPositiveInt(courseId, "courseId");

        const student = this.students.find((s) => s.id === studentId);
        if (!student) throw new Error("Студента не знайдено");
        if (student.status !== StudentStatus.Active) {
            throw new Error("Лише студент зі статусом Active може реєструватись на курс");
        }

        const course = this.courses.find((c) => c.id === courseId);
        if (!course) throw new Error("Курс не знайдено");

        if (course.faculty !== student.faculty) {
            throw new Error("Факультет курсу не відповідає факультету студента");
        }

        const enrolledSet = this.courseEnrollments.get(courseId) ?? new Set<number>();
        if (enrolledSet.has(studentId)) {
            throw new Error("Студент уже зареєстрований на цей курс");
        }
        if (enrolledSet.size >= course.maxStudents) {
            throw new Error("Ліміт місць на курсі вже вичерпано");
        }

        enrolledSet.add(studentId);
        this.courseEnrollments.set(courseId, enrolledSet);

        const stuSet = this.studentCourses.get(studentId) ?? new Set<number>();
        stuSet.add(courseId);
        this.studentCourses.set(studentId, stuSet);
    }

    /**
     * setGrade — виставити оцінку студенту за курс
     * Валідації:
     * 1) студент і курс існують
     * 2) студент дійсно зареєстрований на курс
     * 3) студент не Expelled (логічна заборона)
     */
    public setGrade(studentId: number, courseId: number, grade: Grade): void {
        assertPositiveInt(studentId, "studentId");
        assertPositiveInt(courseId, "courseId");

        const student = this.students.find((s) => s.id === studentId);
        if (!student) throw new Error("Студента не знайдено");
        if (student.status === StudentStatus.Expelled) {
            throw new Error("Відрахованому студенту не можна виставляти оцінки");
        }

        const course = this.courses.find((c) => c.id === courseId);
        if (!course) throw new Error("Курс не знайдено");

        const stuSet = this.studentCourses.get(studentId);
        if (!stuSet || !stuSet.has(courseId)) {
            throw new Error("Студент не зареєстрований на вказаний курс");
        }

        const rec: GradeRecord = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester,
        };
        this.grades.push(rec);
    }

    /**
     * updateStudentStatus — зміна статусу студента
     * Правила (приклад розумної політики):
     * - Статуси Graduated та Expelled — термінальні: з них не можна повернутись у Active/Academic_Leave.
     * - У Graduated можна перевести лише Active.
     * - У Expelled можна перевести лише Active або Academic_Leave.
     */
    public updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        assertPositiveInt(studentId, "studentId");
        const student = this.students.find((s) => s.id === studentId);
        if (!student) throw new Error("Студента не знайдено");

        const cur = student.status;

        // термінальні — заборонено будь-які інші переходи
        if ((cur === StudentStatus.Graduated || cur === StudentStatus.Expelled) && cur !== newStatus) {
            throw new Error(`Зі статусу ${cur} перехід заборонено`);
        }

        // Додаткові приклади валідацій переходів:
        if (newStatus === StudentStatus.Graduated && cur !== StudentStatus.Active) {
            throw new Error("Випустити можна лише активного студента");
        }
        if (
            newStatus === StudentStatus.Expelled &&
            !(cur === StudentStatus.Active || cur === StudentStatus.Academic_Leave)
        ) {
            throw new Error("Відрахувати можна лише активного або на акад. відпустці");
        }

        student.status = newStatus;
    }

    /** Отримати студентів певного факультету */
    public getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students
            .filter((s) => s.faculty === faculty)
            .map((s): Student => ({ ...s }));
    }
    /** Усі оцінки студента */
    public getStudentGrades(studentId: number): GradeRecord[] {
        assertPositiveInt(studentId, "studentId");
        return this.grades
            .filter((g) => g.studentId === studentId)
            .map((g): GradeRecord => ({ ...g }));
    }

    /**
     * Доступні курси за факультетом і семестром — ті, де ще є місця
     * і які належать факультету/семестру
     */
    public getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses
            .filter((c: Course) => c.faculty === faculty && c.semester === semester)
            .filter((c: Course) => {
                const enrolled: number = this.courseEnrollments.get(c.id)?.size ?? 0;
                return enrolled < c.maxStudents;
            })
            .map((c) => deepClone(c));
    }


    /** Середній бал студента (0, якщо оцінок немає) */
    public calculateAverageGrade(studentId: number): number {
        const list = this.getStudentGrades(studentId);
        if (list.length === 0) return 0;
        const sum = list.reduce((acc, r) => acc + r.grade, 0);
        return sum / list.length;
    }

    /**
     * Додатково: список відмінників по факультету.
     * Критерій прикладний: середній бал ≥ 4.5.
     */
    public getHonorsByFaculty(faculty: Faculty): Student[] {
        const studs = this.getStudentsByFaculty(faculty).filter(
            (s) => s.status === StudentStatus.Active || s.status === StudentStatus.Graduated
        );
        return studs
            .filter((s) => this.calculateAverageGrade(s.id) >= 4.5)
            .map((s) => deepClone(s));
    }
}

/* =========================
 * ПРИКЛАД ВИКОРИСТАННЯ (можна залишити для перевірки)
 * ========================= */

function demo(): void {
    // приклад перевірок — заміни на те, що в тебе в коді
    const ums = new UniversityManagementSystem();

    // дані для демонстрації
    const course = ums.createCourse({
        name: "Algorithms",
        type: CourseType.Mandatory,
        credits: 6,
        semester: Semester.First,
        faculty: Faculty.Computer_Science,
        maxStudents: 2,
    });

    const s1 = ums.enrollStudent({
        fullName: "Alice Johnson",
        faculty: Faculty.Computer_Science,
        year: 1,
        status: StudentStatus.Active,
        enrollmentDate: new Date("2025-09-01"),
        groupNumber: "CS-11",
    });

    ums.registerForCourse(s1.id, course.id);
    ums.setGrade(s1.id, course.id, Grade.Excellent);

    const grades = ums.getStudentGrades(s1.id);
    const avg = ums.calculateAverageGrade(s1.id);
    const available = ums.getAvailableCourses(Faculty.Computer_Science, Semester.First);

    // ⚠️ НЕ коментуй ці логи — інакше нічого не побачиш
    console.log("== DEMO OUTPUT ==");
    console.log("Student:", s1);
    console.log("Grades:", grades);
    console.log("Average:", avg);
    console.log("Available courses:", available);
}

demo();
