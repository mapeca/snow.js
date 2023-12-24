export class Snow {
    private enabled: boolean = false;
    private images: string[] = [];
    private snowFlakes: SnowFlake[] = [];
    private density: number;
    private updateInterval: number | undefined = undefined;
    private scrollInterval: number | undefined = undefined;
    private lastScroll: number = 0;
    private scrollDirection: number = 0;
    private containerHeight: number = 0;

    constructor(density: number = 100, autoStart: boolean = true) {
        this.density = density;
        if (autoStart) {
            this.images = ["svg/snowflake1.svg"]
            this.createSnowFlakes();
            this.start();
        }
    }

    public setup(images: string[]): void {
        if (images.length == 0) {
            console.error("snow.js: No images provided");
            return;
        }
        console.log("snow.js: Setting up snow images: " + images.join(", "));
        this.images = images;
        this.createSnowFlakes();
    }

    public start(): void {
        if (!this.enabled) {
            if (this.snowFlakes.length == 0) {
                // console.error("snow.js: No snowflakes found, did you forget to call setup()?");
                throw new Error("No snowflakes found, did you forget to call setup()?");
            }

            console.log("snow.js: Enabling snow")
            this.enabled = true;
        }

        if (this.enabled) {
            this.update();
        }

        this.setSnowContainerVisible(true);
        this.scrollInterval = setInterval(() => {
            this.updateScrollDirection();
        }, 100);
    }

    public stop(): void {
        if (this.enabled) {
            this.enabled = false;
            this.setSnowContainerVisible(false);
        }

        if (this.updateInterval) {
            clearInterval(this.scrollInterval)
            this.setSnowContainerVisible(false);
        }
    }

    public isEnabled(): boolean {
        return this.enabled;
    }
    private createSnowFlakes(): void {
        let container = this.getSnowContainer();
        if (!container) {
            console.error("snow.js: Snow container not found");
            return;
        }

        for (let i = 0; i < this.density; i++) {
            let snowFlake = new SnowFlake(
                Snow.random(10, 15),
                this.randomImage(),
                this.getRandomWidthWithinViewport(),
                this.getRandomHeightWithinViewport());

            snowFlake.appendTo(this.getSnowContainer()!);
            this.snowFlakes.push(snowFlake);
        }
    }

    public getSnowContainer(): HTMLElement | null {
        return document.getElementById("snowContainer");
    }

    public toggleSnowContainerVisibility(): void {
        let snowContainer = this.getSnowContainer();
        if (snowContainer) {
            if (snowContainer.style.visibility == "hidden") {
                snowContainer.style.visibility = "visible";
            } else {
                snowContainer.style.visibility = "hidden";
            }
        }
    }

    public setSnowContainerVisible(visible: boolean): void {
        let snowContainer = this.getSnowContainer();
        if (snowContainer) {
            if (visible) {
                snowContainer.style.visibility = "visible";
            } else {
                snowContainer.style.visibility = "hidden";
            }
        }
    }

    public setSnowContainerHeight(height: number): void {
        let snowContainer = this.getSnowContainer();
        if (snowContainer) {
            snowContainer.style.height = height + "px";
        }
    }

    public updateSnowContainerHeight(): void {
        let snowContainer = this.getSnowContainer();
        if (snowContainer) {
            let newHeight = window.innerHeight + window.scrollY;
            if (newHeight != this.containerHeight) {
                this.containerHeight = newHeight;
                snowContainer.style.height = newHeight + "px";
            }
        }
    }

    static random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    private randomImage(): string {
        return this.images[Math.floor(Math.random() * this.images.length)];
    }

    public addImage(image: string): void {
        this.images.push(image);
    }

    private update(): void {
        let snowFlakeCount = 0;
        let topWindow = window.scrollY;
        let bottomWindow = window.scrollY + window.innerHeight;

        for (let i = snowFlakeCount; i < this.snowFlakes.length; i++) {
            let snowFlake = this.snowFlakes[i];
            let { x, y } = snowFlake.getPosition();
            if (!this.isWithinViewport(x, y, topWindow, bottomWindow)) {
                this.moveSnowFlakeWithinViewport(snowFlake, topWindow, bottomWindow);
            } else {
                y += snowFlake.getDescendingSpeed();
                snowFlake.setY(y);
            }
        }

        if (this.enabled) {
            requestAnimationFrame(() => {
                this.updateSnowContainerHeight();
                this.update();
            });
        }

    }

    public updateScrollDirection(): void {
        if (this.lastScroll < window.scrollY) {
            this.lastScroll = window.scrollY;
            this.scrollDirection = 1;
            return;
        }

        if (this.lastScroll > window.scrollY) {
            this.lastScroll = window.scrollY;
            this.scrollDirection = -1;
            return;
        }

        this.lastScroll = window.scrollY;
        this.scrollDirection = 0;
    }

    public isWithinViewport(x: number, y: number, topWindow: number, bottomWindow: number, tolerance: number = 30): boolean {
        if (y > (topWindow - tolerance) && y < (bottomWindow + tolerance)) {
            return true;
        }

        return false;
    }

    public getRandomHeightWithinViewport(): number {
        let height = window.innerHeight;
        let scrollY = window.scrollY;
        return Snow.random(scrollY, scrollY + height);
    }

    public getRandomWidthWithinViewport(offset: number = 50): number {
        let res = Snow.random(offset, window.innerWidth - offset);
        return res;
    }

    public moveSnowFlakeWithinViewport(snowFlake: SnowFlake, topWindow: number, bottomWindow: number, offset: number = 25): void {
        let { x, y } = snowFlake.getPosition();
        let offsetSpawn = offset * this.scrollDirection;
        if (this.isWithinViewport(x, y, topWindow, bottomWindow)) {
            return;
        }
        if (this.scrollDirection > 0) {
            snowFlake.setY(window.scrollY + window.innerHeight + offsetSpawn);
        } else {
            snowFlake.setY(window.scrollY + offsetSpawn);
        }
    }

}

