// NUML QEC Auto-Fill Script
// Automatically fills out Teacher and Course Evaluation Forms

// Configuration options - adjust as needed
const config = {
    // Rating preferences (5=highest, 1=lowest)
    teacherRating: {
        min: 4,           // Minimum rating (1-5)
        max: 5,           // Maximum rating (1-5)
        randomize: true,  // Set to false for consistent ratings
        defaultValue: 5   // Default rating if not randomizing
    },
    courseRating: {
        min: 4,           // Minimum rating (1-5)
        max: 5,           // Maximum rating (1-5)
        randomize: true,  // Set to false for consistent ratings
        defaultValue: 5   // Default rating if not randomizing
    },
    
    // Attendance option for Course Evaluation Q.5
    attendanceValue: 5,   // 5=">81%", 4="80%", 3="60%", 2="40%", 1="20%"
    
    // Auto-navigation settings
    autoNavigate: true,   // Auto navigate to next form after submission
    autoSubmit: true,     // Set to false to skip form submission (for testing)
    
    // Processing options
    processTeacherForms: true,  // Process teacher evaluation forms
    processCourseforms: true,   // Process course evaluation forms
};

// Common comment texts for both forms (40+ characters each)
const commentTexts = {
    teacher: {
        doneWell: `The instructor demonstrated exceptional teaching skills by presenting complex concepts in a clear and understandable manner. Their approach was methodical and well-structured, making it easy to follow along. The instructor maintained an engaging classroom environment, encouraging thoughtful discussions and addressing student questions thoroughly.`,
        
        improvements: `To further enhance the course, the instructor could consider incorporating more interactive elements like group projects or case studies. Additionally, providing more practice problems or supplementary materials for challenging topics would be beneficial for students who want to delve deeper into the subject matter.`,
        
        additional: `The instructor's passion for the subject was evident throughout the semester, which made the learning experience more enjoyable. Their willingness to provide additional support outside regular class hours demonstrated their commitment to student success. Overall, this was a valuable course.`
    },
    
    course: {
        contentOrganization: `The course content was well-structured and logically organized, making it easy to follow the progression of topics throughout the semester. The learning objectives were clearly defined, and the workload was appropriately challenging without being overwhelming. The course materials were up-to-date and relevant.`,
        
        studentContribution: `The course design encouraged active participation and collaborative learning among students. The assignments and projects provided ample opportunity to apply theoretical knowledge to practical scenarios, enhancing our understanding of the subject matter. I made sure to participate actively in all discussions.`,
        
        learningEnvironment: `The learning environment fostered open discussion and critical thinking. The blend of lectures, tutorials, and practical sessions created a comprehensive learning experience that accommodated different learning styles. The digital tools and resources used in the classroom enhanced the learning experience significantly.`,
        
        learningResources: `The recommended readings and additional resources were highly relevant and well-curated. They provided deeper insights into the subject matter and supported the concepts covered in lectures. The online resources were easily accessible and well-organized, making self-study more effective.`,
        
        qualityDelivery: `The course content was delivered in an engaging manner that stimulated interest in the subject. The pace of instruction was appropriate, allowing sufficient time to grasp complex concepts while maintaining momentum throughout the semester. The presentations were clear, well-structured and engaging.`,
        
        assessment: `The assessment methods effectively evaluated both understanding and application of knowledge. The feedback provided was constructive and helped identify areas for improvement. The variety of assessment methods allowed students to demonstrate their knowledge in different formats appropriately.`,
        
        instructor: `The instructor presented the material clearly and was responsive to student needs and questions. The organization of lectures and materials facilitated effective learning. The instructor's regular attendance and punctuality demonstrated their commitment to the course and to student success.`,
        
        tutorialCounseling: `The tutorial sessions complemented the lectures well, providing valuable opportunities to clarify doubts and gain deeper understanding of complex topics. The tutor was approachable and addressed student problems effectively. The time allocated for tutorials was sufficient.`
    }
};

// Keep track of our navigation state
const state = {
    processingStarted: false,
    currentFormType: null,  // 'teacher' or 'course'
    formsProcessed: {
        teacher: [],
        course: []
    }
};

