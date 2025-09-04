import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}

export const AppContextProvider = ({ children }) => {
    const [macroponentData, setMacroponentData] = useState(null)
    const [tabData, setTabData] = useState(null)
    const [loadedArticles, setLoadedArticles] = useState(null)

    const contextValue = {
        macroponentData,
        setMacroponentData,
        tabData,
        setTabData,
        loadedArticles,
        setLoadedArticles
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};