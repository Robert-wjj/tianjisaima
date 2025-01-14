class GameController {
    constructor() {
        this.deck = new Deck();
        this.firstSixCards = [];
        this.secondSixCards = [];
        this.currentPhase = 0; // 0: 未开始, 1: 第一阶段, 2: 第二阶段, 3: 游戏结束
    }

    // 开始新游戏
    startNewGame() {
        this.deck.shuffle();
        this.dealInitialCards();
        this.currentPhase = 1;
    }

    // 发放初始12张牌
    dealInitialCards() {
        // 发前6张牌并正面朝上
        this.firstSixCards = [];
        for (let i = 0; i < 6; i++) {
            const card = this.deck.dealCard();
            card.faceUp = true;
            this.firstSixCards.push(card);
        }

        // 发后6张牌并背面朝上
        this.secondSixCards = [];
        for (let i = 0; i < 6; i++) {
            const card = this.deck.dealCard();
            card.faceUp = false;
            this.secondSixCards.push(card);
        }
    }

    // 完成第一阶段排序
    completeFirstPhase() {
        if (this.currentPhase !== 1) return;

        // 翻转前6张牌
        this.firstSixCards.forEach(card => {
            card.faceUp = false;
        });

        // 翻转后6张牌
        this.secondSixCards.forEach(card => {
            card.faceUp = true;
        });

        this.currentPhase = 2;
    }

    // 完成第二阶段排序
    completeSecondPhase() {
        if (this.currentPhase !== 2) return;

        // 翻转后6张牌
        this.secondSixCards.forEach(card => {
            card.faceUp = false;
        });

        this.currentPhase = 3;
    }

    // 获取当前可见的牌
    getVisibleCards() {
        if (this.currentPhase === 1) {
            return this.firstSixCards;
        } else if (this.currentPhase === 2) {
            return this.secondSixCards;
        }
        return [];
    }

    // 重新排序当前可见的牌
    reorderCards(newOrder) {
        if (this.currentPhase === 1) {
            this.firstSixCards = newOrder.map(index => this.firstSixCards[index]);
        } else if (this.currentPhase === 2) {
            this.secondSixCards = newOrder.map(index => this.secondSixCards[index]);
        }
    }

    // 获取游戏当前状态
    getGameState() {
        return {
            currentPhase: this.currentPhase,
            firstSixCards: this.firstSixCards,
            secondSixCards: this.secondSixCards
        };
    }

    // 第一步结算：比较第一张牌
    settleFirstStep() {
        if (this.currentPhase !== 3) return null;
        
        const firstCard1 = this.firstSixCards[0];
        const firstCard2 = this.secondSixCards[0];
        firstCard1.faceUp = true;
        firstCard2.faceUp = true;

        return this.compareCardValues(firstCard1, firstCard2);
    }

    // 第二步结算：比较第2、3张牌的点数和
    settleSecondStep() {
        if (this.currentPhase !== 3) return null;

        // 翻开2、3号位置的牌
        const cards1 = this.firstSixCards.slice(1, 3);
        const cards2 = this.secondSixCards.slice(1, 3);
        cards1.forEach(card => card.faceUp = true);
        cards2.forEach(card => card.faceUp = true);

        const sum1 = this.calculateBlackjackSum(cards1);
        const sum2 = this.calculateBlackjackSum(cards2);

        // 如果任一方超过10.5点，该方不计分
        if (sum1 > 10.5) sum1 = 0;
        if (sum2 > 10.5) sum2 = 0;

        return {
            firstGroupSum: sum1,
            secondGroupSum: sum2,
            winner: sum1 > sum2 ? 1 : (sum2 > sum1 ? 2 : 0)
        };
    }

    // 第三步结算：炸金花比较
    settleThirdStep() {
        if (this.currentPhase !== 3) return null;

        // 翻开剩余的牌
        const cards1 = this.firstSixCards.slice(3);
        const cards2 = this.secondSixCards.slice(3);
        cards1.forEach(card => card.faceUp = true);
        cards2.forEach(card => card.faceUp = true);

        return this.comparePokerHands(cards1, cards2);
    }

    // 辅助方法：比较单张牌的大小
    compareCardValues(card1, card2) {
        const valueMap = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
        };

        const value1 = valueMap[card1.value];
        const value2 = valueMap[card2.value];

        return {
            firstCardValue: value1,
            secondCardValue: value2,
            winner: value1 > value2 ? 1 : (value2 > value1 ? 2 : 0)
        };
    }

    // 辅助方法：计算21点规则的点数和
    calculateBlackjackSum(cards) {
        let sum = 0;
        for (const card of cards) {
            if (['jack', 'queen', 'king'].includes(card.value)) {
                sum += 0.5;
            } else if (card.value === 'ace') {
                sum += 1;
            } else {
                sum += parseInt(card.value);
            }
        }
        return sum;
    }

    // 辅助方法：比较炸金花牌型
    comparePokerHands(hand1, hand2) {
        // 获取牌型
        const type1 = this.getPokerHandType(hand1);
        const type2 = this.getPokerHandType(hand2);

        return {
            firstHandType: type1,
            secondHandType: type2,
            winner: type1.rank > type2.rank ? 1 : 
                   (type2.rank > type1.rank ? 2 : 
                    this.compareHighCards(hand1, hand2))
        };
    }

    // 辅助方法：获取炸金花牌型
    getPokerHandType(cards) {
        // 检查是否同花
        const isFlush = cards.every(card => card.suit === cards[0].suit);
        
        // 获取点数数组
        const values = cards.map(card => {
            const valueMap = {
                '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
                '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
            };
            return valueMap[card.value];
        }).sort((a, b) => b - a);

        // 检查是否顺子
        const isStraight = values.every((val, index) => 
            index === values.length - 1 || val === values[index + 1] + 1
        );

        // 检查对子或三条
        const valueCounts = new Map();
        values.forEach(value => {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        });
        const maxCount = Math.max(...valueCounts.values());

        // 返回牌型和等级
        if (isFlush && isStraight) return { name: '同花顺', rank: 5 };
        if (maxCount === 3) return { name: '豹子', rank: 4 };
        if (isFlush) return { name: '同花', rank: 3 };
        if (isStraight) return { name: '顺子', rank: 2 };
        if (maxCount === 2) return { name: '对子', rank: 1 };
        return { name: '散牌', rank: 0 };
    }

    // 辅助方法：比较相同牌型的大小
    compareHighCards(hand1, hand2) {
        const values1 = this.getOrderedValues(hand1);
        const values2 = this.getOrderedValues(hand2);

        for (let i = 0; i < values1.length; i++) {
            if (values1[i] > values2[i]) return 1;
            if (values2[i] > values1[i]) return 2;
        }
        return 0; // 完全相等
    }

    // 辅助方法：获取排序后的点数数组
    getOrderedValues(cards) {
        const valueMap = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
        };
        return cards.map(card => valueMap[card.value]).sort((a, b) => b - a);
    }
}
