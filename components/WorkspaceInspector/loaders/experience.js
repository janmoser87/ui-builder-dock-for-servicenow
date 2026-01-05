import { api } from "../api";

export const loadExperienceSection = async (baseUrl, g_ck, workspaceUrlPath) => {
    
    //Section init
    let experienceSection = { type: 'experience', label: '✨ Experience', data: [], errors: [] };
    
    // Fetching experience
    const experience = await api.getExperience(baseUrl, g_ck, workspaceUrlPath);

    // No experience found
    if (!experience) {
        experienceSection.errors.push("No experience found");
    }
    
    // Multiple experience with same path? Should not happen but...
    if (experience.length > 1) {
        experienceSection.errors.push(`Multiple experiences found with the same path: ${workspaceUrlPath}`);
    }
    
    // Single experience
    let experienceItem = experience[0];
    experienceSection.data.push(experienceItem);

    // Table and sys_id for further use
    experienceSection.table = experienceItem.table;
    experienceSection.sys_id = experienceItem.sys_id;

    return experienceSection;
}

