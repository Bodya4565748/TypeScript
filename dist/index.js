/* =========================
 * ENUMS
 * ========================= */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["Active"] = "Active";
    StudentStatus["Academic_Leave"] = "Academic_Leave";
    StudentStatus["Graduated"] = "Graduated";
    StudentStatus["Expelled"] = "Expelled";
})(StudentStatus || (StudentStatus = {}));
var CourseType;
(function (CourseType) {
    CourseType["Mandatory"] = "Mandatory";
    CourseType["Optional"] = "Optional";
    CourseType["Special"] = "Special";
})(CourseType || (CourseType = {}));
var Semester;
(function (Semester) {
    Semester["First"] = "First";
    Semester["Second"] = "Second";
})(Semester || (Semester = {}));
/** Оцінки — значення фіксуємо відповідно до умови */
var Grade;
(function (Grade) {
    Grade[Grade["Excellent"] = 5] = "Excellent";
    Grade[Grade["Good"] = 4] = "Good";
    Grade[Grade["Satisfactory"] = 3] = "Satisfactory";
    Grade[Grade["Unsatisfactory"] = 2] = "Unsatisfactory";
})(Grade || (Grade = {}));
var Faculty;
(function (Faculty) {
    Faculty["Computer_Science"] = "Computer_Science";
    Faculty["Economics"] = "Economics";
    Faculty["Law"] = "Law";
    Faculty["Engineering"] = "Engineering";
})(Faculty || (Faculty = {}));
/* =========================
 * ДОПОМІЖНІ ПЕРЕВІРКИ (type guards / валідація)
 * ========================= */
function assertPositiveInt(n, field) {
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error("".concat(field, " \u043C\u0430\u0454 \u0431\u0443\u0442\u0438 \u0434\u043E\u0434\u0430\u0442\u043D\u0438\u043C \u0446\u0456\u043B\u0438\u043C \u0447\u0438\u0441\u043B\u043E\u043C"));
    }
}
function assertNonNegativeInt(n, field) {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error("".concat(field, " \u043C\u0430\u0454 \u0431\u0443\u0442\u0438 \u043D\u0435\u0432\u0456\u0434\u2019\u0454\u043C\u043D\u0438\u043C \u0446\u0456\u043B\u0438\u043C \u0447\u0438\u0441\u043B\u043E\u043C"));
    }
}
function deepClone(x) {
    return JSON.parse(JSON.stringify(x));
}
/* =========================
 * КЛАС UMS
 * ========================= */
