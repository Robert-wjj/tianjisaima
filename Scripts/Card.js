class Card {
    constructor(suit, rank, player1Name, player2Name) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;
        this.selected = false;
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.originalX = 0;
        this.originalY = 0;
        this.currentX = 0;
        this.currentY = 0;
        
        // 加载卡牌图片
        this.image = new Image();
        this.image.src = `Assets/images/Cards/card_${suit}_${rank}.png`;
        
        // 根据玩家名称选择卡牌背面图片
        const player1Names = ["wjj", "WJJ", "吴俊江"];
        const player2Names = ["hdx", "HDX", "韩德霞"];
        
        const isPlayer1Special = player1Names.includes(player1Name);
        const isPlayer2Special = player2Names.includes(player2Name);

        // 设置卡牌背面图片
        this.backImage = new Image();
        this.backImage.src = (isPlayer1Special && isPlayer2Special) ? 
            'Assets/images/Cards/card_back2.png' : 
            'Assets/images/Cards/card_back.png';
    }

    setPosition(x, y) {
        this.originalX = x;
        this.originalY = y;
        this.currentX = x;
        this.currentY = y;
    }

    draw(context, x, y, width, height) {
        // 如果卡牌正在拖动，使用当前位置
        const drawX = this.isDragging ? this.currentX : x;
        const drawY = this.isDragging ? this.currentY : y;
        
        if (this.faceUp) {
            context.drawImage(this.image, drawX, drawY, width, height);
        } else {
            context.drawImage(this.backImage, drawX, drawY, width, height);
        }
        
        if (this.selected) {
            context.strokeStyle = 'yellow';
            context.lineWidth = 3;
            context.strokeRect(drawX, drawY, width, height);
        }
    }
}
