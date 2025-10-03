// usersDataSourceToCSV.ts
const usersDataSourceToCSV = (usersDataSource: any[]) => {
    if (usersDataSource.length === 0) {
      return '';
    }
  
    const headers = Object.keys(usersDataSource[0]).join(',');
    const rows = usersDataSource.map(user =>
      Object.entries(user).map(([key, value]) => `"${value}"`).join(',')
).join('\n');
  
    return `${headers}\n${rows}`;
  };

  
export {usersDataSourceToCSV}