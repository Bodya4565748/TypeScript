"use strict";
function formatDate(date, showTime) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dateStr = `${day}.${month}.${year}`;
    if (showTime) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${dateStr} ${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
    }
    return dateStr;
}
const username = "Користувач";
const now = new Date();
const withTime = true;
console.log(`${username}, сьогодні: ${formatDate(now, withTime)}`);
//# sourceMappingURL=index.js.map