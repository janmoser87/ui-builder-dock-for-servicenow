import { Flex, Typography, Card, Button } from "antd";
import { useState } from "react"
const { Text } = Typography;

// Utils
import { getTargetType, getTargetBody, isConditionalTarget } from "./Utils"

// Components
import Event from "./TargetTypes/Event";
import DataBroker from "./TargetTypes/DataBroker";
import ClientScript from "./TargetTypes/ClientScript";
import Code from "~components/Code";

export default function Target({ data }) {

    const [showRawData, setShowRawData] = useState(false)
    const [showCondition, setShowCondition] = useState(false)

    const targetType = getTargetType(data)
    const targetBody = getTargetBody(data)
    const isConditional = isConditionalTarget(data)

    return (
        <Card style={{ borderLeft: "1px solid rgb(124, 124, 124)", borderRight: "1px solid rgb(124, 124, 124)" }}>
            <Flex vertical gap={5}>
                <Flex justify="space-between" align="center" gap={5}>
                    <Text strong style={{ fontSize: "12px" }}>{targetType}</Text>
                    <Flex gap={5} align="center">
                        {
                            isConditional &&
                            <>
                                <Button size="small" color="orange" variant="filled" style={{ fontSize: "12px" }} onClick={() => setShowCondition(!showCondition)}>
                                    {showCondition ? "Hide" : "Show"} trigger condition
                                </Button>
                            </>
                        }
                        <Button size="small" color="default" variant="filled" style={{ fontSize: "12px" }} onClick={() => setShowRawData(!showRawData)}>
                            {showRawData ? "Hide" : "Show"} raw
                        </Button>
                    </Flex>
                </Flex>
                
                {data.type == "EVENT" && <Event data={targetBody} />}
                {data.type == "DATABROKER_OP" && <DataBroker data={targetBody} />}
                {data.type == "CLIENT_SCRIPT" && <ClientScript data={targetBody} />}
               
                {showCondition && <Code code={JSON.stringify(data.conditional, null, 2)} />}
                {showRawData && <Code code={JSON.stringify(data, null, 2)} />}
                
            </Flex>
        </Card>
    )
}