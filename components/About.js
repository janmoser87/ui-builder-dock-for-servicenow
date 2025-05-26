import { useState } from "react"
import {
    Card,
    Typography,
    Avatar,
    Flex,
} from "antd"
import {
    LinkedinOutlined,
    GlobalOutlined,
    CoffeeOutlined,
    GithubOutlined
} from "@ant-design/icons"

const { Text, Link } = Typography
import avatar from "url:../assets/avatar.png"

export default function About() {

    return (
        <Flex vertical gap={10}>
            <Card style={{ marginTop: 10 }}>
                <Flex style={{ width: "100%", height: "100%" }} vertical gap={10}>
                    <Flex gap={10} align="center">
                        <Avatar src={avatar} size={40} style={{ marginRight: 10 }} />
                        <Flex vertical>
                            <Text>Made with ❤️ by Jan Moser</Text>
                            <Flex gap={10} align="center" style={{ marginTop: 5 }}>
                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                    version 1.0.6
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>

                    <Flex vertical gap={10}>
                        <Flex vertical>
                            <Flex gap={5}>
                                <GlobalOutlined style={{ color: "#e74c3c" }} />
                                <Link href="https://myuibcorner.com" target="_blank">
                                    My UI Builder Corner
                                </Link>
                            </Flex>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                My personal blog 📝 with tips, tricks, and thoughts on UI Builder
                            </Text>
                        </Flex>

                        <Flex vertical>
                            <Flex gap={5}>
                                <LinkedinOutlined style={{ color: "#0077b5" }} />
                                <Link href="https://www.linkedin.com/in/jan-moser-78b2339a/" target="_blank">
                                    LinkedIn
                                </Link>
                            </Flex>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                Occasionally sharing my day-to-day experience 🚀 with ServiceNow
                            </Text>
                        </Flex>

                        <Flex vertical>
                            <Flex gap={5}>
                                <CoffeeOutlined style={{ color: "#2c3e50" }} />
                                <Link href="https://buymeacoffee.com/janmoser" target="_blank">
                                    Buy Me a Coffee
                                </Link>
                            </Flex>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                Like the extension? Support me with a coffee ☕
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Card>

            {/* ✅ GitHub Audit Info */}
            <Card>
                <Flex vertical gap={5}>
                    <Flex gap={5}>
                        <GithubOutlined style={{ color: "#000" }} />
                        <Link href="https://github.com/janmoser87/ui-builder-dock-for-servicenow" target="_blank">
                            View Source on GitHub
                        </Link>
                    </Flex>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        This extension is <Text strong>source-available</Text> for transparency.
                        You can verify the code, build it yourself, and compare checksums with this version.
                    </Text>
                </Flex>
            </Card>

            <Card>
                <Flex vertical>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        This extension is provided "as is" without any warranties.
                        Redistribution or copying is not allowed.
                    </Text>
                </Flex>
            </Card>
        </Flex>
    )
}
