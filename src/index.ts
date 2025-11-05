 //* КРОК 1. БАЗОВІ ТА СПЕЦИФІЧНІ ТИПИ

/** Базовий товар: мінімальний контракт для всіх категорій */
export type BaseProduct = {
    id: number;
    name: string;
    price: number;
    sku: string;           // артикул
    inStock: boolean;      // наявність
    tags?: string[];       // необов'язкові теги
};

/** Електроніка: розширює BaseProduct */
export type Electronics = BaseProduct & {
    category: "electronics";
    brand: string;
    warrantyMonths: number;
};

/** Одяг: розширює BaseProduct */
export type Clothing = BaseProduct & {
    category: "clothing";
    size: "XS" | "S" | "M" | "L" | "XL";
    material: string;
    gender?: "men" | "women" | "unisex";
};

/** Книги: ще один приклад категорії */
export type Book = BaseProduct & {
    category: "book";
    author: string;
    pages: number;
    cover: "hard" | "soft";
};

//* КОРИСНІ ПЕРЕВІРКИ (type guards / валідація)

/** Перевірка, що значення — додатнє число */
function isPositiveNumber(n: unknown): n is number {
    return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Простий захист від невалідного id */
function assertValidId(id: number): void {
    if (!Number.isInteger(id) || id < 0) {
        throw new Error("Некоректний id: має бути цілим невід’ємним числом");
    }
}

/** Перевірка, що об’єкт подібний до BaseProduct */
function isBaseProduct(p: unknown): p is BaseProduct {
    if (typeof p !== "object" || p === null) return false;
    const obj = p as Record<string, unknown>;
    return (
        typeof obj.id === "number" &&
        typeof obj.name === "string" &&
        typeof obj.price === "number" &&
        typeof obj.sku === "string" &&
        typeof obj.inStock === "boolean"
    );
}

// * КРОК 2. ПОШУК ТА ФІЛЬТРАЦІЯ (GENERICS)

/**
 * Знайти товар за id у масиві продуктів.
 * @param products Масив товарів довільної категорії T
 * @param id Ідентифікатор товару
 * @returns Знайдений товар або undefined
 */
export const findProduct = <T extends BaseProduct>(
    products: ReadonlyArray<T>,
    id: number
): T | undefined => {
    assertValidId(id);
    return products.find((p) => p.id === id);
};

/**
 * Відфільтрувати товари за максимальною ціною.
 * @param products Масив товарів довільної категорії T
 * @param maxPrice Гранична ціна (включно)
 * @returns Масив товарів з ціною ≤ maxPrice
 */
export const filterByPrice = <T extends BaseProduct>(
    products: ReadonlyArray<T>,
    maxPrice: number
): T[] => {
    if (!isPositiveNumber(maxPrice)) {
        throw new Error("maxPrice має бути додатним числом");
    }
    return products.filter((p) => p.price <= maxPrice);
};

// * КРОК 3. КОШИК (GENERICS)

/** Елемент кошика узагальненої категорії T */
export type CartItem<T extends BaseProduct> = {
    product: T;
    quantity: number;
};

/**
 * Додати товар у кошик. Якщо товар вже є — збільшує кількість.
 * Повертає НОВИЙ масив (іммутабельний підхід).
 */
export const addToCart = <T extends BaseProduct>(
    cart: ReadonlyArray<CartItem<T>>,
    product: T | undefined,
    quantity: number
): CartItem<T>[] => {
    if (!product) {
        // Допоміжна поведінка: якщо передали undefined, просто повертаємо копію.
        return [...cart];
    }
    if (!isBaseProduct(product)) {
        throw new Error("Переданий product не відповідає типу BaseProduct");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("quantity має бути цілим додатним числом");
    }

    const idx = cart.findIndex((ci) => ci.product.id === product.id);
    if (idx === -1) {
        return [...cart, { product, quantity }];
    }
    const updated = [...cart];
    const newQty = updated[idx].quantity + quantity;
    updated[idx] = { ...updated[idx], quantity: newQty };
    return updated;
};

/**
 * Порахувати загальну вартість кошика.
 * @returns Сума (number)
 */
export const calculateTotal = <T extends BaseProduct>(
    cart: ReadonlyArray<CartItem<T>>
): number => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
};

/**
 * Видалити товар з кошика (повністю).
 * @returns Новий масив без цього товару
 */
export const removeFromCart = <T extends BaseProduct>(
    cart: ReadonlyArray<CartItem<T>>,
    productId: number
): CartItem<T>[] => {
    assertValidId(productId);
    return cart.filter((ci) => ci.product.id !== productId);
};

/**
 * Оновити кількість товару у кошику (set, а не add).
 * Якщо quantity <= 0 — товар видаляється.
 */
export const setQuantity = <T extends BaseProduct>(
    cart: ReadonlyArray<CartItem<T>>,
    productId: number,
    quantity: number
): CartItem<T>[] => {
    assertValidId(productId);
    if (!Number.isInteger(quantity)) {
        throw new Error("quantity має бути цілим числом");
    }
    if (quantity <= 0) return removeFromCart(cart, productId);

    const idx = cart.findIndex((ci) => ci.product.id === productId);
    if (idx === -1) return [...cart];

    const updated = [...cart];
    updated[idx] = { ...updated[idx], quantity };
    return updated;
};

// * КРОК 4. ПРИКЛАД ВИКОРИСТАННЯ

const electronics: Electronics[] = [
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

const clothing: Clothing[] = [
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

const books: Book[] = [
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
function demo(): void {
    // Пошук
    const phone = findProduct(electronics, 1);
    const tee = findProduct(clothing, 10);
    const dpBook = findProduct(books, 21);

    // Фільтрація за ціною
    const cheapElectronics = filterByPrice(electronics, 30000); // ≤ 30000
    const cheapBooks = filterByPrice(books, 1000);               // ≤ 1000

    // Кошик (generic CartItem<T>)
    let cart: CartItem<BaseProduct>[] = [];
    cart = addToCart(cart, phone, 1);
    cart = addToCart(cart, tee, 2);
    cart = addToCart(cart, dpBook, 1);

    console.log("Товар:", phone);
    console.log("Кошик:", cart);

    // Зміна кількості
    if (tee) cart = setQuantity(cart, tee.id, 3);

    // Загальна вартість
    const total = calculateTotal(cart);

    // Приклад видалення
    if (phone) cart = removeFromCart(cart, phone.id);

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

