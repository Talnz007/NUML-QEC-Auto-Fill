// QEC Dashboard Auto-Fill Script
// This script automatically fills out all Teacher and Course Evaluation Forms from the Dashboard

// Configuration options - easily customize your preferences
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

// Fill radio buttons for the current form
function fillRadioButtons(formType) {
    console.log(`Filling radio buttons for ${formType} form...`);
    
    const ratingConfig = formType === 'teacher' ? config.teacherRating : config.courseRating;
    
    // Special handling for attendance question (Q.5) in course form
    if (formType === 'course') {
        // Map attendance values to their corresponding radio button values
        const attendanceMap = {
            '>81%': '5',
            '80%': '4',
            '60%': '3',
            '40%': '2',
            '20%': '1'
        };
        
        // Find the attendance question (Q.5) radio buttons
        const attendanceQuestions = document.querySelectorAll('input[type="radio"]');
        const attendanceQuestion = Array.from(attendanceQuestions).find(input => {
            const questionText = input.closest('tr')?.textContent || '';
            return questionText.includes('attendance') || questionText.includes('Approximate level');
        });
        
        if (attendanceQuestion) {
            const attendanceValue = attendanceMap[config.attendanceValue] || '5';
            const attendanceRadioGroup = attendanceQuestion.name;
            const attendanceRadio = document.querySelector(`input[name="${attendanceRadioGroup}"][value="${attendanceValue}"]`);
            if (attendanceRadio && !config.debug) {
                attendanceRadio.click();
                console.log(`Set attendance (Q.5) to ${config.attendanceValue}`);
            }
        }
    }
    
    // Get all radio inputs on the page
    const radioGroups = {};
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (!radioGroups[radio.name]) {
            radioGroups[radio.name] = [];
        }
        radioGroups[radio.name].push(radio);
    });
    
    // For each radio group, select appropriate value
    Object.keys(radioGroups).forEach(groupName => {
        // Skip attendance question if already handled for course form
        if (formType === 'course' && (groupName.includes('Q5') || groupName.includes('Q.5'))) {
            const questionText = radioGroups[groupName][0].closest('tr')?.textContent || '';
            if (questionText.includes('attendance') || questionText.includes('Approximate level')) {
                return;
            }
        }
        
        const value = ratingConfig.randomize ? 
            getRandomRating(ratingConfig.min, ratingConfig.max).toString() : 
            ratingConfig.defaultValue.toString();
        
        const radioToSelect = radioGroups[groupName].find(r => r.value === value);
        if (radioToSelect && !config.debug) {
            radioToSelect.click();
            console.log(`Selected rating ${value} for ${groupName}`);
        }
    });
}

// Fill text areas with appropriate comments
function fillTextAreas(formType) {
    if (!config.addComments) return;
    
    console.log(`Filling comments for ${formType} form...`);
    
    // Different approach based on form type
    if (formType === 'teacher') {
        // Get all textarea elements
        const textAreas = document.querySelectorAll('textarea');
        
        // Try to identify specific comment sections
        let doneWellArea, improvementsArea, additionalArea;
        
        textAreas.forEach(textarea => {
            const nearbyText = textarea.parentElement.textContent.toLowerCase() || '';
            
            if (nearbyText.includes('especially well') || nearbyText.includes('done well')) {
                doneWellArea = textarea;
            } else if (nearbyText.includes('improve') || nearbyText.includes('recommendations')) {
                improvementsArea = textarea;
            } else if (nearbyText.includes('additional') || nearbyText.includes('anything else')) {
                additionalArea = textarea;
            }
        });
        
        // Fill identified areas or use index-based approach as fallback
        if (doneWellArea) {
            doneWellArea.value = getComments('teacher', 'done_well');
        }
        if (improvementsArea) {
            improvementsArea.value = getComments('teacher', 'improvements');
        }
        if (additionalArea) {
            additionalArea.value = getComments('teacher', 'additional');
        }
        
        // Fallback if we couldn't identify specific areas
        if (!doneWellArea && !improvementsArea && !additionalArea && textAreas.length > 0) {
            if (textAreas.length >= 3) {
                textAreas[0].value = getComments('teacher', 'done_well');
                textAreas[1].value = getComments('teacher', 'improvements');
                textAreas[2].value = getComments('teacher', 'additional');
            } else {
                // If fewer textareas, fill them all with general comments
                textAreas.forEach(textarea => {
                    textarea.value = getComments('teacher', 'done_well');
                });
            }
        }
    } else { // Course form
        // Get all comment sections in course form
        const commentSections = document.querySelectorAll('textarea');
        
        commentSections.forEach(textarea => {
            const parentText = textarea.closest('tr')?.textContent.toLowerCase() || '';
            let commentType = 'content_organization';
            
            if (parentText.includes('student contribution')) {
                commentType = 'student_contribution';
            } else if (parentText.includes('learning environment')) {
                commentType = 'learning_environment';
            } else if (parentText.includes('learning resources')) {
                commentType = 'learning_resources';
            } else if (parentText.includes('quality of delivery')) {
                commentType = 'quality_delivery';
            } else if (parentText.includes('assessment')) {
                commentType = 'assessment';
            } else if (parentText.includes('instructor')) {
                commentType = 'instructor';
            } else if (parentText.includes('tutorial')) {
                commentType = 'tutorial';
            } else if (parentText.includes('practical')) {
                commentType = 'practical';
            }
            
            textarea.value = getComments('course', commentType);
        });
    }
    
    // Trigger input events for any validation scripts on the site
    document.querySelectorAll('textarea').forEach(textarea => {
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
    });
}

