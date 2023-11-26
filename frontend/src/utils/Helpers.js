const daysBetweenDates = (date1, date2) => {
    // Convert both dates to UTC to ensure consistent calculation
    const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
    // Calculate the difference in milliseconds
    const timeDifference = Math.abs(utcDate2 - utcDate1);
  
    // Convert the difference to days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
    return daysDifference;
  }

  export {daysBetweenDates}