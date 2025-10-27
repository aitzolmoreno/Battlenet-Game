import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Test from './pages/Test'

function App() {
  return (
    <div className="mainPage">

      <BrowserRouter>
        <div className='nav'>
          <Link to="/">Home</Link>
          <Link to="/test">Test</Link>
        </div>
        <Routes>
          <Route path="/"/>
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
