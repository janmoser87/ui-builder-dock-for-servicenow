import { useEffect, useState } from "react"
import { Typography, List, Card, Skeleton, Alert, Button, Flex } from "antd"
import { ReadOutlined } from "@ant-design/icons"
const { Title, Text } = Typography

// Context
import { useAppContext } from "~contexts/AppContext";

const BLOG_URL = "https://public-api.wordpress.com/rest/v1.1/sites/myuibcorner.com/posts/?number=5&fields=ID,URL,date,title,excerpt,featured_image"

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
        return new Intl.DateTimeFormat("cs-CZ", {
            year: "numeric",
            month: "short",
            day: "2-digit"
        }).format(new Date(iso))
    } catch {
        return iso
    }
}

export default function Blog() {

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
                excerpt: stripHtml(decodeEntities(post.excerpt))
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

    return (
        <Flex vertical gap={5}>
            {!loading && !error && <Flex>
                <Button onClick={() => window.open("https://myuibcorner.com", "_blank", "noopener,noreferrer")} style={{ transform: "scale(0.85)", transformOrigin: "left center" }}>
                    Open My
                    UI Builder
                    Corner ☕
                </Button>
            </Flex>}

            {loading && <Skeleton active paragraph={{ rows: 4 }} />}
            
            {error && <Alert type="error" message="Unable to load blog articles" description={error} />}

            {!loading && !error &&
                <Flex vertical gap={5}>
                    {
                        (loadedArticles || []).map(article => {
                            return (
                                <Card
                                    key={article.ID}
                                    size="small"
                                    hoverable
                                    onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
                                    role="button"
                                    style={{ width: "100%" }}
                                >
                                    <Flex vertical gap={10}>
                                        <Flex vertical>
                                            <Title level={5} style={{ margin: 0, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {article.title}
                                            </Title>
                                            <Text type="secondary" style={{ whiteSpace: "nowrap", fontSize: "12px" }}>{fmtDate(article.date)}</Text>
                                        </Flex>
                                        {article.excerpt && <Text type="secondary" style={{
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            fontSize: "11px"
                                        }}>
                                            {article.excerpt}
                                        </Text>}
                                    </Flex>
                                </Card>
                            )
                        })
                    }
                </Flex>
            }
        </Flex>
    )
}
