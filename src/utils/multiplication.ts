export type Method = { id: string; title: string; body: string; demo?: (a:number)=>{steps:string[]} };

export const TABLES = Array.from({length:12}, (_,i)=>i+1);

export function randInt(min:number, max:number){
  return Math.floor(Math.random()*(max-min+1))+min;
}

export type Question = { a:number; b:number; answer:number; text:string };

export function makeQuestion(range=12): Question{
  const a = randInt(1, range);
  const b = randInt(1, range);
  return { a, b, answer: a*b, text: `${a} × ${b} = ?` };
}

export type ExtendPrompt = { left:string; right:string; solution:number; a:number; b:number; product:number };

export function makeExtend(range=12): ExtendPrompt{
  const a = randInt(1, range);
  const b = randInt(1, range);
  const product = a*b;
  const forms: [string, string, number][] = [
    [`${a} × ? = ${product}`, `${product} ÷ ${a} = ?`, b],
    [`? × ${b} = ${product}`, `${product} ÷ ${b} = ?`, a],
    [`${a} × ${b} = ${product}`, `${product} ÷ ? = ${a}`, b],
  ];
  const pick = forms[randInt(0, forms.length-1)];
  const [left, right, solution] = pick;
  return { left, right, solution, a, b, product };
}

export const METHODS = [
  { id:'commute', title:'Flip it! (Commutative Property)', body:'3×4 is the same as 4×3. If one way is easier, flip it.' },
  { id:'skip', title:'Skip Counting', body:'Count by groups: for 4s say 4,8,12,16… Use a rhythm or clap.' },
  { id:'area', title:'Array & Area Model', body:'Draw rows and columns. 3×5 is 3 rows of 5. Count the tiles.' },
  { id:'double', title:'Double & Halve', body:'To do 6×8, think (3×8) doubled → 24 ×2 = 48. Or 12×5 = (12×10)/2.' },
  { id:'nine', title:'Nifty Nines', body:'For 9×x, the digits add to 9 (e.g., 9×7=63).' },
  { id:'five', title:'Fabulous Fives', body:'Ends in 0 or 5. It’s half of ×10. Example 7×5 = 35.' },
  { id:'tens', title:'Tens & Zeros', body:'×10 just add a zero; ×11 up to 9 is double the digit (e.g., 6×11=66).'},
  { id:'break', title:'Break Apart (Distributive)', body:'12×7 = 12×5 + 12×2 = 84.' },
  { id:'pattern', title:'Pattern Spotting', body:'Even×even ends 0,2,4,6,8; 5s alternate 5 and 0.' },
];
