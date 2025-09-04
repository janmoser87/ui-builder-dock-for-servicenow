import { Flex, Typography, Col, Row, Card, Input, Tag, Button, Tooltip } from "antd";
const { Text } = Typography
import * as Icons from '@ant-design/icons';
import { useState } from "react";

// Context
import { useAppContext } from "~contexts/AppContext";

const links = [
    { name: "UI Builder", targetType: "direct", target: "/now/builder/ui/home", icon: "AppstoreOutlined", color: "#2980b9", group: "UI Builder", acceptsFilter: false },
    { name: "Experiences", targetType: "table", target: "sys_ux_page_registry", icon: "CompassOutlined", color: "#f59e0b", group: "UI Builder", acceptsFilter: true, filterFields: ["title", "path"] },
    { name: "Data Resources", targetType: "table", target: "sys_ux_data_broker", icon: "DatabaseOutlined", color: "#0ea5e9", group: "UI Builder", acceptsFilter: true, filterFields: ["name", "description", "sys_created_by"] },
    { name: "UX Script Includes", targetType: "table", target: "sys_ux_client_script_include", icon: "CodeOutlined", color: "#a855f7", group: "UI Builder", acceptsFilter: true, filterFields: ["name", "sys_created_by"], showNewButton: true },
    { name: "Declarative actions", targetType: "table", target: "sys_declarative_action_assignment", icon: "PlayCircleOutlined", color: "#f1c40f", group: "UI Builder", acceptsFilter: true, filterFields: ["label", "table", "sys_created_by"], showNewButton: true, newButtonTargetOverride: "/now/nav/ui/classic/params/target/wizard_view.do%3Fsys_target%3Dsys_declarative_action_assignment%26sysparm_stack%3Dsys_declarative_action_assignment_list.do%26sysparm_wizardAction%3Dsysverb_new%26sysparm_parent%3D3cf9b53fc334311073890cf6bb40ddfa" },
    { name: "UI Actions", targetType: "table", target: "sys_ui_action", icon: "DragOutlined", color: "#eab308", group: "UI Behavior", acceptsFilter: true, filterFields: ["name", "table", "sys_created_by"], showNewButton: true },
    { name: "Access Controls", targetType: "table", target: "sys_security_acl", icon: "LockOutlined", color: "#c0392b", group: "Security", acceptsFilter: true, filterFields: ["name", "description", "sys_created_by"], showNewButton: true },
    { name: "Script Includes", targetType: "table", target: "sys_script_include", icon: "FileTextOutlined", color: "#ec4899", group: "Backend", acceptsFilter: true, filterFields: ["name", "description", "sys_created_by"], showNewButton: true },
    { name: "Fix Scripts", targetType: "table", target: "sys_script_fix", icon: "ToolOutlined", color: "#ef4444", group: "Backend", acceptsFilter: true, filterFields: ["name", "description", "sys_created_by"], showNewButton: true },
    { name: "Events (🕒 15 mins)", targetType: "table", target: "sysevent", icon: "ClockCircleOutlined", color: "#3b82f6", group: "Monitoring", acceptsFilter: true, filterFields: ["name", "sys_created_by"], staticFilter: "sys_created_onONLast 15 minutes@javascript:gs.beginningOfLast15Minutes()@javascript:gs.endOfLast15Minutes()" },
    { name: "E-mails (🕒 15 mins)", targetType: "table", target: "sys_email", icon: "MailOutlined", color: "#d946ef", group: "Monitoring", acceptsFilter: true, filterFields: ["subject"], staticFilter: "sys_created_onONLast 15 minutes@javascript:gs.beginningOfLast15Minutes()@javascript:gs.endOfLast15Minutes()" },
    { name: "Sys log (🕒 15 mins)", targetType: "table", target: "syslog", icon: "FileSearchOutlined", color: "#64748b", group: "Monitoring", acceptsFilter: true, filterFields: ["message", "context_map"], staticFilter: "sys_created_onONLast 15 minutes@javascript:gs.beginningOfLast15Minutes()@javascript:gs.endOfLast15Minutes()" },
    { name: "Catalog Items", targetType: "table", target: "sc_cat_item", icon: "ShoppingCartOutlined", color: "#f97316", group: "Catalog", acceptsFilter: true, filterFields: ["name", "sys_created_by"], showNewButton: true },
    { name: "Sys Properties", targetType: "table", target: "sys_properties", icon: "SettingOutlined", color: "#8b5cf6", group: "System", acceptsFilter: true, filterFields: ["name", "description", "sys_created_by"], showNewButton: true },
    { name: "Update Sets", targetType: "table", target: "sys_update_set", icon: "ExportOutlined", color: "#6366f1", group: "Backend", acceptsFilter: true, filterFields: ["name", "description", "sys_created_by"], showNewButton: true },
    { name: "Studio", targetType: "direct", target: "/$studio.do", icon: "LayoutOutlined", color: "#10b981", group: "Dev Tools", acceptsFilter: false },
    { name: "Background scripts", targetType: "direct", target: "/now/nav/ui/classic/params/target/sys.scripts.modern.do", icon: "ConsoleSqlOutlined", color: "#22c55e", group: "Backend", acceptsFilter: false },
    { name: "Flow Designer", targetType: "direct", target: "/$flow-designer.do", icon: "BranchesOutlined", color: "#8e44ad", group: "Automation", acceptsFilter: false },

]


