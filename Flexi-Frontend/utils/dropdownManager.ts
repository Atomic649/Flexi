type CloseCallback = () => void;

let activeCloseCallback: CloseCallback | null = null;

export const openDropdown = (closeCallback: CloseCallback) => {
    if (activeCloseCallback && activeCloseCallback !== closeCallback) {
        activeCloseCallback();
    }
    activeCloseCallback = closeCallback;
};

export const clearDropdown = (closeCallback: CloseCallback) => {
    if (activeCloseCallback === closeCallback) {
        activeCloseCallback = null;
    }
};
