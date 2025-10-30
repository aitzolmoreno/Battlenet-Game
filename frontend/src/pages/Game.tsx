import { useState } from "react";
import Board from "../components/Board";
import '../index.css'

export type Player = "A" | "B";

export function Game() {
    const [boardA, setBoardA] = useState<(string | null)[]>(() => {
    const loadBoard = window.localStorage.getItem("boardA");
    return loadBoard ? JSON.parse(loadBoard) : Array(100).fill(null); // tablero 10x10
    });

    const [boardB, setBoardB] = useState<(string | null)[]>(() => {
    const loadBoard = window.localStorage.getItem("boardB");
    return loadBoard ? JSON.parse(loadBoard) : Array(100).fill(null);
    });

    const [turn, setTurn] = useState<Player>("A");

    function updateBoard(index: number, player: Player, action: string) {
        if (player !== turn) return; 

        if (action === "attack") {
            const targetBoard = player === "A" ? [...boardB] : [...boardA];
        targetBoard[index] = "Attck"; //en este caso hemos puesto que haga ataque, pero deberiamos de poner mas cosas
            player === "A" ? setBoardB(targetBoard) : setBoardA(targetBoard);
        }

        setTurn(turn === "A" ? "B" : "A");
    }

    return (
        <main>
            <header>
            <h1>Hundir la Flota</h1>
            </header>

            <section className="game">
            <Board player="A" board={boardA} updateBoard={updateBoard} />
            <Board player="B" board={boardB} updateBoard={updateBoard} />
            </section>
        </main>
    );
}

export default Game;
