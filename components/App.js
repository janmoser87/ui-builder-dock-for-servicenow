import { Tabs, Flex, Typography } from "antd";
import { useEffect } from "react"
const { Text } = Typography;

// Components
import Tabs from "./Tabs"
import QuickLinks from "./QuickLinks";

// Utils
import { getTabData } from "~scripts/Utils";

// Context
import { useAppContext } from "~contexts/AppContext";

export default function App({ onAppReady = (tabData) => { }, showQuickLinks, url }) {

	const { tabData, setTabData } = useAppContext()

	const init = async () => {
		const tabData = await getTabData()
		if (tabData) {
			setTabData(tabData)
			onAppReady(tabData)
		}
	}
	useEffect(() => {
		init()
	}, [url])

	if (!tabData) {
		return
	}

	if (!tabData.isInServiceNow) {
		return (
			<Flex flex={1} justify="center">
				<Text style={{fontSize: 12}}>You are not in ServiceNow.</Text>
			</Flex>
		)
	}

	if (!tabData.isInUIBuilder || !tabData.isInUIBuilderSupportedPage) {
		return (
			<Flex flex={1} vertical>
				{
					<Flex flex={1} style={{marginTop: '10px'}}>
						<QuickLinks />
					</Flex>
				}
				{
					!tabData.isInUIBuilder &&
					<Flex justify="center" >
						<Text style={{fontSize: 12}}>You are not in UI Builder.</Text>
					</Flex>
				}
				{
					tabData.isInUIBuilder && !tabData.isInUIBuilderSupportedPage &&
					<Flex justify="center" align="center" vertical>
						<Text style={{fontSize: 12}}>You are not in supported UI Builder page</Text>
						<Text style={{fontSize: 12}}>(Experience page / Page Collection / Component).</Text>
					</Flex>
				}
			</Flex>
		)
	}

	if (showQuickLinks) {
		return <QuickLinks />
	}

	return <Tabs />
}