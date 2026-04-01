import { createMenu } from './menu'

export const DOCK_ATTR = "data-uibd-dock"

/**
 * Creates the floating dock button. Knows nothing about what the menu contains —
 * all that is provided via itemBuilders.
 *
 * itemBuilders — array of (menuAPI) => HTMLElement, forwarded to createMenu().
 */
export function createDock(itemBuilders) {
    const btn = document.createElement("button")
    btn.setAttribute(DOCK_ATTR, "")
    btn.type = "button"
    btn.title = "[UI Builder Dock]"
    btn.style.cssText = [
        "position: fixed",
        "bottom: 20px",
        "right: 20px",
        "z-index: 99999",
        "width: 36px",
        "height: 36px",
        "padding: 5px",
        "border: 1px solid #bfdbfe",
        "border-radius: 50%",
        "background: #eff6ff",
        "cursor: pointer",
        "box-shadow: 0 2px 8px rgba(0,0,0,0.15)",
        "opacity: 0.35",
        "transition: box-shadow 0.2s, background 0.2s, opacity 0.2s",
        "display: flex",
        "align-items: center",
        "justify-content: center",
    ].join("; ")

    const icon = document.createElement("img")
    icon.src = chrome.runtime.getURL("assets/icon.png")
    icon.style.cssText = "width: 18px; height: 18px; pointer-events: none; display: block;"
    btn.appendChild(icon)

    btn.onmouseenter = () => {
        btn.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)"
        btn.style.background = "#dbeafe"
        btn.style.opacity = "1"
    }
    btn.onmouseleave = () => {
        btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"
        btn.style.background = "#eff6ff"
        btn.style.opacity = "0.35"
    }

    const menu = createMenu(btn, itemBuilders)

    btn.onclick = (e) => {
        e.stopPropagation()
        menu.isOpen() ? menu.close() : menu.open()
    }

    return btn
}
