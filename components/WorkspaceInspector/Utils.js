import { loadProfile } from './loaders';
import { adjustProfile } from './adjusters';


export const getProfile = async (tabData, workspaceUrlPath) => {
    try {
        let profile;
        
        // Loading raw
        profile = await loadProfile(tabData, workspaceUrlPath);
        
        // Restructuring for easy render
        profile = adjustProfile(profile)

        return profile;
    } catch (err) {
        throw new Error(`Error loading profile: ${err.message}`);
    }
}