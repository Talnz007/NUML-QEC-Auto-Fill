// QEC Dashboard Auto-Fill Script - Enhanced Version
// This script automatically fills out all Teacher and Course Evaluation Forms from the Dashboard

// Configuration options
const config = {
    // Rating preferences
    teacherRating: {
        min: 4,            // Minimum rating (1-5)
        max: 5,            // Maximum rating (1-5)
        randomize: true,   // Set to false for consistent ratings
        defaultValue: 5    // Default rating if not randomizing
    },
    courseRating: {
        min: 4,            // Minimum rating (1-5)
        max: 5,            // Maximum rating (1-5)
        randomize: true,   // Set to false for consistent ratings
        defaultValue: 5    // Default rating if not randomizing
    },
    // Attendance option for Course Evaluation Q.5
    attendanceValue: '>81%',  // Options: '>81%', '80%', '60%', '40%', '20%'
    
    // Comment customization
    addComments: true,     // Set to false to skip comments
    
    // Processing options
    autoSubmit: true,      // Automatically submit forms after filling
    delayBetweenForms: 2000, // Wait time between forms in milliseconds
    
    // Execution mode
    processTeacherForms: true,  // Process teacher evaluation forms
    processCourseforms: true,   // Process course evaluation forms
    
    // Advanced settings
    debug: false,          // Set to true to log actions without filling the form
    verbose: true,         // Show detailed logs
};

// URLs for the dashboard and evaluation forms
const URLS = {
    dashboard: 'https://qec.numl.edu.pk/qec/Student/Dashboard.aspx',
    teacherForm: 'https://qec.numl.edu.pk/qec/Student/TeacherEvaluationForm.aspx',
    courseForm: 'https://qec.numl.edu.pk/qec/Student/CourseEvaluationForm.aspx'
};

