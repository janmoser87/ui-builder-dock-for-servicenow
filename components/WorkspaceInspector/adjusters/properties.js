export const adjustPropertiesSection = (section) => {
    return {
        ...section,
        data: section.data.map(dataItem => {
            return {
                ...dataItem,
                content: {
                    type: 'DESCRIPTIONS',
                    title: null,
                    items: [
                        { label: 'Name', children: dataItem.name || 'N/A' },
                        { label: 'Value', children: dataItem.value || 'N/A' },
                        { label: 'Table', children: dataItem.table || 'N/A' },
                        { label: 'Sys ID', children: dataItem.sys_id || 'N/A' }
                    ]
                }
            }
        })
    }
}