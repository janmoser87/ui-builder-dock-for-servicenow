import { useState, useEffect } from "react";
import { Button, Flex, Card, Typography, Input, Select, Divider, FloatButton } from "antd";
import { PlusOutlined, DeleteOutlined, RadiusSettingOutlined } from '@ant-design/icons';
const { Text, Title } = Typography;

export default function DataResourceBuilder({ tabData, onCreatingModeChange = () => { } }) {

    const [creatingMode, setCreatingMode] = useState(false)
    const [name, setName] = useState("")
    const [properties, setProperties] = useState([])

    useEffect(() => {
        onCreatingModeChange(creatingMode)
    }, [creatingMode])

    const addProperty = () => {

        let newProperty = {
            _id: Math.random(), // Internal ID for handling purposes
            label: "",
            id: "",
            type: "string",
        }
        setProperties([...properties, newProperty])
    }

    const removeProperty = (_id) => {
        setProperties(properties.filter(property => property._id !== _id))
    }

    const updateProperty = (_id, key, value) => {
        setProperties(properties.map(property => {
            if (property._id === _id) {
                return { ...property, [key]: value };
            }
            return property;
        }));
    }

    const handleProceed = () => {

        const query = []
        query.push(`name=${name}`)
        query.push(`script=function transform(input) {\n\ttry {\n\n\t\tconst { ${properties.map(property => property.id).join(", ")} } = input;\n\n\t\t// Your code \n\n\t}\n\tcatch (e) {\n\t\treturn new Error("[${name}] Data Resource Error: " + e.message);\n\t} \n }`)
        query.push(`props=[\n${properties.map(property => `\t{\n\t\t"name": "${property.id}",\n\t\t"label": "${property.label}",\n\t\t"description": "",\n\t\t"readOnly": false,\n\t\t"fieldType": "${property.type}",\n\t\t"mandatory": true,\n\t\t"defaultValue": ""\n\t}`).join(",\n")}\n]`)

        const baseUrl = "https://" + tabData.tabUrlBase
        const table = "sys_ux_data_broker_transform"

        chrome.tabs.create({ url: `${baseUrl}/${table}.do?sys_id=-1&sysparm_query=${encodeURIComponent(query.join("^"))}`, index: tabData.tab.index + 1 })
    }

    if (!creatingMode) {
        return (
            <FloatButton.Group
                trigger="hover"
                type="primary"
                style={{ insetInlineEnd: 24, right: 16, bottom: 16, opacity: 0.7 }}
                icon={<PlusOutlined />}
            >
                <FloatButton tooltip={<div>Transform Data Resource Builder</div>} onClick={() => setCreatingMode(true)} icon={<RadiusSettingOutlined />} />
            </FloatButton.Group>
        )
    }

    return (
        <Flex vertical gap={10}>
            <Card style={{
                backgroundColor: "#f0f2f5"
            }}>
                <Flex vertical gap={10}>
                    <Title level={4} style={{ margin: 0 }}><RadiusSettingOutlined /> Transform Data Resource Builder</Title>
                    <Divider style={{ margin: 0 }} />
                    <Flex vertical gap={10}>
                        <Text strong>Name</Text>
                        <Input value={name} onChange={(e) => {
                            setName(e.target.value)
                        }} />
                    </Flex>
                    <Flex vertical>
                        <Flex gap={10} align="center" style={{ marginBottom: 10 }}>
                            <Text strong>Properties</Text>
                            <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={addProperty} />
                        </Flex>
                        <Flex vertical gap={5}>
                            {
                                properties.map((property, index) => {
                                    return (
                                        <Flex key={property._id} gap={10} justify="space-between">
                                            <Input style={{ width: 200 }} placeholder="Label" value={property.value} onChange={(e) => {
                                                updateProperty(property._id, "label", e.target.value)
                                            }} />
                                            <Input style={{ width: 200 }} placeholder="ID" value={property.value} onChange={(e) => {
                                                updateProperty(property._id, "id", e.target.value)
                                            }} />
                                            <Select
                                                disabled
                                                options={[
                                                    { value: "string", label: "string" }
                                                ]}
                                                style={{ width: 160 }}
                                                placeholder="Field type"
                                                value={property.type}
                                            />
                                            <Button danger type="primary" shape="circle" icon={<DeleteOutlined />} onClick={() => removeProperty(property._id)} />
                                        </Flex>
                                    )
                                })
                            }

                        </Flex>
                    </Flex>
                    <Button
                        type="primary"
                        onClick={handleProceed}>
                        Proceed
                    </Button>
                    <Button
                        danger
                        onClick={() => setCreatingMode(false)}>
                        Cancel
                    </Button>
                </Flex>

            </Card>

        </Flex>
    );

}