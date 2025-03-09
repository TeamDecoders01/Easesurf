import type React from "react";
import Scroll from "./components/Scroll";
import Reader from "./components/Reader";

const App: React.FC = () => {
    return (
        <>
            <div>
                <Scroll />
            </div>
            <div>
                <Reader />
            </div>
        </>
    );
};

export default App;