// Generate a random integer between min and max (inclusive)
function getRandomRating(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate appropriate comments based on form type
function getComments(formType, section) {
    const teacherComments = {
        'done_well': `The instructor demonstrated exceptional teaching skills by presenting complex concepts in a clear and understandable manner. Their approach to teaching was methodical and well-structured, making it easy to follow along. The instructor maintained an engaging classroom environment, encouraging thoughtful discussions and addressing student questions thoroughly. Their ability to connect theoretical concepts with real-world applications greatly enhanced the learning experience.`,
        
        'improvements': `To further enhance the course, the instructor could consider incorporating more interactive elements like group projects or case studies. Additionally, providing more practice problems or supplementary materials for challenging topics would be beneficial for students who want to delve deeper into the subject matter. Perhaps holding occasional review sessions before major assessments would also help solidify understanding of complex topics.`,
        
        'additional': `The instructor's passion for the subject was evident throughout the semester, which made the learning experience more enjoyable. Their willingness to provide additional support outside regular class hours demonstrated their commitment to student success. Overall, this was a valuable course that effectively balanced academic rigor with practical application.`
    };
    
    const courseComments = {
        'content_organization': `The course content was well-structured and logically organized, making it easy to follow the progression of topics throughout the semester. The learning objectives were clearly defined, and the workload was appropriately challenging without being overwhelming. The course materials were up-to-date and relevant to current industry standards.`,
        
        'student_contribution': `The course design encouraged active participation and collaborative learning among students. The assignments and projects provided ample opportunity to apply theoretical knowledge to practical scenarios, enhancing our understanding of the subject matter.`,
        
        'learning_environment': `The learning environment fostered open discussion and critical thinking. The blend of lectures, tutorials, and practical sessions created a comprehensive learning experience that accommodated different learning styles. The digital tools and resources used in the classroom enhanced the learning experience.`,
        
        'learning_resources': `The recommended readings and additional resources were highly relevant and well-curated. They provided deeper insights into the subject matter and supported the concepts covered in lectures. The online resources were easily accessible and well-organized.`,
        
        'quality_delivery': `The course content was delivered in an engaging manner that stimulated interest in the subject. The pace of instruction was appropriate, allowing sufficient time to grasp complex concepts while maintaining momentum throughout the semester. The presentations were clear and well-structured.`,
        
        'assessment': `The assessment methods effectively evaluated both understanding and application of knowledge. The feedback provided was constructive and helped identify areas for improvement. The variety of assessment methods allowed students to demonstrate their knowledge in different formats.`,
        
        'instructor': `The instructor presented the material clearly and was responsive to student needs and questions. The organization of lectures and materials facilitated effective learning. The instructor's regular attendance and punctuality demonstrated their commitment to the course.`,
        
        'tutorial': `The tutorial sessions complemented the lectures well, providing valuable opportunities to clarify doubts and gain deeper understanding of complex topics. The tutor was approachable and addressed student problems effectively.`,
        
        'practical': `The practical components of the course were well-designed to reinforce theoretical concepts. The demonstrators were knowledgeable and helpful in guiding students through the practical work. The hands-on experience gained through these sessions was invaluable.`
    };
    
    return formType === 'teacher' ? teacherComments[section] || teacherComments['done_well'] : 
                                   courseComments[section] || courseComments['content_organization'];
}

// Log messages with verbosity control
function log(message, isError = false, forceShow = false) {
    if (config.verbose || forceShow || isError) {
        console.log(isError ? `❌ ERROR: ${message}` : `ℹ️ ${message}`);
    }
}

// Fill radio buttons for the current form
function fillRadioButtons(formType) {
    log(`Filling radio buttons for ${formType} form...`);
    
    const ratingConfig = formType === 'teacher' ? config.teacherRating : config.courseRating;
    
    // Special handling for attendance question (Q.5) in course form
    if (formType === 'course') {
        // Find all table rows that might contain the attendance question
        const tableRows = document.querySelectorAll('tr');
        let attendanceRow = null;
        
        for (const row of tableRows) {
            if (row.textContent.includes('Approximate level') || 
                row.textContent.includes('attendance') || 
                row.textContent.match(/Q\.?\s*5/i)) {
                attendanceRow = row;
                break;
            }
        }
        
        if (attendanceRow) {
            log('Found attendance question row');
            
            // Map attendance values to their expected position in the radio buttons
            const attendanceValueMap = {
                '>81%': 0, // First radio in the group
                '80%': 1,  // Second radio
                '60%': 2,  // Third radio
                '40%': 3,  // Fourth radio
                '20%': 4   // Fifth radio
            };
            
            // Find all radio buttons in this row
            const radioButtons = attendanceRow.querySelectorAll('input[type="radio"]');
            
            if (radioButtons.length >= 5) {
                // Get the position based on the configured attendance value
                const position = attendanceValueMap[config.attendanceValue] || 0;
                
                // Click the appropriate radio button
                if (radioButtons[position] && !config.debug) {
                    radioButtons[position].click();
                    log(`Set attendance (Q.5) to ${config.attendanceValue}`);
                }
            } else {
                log(`Attendance radio buttons not found in expected format. Found ${radioButtons.length} buttons`, true);
            }
        } else {
            log('Attendance question row not found', true);
        }
    }
    
    // Get all radio inputs grouped by name
    const radioGroups = {};
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (!radioGroups[radio.name]) {
            radioGroups[radio.name] = [];
        }
        radioGroups[radio.name].push(radio);
    });
    
    // For each radio group, select appropriate value
    let radioGroupsProcessed = 0;
    
    Object.keys(radioGroups).forEach(groupName => {
        // Skip attendance question if in course form (already handled)
        if (formType === 'course') {
            const questionText = radioGroups[groupName][0].closest('tr')?.textContent || '';
            if (questionText.includes('Approximate level') || questionText.match(/Q\.?\s*5/i)) {
                return;
            }
        }
        
        // Get the desired rating value
        const value = ratingConfig.randomize ? 
            getRandomRating(ratingConfig.min, ratingConfig.max).toString() : 
            ratingConfig.defaultValue.toString();
        
        // For debugging
        log(`Processing radio group: ${groupName} - Setting to value: ${value}`);
        
        // Select the radio with the matching value or the highest available value
        let bestMatch = null;
        let bestMatchValue = -1;
        
        radioGroups[groupName].forEach(radio => {
            const radioValue = parseInt(radio.value);
            
            // If we find an exact match, use it
            if (radio.value === value) {
                bestMatch = radio;
                bestMatchValue = radioValue;
                return;
            }
            
            // Otherwise keep track of the highest value that's not higher than our target
            if (radioValue <= parseInt(value) && radioValue > bestMatchValue) {
                bestMatch = radio;
                bestMatchValue = radioValue;
            }
        });
        
        if (bestMatch && !config.debug) {
            bestMatch.click();
            radioGroupsProcessed++;
            log(`Selected rating ${bestMatch.value} for ${groupName}`);
        } else if (!bestMatch) {
            log(`No suitable radio button found for group ${groupName}`, true);
        }
    });
    
    log(`Processed ${radioGroupsProcessed} radio button groups`);
    return radioGroupsProcessed > 0;
}

