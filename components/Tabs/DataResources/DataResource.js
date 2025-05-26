import { useState } from "react";
import { ExportOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Flex, Card, Tag, Typography } from "antd";
const { Title, Text } = Typography;

// Components
import Events from "./Events";

export default function DataResource({ item, expandedMode, onOpenButtonClick = () => { } }) {

    const [expandedModeOverride, setCompactModeOverride] = useState(false)

    const label = item.elementLabel
    const resourceID = item.elementId
    const mode = item.readEvaluationMode
    const type = item.definition.type

    const expanded = ((expandedMode && !expandedModeOverride) || (!expandedMode && expandedModeOverride))

    return (
        <Card>
            <Flex gap={10} vertical>
                <Flex gap={5} justify="space-between" items="center">
                    <Title level={5} style={{ margin: 0, fontSize: 14 }}>
                        {label}
                    </Title>
                    <Flex gap={10} items="center">
                        <Text code>{resourceID}</Text>
                        <Button type="text" shape="circle" icon={<ExportOutlined />} size="small" onClick={onOpenButtonClick} />
                        <Button type="text" shape="circle" icon={(expanded ? <UpOutlined /> : <DownOutlined />)} size="small" onClick={() => setCompactModeOverride(!expandedModeOverride)} />
                    </Flex>
                </Flex>
                <Flex>
                    <Tag color={(mode == "EAGER" ? "error" : "green")} style={{ fontSize: "10px" }}>{(mode == "EAGER" ? "IMMEDIATELY" : "ONLY WHEN INVOKED")}</Tag>
                    <Tag color="purple" style={{ fontSize: "10px" }}>{type}</Tag>
                </Flex>

                {expanded && <Events data={item.eventMappings} />}


            </Flex>
        </Card>
    );
}