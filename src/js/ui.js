// This file manages the user interface interactions, such as handling button clicks and updating the display with the converted DTD content.

document.addEventListener('DOMContentLoaded', () => {
    const xmlInput = document.getElementById('xmlInput');
    const dtdOutput = document.getElementById('dtdOutput');
    const convertButton = document.getElementById('convertButton');
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');
    const normalModeBtn = document.getElementById('normalMode');
    const strictModeBtn = document.getElementById('strictMode');
    const debugModeBtn = document.getElementById('debugMode');
    
    // Track the current mode
    let currentMode = 'normal';
    
    // Set default active state
    normalModeBtn.classList.add('active');
    
    // Mode selection
    normalModeBtn.addEventListener('click', () => {
        currentMode = 'normal';
        updateModeButtons();
    });
    
    strictModeBtn.addEventListener('click', () => {
        currentMode = 'strict';
        updateModeButtons();
    });
    
    function updateModeButtons() {
        normalModeBtn.classList.toggle('active', currentMode === 'normal');
        strictModeBtn.classList.toggle('active', currentMode === 'strict');
    }

    // Convert XML to DTD
    convertButton.addEventListener('click', () => {
        try {
            const xmlContent = xmlInput.value;
            if (!xmlContent.trim()) {
                alert('Please enter some XML content');
                return;
            }
            
            const dtdContent = convertXMLToDTD(xmlContent, currentMode);
            dtdOutput.value = dtdContent;
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error(error);
        }
    });
    
    // Copy DTD to clipboard
    copyButton.addEventListener('click', () => {
        dtdOutput.select();
        document.execCommand('copy');
        alert('DTD copied to clipboard!');
    });
    
    // Download DTD file
    downloadButton.addEventListener('click', () => {
        const dtdContent = dtdOutput.value;
        if (!dtdContent.trim()) {
            alert('No DTD content to download');
            return;
        }
        
        const blob = new Blob([dtdContent], {type: 'application/xml-dtd'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated.dtd';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Debug functionality
    debugModeBtn.addEventListener('click', () => {
        try {
            const xmlContent = xmlInput.value;
            const dtdContent = dtdOutput.value;
            
            if (!xmlContent.trim() || !dtdContent.trim()) {
                alert('Both XML and DTD content are required for debugging');
                return;
            }
            
            const debugResults = debugXML(xmlContent, dtdContent);
            displayDebugResults(debugResults);
        } catch (error) {
            alert(`Debug error: ${error.message}`);
            console.error(error);
        }
    });
    
    function displayDebugResults(results) {
        // Create modal for results if it doesn't exist
        let modal = document.getElementById('debug-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'debug-modal';
            modal.className = 'modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const closeBtn = document.createElement('span');
            closeBtn.className = 'close-button';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            };
            
            const title = document.createElement('h3');
            title.textContent = 'Debug Results';
            
            const resultsDiv = document.createElement('div');
            resultsDiv.id = 'debug-output';
            
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(title);
            modalContent.appendChild(resultsDiv);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Close when clicking outside the modal
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
        }
        
        // Update results and show modal
        const debugOutput = document.getElementById('debug-output');
        if (results.length === 0) {
            debugOutput.innerHTML = '<p class="success">No errors found! XML is valid against the DTD.</p>';
        } else {
            debugOutput.innerHTML = results.map(result => 
                `<p class="error">${result}</p>`).join('');
        }
        
        modal.style.display = 'block';
    }
});