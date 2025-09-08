import React from "react"
import {
	Card,
	Typography,
	Avatar,
	Flex,
	Divider,
	theme
} from "antd"
import {
	LinkedinOutlined,
	GlobalOutlined,
	CoffeeOutlined,
	GithubOutlined
} from "@ant-design/icons"

import avatar from "url:../assets/avatar.png"

const { Text, Link, Title } = Typography

export default function About() {
	const { token } = theme.useToken()

	return (
		<Flex vertical gap={12}>
			{/* Header */}
			<Card>
				<Flex align="center" gap={12}>
					<Avatar src={avatar} size={48} />
					<Flex vertical>
						<Title level={5} style={{ margin: 0 }}>
							Jan Moser
						</Title>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Made with ❤️ · v1.0.9
						</Text>
					</Flex>
				</Flex>
			</Card>

			{/* Links */}
			<Card>
				<Flex vertical gap={12}>
					<Flex vertical gap={4}>
						<Flex gap={6} align="center">
							<GlobalOutlined style={{ color: token.colorPrimary }} />
							<Link href="https://myuibcorner.com" target="_blank">
								My UI Builder Corner
							</Link>
						</Flex>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Personal blog with tips and thoughts on UI Builder
						</Text>
					</Flex>

					<Divider style={{ margin: "0px 0" }} />

					<Flex vertical gap={4}>
						<Flex gap={6} align="center">
							<LinkedinOutlined style={{ color: "#0077b5" }} />
							<Link
								href="https://www.linkedin.com/in/jan-moser-78b2339a/"
								target="_blank"
							>
								LinkedIn
							</Link>
						</Flex>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Sharing day-to-day ServiceNow experience
						</Text>
					</Flex>

					<Divider style={{ margin: "0px 0" }} />

					<Flex vertical gap={4}>
						<Flex gap={6} align="center">
							<CoffeeOutlined style={{ color: "#d35400" }} />
							<Link href="https://buymeacoffee.com/janmoser" target="_blank">
								Buy Me a Coffee
							</Link>
						</Flex>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Like the extension? Support with a coffee
						</Text>
					</Flex>
				</Flex>
			</Card>

			{/* GitHub */}
			<Card>
				<Flex vertical gap={6}>
					<Flex gap={6} align="center">
						<GithubOutlined />
						<Link
							href="https://github.com/janmoser87/ui-builder-dock-for-servicenow"
							target="_blank"
						>
							View Source on GitHub
						</Link>
					</Flex>
					<Text type="secondary" style={{ fontSize: 12 }}>
						Source-available for transparency.
						Verify the code, build it yourself, and compare checksums.
					</Text>
				</Flex>
			</Card>

			{/* Disclaimer */}
			<Card>
				<Text type="secondary" style={{ fontSize: 11 }}>
					This extension is provided “as is” without any warranties.
					Redistribution or copying is not allowed.
				</Text>
			</Card>
		</Flex>
	)
}
