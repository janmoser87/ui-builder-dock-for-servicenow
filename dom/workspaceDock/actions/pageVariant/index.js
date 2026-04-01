import { resolvePageVariant } from './resolver'
import { createMenuItem } from '../../menu'

function statusEl(text, color) {
    const el = document.createElement("div")
    el.style.cssText = `padding: 12px 16px; font-size: 12px; font-family: sans-serif; color: ${color || "#64748b"};`
    el.textContent = text
    return el
}

function resultEl(result, onClose) {
    const el = document.createElement("div")
    el.style.cssText = [
        "padding: 12px 16px",
        "cursor: pointer",
        "font-size: 12px",
        "font-family: sans-serif",
        "color: #1d4ed8",
        "transition: background 0.15s",
    ].join("; ")
    el.innerHTML = `<div style="font-weight:600;margin-bottom:3px;">Page Variant</div><div>${result.name}</div>`
    el.title = "Open in backend"
    el.onmouseenter = () => { el.style.background = "#eff6ff" }
    el.onmouseleave = () => { el.style.background = "" }
    el.onclick = () => {
        window.open(`https://${window.location.host}/sys_ux_screen.do?sys_id=${result.sysId}`, "_blank")
        onClose()
    }
    return el
}

/**
 * Item builder for the Page Variant action.
 * Signature: (menuAPI) => HTMLElement — called fresh on each menu open.
 */
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="3" width="20" height="5" rx="1"/>
  <rect x="2" y="10" width="9" height="11" rx="1"/>
  <rect x="13" y="10" width="9" height="11" rx="1"/>
</svg>`

export function pageVariantItemBuilder(menuAPI) {
    return createMenuItem(
        "Show Page Variant",
        "Reveals which variant was loaded.",
        async () => {
            menuAPI.setContent(statusEl("Looking up Page Variant…"))
            const result = await resolvePageVariant()
            if (!result) {
                menuAPI.setContent(statusEl("No variant found.", "#ef4444"))
                return
            }
            menuAPI.setContent(resultEl(result, menuAPI.close))
        },
        ICON
    )
}
