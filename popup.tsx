import { useState, useEffect } from "react"
import { Flex, ConfigProvider, Typography, Button } from "antd";
import { QuestionCircleOutlined, CloseOutlined, RocketOutlined, RocketFilled    } from '@ant-design/icons';
import logo from "url:./assets/icon.development.png"
import "./popup.css"

// Components
import About from "components/About";
import App from "components/App"

// Utils
import { getTabData } from "scripts/Utils";

// App Context
import { AppContextProvider } from "contexts/AppContext"

function IndexPopup() {

	const [title] = useState("UI Builder Dock")
	const [subtitle, setSubtitle] = useState("")
	const [showAbout, setShowAbout] = useState(false)
	const [showQuickLinks, setShowQuickLinks] = useState(false)

	return (
		<AppContextProvider>
			<ConfigProvider
				theme={{
					token: {

					},
					components: {
						Card: {
							bodyPadding: 10
						},
					}
				}}
			>
				<Flex vertical style={{ padding: 10 }}>
					<Flex justify="space-between" align="center" style={{paddingRight: 10}}>
						<Flex gap={10} align="center" justify="flex-start" style={{ marginBottom: 5 }}>
							<img src={logo} alt="Logo" style={{ width: 32 }} />
							<Flex vertical>
								<h2 style={{ margin: 0 }}>{title}</h2>
								<Typography.Text>{subtitle}</Typography.Text>
							</Flex>
						</Flex>
						<Flex gap={5}>
							<Button size="small" shape="circle" icon={showQuickLinks ? <RocketFilled />: <RocketOutlined   />} onClick={() => setShowQuickLinks(!showQuickLinks) }/>
							<Button size="small" shape="circle" icon={showAbout ? <CloseOutlined/>: <QuestionCircleOutlined />} onClick={() => setShowAbout(!showAbout) }/>
						</Flex>
					</Flex>
					{showAbout ? <About /> : <App onAppReady={({tabUrlbase}) => setSubtitle(tabUrlbase)} showQuickLinks={showQuickLinks} />}
				</Flex>
			</ConfigProvider>
		</AppContextProvider>
	)

}

export default IndexPopup
