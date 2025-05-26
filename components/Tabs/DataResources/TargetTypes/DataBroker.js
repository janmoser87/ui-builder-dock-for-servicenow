import { Flex, Typography } from "antd";
const { Text } = Typography;

// Context
import { useAppContext } from "../../../../contexts/AppContext";

export default function DataBroker({data}) {

    const { getDataResourceByID } = useAppContext()

    if (data.operationName) {
        return (
            <Flex>
                <Text code style={{fontSize: "12px"}}>{data.operationName}</Text>
                <Text code style={{fontSize: "12px"}}>{getDataResourceByID(data.parentResourceId).elementLabel || data.parentResourceId}</Text>
            </Flex>
        )
    }

    return
}