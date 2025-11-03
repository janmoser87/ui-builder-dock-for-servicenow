export default [
    {
        key: 'create-acl',
        description: 'Opens a new predefined ACL record for the current Data resource.',
        displayCondition: () => window.location.href.includes("/sys_ux_data_broker_transform."),
        label: 'Create ACL',
        onClickFn: () => {
            const url = new URL(window.location.href)
            const sysId = url.searchParams.get("sys_id") || ''

            const query = [
                `type=6d9c40e9531210101cb3ddeeff7b12f6`, // ux_data_broker
                `operation=execute`,
                `name=${sysId}`,
                `description=${encodeURIComponent("Data Broker: " + sysId)}`
            ].join("^")

            const targetUrl = `https://${window.location.host}/sys_security_acl.do?sys_id=-1&sysparm_query=${query}`
            window.open(targetUrl, "_blank")
        }
    }
]