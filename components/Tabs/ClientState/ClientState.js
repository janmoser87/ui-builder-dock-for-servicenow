import { Flex, Card, Tag, Typography } from "antd";
const { Text } = Typography;

// Utils
import { getTypeColor } from "./Utils"

// Context
import { useAppContext } from "~contexts/AppContext";

// Components
import NoData from "~components/NoData"

export default function ClientState() {

    const { macroponentData } = useAppContext()


    let clientStates = []
    try {
        clientStates = JSON.parse(macroponentData.state_properties)
    }
     catch(e) {}

    if (!clientStates[0]) {
        return <NoData sectionName="client states" />
    }

    return (
        <Flex vertical gap={5} style={{ height: "400px", overflowY: "auto" }}>
            {
                clientStates.map((clientState, index) => {

                    let name = clientState.name
                    let type = clientState.valueType
                    let initialValue = clientState.initialValue === null ? "null" : clientState.initialValue?.type

                    if (clientState.initialValue?.type == "JSON_LITERAL") {
                        try {
                            initialValue = JSON.stringify(clientState.initialValue.value)
                        }
                         catch(e) {}
                    }

                    if (clientState.initialValue?.type == "CONTEXT_BINDING") {
                        if (clientState.initialValue?.binding?.category == "props") {
                            initialValue = `@context.props.${clientState.initialValue.binding.address.join(".")}`  
                        }
                    }

                    return (
                        <Card key={index}>
                            <Flex gap={5} justify="space-between" items="flex-start">
                                <Flex gap={10} align="center">
                                    <Text strong>{name}</Text>
                                    <Tag color={getTypeColor(type)}>{type}</Tag>
                                </Flex>
                                <Flex style={{ maxWidth: "50%" }}>
                                    <Text code>{initialValue}</Text>
                                </Flex>
                            </Flex>
                        </Card>
                    )
                })
            }
        </Flex>
    );

}