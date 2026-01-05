import { type } from "os"
import { title } from "process"

export const adjustExperienceSection = (section) => {
    return {
        ...section,
        data: section.data.map(dataItem => {
            return {
                ...dataItem,
                content: {
                    type: 'DESCRIPTIONS',
                    title: null,
                    items: [
                        { label: 'Title', children: dataItem.title || 'N/A' },
                        { label: 'Path', children: dataItem.path || 'N/A' },
                        { label: 'Table', children: dataItem.table || 'N/A' },
                        { label: 'Sys ID', children: dataItem.sys_id || 'N/A' }
                    ]
                }
            }
        })
    }
}