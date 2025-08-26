import { useState, useEffect } from "react";
import { Flex } from "antd";

// Components
import DataResource from "./DataResource";
import DataResourceBuilder from "./DataResourceBuilder";
import NoData from "./../../NoData"

// Context
import { useAppContext } from "../../../contexts/AppContext";

export default function DataResources() {

    const {tabData, macroponentData} = useAppContext()

    const [data, setData] = useState([])
    const [showList, setShowList] = useState(false)
    const [expandedMode, setExpandedMode] = useState(false)

    useEffect(() => {
        try {
            const data = JSON.parse(macroponentData.data)
            setData(data)
        }
        catch (e) {
            setData([])
        }
    }, [])

    if (!data[0]) {
        return <NoData sectionName="data resources" />
    }

    return (
        <Flex vertical gap={10} style={{ height: "400px", overflowY: "auto" }}>
            <DataResourceBuilder tabData={tabData} onCreatingModeChange={(creatingMode) => {
                setShowList(!creatingMode)
            }}/>
            {
                showList && data.map((item, index) => {
                    return (
                        <DataResource expandedMode={expandedMode} key={index} item={item} onOpenButtonClick={() => {
                            chrome.tabs.create({ url: `https://${tabData.tabUrlBase}/sys_ux_data_broker.do?sys_id=${item.definition.id}`, index: tabData.tab.index + 1 })
                        }} />
                    )
                })
            }
        </Flex>
    );
}