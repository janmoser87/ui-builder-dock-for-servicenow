import { adjustExperienceSection } from './experience.js';
import { adjustPropertiesSection } from './properties.js';
import { adjustActionsSection } from './actions.js';
import { adjustViewRulesSection } from './viewRules.js';

const flattenChildren = (item, flattenedArr = []) => {
    if (item.child) {
        flattenedArr.push(item.child);
        if (item.child.child) {
            flattenChildren(item.child, flattenedArr);
        }
    }
    return flattenedArr;
}

const processDataItem = (dataItem) => {

    if (dataItem.sections) {
        return {
            ...dataItem,
            sections: adjustSections(dataItem.sections)
        };
    }

    if (dataItem.data && Array.isArray(dataItem.data)) {
        return {
            ...dataItem,
            data: dataItem.data.map(subItem => processDataItem(subItem))
        };
    }

    if (dataItem.child) {
        let flattenedChildren = flattenChildren(dataItem);
        return [dataItem, ...flattenedChildren];
    }

    return dataItem;
};

const adjustSections = (sections) => {
    return sections.map(section => {

        // Flattening child items in data arrays
        section = {
            ...section,
            data: section.data.map(dataItem => processDataItem(dataItem))
        }

        // Preparing rendering 'content' prop based on section type
        switch (section.type) {
            case 'experience':
                return adjustExperienceSection(section);
            case 'experienceProperties':
                return adjustPropertiesSection(section);
            case 'actions':
                return adjustActionsSection(section);
            case 'viewRules':
                return adjustViewRulesSection(section);
            default:
                break;
        }

        return section
    });
}

export const adjustProfile = (profile) => {
    profile.sections = adjustSections(profile.sections);
    return profile;
}