/**
 * Injects inject.js into the page and reads window.g_ck via postMessage —
 * same mechanism as content.ts get_gck handler, but invoked directly from here.
 */
function getGckFromPage() {
    return new Promise((resolve) => {
        const handleMessage = (event) => {
            if (event.source !== window || event.data?.source !== "sn-extension") return
            window.removeEventListener("message", handleMessage)
            clearTimeout(timeout)
            resolve(event.data.g_ck || null)
        }
        window.addEventListener("message", handleMessage)

        const timeout = setTimeout(() => {
            window.removeEventListener("message", handleMessage)
            resolve(null)
        }, 3000)

        const script = document.createElement("script")
        script.src = chrome.runtime.getURL("inject.js")
        script.onload = () => script.remove()
        document.documentElement.appendChild(script)
    })
}

/**
 * Traverses the full shadow DOM to find sn-canvas-main, then follows the path:
 *   sn-canvas-main → sn-canvas-screen → section → screen-action-transformer-{sys_id}
 *
 * Returns { sysId, section } when found, null otherwise.
 */
function findSectionInfo() {
    // Step 1 — find sn-canvas-main anywhere in the shadow tree.
    let canvasMain = null
    const stack = [document]
    while (stack.length) {
        const root = stack.pop()
        const hit = root.querySelector?.("sn-canvas-main")
        if (hit) { canvasMain = hit; break }
        if (root.querySelectorAll) {
            for (const el of root.querySelectorAll("*")) {
                if (el.shadowRoot) stack.push(el.shadowRoot)
            }
        }
    }
    if (!canvasMain) return null

    // Step 2 — find the VISIBLE sn-canvas-screen (when switching tabs SN hides
    // the previous one with style="display:none" and inserts a fresh one).
    const allScreens = [
        ...Array.from(canvasMain.querySelectorAll("sn-canvas-screen")),
        ...Array.from(canvasMain.shadowRoot?.querySelectorAll("sn-canvas-screen") ?? []),
    ]
    const canvasScreen = allScreens.find(el => el.style.display !== "none") ?? allScreens[0]
    if (!canvasScreen) return null

    // Step 3 — find section (light DOM first, then shadow root).
    const section =
        canvasScreen.querySelector("section") ??
        canvasScreen.shadowRoot?.querySelector("section")
    if (!section) return null

    // Step 4 — find the first screen-action-transformer-{sys_id} child of section.
    for (const child of section.children) {
        const tag = child.tagName?.toLowerCase() ?? ""
        const match = tag.match(/^screen-action-transformer-([a-f0-9]{32})$/)
        if (match) return { sysId: match[1], section }
    }
    return null
}

async function fetchPageVariantName(sysId, gck) {
    const host = window.location.host
    const headers = { Accept: "application/json" }
    if (gck) headers["X-UserToken"] = gck

    try {
        const resp = await fetch(
            `https://${host}/api/now/table/sys_ux_screen` +
            `?sysparm_query=sys_id=${sysId}&sysparm_fields=name&sysparm_limit=1`,
            { headers, credentials: "include" }
        )
        if (!resp.ok) return sysId
        const data = await resp.json()
        return data.result?.[0]?.name ?? sysId
    } catch (_) {
        return sysId
    }
}

/**
 * Traverses the shadow DOM, finds the current Page Variant sys_id, fetches its
 * name via the table API and returns { sysId, name }, or null if not on a
 * Configurable Workspace page.
 */
export async function resolvePageVariant() {
    const info = findSectionInfo()
    if (!info) return null
    const { sysId } = info
    const gck = await getGckFromPage()
    const name = await fetchPageVariantName(sysId, gck)
    return { sysId, name }
}
