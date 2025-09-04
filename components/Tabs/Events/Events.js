import { Flex, Typography, Collapse, Badge } from "antd";
const { Text } = Typography;

// Context
import { useAppContext } from "~contexts/AppContext";

// Components
import Event from "./Event";

export default function Events() {

    const { macroponentData } = useAppContext()

    const dispatchedEvents = macroponentData._dispatchedEvents || []
    const handledEvents = macroponentData._handledEvents || []

    return (
        <Flex vertical gap={5}>
            <Collapse
                style={{backgroundColor: "white"}}
                items={[
                    {
                        key: "dispatchedEvents",
                        label: (
                            <Flex justify="space-between">
                                <Text strong>Dispatched events</Text>
                                <Badge count={dispatchedEvents.length} color={!!dispatchedEvents[0] ? "green" : "lightgrey"} showZero />
                            </Flex>
                        ),
                        showArrow: !!dispatchedEvents[0],   
                        children: dispatchedEvents.map((event, index) => <Event event={event} key={index} />)
                    }
                ]}
            />
            <Collapse
                style={{backgroundColor: "white"}}
                items={[
                    {
                        key: "handledEvents",
                        label: (
                            <Flex justify="space-between">
                                <Text strong>Handled events</Text>
                                <Badge count={handledEvents.length} color={!!handledEvents[0] ? "green" : "lightgrey"} showZero/>
                            </Flex>
                        ),
                        showArrow: !!handledEvents[0], 
                        children: handledEvents.map((event, index) => <Event event={event} key={index} />)
                    }
                ]}
            />
        </Flex>
    )

}