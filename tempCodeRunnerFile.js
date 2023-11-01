const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() +1;
const day = currentDate.getDate(); 
console.log(day); 
const res = String(year) + "-" + String(month) + "-" + String(day); 
console.log(res); 