// Fill text areas with appropriate comments
function fillTextAreas(formType) {
    if (!config.addComments) return true;
    
    log(`Filling comments for ${formType} form...`);
    
    // Get all textarea elements
    const textAreas = document.querySelectorAll('textarea');
    log(`Found ${textAreas.length} textarea elements`);
    
    if (textAreas.length === 0) {
        log('No textarea elements found!', true);
        return false;
    }
    
    // Different approach based on form type
    if (formType === 'teacher') {
        // Try to identify specific comment sections
        let doneWellArea, improvementsArea, additionalArea;
        let unidentifiedAreas = [];
        
        textAreas.forEach(textarea => {
            // Look at the textarea itself, its parent, and its grandparent for identifying text
            const nearbyText = [
                textarea.textContent, 
                textarea.previousElementSibling?.textContent,
                textarea.parentElement?.textContent,
                textarea.parentElement?.previousElementSibling?.textContent,
                textarea.closest('tr')?.textContent
            ].join(' ').toLowerCase();
            
            if (nearbyText.includes('especially well') || nearbyText.includes('done well')) {
                doneWellArea = textarea;
                log('Identified "done well" comment area');
            } else if (nearbyText.includes('improve') || nearbyText.includes('recommendations')) {
                improvementsArea = textarea;
                log('Identified "improvements" comment area');
            } else if (nearbyText.includes('additional') || nearbyText.includes('anything else')) {
                additionalArea = textarea;
                log('Identified "additional" comment area');
            } else {
                unidentifiedAreas.push(textarea);
                log(`Unidentified comment area with nearby text: ${nearbyText.substring(0, 50)}...`);
            }
        });
        
        // Fill identified areas
        if (doneWellArea) {
            doneWellArea.value = getComments('teacher', 'done_well');
            simulateUserInput(doneWellArea);
        }
        if (improvementsArea) {
            improvementsArea.value = getComments('teacher', 'improvements');
            simulateUserInput(improvementsArea);
        }
        if (additionalArea) {
            additionalArea.value = getComments('teacher', 'additional');
            simulateUserInput(additionalArea);
        }
        
        // Handle unidentified areas or use fallback approach if no areas were identified
        if (unidentifiedAreas.length > 0 || (!doneWellArea && !improvementsArea && !additionalArea)) {
            log('Using fallback approach for comment areas');
            
            // If we have 3 or more textareas, assume they map to the 3 comment sections
            if (textAreas.length >= 3) {
                if (!doneWellArea) {
                    textAreas[0].value = getComments('teacher', 'done_well');
                    simulateUserInput(textAreas[0]);
                }
                if (!improvementsArea && textAreas.length > 1) {
                    textAreas[1].value = getComments('teacher', 'improvements');
                    simulateUserInput(textAreas[1]);
                }
                if (!additionalArea && textAreas.length > 2) {
                    textAreas[2].value = getComments('teacher', 'additional');
                    simulateUserInput(textAreas[2]);
                }
            } else {
                // For any remaining unidentified areas, use general comments
                unidentifiedAreas.forEach(textarea => {
                    textarea.value = getComments('teacher', 'done_well');
                    simulateUserInput(textarea);
                });
            }
        }
    } else { // Course form
        // Initialize counters for comment section types
        const commentTypes = [
            'content_organization',
            'student_contribution',
            'learning_environment',
            'learning_resources',
            'quality_delivery',
            'assessment',
            'instructor',
            'tutorial',
            'practical'
        ];
        
        let commentTypeIndex = 0;
        
        // Process each textarea
        textAreas.forEach(textarea => {
            // Try to determine section from context
            const contextText = [
                textarea.textContent,
                textarea.previousElementSibling?.textContent,
                textarea.parentElement?.textContent,
                textarea.parentElement?.previousElementSibling?.textContent,
                textarea.closest('tr')?.textContent,
                textarea.closest('table')?.textContent
            ].join(' ').toLowerCase();
            
            let commentType = null;
            
            // Try to identify the section from context
            if (contextText.includes('course content') || contextText.includes('organization')) {
                commentType = 'content_organization';
            } else if (contextText.includes('student contribution')) {
                commentType = 'student_contribution';
            } else if (contextText.includes('learning environment') || contextText.includes('teaching methods')) {
                commentType = 'learning_environment';
            } else if (contextText.includes('learning resources')) {
                commentType = 'learning_resources';
            } else if (contextText.includes('quality of delivery')) {
                commentType = 'quality_delivery';
            } else if (contextText.includes('assessment')) {
                commentType = 'assessment';
            } else if (contextText.includes('instructor')) {
                commentType = 'instructor';
            } else if (contextText.includes('tutorial') || contextText.includes('counseling')) {
                commentType = 'tutorial';
            } else if (contextText.includes('practical')) {
                commentType = 'practical';
            } else {
                // If we can't identify the section, use a sequential approach
                commentType = commentTypes[commentTypeIndex % commentTypes.length];
                commentTypeIndex++;
            }
            
            // Fill the textarea with the appropriate comment
            textarea.value = getComments('course', commentType);
            simulateUserInput(textarea);
            
            log(`Filled ${commentType} comment`);
        });
    }
    
    log(`Filled ${textAreas.length} comment areas`);
    return textAreas.length > 0;
}

