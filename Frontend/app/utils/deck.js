//utils/deck.js
export function makeSimpleDeck() {
  const suits = ["A","B","C","D"];
  const deck = [];
  let id = 1;
  for (const s of suits) {
    for (let v = 1; v <= 6; v++) {
      deck.push({
        id: `c${id++}`,
        name: `Card ${s}${v}`,
        type: "normal",
        image: null,
      });
    }
  }
  for (let i=0;i<6;i++){
    deck.push({
      id: `cat${i}`,
      name: `Cat ${i+1}`,
      type: "cat",
      image: null,
    });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
