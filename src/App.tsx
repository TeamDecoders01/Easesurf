import type { ReactElement } from 'react';
import Scroll from "./components/Scroll";
import Reader from "./components/Reader";
import ChatUI from "./components/ChatUI";
import Summarize from "./components/Summarize";
import Reader from './components/Reader';
import Scroll from './components/Scroll';
import SimpleUI from './components/SimpleUI';

export default function App(): ReactElement {
    return (
        <>
            <div>
                <SimpleUI />
            </div>
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
}
