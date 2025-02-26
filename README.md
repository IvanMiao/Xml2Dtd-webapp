# XML to DTD Converter

## Overview
The XML to DTD Converter is a web-based tool that allows users to convert XML content into Document Type Definition (DTD) format. The application provides two conversion modes: normal and strict. Additionally, it includes a debugging function to help users identify issues in their XML content.

## Features
- **User Input**: Users can input XML content directly into the application.
- **Conversion Modes**: Choose between normal and strict conversion modes for generating DTD.
- **Debugging Functionality**: Validate XML content against generated DTD rules to identify errors.
- **Responsive Design**: The application is designed to work seamlessly on various devices, including desktops, tablets, and smartphones.

## Project Structure
```
xml-to-dtd-converter
├── src
│   ├── js
│   │   ├── app.js          # Main JavaScript file for application logic
│   │   ├── converter.js     # Functions for XML to DTD conversion
│   │   ├── debugger.js      # Debugging functionality for XML validation
│   │   ├── ui.js           # User interface management
│   │   └── validators.js    # XML validation functions
│   ├── css
│   │   ├── main.css        # Main styles for the webpage
│   │   ├── components.css   # Styles for specific UI components
│   │   └── responsive.css    # Responsive design styles
│   └── index.html          # Main HTML document
├── assets
│   └── icons
│       ├── copy.svg        # Icon for copy functionality
│       ├── download.svg    # Icon for download functionality
│       └── settings.svg     # Icon for settings functionality
├── tests
│   ├── converter.test.js    # Unit tests for conversion functions
│   └── validators.test.js    # Unit tests for validation version 
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to access the application.

## Usage
- Input your XML in the designated text area.
- Choose between normal and strict conversion modes.
- Click the convert button to generate the corresponding DTD content
- Use the debugging feature to validate your XML against the generated DTD.
- Copy or download the generated DTD as needed.

## License
This project is licensed under the MIT License.