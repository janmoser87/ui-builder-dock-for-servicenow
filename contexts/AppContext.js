import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}

export const AppContextProvider = ({ children }) => {
    const [macroponentData, setMacroponentData] = useState(null);
    const [tabData, setTabData] = useState(null);

    useEffect(() => {
        
    }, []);

    const getClientScriptByID = (sysID) => {
        if (!macroponentData) return null
        const clientScripts = JSON.parse(macroponentData._scripts)
        const clientScript = clientScripts.find(script => script.sys_id == sysID)
        return clientScript
    }

    const getDataResourceByID = (dataResourceID) => {
        if (!macroponentData) return null
        const dataResources = JSON.parse(macroponentData.data)
        const dataResource = dataResources.find(resource => resource.elementId == dataResourceID)
        return dataResource
    }

    const contextValue = {
        macroponentData,
        setMacroponentData,
        tabData,
        setTabData,
        getClientScriptByID,
        getDataResourceByID
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};