import { Storage } from "@plasmohq/storage"

// Utils
import { createButton } from './utils'

// Definitions
import backendButtons from './definitions/backendButtons'
import frontendButtons from './definitions/frontendButtons'

// Storage keys
import { STORAGE_KEYS } from "~consts"
const SETTINGS_KEY = STORAGE_KEYS.SETTINGS
const storage = new Storage()

/**
 * Loads extension buttons
 */
export const loadButtons = async () => {
    const prefs = (await storage.get(SETTINGS_KEY)) || {}
    loadBackendButtons(prefs)
    loadFrontendButtons(prefs)
}

/**
 * BACKEND buttons
 */
const loadBackendButtons = (prefs) => {
    const navbar = document.querySelector(".navbar-right")
    if (!navbar) return

    backendButtons.forEach(button => {
        if (prefs[button.key] === false) return
        if (button.displayCondition()) {
            const exists = navbar.querySelector(`[data-uibd="uib-button"][data-key="${button.key}"]`)
            if (exists) return
            navbar.prepend(createButton(button.label, button.onClickFn, button.key))
        }
    })
}

/**
 * FRONTEND (uib) buttons
 */
const loadFrontendButtons = (prefs) => {

    /**
     * Getting the navbar in frontend (UIB) is little bit tricky as we fight shadow root there. Therefore
     * we need to iterrate through it.
     */
    function getNavbar() {
        const stack = [document]

        while (stack.length) {
            const root = stack.pop()
            const qs = root.querySelector?.bind(root)
            if (qs) {
                const hit = qs('.sn-uibtk-editor-header .right-header') || qs('.right-header')
                if (hit) return hit
            }
            const all = root.querySelectorAll ? root.querySelectorAll('*') : []
            for (const el of all) {
                if (el.shadowRoot) stack.push(el.shadowRoot)
            }
        }
        return null
    }

    /**
     * Moreover, the target for placing the buttons is not ready right away, we need to wait for it. 
     * It's little bit hacky here.
     */
    const MAX_ATTEMPTS = 10
    let attempts = 0
    const interval = setInterval(() => {
        const navbar = getNavbar()
        if (!navbar) {
            attempts++
            if (attempts >= MAX_ATTEMPTS) {
                clearInterval(interval)    
            }
            return   
        }

        frontendButtons.forEach(button => {
            if (prefs[button.key] === false) return
            if (button.displayCondition()) {
                const exists = navbar.querySelector(`[data-uibd="uib-button"][data-key="${button.key}"]`)
                if (exists) return
                navbar.prepend(createButton(button.label, button.onClickFn, button.key, 0.8))
            }
        })

        clearInterval(interval)
    }, 500)

}