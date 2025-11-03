// Settings.js
import { Flex, Typography, Divider, Card, Switch, Space, Alert } from "antd"
import { AppstoreOutlined, DatabaseOutlined } from "@ant-design/icons"
const { Title, Text } = Typography
import { useStorage } from "@plasmohq/storage/hook"

import backendButtons from "../dom/definitions/backendButtons"
import frontendButtons from "../dom/definitions/frontendButtons"

// Storage keys
import { STORAGE_KEYS } from "~consts"
const SETTINGS_STORAGE_KEY = STORAGE_KEYS.SETTINGS

export default function Settings() {
    const [prefs, setPrefs, { isLoading }] = useStorage(SETTINGS_STORAGE_KEY, {})

    const sections = [
        {
            title: "Frontend",
            color: "#1890ff", // Ant Design blue
            icon: <AppstoreOutlined style={{ color: "#1890ff" }} />,
            items: frontendButtons
        },
        {
            title: "Backend",
            color: "#fa8c16", // Ant Design orange
            icon: <DatabaseOutlined style={{ color: "#fa8c16" }} />,
            items: backendButtons
        }
    ]

    if (isLoading) return null

    const isEnabled = (key) => (prefs?.[key] === undefined ? true : !!prefs[key])
    const setEnabled = (key, val) => setPrefs(prev => ({ ...(prev || {}), [key]: !!val }))

    return (
        <Flex vertical gap={16} style={{ width: "100%" }}>
            <Alert
                type="info"
                showIcon
                description="These options control whether the extension injects additional UI buttons directly into the ServiceNow interface. Disable a button if you prefer to keep the original UI unchanged."
            />

            {sections.map((sec, idx) => (
                <div key={sec.title}>
                    {idx > 0 && <Divider style={{ margin: "12px 0" }} />}
                    <Title level={5} style={{ margin: 0 }}>
                        <Space>
                            {sec.icon}
                            <span>{sec.title}</span>
                        </Space>
                    </Title>

                    <Flex vertical gap={8} style={{ marginTop: 8 }}>
                        {sec.items.map(item => (
                            <Card
                                key={item.key}
                                size="small"
                                variant="bordered"
                                style={{ width: "100%", background: "#fff" }}
                                title={
                                    <Space wrap>
                                        <Text strong>{item.label}</Text>
                                    </Space>
                                }
                                extra={
                                    <Switch
                                        checked={isEnabled(item.key)}
                                        onChange={(val) => setEnabled(item.key, val)}
                                    />
                                }
                            >
                                <Text type="secondary">
                                    {item.description || "No description"}
                                </Text>
                            </Card>
                        ))}
                    </Flex>
                </div>
            ))}
        </Flex>
    )
}
