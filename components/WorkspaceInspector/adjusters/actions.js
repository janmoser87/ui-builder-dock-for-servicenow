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
        if (dataItem.table === 'sys_declarative_action_assignment') {
            if (dataItem.declarative_action_type === 'client_script') {
                tags.push({ color: 'cyan', text: 'Client Script' });
            }
            if (dataItem.declarative_action_type === 'server_script') {
                tags.push({ color: 'orange', text: 'Server Script' });
            }
            if (dataItem.declarative_action_type === 'uxf_client_action') {
                tags.push({ color: 'green', text: 'UXF Client Action' });
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

export const adjustActionsSection = (section) => {
    return {
        ...section,
        data: adjustData(section.data)
    }
}