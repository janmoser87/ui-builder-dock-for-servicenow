import React from 'react';
import { Collapse, Card, Typography, Tag, Empty, Flex, Descriptions, Divider, Space, Button, Badge } from 'antd';
import { AppstoreOutlined, ArrowRightOutlined, ArrowDownOutlined, LinkOutlined, ExportOutlined } from '@ant-design/icons';
const { Panel } = Collapse;
const { Text, Title } = Typography;

// Components
import JsonViewer from '~components/JsonViewer'

// Context
import { useAppContext } from "~contexts/AppContext";

const DataItem = ({ item }) => {

	const { tabData } = useAppContext();

	if (item.sections) {
		return item.sections.map((section, index) => (
			<SingleSection key={index} section={section} />
		))
	}

	return (
		<Flex gap={10} style={{ width: '100%' }}>
			{
				item.content?.type === 'DESCRIPTIONS' &&
				<Descriptions
					column={1}
					title={item.content.title}
					size='small'
					bordered
					items={item.content.items.map(item => {
						// We want to transform possible JSON values into JsonViewer component
						let content = item.children;
						let isJson = false;
						try {
							const parsed = JSON.parse(item.children);
							if (typeof parsed === 'object') {
								isJson = true;
								content = <JsonViewer json={parsed} collapsed={true} displayDataTypes={false} name={null} enableClipboard={false} />;
							}
						} catch (e) {
							// Not JSON, keep original content
						}
						return { ...item, children: content, isJson };
					})}
					labelStyle={{
						fontSize: '11px',
						color: '#888',
						width: '120px'
					}}

					contentStyle={{
						fontSize: '12px'
					}}

					style={{ marginTop: 0, flex: 1 }}
				/>
			}

			{Array.isArray(item) && (
				<Card size='small' styles={{body: {padding: 0}}} style={{ backgroundColor: '#fafafa', flex: 1}}>
					<Flex gap={5} flex={1}>
						{
							item.map((flowItem, index) => {

								const isActive = flowItem.active === 'true' || flowItem.active === true;
								const isDeactivated = flowItem.active === 'false' || flowItem.active === false;

								return (
									<Flex key={flowItem.sys_id || index} style={{ flex: 1 }}>
										<Card
											style={{ zoom: 0.75, flex: 1, borderLeft: isActive ? '4px solid #b7eb8f' : isDeactivated ? '4px solid #ffa39e' : undefined }}
											hoverable={flowItem.table && flowItem.sys_id}
											onClick={() => {
												if (flowItem.table && flowItem.sys_id) {
													chrome.tabs.create({ url: `https://${tabData.tabUrlBase}/${flowItem.table}.do?sys_id=${flowItem.sys_id}`, index: tabData.tab.index + 1 })
												}
											}}>
											<Flex vertical gap={5}>
												<Flex vertical>
													<Text strong style={{ fontSize: '12px', lineHeight: 1.2 }} ellipsis>
														{flowItem.name || flowItem.label || "\u00A0"}
													</Text>
													<Text type="secondary" style={{ fontSize: '10px' }} ellipsis>
														{flowItem.table || ""}
													</Text>
												</Flex>
												<Flex>
													{flowItem._renderProps && flowItem._renderProps.tags && flowItem._renderProps.tags.map((tag, index) => (
														<Tag key={index} color={tag.color} variant='filled'>
															{tag.text}
														</Tag>
													))}
												</Flex>
											</Flex>
										</Card>
										{index < item.length - 1 && (
											<ArrowRightOutlined style={{ color: '#bfbfbf', fontSize: '12px', flexShrink: 0, zoom: 0.7 }} />
										)}
									</Flex>
								)
							})
						}
					</Flex>
				</Card>
			)}

			{
				item.data && item.data.length > 0 && (
					<Collapse defaultActiveKey={['1']} style={{ minWidth: 0, flex: 1 }} size='small'>
						<Panel
							header={
								<Flex justify="space-between" align="center" style={{ flex: 1 }}>
									<Flex gap={10}>
										<Flex vertical gap={0}>
											<Text strong style={{ fontSize: '12px', lineHeight: 1.2 }} ellipsis>
												{item.name}
											</Text>
											<Text type="secondary" style={{ fontSize: '10px' }} ellipsis>
												{item.table}
											</Text>
										</Flex>
										<Flex>
											<Badge count={item.data.length} style={{ backgroundColor: '#22cb85ff' }} />
										</Flex>
									</Flex>
									<Flex>
										{
											item.table && item.sys_id &&
											<Button icon={<ExportOutlined />} size='small' type="text" onClick={(e) => {
												e.stopPropagation()
												chrome.tabs.create({ url: `https://${tabData.tabUrlBase}/${item.table}.do?sys_id=${item.sys_id}`, index: tabData.tab.index + 1 })
											}} />

										}
									</Flex>
								</Flex>
							}>
							<Flex vertical gap={5}>
								{item.data.map((nestedItem, index) => (
									<DataItem key={nestedItem.sys_id || index} item={nestedItem} />
								))}
							</Flex>
						</Panel>
					</Collapse>

				)
			}

		</Flex>
	);
};

const SingleSection = ({ section }) => {

	const { tabData } = useAppContext();

	if (!section) return null;

	const Header = () => (
		<Flex justify="space-between" align="center" style={{ width: '100%' }}>
			<Flex gap={10}>
				<Text>
					{section.label}
				</Text>
				{section.displayDataCount && <Badge count={section.data ? section.data.length : 0} style={{ backgroundColor: '#1890ff' }} />}
			</Flex>
			<Flex>
				{
					section.table && section.sys_id &&
					<Button icon={<ExportOutlined />} size='small' type="text" onClick={(e) => {
						e.stopPropagation()
						chrome.tabs.create({ url: `https://${tabData.tabUrlBase}/${section.table}.do?sys_id=${section.sys_id}`, index: tabData.tab.index + 1 })
					}} />

				}
			</Flex>
		</Flex>
	)

	if (!section.data || section.data.length === 0) {
		return (
			<Collapse size='small'>
				<Panel header={<Header />} >
					<Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</Panel>
			</Collapse>
		);
	}

	return (
		<Collapse>
			<Panel header={<Header />} >
				<Flex vertical gap={10}>
					{section.data.map((item, index) => (
						<DataItem key={item.sys_id || index} item={item} />
					))}
				</Flex>
			</Panel>
		</Collapse>
	);
};

// 3. Hlavní komponenta (Root)
const Profile = ({ sections }) => {
	if (!sections || sections.length === 0) {
		return <Empty description="No profile data available" />;
	}

	return (
		<Flex vertical gap={5}>
			{sections.map((section, index) => (
				<SingleSection key={index} section={section} />
			))}
		</Flex>
	);
};

export default Profile;