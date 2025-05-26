import { useEffect, useState } from "react";
import { Tabs, Spin, Flex, Alert } from "antd";

// Components
import DataResources from "./Tabs/DataResources/DataResources";
import ClientState from "./Tabs/ClientState/ClientState";
import ClientScripts from "./Tabs/ClientScripts/ClientScripts";
import PageProperties from "./Tabs/PageProperties/PageProperties";

// Utils
import { fetchTableData, getGck, consoleLog } from "scripts/Utils";

// Context
import { useAppContext } from "../contexts/AppContext";

// Components
import PageCollectionLink from "./Tabs/PageCollectionLink";

export default function Tabs({ onChange = () => { } }) {

    const { tabData, macroponentData, setMacroponentData } = useAppContext()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const getMacroponentData = async () => {

        try {
            setLoading(true)
            let macroponent;

            // Getting g_ck to make API calls
            const g_ck = await getGck()

            // Getting sys_ux_screen so we know ID of the macroponent
            let [screenErr, screenData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_screen", g_ck, "sys_id=" + tabData.tabUrlProps.ids[2])
            if (screenErr) {
                setError(screenErr)
                return
            }
            const macroponentID = screenData[0].macroponent.value

            // Getting sys_ux_macroponent
            let [macroponentErr, macroponentData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_macroponent", g_ck, "sys_id=" + macroponentID)
            if (macroponentErr) {
                setError(macroponentErr)
                return
            }
            macroponent = macroponentData[0]

            // Getting sys_ux_client_script
            let [scriptsErr, scriptsData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_client_script", g_ck, "macroponent=" + macroponentID)
            if (scriptsErr) {
                setError(scriptsErr)
                return
            }
            macroponent._scripts = JSON.stringify(scriptsData)
            macroponent._screen_properties = screenData[0].macroponent_config

            setMacroponentData(macroponent)

        }
        catch (e) {
            setError(e.message || "An error occurred while fetching macroponent data.")
        }
        finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        getMacroponentData()
    }, [])

    if (loading) {
        return <Flex horizontal justify="center" align="center" style={{ width: "100%", padding: 50 }}><Spin /></Flex>
    }

    const items = [
        {
            key: '1',
            label: 'Data Resources',
            children: <DataResources />,
        },
        {
            key: '2',
            label: 'Client State',
            children: <ClientState />,
        },
        {
            key: '3',
            label: 'Client Scripts',
            children: <ClientScripts />,
        },
        {
            key: '4',
            label: 'Page Properties',
            children: <PageProperties />,
        },
    ]

    const getTabExtraContent = () => {
        if (tabData.isPageCollection) {
            return <PageCollectionLink sysID={macroponentData.extension_point?.value} />
        }
        return null
    }

    if (error) {
        return (
            <Flex horizontal justify="center" align="center" style={{ width: "100%", paddingTop: 20 }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ width: "100%" }}
                />
            </Flex>
        )
    }

    return (
        <Flex vertical gap={10} style={{ width: "100%" }}>
            <Tabs tabBarExtraContent={getTabExtraContent()} defaultActiveKey="1" items={items} onChange={onChange} />
        </Flex>
    )

}