// UI Elements for the control panel
function createControlUI() {
    // Remove any existing UI
    const existingUI = document.getElementById('qec-autofill-ui');
    if (existingUI) {
        existingUI.remove();
    }
    
    // Create UI container
    const ui = document.createElement('div');
    ui.id = 'qec-autofill-ui';
    ui.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #fff;
        border: 2px solid #007bff;
        border-radius: 8px;
        padding: 15px;
        max-width: 350px;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
    `;
    
    // Get form counts
    let teacherTotal = 6;
    let teacherCompleted = 0;
    let courseTotal = 6;
    let courseCompleted = 1; // You mentioned 1 course form was already completed
    
    const dashboardContent = document.body ? document.body.textContent : '';
    const teacherMatch = dashboardContent.match(/Teacher\s+Evaluation\s+Form\s+(\d+)\/(\d+)/i);
    const courseMatch = dashboardContent.match(/Course\s+Evaluation\s+Form\s+(\d+)\/(\d+)/i);
    
    if (teacherMatch) {
        teacherCompleted = parseInt(teacherMatch[1]);
        teacherTotal = parseInt(teacherMatch[2]);
    }
    
    if (courseMatch) {
        courseCompleted = parseInt(courseMatch[1]);
        courseTotal = parseInt(courseMatch[2]);
    }
    
    // UI HTML
    ui.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #007bff; font-size: 18px;">NUML QEC Auto-Fill</h3>
            <button id="close-ui" style="background: none; border: none; color: #f00; cursor: pointer; font-size: 16px;">✕</button>
        </div>
        
        <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Teacher Forms:</span> 
                <span style="font-weight: bold;">${teacherCompleted}/${teacherTotal} (${teacherTotal - teacherCompleted} remaining)</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Course Forms:</span> 
                <span style="font-weight: bold;">${courseCompleted}/${courseTotal} (${courseTotal - courseCompleted} remaining)</span>
            </div>
        </div>
        
        <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Rating Preferences:</label>
            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <label style="display: block; font-size: 12px;">Teacher Rating:</label>
                    <select id="teacher-rating" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;">
                        <option value="5">Excellent (5)</option>
                        <option value="4">Good (4)</option>
                        <option value="3">Average (3)</option>
                        <option value="random" selected>Randomize 4-5</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="display: block; font-size: 12px;">Course Rating:</label>
                    <select id="course-rating" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;">
                        <option value="5">Excellent (5)</option>
                        <option value="4">Good (4)</option>
                        <option value="3">Average (3)</option>
                        <option value="random" selected>Randomize 4-5</option>
                    </select>
                </div>
            </div>
            
            <label style="display: block; margin-bottom: 4px; font-weight: bold;">Attendance Level:</label>
            <select id="attendance-value" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc; margin-bottom: 8px;">
                <option value="5" selected>Excellent (>81%)</option>
                <option value="4">Very Good (80%)</option>
                <option value="3">Good (60%)</option>
                <option value="2">Average (40%)</option>
                <option value="1">Poor (20%)</option>
            </select>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <input type="checkbox" id="auto-submit" checked>
                <span>Auto-submit forms</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <input type="checkbox" id="process-teacher" checked>
                <span>Process Teacher Forms</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="process-course" checked>
                <span>Process Course Forms</span>
            </label>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="start-process" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                Start Auto-Fill Process
            </button>
            
            <div style="display: flex; gap: 10px;">
                <button id="fill-teacher" style="flex: 1; padding: 8px 0; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Fill Current Teacher Form
                </button>
                <button id="fill-course" style="flex: 1; padding: 8px 0; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Fill Current Course Form
                </button>
            </div>
        </div>
        
        <div id="status-message" style="margin-top: 10px; padding: 8px; background: #e7f3fe; border-left: 5px solid #2196F3; display: none; font-size: 14px;">
            Ready to start
        </div>
    `;
    
    document.body.appendChild(ui);
    
    // Add event listeners
    document.getElementById('close-ui').addEventListener('click', () => {
        ui.style.display = 'none';
    });
    
    document.getElementById('start-process').addEventListener('click', () => {
        updateConfigFromUI();
        startProcess();
    });
    
    document.getElementById('fill-teacher').addEventListener('click', () => {
        updateConfigFromUI();
        if (isOnTeacherForm()) {
            fillTeacherForm();
        } else {
            updateStatus("Not on a Teacher Evaluation Form. Please navigate to one first.", true);
        }
    });
    
    document.getElementById('fill-course').addEventListener('click', () => {
        updateConfigFromUI();
        if (isOnCourseForm()) {
            fillCourseForm();
        } else {
            updateStatus("Not on a Course Evaluation Form. Please navigate to one first.", true);
        }
    });
    
    // Make the UI draggable
    makeDraggable(ui);
    
    return ui;
}

