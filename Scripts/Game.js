let player1Name;
let player2Name;
let player1Score = 0;
let player2Score = 0;

const uiManager = new UIManager();
// 仅在开发环境启用调试输出
uiManager.setDebug(process.env.NODE_ENV === 'development');

class Game {
    constructor() {
        // ... existing code ...
        
        // 添加事件监听器来初始化音频
        document.addEventListener('click', () => {
            this.uiManager.initAudioContext();
        }, { once: true }); // 只执行一次

        this.audioContext = null;

        // 添加新的按钮元素
        const startSettlementButton = document.createElement('button');
        startSettlementButton.innerText = '开始结算';
        document.body.appendChild(startSettlementButton);
        startSettlementButton.style.display = 'none'; // 初始隐藏

        // 添加规则按钮元素
        this.rulesButton = document.createElement('button');
        this.rulesButton.innerText = '规则';
        document.body.appendChild(this.rulesButton);
        this.rulesButton.style.display = 'none'; // 初始隐藏
    }
    
    update() {
        // 确保更新逻辑不会导致无限循环
        if (this.isRunning) {
            // ... 更新逻辑 ...
        }
    }

    initAudioContext() {
        return new Promise((resolve, reject) => {
            try {
                // 延迟创建 AudioContext，直到确实需要时
                if (!this.audioContext) {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    this.audioContext = new AudioContextClass();
                }
                
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        console.log('音频上下文已恢复');
                        resolve(this.audioContext);
                    });
                } else {
                    resolve(this.audioContext);
                }
            } catch (error) {
                console.warn('初始化音频上下文失败:', error);
                reject(error);
            }
        });
    }

    // 在需要播放声音时调用此方法
    async playSound() {
        try {
            await this.initAudioContext();
            // 播放声音的逻辑...
        } catch (error) {
            console.warn('播放声音失败:', error);
        }
    }

    // 修改 handleClick 方法
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 检查开始按钮点击
        if (this.isPointInButton(x, y, this.startButtonX, this.startButtonY)) {
            this.startButtonClicked = true; // 标记开始按钮已点击
            console.log('startButton 被点击'); // 添加日志
            this.render(); // 重新渲染以显示规则按钮
        }

        // 检查玩家1确认按钮点击
        if (!this.player1Confirmed && this.isPointInButton(x, y, this.confirmButton1X, this.confirmButton1Y)) {
            this.player1Confirmed = true;
            this.isTopRowFaceUp = false;
            for (let i = 0; i < 6; i++) {
                this.cards[i].faceUp = false;
            }
            console.log('玩家1已确认排序');
            this.checkStartSettlement(); // 检查是否可以开始结算
        }
        // 检查玩家2确认按钮点击
        else if (!this.player2Confirmed && this.isPointInButton(x, y, this.confirmButton2X, this.confirmButton2Y)) {
            this.player2Confirmed = true;
            this.isBottomRowFaceUp = false;
            for (let i = 6; i < 12; i++) {
                this.cards[i].faceUp = false;
            }
            console.log('玩家2已确认排序');
            this.checkStartSettlement(); // 检查是否可以开始结算
        }

        // 在玩家2确认之前，确保开始结算按钮隐藏
        if (!this.player2Confirmed) {
            startSettlementButton.style.display = 'none'; // 隐藏开始结算按钮
        }

        // ... existing code ...
    }

    // 检查是否可以开始结算
    checkStartSettlement() {
        if (this.player1Confirmed && this.player2Confirmed) {
            startSettlementButton.style.display = 'block'; // 显示开始结算按钮
            console.log('startSettlementButton 显示'); // 添加日志
        } else {
            startSettlementButton.style.display = 'none'; // 隐藏开始结算按钮
        }
    }

    // 绑定开始结算按钮的点击事件
    startSettlementButton.addEventListener('click', () => {
        if (this.settlementStep === 0) {
            this.startSettlement(); // 开始结算
        } else if (this.settlementStep === 1) {
            this.processStep2(); // 处理第二步
        } else if (this.settlementStep === 2) {
            this.processStep3(); // 处理第三步
        }
    });

    // 修改 renderResults 方法
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

        // ... existing code ...
    }

    // 修改音频初始化
    initAudio() {
        // 等待用户交互后再初始化音频上下文
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
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
            console.log('startButton 已渲染'); // 添加日志
        } else if (this.gameState === 'PLAYING') {
            this.renderGame();
            
            // 仅在玩家2确认后渲染开始结算按钮
            if (this.player1Confirmed && this.player2Confirmed) {
                this.renderButton(
                    this.resources.images.startSettlementButton, // 使用开始结算按钮的图像
                    this.startSettlementButtonX,
                    this.startSettlementButtonY,
                    this.gameButtonWidth,
                    this.gameButtonHeight
                );
                console.log('startSettlementButton 已渲染'); // 添加日志
            }
        }

        // 仅在不显示结果弹窗时绘制规则按钮
        if (!this.showResultDialog) {
            // 规则按钮在点击startButton后显示
            if (this.startButtonClicked) {
                this.rulesButton.style.display = 'block'; // 显示规则按钮
                console.log('rulesButton 已渲染'); // 添加日志
            }
        }
    }

    processStep1() {
        console.log('第一步结算：比较第一张牌');
        
        // 翻开第一张牌
        this.cards[0].faceUp = true;
        this.cards[6].faceUp = true;
        
        // 获取点数并比较
        const firstValue1 = this.getCardValue(this.cards[0]);
        const firstValue2 = this.getCardValue(this.cards[6]);
        
        // 修改比较逻辑
        const rankOrder = {
            'ace': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            '10': 10,
            'jack': 11,
            'queen': 12,
            'king': 13 // A的值设为1
        };

        const value1 = rankOrder[this.cards[0].rank] || 0;
        const value2 = rankOrder[this.cards[6].rank] || 0;

        // 比较大小并计分
        if (value1 > value2) {
            this.player1Score++;
            console.log('玩家1获得1分');
        } else if (value2 > value1) {
            this.player2Score++;
            console.log('玩家2获得1分');
        }
        
        // 更新记录中的玩家名称
        this.gameRecord.step1Result = `第一步：${this.player1Name} ${this.getCardName(this.cards[0])} vs ${this.player2Name} ${this.getCardName(this.cards[6])}`;
        if (value1 > value2) {
            this.gameRecord.step1Result += ` - ${this.player1Name}得分`;
        } else if (value2 > value1) {
            this.gameRecord.step1Result += ` - ${this.player2Name}得分`;
        } else {
            this.gameRecord.step1Result += ' - 平局';
        }
        
        this.needsRedraw = true;
    }
}

function initializeGame() {
    // ... existing code ...
    getPlayerNames();
    player1Cards = dealCards();
    player2Cards = dealCards();
    renderCards(player1Cards, 'player1'); // 渲染玩家1的卡牌
    renderCards(player2Cards, 'player2'); // 渲染玩家2的卡牌
    updateScoreboard();
    // ... existing code ...
}

function updateScoreboard() {
    document.getElementById('player1-name').innerText = player1Name + ": " + player1Score;
    document.getElementById('player2-name').innerText = player2Name + ": " + player2Score;
}

function getPlayerNames() {
    // ... existing code ...
    let player1Cards = dealCards();
    let player2Cards = dealCards();
    // ... existing code ...
}

// 编辑内容
let player1Name = prompt("请输入玩家1的姓名:");
let player2Name = prompt("请输入玩家2的姓名:");

let player1Cards = dealCards();
let player2Cards = dealCards();

function restartGame() {
    player1Score = 0;
    player2Score = 0;
    updateScoreboard();
    initializeGame();
}

document.getElementById('start-button').addEventListener('click', function() {
    // 创建或恢复音频上下文
    audioContext.resume().then(() => {
        console.log('Audio context resumed');
    });
});