// Fill the current form (either teacher or course)
function fillCurrentForm(formType) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`Starting to fill ${formType} form...`);
            
            // Fill radio buttons
            fillRadioButtons(formType);
            
            // Fill text areas
            fillTextAreas(formType);
            
            // Submit the form if auto-submit is enabled
            if (config.autoSubmit) {
                const submitButton = document.querySelector('input[type="submit"], button[type="submit"], input[value="Submit"], button:contains("Submit")');
                if (submitButton) {
                    console.log('Submitting form...');
                    submitButton.click();
                } else {
                    console.warn('Submit button not found!');
                }
            }
            
            console.log(`Form ${formType} filled successfully`);
            resolve();
        } catch (error) {
            console.error(`Error filling ${formType} form:`, error);
            reject(error);
        }
    });
}

// Navigate to a URL and wait for page load
function navigateTo(url) {
    return new Promise(resolve => {
        console.log(`Navigating to: ${url}`);
        window.location.href = url;
        
        // We can't really wait for page load this way since this script will be terminated
        // when navigation occurs. The next step will need to be handled after the new page loads.
        setTimeout(resolve, 1000);
    });
}

// Check if there are pending forms
function hasPendingForms(formType) {
    const countText = formType === 'teacher' ? 
        document.querySelector('.Teacher.Evaluation')?.textContent : 
        document.querySelector('.Course.Evaluation')?.textContent;
    
    if (countText) {
        const match = countText.match(/(\d+)\/(\d+)/);
        if (match) {
            const [completed, total] = match.slice(1).map(Number);
            return completed < total;
        }
    }
    
    return false;
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
    
    ui.innerHTML = `
        <h3 style="margin-top:0;color:#333;font-family:Arial;border-bottom:1px solid #ccc;padding-bottom:5px;">
            QEC Dashboard Auto-Fill
        </h3>
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
        <div style="display:flex;gap:10px;justify-content:space-between;">
            <button id="start-auto-fill" style="padding:8px 15px;background:#4CAF50;color:white;border:none;
                   border-radius:4px;cursor:pointer;flex:1;">Start Auto-Fill</button>
            <button id="close-ui" style="padding:8px 15px;background:#f44336;color:white;border:none;
                   border-radius:4px;cursor:pointer;">Close</button>
        </div>
        <div id="status-message" style="margin-top:10px;padding:5px;background:#e7f3fe;border-left:5px solid #2196F3;font-family:Arial;display:none;">
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
        // Update config from UI
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
        
        // Start the process
        startAutoFill();
    });
    
    document.getElementById('close-ui').addEventListener('click', () => {
        ui.style.display = 'none';
    });
    
    // Make UI draggable
    makeElementDraggable(ui);
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

// Update status message
function updateStatus(message, isError = false) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.style.display = 'block';
        statusElement.style.background = isError ? '#ffebee' : '#e7f3fe';
        statusElement.style.borderLeft = isError ? '5px solid #f44336' : '5px solid #2196F3';
        statusElement.textContent = message;
    }
    console.log(isError ? `ERROR: ${message}` : message);
}

// Start the auto-fill process
function startAutoFill() {
    // Store the configuration in sessionStorage to persist across page navigations
    sessionStorage.setItem('qecAutoFillConfig', JSON.stringify(config));
    sessionStorage.setItem('qecAutoFillRunning', 'true');
    
    // We're on the dashboard, check if there are pending forms and navigate to the first one
    if (window.location.href.includes(URLS.dashboard)) {
        updateStatus('Starting auto-fill process...');
        
        // Determine which form to process first
        if (config.processTeacherForms && hasPendingForms('teacher')) {
            // Go to teacher form first
            const teacherButton = document.querySelector('a[href*="TeacherEvaluationForm"]');
            if (teacherButton) {
                updateStatus('Navigating to Teacher Evaluation Form...');
                teacherButton.click();
            } else {
                updateStatus('Teacher Evaluation button not found!', true);
            }
        } else if (config.processCourseforms && hasPendingForms('course')) {
            // Go to course form
            const courseButton = document.querySelector('a[href*="CourseEvaluationForm"]');
            if (courseButton) {
                updateStatus('Navigating to Course Evaluation Form...');
                courseButton.click();
            } else {
                updateStatus('Course Evaluation button not found!', true);
            }
        } else {
            updateStatus('No pending forms found!', true);
            sessionStorage.removeItem('qecAutoFillRunning');
        }
    }
}

// Function to check current page and perform appropriate action
function checkCurrentPageAndAct() {
    // Check if we need to continue the auto-fill process
    const isAutoFillRunning = sessionStorage.getItem('qecAutoFillRunning') === 'true';
    if (!isAutoFillRunning) return;
    
    // Restore configuration
    try {
        const savedConfig = sessionStorage.getItem('qecAutoFillConfig');
        if (savedConfig) {
            Object.assign(config, JSON.parse(savedConfig));
        }
    } catch (error) {
        console.error('Error restoring configuration:', error);
    }
    
    // Detect current page
    const currentUrl = window.location.href;
    
    if (currentUrl.includes('TeacherEvaluationForm')) {
        console.log('On Teacher Evaluation Form');
        // Fill the teacher form
        setTimeout(() => {
            fillCurrentForm('teacher')
                .then(() => {
                    if (config.autoSubmit) {
                        console.log('Teacher form submitted, waiting to return to dashboard...');
                        // The form submission will navigate us back to the dashboard
                    }
                })
                .catch(error => {
                    console.error('Error in teacher form processing:', error);
                    // If error, try to go back to dashboard
                    window.location.href = URLS.dashboard;
                });
        }, 1500);
        
    } else if (currentUrl.includes('CourseEvaluationForm')) {
        console.log('On Course Evaluation Form');
        // Fill the course form
        setTimeout(() => {
            fillCurrentForm('course')
                .then(() => {
                    if (config.autoSubmit) {
                        console.log('Course form submitted, waiting to return to dashboard...');
                        // The form submission will navigate us back to the dashboard
                    }
                })
                .catch(error => {
                    console.error('Error in course form processing:', error);
                    // If error, try to go back to dashboard
                    window.location.href = URLS.dashboard;
                });
        }, 1500);
        
    } else if (currentUrl.includes('Dashboard')) {
        console.log('Back on Dashboard');
        
        // Create/update UI
        createControlUI();
        
        // Check if there are more forms to process
        setTimeout(() => {
            // First try teacher forms if enabled
            if (config.processTeacherForms && hasPendingForms('teacher')) {
                updateStatus('Processing next Teacher Evaluation Form...');
                const teacherButton = document.querySelector('a[href*="TeacherEvaluationForm"]');
                if (teacherButton) {
                    teacherButton.click();
                    return;
                }
            }
            
            // Then try course forms if enabled
            if (config.processCourseforms && hasPendingForms('course')) {
                updateStatus('Processing next Course Evaluation Form...');
                const courseButton = document.querySelector('a[href*="CourseEvaluationForm"]');
                if (courseButton) {
                    courseButton.click();
                    return;
                }
            }
            
            // If we reach here, all forms are processed
            updateStatus('All selected forms have been processed! 🎉');
            sessionStorage.removeItem('qecAutoFillRunning');
        }, 1000);
    }
}

// Initialize the script
function initialize() {
    console.log('Initializing QEC Dashboard Auto-Fill Script');
    
    // If on dashboard, create the control UI
    if (window.location.href.includes(URLS.dashboard)) {
        createControlUI();
    }
    
    // Check current page and perform appropriate action
    checkCurrentPageAndAct();
}

// Run the script
initialize();