export default function QuickLinks() {

    const { tabData } = useAppContext()
    const [filter, setFilter] = useState("")

    /**
     * 
     * @param {*} item Clicked item
     * @param {*} enforcedField Indicates which field to filter by. If not provided, the filter will be applied to all fields.
     * @returns Sysparm query string for the filter
     * @description Generates a sysparm query string for the filter. If the filter starts with "*", it will be treated as a LIKE operator. Otherwise, it will be treated as a STARTSWITH operator.
     */
    const getSysparmQuery = (item, enforcedField) => {
        if (filter && item.acceptsFilter) {

            let operator = filter.startsWith("*") ? "LIKE" : "STARTSWITH"

            let query = item.filterFields
                .filter(field => !(!!enforcedField) || enforcedField == field)
                .map((field) => {
                    return `${field}${operator}${filter.replaceAll("*", "")}`
                }).join("^OR")

            if (item.staticFilter) {
                query = `${item.staticFilter}^${query}`
            }

            return `?sysparm_query=${encodeURIComponent(query)}&sysparm_list_header_search=true`
        }

        if (item.staticFilter) {
            return `?sysparm_query=${encodeURIComponent(item.staticFilter)}&sysparm_list_header_search=true`
        }

        return ""
    }

    function handleLinkClick(item, enforcedField) {
        let url = `https://${tabData.tabUrlBase}`
        if (item.targetType === "direct") {
            url += item.target
        }
        if (item.targetType === "table") {
            url += `/now/nav/ui/classic/params/target/${item.target}_list.do${getSysparmQuery(item, enforcedField)}`
        }
        chrome.tabs.create({ url, index: tabData.tab.index + 1, active: false })
    }

    function handleNewButtonClick(item) {
        let url = `https://${tabData.tabUrlBase}`
        if (item.newButtonTargetOverride) {
            url += item.newButtonTargetOverride
        } else {
            url += `/now/nav/ui/classic/params/target/${item.target}.do`
        }
        chrome.tabs.create({ url, index: tabData.tab.index + 1 })
    }

    return (
        <Flex style={{ paddingTop: 10 }} vertical gap={15}>
            <Flex>
                <Input
                    placeholder="Filter to apply after the click on the card 👇"
                    allowClear
                    style={{ width: "100%" }}
                    onChange={(e) => setFilter(e.target.value)}
                    value={filter}
                />

            </Flex>
            <Row gutter={[12, 12]}>
                {
                    links.map((item, index) => {

                        const CardIcon = Icons[item.icon]
                        const AddNewButtonIcon = Icons["PlusOutlined"]
                        return (
                            <Col key={index} span={8}>
                                <Card
                                    hoverable={(filter == "" || item.acceptsFilter) ? true : false}
                                    onClick={() => handleLinkClick(item)}
                                    style={{ opacity: (filter == "" || item.acceptsFilter) ? 1 : 0.2, cursor: "pointer", padding: 0, borderLeft: `4px solid ${item.color}`, backgroundColor: "#f8fafb", borderRadius: 4, height: "100%" }}
                                >
                                    <Flex vertical>
                                        
                                        <Flex align="center" gap={12} >
                                            <CardIcon style={{ fontSize: 18, color: item.color }} />
                                            <Text style={{ fontSize: 14 }}>{item.name}</Text>
                                        </Flex>

                                        {
                                                item.showNewButton &&
                                                <Flex>
                                                    <Tooltip title="Create new record" styles={{ body: { fontSize: 12, opacity: 0.6 } }}><Button
                                                        icon={<AddNewButtonIcon />}
                                                        shape="circle"
                                                        color="purple"
                                                        variant="filled"
                                                        style={{ position: "absolute", right: -15, top: -15, transform: "scale(0.6)" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleNewButtonClick(item)
                                                        }}
                                                    />
                                                    </Tooltip>
                                                </Flex>
                                            }

                                            {
                                                filter &&
                                                item.acceptsFilter &&
                                                <Flex style={{position: "absolute", width: "100%", bottom: -5, left: 0, right: 0, transform: "scale(0.8)"}} justify="end" gap={5}>
                                                    {
                                                        item.filterFields.map((field, index) => {
                                                            return (
                                                                <Tag.CheckableTag
                                                                    key={index}
                                                                    style={{ margin: 0, fontSize: 12 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleLinkClick(item, field)
                                                                    }}>{field}</Tag.CheckableTag>
                                                            )
                                                        })
                                                    }
                                                </Flex>
                                            }

                                    </Flex>
                                </Card>
                            </Col>
                        )
                    })
                }
            </Row>
        </Flex>
    )
}