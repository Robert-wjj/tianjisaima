class UIManager {
    constructor() {
        console.log('UIManager 构造函数被调用');
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        this.buttonWidth = 200;
        this.buttonHeight = 80;
        this.needsRedraw = true;

        // 添加标题属性
        this.gameTitle = "田忌赛马";
        this.titleFont = "48px 微软雅黑";  // 使用中文字体
        this.titleColor = "#000000";        // 修改为黑色

        // 绑定render方法到实例
        this.render = this.render.bind(this);
        
        if (this.canvas && this.context) {
            console.log('Canvas 初始化成功:', {
                width: this.canvas.width,
                height: this.canvas.height,
                context: !!this.context
            });
        }

        // 添加事件监听
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // 按钮状态
        this.buttonHovered = false;
        
        // 添加调试模式
        this.debug = true;
        
        // 添加游戏状态
        this.gameState = 'MENU'; // 可能的状态: MENU, PLAYING, PAUSED
        
        // 绑定事件处理器
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        // 卡牌相关属性
        this.cards = [];
        this.cardWidth = 100;
        this.cardHeight = 140;
        this.cardSpacing = 20;
        this.topRowY = 200;
        this.bottomRowY = this.canvas.height - 300;
        
        // 游戏阶段
        this.gamePhase = 'INIT'; // INIT, PLAYER1_TURN, SORTING, READY_TO_COMPETE
        
        // 修改按钮属性，设置两个翻转按钮的位置
        this.flipButton1X = (this.canvas?.width || 800) / 2 - 200; // 上方按钮居中
        this.flipButton1Y = 100;
        this.flipButton2X = (this.canvas?.width || 800) / 2 - 200; // 下方按钮居中
        this.flipButton2Y = this.bottomRowY - 100; // 第二排卡片上方100像素
        this.gameButtonWidth = 150;
        this.gameButtonHeight = 60;
        
        // 跟踪两排卡片的状态
        this.isTopRowFaceUp = false;
        this.isBottomRowFaceUp = false;
        
        // 添加拖动相关属性
        this.draggedCard = null;
        this.dragStartIndex = -1;
        this.dragStartRow = null; // 'top' 或 'bottom'
        
        // 绑定鼠标事件
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // 添加鼠标事件监听
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        
        // 添加确认按钮的位置
        this.confirmButton1X = this.flipButton1X + this.gameButtonWidth + 100; // 玩家1按钮右侧
        this.confirmButton1Y = this.flipButton1Y;
        this.confirmButton2X = this.flipButton2X + this.gameButtonWidth + 100; // 玩家2按钮右侧
        this.confirmButton2Y = this.flipButton2Y;
        
        // 添加确认状态
        this.player1Confirmed = false;
        this.player2Confirmed = false;
        
        // 添加游戏结果相关属性
        this.gameResult = null; // 'player1', 'player2', 或 'draw'
        this.matchResults = []; // 存储每对卡片的比较结果
        this.showingResults = false;
        this.resultFont = "36px 微软雅黑";
        this.matchFont = "24px 微软雅黑";

        // 添加结算相关属性
        this.settlementStep = 0; // 0-3，0表示未开始结算
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentRevealedCards = 0; // 当前已翻开的卡片数量

        // 添加弹窗相关属性
        this.showResultDialog = false;
        this.dialogWidth = 400;
        this.dialogHeight = 200;
        this.dialogPadding = 20;
        this.dialogBorderRadius = 10;

        // 添加对局记录相关属性
        this.gameRecord = {
            player1Cards: [],
            player2Cards: [],
            step1Result: '',
            step2Result: '',
            step3Result: '',
            finalResult: ''
        };

        // 添加玩家名字属性
        this.player1Name = '';
        this.player2Name = '';
        this.hasPlayerNames = false;
        
        // 创建输入对话框
        this.createPlayerNameDialog();

        // 添加开始结算按钮的位置，向上移动50像素
        this.startSettlementButtonX = this.canvas.width / 2 - 75; // 居中
        this.startSettlementButtonY = this.canvas.height - 650; // 距离底部650像素

        // 初始化音频上下文
        this.audioContext = null;
        this.initAudio();

        // 更新卡牌和按钮图片的路径
        this.cardImagePath = 'Assets/Cards'; // 更新卡牌图片路径
        this.buttonImagePath = 'Assets/UI';   // 更新按钮图片路径
    }

    // 修改音频初始化
    initAudio() {
        // 等待用户交互后再初始化音频上下文
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('音频上下文已创建');
            } else if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('音频上下文已恢复');
                });
            }
        }, { once: true });
    }

    createPlayerNameDialog() {
        // 创建对话框容器
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            z-index: 1000;
        `;
        
        // 创建标题
        const title = document.createElement('h2');
        title.textContent = '请输入玩家姓名';
        title.style.marginBottom = '20px';
        dialog.appendChild(title);
        
        // 创建玩家1输入框
        const input1Label = document.createElement('div');
        input1Label.textContent = '玩家1：';
        input1Label.style.marginBottom = '10px';
        dialog.appendChild(input1Label);
        
        const input1 = document.createElement('input');
        input1.type = 'text';
        input1.style.marginBottom = '20px';
        input1.style.width = '200px';
        input1.style.padding = '5px';
        dialog.appendChild(input1);
        
        // 创建玩家2输入框
        const input2Label = document.createElement('div');
        input2Label.textContent = '玩家2：';
        input2Label.style.marginBottom = '10px';
        dialog.appendChild(input2Label);
        
        const input2 = document.createElement('input');
        input2.type = 'text';
        input2.style.marginBottom = '20px';
        input2.style.width = '200px';
        input2.style.padding = '5px';
        dialog.appendChild(input2);
        
        // 创建确认按钮
        const button = document.createElement('button');
        button.textContent = '开始游戏';
        button.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
        `;
        dialog.appendChild(button);
        
        // 添加按钮点击事件
        button.onclick = () => {
            if (input1.value.trim() && input2.value.trim()) {
                this.player1Name = input1.value.trim();
                this.player2Name = input2.value.trim();
                this.hasPlayerNames = true;
                document.body.removeChild(dialog);
                this.startGame();
            } else {
                alert('请输入两位玩家的姓名！');
            }
        };
        
        // 添加对话框到页面
        document.body.appendChild(dialog);
    }

    async init(resources) {
        this.resources = resources;
        console.log('UIManager init 被调用，资源:', resources);
        
        // 更新资源加载路径
        this.resources.images.background = await this.loadImage(`${this.buttonImagePath}/background.png`);
        this.resources.images.startButton = await this.loadImage(`${this.buttonImagePath}/startButton.png`);
        this.resources.images.competeButton = await this.loadImage(`${this.buttonImagePath}/competeButton.png`);
        
        // 加载卡牌图片
        for (const card of this.cards) {
            card.image = await this.loadImage(`${this.cardImagePath}/${card.suit}_${card.rank}.png`);
        }

        if (this.resources.images.background && 
            this.resources.images.startButton && 
            this.resources.images.competeButton) {
            console.log('UIManager 资源加载完成:', {
                background: !!this.resources.images.background,
                startButton: !!this.resources.images.startButton,
                competeButton: !!this.resources.images.competeButton
            });
            
            // 初始化完成后请求首次渲染
            this.requestRedraw();
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`无法加载图片: ${src}`));
        });
    }

    startGame() {
        if (!this.hasPlayerNames) {
            this.createPlayerNameDialog();
            return;
        }
        
        this.gameState = 'PLAYING';
        this.player1Confirmed = false;
        this.player2Confirmed = false;
        console.log('游戏开始！');
        
        // 初始化卡牌
        this.initializeCards();
        this.isTopRowFaceUp = false;
        this.isBottomRowFaceUp = false;
        
        // 清除菜单UI
        this.needsRedraw = true;
        
        this.showingResults = false;
        this.gameResult = null;
        this.matchResults = [];
        this.showResultDialog = false;
        
        // 初始化对局记录
        this.gameRecord = {
            player1Cards: [],
            player2Cards: [],
            step1Result: '',
            step2Result: '',
            step3Result: '',
            finalResult: ''
        };
        
        // 记录初始卡牌顺序
        this.gameRecord.player1Cards = this.cards.slice(0, 6).map(card => this.getCardName(card));
        this.gameRecord.player2Cards = this.cards.slice(6, 12).map(card => this.getCardName(card));
    }

    initializeCards() {
        const suits = ['spade', 'heart', 'club', 'diamond'];
        const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
        
        // 创建一副完整的牌
        let deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push(new Card(suit, rank));
            }
        }
        
        // 洗牌
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // 抽取12张牌
        this.cards = deck.slice(0, 12);
        
        // 所有卡牌初始都是背面朝上
        for (let card of this.cards) {
            card.faceUp = false;
        }
    }

    render() {
        if (!this.context || !this.canvas) {
            console.error('Canvas或Context未初始化');
            return;
        }

        // 清除上一帧
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        if (this.resources?.images?.background) {
            this.context.drawImage(this.resources.images.background, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 根据游戏状态绘制不同的UI
        if (this.gameState === 'MENU') {
            this.renderMenu();
        } else if (this.gameState === 'PLAYING') {
            this.renderGame();
            
            // 仅在不显示结果弹窗时绘制开始结算按钮
            if (!this.showResultDialog) {
                this.renderButton(
                    this.resources.images.competeButton,
                    this.startSettlementButtonX,
                    this.startSettlementButtonY,
                    this.gameButtonWidth,
                    this.gameButtonHeight
                );
            }
        }
    }

    renderMenu() {
        // 绘制标题
        this.context.font = this.titleFont;
        this.context.fillStyle = this.titleColor;
        this.context.textAlign = 'center';
        
        // 可以选择添加文字描边使其更清晰
        this.context.strokeStyle = "#FFFFFF";  // 白色描边
        this.context.lineWidth = 2;
        this.context.strokeText(
            this.gameTitle, 
            this.canvas.width / 2,
            this.canvas.height * 0.4
        );
        
        this.context.fillText(
            this.gameTitle, 
            this.canvas.width / 2,
            this.canvas.height * 0.4
        );
        
        // 计算按钮位置
        const buttonX = (this.canvas.width - this.buttonWidth) / 2;
        const buttonY = this.canvas.height * 0.6;
        
        // 绘制开始按钮
        if (this.resources?.images?.startButton) {
            if (this.buttonHovered) {
                this.context.globalAlpha = 0.8;
            }
            
            this.context.drawImage(
                this.resources.images.startButton,
                buttonX,
                buttonY,
                this.buttonWidth,
                this.buttonHeight
            );
            
            this.context.globalAlpha = 1.0;
            
            // 调试模式：显示按钮边框
            if (this.debug) {
                this.context.strokeStyle = 'red';
                this.context.lineWidth = 2;
                this.context.strokeRect(buttonX, buttonY, this.buttonWidth, this.buttonHeight);
            }
        }
    }

    renderGame() {
        // 绘制卡牌
        this.renderCards();
        
        if (!this.showingResults) {
            // 绘制玩家1的按钮和确认按钮
            this.renderButton(
                this.resources.images.player1Button,
                this.flipButton1X,
                this.flipButton1Y,
                this.gameButtonWidth,
                this.gameButtonHeight
            );
            
            if (!this.player1Confirmed) {
                this.renderButton(
                    this.resources.images.competeButton,
                    this.confirmButton1X,
                    this.confirmButton1Y,
                    this.gameButtonWidth,
                    this.gameButtonHeight
                );
            }
            
            // 绘制玩家2的按钮和确认按钮
            this.renderButton(
                this.resources.images.player2Button,
                this.flipButton2X,
                this.flipButton2Y,
                this.gameButtonWidth,
                this.gameButtonHeight
            );
            
            if (!this.player2Confirmed) {
                this.renderButton(
                    this.resources.images.competeButton,
                    this.confirmButton2X,
                    this.confirmButton2Y,
                    this.gameButtonWidth,
                    this.gameButtonHeight
                );
            }
        }
        
        // 如果正在显示结果，绘制结算界面
        if (this.showingResults) {
            this.renderResults();
        }
    }

    renderCards() {
        // 绘制非拖动状态的卡片
        const baseX = (this.canvas.width - (this.cardWidth * 6 + this.cardSpacing * 5)) / 2;
        
        // 绘制上排卡牌
        for (let i = 0; i < 6; i++) {
            const x = baseX + i * (this.cardWidth + this.cardSpacing);
            if (!this.cards[i].isDragging) {
                this.cards[i].setPosition(x, this.topRowY);
            }
            this.cards[i].draw(this.context, x, this.topRowY, this.cardWidth, this.cardHeight);
        }
        
        // 绘制下排卡牌
        for (let i = 6; i < 12; i++) {
            const x = baseX + (i - 6) * (this.cardWidth + this.cardSpacing);
            if (!this.cards[i].isDragging) {
                this.cards[i].setPosition(x, this.bottomRowY);
            }
            this.cards[i].draw(this.context, x, this.bottomRowY, this.cardWidth, this.cardHeight);
        }
        
        // 最后绘制正在拖动的卡片
        if (this.draggedCard) {
            this.draggedCard.draw(
                this.context,
                this.draggedCard.currentX,
                this.draggedCard.currentY,
                this.cardWidth,
                this.cardHeight
            );
        }
    }

    renderButton(image, x, y, width, height) {
        if (image) {
            this.context.drawImage(image, x, y, width, height);
            
            if (this.debug) {
                this.context.strokeStyle = 'red';
                this.context.lineWidth = 2;
                this.context.strokeRect(x, y, width, height);
            }
        }
    }

    // 添加一个方法来标记需要重绘
    requestRedraw() {
        this.needsRedraw = true;
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.showingResults) {
            // 在结算过程中点击进入下一步
            if (this.settlementStep === 1) {
                this.processStep2();
                this.settlementStep = 2;
            } else if (this.settlementStep === 2) {
                this.processStep3();
                this.settlementStep = 3;
            }
            return;
        }
        
        if (this.gameState === 'MENU') {
            const buttonX = (this.canvas.width - this.buttonWidth) / 2;
            const buttonY = this.canvas.height * 0.6;
            
            if (x >= buttonX && x <= buttonX + this.buttonWidth &&
                y >= buttonY && y <= buttonY + this.buttonHeight) {
                console.log('开始按钮被点击');
                this.startGame();
            }
        } else if (this.gameState === 'PLAYING') {
            // 检测玩家1翻转按钮点击
            if (!this.player1Confirmed && this.isPointInButton(x, y, this.flipButton1X, this.flipButton1Y)) {
                this.isTopRowFaceUp = !this.isTopRowFaceUp;
                for (let i = 0; i < 6; i++) {
                    this.cards[i].faceUp = this.isTopRowFaceUp;
                }
                console.log(`第一排卡片已${this.isTopRowFaceUp ? '翻转为正面' : '翻转为背面'}`);
            }
            // 检测玩家1确认按钮点击
            else if (!this.player1Confirmed && this.isPointInButton(x, y, this.confirmButton1X, this.confirmButton1Y)) {
                this.player1Confirmed = true;
                this.isTopRowFaceUp = false;
                for (let i = 0; i < 6; i++) {
                    this.cards[i].faceUp = false;
                }
                console.log('玩家1已确认排序');
            }
            // 检测玩家2翻转按钮点击
            else if (!this.player2Confirmed && this.isPointInButton(x, y, this.flipButton2X, this.flipButton2Y)) {
                this.isBottomRowFaceUp = !this.isBottomRowFaceUp;
                for (let i = 6; i < 12; i++) {
                    this.cards[i].faceUp = this.isBottomRowFaceUp;
                }
                console.log(`第二排卡片已${this.isBottomRowFaceUp ? '翻转为正面' : '翻转为背面'}`);
            }
            // 检测玩家2确认按钮点击
            else if (!this.player2Confirmed && this.isPointInButton(x, y, this.confirmButton2X, this.confirmButton2Y)) {
                this.player2Confirmed = true;
                this.isBottomRowFaceUp = false;
                for (let i = 6; i < 12; i++) {
                    this.cards[i].faceUp = false;
                }
                console.log('玩家2已确认排序');
            }

            // 检测开始结算按钮点击
            else if (this.player1Confirmed && this.player2Confirmed && this.isPointInButton(x, y, this.startSettlementButtonX, this.startSettlementButtonY)) {
                this.startSettlement();
            }
        }
        
        // 如果显示着结果弹窗，点击任意位置关闭
        if (this.showResultDialog) {
            this.showResultDialog = false;
            this.needsRedraw = true;
            return;
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 检查鼠标是否悬停在开始按钮上
        const buttonX = (this.canvas.width - this.buttonWidth) / 2;
        const buttonY = this.canvas.height * 0.6;
        
        const isHovered = x >= buttonX && x <= buttonX + this.buttonWidth &&
                         y >= buttonY && y <= buttonY + this.buttonHeight;
                         
        if (this.buttonHovered !== isHovered) {
            this.buttonHovered = isHovered;
            this.needsRedraw = true; // 状态改变时重绘
            
            // 改变鼠标样式
            this.canvas.style.cursor = isHovered ? 'pointer' : 'default';
        }
    }

    isPointInButton(x, y, buttonX, buttonY) {
        return x >= buttonX && x <= buttonX + this.gameButtonWidth &&
               y >= buttonY && y <= buttonY + this.gameButtonHeight;
    }

    handleMouseDown(event) {
        // 如果已确认，则不允许拖动
        if (this.player1Confirmed && this.player2Confirmed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 检查第一排卡片（如果未确认且正面朝上）
        if (!this.player1Confirmed && this.isTopRowFaceUp) {
            for (let i = 0; i < 6; i++) {
                const cardX = (this.canvas.width - (this.cardWidth * 6 + this.cardSpacing * 5)) / 2 
                             + i * (this.cardWidth + this.cardSpacing);
                
                if (x >= cardX && x <= cardX + this.cardWidth &&
                    y >= this.topRowY && y <= this.topRowY + this.cardHeight) {
                    this.draggedCard = this.cards[i];
                    this.dragStartIndex = i;
                    this.dragStartRow = 'top';
                    this.startDragging(this.draggedCard, x - cardX, y - this.topRowY, cardX, this.topRowY);
                    return;
                }
            }
        }
        
        // 检查第二排卡片（如果未确认且正面朝上）
        if (!this.player2Confirmed && this.isBottomRowFaceUp) {
            for (let i = 6; i < 12; i++) {
                const cardX = (this.canvas.width - (this.cardWidth * 6 + this.cardSpacing * 5)) / 2 
                             + (i - 6) * (this.cardWidth + this.cardSpacing);
                
                if (x >= cardX && x <= cardX + this.cardWidth &&
                    y >= this.bottomRowY && y <= this.bottomRowY + this.cardHeight) {
                    this.draggedCard = this.cards[i];
                    this.dragStartIndex = i;
                    this.dragStartRow = 'bottom';
                    this.startDragging(this.draggedCard, x - cardX, y - this.bottomRowY, cardX, this.bottomRowY);
                    return;
                }
            }
        }
    }

    startDragging(card, offsetX, offsetY, cardX, cardY) {
        card.isDragging = true;
        card.dragOffsetX = offsetX;
        card.dragOffsetY = offsetY;
        card.setPosition(cardX, cardY);
    }

    handleMouseMove(event) {
        if (!this.draggedCard) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.draggedCard.currentX = x - this.draggedCard.dragOffsetX;
        this.draggedCard.currentY = y - this.draggedCard.dragOffsetY;
        
        // 触发重绘
        this.needsRedraw = true;
    }

    handleMouseUp(event) {
        if (!this.draggedCard) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 确定目标行
        let targetRow = this.dragStartRow;
        const baseX = (this.canvas.width - (this.cardWidth * 6 + this.cardSpacing * 5)) / 2;
        
        // 计算目标位置
        let targetIndex;
        if (targetRow === 'top') {
            targetIndex = 0;
            for (let i = 0; i < 6; i++) {
                const cardX = baseX + i * (this.cardWidth + this.cardSpacing);
                const cardCenterX = cardX + this.cardWidth / 2;
                if (x > cardCenterX) {
                    targetIndex = i;
                }
            }
        } else { // bottom
            targetIndex = 6;
            for (let i = 6; i < 12; i++) {
                const cardX = baseX + (i - 6) * (this.cardWidth + this.cardSpacing);
                const cardCenterX = cardX + this.cardWidth / 2;
                if (x > cardCenterX) {
                    targetIndex = i;
                }
            }
        }
        
        if (targetIndex !== this.dragStartIndex) {
            // 重新排序卡片
            const card = this.cards.splice(this.dragStartIndex, 1)[0];
            this.cards.splice(targetIndex, 0, card);
        }
        
        // 重置拖动状态
        this.draggedCard.isDragging = false;
        this.draggedCard = null;
        this.dragStartIndex = -1;
        this.dragStartRow = null;
        
        // 触发重绘
        this.needsRedraw = true;
    }

    startSettlement() {
        this.showingResults = true;
        this.settlementStep = 1;
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentRevealedCards = 0;
        
        // 开始第一步结算
        this.processStep1();
    }

    processStep1() {
        console.log('第一步结算：比较第一张牌');
        
        // 翻开第一张牌
        this.cards[0].faceUp = true;
        this.cards[6].faceUp = true;
        
        // 获取点数并比较
        const firstValue1 = this.getCardValue(this.cards[0]);
        const firstValue2 = this.getCardValue(this.cards[6]);
        
        // 比较大小并计分
        if (firstValue1 > firstValue2) {
            this.player1Score++;
            console.log('玩家1获得1分');
        } else if (firstValue2 > firstValue1) {
            this.player2Score++;
            console.log('玩家2获得1分');
        }
        
        // 更新记录中的玩家名称
        this.gameRecord.step1Result = `第一步：${this.player1Name} ${this.getCardName(this.cards[0])} vs ${this.player2Name} ${this.getCardName(this.cards[6])}`;
        if (firstValue1 > firstValue2) {
            this.gameRecord.step1Result += ` - ${this.player1Name}得分`;
        } else if (firstValue2 > firstValue1) {
            this.gameRecord.step1Result += ` - ${this.player2Name}得分`;
        } else {
            this.gameRecord.step1Result += ' - 平局';
        }
        
        this.needsRedraw = true;
    }

    processStep2() {
        console.log('第二步结算：比较第二、三张牌的点数和');
        
        // 翻开第二、三张牌
        this.cards[1].faceUp = true;
        this.cards[2].faceUp = true;
        this.cards[7].faceUp = true;
        this.cards[8].faceUp = true;
        
        // 计算两张牌的点数和
        const sum1 = this.getBlackjackValue(this.cards[1]) + this.getBlackjackValue(this.cards[2]);
        const sum2 = this.getBlackjackValue(this.cards[7]) + this.getBlackjackValue(this.cards[8]);
        
        console.log(`玩家1点数和：${sum1}，玩家2点数和：${sum2}`);
        
        // 更新记录中的玩家名称
        this.gameRecord.step2Result = `第二步：${this.player1Name} ${this.getCardName(this.cards[1])},${this.getCardName(this.cards[2])} (${sum1}点) vs ` +
                                    `${this.player2Name} ${this.getCardName(this.cards[7])},${this.getCardName(this.cards[8])} (${sum2}点)`;
        if (sum1 <= 10.5 && (sum2 > 10.5 || sum1 > sum2)) {
            this.player1Score++;
            this.gameRecord.step2Result += ` - ${this.player1Name}得分`;
            console.log('玩家1获得1分');
        } else if (sum2 <= 10.5 && (sum1 > 10.5 || sum2 > sum1)) {
            this.player2Score++;
            this.gameRecord.step2Result += ` - ${this.player2Name}得分`;
            console.log('玩家2获得1分');
        } else {
            this.gameRecord.step2Result += ' - 平局';
        }
        
        this.needsRedraw = true;
    }

    processStep3() {
        console.log('第三步结算：炸金花比较');
        
        // 翻开剩余的牌
        for (let i = 3; i < 6; i++) {
            this.cards[i].faceUp = true;
            this.cards[i + 6].faceUp = true;
        }
        
        // 获取两组牌的炸金花大小
        const hand1 = this.getPokerHand(this.cards.slice(3, 6));
        const hand2 = this.getPokerHand(this.cards.slice(9, 12));
        
        // 输出调试信息
        console.log(`${this.player1Name}牌型:`, this.getHandTypeName(hand1.type.type), '点数和:', hand1.type.sum);
        console.log(`${this.player2Name}牌型:`, this.getHandTypeName(hand2.type.type), '点数和:', hand2.type.sum);
        
        // 更新记录中的玩家名称
        this.gameRecord.step3Result = `第三步：${this.player1Name} ${this.cards.slice(3, 6).map(card => this.getCardName(card)).join(',')} ` +
            `(${this.getHandTypeName(hand1.type.type)}) vs ` +
            `${this.player2Name} ${this.cards.slice(9, 12).map(card => this.getCardName(card)).join(',')} ` +
            `(${this.getHandTypeName(hand2.type.type)})`;
        
        // 比较炸金花大小并计分
        const result = this.comparePokerHands(hand1, hand2);
        if (result > 0) {
            this.player1Score++;
            this.gameRecord.step3Result += ` - ${this.player1Name}得分`;
            console.log(`${this.player1Name}获得1分`);
        } else if (result < 0) {
            this.player2Score++;
            this.gameRecord.step3Result += ` - ${this.player2Name}得分`;
            console.log(`${this.player2Name}获得1分`);
        } else {
            this.gameRecord.step3Result += ' - 平局';
            console.log('比较结果为平局');
        }
        
        // 记录最终结果
        this.gameRecord.finalResult = `最终比分 ${this.player1Name} ${this.player1Score}:${this.player2Score} ${this.player2Name} - `;
        if (this.player1Score > this.player2Score) {
            this.gameResult = 'player1';
            this.gameRecord.finalResult += `${this.player1Name}获胜`;
        } else if (this.player2Score > this.player1Score) {
            this.gameResult = 'player2';
            this.gameRecord.finalResult += `${this.player2Name}获胜`;
        } else {
            this.gameResult = 'draw';
            this.gameRecord.finalResult += '平局';
        }
        
        this.showResultDialog = true;
        this.needsRedraw = true;
        
        // 生成完整对局记录
        this.generateGameRecord();
    }

    getBlackjackValue(card) {
        if (['jack', 'queen', 'king'].includes(card.rank)) {
            return 0.5;
        } else if (card.rank === 'ace') {
            return 1;
        } else {
            return parseInt(card.rank) || 0;
        }
    }

    getPokerHandType(cards) {
        // 获取排序后的点数
        const values = cards.map(card => this.getCardValue(card));
        const sortedValues = [...values].sort((a, b) => b - a);
        
        // 检查是否是同花
        const isFlush = cards.every(card => card.suit === cards[0].suit);
        
        // 检查是否是顺子
        const isStraight = this.isStraight(sortedValues);
        
        // 检查是否是豹子（三张相同点数）
        const isTrips = sortedValues[0] === sortedValues[1] && sortedValues[1] === sortedValues[2];
        
        // 检查是否是对子
        const isPair = sortedValues[0] === sortedValues[1] || sortedValues[1] === sortedValues[2];

        // 计算点数和
        const sum = values.reduce((a, b) => a + b, 0);
        
        // 返回牌型和点数和
        if (isTrips) return { type: 6, sum: sum }; // 豹子
        if (isFlush && isStraight) return { type: 5, sum: sum }; // 同花顺
        if (isFlush) return { type: 4, sum: sum }; // 同花
        if (isStraight) return { type: 3, sum: sum }; // 顺子
        if (isPair) return { type: 2, sum: sum }; // 对子
        return { type: 1, sum: sum }; // 单张
    }

    isStraight(values) {
        // 特殊情况：A23
        if (values[0] === 14 && values[1] === 3 && values[2] === 2) {
            return true;
        }
        
        // 普通顺子
        return values.every((val, index) => {
            if (index === 0) return true;
            return val === values[index - 1] - 1;
        });
    }

    getPokerHand(cards) {
        return {
            type: this.getPokerHandType(cards),
            cards: cards
        };
    }

    comparePokerHands(hand1, hand2) {
        // 首先比较牌型
        if (hand1.type.type !== hand2.type.type) {
            return hand1.type.type > hand2.type.type ? 1 : -1;
        }
        
        // 如果牌型相同，比较点数和
        if (hand1.type.sum !== hand2.type.sum) {
            return hand1.type.sum > hand2.type.sum ? 1 : -1;
        }
        
        // 完全相同
        return 0;
    }

    getCardValue(card) {
        const rankValues = {
            'ace': 14,
            'king': 13,
            'queen': 12,
            'jack': 11,
            '10': 10,
            '9': 9,
            '8': 8,
            '7': 7,
            '6': 6,
            '5': 5,
            '4': 4,
            '3': 3,
            '2': 2
        };
        return rankValues[card.rank] || parseInt(card.rank) || 0;
    }

    renderResults() {
        this.context.textAlign = 'center';
        this.context.font = this.resultFont;
        
        // 显示当前步骤和分数
        this.context.fillStyle = "#000000";
        this.context.fillText(
            `第${this.settlementStep}步结算  ${this.player1Name}: ${this.player1Score}分  ${this.player2Name}: ${this.player2Score}分`, 
            this.canvas.width / 2, 
            80
        );
        
        // 如果是最终结果，显示胜负
        if (this.settlementStep === 3) {
            let resultText;
            let resultColor;
            
            switch (this.gameResult) {
                case 'player1':
                    resultText = `${this.player1Name}获胜！`;
                    resultColor = "#FF4444";
                    break;
                case 'player2':
                    resultText = `${this.player2Name}获胜！`;
                    resultColor = "#4444FF";
                    break;
                case 'draw':
                    resultText = "平局！";
                    resultColor = "#44AA44";
                    break;
            }
            
            this.context.fillStyle = resultColor;
            this.context.fillText(resultText, this.canvas.width / 2, 130);
        }
        
        // 显示操作提示
        if (this.settlementStep < 3) {
            this.context.font = "24px 微软雅黑";
            this.context.fillStyle = "#666666";
            this.context.fillText(
                "点击屏幕继续下一步", 
                this.canvas.width / 2, 
                this.canvas.height - 50
            );
        }
        
        // 如果需要显示弹窗，渲染弹窗
        if (this.showResultDialog) {
            this.renderResultDialog();
        }
        
        // 隐藏开始结算按钮
        this.needsRedraw = true; // 触发重绘以更新UI
    }

    renderResultDialog() {
        // 计算弹窗位置（居中）
        const dialogX = (this.canvas.width - this.dialogWidth) / 2;
        const dialogY = (this.canvas.height - this.dialogHeight) / 2;
        
        // 绘制半透明背景
        this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制弹窗背景
        this.context.fillStyle = '#FFFFFF';
        this.context.beginPath();
        this.context.roundRect(
            dialogX, 
            dialogY, 
            this.dialogWidth, 
            this.dialogHeight, 
            this.dialogBorderRadius
        );
        this.context.fill();
        
        // 绘制标题
        this.context.font = 'bold 36px 微软雅黑';
        this.context.textAlign = 'center';
        this.context.fillStyle = '#000000';
        this.context.fillText(
            '对局结果', 
            dialogX + this.dialogWidth / 2,
            dialogY + 60
        );
        
        // 绘制结果文本
        let resultText;
        let resultColor;
        switch (this.gameResult) {
            case 'player1':
                resultText = `${this.player1Name}获胜！`;
                resultColor = "#FF4444";
                break;
            case 'player2':
                resultText = `${this.player2Name}获胜！`;
                resultColor = "#4444FF";
                break;
            case 'draw':
                resultText = "平局！";
                resultColor = "#44AA44";
                break;
        }
        
        this.context.font = '32px 微软雅黑';
        this.context.fillStyle = resultColor;
        this.context.fillText(
            resultText,
            dialogX + this.dialogWidth / 2,
            dialogY + 120
        );
        
        // 绘制分数
        this.context.font = '24px 微软雅黑';
        this.context.fillStyle = '#666666';
        this.context.fillText(
            `最终比分：${this.player1Score} : ${this.player2Score}`,
            dialogX + this.dialogWidth / 2,
            dialogY + 160
        );
    }

    getHandTypeName(type) {
        switch (type) {
            case 6: return '豹子';
            case 5: return '同花顺';
            case 4: return '同花';
            case 3: return '顺子';
            case 2: return '对子';
            case 1: return '单张';
            default: return '未知';
        }
    }

    getCardName(card) {
        const suitNames = {
            'hearts': '红桃',
            'diamonds': '方块',
            'clubs': '梅花',
            'spades': '黑桃'
        };
        
        const rankNames = {
            'ace': 'A',
            'king': 'K',
            'queen': 'Q',
            'jack': 'J'
        };

        const rank = rankNames[card.rank] || card.rank;
        return `${suitNames[card.suit]}${rank}`;
    }

    generateGameRecord() {
        const record = [
            '对局记录',
            '----------------',
            `${this.player1Name}的卡牌：${this.gameRecord.player1Cards.join(', ')}`,
            `${this.player2Name}的卡牌：${this.gameRecord.player2Cards.join(', ')}`,
            '----------------',
            this.gameRecord.step1Result,
            this.gameRecord.step2Result,
            this.gameRecord.step3Result,
            '----------------',
            `最终比分 ${this.player1Name} ${this.player1Score}:${this.player2Score} ${this.player2Name}`,
            `结果：${this.gameResult === 'player1' ? this.player1Name : 
                    this.gameResult === 'player2' ? this.player2Name : '平局'}${
                    this.gameResult === 'draw' ? '' : '获胜'}`,
            '\n记录时间：' + new Date().toLocaleString()
        ].join('\n');
        
        console.log(record);
        
        // 发送记录到服务器
        fetch('http://localhost:3000/saveRecord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ record: record })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('对局记录已保存');
            } else {
                console.error('保存记录失败:', data.error);
            }
        })
        .catch(error => {
            console.error('保存记录时发生错误:', error);
        });
        
        return record;
    }
}
