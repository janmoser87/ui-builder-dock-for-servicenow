import { ShareAltOutlined } from "@ant-design/icons";
import { Flex, Typography, Space, Collapse, Badge, Card, Tag } from "antd";
const { Text } = Typography;

export default function Usage({ usageData }) {

    return (
        <Collapse
            items={[
                {
                    key: "Usage",
                    label: (
                        <Flex justify="space-between">
                            <Space>
                                <ShareAltOutlined style={{ color: "#52c41a" }} />
                                <Text strong>Used by</Text>
                            </Space>
                            <Flex>
                                <Badge count={usageData.length} color={true ? "green" : "lightgrey"} showZero />
                            </Flex>
                        </Flex>
                    ),
                    children: (
                        <Flex vertical gap={5}>
                            {
                                usageData.map((data, index) => {
                                    return (
                                        <Card key={index}>
                                            <Flex justify="space-between">
                                                <Text>{data._label}</Text>
                                                <Tag color={data._color}>{data._type}</Tag>
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