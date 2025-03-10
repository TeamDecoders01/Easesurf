import './App.css';
//import Contrast from './components/ContrastToggle';
import Mag from './components/Mag';
import ContrastMode from './components/ContrastMode';
import AutoClickControl from './components/AutoClickControl';

function App() {
    return (
        <>
            <div>
                <Mag />
            </div>

            <div>
                <ContrastMode />
            </div>

            <div>
                <AutoClickControl />
            </div>
        </>
    );
}

export default App;
