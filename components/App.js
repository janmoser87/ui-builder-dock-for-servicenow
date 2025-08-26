import { Tabs, Flex, Typography } from "antd";
import { useEffect } from "react"
const { Text } = Typography;

// Components
import Tabs from "./Tabs"
import QuickLinks from "./QuickLinks";

// Utils
import { getTabData } from "../scripts/Utils";

// Context
import { useAppContext } from "../contexts/AppContext";

export default function App({ onAppReady = ({ tabUrlbase, isInUiBuilderEditor }) => { }, showQuickLinks }) {

	const { tabData, setTabData } = useAppContext()

	const init = async () => {
		const tabData = await getTabData()
		if (tabData) {
			setTabData(tabData)
			onAppReady({ tabUrlbase: tabData.tabUrlBase, isInUiBuilderEditor: tabData.isInUiBuilderEditor })
		}
	}
	useEffect(() => {
		init()
	}, [])

	if (!tabData) {
		return
	}

	if (!tabData.isInServiceNowInstance) {
		return (
			<Flex justify="center" items="center" gap={10}>
				<Text style={{fontSize: 12}}>You are not in ServiceNow.</Text>
			</Flex>
		)
	}

	if (!tabData.isInUiBuilderEditor) {
		return (
			<Flex justify="center" items="center" gap={10} vertical >

				{
					<Flex>
						<QuickLinks />
					</Flex>
				}
				{
					!tabData.isInUiBuilderEditor &&
					<Flex justify="center" >
						<Text style={{fontSize: 12}}>You are not in supported UI Builder editor (Experience / Page Collection / Component).</Text>
					</Flex>
				}
			</Flex>
		)
	}

	if (showQuickLinks) {
		return (
			<Flex>
				<QuickLinks />
			</Flex>
		)
	}

	return (
		<Flex>
			<Tabs />
		</Flex>
	)
}