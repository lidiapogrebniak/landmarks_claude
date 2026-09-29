const response = await fetch("./data/wordBank.json");
const words = await response.json();

console.log(words);
