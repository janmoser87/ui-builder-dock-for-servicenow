import { useState, useEffect } from "react";
import { Flex } from "antd";

// Context
import { useAppContext } from "../../../contexts/AppContext";

// Components
import ClientScript from "./ClientScript"

export default function ClientScripts() {

    const { macroponentData } = useAppContext()
    const [data, setData] = useState([])

    useEffect(() => {
        try {
            const data = JSON.parse(macroponentData._scripts)
            setData(data)
        }
        catch (e) {
            setData([])
        }
    }, [])

    return (
        <Flex vertical gap={5} style={{ height: "400px", overflowY: "auto" }}>
            {
                data.filter(item => item.type == "default").map((item, index) => <ClientScript key={index} item={item} />)
            }
        </Flex>
    )

}