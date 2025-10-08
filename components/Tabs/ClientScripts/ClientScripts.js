import { Flex } from "antd";

// Context
import { useAppContext } from "~contexts/AppContext";

// Components
import ClientScript from "./ClientScript"
import NoData from "~components/NoData"

export default function ClientScripts() {

    const { macroponentData } = useAppContext()
    
    const clientScripts = macroponentData._scripts || []

    if (!clientScripts[0]) {
        return <NoData sectionName="client scripts" />
    }

    return (
        <Flex vertical gap={5}>
            {
                clientScripts.map((item, index) => <ClientScript key={index} item={item} />)
            }
        </Flex>
    )

}