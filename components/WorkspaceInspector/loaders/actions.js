import { api } from "../api";

const loadFormActions = async (baseUrl, g_ck, actionConfigId) => {

    let formActions = { type: 'formActions', label: '📑 Form actions', data: [], errors: [], displayDataCount: true }

    // Layouts
    let actionsLayouts = await api.getActionsLayouts(baseUrl, g_ck, actionConfigId);
    if (!actionsLayouts || actionsLayouts.length === 0) {
        formActions.errors.push(`No actions layouts found for actionConfigId ${actionConfigId}`);
        return formActions;
    }

    // Layout M2M Items
    let actionsLayoutsIds = actionsLayouts.map(layout => layout.sys_id);
    let actionsLayoutM2MItems = await api.getActionsLayoutM2MItems(baseUrl, g_ck, actionsLayoutsIds);
    if (!actionsLayoutM2MItems || actionsLayoutM2MItems.length === 0) {
        formActions.errors.push("No actions layout M2M items found");
        return formActions;
    }

    // Layout Items
    let actionLayoutItemsM2MSysIds = actionsLayoutM2MItems.map(item => item.ux_form_action_layout_item.value);
    let actionsLayoutItems = await api.getActionsLayoutItems(baseUrl, g_ck, actionLayoutItemsM2MSysIds);
    if (!actionsLayoutItems || actionsLayoutItems.length === 0) {
        formActions.errors.push("No actions layout items found");
        return formActions;
    }

    // Actions
    let actionSysIds = actionsLayoutItems
        .filter(item => item.item_type === 'action' && item.action?.value)
        .map(item => item.action.value);
    let actions = await api.getActions(baseUrl, g_ck, actionSysIds);

    // UI Actions
    let uiActionsSysIds = actions
        .filter(action => action.action_type === 'ui_action' && action.ui_action?.value)
        .map(action => action.ui_action.value);
    // Declarative Actions
    let declarativeActionsSysIds = actions
        .filter(action => action.action_type === 'declarative_action' && action.declarative_action?.value)
        .map(action => action.declarative_action.value);

    let [uiActions, declarativeActions] = await Promise.all([
        api.getUiActions(baseUrl, g_ck, uiActionsSysIds),
        api.getDeclarativeActions(baseUrl, g_ck, declarativeActionsSysIds)
    ]);

    /**
     * Joining Actions with UI/Declarative actions
     */
    actions = actions.map(action => {
        let child;
        if (action.action_type === 'ui_action') {
            child = uiActions.find(uiAction => uiAction.sys_id === action.ui_action.value)
        }
        if (action.action_type === 'declarative_action') {
            child = declarativeActions.find(declarativeAction => declarativeAction.sys_id === action.declarative_action.value)
        }
        return {
            ...action,
            child: child
        }
    })

    /**
     * Joining Actions layout items with Actions
     */
    actionsLayoutItems = actionsLayoutItems.map(actionLayoutItem => {
        let child = actions.find(action => action.sys_id === actionLayoutItem.action.value)
        return {
            ...actionLayoutItem,
            child: child
        }
    })

    /**
     * Joining M2M table with Actions layout items
     */
    actionsLayoutM2MItems = actionsLayoutM2MItems.map(m2m => {
        let child = actionsLayoutItems.find(actionLayoutItem => actionLayoutItem.sys_id === m2m.ux_form_action_layout_item.value)
        return {
            ...m2m,
            child: child
        }
    })

    /**
     * Final join --> Layouts with M2M items
     */
    formActions.data = actionsLayouts.map(actionsLayout => {
        let data = actionsLayoutM2MItems.filter(m2m => m2m.ux_form_action_layout.value === actionsLayout.sys_id)
        return {
            ...actionsLayout,
            data: data
        }
    })

    // Table and sys_id for further use
    formActions.table = formActions.data[0]?.table;
    formActions.sys_id = formActions.data[0]?.sys_id;

    return formActions
}

