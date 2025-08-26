import { useState, useEffect } from "react";
import { Flex, Card, Tag, Typography } from "antd";
const { Text } = Typography;

// Utils
import { getTypeColor } from "./Utils"

// Context
import { useAppContext } from "../../../contexts/AppContext";

// Components
import NoData from "./../../NoData"

export default function ClientState() {

    const { tabData, macroponentData } = useAppContext()
    const [data, setData] = useState([])

    useEffect(() => {
        try {
            const data = JSON.parse(macroponentData.state_properties)
            setData(data)
        }
        catch (e) {
            setData([])
        }
    }, [])

    if (!data[0]) {
        return <NoData sectionName="client states" />
    }

    return (
        <Flex vertical gap={5} style={{ height: "400px", overflowY: "auto" }}>
            {
                data.map((item, index) => {

                    let name = item.name
                    let type = item.valueType
                    let initialValue = ""

                    if (item.initialValue?.type == "JSON_LITERAL") {
                        initialValue = JSON.stringify(item.initialValue.value)
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