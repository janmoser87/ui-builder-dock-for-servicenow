import { ExportOutlined } from '@ant-design/icons';
import { Button, Flex, Tag, Typography, Collapse } from "antd";
const { Title, Text } = Typography;

// Components
import Events from "./Events";

export default function DataResource({ item, onOpenButtonClick = () => { } }) {

    const label = item.elementLabel
    const resourceID = item.elementId
    const mode = item.readEvaluationMode
    const type = item.definition.type

    return (
        <Collapse
            style={{ backgroundColor: "white" }}
            items={[
                {
                    key: resourceID,
                    label: (
                        <Flex vertical gap={5}>
                            <Flex gap={5} justify="space-between" items="center">
                                <Title level={5} style={{ margin: 0, fontSize: 14 }}>
                                    {label}
                                </Title>
                                <Flex items="center">
                                    <Flex>
                                        <Tag color={(mode == "EAGER" ? "error" : "green")} style={{ fontSize: "10px" }} bordered={false}>{(mode == "EAGER" ? "IMMEDIATELY" : "ONLY WHEN INVOKED")}</Tag>
                                        <Tag color="purple" style={{ fontSize: "10px" }} bordered={false}>{type}</Tag>
                                    </Flex>
                                    <Button type="text" shape="circle" icon={<ExportOutlined />} size="small" onClick={(e) => {
                                        e.stopPropagation()
                                        onOpenButtonClick()
                                    }} />
                                </Flex>
                            </Flex>
                            <Flex>
                                <Text code>{resourceID}</Text>
                            </Flex>
                        </Flex>
                    ),
                    children: <Events data={item.eventMappings} />
                }]}
        />
    )
}