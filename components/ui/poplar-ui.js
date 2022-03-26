import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import Select from 'react-select'

export function PoplarSelect({ options }) {
    //const [value, setValue] = useState('')
    const customStyles = {
        indicatorSeparator: (provided, state) => ({
            ...provided,
            display: "none",
        }),
        control: (provided, state) => ({
            ...provided,
            border: "none",
        }),
    }

    return (<Select className="text-sm font-semibold border border-gray-200 rounded h-10 w-full 
                focus:outline-none focus:ring focus:ring-primary active:outline-none active:ring active:ring-primary"
        options={options}
        styles={customStyles}>
    </Select>);
}
export function PoplarModal({ title, show, onClose, children }) {
    const [isBrowser, setIsBrowser] = useState(false);

    const handleCloseClick = (e) => {
        e.preventDefault();
        onClose();
    };

    const modalContent = show ? (<div className="fixed top-0 z-50 w-screen h-screen flex items-center justify-center">
        <div className="bg-white z-10 p-8 rounded-xl w-96 filter drop-shadow-xl">
            <div className="flex">
                <div className="flex-grow font-semibold">{title}</div>
                <div>
                    <a href="#" onClick={handleCloseClick}>
                        x
                    </a>
                </div>
            </div>
            <div className="mt-6 space-y-6 text-sm">
                {children}
            </div>



        </div>
        <div className="absolute opacity-20 bg-black w-full h-full"></div>

    </div>
    ) : null;

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    if (isBrowser && document.getElementById("modal-root")) {
        return ReactDOM.createPortal(
            modalContent,
            document.getElementById("modal-root")
        );
    } else {
        return null;
    }
}

export function PoplarLabel({ children }) {
    return <div className="mb-1 font-medium">{children}</div>
}