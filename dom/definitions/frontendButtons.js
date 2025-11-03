export default [
    {
        key: 'open-extension-point',
        description: 'Opens the current Page collection’s in the backend.',
        displayCondition: () => window.location.href.includes('/now/builder/ui/edit/pc/'),
        label: 'Open Extension Point',
        onClickFn: () => {
            const match = window.location.href.match(/edit\/pc\/([^/]+)/)
            if (!match) return
            const sysId = match[1]
            const targetUrl = `https://${window.location.host}/sys_ux_extension_point.do?sys_id=${sysId}`
            window.open(targetUrl, '_blank')
        }
    }
]