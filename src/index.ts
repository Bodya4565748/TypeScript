function formatDate(date: Date, showTime: boolean): string {
    const day: number = date.getDate();
    const month: number = date.getMonth() + 1;
    const year: number = date.getFullYear();

    const dateStr: string = `${day}.${month}.${year}`;

    if (showTime) {
        const hours: number = date.getHours();
        const minutes: number = date.getMinutes();
        return `${dateStr} ${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
    }

    return dateStr;
}

const username: string = "Користувач";
const now: Date = new Date();
const withTime: boolean = true;

console.log(`${username}, сьогодні: ${formatDate(now, withTime)}`);