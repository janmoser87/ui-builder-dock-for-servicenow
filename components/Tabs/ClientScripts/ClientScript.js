import { Typography, Collapse } from "antd";
const { Text } = Typography;

// Components
import Code from "~components/Code"

export default function ClientScript({ item }) {

    return (
        <Collapse 
            items={[
                {
                    key: "clientscript",
                    label: <Text strong>{item.name}</Text>,
                    children: <Code code={item.script} />
                }
            ]} 
            style={{backgroundColor: "white"}}
        />
    )

}