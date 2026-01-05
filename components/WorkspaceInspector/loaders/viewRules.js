import { api } from '../api';

export const loadViewRulesSection = async (baseUrl, g_ck, viewRuleConfigId) => {
    
    // Section init
    let viewRulesSection = { type: 'viewRules', label: '👓 View Rules', viewRuleConfigId, data: [], errors: [] };

    // No viewRuleConfigId provided
    if (!viewRuleConfigId) {
        viewRulesSection.errors.push("No viewRuleConfigId provided.");
        return viewRulesSection;
    }

    if (viewRuleConfigId) {

        // Config
        let viewRulesConfig = await api.getViewRulesConfig(baseUrl, g_ck, viewRuleConfigId);
        if (!viewRulesConfig) {
            viewRulesSection.errors.push("No view rules config found");
        }

        // Config found and it will always be only one record there
        let viewRulesConfigRecord = viewRulesConfig[0];
        viewRulesSection.data.push(viewRulesConfigRecord);

        // M2M Rules
        let viewRulesM2M = await api.getViewRulesM2M(baseUrl, g_ck, viewRuleConfigId);
        if (!viewRulesM2M || viewRulesM2M.length === 0) {
            viewRulesSection.errors.push("No view rules M2M found");
        }

        // Rules
        let viewRulesSysIds = viewRulesM2M.map(m2m => m2m.workspace_view_rule.value);
        let viewRules = await api.getViewRules(baseUrl, g_ck, viewRulesSysIds);
        if (!viewRules || viewRules.length === 0) {
            viewRulesSection.errors.push("No view rules found");
        }

        // Views
        let viewsSysIds = viewRules.map(viewRule => viewRule.view.value)
        let views = await api.getViews(baseUrl, g_ck, viewsSysIds);
        if (!views || views.length === 0) {
            viewRulesSection.errors.push("No views found");
        }

        /**
         * Joining Views with Rules
         */
        viewRules = viewRules.map(viewRule => {
            let child = views.find(view => view.sys_id === viewRule.view.value)
            return {
                ...viewRule,
                child: child
            }
        })

        /**
         * Joining M2M with Rules
         */
        viewRulesM2M = viewRulesM2M.map(m2m => {
            let child = viewRules.find(viewRule => viewRule.sys_id === m2m.workspace_view_rule.value)
            return {
                ...m2m,
                child: child
            }
        })

        viewRulesConfigRecord.data = viewRulesM2M

        // Table and sys_id for further use
        viewRulesSection.table = viewRulesConfigRecord.table;
        viewRulesSection.sys_id = viewRulesConfigRecord.sys_id;
        
    }

    return viewRulesSection;
}