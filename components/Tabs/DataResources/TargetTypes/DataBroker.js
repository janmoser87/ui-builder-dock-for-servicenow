import { Flex, Typography } from "antd";
const { Text } = Typography;

// Context
import { useAppContext } from "~contexts/AppContext";

// Utils
import { getDataResourceByID } from "./../Utils"

export default function DataBroker({data}) {
    const { macroponentData } = useAppContext()
    const dataResource = getDataResourceByID(macroponentData, data.parentResourceId)
    
    if (data.operationName) {
        return (
            <Flex>
                <Text code style={{fontSize: "12px"}}>{data.operationName}</Text>
                <Text code style={{fontSize: "12px"}}>{dataResource?.elementLabel || data.parentResourceId}</Text>
            </Flex>
        )
    }

    return null
}