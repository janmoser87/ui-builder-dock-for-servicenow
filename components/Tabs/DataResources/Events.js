import { Flex, Typography, Card, Empty } from "antd";
const { Text } = Typography;

// Utils
import { getEventName, getTargetsCount, getEventCardBackgroundColor } from "./Utils"

// Components
import Targets from "./Targets";

export default function Events({ data }) {

    return (
        <Flex vertical gap={5}>
            {
                data.map((event, index) => {

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
            {
                !data[0] && <Empty description="No event mapping implemented." />
            }
        </Flex>
    )
}