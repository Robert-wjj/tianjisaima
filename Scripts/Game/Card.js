class Card {
    constructor(suit, value) {
        this.suit = suit;    // 花色
        this.value = value;  // 点数
        this.faceUp = false; // 卡牌朝向
    }

    getImagePath(player1Name, player2Name) {
        // 检查玩家名称
        const player1Names = ["wjj", "WJJ", "吴俊江"];
        const player2Names = ["hdx", "HDX", "韩德霞"];
        
        const isPlayer1Special = player1Names.includes(player1Name);
        const isPlayer2Special = player2Names.includes(player2Name);

        // 根据玩家名称选择卡牌背面图片
        if (this.faceUp) {
            return `Assets/images/Cards/card_${this.suit}_${this.value}.png`;
        } else {
            return (isPlayer1Special && isPlayer2Special) ? 
                'Assets/images/Cards/card_back2.png' : 
                'Assets/images/Cards/card_back.png';
        }
    }

    draw(ctx) {
        const img = new Image();
        img.src = this.getImagePath(player1Name, player2Name); // 确保传入玩家名称

        img.onload = () => {
            ctx.drawImage(img, this.x, this.y); // 只有在图像加载完成后才绘制
        };

        img.onerror = () => {
            console.error(`无法加载图像: ${img.src}`);
        };
    }
}

// 示例用法
const card = new Card('spade', 'ace');  // 创建一张黑桃A
console.log(card.getImagePath('wjj', 'hdx')); // 获取图片路径