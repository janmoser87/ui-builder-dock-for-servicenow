import { getGck } from "~scripts/Utils";
import { loadExperienceSection } from "./experience";
import { loadExperiencePropertiesSection } from "./properties";
import { loadActionsSection } from "./actions";
import { loadViewRulesSection } from "./viewRules";

export const loadProfile = async (tabData, workspaceUrlPath) => {

    let profile = {
        sections: [],
        errors: []
    };

    const baseUrl = tabData.tabUrlBase;
    const g_ck = await getGck(baseUrl);

    // Experience
    const experienceSection = await loadExperienceSection(baseUrl, g_ck, workspaceUrlPath);
    profile.sections.push(experienceSection);
    if (experienceSection.data[0]?.sys_id === undefined) {
        return profile; // Cannot proceed without experience
    }

    // Experience Properties
    const experiencePropertiesSection = await loadExperiencePropertiesSection(baseUrl, g_ck, experienceSection.data[0].sys_id);
    profile.sections.push(experiencePropertiesSection);

    // Critical properties for further loading
    const actionConfigId = experiencePropertiesSection.data.find(prop => prop.name === 'actionConfigId')?.value;
    const viewRuleConfigId = experiencePropertiesSection.data.find(prop => prop.name === 'viewRuleConfigId')?.value;

    if (!actionConfigId) {
        profile.errors.push("Missing actionConfigId in experience properties");
    }
     else {
        // Actions
        const actionsSection = await loadActionsSection(baseUrl, g_ck, actionConfigId);
        profile.sections.push(actionsSection);
     }

    if (!viewRuleConfigId) {
        profile.errors.push("Missing viewRuleConfigId in experience properties");
    }
     else {
        // View Rules
        const viewRulesSection = await loadViewRulesSection(baseUrl, g_ck, viewRuleConfigId);
        profile.sections.push(viewRulesSection);
     }

    

    return profile;
}
