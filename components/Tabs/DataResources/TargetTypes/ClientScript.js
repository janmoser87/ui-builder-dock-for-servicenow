import { Typography, Collapse } from "antd";
const { Text } = Typography;

// Context
import { useAppContext } from "~contexts/AppContext";

// Components
import Code from "~components/Code"

// Utils
import { getClientScriptByID } from "./../Utils"

export default function ClientScript({ data }) {
    const { macroponentData } = useAppContext()
    const clientScript = getClientScriptByID(macroponentData, data.sysId)

    if (!clientScript) return null

    return (
        <Collapse items={[
            {
                key: "script",
                label: <Text><Text strong>"{clientScript.sys_name}"</Text> script</Text>,
                children: <Code code={clientScript.script} />
            }
        ]}/>
    )
}