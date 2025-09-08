import { useState } from "react";
import { Flex } from "antd";

// Components
import DataResource from "./DataResource";
import DataResourceBuilder from "./DataResourceBuilder";
import NoData from "~components/NoData"

// Context
import { useAppContext } from "~/contexts/AppContext";

export default function DataResources() {

    const { tabData, macroponentData } = useAppContext()
    const [showList, setShowList] = useState(true)

    let data = []
    try {
        data = JSON.parse(macroponentData.data)
    }
    catch (e) { }

    return (
        <Flex vertical gap={5} style={{ height: "400px", overflowY: "auto" }}>
            <DataResourceBuilder tabData={tabData} onCreatingModeChange={(creatingMode) => {
                setShowList(!creatingMode)
            }} />
            {
                (() => {

                    if (!data[0]) {
                        return <NoData sectionName="data resources" />
                    }

                    if (showList) {
                        return data.map((item, index) => {
                            return (
                                <DataResource key={index} item={item} onOpenButtonClick={() => {
                                    chrome.tabs.create({ url: `https://${tabData.tabUrlBase}/sys_ux_data_broker.do?sys_id=${item.definition.id}`, index: tabData.tab.index + 1, active: false })
                                }} />
                            )
                        })
                    }
                })()               
            }
        </Flex>
    );
}