import { Flex, Typography } from "antd";
const { Text } = Typography;

// Components
import Target from "./Target";

export default function Targets({ data }) {
    return (
        <Flex vertical gap={5}>
            {
                data.length == 0 && <Text type="secondary" style={{ fontSize: "12px" }}>No targets mapping implemented.</Text>
            }
            {
                data.map((target, index) => <Target key={index} data={target} />)
            }
        </Flex>
    )
}