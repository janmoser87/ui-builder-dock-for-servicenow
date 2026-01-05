import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Flex, ConfigProvider, Typography, Button, Image, Alert, Space, Tag, Badge, Dropdown, Space } from "antd";
const { Title, Text } = Typography
import { CloseOutlined } from '@ant-design/icons';
import logo from "url:../assets/icon.development.png"
import "./Wrapper.css"
import { ErrorBoundary } from "react-error-boundary";

// Storage keys
import { STORAGE_KEYS } from "~consts"
const ACTIVE_ROUTE_STORAGE_KEY = STORAGE_KEYS.ACTIVE_ROUTE

// Components
import About from "~components/About";
import Blog from "~components/Blog";
import App from "~components/App"
import Search from "~components/Search"
import Notes from "~components/Notes"
import Settings from "~components/Settings"
import WorkspaceInspector from "~components/WorkspaceInspector/WorkspaceInspector";
import CompositionInspector from "~components/CompositionInspector/CompositionInspector";

// App Context
import { AppContextProvider } from "~contexts/AppContext"

const Menu = ({ tabData, onRouteClick }) => {

    const menuItems = [
        {
            key: 'workspaceInspector',
            label: '🕵️‍♂️ Workspace Inspector',
            extra: 'Beta'
        },
        tabData?.isInUIBuilderSupportedPage ? {
            key: 'compositionInspector',
            label: '🕵️‍♂️ Composition Inspector',
        } : null,
        tabData?.isInServiceNow ? {
            key: 'search',
            label: '🔎 Search',
        } : null,
        tabData?.isInServiceNow ? {
            key: 'quicklinks',
            label: '⚡ Quicklinks',
        } : null,
        {
            key: 'notes',
            label: '📝 Notepad',
        },
        {
            key: 'settings',
            label: '⚙️ Settings',
        },
        {
            key: 'blog',
            label: '📖 Latest articles',
        },
        {
            key: 'about',
            label: '🙍 About',
        },
    ]

    return (
        <Dropdown menu={{items: menuItems, onClick: ({ key }) => { onRouteClick(key) }}}>
            <Button type="text" onClick={(e) => e.preventDefault()}>
                🛠️ Tools
            </Button>
        </Dropdown>
    )
}

function Wrapper({ url, isInSidepanel = false }) {

    const [activeRoute, setActiveRoute, { isLoading }] = useStorage(ACTIVE_ROUTE_STORAGE_KEY, null)
    const [tabData, setTabData] = useState(null)
    const [errorStack, setErrorStack] = useState("")

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                minWidth: 0,
                padding: 5,
                overflowX: 'hidden'
            }}
        >
            <AppContextProvider>
                <ConfigProvider theme={{ token: {}, components: { Card: { bodyPadding: 10 } } }}>
                    <ErrorBoundary
                        FallbackComponent={({ error }) => (
                            <Flex vertical gap={10} style={{ padding: 20 }}>
                                <Alert type="error" showIcon message="Something went wrong" description={error.message} />
                                <Typography.Text style={{ fontSize: 10 }}>{errorStack}</Typography.Text>
                            </Flex>
                        )}
                        onError={(error, info) => setErrorStack(info.componentStack)}
                    >
                        {!isInSidepanel && <Flex vertical>
                            <Tag color="green">
                                <Flex justify="space-between" align="center">
                                    Open this extension in sidepanel for persistent experience 😎
                                    <Button type="link" onClick={() => chrome.sidePanel.open({ tabId: tabData?.tabID })}>Open</Button>
                                </Flex>
                            </Tag>
                        </Flex>}

                        <Flex justify="space-between" style={{ marginTop: "10px", paddingInline: "5px" }}>
                            <Flex gap={10} align="center">
                                <Image src={logo} width={32} preview={false} />
                                <Flex vertical>
                                    <Badge count={`v${process.env.PLASMO_PUBLIC_VERSION}`} offset={[30, 20]} color="gold">
                                        <Title level={4} style={{ margin: 0 }}>UI Builder Dock</Title>
                                    </Badge>
                                    <Text>{tabData?.tabUrlBase}</Text>
                                </Flex>
                            </Flex>

                            <Flex>
                                {activeRoute ? (
                                    <Flex align="center" justify="center" gap={10}>
                                        <Button size="small" shape="circle" icon={<CloseOutlined />} onClick={() => setActiveRoute(null)} title="Close" />
                                    </Flex>
                                ) : (
                                    <Flex gap={10} vertical align="flex-end">

                                        <Flex gap={5}>

                                            <Menu
                                                tabData={tabData}
                                                onRouteClick={setActiveRoute}
                                            />

                                        </Flex>
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                        <Flex style={{ overflowX: "hidden", overflowY: "auto", paddingInline: "5px", marginTop: activeRoute ? "10px" : 0 }} flex={1}>
                            {(() => {
                                if (activeRoute === "settings") return <Settings />
                                if (activeRoute === "about") return <About />
                                if (activeRoute === "blog") return <Blog />
                                if (activeRoute === "search") return <Search />
                                if (activeRoute === "notes") return <Notes />
                                if (activeRoute === "workspaceInspector") return <WorkspaceInspector />
                                if (activeRoute === "compositionInspector") return <CompositionInspector />

                                return (
                                    <App
                                        url={url}
                                        showQuickLinks={activeRoute === "quicklinks"}
                                        onAppReady={(td) => setTabData(td)}
                                    />
                                )
                            })()}
                        </Flex>

                    </ErrorBoundary>
                </ConfigProvider>
            </AppContextProvider>
        </div>
    )

}

export default Wrapper
