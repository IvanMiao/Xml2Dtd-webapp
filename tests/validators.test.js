// This file contains unit tests for the validation functions to ensure they correctly validate XML input.

describe('XML Validators', () => {
    const { validateXML } = require('../src/js/validators');

    test('valid XML should return true', () => {
        const validXML = `<note>
                            <to>Tove</to>
                            <from>Jani</from>
                            <heading>Reminder</heading>
                            <body>Don't forget me this weekend!</body>
                          </note>`;
        expect(validateXML(validXML)).toBe(true);
    });

    test('invalid XML should return false', () => {
        const invalidXML = `<note>
                            <to>Tove</to>
                            <from>Jani</from>
                            <heading>Reminder</heading>
                            <body>Don't forget me this weekend!</note>`;
        expect(validateXML(invalidXML)).toBe(false);
    });

    test('empty XML should return false', () => {
        const emptyXML = '';
        expect(validateXML(emptyXML)).toBe(false);
    });

    test('XML with special characters should return true', () => {
        const specialCharXML = `<message>
                                  <text>Hello & welcome!</text>
                                </message>`;
        expect(validateXML(specialCharXML)).toBe(true);
    });

    test('XML with unclosed tags should return false', () => {
        const unclosedTagXML = `<message>
                                  <text>Hello</text>
                                </message>`;
        expect(validateXML(unclosedTagXML)).toBe(false);
    });
});