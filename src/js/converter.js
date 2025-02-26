// This file contains functions to convert user-input XML content into corresponding DTD content based on the selected conversion mode (normal or strict).

function convertXMLToDTD(xmlInput, mode) {
    let dtdOutput = '';
    
    // Parse the XML input
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlInput, 'application/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length) {
        throw new Error('Invalid XML input');
    }

    // Generate DTD based on the selected mode
    if (mode === 'normal') {
        dtdOutput = generateNormalDTD(xmlDoc);
    } else if (mode === 'strict') {
        dtdOutput = generateStrictDTD(xmlDoc);
    } else {
        throw new Error('Invalid conversion mode');
    }

    return dtdOutput;
}

function generateNormalDTD(xmlDoc) {
    let dtd = '';
    const elements = xmlDoc.getElementsByTagName('*');

    for (let element of elements) {
        dtd += `<!ELEMENT ${element.tagName} (#PCDATA)*>\n`;
    }

    return dtd;
}

function generateNormalDTD(xmlDoc) {
    let dtd = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    // Store unique elements with their children
    const elements = {};
    
    // Process all elements to collect their structure
    function analyzeElement(element) {
        const tagName = element.tagName;
        
        // Initialize if first time seeing this element
        if (!elements[tagName]) {
            elements[tagName] = { children: new Set(), attributes: {} };
        }
        
        // Always include #PCDATA for normal mode
        elements[tagName].children.add('#PCDATA');
        
        // Add child elements
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            elements[tagName].children.add(child.tagName);
            // Recursively analyze child elements
            analyzeElement(child);
        }
        
        // Process attributes (if any)
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            // Assume all attributes are CDATA and #REQUIRED like in the Python version
            elements[tagName].attributes[attr.name] = ['CDATA', '#REQUIRED'];
        }
    }
    
    // Start with the root element
    analyzeElement(xmlDoc.documentElement);
    
    // Generate DTD content from collected data
    for (const [tagName, info] of Object.entries(elements)) {
        // Create element declaration with #PCDATA always first
        const childrenList = Array.from(info.children);
        // Always include PCDATA in first position
        const contentModel = childrenList.join(' | ');
        dtd += `<!ELEMENT ${tagName} (${contentModel})*>\n`;
        
        // Add attribute declarations if any
        if (Object.keys(info.attributes).length > 0) {
            let attrStr = '';
            for (const [attrName, [attrType, attrRequired]] of Object.entries(info.attributes)) {
                attrStr += `${attrName} ${attrType} ${attrRequired} `;
            }
            dtd += `<!ATTLIST ${tagName} ${attrStr.trim()}>\n`;
        }
    }
    
    return dtd;
}