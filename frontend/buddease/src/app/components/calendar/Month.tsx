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
    AdarII // Adding Adar II as the 13th month
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
    AdarII // Adding Adar II as the 13th month
  }
  

  interface MonthInfo {
    name: string;
    index: number;
}

// Define a function to get month information based on the calendar
function getMonthInfo(calendar: Month | HebrewMonth): MonthInfo {
    switch (calendar) {
      case Month.January:
        return { name: "January", index: 1 };
      case Month.February:
        return { name: "February", index: 2 };
      case Month.March:
        return { name: "March", index: 3 };
      case Month.April:
        return { name: "April", index: 4 };
      case Month.May:
        return { name: "May", index: 5 };
      case Month.June:
        return { name: "June", index: 6 };
      case Month.July:
        return { name: "July", index: 7 };
      case Month.August:
        return { name: "August", index: 8 };
      case Month.September:
        return { name: "September", index: 9 };
      case Month.October:
        return { name: "October", index: 10 };
      case Month.November:
        return { name: "November", index: 11 };
      case Month.December:
        return { name: "December", index: 12 };
      case HebrewMonth.Nissan:
        return { name: "Nissan", index: 1 };
      case HebrewMonth.Iyar:
        return { name: "Iyar", index: 2 };
      case HebrewMonth.Sivan:
        return { name: "Sivan", index: 3 };
      case HebrewMonth.Tammuz:
        return { name: "Tammuz", index: 4 };
      case HebrewMonth.Av:
        return { name: "Av", index: 5 };
      case HebrewMonth.Elul:
        return { name: "Elul", index: 6 };
      case HebrewMonth.Tishrei:
        return { name: "Tishrei", index: 7 };
      case HebrewMonth.Cheshvan:
        return { name: "Cheshvan", index: 8 };
      case HebrewMonth.Kislev:
        return { name: "Kislev", index: 9 };
      case HebrewMonth.Tevet:
        return { name: "Tevet", index: 10 };
      case HebrewMonth.Shevat:
        return { name: "Shevat", index: 11 };
      case HebrewMonth.Adar:
        return { name: "Adar", index: 12 };
      case HebrewMonth.AdarII:
        return { name: "Adar II", index: 13 };
      default:
        throw new Error("Invalid month");
    }
  }
  
  // Example usage
  const gregorianJanuary = Month.January;
  const hijriMuharram = HebrewMonth.Nissan;
  
  console.log(getMonthInfo(gregorianJanuary)); // Output: { name: "January", index: 1 }
  console.log(getMonthInfo(hijriMuharram));    // Output: { name: "Nissan", index: 1 }
  