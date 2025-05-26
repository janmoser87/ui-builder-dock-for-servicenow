import { Flex, Button } from "antd";
import { SettingOutlined } from '@ant-design/icons';

// Context
import { useAppContext } from "../../contexts/AppContext";

export default function PageCollectionLink({ sysID }) {

    const { tabData } = useAppContext()

    return (
        <Flex>
            <Button icon={<SettingOutlined />} type="primary" onClick={() => {
                chrome.tabs.create({ url: `https://${tabData.tabUrlBase}/sys_ux_extension_point.do?sys_id=${sysID}`, index: tabData.tab.index + 1 })
            }}>
                Open Extension Point
            </Button>
        </Flex>
    )
}