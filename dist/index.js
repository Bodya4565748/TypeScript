"use strict";
//* КРОК 1. БАЗОВІ ТА СПЕЦИФІЧНІ ТИПИ
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setQuantity = exports.removeFromCart = exports.calculateTotal = exports.addToCart = exports.filterByPrice = exports.findProduct = void 0;
//* КОРИСНІ ПЕРЕВІРКИ (type guards / валідація)
/** Перевірка, що значення — додатнє число */
function isPositiveNumber(n) {
    return typeof n === "number" && Number.isFinite(n) && n > 0;
}
/** Простий захист від невалідного id */
function assertValidId(id) {
    if (!Number.isInteger(id) || id < 0) {
        throw new Error("Некоректний id: має бути цілим невід’ємним числом");
    }
}
/** Перевірка, що об’єкт подібний до BaseProduct */
function isBaseProduct(p) {
    if (typeof p !== "object" || p === null)
        return false;
    var obj = p;
    return (typeof obj.id === "number" &&
        typeof obj.name === "string" &&
        typeof obj.price === "number" &&
        typeof obj.sku === "string" &&
        typeof obj.inStock === "boolean");
}
// * КРОК 2. ПОШУК ТА ФІЛЬТРАЦІЯ (GENERICS)
/**
 * Знайти товар за id у масиві продуктів.
 * @param products Масив товарів довільної категорії T
 * @param id Ідентифікатор товару
 * @returns Знайдений товар або undefined
 */
var findProduct = function (products, id) {
    assertValidId(id);
    return products.find(function (p) { return p.id === id; });
};
exports.findProduct = findProduct;
/**
 * Відфільтрувати товари за максимальною ціною.
 * @param products Масив товарів довільної категорії T
 * @param maxPrice Гранична ціна (включно)
 * @returns Масив товарів з ціною ≤ maxPrice
 */
var filterByPrice = function (products, maxPrice) {
    if (!isPositiveNumber(maxPrice)) {
        throw new Error("maxPrice має бути додатним числом");
    }
    return products.filter(function (p) { return p.price <= maxPrice; });
};
exports.filterByPrice = filterByPrice;
/**
 * Додати товар у кошик. Якщо товар вже є — збільшує кількість.
 * Повертає НОВИЙ масив (іммутабельний підхід).
 */
var addToCart = function (cart, product, quantity) {
    if (!product) {
        // Допоміжна поведінка: якщо передали undefined, просто повертаємо копію.
        return __spreadArray([], cart, true);
    }
    if (!isBaseProduct(product)) {
        throw new Error("Переданий product не відповідає типу BaseProduct");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("quantity має бути цілим додатним числом");
    }
    var idx = cart.findIndex(function (ci) { return ci.product.id === product.id; });
    if (idx === -1) {
        return __spreadArray(__spreadArray([], cart, true), [{ product: product, quantity: quantity }], false);
    }
    var updated = __spreadArray([], cart, true);
    var newQty = updated[idx].quantity + quantity;
    updated[idx] = __assign(__assign({}, updated[idx]), { quantity: newQty });
    return updated;
};
exports.addToCart = addToCart;
/**
 * Порахувати загальну вартість кошика.
 * @returns Сума (number)
 */
var calculateTotal = function (cart) {
    return cart.reduce(function (sum, item) { return sum + item.product.price * item.quantity; }, 0);
};
exports.calculateTotal = calculateTotal;
/**
 * Видалити товар з кошика (повністю).
 * @returns Новий масив без цього товару
 */
var removeFromCart = function (cart, productId) {
    assertValidId(productId);
    return cart.filter(function (ci) { return ci.product.id !== productId; });
};
exports.removeFromCart = removeFromCart;
/**
 * Оновити кількість товару у кошику (set, а не add).
 * Якщо quantity <= 0 — товар видаляється.
 */
