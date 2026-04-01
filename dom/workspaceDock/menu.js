const MENU_CSS = [
    "position: fixed",
    "bottom: 64px",
    "right: 20px",
    "z-index: 99999",
    "background: #fff",
    "border: 1px solid #e2e8f0",
    "border-radius: 8px",
    "box-shadow: 0 4px 16px rgba(0,0,0,0.12)",
    "overflow: hidden",
    "min-width: 210px",
    "font-family: sans-serif",
].join("; ")

/**
 * Generic menu item. Used by action builders.
 */
export function createMenuItem(label, description, onClick, icon) {
    const item = document.createElement("button")
    item.type = "button"
    item.style.cssText = [
        "display: flex",
        "flex-direction: row",
        "align-items: center",
        "gap: 10px",
        "width: 100%",
        "padding: 10px 14px",
        "border: none",
        "border-bottom: 1px solid #f1f5f9",
        "background: #fff",
        "cursor: pointer",
        "text-align: left",
        "transition: background 0.15s",
    ].join("; ")
    item.onmouseenter = () => { item.style.background = "#f8fafc" }
    item.onmouseleave = () => { item.style.background = "#fff" }

    if (icon) {
        const iconWrap = document.createElement("span")
        iconWrap.style.cssText = "flex-shrink: 0; display: flex; align-items: center; color: #94a3b8;"
        iconWrap.innerHTML = icon
        item.appendChild(iconWrap)
    }

    const text = document.createElement("span")
    text.style.cssText = "display: flex; flex-direction: column;"

    const labelEl = document.createElement("span")
    labelEl.textContent = label
    labelEl.style.cssText = "font-weight: 600; color: #1e293b; font-size: 13px;"
    text.appendChild(labelEl)

    const descEl = document.createElement("span")
    descEl.textContent = description
    descEl.style.cssText = "font-size: 11px; color: #94a3b8; margin-top: 2px;"
    text.appendChild(descEl)

    item.appendChild(text)
    item.onclick = (e) => { e.stopPropagation(); onClick() }
    return item
}

/**
 * Creates a menu anchored to anchorEl.
 *
 * itemBuilders — array of (menuAPI) => HTMLElement, called fresh on each open.
 * menuAPI = { setContent(el), close() } — passed to each builder so actions can
 * asynchronously replace the menu content or close the menu.
 *
 * Returns { open(), close(), isOpen() }.
 */
export function createMenu(anchorEl, itemBuilders) {
    let menuEl = null
    let outsideClickHandler = null

    const api = {
        setContent(el) {
            if (!menuEl) return
            menuEl.innerHTML = ""
            menuEl.appendChild(el)
        },
        close() {
            menuEl?.remove()
            menuEl = null
            if (outsideClickHandler) {
                document.removeEventListener("click", outsideClickHandler, true)
                outsideClickHandler = null
            }
        },
    }

    return {
        open() {
            if (menuEl) return
            menuEl = document.createElement("div")
            menuEl.style.cssText = MENU_CSS
            itemBuilders.forEach(build => menuEl.appendChild(build(api)))
            document.body.appendChild(menuEl)

            outsideClickHandler = (e) => {
                if (!menuEl?.contains(e.target) && e.target !== anchorEl) api.close()
            }
            setTimeout(() => document.addEventListener("click", outsideClickHandler, true), 0)
        },
        close: api.close,
        isOpen: () => !!menuEl,
    }
}
