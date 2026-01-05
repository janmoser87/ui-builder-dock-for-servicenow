import React from "react"
import {
	Card,
	Typography,
	Avatar,
	Flex,
	List,
	Button,
	theme
} from "antd"
import {
	LinkedinOutlined,
	GlobalOutlined,
	CoffeeOutlined,
	GithubOutlined,
	RightOutlined
} from "@ant-design/icons"

import avatar from "url:../assets/avatar.png"

const { Text, Title, Link } = Typography

export default function About() {
	const { token } = theme.useToken()

	const links = [
		{
			title: "My UI Builder Corner",
			description: "Personal blog with tips and thoughts",
			icon: <GlobalOutlined style={{ fontSize: 20, color: token.colorPrimary }} />,
			href: "https://myuibcorner.com"
		},
		{
			title: "LinkedIn",
			description: "Sharing day-to-day ServiceNow experience",
			icon: <LinkedinOutlined style={{ fontSize: 20, color: "#0077b5" }} />,
			href: "https://www.linkedin.com/in/jan-moser-78b2339a/"
		},
		{
			title: "Buy Me a Coffee",
			description: "Like the extension? Support with a coffee",
			icon: <CoffeeOutlined style={{ fontSize: 20, color: "#d35400" }} />,
			href: "https://buymeacoffee.com/janmoser"
		}
	]

	return (
		<>
			<style>
				{`
					.hover-list-item {
						transition: background-color 0.3s;
						border-radius: ${token.borderRadiusLG}px; /* Aby to ladilo se zaoblením */
					}
					.hover-list-item:hover {
						background-color: ${token.colorFillAlter}; /* Jemná barva pozadí z AntD */
					}
				`}
			</style>
			<Flex vertical gap={16} style={{ padding: 16, width: '100%' }}>
				
				{/* Main Profile Card */}
				<Card
					styles={{ body: { padding: 0 } }}
					bordered={false}
					style={{ boxShadow: token.boxShadowSecondary }}
				>
					{/* Header Section */}
					<Flex
						vertical
						align="center"
						style={{ padding: "24px 24px 16px 24px", background: token.colorFillQuaternary }}
					>
						<Avatar
							src={avatar}
							size={64}
							style={{ border: `2px solid ${token.colorBgContainer}` }}
						/>
						<Title level={4} style={{ margin: "12px 0 4px" }}>
							Jan Moser
						</Title>
						<Text type="secondary">ServiceNow UI Builder Enthusiast</Text>
					</Flex>

					{/* Links List */}
					<List
						itemLayout="horizontal"
						dataSource={links}
						renderItem={(item) => (
							<List.Item
								style={{
									padding: "12px 24px",
									cursor: "pointer",
									transition: "background 0.3s"
								}}
								className="hover-list-item"
								onClick={() => window.open(item.href, "_blank")}
								actions={[<RightOutlined key="arrow" style={{ color: token.colorTextQuaternary, fontSize: 12 }} />]}
							>
								<List.Item.Meta
									avatar={item.icon}
									title={<Text strong>{item.title}</Text>}
									description={
										<Text type="secondary" style={{ fontSize: 12 }}>
											{item.description}
										</Text>
									}
								/>
							</List.Item>
						)}
					/>
				</Card>

				{/* Secondary Actions & Footer */}
				<Flex vertical align="center" gap={12}>
					<Button
						type="text"
						icon={<GithubOutlined />}
						href="https://github.com/janmoser87/ui-builder-dock-for-servicenow"
						target="_blank"
					>
						View Source on GitHub
					</Button>

					<Flex vertical align="center" gap={4}>
						<Text type="secondary" style={{ fontSize: 11, textAlign: "center" }}>
							Source-available for transparency. Verify code & checksums.
						</Text>
						<Text disabled style={{ fontSize: 10, textAlign: "center", maxWidth: 280 }}>
							This extension is provided “as is” without warranties. Redistribution not allowed.
						</Text>
					</Flex>
				</Flex>
			</Flex>
			</>
	)
}