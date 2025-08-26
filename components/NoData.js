import React from "react";
import { Empty, Typography, theme } from "antd";

const { Text } = Typography;

export default function NoData({ sectionName = "data" }) {
	const { token } = theme.useToken();

	return (
		<Empty
				image={Empty.PRESENTED_IMAGE_SIMPLE}
				
				description={
					<div>
						<Text style={{fontSize: 12, color: "grey"}}>
							No {sectionName}
						</Text>
						
					</div>
				}
			/>
	);
}