// Simulate user input to trigger any validation scripts
function simulateUserInput(element) {
    if (!element || config.debug) return;
    
    // Create and dispatch input event
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    // Create and dispatch change event
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
    
    // For good measure, also focus and blur the element
    element.focus();
    setTimeout(() => element.blur(), 100);
}

// Find and click the submit button
function findAndClickSubmit() {
    // List of possible submit button identifiers
    const possibleButtons = [
        // By type and value
        'input[type="submit"]',
        'button[type="submit"]',
        // By value or text content
        'input[value="Submit"]',
        'button:contains("Submit")',
        'input[value*="submit" i]',
        'button[text*="submit" i]',
        // By class or ID containing submit
        '*[class*="submit" i]',
        '*[id*="submit" i]',
        // By appearance
        'input.btn-primary',
        'button.btn-primary',
        // Last resort - any button-like element
        '.btn',
        'button'
    ];
    
    let submitButton = null;
    
    // Try each selector until we find a match
    for (const selector of possibleButtons) {
        try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                // If it looks like a submit button
                if (element.type === 'submit' || 
                    (element.value && element.value.toLowerCase().includes('submit')) ||
                    (element.textContent && element.textContent.toLowerCase().includes('submit'))) {
                    submitButton = element;
                    break;
                }
            }
            if (submitButton) break;
        } catch (e) {
            // Some selectors might cause errors, we can ignore them
        }
    }
    
    if (!submitButton) {
        // Try a more targeted approach - find buttons/inputs within a form
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
            const buttons = form.querySelectorAll('input[type="submit"], button[type="submit"], button');
            if (buttons.length > 0) {
                submitButton = buttons[0]; // Take the first one
                break;
            }
        }
    }
    
    if (submitButton && !config.debug) {
        log(`Found submit button: ${submitButton.tagName} ${submitButton.type} ${submitButton.value || submitButton.textContent}`, false, true);
        submitButton.click();
        return true;
    } else {
        log('Submit button not found!', true, true);
        return false;
    }
}

// Fill the current form (either teacher or course)
function fillCurrentForm(formType) {
    try {
        log(`Starting to fill ${formType} form...`, false, true);
        
        // Fill radio buttons
        const radioSuccess = fillRadioButtons(formType);
        
        // Fill text areas
        const textSuccess = fillTextAreas(formType);
        
        if (!radioSuccess && !textSuccess) {
            log('Failed to fill any form elements!', true, true);
            return false;
        }
        
        // Submit the form if auto-submit is enabled
        if (config.autoSubmit) {
            log('Attempting to submit form...', false, true);
            return findAndClickSubmit();
        }
        
        log(`Form ${formType} filled successfully`, false, true);
        return true;
    } catch (error) {
        log(`Error filling ${formType} form: ${error.message}`, true, true);
        console.error(error);
        return false;
    }
}

