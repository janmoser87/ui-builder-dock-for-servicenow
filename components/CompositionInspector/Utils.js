// Utils
import { fetchTableData, getGck } from "~scripts/Utils";

/**
 * Recursively extracts macroponent references from a composition tree.
 * Traverses the composition and its overrides to find nodes defined as MACROPONENT or REPEATER.
 */
const getMacroponentsFromComposition = (composition = [], macroponents = []) => {
    if (!Array.isArray(composition)) return macroponents;

    composition.forEach(compositionNode => {
        if (compositionNode.definition && compositionNode.definition.type === 'MACROPONENT' || compositionNode.definition.type === 'REPEATER') {
            const { definition, elementId, elementLabel, overrides } = compositionNode;
            macroponents.push({ definition, elementId, elementLabel });

            if (overrides && Array.isArray(compositionNode.overrides.composition)) {
                getMacroponentsFromComposition(overrides.composition, macroponents);
            }
        }

    })

    return macroponents;
}

/**
 * Asynchronously fetches definitions for all macroponents found within the composition.
 * Uses a recursive approach to fetch nested macroponents (macroponents inside macroponents),
 * preventing infinite loops using a Set of visited IDs.
 */
const loadMacroponents = async (composition = [], macroponents = [], tabData, g_ck, visitedIDs = new Set()) => {

    let macroponentsInComposition = getMacroponentsFromComposition(composition)

    if (!macroponentsInComposition[0]) {
        return
    }

    let macroponentIDsToFetch = macroponentsInComposition
        .map(macroponent => macroponent.definition.id)
        .filter(macroponentID => !visitedIDs.has(macroponentID))

    if (macroponentIDsToFetch.length === 0) {
        return
    }

    macroponentIDsToFetch.forEach(id => visitedIDs.add(id))

    let [macroponentsErr, macroponentsData] = await fetchTableData(tabData.tabUrlBase, "sys_ux_macroponent", g_ck, `sysparm_query=sys_idIN${macroponentIDsToFetch.join(',')}^composition!=[]&sysparm_fields=sys_id,composition,name,category,description`)
    if (macroponentsErr) {
        return
    }

    const recursivePromises = macroponentsData.map(async (macroponent) => {

        macroponents.push(macroponent)

        let childComposition
        try {
            childComposition = JSON.parse(macroponent.composition);
        } catch (e) {
            return;
        }

        if (Array.isArray(childComposition) && childComposition[0]) {
            await loadMacroponents(childComposition, macroponents, tabData, g_ck, visitedIDs)
        }

    })

    await Promise.all(recursivePromises)

}

/**
 * Constructs a hierarchical tree structure by merging the composition with fetched macroponent data.
 * Resolves overrides and expands macroponent definitions into nested children.
 */
const buildTree = (composition, allMacroponents, allMacroponentsMap = null) => {

    if (!allMacroponentsMap) {
        allMacroponentsMap = new Map();
        allMacroponents.forEach(macroponent => {
            allMacroponentsMap.set(macroponent.sys_id, macroponent);
        });
    }

    if (!Array.isArray(composition)) return [];

    return composition.map(compNode => {

        let compositionNode = {
            ...compNode,
            isComponentWithComposition: false,
            children: []
        }

        /**
         * Building children from overrides
         */
        if (compositionNode.overrides && Array.isArray(compositionNode.overrides.composition)) {
            const overrideChildren = buildTree(compositionNode.overrides.composition, null, allMacroponentsMap);
            compositionNode.children.push(...overrideChildren);
        }

        const dbRecord = allMacroponentsMap.get(compositionNode.definition.id);
        if (dbRecord) {


            /**
             * Bulding children from what this macroponent contains inside (that would be UIB Components)
             */
            if (dbRecord.composition) {
                try {
                    // DB returns string, parsing needed here
                    const innerComposition = JSON.parse(dbRecord.composition)
                    const innerChildren = buildTree(innerComposition, null, allMacroponentsMap)

                    compositionNode.children.push(...innerChildren)
                    compositionNode.isComponentWithComposition = true

                } catch (e) {
                    console.warn("Chyba parsování kompozice pro", compositionNode.elementId);
                }
            }
            
        }

        /**
         * Finally, we want to withdraw some important properties to display later on
         */
        compositionNode = extractCompositionProperties(compositionNode, dbRecord);

        return compositionNode;
    });
}

/**
 * Analyzes a composition node to extract specific properties like visibility logic and event handling.
 */
const extractCompositionProperties = (compositionNode, dbRecord) => {
    
    let extractedProperties = {
        isHidden: false,
        description: null,
        isHandlingEvents: false,
        hasHideLogic: false,
        hideLogicMethod: '',

    } 

    // isHidden check
    if (compositionNode.isHidden) {
        let hasHideLogic = false
        let hideLogicMethod
        const {type, value, operation, script} = compositionNode.isHidden
        
        // Checkbox
        if (type === 'JSON_LITERAL' && value === true) {
            hasHideLogic = true
            hideLogicMethod = 'Checkbox'
        }

        // Data binding
        if ((type === 'BINARY' || type === 'UNARY') && operation) {
            hasHideLogic = true
            hideLogicMethod = 'Data binding'
        }

        // Scripting
        if (type === 'CLIENT_TRANSFORM_SCRIPT' && script) {
            hasHideLogic = true
            hideLogicMethod = 'Script'
        }

        extractedProperties.hasHideLogic = hasHideLogic
        extractedProperties.hideLogicMethod = hideLogicMethod
    }

    // handlesEvents check
    if (compositionNode.eventMappings[0]) {
        extractedProperties.isHandlingEvents = true    
    }

    // Component description
    if (dbRecord && dbRecord.description) {
        extractedProperties.description = dbRecord.description    
    }
    
    compositionNode = {
        ...compositionNode,
        extractedProperties
    }
    
    return compositionNode
}

/**
 * Main entry point to generate the full component tree.
 * Handles authentication, recursive data fetching, and tree construction.
 */
export const generateComponentTree = async (rootComposition = [], tabData) => {

    if (!rootComposition[0]) {
        return [];
    }

    const g_ck = await getGck()

    let allMacroponents = []
    await loadMacroponents(rootComposition, allMacroponents, tabData, g_ck, new Set())

    let tree = []
    tree = buildTree(rootComposition, allMacroponents)

    return tree

}