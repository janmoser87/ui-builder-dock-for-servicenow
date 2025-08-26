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

            resolve({
                tab: tabs[0],
                tabID: tabs[0].id,
                tabUrlFull: tabs[0].url,
                tabUrlBase: tabs[0].url.split("/")[2],
                tabUrlProps: extractUrlProps(tabs[0].url),
                isInServiceNowInstance: tabs[0].url.includes("service-now.com"),
                isInUiBuilderEditor: tabs[0].url.includes("now/builder/ui/edit/") || tabs[0].url.includes("now/builder/ui/component/")
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