// Get form counts from dashboard
function getFormCounts() {
    try {
        const counts = {
            teacher: { completed: 0, total: 0, pending: 0 },
            course: { completed: 0, total: 0, pending: 0 }
        };
        
        // Try multiple approaches to find the counts
        
        // Approach 1: Look for specific text content with numbers
        const dashboardContent = document.body.textContent;
        
        // For Teacher Evaluation Forms
        const teacherMatch = dashboardContent.match(/Teacher\s+Evaluation\s+Form\s+(\d+)\/(\d+)/i);
        if (teacherMatch) {
            counts.teacher.completed = parseInt(teacherMatch[1]);
            counts.teacher.total = parseInt(teacherMatch[2]);
            counts.teacher.pending = counts.teacher.total - counts.teacher.completed;
        }
        
        // For Course Evaluation Forms
        const courseMatch = dashboardContent.match(/Course\s+Evaluation\s+Form\s+(\d+)\/(\d+)/i);
        if (courseMatch) {
            counts.course.completed = parseInt(courseMatch[1]);
            counts.course.total = parseInt(courseMatch[2]);
            counts.course.pending = counts.course.total - counts.course.completed;
        }
        
        // Approach 2: Look for elements with specific text
        if (!teacherMatch || !courseMatch) {
            const elements = document.querySelectorAll('*');
            
            for (const el of elements) {
                const text = el.textContent?.trim();
                
                if (!text) continue;
                
                // Check for teacher form counts
                if (text.match(/^(\d+)\/(\d+)$/) && el.closest('*:contains("Teacher")')) {
                    const match = text.match(/^(\d+)\/(\d+)$/);
                    counts.teacher.completed = parseInt(match[1]);
                    counts.teacher.total = parseInt(match[2]);
                    counts.teacher.pending = counts.teacher.total - counts.teacher.completed;
                }
                
                // Check for course form counts
                if (text.match(/^(\d+)\/(\d+)$/) && el.closest('*:contains("Course")')) {
                    const match = text.match(/^(\d+)\/(\d+)$/);
                    counts.course.completed = parseInt(match[1]);
                    counts.course.total = parseInt(match[2]);
                    counts.course.pending = counts.course.total - counts.course.completed;
                }
            }
        }
        
        // Approach 3: Look specifically at the cards/blocks in the UI
        const cards = document.querySelectorAll('.card, .block, div[class*="evaluation"], div[class*="form"]');
        
        for (const card of cards) {
            const text = card.textContent?.trim();
            
            if (!text) continue;
            
            if (text.includes('Teacher Evaluation')) {
                const match = text.match(/(\d+)\/(\d+)/);
                if (match) {
                    counts.teacher.completed = parseInt(match[1]);
                    counts.teacher.total = parseInt(match[2]);
                    counts.teacher.pending = counts.teacher.total - counts.teacher.completed;
                }
            }
            
            if (text.includes('Course Evaluation')) {
                const match = text.match(/(\d+)\/(\d+)/);
                if (match) {
                    counts.course.completed = parseInt(match[1]);
                    counts.course.total = parseInt(match[2]);
                    counts.course.pending = counts.course.total - counts.course.completed;
                }
            }
        }
        
        log(`Form counts - Teacher: ${counts.teacher.completed}/${counts.teacher.total} (${counts.teacher.pending} pending)`, false, true);
        log(`Form counts - Course: ${counts.course.completed}/${counts.course.total} (${counts.course.pending} pending)`, false, true);
        
        return counts;
    } catch (error) {
        log(`Error getting form counts: ${error.message}`, true, true);
        console.error(error);
        return {
            teacher: { completed: 0, total: 0, pending: 0 },
            course: { completed: 0, total: 0, pending: 0 }
        };
    }
}

// Find and click evaluation form links
function findAndClickFormLink(formType) {
    const formTypeLower = formType.toLowerCase();
    const searchText = formTypeLower === 'teacher' ? 'Teacher Evaluation' : 'Course Evaluation';
    
    log(`Looking for ${searchText} link...`, false, true);
    
    try {
        // Approach 1: Try finding links by their href attribute
        let link = null;
        
        if (formTypeLower === 'teacher') {
            link = document.querySelector('a[href*="TeacherEvaluationForm"], a[href*="teacherevaluationform"]');
        } else {
            link = document.querySelector('a[href*="CourseEvaluationForm"], a[href*="courseevaluationform"]');
        }
        
        if (link) {
            log(`Found form link via href: ${link.href}`, false, true);
            link.click();
            return true;
        }
        
        // Approach 2: Try finding links or clickable elements by their text content
        const elementsWithText = [...document.querySelectorAll('a, button, div[onclick], span[onclick], *[class*="clickable"], *[role="button"]')]
            .filter(el => el.textContent?.includes(searchText));
        
        if (elementsWithText.length > 0) {
            log(`Found form link via text content: ${elementsWithText[0].textContent.trim()}`, false, true);
            elementsWithText[0].click();
            return true;
        }
        
        // Approach 3: Look for cards/panels that might contain the forms
        const cards = document.querySelectorAll('.card, .panel, .block, div[class*="evaluation"]');
        
        for (const card of cards) {
            if (card.textContent?.includes(searchText)) {
                log('Found card containing form text');
                
                // Try to find a clickable element within this card
                const clickable = card.querySelector('a, button, [onclick]');
                if (clickable) {
                    log('Found clickable element in card', false, true);
                    clickable.click();
                    return true;
                }
                
                // If no specific clickable element, try clicking the card itself
                log('Trying to click the card itself', false, true);
                card.click();
                return true;
            }
        }
        
        // Approach 4: As a last resort, try getting the form URL directly
        log('No clickable element found, trying direct navigation', false, true);
        window.location.href = formTypeLower === 'teacher' ? URLS.teacherForm : URLS.courseForm;
        return true;
    } catch (error) {
        log(`Error finding form link: ${error.message}`, true, true);
        console.error(error);
        return false;
    }
}

