// Month.tsx
enum Month {
  January = 1,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
  AdarII, // Adding Adar II as the 13th month
}

enum HebrewMonth {
  Nissan = 1,
  Iyar,
  Sivan,
  Tammuz,
  Av,
  Elul,
  Tishrei,
  Cheshvan,
  Kislev,
  Tevet,
  Shevat,
  Adar,
  AdarII, // Adding Adar II as the 13th month
}

interface MonthInfo {
  id: Month | HebrewMonth;
  name: string;
  color: string;
  index: number;
  description: string;
}
// Define a function to get month information based on the calendar
function getMonthInfo(calendar: Month | HebrewMonth): MonthInfo {
  switch (calendar) {
    case Month.January:
      return {
        id: Month.January,
        name: "January",
        color: "",
        description: "",
        index: 1,
      };
    case Month.February:
      return {
        id: Month.February,
        name: "February",
        color: "",
        description: "",
        index: 2,
      };
    case Month.March:
      return {
        id: Month.March,
        name: "March",
        color: "",
        description: "",
        index: 3,
      };
    case Month.April:
      return {
        id: Month.April,
        name: "April",
        color: "",
        description: "",
        index: 4,
      };
    case Month.May:
      return {
        id: Month.May,
        name: "May",
        color: "",
        description: "",
        index: 5,
      };
    case Month.June:
      return {
        id: Month.June,
        name: "June",
        color: "",
        description: "",
        index: 6,
      };
    case Month.July:
      return {
        id: Month.July,
        name: "July",
        color: "",
        description: "",
        index: 7,
      };
    case Month.August:
      return {
        id: Month.August,
        name: "August",
        color: "",
        description: "",
        index: 8,
      };
    case Month.September:
      return {
        id: Month.September,
        name: "September",
        color: "",
        description: "",
        index: 9,
      };
    case Month.October:
      return {
        id: Month.October,
        name: "October",
        color: "",
        description: "",
        index: 10,
      };
    case Month.November:
      return {
        id: Month.November,
        name: "November",
        color: "",
        description: "",
        index: 11,
      };
    case Month.December:
      return {
        id: Month.December,
        name: "December",
        color: "",
        description: "",
        index: 12,
      };
    case HebrewMonth.Nissan:
      return {
        id: HebrewMonth.Nissan,
        name: "Nissan",
        color: "",
        description: "",
        index: 1,
      };
    case HebrewMonth.Iyar:
      return {
        id: HebrewMonth.Iyar,
        name: "Iyar",
        color: "",
        description: "",
        index: 2,
      };
    case HebrewMonth.Sivan:
      return {
        id: HebrewMonth.Sivan,
        name: "Sivan",
        color: "",
        description: "",
        index: 3,
      };
    case HebrewMonth.Tammuz:
      return {
        id: HebrewMonth.Tammuz,
        name: "Tammuz",
        color: "",
        description: "",
        index: 4,
      };
    case HebrewMonth.Av:
      return {
        id: HebrewMonth.Av,
        name: "Av",
        color: "",
        description: "",
        index: 5,
      };
    case HebrewMonth.Elul:
      return {
        id: HebrewMonth.Elul,
        name: "Elul",
        color: "",
        description: "",
        index: 6,
      };
    case HebrewMonth.Tishrei:
      return {
        id: HebrewMonth.Tishrei,
        name: "Tishrei",
        color: "",
        description: "",
        index: 7,
      };
    case HebrewMonth.Cheshvan:
      return {
        id: HebrewMonth.Cheshvan,
        name: "Cheshvan",
        color: "",
        description: "",
        index: 8,
      };
    case HebrewMonth.Kislev:
      return {
        id: HebrewMonth.Kislev,
        name: "Kislev",
        color: "",
        description: "",
        index: 9,
      };
    case HebrewMonth.Tevet:
      return {
        id: HebrewMonth.Tevet,
        name: "Tevet",
        color: "",
        description: "",
        index: 10,
      };
    case HebrewMonth.Shevat:
      return {
        id: HebrewMonth.Shevat,
        name: "Shevat",
        color: "",
        description: "",
        index: 11,
      };
    case HebrewMonth.Adar:
      return {
        id: HebrewMonth.Adar,
        name: "Adar",
        color: "",
        description: "",
        index: 12,
      };
    case HebrewMonth.AdarII:
      return {
        id: HebrewMonth.AdarII,
        name: "Adar II",
        color: "",
        description: "",
        index: 13,
      };
    default:
      throw new Error("Invalid month");
  }
}


// Example usage
const gregorianJanuary = Month.January;
const hijriMuharram = HebrewMonth.Nissan;

console.log(getMonthInfo(gregorianJanuary)); // Output: {
console.log(getMonthInfo(gregorianJanuary)); // Output: { name: "January", index: 1 }
console.log(getMonthInfo(hijriMuharram)); // Output: { name: "Nissan", index: 1 }

export { Month };
export type { MonthInfo };

