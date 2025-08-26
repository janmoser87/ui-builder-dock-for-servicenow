import { useState, useEffect } from "react";
import { Flex, Typography, Divider } from "antd";
const { Title } = Typography;

// Context
import { useAppContext } from "../../../contexts/AppContext";

// Components
import NoData from "./../../NoData"
import Event from "./Event";

export default function Events() {

    const { macroponentData } = useAppContext()
    const [dispatchedEvents, setDispatchedEvents] = useState([])
    const [handledEvents, setHandledEvents] = useState([])

    useEffect(() => {
        try {

            if (macroponentData._dispatchedEvents) {
                const dispatchedEvents = JSON.parse(macroponentData._dispatchedEvents)
                setDispatchedEvents(dispatchedEvents)
            }

            if (macroponentData._handledEvents) {
                const handledEvents = JSON.parse(macroponentData._handledEvents)
                setHandledEvents(handledEvents)
            }

        }
        catch (e) {
            setDispatchedEvents([])
            setHandledEvents([])
        }
    }, [])

    return (
        <Flex vertical gap={10} style={{ height: "400px", overflowY: "auto" }}>
            <Flex vertical gap={10}>
                <Title level={5} style={{ margin: 0 }} >Dispatched events</Title>
                <Divider style={{ margin: 0 }} />
                <Flex vertical gap={5}>
                    {
                        dispatchedEvents.map((event, index) => <Event event={event} key={index} />)
                    }
                    {
                        !dispatchedEvents[0] && <NoData sectionName="dispatched events" />
                    }
                </Flex>
            </Flex>
            <Flex vertical gap={10}>
                <Title level={5} style={{ margin: 0 }} >Handled events</Title >
                <Divider style={{ margin: 0 }} />
                <Flex vertical gap={5}>
                    {
                        handledEvents.map((event, index) => <Event event={event} key={index} />)
                    }
                    {
                        !handledEvents[0] && <NoData sectionName="handled events" />
                    }
                </Flex>
            </Flex>
        </Flex>
    );

}