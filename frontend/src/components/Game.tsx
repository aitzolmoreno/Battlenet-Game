import { useState } from 'react'

import './App.css'

function App() {
const [board, setBoard] = useState(()=>{
    const loadBoard = window.localStorage.getItem("board")
    if(loadBoard)return JSON.parse(loadBoard);

    return Array(9).fill(0)
})
return (
    <>
    <main>
        <header>
            <h1>Battlenet Game</h1>
            <button>Attact</button>
            <section>
            {
                board.map(

                
                )
            }
            </section>
        </header>
        </main>
    </>
)
}