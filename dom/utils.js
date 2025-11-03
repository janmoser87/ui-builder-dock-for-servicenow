export const createButton = (label, onClickFn, key, scale = 1) => {
    const btn = document.createElement("button")
    btn.dataset.uibd = "uib-button"
    btn.dataset.key = key
    btn.type = "button"
    btn.title = `[UI Builder Dock] ${label}`
    btn.style.display = "flex"
    btn.style.alignItems = "center"
    btn.style.gap = "6px"
    btn.style.padding = "6px 16px"
    btn.style.border = "1px solid #ccc"
    btn.style.borderRadius = "8px"
    btn.style.background = "white"
    btn.style.cursor = "pointer"
    btn.style.transition = "box-shadow 0.25s ease, transform 0.15s ease"
    btn.style.transform = `scale(${scale})`
    btn.style.transformOrigin = 'center'
    btn.textContent = label
    btn.onclick = onClickFn

    const icon = document.createElement("img")
    icon.src = chrome.runtime.getURL("assets/icon.png")
    icon.style.width = "14px"
    icon.style.height = "14px"
    icon.style.transition = "transform 0.3s ease"
    btn.prepend(icon)

    btn.onmouseenter = () => {
        btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.25)"
        icon.style.transform = "rotate(20deg)"
    }

    btn.onmouseleave = () => {
        btn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)"
        icon.style.transform = "rotate(0deg)"
    }

    btn.onmousedown = () => {
        btn.style.transform = `scale(${scale * 0.97})`
    }

    btn.onmouseup = () => {
        btn.style.transform = `scale(${scale})`
    }

    return btn
}
