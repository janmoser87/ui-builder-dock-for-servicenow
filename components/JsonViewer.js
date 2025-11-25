import ReactJson from 'react-json-view'

export default function Code({ json, ...props }) {
    return <ReactJson src={json} {...props} />
}