// Update status message in the UI
function updateStatus(message, isError = false) {
    const statusElement = document.getElementById('qec-status-message');
    if (statusElement) {
        statusElement.style.display = 'block';
        statusElement.style.background = isError ? '#ffebee' : '#e7f3fe';
        statusElement.style.borderLeft = isError ? '5px solid #f44336' : '5px solid #2196F3';
        statusElement.textContent = message;
    }
    log(message, isError, true);
}

// Create a UI to control the script
function createControlUI() {
    // Remove any existing UI
    const existingUI = document.getElementById('qec-autofill-ui');
    if (existingUI) existingUI.remove();
    
    // Create UI container
    const ui = document.createElement('div');
    ui.id = 'qec-autofill-ui';
    ui.style.cssText = 'position:fixed;top:10px;right:10px;background:#f0f0f0;border:2px solid #333;' +
                      'padding:15px;z-index:10000;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,0.2);max-width:350px;';
    
    // Get current form counts
    const formCounts = getFormCounts();
    
    ui.innerHTML = `
        <h3 style="margin-top:0;color:#333;font-family:Arial;border-bottom:1px solid #ccc;padding-bottom:5px;">
            QEC Dashboard Auto-Fill
        </h3>
        <div style="margin-bottom:10px;">
            <p style="margin:5px 0;font-family:Arial;">
                <strong>Form Status:</strong><br>
                Teacher Forms: ${formCounts.teacher.completed}/${formCounts.teacher.total} (${formCounts.teacher.pending} pending)<br>
                Course Forms: ${formCounts.course.completed}/${formCounts.course.total} (${formCounts.course.pending} pending)
            </p>
        </div>
        <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;font-family:Arial;">Teacher Form Rating:</label>
            <div style="display:flex;gap:5px;">
                <select id="teacher-rating" style="flex:1;padding:5px;">
                    <option value="5">Excellent (5)</option>
                    <option value="4">Good (4)</option>
                    <option value="3">Average (3)</option>
                    <option value="2">Below Average (2)</option>
                    <option value="1">Poor (1)</option>
                    <option value="random">Randomize</option>
                </select>
            </div>
        </div>
        <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;font-family:Arial;">Course Form Rating:</label>
            <div style="display:flex;gap:5px;">
                <select id="course-rating" style="flex:1;padding:5px;">
                    <option value="5">Excellent (5)</option>
                    <option value="4">Good (4)</option>
                    <option value="3">Average (3)</option>
                    <option value="2">Below Average (2)</option>
                    <option value="1">Poor (1)</option>
                    <option value="random">Randomize</option>
                </select>
            </div>
        </div>
        <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;font-family:Arial;">
                Attendance (Course Q.5):
            </label>
            <select id="attendance-value" style="width:100%;padding:5px;">
                <option value=">81%">>81%</option>
                <option value="80%">80%</option>
                <option value="60%">60%</option>
                <option value="40%">40%</option>
                <option value="20%">20%</option>
            </select>
        </div>
        <div style="margin-bottom:15px;">
            <label style="display:flex;align-items:center;gap:5px;font-family:Arial;margin-bottom:8px;">
                <input type="checkbox" id="add-comments" checked>
                Add Comments
            </label>
            <label style="display:flex;align-items:center;gap:5px;font-family:Arial;margin-bottom:8px;">
                <input type="checkbox" id="auto-submit" checked>
                Auto-Submit Forms
            </label>
            <label style="display:flex;align-items:center;gap:5px;font-family:Arial;margin-bottom:8px;">
                <input type="checkbox" id="process-teacher" checked>
                Process Teacher Forms
            </label>
            <label style="display:flex;align-items:center;gap:5px;font-family:Arial;">
                <input type="checkbox" id="process-course" checked>
                Process Course Forms
            </label>
        </div>
        <div style="display:flex;gap:10px;justify-content:space-between;margin-bottom:10px;">
            <button id="start-auto-fill" style="padding:8px 15px;background:#4CAF50;color:white;border:none;
                   border-radius:4px;cursor:pointer;flex:1;">Start Auto-Fill</button>
            <button id="close-ui" style="padding:8px 15px;background:#f44336;color:white;border:none;
                   border-radius:4px;cursor:pointer;">Close</button>
        </div>
        <div style="margin-top:10px;">
            <button id="fill-teacher-form" style="padding:5px 10px;margin-right:5px;background:#2196F3;color:white;border:none;
                   border-radius:4px;cursor:pointer;width:48%;">Fill Single Teacher Form</button>
            <button id="fill-course-form" style="padding:5px 10px;background:#FF9800;color:white;border:none;
                   border-radius:4px;cursor:pointer;width:48%;">Fill Single Course Form</button>
        </div>
        <div id="qec-status-message" style="margin-top:10px;padding:8px;background:#e7f3fe;border-left:5px solid #2196F3;font-family:Arial;display:none;">
            Ready to start
        </div>
    `;
    
    document.body.appendChild(ui);
    
    // Set initial values
    document.getElementById('teacher-rating').value = config.teacherRating.randomize ? 'random' : config.teacherRating.defaultValue;
    document.getElementById('course-rating').value = config.courseRating.randomize ? 'random' : config.courseRating.defaultValue;
    document.getElementById('attendance-value').value = config.attendanceValue;
    document.getElementById('add-comments').checked = config.addComments;
    document.getElementById('auto-submit').checked = config.autoSubmit;
    document.getElementById('process-teacher').checked = config.processTeacherForms;
    document.getElementById('process-course').checked = config.processCourseforms;
    
    // Add event listeners
    document.getElementById('start-auto-fill').addEventListener('click', () => {
        updateConfigFromUI();
        startAutoFill();
    });
    
    document.getElementById('close-ui').addEventListener('click', () => {
        ui.style.display = 'none';
    });
    
    document.getElementById('fill-teacher-form').addEventListener('click', () => {
        updateConfigFromUI();
        fillSingleForm('teacher');
    });
    
    document.getElementById('fill-course-form').addEventListener('click', () => {
        updateConfigFromUI();
        fillSingleForm('course');
    });
    
    // Make UI draggable
    makeElementDraggable(ui);
}

