export { }

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

	if (message.command === "get_gck") {
		const handleMessage = (event: MessageEvent) => {
			if (event.source !== window || event.data?.source !== "sn-extension") return
			window.removeEventListener("message", handleMessage)
			sendResponse(event.data)
		}		

		window.addEventListener("message", (event: MessageEvent) => {
			if (event.source !== window || event.data?.source !== "sn-extension") return
			window.removeEventListener("message", handleMessage)
			sendResponse(event.data)
		})

		const script = document.createElement("script")
		script.src = chrome.runtime.getURL("inject.js")
		script.onload = () => script.remove()
		document.documentElement.appendChild(script)
	}
		
	if (message.command === "console.log") {
		console.log("[UIB Dock]", message.data)
	}

	return true
})

