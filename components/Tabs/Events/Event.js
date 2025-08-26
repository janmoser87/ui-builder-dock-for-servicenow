import { Flex, Card, Tag, Typography } from "antd";
const { Text } = Typography;

// Utils
import { getTypeColor } from "./Utils"

export default function Event({ event }) {

    let payloadProps
    try {
        payloadProps = JSON.parse(event.props)
    }
    catch (e) {
        payloadProps = []
    }

    return (
        <Card>
            <Flex vertical gap={10}>
                <Flex gap={5} justify="space-between" items="flex-start">
                    <Flex vertical>
                        <Text strong>{event.event_name}</Text>
                        <Text>{event.label}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{event.description}</Text>
                    </Flex>
                </Flex>
                <Flex gap={6} wrap="wrap">
                    {payloadProps.map((prop, i) => (
                        <Tag color={getTypeColor(prop.type || prop.valueType)} key={i}>{prop.name}: {prop.type || prop.valueType}</Tag>
                    ))}
                </Flex>
            </Flex>
        </Card>
    )

}