var setQuantity = function (cart, productId, quantity) {
    assertValidId(productId);
    if (!Number.isInteger(quantity)) {
        throw new Error("quantity має бути цілим числом");
    }
    if (quantity <= 0)
        return (0, exports.removeFromCart)(cart, productId);
    var idx = cart.findIndex(function (ci) { return ci.product.id === productId; });
    if (idx === -1)
        return __spreadArray([], cart, true);
    var updated = __spreadArray([], cart, true);
    updated[idx] = __assign(__assign({}, updated[idx]), { quantity: quantity });
    return updated;
};
exports.setQuantity = setQuantity;
// * КРОК 4. ПРИКЛАД ВИКОРИСТАННЯ
var electronics = [
    {
        id: 1,
        name: "Смартфон XPro 12",
        price: 23999,
        sku: "EL-001",
        inStock: true,
        tags: ["smartphone", "OLED"],
        category: "electronics",
        brand: "XPro",
        warrantyMonths: 24,
    },
    {
        id: 2,
        name: "Ноутбук Ultra 14",
        price: 42999,
        sku: "EL-002",
        inStock: true,
        tags: ["laptop", "14-inch"],
        category: "electronics",
        brand: "Ultra",
        warrantyMonths: 12,
    },
];
var clothing = [
    {
        id: 10,
        name: "Футболка Basic",
        price: 599,
        sku: "CL-010",
        inStock: true,
        tags: ["t-shirt", "cotton"],
        category: "clothing",
        size: "M",
        material: "100% cotton",
        gender: "unisex",
    },
    {
        id: 11,
        name: "Куртка Softshell",
        price: 3499,
        sku: "CL-011",
        inStock: false,
        tags: ["jacket", "softshell"],
        category: "clothing",
        size: "L",
        material: "polyester",
    },
];
var books = [
    {
        id: 20,
        name: "Clean Code",
        price: 899,
        sku: "BK-020",
        inStock: true,
        tags: ["programming", "best-practice"],
        category: "book",
        author: "Robert C. Martin",
        pages: 464,
        cover: "soft",
    },
    {
        id: 21,
        name: "Design Patterns",
        price: 1199,
        sku: "BK-021",
        inStock: true,
        tags: ["architecture", "patterns"],
        category: "book",
        author: "GoF",
        pages: 395,
        cover: "hard",
    },
];
/** Демонстрація роботи: різні масиви T і той самий generic API */
function demo() {
    // Пошук
    var phone = (0, exports.findProduct)(electronics, 1);
    var tee = (0, exports.findProduct)(clothing, 10);
    var dpBook = (0, exports.findProduct)(books, 21);
    // Фільтрація за ціною
    var cheapElectronics = (0, exports.filterByPrice)(electronics, 30000); // ≤ 30000
    var cheapBooks = (0, exports.filterByPrice)(books, 1000); // ≤ 1000
    // Кошик (generic CartItem<T>)
    var cart = [];
    cart = (0, exports.addToCart)(cart, phone, 1);
    cart = (0, exports.addToCart)(cart, tee, 2);
    cart = (0, exports.addToCart)(cart, dpBook, 1);
    console.log("Товар:", phone);
    console.log("Кошик:", cart);
    // Зміна кількості
    if (tee)
        cart = (0, exports.setQuantity)(cart, tee.id, 3);
    // Загальна вартість
    var total = (0, exports.calculateTotal)(cart);
    // Приклад видалення
    if (phone)
        cart = (0, exports.removeFromCart)(cart, phone.id);
    // Лог для перевірки (у реальному проєкті — тести)
    // console.log({ phone, tee, dpBook, cheapElectronics, cheapBooks, cart, total });
    // Невеличке “твердження” для sanity-check:
    if (total < 0) {
        throw new Error("Сума не може бути від’ємною");
    }
    console.log("Товар:", phone);
    console.log("Кошик:", cart);
    console.log("Сума:", total);
}
demo();
