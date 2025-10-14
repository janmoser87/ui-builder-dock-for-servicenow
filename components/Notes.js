// Notes.jsx — vertical sidepanel (Ant Design, English UI) with Checkbox "Done"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Storage } from "@plasmohq/storage"
import { Button, Input, List, Typography, Empty, Popconfirm, Space, Divider, theme, Tooltip, Checkbox, Flex, message, Modal } from "antd"
import { PlusOutlined, DeleteOutlined, SearchOutlined, FileTextOutlined, ArrowLeftOutlined, ExclamationCircleOutlined, DownloadOutlined, UploadOutlined, } from "@ant-design/icons"

const { Text, Title } = Typography
const storage = new Storage({ area: "local" })
const STORAGE_KEY = "notes"

const now = () => Date.now()
const uid = () => `${now()}_${Math.random().toString(36).slice(2, 8)}`
const debounce = (fn, wait = 300) => {
    let t
    return (...args) => {
        clearTimeout(t)
        t = setTimeout(() => fn(...args), wait)
    }
}

export default function Notes() {
    const { token } = theme.useToken()
    const [notes, setNotes] = useState([])
    const [activeId, setActiveId] = useState(null)
    const [filter, setFilter] = useState("")
    const [loading, setLoading] = useState(true)
    const [mode, setMode] = useState("list") // "list" | "edit"
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    const persist = useMemo(
        () =>
            debounce(async (payload) => {
                try {
                    await storage.set(STORAGE_KEY, payload)
                } catch (err) {
                    console.error("[Notes] persist failed", err.message)
                    message.error(`[Notes] persist failed: ${err.message}`);
                }
            }, 250),
        []
    )

    useEffect(() => {
        ; (async () => {
            try {
                const data = (await storage.get(STORAGE_KEY)) || []
                setNotes(Array.isArray(data) ? data : [])
                setActiveId(null) // start in list
            } catch (e) {
                console.error("[Notes] load failed", e)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const addNote = () => {
        const note = {
            id: uid(),
            text: "",
            createdAt: now(),
            updatedAt: now(),
            done: false,
            doneAt: null
        }
        const notesUpdated = [note, ...notes]
        setNotes(notesUpdated)
        persist(notesUpdated)
        setActiveId(note.id)        
        setMode("edit")
        setTimeout(() => textareaRef.current?.focus(), 0)
    }

    const deleteNote = (noteID) => {
        const notesUpdated = notes.filter((note) => note.id !== noteID)
        setNotes(notesUpdated)
        persist(notesUpdated)
        setActiveId(null)
        setMode("list")
    }

    const toggleDone = (noteID, checked) => {
        const notesUpdated = notes.map(note => {
            if (note.id === noteID) {
                return {
                    ...note,
                    done: checked,
                    doneAt: checked ? now() : null,
                    updatedAt: now()
                }
            }
            return note
        })
        setNotes(notesUpdated)
        persist(notesUpdated)
    }

    const updateActiveText = (text) => {
        const notesUpdated = notes.map(note => {
            if (note.id === activeId) {
                return {
                    ...note,
                    text, 
                    updatedAt: now()
                }
            }
            return note
        })
        setNotes(notesUpdated)
        persist(notesUpdated)
    }

    const activeNote = useMemo(
        () => notes.find((n) => n.id === activeId) || null,
        [notes, activeId]
    )

    const filtered = useMemo(() => {
        const q = filter.trim().toLowerCase()
        const base = q ? notes.filter((n) => n.text.toLowerCase().includes(q)) : notes
        return base
    }, [notes, filter])

    const titleFromText = (title) => {
        const line = (title || "").trim().split("\n")[0] || "New note"
        return line.length > 48 ? line.slice(0, 48) + "…" : line
    }

    const metaFromNote = (note) => {
        const when = new Date(note.updatedAt).toLocaleString()
        return `${note.text.length} chars • ${when}`
    }

    const handleExport = async () => {
        try {
            // Parsing
            const data = (await storage.get(STORAGE_KEY)) || []
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })

            // Exporting
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `uib-notes-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)

            message.success('Export successful.');
        } catch (err) {
            console.error(err)
            message.error(`Export error: ${err.message}`);
        }
    }

    const triggerImport = () => fileInputRef.current?.click()

    const handleImport = (e) => {

        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return
        const reader = new FileReader()
        reader.onload = async () => {
            try {

                // Parsing
                const parsed = JSON.parse(String(reader.result || "[]"))
                if (!Array.isArray(parsed)) throw new Error("Invalid JSON format")

                // Normalizing
                const notesImported = parsed.map(normalizeImport)

                // Confirmation modal
                const inst = Modal.confirm({
                    title: "Replace all notes?",
                    icon: <ExclamationCircleOutlined />,
                    content: "Your current notes will be overwritten.",
                    okText: "Replace",
                    cancelText: "Cancel",
                    onOk: async () => {

                        // Importing
                        setNotes(notesImported)
                        setActiveId(notesImported[0]?.id ?? null)
                        await storage.set(STORAGE_KEY, notesImported)
                        inst.destroy()

                        message.success('Import successful.');
                    }
                })
            } catch (err) {
                console.error(err)
                message.error(`Import error: ${err.message}`);
            }
        }
        reader.readAsText(file)
    }

    const normalizeImport = (importedNote) => ({
        id: importedNote.id ?? uid(),
        text: String(importedNote.text ?? ""),
        createdAt: Number(importedNote.createdAt ?? now()),
        updatedAt: Number(importedNote.updatedAt ?? now()),
        done: !!importedNote.done,
        doneAt: importedNote.done ? Number(importedNote.doneAt ?? now()) : null
    })

    return (
        <Flex flex={1}>
            <Flex vertical flex={1} gap={10}>

                {/* Top bar */}
                <Flex>
                    {mode === "edit" ? (
                        <Space size={8} align="center" style={{ width: "100%", justifyContent: "space-between" }}>
                            <Space size={8}>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => setMode("list")}
                                    type="text"
                                />
                                <Title level={5} style={{ margin: 0 }}>
                                    {activeNote ? titleFromText(activeNote.text) : "Edit note"}
                                </Title>
                            </Space>
                            {activeNote && (
                                <Space>
                                    <Tooltip title={activeNote.done ? "Mark as not done" : "Mark as done"}>
                                        <Checkbox
                                            checked={!!activeNote.done}
                                            onChange={(e) => toggleDone(activeNote.id, e.target.checked)} />
                                    </Tooltip>
                                    <Popconfirm
                                        title="Delete this note?"
                                        okText="Delete"
                                        cancelText="Cancel"
                                        onConfirm={() => deleteNote(activeNote.id)}>
                                        <Button icon={<DeleteOutlined />} danger />
                                    </Popconfirm>
                                </Space>
                            )}
                        </Space>
                    ) : (
                        <Space.Compact style={{ width: "100%" }}>
                            <Input
                                allowClear
                                prefix={<SearchOutlined />}
                                placeholder="Search…"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={addNote}
                                style={{ flex: "0 0 auto" }}>
                                New
                            </Button>
                            <Button icon={<DownloadOutlined />} onClick={triggerImport} title="Import" />
                            <Button icon={<UploadOutlined />} onClick={handleExport} title="Export" />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/json,.json"
                                style={{ display: "none" }}
                                onChange={handleImport}
                            />
                        </Space.Compact>
                    )}
                </Flex>

                {/* Content - List*/}
                {mode === "list" &&
                    <Flex flex={1}>

                        {/** Empty */}
                        {filtered.length === 0 &&
                            <Flex flex={1} justify="center">
                                <Empty
                                    description={filter ? "No results" : "No notes yet"}
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            </Flex>
                        }

                        {/** With data */}
                        {filtered.length > 0 &&
                            <Flex flex={1} vertical>
                                <List
                                    size="small"
                                    loading={loading}
                                    dataSource={filtered}
                                    rowKey={(item) => item.id}
                                    renderItem={(item) => {
                                        const isActive = item.id === activeId
                                        return (
                                            <List.Item
                                                style={{
                                                    paddingInline: 8,
                                                    paddingBlock: 6,
                                                    borderBlockEnd: `1px solid ${token.colorSplit}`,
                                                    background: item.id === activeId ? token.colorFillTertiary : undefined,
                                                    opacity: item.done ? 0.5 : 1
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 8 }}>
                                                    {/* Left clickable part */}
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        style={{ flex: 1, cursor: "pointer" }}
                                                        onClick={() => {
                                                            setActiveId(item.id)
                                                            setMode("edit")
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                setActiveId(item.id); setMode("edit")
                                                            }
                                                        }}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<FileTextOutlined />}
                                                            title={
                                                                <Text
                                                                    strong
                                                                    ellipsis
                                                                    style={{
                                                                        width: 180,
                                                                        textDecoration: item.done ? "line-through" : "none",
                                                                        color: item.done ? token.colorTextTertiary : undefined
                                                                    }}
                                                                >
                                                                    {titleFromText(item.text)}
                                                                </Text>
                                                            }
                                                            description={<Text type="secondary" style={{ fontSize: 12 }}>{metaFromNote(item)}</Text>}
                                                        />
                                                    </div>

                                                    {/* Right non-clickable part */}
                                                    <Space
                                                        onClick={(e) => e.stopPropagation()}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                    >
                                                        <Tooltip title={item.done ? "Mark as not done" : "Mark as done"}>
                                                            <Checkbox
                                                                checked={!!item.done}
                                                                onChange={(e) => toggleDone(item.id, e.target.checked)}
                                                            />
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="Delete this note?"
                                                            okText="Delete"
                                                            cancelText="Cancel"
                                                            onConfirm={() => deleteNote(item.id)}
                                                        >
                                                            <Button type="text" size="small" icon={<DeleteOutlined />} />
                                                        </Popconfirm>
                                                    </Space>
                                                </div>
                                            </List.Item>

                                        )
                                    }}
                                />
                            </Flex>
                        }

                    </Flex>
                }

                {/* Content - Item*/}
                {mode === "edit" &&
                    <Flex flex={1} vertical>
                        <Divider style={{ margin: 0 }} />
                        {activeNote && <Input.TextArea
                            ref={textareaRef}
                            value={activeNote.text}
                            onChange={(e) => updateActiveText(e.target.value)}
                            placeholder="Write ideas, TODOs, code snippets…"
                            autoSize={{ minRows: 20, maxRows: 48 }}
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                boxShadow: "none",
                                padding: 12,
                                fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                fontSize: 14,
                                lineHeight: 1.5
                            }}
                        />}
                    </Flex>
                }
            </Flex>
        </Flex>
    )
}
