const LINK_ATTR = "data-uibd-ws-link"
const SYS_ID_RE = /^[a-f0-9]{32}$/
// Covers both now-popover (<li>) and now-split-button dropdown (<div role="menuitem">).
const MENU_ITEM_SELECTOR = "li[id], div[role='menuitem'][id]"

/**
 * UTILS
 */

// "_node0_f4deef100b701300099a83eb37673a4d" → "f4deef100b701300099a83eb37673a4d"
function extractSysId(componentName) {
    if (!componentName) return null
    const match = componentName.match(/_node\d+_([a-f0-9]{32})$/)
    return match ? match[1] : null
}

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

// Stack-based shadow DOM traversal — same approach as loadFrontendButtons().
function findAllActionBarWrappers() {
    const wrappers = []
    const stack = [document]
    while (stack.length) {
        const root = stack.pop()
        if (!root.querySelectorAll) continue
        for (const el of root.querySelectorAll(".uiaction-bar-wrapper")) {
            wrappers.push(el)
        }
        for (const el of root.querySelectorAll("*")) {
            if (el.shadowRoot) stack.push(el.shadowRoot)
        }
    }
    return wrappers
}

function debounce(fn, ms) {
    let t
    return (...args) => {
        clearTimeout(t)
        t = setTimeout(() => fn(...args), ms)
    }
}

/**
 * BUTTONS
 */

// Shared visual: app icon with a small ↗ badge circle in the bottom-right corner.
function appendIconWithBadge(btn) {
    const icon = document.createElement("img")
    icon.src = chrome.runtime.getURL("assets/icon.png")
    icon.style.cssText = "width: 13px; height: 13px; pointer-events: none; display: block;"
    btn.appendChild(icon)

    const badge = document.createElement("span")
    badge.style.cssText = [
        "position: absolute",
        "bottom: -3px",
        "right: -3px",
        "width: 9px",
        "height: 9px",
        "border-radius: 50%",
        "background: #1677ff",
        "display: flex",
        "align-items: center",
        "justify-content: center",
        "pointer-events: none",
        "line-height: 1",
    ].join("; ")
    badge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="5" height="5" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1.5 6.5 L6.5 1.5 M3.5 1.5 H6.5 V4.5"/>
    </svg>`
    btn.appendChild(badge)
}

// Creates the icon+badge link button.
// inPopover=true: pushed right with margin-left:auto, also stops immediate
//   propagation so the dropdown stays open after clicking.
// inPopover=false: aligned with align-self:center for the action bar flex row.
function createLinkButton(sysId, { inPopover = false } = {}) {
    const btn = document.createElement("button")
    btn.setAttribute(LINK_ATTR, sysId)
    btn.type = "button"
    btn.title = "[UI Builder Dock] Open in backend"

    const css = [
        "position: relative",
        "display: inline-flex",
        "align-items: center",
        "justify-content: center",
        "width: 22px",
        "height: 22px",
        "padding: 2px",
        "border: 1px solid transparent",
        "border-radius: 4px",
        "background: transparent",
        "cursor: pointer",
        "opacity: 0.35",
        "transition: opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease",
        "flex-shrink: 0",
        inPopover ? "margin-left: auto" : "align-self: center",
    ]
    btn.style.cssText = css.join("; ")

    appendIconWithBadge(btn)

    btn.onmouseenter = () => {
        btn.style.opacity = "1"
        btn.style.borderColor = "#ccc"
        btn.style.background = "rgba(255,255,255,0.9)"
    }
    btn.onmouseleave = () => {
        btn.style.opacity = "0.35"
        btn.style.borderColor = "transparent"
        btn.style.background = "transparent"
    }

    btn.onclick = async (e) => {
        e.stopPropagation()
        if (inPopover) e.stopImmediatePropagation() // keep the dropdown open
        e.preventDefault()
        const gck = await getGckFromPage()
        openBackendRecord(sysId, gck)
    }

    return btn
}

/**
 * BACKEND
 */

async function openBackendRecord(sysId, gck) {
    const host = window.location.host
    const headers = { Accept: "application/json" }
    if (gck) headers["X-UserToken"] = gck

    // Try sys_ui_action first, then sys_declarative_action_assignment as fallback.
    try {
        const resp = await fetch(
            `https://${host}/api/now/table/sys_ui_action` +
            `?sysparm_query=sys_id=${sysId}&sysparm_fields=sys_id&sysparm_limit=1`,
            { headers, credentials: "include" }
        )
        const data = await resp.json()
        if (data.result?.length > 0) {
            window.open(`https://${host}/sys_ui_action.do?sys_id=${sysId}`, "_blank")
            return
        }
    } catch (_) {}

    window.open(`https://${host}/sys_declarative_action_assignment.do?sys_id=${sysId}`, "_blank")
}