// Helper function to make an element draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    const header = element.querySelector('h3') || element;
    header.style.cursor = 'move';
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Update configuration from UI
function updateConfigFromUI() {
    const teacherRating = document.getElementById('teacher-rating').value;
    const courseRating = document.getElementById('course-rating').value;
    
    config.teacherRating.randomize = (teacherRating === 'random');
    config.teacherRating.defaultValue = config.teacherRating.randomize ? 5 : parseInt(teacherRating);
    
    config.courseRating.randomize = (courseRating === 'random');
    config.courseRating.defaultValue = config.courseRating.randomize ? 5 : parseInt(courseRating);
    
    config.attendanceValue = parseInt(document.getElementById('attendance-value').value);
    config.autoSubmit = document.getElementById('auto-submit').checked;
    config.processTeacherForms = document.getElementById('process-teacher').checked;
    config.processCourseforms = document.getElementById('process-course').checked;
    
    // Save config to localStorage for persistence
    localStorage.setItem('qecAutoFillConfig', JSON.stringify(config));
}

// Update status message in UI
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

// Generate a random rating within the config range
function getRandomRating(config) {
    if (config.randomize) {
        return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    }
    return config.defaultValue;
}

// Check if we're on the dashboard page
function isOnDashboard() {
    return window.location.href.includes('/Dashboard.aspx');
}

// Check if we're on the teacher evaluation form
function isOnTeacherForm() {
    return window.location.href.includes('/TeacherEvaluationForm.aspx');
}

// Check if we're on the course evaluation form
function isOnCourseForm() {
    return window.location.href.includes('/CourseEvaluationForm.aspx');
}

// Navigate to a specific page
function navigateTo(url) {
    window.location.href = url;
}

// Fill the Teacher Evaluation Form
function fillTeacherForm() {
    updateStatus("Filling Teacher Evaluation Form...");
    
    // Select all radio buttons and set their values
    const questions = document.querySelectorAll('input[type="radio"][name^="Q."]');
    const questionGroups = {};
    
    // Group radio buttons by question
    questions.forEach(radio => {
        if (!questionGroups[radio.name]) {
            questionGroups[radio.name] = [];
        }
        questionGroups[radio.name].push(radio);
    });
    
    // Select a radio button for each question
    Object.keys(questionGroups).forEach(questionName => {
        const ratingValue = getRandomRating(config.teacherRating).toString();
        const radioToSelect = questionGroups[questionName].find(r => r.value === ratingValue);
        
        if (radioToSelect) {
            radioToSelect.checked = true;
            console.log(`Set ${questionName} to ${ratingValue}`);
        }
    });
    
    // Fill in the comment text areas
    const commentBoxes = [
        document.getElementById('txtComment1'),
        document.getElementById('txtComment2'),
        document.getElementById('txtComment3')
    ];
    
    const commentTextsToUse = [
        commentTexts.teacher.doneWell,
        commentTexts.teacher.improvements,
        commentTexts.teacher.additional
    ];
    
    commentBoxes.forEach((box, index) => {
        if (box) {
            box.value = commentTextsToUse[index];
        }
    });
    
    updateStatus("Teacher Form filled successfully!");
    
    // Submit the form if autoSubmit is enabled
    if (config.autoSubmit) {
        setTimeout(() => {
            updateStatus("Submitting Teacher Form...");
            SaveForm(); // This calls the form's own submit function
        }, 500);
    }
}

// Fill the Course Evaluation Form
function fillCourseForm() {
    updateStatus("Filling Course Evaluation Form...");
    
    // Select all radio buttons and set their values
    const questions = document.querySelectorAll('input[type="radio"][name^="Q."]');
    const questionGroups = {};
    
    // Group radio buttons by question
    questions.forEach(radio => {
        if (!questionGroups[radio.name]) {
            questionGroups[radio.name] = [];
        }
        questionGroups[radio.name].push(radio);
    });
    
    // Select a radio button for each question
    Object.keys(questionGroups).forEach(questionName => {
        let ratingValue;
        
        // Special handling for Q.5 (attendance)
        if (questionName === 'Q.5') {
            ratingValue = config.attendanceValue.toString();
        } else {
            ratingValue = getRandomRating(config.courseRating).toString();
        }
        
        const radioToSelect = questionGroups[questionName].find(r => r.value === ratingValue);
        
        if (radioToSelect) {
            radioToSelect.checked = true;
            console.log(`Set ${questionName} to ${ratingValue}`);
        }
    });
    
    // Fill in the comment text areas
    const commentIds = ['txtComment1', 'txtComment2', 'txtComment3', 'txtComment4', 
                        'txtComment5', 'txtComment6', 'txtComment7', 'txtComment8'];
    
    const commentTextsToUse = [
        commentTexts.course.contentOrganization,
        commentTexts.course.studentContribution,
        commentTexts.course.learningEnvironment,
        commentTexts.course.learningResources,
        commentTexts.course.qualityDelivery,
        commentTexts.course.assessment,
        commentTexts.course.instructor,
        commentTexts.course.tutorialCounseling
    ];
    
    commentIds.forEach((id, index) => {
        const commentBox = document.getElementById(id);
        if (commentBox) {
            commentBox.value = commentTextsToUse[index];
        }
    });
    
    updateStatus("Course Form filled successfully!");
    
    // Submit the form if autoSubmit is enabled
    if (config.autoSubmit) {
        setTimeout(() => {
            updateStatus("Submitting Course Form...");
            ValidateForm(); // This calls the form's own submit function
        }, 500);
    }
}

