import { useState, useEffect } from "react";
import { Flex } from "antd";

// Context
import { useAppContext } from "../../../contexts/AppContext";

// Components
import ClientScript from "./ClientScript"
import NoData from "./../../NoData"

export default function ClientScripts() {

    const { macroponentData } = useAppContext()
    const [data, setData] = useState([])

    useEffect(() => {
        try {
            const data = JSON.parse(macroponentData._scripts)
            setData(data.filter(item => item.type == "default"))
        }
        catch (e) {
            setData([])
        }
    }, [])

    if (!data[0]) {
        return <NoData sectionName="client scripts" />
    }

    return (
        <Flex vertical gap={5} style={{ height: "400px", overflowY: "auto" }}>
            {
                data.map((item, index) => <ClientScript key={index} item={item} />)
            }
        </Flex>
    )

}