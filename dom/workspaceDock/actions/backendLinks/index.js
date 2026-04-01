import { injectBackendLinks, removeBackendLinks } from './injector'
import { createMenuItem } from '../../menu'

/**
 * Factory that returns a stateful item builder for the Backend Links toggle.
 * Call once — the returned builder carries its own active/inactive state and
 * updates the label each time the menu opens.
 *
 * Signature of returned builder: (menuAPI) => HTMLElement
 */
const ICON_SHOW = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</svg>`

const ICON_HIDE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="2" y1="2" x2="22" y2="22"/>
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-1.33-1.33"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 1.33 1.33"/>
</svg>`

export function createBackendLinksItemBuilder() {
    let active = false

    return function backendLinksItemBuilder(menuAPI) {
        return createMenuItem(
            active ? "Remove Backend Actions" : "Add Backend Actions",
            active ? "Removes backend links from the action bar" : "Injects backend links into the action bar",
            () => {
                if (active) {
                    removeBackendLinks()
                } else {
                    injectBackendLinks()
                }
                active = !active
                menuAPI.close()
            },
            active ? ICON_HIDE : ICON_SHOW
        )
    }
}
