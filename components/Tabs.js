import { useEffect, useState } from "react";
import { Tabs, Spin, Flex, Alert } from "antd";

// Components
import DataResources from "./Tabs/DataResources/DataResources";
import ClientState from "./Tabs/ClientState/ClientState";
import ClientScripts from "./Tabs/ClientScripts/ClientScripts";
import PageProperties from "./Tabs/PageProperties/PageProperties";
import Events from "./Tabs/Events/Events";

// Utils
import { fetchTableData, getGck } from "scripts/Utils";

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
            let macroponent, macroponentID;

            // Getting type of current UIB page
            const { tabUrlProps: { type: pageType } } = tabData

            // Getting g_ck to make API calls
            const g_ck = await getGck()

            // Table and ID where to get the macroponent ID from
            let parentTable, parentSysID

            if (pageType == "experience" || pageType == "pc") {
                // Experience and Page Colelction have macroponentID on sys_ux_screen record
                parentTable = "sys_ux_screen"
                parentSysID = tabData.tabUrlProps.ids[2]
            }

            if (pageType == "component") {
                // Component has it on sys_cb_metadata record
                parentTable = "sys_cb_metadata"
                parentSysID = tabData.tabUrlProps.ids[0]
            }

            /**
             * Macroponent parent record
             */
            let [parentErr, parentData] = await fetchTableData(tabData.tabUrlBase, parentTable, g_ck, "sys_id=" + parentSysID)
            if (parentErr) {
                setError(parentErr)
                return
            }
            macroponentID = parentData[0].macroponent.value

            if (!macroponentID) {
                setError("Unable to get macroponent data.")
                return
            }

            /**
             * Macroponent
             */
            let [macroponentErr, macroponentData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_macroponent", g_ck, "sys_id=" + macroponentID)
            if (macroponentErr) {
                setError(macroponentErr)
                return
            }
            macroponent = macroponentData[0]

            /**
             * UX Client scripts
             */
            let [scriptsErr, scriptsData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_client_script", g_ck, "macroponent=" + macroponentID)
            if (scriptsErr) {
                setError(scriptsErr)
                return
            }
            macroponent._scripts = JSON.stringify(scriptsData)

            /**
             * Excluded scopes for Events. 
             * Explanation: There are some Events that are generic and belong to system. For example "Open or close modal dialog" or "Open page or URL". Point
             * of the extension is to show user-defined data. It impossible to exclude everything but there are some most obvious events that we know that belong to core
             * system apps and are not user-defined.
             */
            let excludedScopes = [
                "7be88b365b3801be77a72fb359d185cb", // sn-canvas-core
                "5eff1dd0c1153209fa3a662cd38a2479", // @servicenow/sn-component-builder
                "56b33d33664260cd494440286cda2fea", // UI Builder
                "6d940d54d63c3f847df337e8f4e0d712", // @servicenow/now-record-form-connected
                "3036b72d5be1fac2c3029c078fbc499a", // @servicenow/now-uxf-page
            ];
            let exclusionQuery = excludedScopes.map(scope => `sys_scope!=${scope}`).join("^");

            /**
             * Dispatched events
             */
            if (macroponent.dispatched_events.length > 0) {
                let [dispatchedEventsErr, dispatchedEventsData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_event", g_ck, `sysparm_query=sys_idIN${macroponent.dispatched_events}^${exclusionQuery}`)
                if (dispatchedEventsErr) {
                    setError(dispatchedEventsErr)
                    return
                }
                macroponent._dispatchedEvents = JSON.stringify(dispatchedEventsData)
            }

            /**
             * Handled events
             */
            if (macroponent.handled_events.length > 0) {
                let [handledEventsErr, handledEventsData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_event", g_ck, `sysparm_query=sys_idIN${macroponent.handled_events}^${exclusionQuery}`)
                if (handledEventsErr) {
                    setError(handledEventsErr)
                    return
                }
                macroponent._handledEvents = JSON.stringify(handledEventsData)
            }
            
            /**
             * Values of properties of Experience and Page Collections are on parent (sys_ux_screen.macroponent_config)
             */
            if (pageType == "experience" || pageType == "pc") {
                macroponent._parent_screen_macroponent_config = parentData[0].macroponent_config    
            } 

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
            label: 'State',
            children: <ClientState />,
        },
        {
            key: '3',
            label: 'Client Scripts',
            children: <ClientScripts />,
        },
        {
            key: '4',
            label: 'Properties',
            children: <PageProperties />,
        },
        {
            key: '5',
            label: 'Events',
            children: <Events />,
        },
    ]

    const getTabExtraContent = () => {
        if (tabData.tabUrlProps.type == "pc") {
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