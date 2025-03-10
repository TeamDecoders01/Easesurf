import type React from "react";
import Scroll from "./components/Scroll";
import Reader from "./components/Reader";
import ChatUI from "./components/ChatUI";
import Summarize from "./components/Summarize";
const App: React.FC = () => {
    return (
        <>
            <div>
                <Scroll />
            </div>
            <div>
                <Reader />
            </div>
            <div>
                <ChatUI />
            </div>
            <div>
                <Summarize />
            </div>
        </>
    );
};

export default App;
