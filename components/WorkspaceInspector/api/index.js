import { fetchTableData } from "~scripts/Utils";

const fetchAndEnrich = async (baseUrl, table, g_ck, query, fields) => {
    const queryParams = `sysparm_query=${query}&sysparm_fields=${fields}`;
    const [err, data] = await fetchTableData(baseUrl, table, g_ck, queryParams);
    
    // Handle error
    if (err) throw new Error(`Error fetching ${table}: ${baseUrl} ${err} ${g_ck} ${queryParams}`);
    
    // Enrich data with table name
    return data.map(item => ({ ...item, table }));
}

export const api = {
    /**
     * Experience related API calls
     */
    getExperience: (baseUrl, g_ck, path) => 
        fetchAndEnrich(baseUrl, "sys_ux_page_registry", g_ck, `path=${path}`, "sys_id,title,path"),
    
    getExperienceProperties: (baseUrl, g_ck, experienceSysId) => 
        fetchAndEnrich(baseUrl, "sys_ux_page_property", g_ck, `page=${experienceSysId}`, "sys_id,name,description,value"),
    
    /**
     * Form actions related API calls
     */
    getActionsConfig: (baseUrl, g_ck, actionConfigId) => 
        fetchAndEnrich(baseUrl, "sys_ux_action_config", g_ck, `sys_id=${actionConfigId}`, "sys_id,name"),
    
    getActionsLayouts: (baseUrl, g_ck, actionConfigId) => 
        fetchAndEnrich(baseUrl, "sys_ux_form_action_layout", g_ck, `action_config=${actionConfigId}`, "sys_id,name,table,use_layout_items_only,order,specificity,active"),
    
    getActionsLayoutM2MItems: (baseUrl, g_ck, layoutSysIds) => 
        fetchAndEnrich(baseUrl, "sys_ux_m2m_action_layout_item", g_ck, `ux_form_action_layoutIN${layoutSysIds.join(',')}`, "sys_id,ux_form_action_layout,ux_form_action_layout_item,table,order,display_type,variant,active"),
    
    getActionsLayoutItems: (baseUrl, g_ck, layoutItemsM2MSysIds) => 
        fetchAndEnrich(baseUrl, "sys_ux_form_action_layout_item", g_ck, `sys_idIN${layoutItemsM2MSysIds.join(',')}`, "sys_id,name,label,item_type,order,table,action,layout_group,active,overflow,color"),
    
    getActions: (baseUrl, g_ck, actionSysIds) => 
        fetchAndEnrich(baseUrl, "sys_ux_form_action", g_ck, `sys_idIN${actionSysIds.join(',')}`, "sys_id,name,action_type,ui_action,declarative_action,table,active,specificity"),
    
    getUiActions: (baseUrl, g_ck, uiActionSysIds) => 
        fetchAndEnrich(baseUrl, "sys_ui_action", g_ck, `sys_idIN${uiActionSysIds.join(',')}`, "sys_id,name,table,active,condition"),
    
    getDeclarativeActions: (baseUrl, g_ck, declarativeActionSysIds) => 
        fetchAndEnrich(baseUrl, "sys_declarative_action_assignment", g_ck, `sys_idIN${declarativeActionSysIds.join(',')}`, "sys_id,label,action_name,declarative_action_type,active,model"),
    
    /**
     * Assignments (List, Related list, Field decorators) related API calls
     */
    getActionsAssignmentsM2M: (baseUrl, g_ck, actionConfigId) => 
        fetchAndEnrich(baseUrl, "sys_ux_m2m_action_assignment_action_config", g_ck, `action_configuration=${actionConfigId}`, "sys_id,action_assignment"),

    /**
     * View rules related API calls
     */
    getViewRulesConfig: (baseUrl, g_ck, viewRuleConfigId) => 
        fetchAndEnrich(baseUrl, "sys_ux_view_rules_configuration", g_ck, `sys_id=${viewRuleConfigId}`, "sys_id,name,active"),
    
    getViewRulesM2M: (baseUrl, g_ck, viewRuleConfigId) => 
        fetchAndEnrich(baseUrl, "sys_ux_m2m_workspace_view_rule_ux_view_rule_config", g_ck, `view_rules_configuration=${viewRuleConfigId}`, "sys_id,view_rules_configuration,workspace_view_rule"),
    
    getViewRules: (baseUrl, g_ck, viewRuleSysIds) => 
        fetchAndEnrich(baseUrl, "sysrule_view_workspace", g_ck, `sys_idIN${viewRuleSysIds.join(',')}`, "sys_id,name,table,view,experience_restricted,order,active,roles,condition"),
    
    getViews: (baseUrl, g_ck, viewsSysIds) => 
        fetchAndEnrich(baseUrl, "sys_ui_view", g_ck, `sys_idIN${viewsSysIds.join(',')}`, "sys_id,name,table,title,hidden,roles"),
}

