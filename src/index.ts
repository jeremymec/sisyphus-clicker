import { createGame } from './game';

window.onload = () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const game = createGame(canvas);
    game.start();
};