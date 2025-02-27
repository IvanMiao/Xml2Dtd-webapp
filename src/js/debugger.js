// This file implements the debugging functionality, applying the generated DTD rules to the XML content and checking for errors.

function debugXML(xmlContent, dtdContent) {
    const errors = [];
    
    // First check if XML is well-formed
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
    
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
        return ["XML is not well-formed: " + parseError[0].textContent];
    }

    // Parse DTD rules
    const dtdRules = parseDTD(dtdContent);
    
    // Validate root element
    const rootElement = xmlDoc.documentElement;
    if (!dtdRules.elements[rootElement.tagName]) {
        errors.push(`Root element <${rootElement.tagName}> is not defined in the DTD.`);
        return errors;
    }
    
    // Recursively validate all elements
    validateElement(rootElement, dtdRules, errors);
    
    return errors;
}

function parseDTD(dtdContent) {
    const rules = {
        elements: {},
        attributes: {}
    };
    
    // Extract element declarations
    const elementRegex = /<!ELEMENT\s+(\w+)\s+([^>]+)>/g;
    let elementMatch;
    
    while ((elementMatch = elementRegex.exec(dtdContent)) !== null) {
        const elementName = elementMatch[1];
        const contentModel = elementMatch[2].trim();
        
        rules.elements[elementName] = parseContentModel(contentModel);
    }
    
    // Extract attribute declarations
    const attlistRegex = /<!ATTLIST\s+(\w+)([^>]+)>/g;
    let attlistMatch;
    
    while ((attlistMatch = attlistRegex.exec(dtdContent)) !== null) {
        const elementName = attlistMatch[1];
        const attDefs = attlistMatch[2].trim();
        
        if (!rules.attributes[elementName]) {
            rules.attributes[elementName] = {};
        }
        
        // Parse individual attribute definitions
        const attrDefRegex = /\s+(\w+)\s+(\w+)\s+(#\w+|\w+)/g;
        let attrMatch;
        
        while ((attrMatch = attrDefRegex.exec(attDefs)) !== null) {
            const attrName = attrMatch[1];
            const attrType = attrMatch[2];
            const attrDefault = attrMatch[3];
            
            rules.attributes[elementName][attrName] = {
                type: attrType,
                default: attrDefault
            };
        }
    }
    
    return rules;
}

function parseContentModel(contentModel) {
    // Simple content model parser
    if (contentModel === 'EMPTY') {
        return { type: 'EMPTY' };
    }
    
    if (contentModel === '(#PCDATA)') {
        return { type: 'PCDATA' };
    }
    
    if (contentModel.startsWith('(#PCDATA') && contentModel.endsWith(')*')) {
        // Mixed content
        return { 
            type: 'MIXED',
            allowedElements: contentModel
                .substring(9, contentModel.length - 2)
                .split('|')
                .map(e => e.trim())
                .filter(e => e !== '')
        };
    }
    
    // Element content model
    return {
        type: 'CHILDREN',
        model: contentModel
    };
}

function validateElement(element, dtdRules, errors) {
    const elementName = element.tagName;
    const elementRule = dtdRules.elements[elementName];
    
    // Check if element is defined in DTD
    if (!elementRule) {
        errors.push(`Element <${elementName}> is not defined in the DTD.`);
        return;
    }
    
    // Validate based on content model
    switch (elementRule.type) {
        case 'EMPTY':
            if (element.childNodes.length > 0 && 
                Array.from(element.childNodes).some(n => 
                    n.nodeType !== Node.COMMENT_NODE && 
                    !(n.nodeType === Node.TEXT_NODE && n.nodeValue.trim() === '')
                )) {
                errors.push(`Element <${elementName}> should be empty but contains content.`);
            }
            break;
            
        case 'PCDATA':
            if (element.children.length > 0) {
                errors.push(`Element <${elementName}> should only contain text but has child elements.`);
            }
            break;
            
        case 'MIXED':
            // For mixed content, validate that only allowed elements are present
            for (let i = 0; i < element.children.length; i++) {
                const childTag = element.children[i].tagName;
                if (!elementRule.allowedElements.includes(childTag)) {
                    errors.push(`Element <${childTag}> is not allowed in mixed content of <${elementName}>.`);
                }
            }
            break;
            
        case 'CHILDREN':
            // More complex validation would be needed for sequence models
            // For now, just check if children are defined in DTD
            for (let i = 0; i < element.children.length; i++) {
                const child = element.children[i];
                if (!dtdRules.elements[child.tagName]) {
                    errors.push(`Child element <${child.tagName}> of <${elementName}> is not defined in the DTD.`);
                }
            }
            break;
    }
    
    // Validate attributes
    if (dtdRules.attributes[elementName]) {
        const requiredAttrs = new Set();
        
        // Find required attributes
        for (const [attrName, attrDef] of Object.entries(dtdRules.attributes[elementName])) {
            if (attrDef.default === '#REQUIRED') {
                requiredAttrs.add(attrName);
            }
        }
        
        // Check that all required attributes are present
        for (const requiredAttr of requiredAttrs) {
            if (!element.hasAttribute(requiredAttr)) {
                errors.push(`Required attribute "${requiredAttr}" missing from element <${elementName}>.`);
            }
        }
        
        // Check for undefined attributes
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (!dtdRules.attributes[elementName][attr.name]) {
                errors.push(`Attribute "${attr.name}" on element <${elementName}> is not defined in the DTD.`);
            }
        }
    }
    
    // Recursively validate children
    for (let i = 0; i < element.children.length; i++) {
        validateElement(element.children[i], dtdRules, errors);
    }
}

// Example usage
// const result = debugXML(userInputXML, generatedDTD);
// console.log(result);