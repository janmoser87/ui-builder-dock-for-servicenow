import { useState, useEffect } from "react";
import { Flex, Card, Tag, Typography } from "antd";
const { Text } = Typography;

// Utils
import { getTypeColor } from "./Utils"

// Context
import { useAppContext } from "../../../contexts/AppContext";

export default function Properties() {

    const {tabData, macroponentData} = useAppContext()
    const [data, setData] = useState([])

    useEffect(() => {
        try {

            // Definition of props
            let data = JSON.parse(macroponentData.props)

            // Values of those props from UX Screen
            let propsValues = JSON.parse(macroponentData._screen_properties)

            // Binding them to the values that are on UX Screen
            setData(data.map(item => {
                
                let valueTranslated = "Unknown value"
                let value = propsValues[item.name] || null

                if (value) {
                    if (value.type == "DATA_OUTPUT_BINDING") {
                        valueTranslated = "@" + value.binding?.address?.join(".") 
                    }
                }

                return {
                    ...item,
                    value,
                    valueTranslated
                }
            }))
        }
        catch (e) {
            setData([])
        }
    }, [])

    return (
        <Flex vertical gap={5} style={{ height: "400px", overflowY: "auto" }}>
            {
                data.map((item, index) => {

                    let name = item.name
                    let type = item.fieldType
                    let description = item.description
                    let value = item.valueTranslated

                    return (
                        <Card key={index}>
                            <Flex gap={5} vertical>
                                <Flex justify="space-between">
                                    <Flex gap={10}>
                                     <Text strong>{name}</Text> <Tag color={getTypeColor(type)}>{type}</Tag> 
                                    </Flex>
                                    <Flex>
                                        <Text code>{value}</Text>    
                                    </Flex>
                                </Flex>
                                {description && <Text>
                                    {description}
                                </Text>}
                            </Flex>
                        </Card>
                    )

                })
            }
        </Flex>
    );

}