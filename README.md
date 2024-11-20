# NUML-QEC-Auto-Fill

Automate NUML QEC evaluations effortlessly! This script fills forms accurately, saving time. Customize reviews easily for efficient feedback.

<img src="numl.png" alt="NUML Logo" width="200">

Auto Evaluation Script

This repository contains a template script for automating course evaluations by setting radio inputs and filling out textareas with a predefined evaluation text.

## Usage Instructions

1. **Select Radio Inputs:**
   - The script selects all radio input elements with a specific value and clicks each one to set its value.
   - **To set the rating value:** Change the value in `input[type='radio'][value='5']` to 1, 2, 3, 4, or 5 based on your rating.

2. **Fill Textareas:**
   - The script selects all textarea elements on the page and appends a predefined evaluation text to each one.
   - **To customize the review text:** Modify the `const evaluationText` variable in the script to match your own review.

## How to Use

1. **Open the Evaluation Form:**
   - Navigate to the web page where you want to run the script (e.g., a course evaluation form).

2. **Open the Browser's Developer Console:**
   - Usually, you can open the console by pressing `F12` or right-clicking on the page and selecting "Inspect", then going to the "Console" tab.

3. **Copy and Paste the Script:**
   - Copy the entire script from `auto-evaluation-script.js`.
   - Paste the script into the console and press `Enter`.
   - If browser isn't allowing to paste,then type 'allow pasting' and paste the script again.

## Example Script

```javascript
// This script automatically selects radio buttons and fills out textareas on a course evaluation form.

// Select all radio input elements with a value of 5 (you can change the value to 1, 2, 3, or 4 if needed)
const radioInputs = document.querySelectorAll("input[type='radio'][value='5']");

// Click each radio input to set its value
radioInputs.forEach(input => input.click());

// Select all textarea elements on the page
const textAreas = document.querySelectorAll("textarea");

// Define the evaluation text to be inserted into each textarea
// You can customize this text to match your review
const evaluationText = `
Your review here. For example:
The teaching in this course was outstanding. The lectures were clear and well-paced, making it easy to understand the material. The teacher's approach was organized and the teaching methods were engaging. The course materials were helpful and included practical examples that made the content relevant and easy to grasp. The teacher was responsive to student queries and provided timely, constructive feedback. Overall, this course was a valuable and enjoyable experience.
`;

// Append the evaluation text to each textarea element
textAreas.forEach(textArea => {
  textArea.value += evaluationText;
});
