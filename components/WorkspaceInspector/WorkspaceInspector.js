import { useState, useEffect } from "react";
import { SettingOutlined, ThunderboltOutlined, BranchesOutlined, LinkOutlined, SearchOutlined } from "@ant-design/icons";
import { Typography, Collapse, Tag, Table, Space, Card, Flex, Alert, Empty, Badge, Button, Input, Spin, Form, message } from "antd";
const { Text, Link } = Typography;

import { Storage } from "@plasmohq/storage"
const storage = new Storage({ area: "local" })

// Components
import JsonViewer from "~components/JsonViewer";
import Profile from "./Profile"

// Utils
import { getProfile } from "./Utils";

// Context
import { useAppContext } from "~contexts/AppContext";

export default function WorkspaceInspector() {
    const { tabData } = useAppContext();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({});

    const handleInspect = async (values) => {
        try {
            setLoading(true);
            const { workspaceUrl, table, sysId } = values;
            const profileData = await getProfile(tabData, workspaceUrl, table, sysId);
            setProfile(profileData);
        }
        catch (err) {
            message.error(`Error inspecting workspace: ${err.message}`);
        }
         finally {
            setLoading(false);
         }
    };

    return (
        <Flex vertical gap={10} flex={1}>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleInspect}
                    initialValues={{
                        workspaceUrl: tabData?.workspaceData?.workspaceUrl || '',
                        table: tabData?.workspaceData?.table || '',
                        sysId: tabData?.workspaceData?.sysId || ''
                    }}
                >
                    <Flex vertical gap={0}>
                        <Form.Item
                            label="Workspace URL Path"
                            tooltip="Path part of the Workspace URL (sys_ux_page_registry > path)"
                            name="workspaceUrl"
                            rules={[{ required: true, message: 'Please input Workspace URL!' }]}
                            style={{ marginBottom: 12 }}
                        >
                            <Input prefix={<LinkOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="sow" allowClear/>
                        </Form.Item>

                        

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Inspect
                        </Button>
                    </Flex>
                </Form>
            </Card>

            <Flex vertical gap={5}>
                <Profile sections={profile.sections} />
            </Flex>
        </Flex>
    )
}
