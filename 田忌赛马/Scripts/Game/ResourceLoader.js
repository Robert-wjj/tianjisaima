class ResourceLoader {
    constructor() {
        this.resources = {
            images: {},
            totalCount: 0,
            loadedCount: 0
        };

        // 修改基础资源的路径
        this.imageList = {
            background: 'Assets/images/UI/bg_game.png',
            startButton: 'Assets/images/UI/btn_start.png',
            competeButton: 'Assets/images/UI/btn_compete.png',
            player1Button: 'Assets/images/UI/btn_player1.png',
            player2Button: 'Assets/images/UI/btn_player2.png',
            startSettlementButton: 'Assets/images/UI/btn_start_settlement.png'
        };
    }

    updateLoadingProgress() {
        const progress = Math.floor((this.resources.loadedCount / this.resources.totalCount) * 100);
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = `加载中... ${progress}%`;
        }
    }

    loadResources() {
        return new Promise((resolve) => {
            this.resources.totalCount = Object.keys(this.imageList).length;
            console.log('开始加载资源，总数：', this.resources.totalCount);

            for (const [key, path] of Object.entries(this.imageList)) {
                const img = new Image();
                
                img.onload = () => {
                    this.resources.images[key] = img;
                    this.resources.loadedCount++;
                    this.updateLoadingProgress();
                    console.log(`加载成功: ${key} (${this.resources.loadedCount}/${this.resources.totalCount})`);
                    
                    if (this.resources.loadedCount === this.resources.totalCount) {
                        console.log('所有资源加载完成');
                        resolve(this.resources);
                    }
                };

                img.onerror = (error) => {
                    console.error(`图片加载失败: ${path}，请检查路径是否正确`);
                    this.resources.loadedCount++;
                    this.updateLoadingProgress();
                    
                    if (this.resources.loadedCount === this.resources.totalCount) {
                        resolve(this.resources);
                    }
                };

                console.log(`尝试加载图片: ${path}`);
                img.src = path;
            }
        });
    }
}