import type React from "react";
import SimpleUI from "./components/SimpleUI";
import ChatUI from "./components/ChatUI";
import Summarize from "./components/Summarize";
import Reader from "./components/Reader";
import Scroll from "./components/Scroll";
import Mag from "./components/Mag";
import ContrastMode from "./components/ContrastMode";
import AutoClickControl from "./components/AutoClickControl";
import BlueScreenFilter from "./components/BlueScreenFilter";
import ReminderServices from "./components/ReminderServices";

const Popup: React.FC = () => {
    return (
        <div className="popup-container">
            <SimpleUI />
            <Scroll />
            <BlueScreenFilter />
            <ReminderServices />
            <Mag />
            <ContrastMode />
            <AutoClickControl />
            <Summarize />
            <ChatUI />
        </div>
    );
};

export default Popup;
