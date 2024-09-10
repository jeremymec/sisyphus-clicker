interface Game {
    start: () => void;
}

interface GameState {
    boulderX: number;
    boulderY: number;
    boulderVelocityX: number;
    boulderVelocityY: number;
    isRolling: boolean;
}

const createGame = (canvas: HTMLCanvasElement): Game => {
    const ctx = canvas.getContext('2d')!;
    const boulderRadius = 50;
    const gravity = 9.8; // Increased for more noticeable effect
    const friction = 0.3;
    const pushForce = 500;
    const flatWidth = 100; // Width of the flat area

    const state: GameState = {
        boulderX: flatWidth / 2,
        boulderY: canvas.height - boulderRadius,
        boulderVelocityX: 0,
        boulderVelocityY: 0,
        isRolling: false
    };

    const resetBoulder = () => {
        state.boulderX = flatWidth / 2;
        state.boulderY = canvas.height - boulderRadius;
        state.boulderVelocityX = 0;
        state.boulderVelocityY = 0;
    };

    const handleInput = () => {
        canvas.addEventListener('mousedown', () => state.isRolling = true);
        canvas.addEventListener('mouseup', () => state.isRolling = false);
        canvas.addEventListener('touchstart', () => state.isRolling = true);
        canvas.addEventListener('touchend', () => state.isRolling = false);
    };

    const getSlopeAngle = (x: number): number => {
        if (x <= flatWidth) return 0;
        return Math.PI / 6; // 30 degrees for now
    };

    const update = (deltaTime: number) => {
        const angle = getSlopeAngle(state.boulderX);
        
        // Calculate forces
        const gravityForce = gravity * Math.sin(angle);
        const normalForce = gravity * Math.cos(angle);
        const frictionForce = friction * normalForce;
        
        let accelerationX = 0;
    
        if (state.isRolling) {
            // Player is pushing the boulder
            const pushForceX = pushForce * Math.cos(angle);
            accelerationX = (pushForceX - frictionForce - gravityForce) / boulderRadius;
        } else {
            // No push, only gravity and friction affect the boulder
            accelerationX = -gravityForce + (state.boulderVelocityX !== 0 ? -frictionForce : 0);
        }
    
        // Update velocity
        state.boulderVelocityX += accelerationX * deltaTime;
    
        // Apply velocity threshold to prevent tiny movements
        const velocityThreshold = 0;
        if (Math.abs(state.boulderVelocityX) < velocityThreshold) {
            state.boulderVelocityX = 0;
        }
    
        // Update position
        state.boulderX += state.boulderVelocityX * deltaTime;
    
        // Calculate Y position based on X (always on the ground/slope)
        if (state.boulderX <= flatWidth) {
            state.boulderY = canvas.height - boulderRadius;
        } else {
            const slopeHeight = canvas.height - boulderRadius;
            const slopeWidth = canvas.width - flatWidth;
            state.boulderY = canvas.height - boulderRadius - (state.boulderX - flatWidth) * (slopeHeight / slopeWidth);
        }
    
        // Prevent boulder from moving left of start point
        if (state.boulderX < flatWidth / 2) {
            state.boulderX = flatWidth / 2;
            state.boulderVelocityX = 0;
        }
    
        // Reset if boulder reaches the top
        if (state.boulderX > canvas.width - boulderRadius) {
            resetBoulder();
        }
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw flat area
        ctx.fillStyle = 'green';
        ctx.fillRect(0, canvas.height - 50, flatWidth, 50);

        // Draw slope
        ctx.beginPath();
        ctx.moveTo(flatWidth, canvas.height);
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fillStyle = 'green';
        ctx.fill();

        // Draw boulder
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.arc(state.boulderX, state.boulderY, boulderRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw Sisyphus
        const sisyphusX = state.boulderX - 20;
        const sisyphusY = state.boulderY + 20;
        ctx.fillStyle = 'blue';
        ctx.fillRect(sisyphusX, sisyphusY, 20, 30);
    };

    let lastTime: number | null = null;

    const gameLoop = (timestamp: number) => {
        if (lastTime === null) {
            lastTime = timestamp;
        }
        const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
        lastTime = timestamp;

        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    };

    return {
        start: () => {
            handleInput();
            requestAnimationFrame(gameLoop);
        }
    };
};

export { createGame };
export type { Game };