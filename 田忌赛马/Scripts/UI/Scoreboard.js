function flipCard(card) {
    let cardImage = document.getElementById(card);
    if (cardImage.src.includes("card_back.png")) {
        cardImage.src = `F:/文档/协作日记/田忌赛马/Assets/images/Cards/${card}.png`;
    } else {
        cardImage.src = "F:/文档/协作日记/田忌赛马/Assets/images/Cards/card_back.png";
    }
}

class Scoreboard {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;          // 总得分
        this.roundNumber = 0;    // 当前轮数
        this.roundScores = [];   // 每轮得分记录
        this.currentRoundScore = {  // 当前轮的详细得分
            firstStep: 0,        // 第一步得分
            secondStep: 0,       // 第二步得分
            thirdStep: 0         // 第三步得分
        };
    }

    // 开始新一轮
    startNewRound() {
        this.roundNumber++;
        this.currentRoundScore = {
            firstStep: 0,
            secondStep: 0,
            thirdStep: 0
        };
    }

    // 记录第一步得分
    recordFirstStep(result) {
        if (result.winner === 1) {
            this.currentRoundScore.firstStep = 1;
            this.score += 1;
            console.log(`${player1Name} 在第一步得分`);
        }
    }

    // 记录第二步得分
    recordSecondStep(result) {
        if (result.winner === 1) {
            this.currentRoundScore.secondStep = 1;
            this.score += 1;
            console.log(`${player1Name} 在第二步得分`);
        }
    }

    // 记录第三步得分
    recordThirdStep(result) {
        if (result.winner === 1) {
            this.currentRoundScore.thirdStep = 1;
            this.score += 1;
            console.log(`${player1Name} 在第三步得分`);
        }
    }

    // 完成当前轮次
    completeRound() {
        const roundTotal = 
            this.currentRoundScore.firstStep + 
            this.currentRoundScore.secondStep + 
            this.currentRoundScore.thirdStep;

        this.roundScores.push({
            roundNumber: this.roundNumber,
            details: {...this.currentRoundScore},
            total: roundTotal
        });
    }

    // 获取记分板状态
    getState() {
        return {
            totalScore: this.score,
            currentRound: this.roundNumber,
            currentRoundScore: this.currentRoundScore,
            roundHistory: this.roundScores
        };
    }

    // 渲染记分板
    render(ctx) {
        // 设置文本样式
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        
        // 绘制总分
        ctx.fillText(`总分: ${this.score}`, 20, 30);
        
        // 绘制当前轮数
        ctx.fillText(`第 ${this.roundNumber} 轮`, 20, 60);
        
        // 绘制当前轮得分详情
        if (this.roundNumber > 0) {
            ctx.font = '20px Arial';
            ctx.fillText('本轮得分:', 20, 90);
            ctx.fillText(`第一步: ${this.currentRoundScore.firstStep}`, 40, 120);
            ctx.fillText(`第二步: ${this.currentRoundScore.secondStep}`, 40, 150);
            ctx.fillText(`第三步: ${this.currentRoundScore.thirdStep}`, 40, 180);
        }

        // 绘制历史记录
        this.renderHistory(ctx);
    }

    // 渲染历史记录
    renderHistory(ctx) {
        const startY = 220;
        const lineHeight = 25;

        ctx.font = '18px Arial';
        ctx.fillText('历史记录:', 20, startY);

        // 显示最近的5轮记录
        const recentRounds = this.roundScores.slice(-5);
        recentRounds.forEach((round, index) => {
            const y = startY + (index + 1) * lineHeight;
            ctx.fillText(
                `第${round.roundNumber}轮: ${round.total}分 (${round.details.firstStep}+${round.details.secondStep}+${round.details.thirdStep})`,
                40,
                y
            );
        });
    }
}
