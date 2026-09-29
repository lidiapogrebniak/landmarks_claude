const response = await fetch("./wordBank.json");
const words = await response.json();

console.log(words);
