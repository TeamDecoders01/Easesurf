import type { ReactElement } from 'react';
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
        </>
    );
}
