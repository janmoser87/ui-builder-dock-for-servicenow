import { useState, useEffect } from "react";
import { SettingOutlined, ThunderboltOutlined, BranchesOutlined, LinkOutlined } from "@ant-design/icons";
import { Typography, Collapse, Tag, Table, Space, Card, Flex, Alert, Empty, Badge, Button, Input, Spin } from "antd";
const { Text, Link } = Typography;

import { Storage } from "@plasmohq/storage"
const storage = new Storage({ area: "local" })
const storage_prefix = "lastSearchResults_"

// Utils
import { fetchTableData, getGck } from "scripts/Utils";
import { getTypeColor } from "./Tabs/PageProperties/Utils";

// Context
import { useAppContext } from "~contexts/AppContext";

const searchSources = {
    experience: {
        name: "Experience",
        search: async (tabUrlBase, g_ck, searchText) => {

            // Return var init
            let stats = []
            let results = []

            // Experience
            const [expError, expData] = await fetchTableData(tabUrlBase, "sys_ux_page_registry", g_ck, `sysparm_query=titleLIKE${encodeURIComponent(searchText)}^admin_panelISNOTEMPTY`)

            if (expError) {
                throw new Error(expError)
            }

            if (!expData?.[0]) {
                return { stats: [], results: [] }
            }

            stats.push("Experiences: " + expData.length)

            // We will be searching for Routes and Screens having App Configuration field connected to Experiences found.
            const appConfigIDs = [...new Set(expData.map(experience => experience.admin_panel.value))]

            // Routes
            const [routesError, routesData] = await fetchTableData(tabUrlBase, "sys_ux_app_route", g_ck, `sysparm_query=app_configIN${appConfigIDs}^parent_macroponent_composition_element_id=NULL^screen_typeISNOTEMPTY`)
            if (routesError) {
                throw new Error(routesError)
            }

            stats.push("Routes: " + routesData.length)

            // Screens
            const [screensError, screensData] = await fetchTableData(tabUrlBase, "sys_ux_screen", g_ck, `sysparm_query=app_configIN${appConfigIDs}^screen_typeISNOTEMPTY`)
            if (screensError) {
                throw new Error(screensError)
            }

            stats.push("Screens: " + screensData.length)

            // Scopes 
            const scopeIDs = [...new Set(expData.map(_experience => _experience.sys_scope?.value).filter(Boolean))]
            const [scopesError, scopesData] = await fetchTableData(tabUrlBase, "sys_scope", g_ck, `sysparm_query=sys_idIN${scopeIDs}`)
            if (scopesError) {
                throw new Error(scopesError)
            }

            stats.push("Scopes: " + scopesData.length)

            /** 
             * Building final structure: 
             */
            results = expData.map((experience) => {
                const expScope = scopesData.find(scope => scope.sys_id === experience.sys_scope?.value)
                const expRoutes = routesData.filter((route) => route.app_config.value === experience.admin_panel.value)
                return {
                    ...experience,
                    _scope: expScope,
                    _routes: expRoutes.map((route) => ({
                        ...route,
                        _screens: screensData.filter(
                            (screen) =>
                                screen.screen_type?.value &&
                                route.screen_type?.value &&
                                screen.screen_type.value ===
                                route.screen_type.value)
                    }))
                }
            })

            return { stats, results }
        },
        render: (tabUrlBase, searchResults) => {

            const columns = [
                {
                    title: (
                        <Space>
                            <BranchesOutlined style={{ color: "#1677ff" }} />
                            <Text strong>Route</Text>
                        </Space>
                    ),
                    dataIndex: "name",
                    key: "name",
                    render: (v, r) => {

                        let screensCount = r._screens?.length || 0
                        if (screensCount === 1) {
                            screensCount = 0 // Setting to 0 so badge won't show
                        }

                        return (
                            <Badge size="small" count={screensCount} color="green">
                                <Text strong>
                                    {v}
                                </Text>
                            </Badge>
                        )

                    }
                },
                {
                    title: (
                        <Space>
                            <LinkOutlined style={{ color: "#52c41a" }} />
                            <Text strong>Base path</Text>
                        </Space>
                    ),
                    dataIndex: "route_type",
                    key: "route_type",
                    render: (v) => <Tag>/{v}/</Tag>,
                    width: 140
                }
            ];

            return searchResults.map((exp, idx) => {
                return (
                    <Card key={idx} size="small" styles={{ body: { padding: 0 } }}>
                        <Collapse
                            collapsible="icon"
                            items={[
                                {
                                    key: "exp",
                                    label: (
                                        <Flex vertical gap={5}>
                                            <Flex justify="space-between" align="flex-start">
                                                <Link onClick={() => { chrome.tabs.create({ url: `https://${tabUrlBase}/now/builder/ui/experience/${exp.sys_id}`, active: false }) }} strong>
                                                    {exp.title}
                                                </Link>
                                                <Tag>{exp._scope?.name || "Unknown"}</Tag>
                                            </Flex>
                                            <Flex>
                                                <Text type="secondary">{`Created by ${exp.sys_created_by}`}</Text>
                                            </Flex>
                                        </Flex>
                                    ),
                                    children: (
                                        <Table
                                            size="small"
                                            rowKey={(r) => r.sys_id || r.name}
                                            columns={columns}
                                            dataSource={exp._routes || []}
                                            pagination={false}
                                            sortDirections={[]}
                                            expandable={{
                                                expandRowByClick: true,
                                                expandedRowRender: (route) => {
                                                    const screenColumns = [
                                                        {
                                                            title: <Text strong style={{ color: "gray", fontSize: 12 }}>Screen</Text>,
                                                            dataIndex: "name",
                                                            key: "name",
                                                            render: (v, screen) => (
                                                                <Link onClick={(e) => { e.stopPropagation(); chrome.tabs.create({ url: `https://${tabUrlBase}/now/builder/ui/edit/experience/${exp.sys_id}/${route.sys_id}/${screen.sys_id}`, active: false }) }} style={{ fontSize: 12 }}>
                                                                    {v}
                                                                </Link>
                                                            )
                                                        },
                                                        {
                                                            title: <Text strong style={{ color: "gray", fontSize: 12 }}>Order</Text>,
                                                            dataIndex: "order",
                                                            key: "order",
                                                            render: (v) => <Text style={{ fontSize: 12 }}>{v}</Text>,
                                                            width: 100,

                                                        }
                                                    ];


                                                    return (
                                                        <Table
                                                            className="vtop"
                                                            size="small"
                                                            rowKey={(s) => s.sys_id || s.name}
                                                            columns={screenColumns}
                                                            dataSource={
                                                                route._screens
                                                                    ?.slice()
                                                                    .sort((a, b) => (parseInt(a.order, 10) || 0) - (parseInt(b.order, 10) || 0))
                                                            }
                                                            pagination={false}
                                                        />
                                                    );
                                                }


                                            }}
                                        />
                                    )
                                }
                            ]}
                        />
                    </Card>
                );
            })
        }
    },
    pc: {
        name: "Page collections",
        search: async (tabUrlBase, g_ck, searchText) => {

            // Return var init
            let stats = []
            let results = []

            // Extension point
            const [extpointError, extpointData] = await fetchTableData(tabUrlBase, "sys_ux_extension_point", g_ck, `sysparm_query=nameLIKE${encodeURIComponent(searchText)}`)

            if (extpointError) {
                throw new Error(extpointError)
            }

            if (!extpointData?.[0]) {
                return { stats: [], results: [] }
            }

            stats.push("Page collections: " + extpointData.length)

            // Routes
            const pageCollectionIDs = extpointData.map(pageCollection => pageCollection.sys_id)
            const [routesError, routesData] = await fetchTableData(tabUrlBase, "sys_ux_app_route", g_ck, `sysparm_query=extension_pointIN${pageCollectionIDs}^parent_macroponent_composition_element_id=NULL^screen_typeISNOTEMPTY`)
            if (routesError) {
                throw new Error(routesError)
            }

            stats.push("Routes: " + routesData.length)

            // Screens
            const screenCollectionIDs = [...new Set(routesData.map(route => route.screen_type.value))]
            const [screensError, screensData] = await fetchTableData(tabUrlBase, "sys_ux_screen", g_ck, `sysparm_query=screen_typeIN${screenCollectionIDs}^screen_typeISNOTEMPTY`)
            if (screensError) {
                throw new Error(screensError)
            }

            stats.push("Screen: " + screensData.length)

            // Scopes 
            const scopeIDs = [...new Set(extpointData.map(_pageCollection => _pageCollection.sys_scope?.value).filter(Boolean))]
            const [scopesError, scopesData] = await fetchTableData(tabUrlBase, "sys_scope", g_ck, `sysparm_query=sys_idIN${scopeIDs}`)
            if (scopesError) {
                throw new Error(scopesError)
            }

            stats.push("Scopes: " + scopesData.length)

            /** 
             * Building final structure: 
             */
            results = extpointData.map((extensionPoint) => {
                const collScope = scopesData.find(scope => scope.sys_id === extensionPoint.sys_scope?.value)
                const collRoutes = routesData.filter((route) => route.extension_point?.value === extensionPoint.sys_id)
                return {
                    ...extensionPoint,
                    _scope: collScope,
                    _routes: collRoutes.map((route) => ({
                        ...route,
                        _screens: screensData.filter(
                            (screen) =>
                                screen.screen_type?.value &&
                                route.screen_type?.value &&
                                screen.screen_type.value ===
                                route.screen_type.value)
                    }))
                }
            })

            return { stats, results }
        },
        render: (tabUrlBase, searchResults) => {

            const columns = [
                {
                    title: (
                        <Space>
                            <BranchesOutlined style={{ color: "#1677ff" }} />
                            <Text strong>Route</Text>
                        </Space>
                    ),
                    dataIndex: "name",
                    key: "name",
                    render: (v, r) => {

                        let screensCount = r._screens?.length || 0
                        if (screensCount == 1) {
                            screensCount = 0 // Setting to 0 so badge won't show
                        }

                        return (
                            <Badge size="small" count={screensCount} color="green">
                                <Text strong>
                                    {v}
                                </Text>
                            </Badge>
                        )

                    }
                },
                {
                    title: (
                        <Space>
                            <LinkOutlined style={{ color: "#52c41a" }} />
                            <Text strong>Base path</Text>
                        </Space>
                    ),
                    dataIndex: "route_type",
                    key: "route_type",
                    render: (v) => <Tag>/{v}/</Tag>,
                    width: 140
                }
            ];

            return searchResults.map((pageCollection, idx) => {
                const routes = pageCollection._routes || [];
                return (
                    <Card key={idx} size="small" styles={{ body: { padding: 0 } }}>
                        <Collapse
                            collapsible="icon"
                            items={[
                                {
                                    key: "pageCollection",
                                    label: (
                                        <Flex vertical gap={5}>
                                            <Flex justify="space-between">
                                                <Link onClick={() => { chrome.tabs.create({ url: `https://${tabUrlBase}/now/builder/ui/pc/${pageCollection.sys_id}`, active: false }) }} strong>
                                                    {pageCollection.name}
                                                </Link>
                                                <Tag>{pageCollection._scope?.name || "Unknown"}</Tag>
                                            </Flex>
                                            <Flex>
                                                <Text type="secondary">{`Created by ${pageCollection.sys_created_by}`}</Text>
                                            </Flex>
                                        </Flex>
                                    ),
                                    children: (
                                        <Table
                                            className="vtop"
                                            size="small"
                                            rowKey={(r) => r.sys_id || r.name}
                                            columns={columns}
                                            dataSource={routes}
                                            pagination={false}
                                            sortDirections={[]}
                                            expandable={{
                                                expandRowByClick: true,
                                                expandedRowRender: (route) => {

                                                    const screenColumns = [
                                                        {
                                                            title: <Text strong style={{ color: "gray", fontSize: 12 }}>Screen</Text>,
                                                            dataIndex: "name",
                                                            key: "name",
                                                            render: (v, screen) => (
                                                                <Flex vertical>
                                                                    <Link onClick={(e) => { e.stopPropagation(); chrome.tabs.create({ url: `https://${tabUrlBase}/now/builder/ui/edit/pc/${pageCollection.sys_id}/${route.sys_id}/${screen.sys_id}`, active: false }) }} style={{ fontSize: 12 }}>
                                                                        {v}
                                                                    </Link>
                                                                </Flex>
                                                            )
                                                        },
                                                        {
                                                            title: <Text strong style={{ color: "gray", fontSize: 12 }}>Order</Text>,
                                                            dataIndex: "order",
                                                            key: "order",
                                                            render: (v) => <Text style={{ fontSize: 12 }}>{v}</Text>,
                                                            width: 100,
                                                        }
                                                    ];


                                                    return (
                                                        <Table
                                                            className="vtop"
                                                            size="small"
                                                            rowKey={(s) => s.sys_id || s.name}
                                                            columns={screenColumns}
                                                            dataSource={
                                                                route._screens
                                                                    ?.slice()
                                                                    .sort((a, b) => (parseInt(a.order, 10) || 0) - (parseInt(b.order, 10) || 0))
                                                            }
                                                            pagination={false}
                                                        />
                                                    );
                                                }


                                            }}
                                        />
                                    )
                                }
                            ]}
                        />
                    </Card>
                );
            })
        }
    },
    component: {
        name: "Components",
        search: async (tabUrlBase, g_ck, searchText) => {

            // Return var init
            let stats = []
            let results = []

            // Getting Toolbox of components
            const [toolboxError, toolboxData] = await fetchTableData(tabUrlBase, "sys_uib_toolbox_component", g_ck, `sysparm_query=labelLIKE${encodeURIComponent(searchText)}^macroponentISNOTEMPTY`)

            if (toolboxError) {
                throw new Error(toolboxError)
            }

            if (!toolboxData?.[0]) {
                return { stats: [], results: [] };
            }

            stats.push("Toolboxes: " + toolboxData.length)

            // Macroponents
            const macroponentIDs = [...new Set(toolboxData.map(component => component.macroponent.value))]
            const [macropoError, macropoData] = await fetchTableData(tabUrlBase, "sys_ux_macroponent", g_ck, `sysparm_query=sys_idIN${macroponentIDs}`)
            if (macropoError) {
                throw new Error(macropoError)
            }

            stats.push("Macroponents: " + macropoData.length)

            // Metadata
            const [metadataError, metadataData] = await fetchTableData(tabUrlBase, "sys_cb_metadata", g_ck, `sysparm_query=macroponentIN${macroponentIDs}`)
            if (metadataError) {
                throw new Error(metadataError)
            }

            stats.push("Metadata: " + metadataData.length)

            // Scopes 
            const scopeIDs = [...new Set(toolboxData.map(component => component.sys_scope?.value).filter(Boolean))]
            const [scopesError, scopesData] = await fetchTableData(tabUrlBase, "sys_scope", g_ck, `sysparm_query=sys_idIN${scopeIDs}`)
            if (scopesError) {
                throw new Error(scopesError)
            }

            stats.push("Scopes: " + scopesData.length)

            // Dispatched events
            const eventIDs = [...new Set(macropoData.flatMap(macroponent => macroponent.dispatched_events.split(",")).filter(Boolean))]
            const [eventsError, eventsData] = await fetchTableData(tabUrlBase, "sys_ux_event", g_ck, `sysparm_query=sys_idIN${eventIDs}`)
            if (eventsError) {
                throw new Error(eventsError)
            }

            stats.push("Dispatched events: " + eventsData.length)

            /** 
             * Building final structure: 
             */
            results = toolboxData.map((toolboxRecord) => {
                const macroponent = macropoData.find(macroponent => toolboxRecord.macroponent.value === macroponent.sys_id)
                const scope = scopesData.find(scope => scope.sys_id === toolboxRecord.sys_scope?.value)
                const metadata = metadataData.find(metadata => metadata.macroponent?.value && macroponent?.sys_id && metadata.macroponent.value === macroponent.sys_id)

                let properties = []
                try {
                    properties = JSON.parse(macroponent.props)
                }
                catch (e) { }

                let dispatchedEventIDs = macroponent?.dispatched_events.split(",") || []
                let dispatchedEvents = eventsData.filter(event => dispatchedEventIDs.includes(event.sys_id))

                return {
                    ...toolboxRecord,
                    _macroponent: macroponent,
                    _metadata: metadata,
                    _scope: scope,
                    _properties: properties,
                    _dispatchedEvents: dispatchedEvents
                }
            })

            return { stats, results }
        },
        render: (tabUrlBase, searchResults) => {

            const columns = [
                {
                    title: (
                        <Space>
                            <SettingOutlined style={{ color: "#1890ff" }} />
                            <Text strong>Properties</Text>
                        </Space>
                    ),
                    dataIndex: "_properties",
                    key: "_properties",
                    render: (_properties, r) => {
                        return (
                            <Flex vertical gap={10}>
                                {
                                    _properties.map((property, index) => {
                                        return (
                                            <Flex vertical key={index}>
                                                <Flex gap={5}>
                                                    <Text strong>{property.name}</Text>
                                                    <Tag color={getTypeColor(property.fieldType)}>{property.fieldType}</Tag>
                                                </Flex>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{property.description}</Text>
                                            </Flex>
                                        )
                                    })
                                }
                            </Flex>
                        )
                    }
                },
                {
                    title: (
                        <Space>
                            <ThunderboltOutlined style={{ color: "orange" }} />
                            <Text strong>Dispatched events</Text>
                        </Space>
                    ),
                    dataIndex: "_dispatchedEvents",
                    key: "_dispatchedEvents",
                    render: (_dispatchedEvents, r) => {
                        return (
                            <Flex vertical gap={10}>
                                {
                                    _dispatchedEvents.map((event, index) => {
                                        return (
                                            <Flex vertical key={index}>
                                                <Flex gap={5}>
                                                    <Text strong>{event.event_name}</Text>
                                                </Flex>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{event.description}</Text>
                                            </Flex>
                                        )
                                    })
                                }
                            </Flex>
                        )
                    },
                    width: "50%"
                },
            ];

            return searchResults.map((component, idx) => {

                // Missing Metadata = it's not "Component builder" component
                const compatibleWithComponentBuilder = !!component._metadata

                return (
                    <Card key={idx} size="small" styles={{ body: { padding: 0 } }}>
                        <Collapse
                            collapsible="icon"
                            items={[
                                {
                                    key: "component",
                                    label: (
                                        <Flex vertical gap={5}>
                                            <Flex justify="space-between" align="flex-start">
                                                <Link disabled={!compatibleWithComponentBuilder} onClick={() => { 
                                                    if (!compatibleWithComponentBuilder) return; 
                                                    chrome.tabs.create({ url: `https://${tabUrlBase}/now/builder/ui/component/${component._metadata.sys_id}`, active: false }) }} 
                                                strong>
                                                    {component.label}
                                                </Link>
                                                <Tag>{component._scope?.name || "Unknown"}</Tag>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text type="secondary">{`Created by ${component.sys_created_by}`}</Text>
                                                {!compatibleWithComponentBuilder &&
                                                    <Tag color="#f50">
                                                        Not editable in UI Builder
                                                    </Tag>}
                                            </Flex>
                                        </Flex>
                                    ),
                                    children: (
                                        <Table
                                            className="vtop"
                                            size="small"
                                            rowKey={(r) => r.sys_id || r.name}
                                            columns={columns}
                                            dataSource={[component]}
                                            pagination={false}
                                        />
                                    )
                                }
                            ]}
                        />
                    </Card>
                )
            })
        }
    }
}

