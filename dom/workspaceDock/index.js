import { createDock, DOCK_ATTR } from './dock'
import { pageVariantItemBuilder } from './actions/pageVariant/index'
import { createBackendLinksItemBuilder } from './actions/backendLinks/index'

/**
 * Main entry point. Injects the floating dock button once into document.body.
 * All DOM work (shadow traversal, API calls, action bar injection) happens
 * on demand when the user interacts with the menu.
 */
export const loadWorkspaceDock = (prefs) => {
    if (prefs?.["workspace-dock"] === false) return
    if (document.querySelector(`[${DOCK_ATTR}]`)) return

    const itemBuilders = [
        pageVariantItemBuilder,
        createBackendLinksItemBuilder(),
    ]

    document.body.appendChild(createDock(itemBuilders))
}
