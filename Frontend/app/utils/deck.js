export function makeSimpleDeck() {
  const suits = ['S', 'H', 'D', 'C'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ 
        id: `${value}${suit}`, 
        name: value, 
        type: 'Standard',
        value: value // เพิ่ม value สำหรับ mock
      });
    }
  }

  // Shuffles the deck (Fisher-Yates)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}