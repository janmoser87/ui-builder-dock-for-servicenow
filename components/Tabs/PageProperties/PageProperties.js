import { Flex, Card, Tag, Typography } from "antd";
const { Text } = Typography;

// Utils
import { getTypeColor } from "./Utils"

// Context
import { useAppContext } from "~contexts/AppContext";

// Components
import NoData from "~components/NoData"

export default function Properties() {

    const { tabData, macroponentData } = useAppContext()

    let data = []

    try {

        // Getting type of current UIB page
        const { tabUrlProps: { type: pageType } } = tabData

        // Definition of props
        let macroponentProps = JSON.parse(macroponentData.props)

        // Mapping Props to default values
        data = macroponentProps.map(prop => {

            let value

            // For Component, the property value is on macroponent.props right away
            if (pageType == "component") {

                value = `"${prop.defaultValue}"`

                if (prop.fieldType == "json" || "boolean") {
                    try {
                        value = `${JSON.stringify(prop.defaultValue)}`
                    }
                    catch (e) { }
                }

                if (prop.fieldType == "number") {
                    value = `${prop.defaultValue}`
                }
            }

            // For Experience and Page Collection, we need to get the value from parent (sys_ux_screen.macroponent_config)
            if (pageType == "experience" || pageType == "pc") {

                let macroponentConfig = JSON.parse(macroponentData._parent_screen_macroponent_config)
                let macroponentConfigProperty = macroponentConfig[prop.name]

                if (macroponentConfigProperty?.type == "JSON_LITERAL") {
                    value = `"${macroponentConfigProperty.value}"`
                }

                if (macroponentConfigProperty?.type == "CONTEXT_BINDING") {
                    value = `@context.${macroponentConfigProperty.binding.category}.${macroponentConfigProperty.binding?.address?.join(".")}`
                }

                if (macroponentConfigProperty?.type == "DATA_OUTPUT_BINDING") {
                    value = `@data.${macroponentConfigProperty.binding?.address?.join(".")}`
                }

            }

            return {
                ...prop,
                value
            }
        })
    }
    catch (e) {
    }

    if (!data[0]) {
        return <NoData sectionName="properties" />
    }

    return (
        <Flex vertical gap={5}>
            {
                data.map((item, index) => {

                    let name = item.name
                    let fieldType = item.fieldType
                    let description = item.description
                    let value = item.value

                    return (
                        <Card key={index}>
                            <Flex gap={5} vertical>
                                <Flex justify="space-between">
                                    <Flex gap={10} align="center">
                                        <Text strong>{name}</Text>
                                        <Tag color={getTypeColor(fieldType)}>{fieldType}</Tag>
                                    </Flex>
                                    <Flex style={{ maxWidth: "50%" }}>
                                        <Text code={!!value}>{value}</Text>
                                    </Flex>
                                </Flex>
                                {description && <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>}
                            </Flex>
                        </Card>
                    )

                })
            }
        </Flex>
    );

}