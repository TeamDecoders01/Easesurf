import './App.css';
import type { ReactElement } from 'react';
import Scroll from "./components/Scroll";
import Reader from "./components/Reader";
import ChatUI from "./components/ChatUI";
import Summarize from "./components/Summarize";
import Reader from './components/Reader';
import Scroll from './components/Scroll';
import SimpleUI from './components/SimpleUI';
import Mag from './components/Mag';
import ContrastMode from './components/ContrastMode';
import AutoClickControl from './components/AutoClickControl';
        import BlueScreenFilter from './components/BlueScreenFilter';
import ReminderServices from './components/ReminderServices';

export default function App(): ReactElement {
    return (
        <div className="p-2 space-y-4">
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
                <BlueScreenFilter />
            </div>
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <ReminderServices />
            </div>
        </div>
                <ChatUI />
            </div>
            <div>
                <Summarize />
            </div>
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