// Update configuration from UI
function updateConfigFromUI() {
    const teacherRatingSelect = document.getElementById('teacher-rating').value;
    const courseRatingSelect = document.getElementById('course-rating').value;
    
    config.teacherRating.randomize = teacherRatingSelect === 'random';
    config.teacherRating.defaultValue = config.teacherRating.randomize ? 5 : parseInt(teacherRatingSelect);
    
    config.courseRating.randomize = courseRatingSelect === 'random';
    config.courseRating.defaultValue = config.courseRating.randomize ? 5 : parseInt(courseRatingSelect);
    
    config.attendanceValue = document.getElementById('attendance-value').value;
    config.addComments = document.getElementById('add-comments').checked;
    config.autoSubmit = document.getElementById('auto-submit').checked;
    config.processTeacherForms = document.getElementById('process-teacher').checked;
    config.processCourseforms = document.getElementById('process-course').checked;
    
    // Save configuration to session storage
    sessionStorage.setItem('qecAutoFillConfig', JSON.stringify(config));
}

// Make an element draggable
function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // Get the element header for dragging or use the element itself
    const header = element.querySelector('h3') || element;
    header.style.cursor = 'move';
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call function when mouse moves
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Fill a single form of the specified type
function fillSingleForm(formType) {
    sessionStorage.setItem('qecAutoFillConfig', JSON.stringify(config));
    sessionStorage.setItem('qecAutoFillType', formType);
    sessionStorage.setItem('qecAutoFillSingle', 'true');
    
    updateStatus(`Navigating to ${formType} form...`, false);
    
    // Try to find and click the form link
    const success = findAndClickFormLink(formType);
    
    if (!success) {
        // If we couldn't find/click the link, try direct navigation
        window.location.href = formType === 'teacher' ? URLS.teacherForm : URLS.courseForm;
    }
}

// Start the auto-fill process
function startAutoFill() {
    // Store the configuration in sessionStorage to persist across page navigations
    sessionStorage.setItem('qecAutoFillConfig', JSON.stringify(config));
    sessionStorage.setItem('qecAutoFillRunning', 'true');
    sessionStorage.removeItem('qecAutoFillSingle');
    
    // Get the current form counts
    const formCounts = getFormCounts();
    
    // Check if there are any forms to fill
    const hasTeacherForms = config.processTeacherForms && formCounts.teacher.pending > 0;
    const hasCourseForms = config.processCourseforms && formCounts.course.pending > 0;
    
    if (!hasTeacherForms && !hasCourseForms) {
        updateStatus('No pending forms to fill!', true);
        sessionStorage.removeItem('qecAutoFillRunning');
        return;
    }
    
    updateStatus('Starting auto-fill process...', false);
    
    // Determine which form to process first
    if (hasTeacherForms) {
        updateStatus('Navigating to Teacher Evaluation Form...', false);
        findAndClickFormLink('teacher');
    } else if (hasCourseForms) {
        updateStatus('Navigating to Course Evaluation Form...', false);
        findAndClickFormLink('course');
    }
}

