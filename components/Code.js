import { Typography } from "antd";
const {  Paragraph } = Typography;

export default function Code({ code }) {
    return (
        <Paragraph
            copyable
            style={{
                marginTop: 10,
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 8,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                fontSize: 12,
            }}
        >
            {code}
        </Paragraph>
    )
}