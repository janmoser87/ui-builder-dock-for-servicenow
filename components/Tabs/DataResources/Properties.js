import { SettingOutlined } from "@ant-design/icons";
import { Flex, Typography, Card, Space, Collapse, Badge } from "antd";
const { Text } = Typography;

export default function Properties({ data }) {

    const properties = Object.entries(data) || []

    return (
        <Collapse
            items={[
                {
                    key: "Events",
                    label: (
                        <Flex justify="space-between">
                            <Space>
                                <SettingOutlined style={{ color: "#1890ff" }} />
                                <Text strong>Input properties</Text>
                            </Space>
                            <Flex>
                                <Badge count={properties.length} color={!!properties[0] ? "green" : "lightgrey"} showZero />
                            </Flex>
                        </Flex>
                    ),
                    showArrow: !!properties[0],
                    children: (
                        <Flex vertical gap={5}>
                            {
                                properties.map(([propName, propValue], index) => {

                                    let name = propName
                                    let value = ""

                                    if (propValue?.type == "JSON_LITERAL") {
                                        value = `"${propValue.value}"`
                                    }

                                    if (propValue?.type == "CONTEXT_BINDING") {
                                        value = `@context.${propValue.binding.category}.${propValue.binding?.address?.join(".")}`
                                    }

                                    if (propValue?.type == "DATA_OUTPUT_BINDING") {
                                        value = `@data.${propValue.binding?.address?.join(".")}`
                                    }

                                    return (
                                        <Card>
                                            <Flex justify="space-between">
                                                <Flex gap={10} align="center">
                                                    <Text strong>{name}</Text>
                                                </Flex>
                                                <Flex style={{ maxWidth: "50%" }}>
                                                    <Text code={!!value}>{value}</Text>
                                                </Flex>
                                            </Flex>
                                        </Card>
                                    )

                                })
                            }
                        </Flex>
                    )
                }
            ]}
        />
    )
}