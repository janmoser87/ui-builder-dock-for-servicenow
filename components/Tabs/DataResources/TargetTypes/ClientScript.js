import { Flex, Typography, Button } from "antd";
import { useState } from "react"
const { Text } = Typography;

// Context
import { useAppContext } from "../../../../contexts/AppContext";

// Components
import Code from "../../../Code"

export default function ClientScript({ data }) {

    const { getClientScriptByID } = useAppContext()
    const [showClientScript, setShowClientScript] = useState(false)
    const clientScript = getClientScriptByID(data.sysId) || null

    if (!clientScript) return null

    return (
        <Flex vertical>
            <Button onClick={() => setShowClientScript(!showClientScript)} size="small" style={{ fontSize: "12px" }} color="default" variant="filled">
                {showClientScript ? "Hide" : "Show"} <Text strong style={{ fontSize: "12px" }}>"{clientScript.sys_name}"</Text> script
            </Button>
            {showClientScript && <Code code={clientScript.script} />}
        </Flex>
    )
}