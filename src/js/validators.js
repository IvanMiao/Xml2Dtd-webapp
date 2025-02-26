// This file contains validation functions to ensure the XML input is well-formed before conversion.

function isValidXML(xmlString) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        return parseError.length === 0;
    } catch (e) {
        return false;
    }
}

function validateXMLInput(xmlString) {
    if (!xmlString || xmlString.trim() === "") {
        return { isValid: false, message: "Input cannot be empty." };
    }

    if (!isValidXML(xmlString)) {
        return { isValid: false, message: "Invalid XML format." };
    }

    return { isValid: true, message: "Valid XML." };
}