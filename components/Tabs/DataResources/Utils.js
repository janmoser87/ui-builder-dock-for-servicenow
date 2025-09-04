export const removeSnPrefixes = (eventName) => {
    let eventNameAdjusted = eventName;
    eventNameAdjusted = eventNameAdjusted.replace("sn_uxf.", "");
    eventNameAdjusted = eventNameAdjusted.replace("sn_uxf_page.", "");
    eventNameAdjusted = eventNameAdjusted.replace("MACROPONENT_", "");
    eventNameAdjusted = eventNameAdjusted.replace("NOW_UXF_PAGE#", "");
    return eventNameAdjusted;
}

export const getEventName = (event) => {
    let eventName = event.sourceEventApiName || "Unknown event"
    return removeSnPrefixes(eventName)
}

export const getTargetsCount = (event) => {
    let targetsCount = 0
    if (event.targets) {
        targetsCount = event.targets?.length || 0
    }
    return targetsCount
}

export const getEventCardBackgroundColor = (event) => {

    let eventName = getEventName(event)
    let backgroundColor = "#ecf0f1"

    if (eventName == "DATA_FETCH_INITIATED" || eventName == "DATA_OP_INITIATED") {
        backgroundColor = "#fcefe4"
    }

    if (eventName == "DATA_FETCH_SUCCEEDED" || eventName == "DATA_OP_SUCCEEDED") {
        backgroundColor = "#ebfaf2"
    }

    if (eventName == "DATA_FETCH_FAILED" || eventName == "DATA_OP_FAILED") {
        backgroundColor = "#fceceb"
    }

    return backgroundColor
}

export const getTargetType = (target) => {
    let targetName = target.type || "Unknown target"

    if (targetName == "CLIENT_SCRIPT") {
        targetName = "CLIENT_SCRIPT"
    }

    if (targetName == "DATABROKER_OP") {
        targetName = "DATABROKER_OP"
    }

    if (targetName == "EVENT") {
        targetName = target.event?.apiName || "Unknown event"
    }

    targetName = removeSnPrefixes(targetName)
    return targetName
}

export const getTargetBody = (target) => {
    let targetBody = null

    if (target.type == "EVENT") {
        targetBody = target.event || null
    }

    if (target.type == "DATABROKER_OP") {
        targetBody = target.operation || null
    }

    if (target.type == "CLIENT_SCRIPT") {
        targetBody = target.clientScript || null
    }

    return targetBody
}

export const isConditionalTarget = (target) => {
    return !!target.conditional
}

export const adjustTargetType = (targetType) => {
    let targetTypeAdjusted = targetType;

    targetTypeAdjusted = targetTypeAdjusted.replace("sn_uxf.", "");
    targetTypeAdjusted = targetTypeAdjusted.replace("sn_uxf_page.", "");
    targetTypeAdjusted = targetTypeAdjusted.replace("MACROPONENT_", "");
    targetTypeAdjusted = targetTypeAdjusted.replace("NOW_UXF_PAGE#", "");

    return targetTypeAdjusted;
}

export const summarizeEventMappings = (eventMappings = []) => {
    return eventMappings.map((mapping) => {
        const sourceEvent = mapping.sourceEventApiName.replace("sn_uxf.", "") || "Unknown event"
        const targets = mapping.targets.map((target) => {

            let _targetType = "Unknown type"
            let _targetAction = "Unknown action"
            let _targetCodeToShow = null

            if (target.type == "DATABROKER_OP") {
                _targetType = target.operation?.operationName || "Data resource operation"
                _targetAction = target.operation?.parentResourceId || "Unknown resource"
            }

            if (target.type == "CLIENT_SCRIPT") {
                _targetType = "CLIENT_SCRIPT"
                _targetAction = target.clientScript?.sysId || "Unknown script ID"
            }

            if (target.type == "EVENT") {
                _targetType = target.event?.apiName || "Unknown event"

                if (target.event?.payload?.type == "CLIENT_TRANSFORM_SCRIPT") {
                    _targetAction = null
                    _targetCodeToShow = target.event.payload.script?.inlineScript || null
                }

                if (target.event?.payload?.type == "MAP_CONTAINER") {
                    _targetAction = `propName="${target.event?.payload?.container?.propName?.value || 'Unknown name'}", propValue="${target.event?.payload?.container?.value?.type || 'Unknown value'}"`
                }

                if (target.event?.payload?.type == "JSON_LITERAL") {
                    _targetAction = `propName="${target.event?.payload?.value?.propName || 'Unknown name'}", value="${target.event?.payload?.value?.value || 'Unknown value'}"`
                }

            }

            return {
                ...target,
                _targetType: adjustTargetType(_targetType),
                _targetAction,
                _targetCodeToShow
            }
        })



        return { sourceEvent, targets }
    })
}

export const getMappingsItemColor = (eventName) => {
    let backgroundColor = "#ecf0f1"

    if (eventName == "DATA_FETCH_INITIATED" || eventName == "DATA_OP_INITIATED") {
        backgroundColor = "#fcefe4"
    }

    if (eventName == "DATA_FETCH_SUCCEEDED" || eventName == "DATA_OP_SUCCEEDED") {
        backgroundColor = "#ebfaf2"
    }

    if (eventName == "DATA_FETCH_FAILED" || eventName == "DATA_OP_FAILED") {
        backgroundColor = "#fceceb"
    }

    return backgroundColor
}

export const getDataResourceByID = (macroponentData, dataResourceID) => {
    if (!macroponentData) return null
    let dataResources = []
    try {
        dataResources = JSON.parse(macroponentData.data)
    }
    catch (e) { }
    const dataResource = dataResources.find(resource => resource.elementId == dataResourceID)
    return dataResource
}

export const getClientScriptByID = (macroponentData, sysID) => {
    if (!macroponentData) return null
    const clientScript = macroponentData._scripts.find(script => script.sys_id == sysID)
    return clientScript
}
