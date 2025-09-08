import { SettingOutlined, ThunderboltOutlined, BranchesOutlined, LinkOutlined } from "@ant-design/icons";
import { Flex, Typography, Card, Empty, Space, Collapse, Badge } from "antd";
const { Text } = Typography;

// Utils
import { getEventName, getTargetsCount, getEventCardBackgroundColor } from "./Utils"

// Components
import Targets from "./Targets";

const order = {
    "sn_uxf.DATA_FETCH_INITIATED": 1,
    "sn_uxf.DATA_FETCH_SUCCEEDED": 2,
    "sn_uxf.DATA_FETCH_FAILED": 3,
};

export default function Events({ data }) {

    return (
        <Collapse
            items={[
                {
                    key: "Events",
                    label: (
                        <Flex justify="space-between">
                            <Space>
                                <ThunderboltOutlined style={{ color: "orange" }} />
                                <Text strong>Events</Text>
                            </Space>
                            <Flex>
                                <Badge count={data.length} color={!!data[0] ? "green" : "lightgrey"} showZero />
                            </Flex>
                        </Flex>
                    ),
                    showArrow: !!data[0],  
                    children: (
                        <Flex vertical gap={5}>
                            {
                                data.sort((a, b) => {
                                    const keyA = a.sourceEventDefinition?.apiName;
                                    const keyB = b.sourceEventDefinition?.apiName;
                                    const rankA = order[keyA] ?? 999;
                                    const rankB = order[keyB] ?? 999;
                                    return rankA - rankB;
                                }).map((event, index) => {

                                    let eventName = getEventName(event)
                                    let targetsCount = getTargetsCount(event)
                                    let eventBackgroundColor = getEventCardBackgroundColor(event)

                                    return (
                                        <Card key={index} style={{ backgroundColor: eventBackgroundColor }}>
                                            <Flex vertical gap={5}>
                                                <Flex gap={5}>
                                                    🚀 <Text strong code>{eventName}</Text>
                                                </Flex>
                                                <Targets data={event.targets} />
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