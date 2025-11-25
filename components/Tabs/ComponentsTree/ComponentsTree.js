import { Flex, Card, Typography, Button, Collapse, Popover, Alert } from "antd";
const { Text } = Typography;
import { useState } from "react";
import { ExportOutlined, EyeOutlined, SyncOutlined, CodeOutlined, ThunderboltOutlined } from '@ant-design/icons';


// Utils
import { generateComponentTree } from "./Utils";

// Context
import { useAppContext } from "~contexts/AppContext";

// Components
import JsonViewer from '~components/JsonViewer'

const TreeNodes = ({ nodes = [], onNodeClick = () => { } }) => {
    return (
        <Flex vertical gap={5}>
            {
                nodes.map((node, index) => {
                    return <TreeNode node={node} key={`${node.definition.id}_${index}`} onNodeClick={(sys_id) => {
                        onNodeClick(sys_id)
                    }} />
                })
            }
        </Flex>
    )
}

const TreeNode = ({ node, onNodeClick = () => { } }) => {

    const { children, extractedProperties, overrides, styles, isComponentWithComposition, ...nodeClean } = node

    let titleContent = (
        <Flex justify="space-between" align="center">
            <Flex vertical>
                <Flex gap={5} align="center">

                    {/* JSON Viewer */}
                    <Popover
                        content={<JsonViewer json={nodeClean} style={{ fontSize: '10px', maxHeight: '500px', width: '500px', overflowY: 'auto' }} displayDataTypes={false} />}
                        trigger="click"
                        placement="right"
                    >
                        <Button icon={<CodeOutlined />} size="small" style={{ transform: 'scale(0.8)', transformOrigin: 'left' }} />
                    </Popover>

                    {/* Title */}
                    <Text strong={isComponentWithComposition}>
                        {node.elementLabel}
                    </Text>

                    {/* Events flag */}
                    {extractedProperties.isHandlingEvents && (
                        <Popover
                            content={<Text style={{ fontSize: '11px' }}>There are events implemented on this component.</Text>}
                            placement="bottom"
                        >
                            <Button icon={<ThunderboltOutlined />} size="small" style={{ transform: 'scale(0.8)', transformOrigin: 'left' }} variant="solid" color="gold" />
                        </Popover>
                    )}

                    {/* Hidden flag */}
                    {extractedProperties.hasHideLogic && (
                        <Popover
                            content={<Text style={{ fontSize: '11px' }}>There show/hide logic implemented on this component.</Text>}
                            placement="bottom"
                        >
                            <Button icon={<EyeOutlined />} size="small" style={{ transform: 'scale(0.8)', transformOrigin: 'left' }} variant="solid" color="danger">
                                <Text style={{ fontSize: '11px', color: 'white' }}>
                                    {extractedProperties.hideLogicMethod}
                                </Text>
                            </Button>
                        </Popover>
                    )}
                </Flex>

                {/* Description */}
                {extractedProperties.description && (
                    <Text style={{ fontSize: '10px' }}>
                        {extractedProperties.description}
                    </Text>
                )}
            </Flex>

            {isComponentWithComposition && (
                <Flex>
                    <Button
                        icon={<ExportOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation()
                            onNodeClick(node.definition.id)
                        }}
                    />
                </Flex>
            )}
        </Flex>
    )

    let childrenContent = (
        node.children.length > 0 && (
            <Flex vertical style={{ paddingLeft: '24px', borderLeft: '1px dotted lightgrey' }}>
                <TreeNodes nodes={node.children} onNodeClick={onNodeClick} />
            </Flex>
        )
    )

    if (isComponentWithComposition) {
        return (
            <Collapse
                collapsible="icon"
                items={[
                    {
                        key: node.definition.id,
                        label: titleContent,
                        children: childrenContent
                    }
                ]}
            />
        )
    }

    return (
        <Flex style={{ width: '100%' }}>
            <Flex gap={10} vertical style={{ width: '100%' }}>
                {titleContent}
                {childrenContent}
            </Flex>
        </Flex>
    )
}

export default function ComponentsTree() {

    const { tabData, macroponentData, loadedTree, setLoadedTree } = useAppContext()
    const [loading, setLoading] = useState(false)

    const _generateTree = async () => {
        setLoading(true)
        let rootComposition;
        try {
            rootComposition = JSON.parse(macroponentData.composition);

            const tree = await generateComponentTree(rootComposition, tabData)
            setLoadedTree(tree)
        }
        catch (e) {
            return
        }
        finally {
            setLoading(false)
        }

    }

    const tree = loadedTree;

    return (
        <Flex vertical gap={5}>
            <Button type="primary" onClick={_generateTree} disabled={loading} loading={loading && { icon: <SyncOutlined spin /> }} >
                {!loading && 'Generate tree' || 'Loading macroponents'}
            </Button>
            {
                tree[0] && <Card>
                    <TreeNodes nodes={tree} onNodeClick={(sys_id) => {
                        let url = `https://${tabData.tabUrlBase}/sys_ux_macroponent.do?sys_id=${sys_id}`
                        chrome.tabs.create({ url, index: tabData.tab.index + 1, active: false })
                    }} />
                </Card>
            }
        </Flex>
    );

}