import "./App.css";
import type { ReactElement } from "react";
import Popup from "./popup";

export default function App(): ReactElement {
    return (
        <div className="min-h-screen bg-gray-50 p-10 font-sans text-gray-900">
            <Popup />
        </div>
    );
}
