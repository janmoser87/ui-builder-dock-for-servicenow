import { Flex, Typography, Button } from "antd";
import { useState } from "react"
const { Text } = Typography;

// Components
import Code from "../../../Code"

export default function Event({ data }) {

    const [showClientScript, setShowClientScript] = useState(false)

    if (!data) return null

    if (data.payload?.type == "CLIENT_TRANSFORM_SCRIPT") {
        if (data.payload?.script?.inlineScript) {
            return (
                <Flex vertical>
                    <Button onClick={() => setShowClientScript(!showClientScript)} size="small" style={{ fontSize: "12px" }} color="default" variant="filled">
                        {showClientScript ? "Hide" : "Show"} scripted value
                    </Button>
                    {showClientScript && <Code code={data.payload.script.inlineScript} />}
                </Flex>
            )
        }
    }

    if (data.payload?.type == "JSON_LITERAL") {
        if (data.payload?.value?.propName) {
            return (
                <Flex align="center" gap={5}>
                    <Text code style={{fontSize: "12px"}}>{data.payload.value.propName}</Text>
                    <Text> = </Text>
                    <Text code style={{fontSize: "12px"}}>{data.payload.value.value}</Text>
                </Flex>
            )
        }
    }

    if (data.payload?.type == "MAP_CONTAINER") {
        if (data.payload?.container?.propName) {
            if (data.payload.container.propName?.type == "JSON_LITERAL" && (data.payload.container.value?.type == "EVENT_PAYLOAD_BINDING" || data.payload.container.value?.type == "DATA_OUTPUT_BINDING")) {
                return (
                    <Flex align="center" gap={5}>
                        <Text code style={{fontSize: "12px"}}>{data.payload.container.propName.value}</Text>
                        <Text> = </Text>
                        <Text code style={{fontSize: "12px"}}>@{data.payload.container.value.binding.address.join(".")}</Text>
                    </Flex>
                )                    
            }
        }
    }


    return
}