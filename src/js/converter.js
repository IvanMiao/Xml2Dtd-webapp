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
    let dtd = '<?xml version="1.0" encoding="UTF-8"?>\n';
        
    // Store unique elements with their children
    const elements = {};
    
    // Process all elements to collect their structure
    function analyzeElement(element) {
        const tagName = element.tagName;
        
        // Initialize if first time seeing this element
        if (!elements[tagName]) {
            elements[tagName] = { 
                children: new Set(), 
                attributes: {}, 
                hasText: element.childNodes.length > element.children.length
            };
        }
        
        // Check if element has text content
        if (Array.from(element.childNodes).some(node => 
            node.nodeType === Node.TEXT_NODE && node.nodeValue.trim())) {
            elements[tagName].hasText = true;
        }
        
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
            elements[tagName].attributes[attr.name] = ['CDATA', '#REQUIRED'];
        }
    }
    
    // Start with the root element
    analyzeElement(xmlDoc.documentElement);
    
    // Generate DTD content from collected data
    for (const [tagName, info] of Object.entries(elements)) {
        // Create element declaration
        let contentModel;
        
        if (info.children.size === 0) {
            // No child elements, only text
            contentModel = info.hasText ? '(#PCDATA)' : 'EMPTY';
        } else if (info.hasText) {
            // Mixed content model
            const childrenList = Array.from(info.children);
            contentModel = `(#PCDATA | ${childrenList.join(' | ')})*`;
        } else {
            // Element-only content model
            const childrenList = Array.from(info.children);
            contentModel = `(${childrenList.join(' | ')})*`;
        }
        
        dtd += `<!ELEMENT ${tagName} ${contentModel}>\n`;
        
        // Add attribute declarations if any
        if (Object.keys(info.attributes).length > 0) {
            dtd += `  <!ATTLIST ${tagName}\n`;
            for (const [attrName, [attrType, attrRequired]] of Object.entries(info.attributes)) {
                dtd += `    ${attrName} ${attrType} ${attrRequired}\n`;
            }
            dtd += '>\n';
        }
    }
    
        return dtd;
}

function generateStrictDTD(xmlDoc) {
    let dtd = '<?xml version="1.0" encoding="UTF-8"?>\n';

    
    // Store unique elements with their structure
    const elements = {};
    const elementOccurrences = {};
    
    // Helper function to determine element occurrence
    function getOccurrence(parent, childTag) {
        const key = `${parent}:${childTag}`;
        return elementOccurrences[key] || 0;
    }
    
    // Process all elements to collect their structure
    function analyzeElement(element, parentTag = null) {
        const tagName = element.tagName;
        
        // Track occurrences for determining cardinality
        if (parentTag) {
            const key = `${parentTag}:${tagName}`;
            elementOccurrences[key] = (elementOccurrences[key] || 0) + 1;
        }
        
        // Initialize if first time seeing this element
        if (!elements[tagName]) {
            elements[tagName] = {
                childOrder: [],
                childOccurrences: {},
                attributes: {},
                hasText: false
            };
        }
        
        // Check if element has non-whitespace text content
        const hasTextContent = Array.from(element.childNodes).some(node => 
            node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
        
        if (hasTextContent) {
            elements[tagName].hasText = true;
        }
        
        // Process child elements in order
        const childElements = [];
        
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            childElements.push(child.tagName);
            
            // Track occurrences of this child under this parent
            if (!elements[tagName].childOccurrences[child.tagName]) {
                elements[tagName].childOccurrences[child.tagName] = 0;
                elements[tagName].childOrder.push(child.tagName);
            }
            elements[tagName].childOccurrences[child.tagName]++;
            
            // Recursively analyze child elements
            analyzeElement(child, tagName);
        }
        
        // Process attributes
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            elements[tagName].attributes[attr.name] = ['CDATA', '#REQUIRED'];
        }
    }
    
    // Start analysis with root element
    analyzeElement(xmlDoc.documentElement);
    
    // Determine appropriate cardinality markers for each child element
    for (const [tagName, info] of Object.entries(elements)) {
        for (const childTag of info.childOrder) {
            const count = info.childOccurrences[childTag];
            
            // Determine cardinality symbol
            if (count === 1) {
                // Check if this occurs in every instance of the parent
                const parentCount = Object.values(elementOccurrences).reduce((sum, c) => sum + c, 0);
                const childCount = getOccurrence(tagName, childTag);
                
                info.childOccurrences[childTag] = childCount < parentCount ? '?' : '';
            } else if (count > 1) {
                info.childOccurrences[childTag] = '+';
            }
        }
    }
    
    // Generate DTD content
    for (const [tagName, info] of Object.entries(elements)) {
        let contentModel;
        
        if (info.childOrder.length === 0) {
            // No child elements
            contentModel = info.hasText ? '(#PCDATA)' : 'EMPTY';
        } else if (info.hasText) {
            // Mixed content
            contentModel = `(#PCDATA | ${info.childOrder.join(' | ')})*`;
        } else {
            // Sequence of elements with cardinality
            const childSequence = info.childOrder.map(child => 
                `${child}${info.childOccurrences[child]}`
            );
            contentModel = `(${childSequence.join(', ')})`;
        }
        
        dtd += `<!ELEMENT ${tagName} ${contentModel}>\n`;
        
        // Add attribute declarations
        if (Object.keys(info.attributes).length > 0) {
            dtd += `  <!ATTLIST ${tagName}\n`;
            for (const [attrName, [attrType, attrRequired]] of Object.entries(info.attributes)) {
                dtd += `    ${attrName} ${attrType} ${attrRequired}\n`;
            }
            dtd += '>\n';
        }
    }
    
    return dtd;
}