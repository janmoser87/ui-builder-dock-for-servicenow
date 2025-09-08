import { ExportOutlined } from '@ant-design/icons';
import { Button, Flex, Tag, Typography, Collapse } from "antd";
const { Title, Text } = Typography;

// Context
import { useAppContext } from "~contexts/AppContext";

// Components
import Events from "./Events";
import Properties from './Properties';
import Usage from "./Usage"
import Code from "~components/Code";

const USAGE_COLORS = {
    "Component event": "geekblue",
    "Data resource event": "cyan",
    "Client script": "magenta",
    "Page event": "gold",
    "Repeater binding": "red",
    "Component property": "green",
}

const findUsageInElements = (compositionNode, dataResourceID) => {

    const composition = Array.isArray(compositionNode) ? compositionNode : [];
    let elements = []

    for (const element of composition) {

        // Components events
        let eventMappings = Array.isArray(element.eventMappings) ? element.eventMappings : []
        if (eventMappings.some(eventMapping => {

            let targets = Array.isArray(eventMapping.targets) ? eventMapping.targets : []
            return targets.some(target => target.operation?.parentResourceId === dataResourceID)
        }
        )) {
            elements.push({
                _type: "Component event",
                _color: USAGE_COLORS["Component event"],
                _label: element.elementLabel
            })
        }

        // Component properties
        try {
            let properties = element.propertyValues
            //Object.entries(properties).filter(([propertyName, propertyProps]) => Object.entries(propertyProps).some(([propName, propValue]) => propValue?.binding?.address?.includes(dataResourceID)))
            if (Object.entries(properties).some(([propertyName, propertyValue]) => propertyValue.binding?.address?.includes(dataResourceID))) {
                elements.push({
                    _type: "Component property",
                    _color: USAGE_COLORS["Component property"],
                    _label: element.elementLabel
                })    
            }
        }
         catch(e) {}

        // Repeaters
        if (element.definition?.type === "REPEATER") {
            if (element.repeatWith?.binding?.address?.includes(dataResourceID)) {
                elements.push({
                    _type: "Repeater binding",
                    _color: USAGE_COLORS["Repeater binding"],
                    _label: element.elementLabel
                })
            }
        }



        elements = [...elements, ...findUsageInElements(element.overrides?.composition, dataResourceID)]

    }
    return elements
}

const findUsageInOtherDataResources = (dataResources, dataResourceID) => {

    if (!Array.isArray(dataResources)) {
        return []
    }

    return dataResources.filter(dataResource => {
        if (dataResource.elementId === dataResourceID) {
            return false
        }

        let eventMappings = Array.isArray(dataResource.eventMappings) ? dataResource.eventMappings : []
        return eventMappings.some(eventMapping => {

            let targets = Array.isArray(eventMapping.targets) ? eventMapping.targets : []
            return targets.some(target => target.operation?.parentResourceId === dataResourceID)
        })
    }).map(dataResource => {
        return {
            _type: "Data resource event",
            _color: USAGE_COLORS["Data resource event"],
            _label: dataResource.elementLabel
        }
    })
}

const findUsageInClientScripts = (_scripts, dataResourceID) => {

    if (!Array.isArray(_scripts)) {
        return []
    }

    return _scripts.filter(script => script.script.includes(dataResourceID)).map(script => {
        return {
            _type: "Client script",
            _color: USAGE_COLORS["Client script"],
            _label: script.name
        }
    })
}

const findUsageInPageEvents = (internalEventMappings, dataResourceID) => {

    try {

        if (!internalEventMappings || typeof internalEventMappings !== "object") {
            return []
        }

        if (Object.keys(internalEventMappings).length === 0) {
            return []
        }

        return Object.entries(internalEventMappings)
            .filter(([pageEventName, pageEventTargets]) => {
                return pageEventTargets.some(target => target.operation?.parentResourceId === dataResourceID)
            }).map(([pageEventName, pageEventProps]) => {
                return {
                    _type: "Page event",
                    _color: USAGE_COLORS["Page event"],
                    _label: pageEventName
                }
            })

    }
    catch (e) {
        return []
    }

}

const findDataResourceUsage = (macroponentData, dataResourceID) => {

    let usingElements = []
    let usingDataResources = []
    let usingClientScripts = []
    let usingPageEvents = []

    // Elements (components that call the DR in some event handler) - we need to recursivelly search for them
    try {
        let composition = JSON.parse(macroponentData.composition)
        usingElements = findUsageInElements(composition, dataResourceID)
    } catch (e) { }

    /**
     *  Client scripts - searching for the ID anywhere in the script is sufficient 
     */
    usingClientScripts = findUsageInClientScripts(macroponentData._scripts, dataResourceID)

    /**
     * Other data resources - we need to look in targets of eventMappings  
     */
    try {
        let data = JSON.parse(macroponentData.data)
        usingDataResources = findUsageInOtherDataResources(data, dataResourceID)
    }
    catch (e) { }

    try {
        let internalEventMappings = JSON.parse(macroponentData.internal_event_mappings)
        usingPageEvents = findUsageInPageEvents(internalEventMappings, dataResourceID)
    }
    catch (e) { }

    return [...usingElements, ...usingDataResources, ...usingClientScripts, ...usingPageEvents]

}

export default function DataResource({ item, onOpenButtonClick = () => { } }) {

    const { macroponentData } = useAppContext()

    const label = item.elementLabel
    const resourceID = item.elementId
    const mode = item.readEvaluationMode
    const type = item.definition.type
    const usageData = findDataResourceUsage(macroponentData, resourceID)

    return (
        <Collapse
            style={{ backgroundColor: "white" }}
            items={[
                {
                    key: resourceID,
                    label: (
                        <Flex vertical gap={5}>
                            <Flex gap={5} justify="space-between" items="center">
                                <Title level={5} style={{ margin: 0, fontSize: 14 }}>
                                    {label}
                                </Title>
                                <Flex items="center">
                                    <Flex>
                                        <Tag color={(mode == "EAGER" ? "error" : "green")} style={{ fontSize: "10px" }} bordered={false}>{(mode == "EAGER" ? "IMMEDIATELY" : "ONLY WHEN INVOKED")}</Tag>
                                        <Tag color="purple" style={{ fontSize: "10px" }} bordered={false}>{type}</Tag>
                                    </Flex>
                                    <Button type="text" shape="circle" icon={<ExportOutlined />} size="small" onClick={(e) => {
                                        e.stopPropagation()
                                        onOpenButtonClick()
                                    }} />
                                </Flex>
                            </Flex>
                            <Flex>
                                <Text code>{resourceID}</Text>
                            </Flex>
                        </Flex>
                    ),
                    children: (
                        <Flex vertical gap={5}>
                            <Properties data={item.inputValues} />
                            <Events data={item.eventMappings} />
                            {usageData[0] && <Usage usageData={usageData} />}

                        </Flex>
                    )
                }]}
        />
    )
}
