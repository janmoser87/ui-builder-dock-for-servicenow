import { useState } from "react"
import { Flex, ConfigProvider, Typography, Button, Image, Alert, Space, Tag, Badge } from "antd";
const { Title, Text } = Typography
import { QuestionCircleOutlined, CloseOutlined, ThunderboltOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import logo from "url:./assets/icon.development.png"
import "./popup.css"
import { ErrorBoundary } from "react-error-boundary";

// Components
import About from "components/About";
import Blog from "components/Blog";
import App from "components/App"
import Search from "components/Search"

// App Context
import { AppContextProvider } from "contexts/AppContext"

function IndexPopup() {

	const [tabData, setTabData] = useState(null)

	const [showAbout, setShowAbout] = useState(false)
	const [showQuickLinks, setShowQuickLinks] = useState(false)
	const [showBlog, setShowBlog] = useState(false)
	const [showSearch, setShowSearch] = useState(false)

	const [errorStack, setErrorStack] = useState("")

	return (
		<AppContextProvider>
			<ConfigProvider
				theme={{
					token: {

					},
					components: {
						Card: {
							bodyPadding: 10
						}
					}
				}}
			>
				<ErrorBoundary 
					FallbackComponent={({ error }) => {
						return (
							<Flex vertical gap={10} style={{ padding: 20}}>
								<Alert 
									type="error"
									showIcon
									message="Something went wrong"
									description={error.message}
								/>
								<Typography.Text style={{fontSize: "10px"}}>{errorStack}</Typography.Text>
							</Flex>
						)
					}}
					onError={(error, info) => {
						setErrorStack(info.componentStack)
					}}
				>
					<Flex vertical style={{ padding: 10 }}>
						<Flex justify="space-between" align="center" style={{ paddingRight: 10 }}>
							<Flex gap={10} align="center" justify="flex-start" style={{ marginBottom: 5 }}>
								<Image src={logo} width={32} preview={false} />
								<Flex vertical>
									<Badge count={`v${process.env.PLASMO_PUBLIC_VERSION}`} offset={[30,20]} color="gold">
										<Title level={4} style={{ margin: 0 }}>
											UI Builder Dock
										</Title>
									</Badge>
									<Text>{tabData?.tabUrlBase}</Text>
								</Flex>
							</Flex>
							<Flex>
								{(() => {
									if (showQuickLinks || showBlog || showAbout || showSearch) {
										return (
											<Button
												size="small"
												shape="circle"
												icon={<CloseOutlined />}
												onClick={() => {
													setShowQuickLinks(false)
													setShowBlog(false)
													setShowAbout(false)
													setShowSearch(false)
												}}
												title="Close"
											/>
										)
									}

									return (
										<Flex gap={10} vertical align="flex-end">
											<Flex gap={5}>
												<Button
													type="text"
													size="small"
													icon={<ReadOutlined style={{ color: "#1677ff" }} />}
													onClick={() => setShowBlog(true)}
													title="Latest articles"
												>
													Latest articles
												</Button>
												<Button
													type="text"
													size="small"
													icon={<QuestionCircleOutlined style={{ color: "#13c2c2" }} />}
													onClick={() => setShowAbout(true)}
													title="About"
												>
													About
												</Button>
											</Flex>
											<Flex gap={5}>
												{tabData?.isInServiceNow && (
													<Button
														type="dashed"
														size="small"
														icon={<SearchOutlined style={{ color: "#52c41a" }} />}
														onClick={() => setShowSearch(true)}
														title="Search"

													>
														Search
													</Button>
												)}
												{tabData?.isInUIBuilderSupportedPage && (
													<Button
														type="dashed"
														size="small"
														icon={<ThunderboltOutlined style={{ color: "#f59f00" }} />}
														onClick={() => setShowQuickLinks(true)}
														title="Quick links"
													>
														Quick links
													</Button>
												)}
											</Flex>
										</Flex>
									)
								})()}
							</Flex>

						</Flex>

						{
							(() => {

								if (showAbout) {
									return <About />
								}

								if (showBlog) {
									return <Blog />
								}

								if (showSearch) {
									return <Search />
								}

								return (
									<App
										showQuickLinks={showQuickLinks}
										onAppReady={(tabData) => {
											setTabData(tabData)
										}
										}
									/>
								)

							})()
						}

					</Flex>
				</ErrorBoundary>
			</ConfigProvider>
		</AppContextProvider>
	)

}

export default IndexPopup
