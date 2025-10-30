import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Test from './pages/Test'
import Game from './pages/Game'

function App() {
  return (
    <div className="mainPage">

      <BrowserRouter>
        <div className='nav'>
          <Link to="/">Home</Link>
          <Link to="/test">Test</Link>
          <Link to="/game">Game</Link>
        </div>
        <Routes>
          <Route path="/"/>
          <Route path="/test" element={<Test />} />
          <Route path="/game" element={<Game />} />

        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
