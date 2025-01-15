class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
    }

    initializeDeck() {
        const suits = ['heart', 'diamond', 'club', 'spade'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        // 创建52张牌
        for (let suit of suits) {
            for (let value of values) {
                this.cards.push(new Card(suit, value));
            }
        }
    }

    // 洗牌方法
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // 发牌方法
    dealCard() {
        if (this.cards.length > 0) {
            return this.cards.pop();
        }
        return null;
    }

    // 获取剩余牌数
    getRemainingCards() {
        return this.cards.length;
    }
}
