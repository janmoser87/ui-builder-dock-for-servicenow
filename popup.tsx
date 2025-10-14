import "./popup.css"

// Components
import Wrapper from "~components/Wrapper"

export default function Popup() {

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,                 
				boxSizing: "border-box"
			}}>
			<Wrapper url={null} isInSidepanel={false} />
		</div>
	)
}
