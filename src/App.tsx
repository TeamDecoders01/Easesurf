import type React from 'react';
import Scroll from './components/Scroll';
import Reader from './components/Reader';
import BlueScreenFilter from './components/BlueScreenFilter';
import ReminderServices from './components/ReminderServices';

const App: React.FC = () => {
    return (
        <div className="p-2 space-y-4">
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
    );
};

export default App;
