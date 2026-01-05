import { api } from "../api";

export const loadExperiencePropertiesSection = async (baseUrl, g_ck, experienceSysId) => {

    // Section init
    let experiencePropertiesSection = { type: 'experienceProperties', label: '⚙️ Experience Properties', data: [], errors: [] };

    // Experience Properties
    const experienceProperties = await api.getExperienceProperties(baseUrl, g_ck, experienceSysId);
    if (!experienceProperties || experienceProperties.length === 0) {
        experiencePropertiesSection.errors.push("No experience properties found");
    }
    experiencePropertiesSection.data = experienceProperties;

    // Table and sys_id for further use
    experiencePropertiesSection.table = 'sys_ux_page_registry';
    experiencePropertiesSection.sys_id = experienceSysId;

    return experiencePropertiesSection;
}