export const getPageType = (url) => {

    if (url.includes("now/builder/ui/edit/experience")) {
        return "experience"
    }

    if (url.includes("now/builder/ui/edit/pc")) {
        return "pc"
    }

    if (url.includes("now/builder/ui/component")) {
        return "component"
    }

    return null
}

export const extractUrlProps = (url) => {
    try {
        const path = new URL(url).pathname
        const pageType = getPageType(url)

        if (!pageType) {
            return { type: null, ids: null }
        }

        if (pageType == "experience" || pageType == "pc") {
            const match = path.match(/^\/now\/builder\/ui\/edit\/(pc|experience)\/([^/]+)\/([^/]+)\/([^/]+)$/)
            if (match) {
                const [, type, id1, id2, id3] = match
                return {
                    type: type,
                    ids: [id1, id2, id3]
                }
            }
        }

        if (pageType == "component") {
            const match = path.match(/^\/now\/builder\/ui\/(component)\/([^/]+)$/)
            if (match) {
                const [, type, id1] = match
                return {
                    type: type,
                    ids: [id1]
                }
            }
        }

        return { type: null, ids: null }
    }
    catch (e) {
        return { type: null, ids: null }
    }
}

export const getIsInServiceNow = (url) => {
    try {
        return url.includes("service-now.com/")
    }
    catch (e) {
        return false
    }
}

export const getIsInUIBuilder = (url) => {
    try {
        return url.includes("service-now.com/now/builder/ui/")
    }
    catch (e) {
        return false
    }
}

export const getIsInUIBuilderSupportedPage = (url) => {
    try {
        return url.includes("now/builder/ui/edit/") || url.includes("now/builder/ui/component/")
    }
    catch (e) {
        return false
    }
}

export const getWorkspaceData = (url) => {
    try {
        // Pattern 1: /x/{scope_app_prefix}/{workspace_url}/record/{sys_id}
        const customMatch = url.match(/\/x\/[^/]+\/([^/]+)\/record\/([^/]+)\/([^/?&]+)/)
        if (customMatch) {
            return {
                isInWorkspace: true,
                workspaceData: {
                    workspaceUrl: customMatch[1],
                    table: customMatch[2],
                    sysId: customMatch[3]
                }
            }
        }

        // Pattern 2: /now/{workspace_url}/record/{sys_id}
        const nativeMatch = url.match(/\/now\/([^/]+)\/record\/([^/]+)\/([^/?&]+)/)
        if (nativeMatch) {
            return {
                isInWorkspace: true,
                workspaceData: {
                    workspaceUrl: nativeMatch[1],
                    table: nativeMatch[2],
                    sysId: nativeMatch[3]
                }
            }
        }

        return {
            isInWorkspace: false,
            workspaceData: null
        }
    } catch (e) {
        return {
            isInWorkspace: false,
            workspaceData: null
        }
    }
}

export const getTabData = () => {

    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

            let tab = tabs[0]
            if (!tab) {
                resolve({ isInServiceNowInstance: false })
                return
            }
            if (!tab.url) {
                resolve({ isInServiceNowInstance: false })
                return
            }

            const url = tab.url

            resolve({
                tab: tabs[0],
                tabID: tabs[0].id,
                tabUrlFull: url,
                tabUrlBase: url.split("/")[2],
                tabUrlProps: extractUrlProps(url),
                isInServiceNow: getIsInServiceNow(url),
                isInUIBuilder: getIsInUIBuilder(url),
                isInUIBuilderSupportedPage: getIsInUIBuilderSupportedPage(url),
                ...getWorkspaceData(url),
            })

        })
    })
}

export const getGck = async () => {
    const { tabID } = await getTabData()
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabID, { command: "get_gck" }, (response) => {
            resolve(response.g_ck)
        })
    })
}

export const consoleLog = async (data) => {
    const { tabID } = await getTabData()
    chrome.tabs.sendMessage(tabID, { command: "console.log", data }, (response) => { })
}

export const fetchTableData = async (instanceUrl, tableName, g_ck, queryParams = "",) => {
    try {
        const url = `https://${instanceUrl}/api/now/table/${tableName}?${queryParams}`
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-UserToken": g_ck,
            },
            credentials: "include",
        })

        if (!res.ok) {
            const errorText = await res.text()
            return [`HTTP ${res.status}: ${res.statusText} – ${errorText}`, null]
        }

        const data = await res.json()
        return [null, data.result]
    } catch (error) {
        return [`Network or parsing error: ${error.message}`, null]
    }
}