class SnowFlake {
    private radius: number;
    private image: string;
    private element: HTMLImageElement | HTMLObjectElement;
    private descendingSpeed: number = 1;
    private position = { x: 0, y: 0 };

    constructor(radius: number, image: string, x: number = 0, y: number = 0) {
        this.radius = radius;
        this.image = image;
        if (this.image.endsWith(".svg")) {
            this.element = document.createElement("object");
            this.element.data = this.image;
            // this.element.style.visibility = "hidden";

            this.element.onload = () => {
                console.log("snow.js: Loaded")
                let svgElement = (this.element as HTMLObjectElement).contentDocument!.children[0];
                svgElement.setAttribute("fill", "white");
                svgElement.setAttribute("stroke", "white");

            }
        } else {
            this.element = document.createElement("img");
            this.element.src = this.image;
        }
        this.setY(y);
        let xPercent = x / window.innerWidth * 100;
        this.setXPercent(xPercent);
        this.descendingSpeed = Snow.random(1, 3);

        // this.element.style.position = "absolute";
        this.element.style.width = this.radius + "px";
        this.element.style.height = this.radius + "px";
        // this.element.style.zIndex = "1000";
        // this.element.style.pointerEvents = "none";
        this.element.draggable = false;
        this.element.classList.add("snowFlake");

    }

    public appendTo(parent: HTMLElement): void {
        console.log("snow.js: appending to parent");
        parent.appendChild(this.element);
    }

    public setXY(x: number, y: number): void {
        this.position = { x, y };
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    }

    public setY(y: number): void {
        this.position.y = y;
        this.element.style.top = y + "px";
    }

    public setX(x: number): void {
        this.position.x = x;
        this.element.style.left = x + "px";
    }

    public setXPercent(x: number): void {
        this.position.x = x;
        this.element.style.left = x + "%";
    }

    public toggleVisibility(): void {
        if (this.element.style.visibility == "hidden") {
            this.element.style.visibility = "visible";
        } else {
            this.element.style.visibility = "hidden";
        }
    }

    public getPosition(): { x: number, y: number } {
        return this.position;
    }

    public getDescendingSpeed(): number {
        return this.descendingSpeed;
    }

    public getRadius(): number {
        return this.radius;
    }
}