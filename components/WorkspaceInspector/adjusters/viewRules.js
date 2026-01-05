const adjustSections = (sections) => {
    return sections.map(section => {
        return {
            ...section,
            data: adjustData(section.data)
        }
    });
}

const adjustData = (data) => {
    return data.map(dataItem => {
        
        if (dataItem.sections) {
            return {
                ...dataItem,
                sections: adjustSections(dataItem.sections)
            };
        }

        if (dataItem.data) {
            return {
                ...dataItem,
                data: adjustData(dataItem.data)
            };
        }

        if (Array.isArray(dataItem)) {
            return adjustData(dataItem);
        }

        let tags = []
        if (dataItem.table === 'sysrule_view_workspace') {
            if (dataItem.condition !== '' && dataItem.condition !== 'null') {
                tags.push({ color: 'volcano', text: 'Conditional' });
            }
            if (dataItem.roles !== '' && dataItem.roles !== 'null') {
                tags.push({ color: 'orange', text: 'Roles-based' });
            }            
        }

        return {
            ...dataItem,
            _renderProps: {
                tags
            }
        }

    });
}

export const adjustViewRulesSection = (section) => {
    return {
        ...section,
        data: adjustData(section.data)
    }
}