import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Account from './pages/Account'
import Products from './pages/Products'
import Statistic from './pages/Statistic'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Account' element={<Account/>}/>
        <Route path='/Products' element={<Products/>}/>
        <Route path='/Statistic' element={<Statistic/>}/>
      </Routes>
    </Router>
  )
}

export default App