// Start the auto-fill process from the dashboard
function startProcess() {
    if (!isOnDashboard()) {
        updateStatus("Please navigate to the Dashboard first!", true);
        return;
    }
    
    state.processingStarted = true;
    
    // Store state in localStorage
    localStorage.setItem('qecAutoFillState', JSON.stringify(state));
    
    // Determine which forms to process first
    if (config.processTeacherForms) {
        updateStatus("Starting with Teacher Evaluation Forms...");
        const teacherLink = document.querySelector('a[href*="TeacherEvaluationForm"]');
        if (teacherLink) {
            teacherLink.click();
        } else {
            updateStatus("Teacher Evaluation link not found!", true);
            if (config.processCourseforms) {
                processCourseFormsNext();
            }
        }
    } else if (config.processCourseforms) {
        processCourseFormsNext();
    } else {
        updateStatus("No form types selected for processing!", true);
    }
}

// Process course forms next
function processCourseFormsNext() {
    updateStatus("Processing Course Evaluation Forms...");
    const courseLink = document.querySelector('a[href*="CourseEvaluationForm"]');
    if (courseLink) {
        courseLink.click();
    } else {
        updateStatus("Course Evaluation link not found!", true);
        completeProcess();
    }
}

// Complete the process
function completeProcess() {
    updateStatus("Auto-fill process completed!", false);
    state.processingStarted = false;
    localStorage.setItem('qecAutoFillState', JSON.stringify(state));
}

// Detect current page and take appropriate action
function checkCurrentPageAndAct() {
    // Restore state from localStorage if processing was started
    const savedState = localStorage.getItem('qecAutoFillState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
    }
    
    // Restore config from localStorage
    const savedConfig = localStorage.getItem('qecAutoFillConfig');
    if (savedConfig) {
        Object.assign(config, JSON.parse(savedConfig));
    }
    
    // Show UI on dashboard
    if (isOnDashboard()) {
        createControlUI();
        
        // If we're returning to dashboard and process is ongoing
        if (state.processingStarted) {
            if (config.processTeacherForms && document.querySelector('.Teacher.Evaluation')?.textContent?.includes('0/')) {
                // Still have teacher forms to do
                setTimeout(() => {
                    const teacherLink = document.querySelector('a[href*="TeacherEvaluationForm"]');
                    if (teacherLink) teacherLink.click();
                }, 1000);
            } else if (config.processCourseforms && document.querySelector('.Course.Evaluation')?.textContent?.includes('0/')) {
                // Still have course forms to do
                setTimeout(() => {
                    const courseLink = document.querySelector('a[href*="CourseEvaluationForm"]');
                    if (courseLink) courseLink.click();
                }, 1000);
            } else {
                // All forms are completed
                completeProcess();
            }
        }
    }
    // Auto-fill teacher form
    else if (isOnTeacherForm() && state.processingStarted) {
        setTimeout(() => {
            fillTeacherForm();
        }, 1000);
    }
    // Auto-fill course form
    else if (isOnCourseForm() && state.processingStarted) {
        setTimeout(() => {
            fillCourseForm();
        }, 1000);
    }
}

// Initialize
function initialize() {
    console.log("Initializing NUML QEC Auto-Fill Script");
    checkCurrentPageAndAct();
    
    // If not on Dashboard, create a small floating button to open UI
    if (!isOnDashboard()) {
        const floatButton = document.createElement('div');
        floatButton.id = 'qec-float-button';
        floatButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            text-align: center;
            line-height: 50px;
            font-size: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 9999;
        `;
        floatButton.innerHTML = "QEC";
        floatButton.addEventListener('click', () => {
            // Remove existing UI if any
            const existingUI = document.getElementById('qec-autofill-ui');
            if (existingUI) existingUI.remove();
            
            // Create UI
            const ui = createControlUI();
            
            // Show appropriate action buttons
            if (isOnTeacherForm()) {
                document.getElementById('fill-teacher').style.display = 'block';
                document.getElementById('fill-course').style.display = 'none';
                document.getElementById('start-process').style.display = 'none';
            } else if (isOnCourseForm()) {
                document.getElementById('fill-teacher').style.display = 'none';
                document.getElementById('fill-course').style.display = 'block';
                document.getElementById('start-process').style.display = 'none';
            }
        });
        document.body.appendChild(floatButton);
    }
}

// Start the script
initialize();
