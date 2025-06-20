# NUML-QEC-Auto-Fill

Automate NUML QEC evaluations effortlessly! This script fills forms accurately, saving time. Customize reviews easily for efficient feedback.

<img src="numl.png" alt="NUML Logo" width="200">

## Auto Evaluation Script

This repository contains a script for automating NUML's Quality Enhancement Cell (QEC) course and teacher evaluations by automatically setting radio inputs and filling out textareas with predefined, customizable evaluation text.

## Features

- **Auto-fill Both Form Types**: Works with both Teacher Evaluation and Course Evaluation forms
- **Customizable Ratings**: Choose from fixed or randomized ratings (1-5)
- **Well-Crafted Comments**: Includes thoughtful, detailed comments for all required fields
- **Attendance Selection**: Special handling for the attendance question in Course forms
- **User-Friendly Interface**: Control panel with easy configuration options
- **Single Form or Batch Processing**: Fill one form or process all pending forms

## Usage Instructions

### Basic Setup

1. **Open the Evaluation Form**:
   - Navigate to the QEC dashboard or a specific evaluation form at [https://qec.numl.edu.pk/qec/Student/Dashboard.aspx](https://qec.numl.edu.pk/qec/Student/Dashboard.aspx)

2. **Open the Browser's Developer Console**:
   - Press `F12` or right-click on the page and select "Inspect" → "Console" tab

3. **Copy and Paste the Script**:
   - Copy the entire script from `auto-evaluation-script.js`
   - Paste the script into the console and press Enter
   - If browser isn't allowing to paste, type 'allow pasting' and paste the script again

### Using the Control Panel

After running the script, a control panel will appear in the top-right corner with these options:

- **Rating Preferences**: Choose how teachers and courses are rated
- **Attendance Level**: Select your attendance percentage for Course forms
- **Auto-submit**: Option to automatically submit forms after filling
- **Process options**: Choose which form types to process

### Starting the Auto-Fill Process

- **From Dashboard**: Use "Start Auto-Fill Process" to fill all pending forms automatically
- **On Individual Forms**: Use "Fill This Teacher Form" or "Fill This Course Form"

### Important Notes

1. **Script Persistence**: Currently, you need to paste the script again after each page navigation
   
2. **Course Evaluation Error**: If you see an error message after submitting a Course Evaluation form:
   - **Don't panic!** The form is actually saved successfully
   - Refresh the page to continue with the next form
   - The error is a known issue with the QEC system, not our script

3. **Form Count**: You can see how many forms you've completed vs. how many remain at the top of the control panel

## Demo

![Auto-Fill Script Demo](demo.webp)
<!-- GIF showing the script in action will be placed here -->

## Customization

You can adjust several settings directly in the control panel:

- **Teacher Rating**: Excellent (5), Good (4), Average (3), or Randomized
- **Course Rating**: Excellent (5), Good (4), Average (3), or Randomized
- **Attendance Level**: >81%, 80%, 60%, 40%, or 20% 
- **Form Processing**: Enable/disable Teacher and Course form processing

## Troubleshooting

- If the script doesn't appear to work, refresh the page and try again
- Make sure you're logged into the QEC system before running the script
- If form submission fails, try setting "Auto-submit" to off and submit manually

The script is designed to work with NUML's QEC system as of 2025. If the system changes, updates may be required.
