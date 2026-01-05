import React, { useEffect, useState } from "react"
import {
    Typography,
    List,
    Avatar,
    Alert,
    Button,
    Flex,
    theme
} from "antd"
import {
    ReadOutlined,
    RightOutlined,
    GlobalOutlined
} from "@ant-design/icons"

// Context
import { useAppContext } from "~contexts/AppContext"

const { Text, Title, Paragraph } = Typography

const BLOG_URL = "https://public-api.wordpress.com/rest/v1.1/sites/myuibcorner.com/posts/?number=15&fields=ID,URL,date,title,excerpt,featured_image"

// Helpers
function decodeEntities(s = "") {
    const el = document.createElement("textarea")
    el.innerHTML = s
    return el.value || el.textContent || ""
}

function stripHtml(html = "") {
    const el = document.createElement("div")
    el.innerHTML = html
    return (el.textContent || el.innerText || "").trim()
}

function fmtDate(iso) {
    try {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(new Date(iso))
    } catch {
        return iso
    }
}

export default function Blog() {
    const { token } = theme.useToken()
    const { loadedArticles, setLoadedArticles } = useAppContext()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const load = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(BLOG_URL, { headers: { Accept: "application/json" } })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()

            setLoadedArticles((data.posts || []).map(post => ({
                id: post.ID,
                url: post.URL,
                title: decodeEntities(post.title),
                date: post.date,
                excerpt: stripHtml(decodeEntities(post.excerpt)),
                image: post.featured_image
            })))

        } catch (e) {
            setError(e.message || "Loading error.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!loadedArticles) {
            load()
        }
    }, [])

    const hoverStyle = `
        .blog-list-item {
            transition: all 0.3s;
            cursor: pointer;
            border-radius: 8px;
            padding: 12px !important; /* Override default list padding */
        }
        .blog-list-item:hover {
            background-color: ${token.colorFillQuaternary};
        }
        .blog-list-item:hover .ant-typography-secondary {
            color: ${token.colorText};
        }
    `

    if (error) {
        return (
            <Flex align="center" justify="center" style={{ padding: 20, height: "100%" }}>
                <Alert
                    type="error"
                    message="Oops"
                    description="Unable to load blog articles."
                    action={<Button size="small" onClick={load}>Retry</Button>}
                />
            </Flex>
        )
    }

    return (
        <Flex vertical style={{ height: "100%", width: '100%', overflow: "hidden" }}>
            <style>{hoverStyle}</style>

            {/* Scrollable List Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
                <List
                    itemLayout="horizontal"
                    loading={loading}
                    dataSource={loadedArticles || []}
                    split={false}
                    renderItem={(item) => (
                        <List.Item
                            className="blog-list-item"
                            onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        shape="square"
                                        size={64}
                                        src={item.image}
                                        icon={<ReadOutlined />} // Fallback icon
                                        style={{
                                            backgroundColor: item.image ? 'transparent' : token.colorFillSecondary,
                                            borderRadius: 6
                                        }}
                                    />
                                }
                                title={
                                    <Flex justify="space-between" align="start">
                                        <Text strong style={{ fontSize: 14, lineHeight: 1.2, marginRight: 8 }}>
                                            {item.title}
                                        </Text>

                                        <Text type="secondary" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                                            {fmtDate(item.date)}
                                        </Text>
                                    </Flex>
                                }
                                description={
                                    <Paragraph
                                        type="secondary"
                                        ellipsis={{ rows: 2, expandable: false }}
                                        style={{ margin: 0, fontSize: 12 }}
                                    >
                                        {item.excerpt}
                                    </Paragraph>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>

            {/* Footer Action */}
            <Flex
                style={{
                    padding: "12px 16px",
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer
                }}
                justify="center"
            >
                <Button
                    type="primary"
                    ghost
                    icon={<GlobalOutlined />}
                    onClick={() => window.open("https://myuibcorner.com", "_blank", "noopener,noreferrer")}
                    block
                >
                    Visit blog for more...
                </Button>
            </Flex>
        </Flex>
    )
}