export default function Search() {
    const { tabData } = useAppContext()

    const [selectedSearchSource, setSelectedSearchSource] = useState("experience")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [stats, setStats] = useState([])

    const getLastSearchResults = async () => {
        let lastSearchResults = await storage.get(`${storage_prefix}${selectedSearchSource}`) || { stats: [], results: [] } 
        setStats(lastSearchResults.stats)
        setSearchResults(lastSearchResults.results)
    }

    const setLastSearchResults = async (lastSearchResults) => {
        await storage.set(`${storage_prefix}${selectedSearchSource}`, lastSearchResults)
    }

    useEffect(() => {
        getLastSearchResults()
    }, [selectedSearchSource])

    const doSearch = async (searchText) => {
        try {
            setLoading(true)

            // Getting access token
            const g_ck = await getGck()

            // Search
            let { stats, results } = await searchSources[selectedSearchSource].search(tabData.tabUrlBase, g_ck, searchText)

            setStats(stats)
            setSearchResults(results)
            setLastSearchResults({ stats, results })

        } catch (e) {
            setError(e?.message || "Unknown error");
            setSearchResults([])
        } finally {
            setLoading(false)
        }
    }

    if (error) {
        return (
            <Flex justify="center" style={{ width: "100%", paddingTop: 20 }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ width: "100%" }}
                />
            </Flex>
        );
    }

    return (
        <Flex vertical gap={5} flex={1}>
            <Flex vertical gap={10}>
                <Flex gap={5}>
                    {
                        Object.entries(searchSources).map(([key, searchSource]) => {
                            return (
                                <Button key={key} type={key === selectedSearchSource ? "primary" : "default"} onClick={() => {
                                    setStats([])
                                    setSearchResults([])
                                    setSelectedSearchSource(key)
                                }
                                }>
                                    {searchSource.name}
                                </Button>
                            )
                        })
                    }
                </Flex>
                <Flex>
                    <Input.Search
                        placeholder="Search"
                        allowClear
                        size="large"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        enterButton={
                            <Button
                                type="primary"
                                disabled={searchText.trim().length < 3}
                            >
                                Search
                            </Button>
                        }
                        onSearch={(value) => {
                            const q = value.trim();
                            if (q.length < 3) return;
                            doSearch(q);
                        }}
                    />
                </Flex>
            </Flex>



            {loading && <Flex justify="center" align="center" style={{ width: "100%", marginTop: 20 }}><Spin /></Flex>}

            {!loading &&
                searchResults[0] &&
                <Collapse
                    bordered={false}
                    items={[
                        {
                            key: "overview",
                            label: "Overview",
                            children: (
                                <Flex gap={5}>
                                    {
                                        stats.map((number, index) => {
                                            return (
                                                <Flex key={index}>
                                                    <Tag>{number}</Tag>
                                                </Flex>
                                            )
                                        })
                                    }
                                </Flex>
                            )
                        }
                    ]}
                />}

            {!loading && searchSources[selectedSearchSource].render(tabData.tabUrlBase, searchResults)}

            {(!loading && (!searchResults || searchResults.length === 0)) && <Empty description=" " />}
        </Flex>
    )
}
