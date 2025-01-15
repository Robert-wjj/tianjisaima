class ResourceLoader {
    constructor() {
        this.resources = {
            images: {},
            totalCount: 5,
            loadedCount: 0
        };
    }

    async loadResources() {
        console.log('开始加载资源');
        
        const imagesToLoad = {
            background: 'Assets/images/UI/bg_game.png',
            startButton: 'Assets/images/UI/btn_start.png',
            player1Button: 'Assets/images/UI/btn_player1.png',
            player2Button: 'Assets/images/UI/btn_player2.png',
            competeButton: 'Assets/images/UI/btn_compete.png'
        };

        this.resources.totalCount = Object.keys(imagesToLoad).length;
        
        try {
            const loadPromises = Object.entries(imagesToLoad).map(([key, path]) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        this.resources.images[key] = img;
                        this.resources.loadedCount++;
                        console.log(`资源加载成功: ${key} (${this.resources.loadedCount}/${this.resources.totalCount})`);
                        resolve();
                    };
                    img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
                    img.src = path;
                });
            });

            await Promise.all(loadPromises);
            console.log('所有资源加载完成');
            return this.resources;
        } catch (error) {
            console.error('资源加载失败:', error);
            throw error;
        }
    }

    loadImage(name, src) {
        const img = new Image();
        img.src = src;
        console.log(`尝试加载图片: ${src}`);
        img.onload = () => {
            this.resources.images[name] = img;
            this.loadedCount++;
            console.log(`资源加载成功: ${name} (${this.loadedCount}/${this.totalCount})`);
            if (name === 'rulesButton') {
                console.log(`规则按钮图片加载成功: ${img.src}`);
            }
            if (this.loadedCount === this.totalCount) {
                this.onAllResourcesLoaded();
            }
        };
        img.onerror = () => {
            console.error(`资源加载失败: ${name}，路径: ${src}`);
        };
    }
}