// Check current page and perform appropriate action
function checkCurrentPageAndAct() {
    // Detect current page
    const currentUrl = window.location.href;
    
    // Check if we're on the dashboard
    if (currentUrl.includes('/Dashboard.aspx')) {
        log('On Dashboard page', false, true);
        
        // Create/update UI
        createControlUI();
        
        // Check if we need to continue the auto-fill process
        const isAutoFillRunning = sessionStorage.getItem('qecAutoFillRunning') === 'true';
        
        if (isAutoFillRunning) {
            // Restore configuration
            try {
                const savedConfig = sessionStorage.getItem('qecAutoFillConfig');
                if (savedConfig) {
                    Object.assign(config, JSON.parse(savedConfig));
                }
            } catch (error) {
                log('Error restoring configuration', true);
            }
            
            // Get the current form counts
            const formCounts = getFormCounts();
            
            // Check if there are more forms to process
            setTimeout(() => {
                // First try teacher forms if enabled
                if (config.processTeacherForms && formCounts.teacher.pending > 0) {
                    updateStatus('Processing next Teacher Evaluation Form...', false);
                    findAndClickFormLink('teacher');
                    return;
                }
                
                // Then try course forms if enabled
                if (config.processCourseforms && formCounts.course.pending > 0) {
                    updateStatus('Processing next Course Evaluation Form...', false);
                    findAndClickFormLink('course');
                    return;
                }
                
                // If we reach here, all forms are processed
                updateStatus('All selected forms have been processed! 🎉', false);
                sessionStorage.removeItem('qecAutoFillRunning');
            }, 1000);
        }
    } 
    // Check if we're on a Teacher Evaluation Form
    else if (currentUrl.includes('/TeacherEvaluationForm.aspx')) {
        log('On Teacher Evaluation Form page', false, true);
        
        // Check if auto-fill is running or if we're doing a single form
        const isAutoFillRunning = sessionStorage.getItem('qecAutoFillRunning') === 'true';
        const isSingleFill = sessionStorage.getItem('qecAutoFillSingle') === 'true';
        const formType = sessionStorage.getItem('qecAutoFillType');
        
        if (isAutoFillRunning || (isSingleFill && formType === 'teacher')) {
            // Restore configuration
            try {
                const savedConfig = sessionStorage.getItem('qecAutoFillConfig');
                if (savedConfig) {
                    Object.assign(config, JSON.parse(savedConfig));
                }
            } catch (error) {
                log('Error restoring configuration', true);
            }
            
            // Wait a bit for the page to fully load
            setTimeout(() => {
                fillCurrentForm('teacher');
                
                if (isSingleFill) {
                    // If this is a single form fill, remove the flag
                    sessionStorage.removeItem('qecAutoFillSingle');
                }
            }, 1500);
        }
    } 
    // Check if we're on a Course Evaluation Form
    else if (currentUrl.includes('/CourseEvaluationForm.aspx')) {
        log('On Course Evaluation Form page', false, true);
        
        // Check if auto-fill is running or if we're doing a single form
        const isAutoFillRunning = sessionStorage.getItem('qecAutoFillRunning') === 'true';
        const isSingleFill = sessionStorage.getItem('qecAutoFillSingle') === 'true';
        const formType = sessionStorage.getItem('qecAutoFillType');
        
        if (isAutoFillRunning || (isSingleFill && formType === 'course')) {
            // Restore configuration
            try {
                const savedConfig = sessionStorage.getItem('qecAutoFillConfig');
                if (savedConfig) {
                    Object.assign(config, JSON.parse(savedConfig));
                }
            } catch (error) {
                log('Error restoring configuration', true);
            }
            
            // Wait a bit for the page to fully load
            setTimeout(() => {
                fillCurrentForm('course');
                
                if (isSingleFill) {
                    // If this is a single form fill, remove the flag
                    sessionStorage.removeItem('qecAutoFillSingle');
                }
            }, 1500);
        }
    }
}

// Initialize the script
function initialize() {
    log('Initializing QEC Dashboard Auto-Fill Script', false, true);
    
    // Check if there's a saved configuration
    try {
        const savedConfig = sessionStorage.getItem('qecAutoFillConfig');
        if (savedConfig) {
            Object.assign(config, JSON.parse(savedConfig));
            log('Restored saved configuration', false);
        }
    } catch (error) {
        log('Error restoring configuration', true);
    }
    
    // Check current page and perform appropriate action
    checkCurrentPageAndAct();
}

// Run the script
initialize();