const loadActionsAssignments = async (baseUrl, g_ck, actionConfigId) => {
    let relatedListsSection = { type: 'relatedLists', label: '📃 Related lists', data: [], errors: [], displayDataCount: true }
    let listsSection = { type: 'lists', label: '📋 Lists', data: [], errors: [], displayDataCount: true }
    let fieldDecoratorsSection = { type: 'fieldDecorators', label: '🖋️ Field decorators', data: [], errors: [], displayDataCount: true }

    // M2M Assignments
    let actionsAssignmentsM2M = await api.getActionsAssignmentsM2M(baseUrl, g_ck, actionConfigId);
    if (!actionsAssignmentsM2M || actionsAssignmentsM2M.length === 0) {
        return [relatedListsSection, listsSection, fieldDecoratorsSection];
    }

    // Declarative Actions
    let declarativeActionsSysIds = actionsAssignmentsM2M.map(m2m => m2m.action_assignment.value);
    let declarativeActions = await api.getDeclarativeActions(baseUrl, g_ck, declarativeActionsSysIds);

    // Join M2M with Declarative Actions
    actionsAssignmentsM2M = actionsAssignmentsM2M.map(m2m => {
        let child = declarativeActions.find(declarativeAction => declarativeAction.sys_id === m2m.action_assignment.value)
        return {
            ...m2m,
            child: child
        }
    })

    // Split into sections
    actionsAssignmentsM2M.forEach(assignment => {
        if (assignment.child.model.value === 'd91731a9534723003eddddeeff7b121c') {
            // Related List
            relatedListsSection.data.push(assignment);
        } else if (assignment.child.model.value === 'c3547169534723003eddddeeff7b126c') {
            // List
            listsSection.data.push(assignment);
        } else if (assignment.child.model.value === '15920e6d534723003eddddeeff7b1244') {
            // Field Decorator
            fieldDecoratorsSection.data.push(assignment);
        }
    });

    return [relatedListsSection, listsSection, fieldDecoratorsSection];
}

export const loadActionsSection = async (baseUrl, g_ck, actionConfigId) => {
    
    // Section init
    let actionsSection = { type: 'actions', label: '👆 Actions', actionConfigId, data: [], errors: [] };
    
    // No actionConfigId provided
    if (!actionConfigId) {
        actionsSection.errors.push("No actionConfigId provided.");
        return actionsSection;
    }

    if (actionConfigId) {

        // Config
        const actionsConfig = await api.getActionsConfig(baseUrl, g_ck, actionConfigId);
        if (!actionsConfig) {
            actionsSection.errors.push(`Actions config with sys_id ${actionConfigId} not found.`);
            return actionsSection;
        }

        // Config found and it will always be only one record there
        let actionsConfigRecord = actionsConfig[0];
        
        // Initialize sections array as there will be multiple action types (Form Actions, List Actions, etc.)
        actionsConfigRecord.sections = [];
        actionsSection.data.push(actionsConfigRecord)

        // Form Actions
        let formActions = await loadFormActions(baseUrl, g_ck, actionConfigId);
        actionsConfigRecord.sections.push(formActions);

        // Assignments (Related Lists, Lists, Field Decorators)
        let [relatedListsSection, listsSection, fieldDecoratorsSection] = await loadActionsAssignments(baseUrl, g_ck, actionConfigId);
        actionsConfigRecord.sections.push(relatedListsSection);
        actionsConfigRecord.sections.push(listsSection);
        actionsConfigRecord.sections.push(fieldDecoratorsSection);

        // Form Actions - Table and sys_id for further use
        formActions.table = actionsConfigRecord.table;
        formActions.sys_id = actionsConfigRecord.sys_id;

        // Related Lists Section - Table and sys_id for further use
        relatedListsSection.table = actionsConfigRecord.table;
        relatedListsSection.sys_id = actionsConfigRecord.sys_id;

        // Lists Section - Table and sys_id for further use
        listsSection.table = actionsConfigRecord.table;
        listsSection.sys_id = actionsConfigRecord.sys_id;

        // Field Decorators Section - Table and sys_id for further use
        fieldDecoratorsSection.table = actionsConfigRecord.table;
        fieldDecoratorsSection.sys_id = actionsConfigRecord.sys_id;

        // Actions Section - Table and sys_id for further use
        actionsSection.table = actionsConfigRecord.table;
        actionsSection.sys_id = actionsConfigRecord.sys_id;

    }

    return actionsSection;
}