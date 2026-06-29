import './styles/Intro.css'
import Intro from './components/Intro'
import Login from './components/Login'
import Inventory from './components/Inventory'

function App() {
  return (
    <div className="app-shell">
      <Intro />
      <div className="dashboard-grid">
        <Login />
        <Inventory />
      </div>
    </div>
  )
}

export default App