/**
 * ACTION BAR INJECTION LOGIC
 */

let _observer = null

/**
 * Disconnect → clean old buttons → inject fresh → reconnect on next frame.
 * Disconnecting before our own DOM changes prevents an observer feedback loop
 * where our insertions/removals re-trigger injection.
 */
function injectAll() {
    if (_observer) { _observer.disconnect(); _observer = null }

    findAllActionBarWrappers().forEach(wrapper => {
        
        // Remove stale link buttons left behind after SN re-renders the action bar.
        wrapper.querySelectorAll(`[${LINK_ATTR}]`).forEach(el => el.remove())


        wrapper.querySelectorAll("now-button[component-name], now-split-button[component-name]")
            .forEach(nowBtn => {
                const sysId = extractSysId(nowBtn.getAttribute("component-name"))
                if (!sysId) return
                nowBtn.insertAdjacentElement("afterend", createLinkButton(sysId))
            })
    })

    requestAnimationFrame(startObserver)
}

function startObserver() {
    if (_observer) _observer.disconnect()

    /**
     * Observe document.body with subtree — picks up shadow host additions/removals.
     * that happen when the user switches tabs inside the workspace.
     */
    _observer = new MutationObserver(debounce(injectAll, 300))
    _observer.observe(document.body, { childList: true, subtree: true })
    startPopoverObserver()
}

/**
 * POPOVER INJECTION LOGIC
 */

/**
 * Pierces seismic-hoist shadow root and injects link buttons into each menu item.
 * Items can be <li id="..."> (now-popover) or <div role="menuitem" id="...">
 * (now-split-button dropdown) — both are flex rows and carry sys_id as their id.
 */
function injectIntoPopoverItems(seismicHoist) {
    const shadow = seismicHoist.shadowRoot
    if (!shadow) return
    shadow.querySelectorAll(MENU_ITEM_SELECTOR).forEach(item => {
        if (!SYS_ID_RE.test(item.id)) return
        if (item.querySelector(`[${LINK_ATTR}]`)) return
        item.appendChild(createLinkButton(item.id, { inPopover: true }))
    })
}

/**
 * now-popover-panel is a direct body child. seismic-hoist is its slotted child
 * (slot="content") in the light DOM — not inside the panel's shadow root.
 * Polls until both async render stages complete:
 *   1. seismic-hoist appended as light DOM child of panel
 *   2. menu items rendered inside seismic-hoist's own shadow root
 */
function findAndInjectOpenPopovers() {
    document.querySelectorAll("now-popover-panel").forEach(panel => {
        let attempts = 0
        const poll = setInterval(() => {
            if (++attempts > 20) { clearInterval(poll); return }
            const hoist = panel.querySelector("seismic-hoist")
            if (!hoist) return
            if (!hoist.shadowRoot?.querySelector(MENU_ITEM_SELECTOR)) return
            clearInterval(poll)
            injectIntoPopoverItems(hoist)
        }, 50)
    })
}

/**
 * Dedicated observer for now-popover-panel additions to document.body.
 * Re-created on every startObserver() cycle (after tab switches).
 */
let _popoverObserver = null

function startPopoverObserver() {
    if (_popoverObserver) _popoverObserver.disconnect()
    _popoverObserver = new MutationObserver((mutations) => {
        for (const { addedNodes } of mutations) {
            for (const node of addedNodes) {
                if (node.nodeType !== 1) continue
                if (node.tagName?.toLowerCase() === "now-popover-panel") {
                    findAndInjectOpenPopovers()
                    return
                }
            }
        }
    })
    _popoverObserver.observe(document.body, { childList: true })
}


/**
 * Main entry point for workspace-specific button injections. Invoked from buttons.js after loading user prefs.
 */
export const loadWorkspaceButtons = (prefs) => {
    if (prefs?.["workspace-backend-links"] === false) return

    /**
     * Poll until we find the action bar (max 20 × 500 ms = 10 s).
     * If it never appears (non-workspace page) we simply give up.
     */
    const MAX_ATTEMPTS = 20
    let attempts = 0
    const interval = setInterval(() => {

        // In most cases, there only be one action bar wrapper but no one never knows... Technically in UIB, it's posible to add another one
        const wrappers = findAllActionBarWrappers()
        if (wrappers.length === 0) {
            if (++attempts >= MAX_ATTEMPTS) clearInterval(interval)
            return
        }
        clearInterval(interval)
        injectAll()
    }, 500)
}