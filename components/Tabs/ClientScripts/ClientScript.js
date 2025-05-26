import { useState } from "react";
import { Button, Flex, Card, Typography } from "antd";
const { Text } = Typography;

// Components
import Code from "../../Code"

export default function ClientScript({item}) {

    const [showCode, setShowCode] = useState(false)

    return (
        <Card>
            <Flex gap={5} justify="space-between">
                <Flex gap={10}>
                    <Text strong>{item.name}</Text>
                </Flex>
                <Flex>
                    <Button color="purple" style={{ fontSize: "12px" }}  variant="filled" size="small" onClick={() => setShowCode(!showCode)}>{showCode ? "Hide" : "Show"} code</Button>
                </Flex>
            </Flex>
            {showCode && <Code code={item.script} />}
        </Card>
    )
}