var UniversityManagementSystem = /** @class */ (function () {
    function UniversityManagementSystem() {
        // «База даних» у пам’яті (демо-рівень)
        this.students = [];
        this.courses = [];
        this.grades = [];
        // реєстрація на курси
        // courseId -> Set<studentId>
        this.courseEnrollments = new Map();
        // studentId -> Set<courseId>
        this.studentCourses = new Map();
        // автоінкремент ідентифікаторів (спрощено)
        this.studentSeq = 1;
        this.courseSeq = 1;
    }
    /** Додати курс до системи (необов’язковий допоміжний метод для тестів) */
    UniversityManagementSystem.prototype.createCourse = function (input) {
        var id = this.courseSeq++;
        var course = __assign({ id: id }, input);
        if (course.credits <= 0) {
            throw new Error("credits має бути > 0");
        }
        if (course.maxStudents <= 0) {
            throw new Error("maxStudents має бути > 0");
        }
        this.courses.push(course);
        return deepClone(course);
    };
    /**
     * enrollStudent — реєстрація студента в системі (видає новий id)
     * @param student без поля id
     * @returns створений Student
     */
    UniversityManagementSystem.prototype.enrollStudent = function (student) {
        if (student.fullName.trim().length < 3) {
            throw new Error("fullName занадто коротке");
        }
        assertPositiveInt(student.year, "year");
        var id = this.studentSeq++;
        var created = __assign({ id: id }, student);
        this.students.push(created);
        return deepClone(created);
    };
    /**
     * registerForCourse — реєстрація студента на курс
     * Валідації:
     * 1) студент і курс існують
     * 2) студент активний (лише Active може записуватись)
     * 3) відповідність факультету студента та курсу
     * 4) ліміт місць не перевищено
     * 5) не дублюємо реєстрацію
     */
    UniversityManagementSystem.prototype.registerForCourse = function (studentId, courseId) {
        var _a, _b;
        assertPositiveInt(studentId, "studentId");
        assertPositiveInt(courseId, "courseId");
        var student = this.students.find(function (s) { return s.id === studentId; });
        if (!student)
            throw new Error("Студента не знайдено");
        if (student.status !== StudentStatus.Active) {
            throw new Error("Лише студент зі статусом Active може реєструватись на курс");
        }
        var course = this.courses.find(function (c) { return c.id === courseId; });
        if (!course)
            throw new Error("Курс не знайдено");
        if (course.faculty !== student.faculty) {
            throw new Error("Факультет курсу не відповідає факультету студента");
        }
        var enrolledSet = (_a = this.courseEnrollments.get(courseId)) !== null && _a !== void 0 ? _a : new Set();
        if (enrolledSet.has(studentId)) {
            throw new Error("Студент уже зареєстрований на цей курс");
        }
        if (enrolledSet.size >= course.maxStudents) {
            throw new Error("Ліміт місць на курсі вже вичерпано");
        }
        enrolledSet.add(studentId);
        this.courseEnrollments.set(courseId, enrolledSet);
        var stuSet = (_b = this.studentCourses.get(studentId)) !== null && _b !== void 0 ? _b : new Set();
        stuSet.add(courseId);
        this.studentCourses.set(studentId, stuSet);
    };
    /**
     * setGrade — виставити оцінку студенту за курс
     * Валідації:
     * 1) студент і курс існують
     * 2) студент дійсно зареєстрований на курс
     * 3) студент не Expelled (логічна заборона)
     */
    UniversityManagementSystem.prototype.setGrade = function (studentId, courseId, grade) {
        assertPositiveInt(studentId, "studentId");
        assertPositiveInt(courseId, "courseId");
        var student = this.students.find(function (s) { return s.id === studentId; });
        if (!student)
            throw new Error("Студента не знайдено");
        if (student.status === StudentStatus.Expelled) {
            throw new Error("Відрахованому студенту не можна виставляти оцінки");
        }
        var course = this.courses.find(function (c) { return c.id === courseId; });
        if (!course)
            throw new Error("Курс не знайдено");
        var stuSet = this.studentCourses.get(studentId);
        if (!stuSet || !stuSet.has(courseId)) {
            throw new Error("Студент не зареєстрований на вказаний курс");
        }
        var rec = {
            studentId: studentId,
            courseId: courseId,
            grade: grade,
            date: new Date(),
            semester: course.semester,
        };
        this.grades.push(rec);
    };
    /**
     * updateStudentStatus — зміна статусу студента
     * Правила (приклад розумної політики):
     * - Статуси Graduated та Expelled — термінальні: з них не можна повернутись у Active/Academic_Leave.
     * - У Graduated можна перевести лише Active.
     * - У Expelled можна перевести лише Active або Academic_Leave.
     */
    UniversityManagementSystem.prototype.updateStudentStatus = function (studentId, newStatus) {
        assertPositiveInt(studentId, "studentId");
        var student = this.students.find(function (s) { return s.id === studentId; });
        if (!student)
            throw new Error("Студента не знайдено");
        var cur = student.status;
        // термінальні — заборонено будь-які інші переходи
        if ((cur === StudentStatus.Graduated || cur === StudentStatus.Expelled) && cur !== newStatus) {
            throw new Error("\u0417\u0456 \u0441\u0442\u0430\u0442\u0443\u0441\u0443 ".concat(cur, " \u043F\u0435\u0440\u0435\u0445\u0456\u0434 \u0437\u0430\u0431\u043E\u0440\u043E\u043D\u0435\u043D\u043E"));
        }
        // Додаткові приклади валідацій переходів:
        if (newStatus === StudentStatus.Graduated && cur !== StudentStatus.Active) {
            throw new Error("Випустити можна лише активного студента");
        }
        if (newStatus === StudentStatus.Expelled &&
            !(cur === StudentStatus.Active || cur === StudentStatus.Academic_Leave)) {
            throw new Error("Відрахувати можна лише активного або на акад. відпустці");
        }
        student.status = newStatus;
    };
    /** Отримати студентів певного факультету */
    UniversityManagementSystem.prototype.getStudentsByFaculty = function (faculty) {
        return this.students
            .filter(function (s) { return s.faculty === faculty; })
            .map(function (s) { return (__assign({}, s)); });
    };
    /** Усі оцінки студента */
    UniversityManagementSystem.prototype.getStudentGrades = function (studentId) {
        assertPositiveInt(studentId, "studentId");
        return this.grades
            .filter(function (g) { return g.studentId === studentId; })
            .map(function (g) { return (__assign({}, g)); });
    };
    /**
     * Доступні курси за факультетом і семестром — ті, де ще є місця
     * і які належать факультету/семестру
     */
    UniversityManagementSystem.prototype.getAvailableCourses = function (faculty, semester) {
        var _this = this;
        return this.courses
            .filter(function (c) { return c.faculty === faculty && c.semester === semester; })
            .filter(function (c) {
            var _a, _b;
            var enrolled = (_b = (_a = _this.courseEnrollments.get(c.id)) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
            return enrolled < c.maxStudents;
        })
            .map(function (c) { return deepClone(c); });
    };
    /** Середній бал студента (0, якщо оцінок немає) */
    UniversityManagementSystem.prototype.calculateAverageGrade = function (studentId) {
        var list = this.getStudentGrades(studentId);
        if (list.length === 0)
            return 0;
        var sum = list.reduce(function (acc, r) { return acc + r.grade; }, 0);
        return sum / list.length;
    };
    /**
     * Додатково: список відмінників по факультету.
     * Критерій прикладний: середній бал ≥ 4.5.
     */
    UniversityManagementSystem.prototype.getHonorsByFaculty = function (faculty) {
        var _this = this;
        var studs = this.getStudentsByFaculty(faculty).filter(function (s) { return s.status === StudentStatus.Active || s.status === StudentStatus.Graduated; });
        return studs
            .filter(function (s) { return _this.calculateAverageGrade(s.id) >= 4.5; })
            .map(function (s) { return deepClone(s); });
    };
    return UniversityManagementSystem;
}());
/* =========================
 * ПРИКЛАД ВИКОРИСТАННЯ (можна залишити для перевірки)
 * ========================= */
function demo() {
    // приклад перевірок — заміни на те, що в тебе в коді
    var ums = new UniversityManagementSystem();
    // дані для демонстрації
    var course = ums.createCourse({
        name: "Algorithms",
        type: CourseType.Mandatory,
        credits: 6,
        semester: Semester.First,
        faculty: Faculty.Computer_Science,
        maxStudents: 2,
    });
    var s1 = ums.enrollStudent({
        fullName: "Alice Johnson",
        faculty: Faculty.Computer_Science,
        year: 1,
        status: StudentStatus.Active,
        enrollmentDate: new Date("2025-09-01"),
        groupNumber: "CS-11",
    });
    ums.registerForCourse(s1.id, course.id);
    ums.setGrade(s1.id, course.id, Grade.Excellent);
    var grades = ums.getStudentGrades(s1.id);
    var avg = ums.calculateAverageGrade(s1.id);
    var available = ums.getAvailableCourses(Faculty.Computer_Science, Semester.First);
    // ⚠️ НЕ коментуй ці логи — інакше нічого не побачиш
    console.log("== DEMO OUTPUT ==");
    console.log("Student:", s1);
    console.log("Grades:", grades);
    console.log("Average:", avg);
    console.log("Available courses:", available);
}
demo();
