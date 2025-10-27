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

    </>
  )
}

export default App
