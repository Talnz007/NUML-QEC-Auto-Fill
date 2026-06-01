// NUML QEC Auto-Fill Script — FIXED
// Changes from original:
//   FIX-1: Radio buttons now dispatch 'change' event after .checked = true
//           so the page's own JS validation registers the selection.
//   FIX-2: Course form submission uses smart button detection instead of
//           hardcoded ValidateForm() which doesn't exist on that page.
//   FIX-3: Dashboard re-navigation no longer uses the broken '.includes("0/")'
//           condition. It now simply checks whether a form link still exists.
//   FIX-4: Teacher/course form auto-fill delay bumped to 1500ms for safety.

const config = {
    teacherRating: { min: 4, max: 5, randomize: true, defaultValue: 5 },
    courseRating:  { min: 4, max: 5, randomize: true, defaultValue: 5 },
    attendanceValue: 5,
    autoNavigate: true,
    autoSubmit: true,
    processTeacherForms: true,
    processCourseforms: true,
};

const commentTexts = {
    teacher: {
        doneWell:     `The instructor demonstrated exceptional teaching skills by presenting complex concepts in a clear and understandable manner. Their approach was methodical and well-structured, making it easy to follow along. The instructor maintained an engaging classroom environment, encouraging thoughtful discussions and addressing student questions thoroughly.`,
        improvements: `To further enhance the course, the instructor could consider incorporating more interactive elements like group projects or case studies. Additionally, providing more practice problems or supplementary materials for challenging topics would be beneficial for students who want to delve deeper into the subject matter.`,
        additional:   `The instructor's passion for the subject was evident throughout the semester, which made the learning experience more enjoyable. Their willingness to provide additional support outside regular class hours demonstrated their commitment to student success. Overall, this was a valuable course.`
    },
    course: {
        contentOrganization:  `The course content was well-structured and logically organized, making it easy to follow the progression of topics throughout the semester. The learning objectives were clearly defined, and the workload was appropriately challenging without being overwhelming. The course materials were up-to-date and relevant.`,
        studentContribution:  `The course design encouraged active participation and collaborative learning among students. The assignments and projects provided ample opportunity to apply theoretical knowledge to practical scenarios, enhancing our understanding of the subject matter. I made sure to participate actively in all discussions.`,
        learningEnvironment:  `The learning environment fostered open discussion and critical thinking. The blend of lectures, tutorials, and practical sessions created a comprehensive learning experience that accommodated different learning styles. The digital tools and resources used in the classroom enhanced the learning experience significantly.`,
        learningResources:    `The recommended readings and additional resources were highly relevant and well-curated. They provided deeper insights into the subject matter and supported the concepts covered in lectures. The online resources were easily accessible and well-organized, making self-study more effective.`,
        qualityDelivery:      `The course content was delivered in an engaging manner that stimulated interest in the subject. The pace of instruction was appropriate, allowing sufficient time to grasp complex concepts while maintaining momentum throughout the semester. The presentations were clear, well-structured and engaging.`,
        assessment:           `The assessment methods effectively evaluated both understanding and application of knowledge. The feedback provided was constructive and helped identify areas for improvement. The variety of assessment methods allowed students to demonstrate their knowledge in different formats appropriately.`,
        instructor:           `The instructor presented the material clearly and was responsive to student needs and questions. The organization of lectures and materials facilitated effective learning. The instructor's regular attendance and punctuality demonstrated their commitment to the course and to student success.`,
        tutorialCounseling:   `The tutorial sessions complemented the lectures well, providing valuable opportunities to clarify doubts and gain deeper understanding of complex topics. The tutor was approachable and addressed student problems effectively. The time allocated for tutorials was sufficient.`
    }
};

const state = {
    processingStarted: false,
    currentFormType: null,
    formsProcessed: { teacher: [], course: [] }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRandomRating(cfg) {
    return cfg.randomize
        ? Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min
        : cfg.defaultValue;
}

function isOnDashboard() {
    const url = window.location.href.toLowerCase();
    return url.includes('dashboard.aspx') ||
           url.includes('/student/dashboard') ||
           (url.includes('qec.numl.edu.pk/qec/student/') && !url.includes('evaluationform'));
}

function isOnTeacherForm() {
    return window.location.href.toLowerCase().includes('teacherevaluationform');
}

function isOnCourseForm() {
    return window.location.href.toLowerCase().includes('courseevaluationform');
}

function updateStatus(message, isError = false) {
    const el = document.getElementById('status-message');
    if (el) {
        el.style.display  = 'block';
        el.style.background   = isError ? '#ffebee' : '#e7f3fe';
        el.style.borderLeft   = isError ? '5px solid #f44336' : '5px solid #2196F3';
        el.textContent = message;
    }
    console.log(isError ? `[QEC ERROR] ${message}` : `[QEC] ${message}`);
}

// FIX-2 helper: find and click the page's own save/submit button reliably.
// Falls back to known function names if no button is found.
function submitCurrentForm(formType) {
    const candidates = [...document.querySelectorAll(
        'input[type="button"], input[type="submit"], button[type="button"], button[type="submit"], button'
    )];

    const submitBtn = candidates.find(el => {
        const label   = (el.value || el.textContent || '').trim().toLowerCase();
        const onclick = (el.getAttribute('onclick') || '').toLowerCase();
        return /save|submit|next|proceed/i.test(label) ||
               /save|submit|validate|next/i.test(onclick);
    });

    if (submitBtn) {
        console.log('[QEC] Clicking submit button:', submitBtn.value || submitBtn.textContent);
        submitBtn.click();
        return;
    }

    // Fallback to known global function names
    if (typeof SaveForm === 'function')     { SaveForm();     return; }
    if (typeof ValidateForm === 'function') { ValidateForm(); return; }

    updateStatus(`No submit button or function found for ${formType} form!`, true);
}

// FIX-1 helper: set radio AND fire change event so page JS validation sees it.
function selectRadio(radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
}

// ─── Form Fillers ────────────────────────────────────────────────────────────

function fillTeacherForm() {
    updateStatus("Filling Teacher Evaluation Form...");

    const questionGroups = {};
    document.querySelectorAll('input[type="radio"][name^="Q."]').forEach(r => {
        (questionGroups[r.name] = questionGroups[r.name] || []).push(r);
    });

    Object.keys(questionGroups).forEach(name => {
        const val   = getRandomRating(config.teacherRating).toString();
        const radio = questionGroups[name].find(r => r.value === val);
        if (radio) {
            selectRadio(radio); // FIX-1
            console.log(`[QEC] Teacher ${name} → ${val}`);
        }
    });

    const comments = [
        commentTexts.teacher.doneWell,
        commentTexts.teacher.improvements,
        commentTexts.teacher.additional
    ];
    ['txtComment1','txtComment2','txtComment3'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.value = comments[i];
    });

    updateStatus("Teacher Form filled. Submitting...");

    if (config.autoSubmit) {
        setTimeout(() => submitCurrentForm('teacher'), 600); // FIX-2
    }
}

function fillCourseForm() {
    updateStatus("Filling Course Evaluation Form...");

    const questionGroups = {};
    document.querySelectorAll('input[type="radio"][name^="Q."]').forEach(r => {
        (questionGroups[r.name] = questionGroups[r.name] || []).push(r);
    });

    Object.keys(questionGroups).forEach(name => {
        const val = name === 'Q.5'
            ? config.attendanceValue.toString()
            : getRandomRating(config.courseRating).toString();

        const radio = questionGroups[name].find(r => r.value === val);
        if (radio) {
            selectRadio(radio); // FIX-1
            console.log(`[QEC] Course ${name} → ${val}`);
        }
    });

    const commentKeys = [
        'contentOrganization','studentContribution','learningEnvironment',
        'learningResources','qualityDelivery','assessment','instructor','tutorialCounseling'
    ];
    ['txtComment1','txtComment2','txtComment3','txtComment4',
     'txtComment5','txtComment6','txtComment7','txtComment8'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.value = commentTexts.course[commentKeys[i]];
    });

    updateStatus("Course Form filled. Submitting...");

    if (config.autoSubmit) {
        setTimeout(() => submitCurrentForm('course'), 600); // FIX-2
    }
}

// ─── Process Control ─────────────────────────────────────────────────────────

function startProcess() {
    console.log("[QEC] URL:", window.location.href);
    if (!isOnDashboard()) {
        updateStatus("Please navigate to the Dashboard first!", true);
        return;
    }

    state.processingStarted = true;
    localStorage.setItem('qecAutoFillState',  JSON.stringify(state));
    localStorage.setItem('qecAutoFillConfig', JSON.stringify(config));

    updateStatus("Starting auto-fill process...");

    if (config.processTeacherForms) {
        const link = document.querySelector('a[href*="TeacherEvaluationForm"]');
        if (link) { link.click(); return; }
    }
    if (config.processCourseforms) {
        const link = document.querySelector('a[href*="CourseEvaluationForm"]');
        if (link) { link.click(); return; }
    }
    updateStatus("No evaluation form links found!", true);
}

function completeProcess() {
    updateStatus("✅ All forms completed!");
    state.processingStarted = false;
    localStorage.setItem('qecAutoFillState', JSON.stringify(state));
}

// ─── Page Detection & Auto-Act ────────────────────────────────────────────────

function checkCurrentPageAndAct() {
    console.log("[QEC] URL:", window.location.href);

    const savedState  = localStorage.getItem('qecAutoFillState');
    const savedConfig = localStorage.getItem('qecAutoFillConfig');
    if (savedState)  Object.assign(state,  JSON.parse(savedState));
    if (savedConfig) Object.assign(config, JSON.parse(savedConfig));

    if (isOnDashboard()) {
        createControlUI();

        if (state.processingStarted) {
            // FIX-3: simply look for any remaining form link — no broken counter check.
            setTimeout(() => {
                if (config.processTeacherForms) {
                    const tLink = document.querySelector('a[href*="TeacherEvaluationForm"]');
                    if (tLink) {
                        updateStatus("Navigating to next Teacher Form...");
                        tLink.click();
                        return;
                    }
                }
                if (config.processCourseforms) {
                    const cLink = document.querySelector('a[href*="CourseEvaluationForm"]');
                    if (cLink) {
                        updateStatus("Navigating to next Course Form...");
                        cLink.click();
                        return;
                    }
                }
                completeProcess();
            }, 1500);
        }
    }
    else if (isOnTeacherForm() && state.processingStarted) {
        setTimeout(fillTeacherForm, 1500); // FIX-4: slightly longer delay
    }
    else if (isOnCourseForm() && state.processingStarted) {
        setTimeout(fillCourseForm, 1500); // FIX-4
    }
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function updateConfigFromUI() {
    const tr = document.getElementById('teacher-rating').value;
    const cr = document.getElementById('course-rating').value;

    config.teacherRating.randomize    = (tr === 'random');
    config.teacherRating.defaultValue = config.teacherRating.randomize ? 5 : parseInt(tr);
    config.courseRating.randomize     = (cr === 'random');
    config.courseRating.defaultValue  = config.courseRating.randomize  ? 5 : parseInt(cr);

    config.attendanceValue      = parseInt(document.getElementById('attendance-value').value);
    config.autoSubmit           = document.getElementById('auto-submit').checked;
    config.processTeacherForms  = document.getElementById('process-teacher').checked;
    config.processCourseforms   = document.getElementById('process-course').checked;

    localStorage.setItem('qecAutoFillConfig', JSON.stringify(config));
}

function makeDraggable(element) {
    let p1=0,p2=0,p3=0,p4=0;
    const header = element.querySelector('h3') || element;
    header.style.cursor = 'move';
    header.onmousedown = e => {
        e.preventDefault(); p3=e.clientX; p4=e.clientY;
        document.onmouseup   = () => { document.onmouseup=null; document.onmousemove=null; };
        document.onmousemove = e => {
            p1=p3-e.clientX; p2=p4-e.clientY; p3=e.clientX; p4=e.clientY;
            element.style.top  = (element.offsetTop  - p2) + "px";
            element.style.left = (element.offsetLeft - p1) + "px";
        };
    };
}

function createControlUI() {
    document.getElementById('qec-autofill-ui')?.remove();

    const ui = document.createElement('div');
    ui.id = 'qec-autofill-ui';
    ui.style.cssText = `
        position:fixed;top:10px;right:10px;background:#fff;border:2px solid #007bff;
        border-radius:8px;padding:15px;max-width:350px;z-index:10000;
        box-shadow:0 4px 8px rgba(0,0,0,.2);font-family:Arial,sans-serif;
    `;

    ui.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <h3 style="margin:0;color:#007bff;font-size:18px;">NUML QEC Auto-Fill</h3>
            <button id="close-ui" style="background:none;border:none;color:#f00;cursor:pointer;font-size:16px;">✕</button>
        </div>

        <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:4px;font-weight:bold;">Rating Preferences:</label>
            <div style="display:flex;gap:10px;margin-bottom:8px;">
                <div style="flex:1;">
                    <label style="display:block;font-size:12px;">Teacher:</label>
                    <select id="teacher-rating" style="width:100%;padding:6px;border-radius:4px;border:1px solid #ccc;">
                        <option value="5">Excellent (5)</option>
                        <option value="4">Good (4)</option>
                        <option value="3">Average (3)</option>
                        <option value="random" selected>Randomize 4-5</option>
                    </select>
                </div>
                <div style="flex:1;">
                    <label style="display:block;font-size:12px;">Course:</label>
                    <select id="course-rating" style="width:100%;padding:6px;border-radius:4px;border:1px solid #ccc;">
                        <option value="5">Excellent (5)</option>
                        <option value="4">Good (4)</option>
                        <option value="3">Average (3)</option>
                        <option value="random" selected>Randomize 4-5</option>
                    </select>
                </div>
            </div>

            <label style="display:block;margin-bottom:4px;font-weight:bold;">Attendance Level:</label>
            <select id="attendance-value" style="width:100%;padding:6px;border-radius:4px;border:1px solid #ccc;margin-bottom:8px;">
                <option value="5" selected>Excellent (>81%)</option>
                <option value="4">Very Good (80%)</option>
                <option value="3">Good (60%)</option>
                <option value="2">Average (40%)</option>
                <option value="1">Poor (20%)</option>
            </select>
        </div>

        <div style="margin-bottom:15px;">
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <input type="checkbox" id="auto-submit" checked> Auto-submit forms
            </label>
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <input type="checkbox" id="process-teacher" checked> Process Teacher Forms
            </label>
            <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="process-course" checked> Process Course Forms
            </label>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
            <button id="start-process" style="padding:8px 15px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                Start Auto-Fill Process
            </button>
            <div style="display:flex;gap:10px;">
                <button id="fill-teacher" style="flex:1;padding:8px 0;background:#17a2b8;color:#fff;border:none;border-radius:4px;cursor:pointer;">
                    Fill Teacher Form
                </button>
                <button id="fill-course" style="flex:1;padding:8px 0;background:#fd7e14;color:#fff;border:none;border-radius:4px;cursor:pointer;">
                    Fill Course Form
                </button>
            </div>
        </div>

        <div id="status-message" style="margin-top:10px;padding:8px;background:#e7f3fe;border-left:5px solid #2196F3;display:none;font-size:14px;">
            Ready
        </div>
    `;

    document.body.appendChild(ui);
    makeDraggable(ui);

    document.getElementById('close-ui').addEventListener('click', () => ui.style.display='none');

    document.getElementById('start-process').addEventListener('click', () => {
        updateConfigFromUI(); startProcess();
    });
    document.getElementById('fill-teacher').addEventListener('click', () => {
        updateConfigFromUI();
        isOnTeacherForm() ? fillTeacherForm() : updateStatus("Not on a Teacher Evaluation Form.", true);
    });
    document.getElementById('fill-course').addEventListener('click', () => {
        updateConfigFromUI();
        isOnCourseForm() ? fillCourseForm() : updateStatus("Not on a Course Evaluation Form.", true);
    });

    return ui;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function initialize() {
    console.log("[QEC] Initializing on:", window.location.href);
    checkCurrentPageAndAct();

    if (!isOnDashboard()) {
        const btn = document.createElement('div');
        btn.id = 'qec-float-button';
        btn.style.cssText = `
            position:fixed;bottom:20px;right:20px;background:#007bff;color:#fff;
            width:50px;height:50px;border-radius:50%;text-align:center;line-height:50px;
            font-size:14px;font-weight:bold;box-shadow:0 2px 5px rgba(0,0,0,.3);
            cursor:pointer;z-index:9999;
        `;
        btn.textContent = "QEC";
        btn.addEventListener('click', () => {
            document.getElementById('qec-autofill-ui')?.remove();
            const ui = createControlUI();
            if (isOnTeacherForm()) {
                document.getElementById('fill-course').style.display = 'none';
                document.getElementById('start-process').style.display = 'none';
            } else if (isOnCourseForm()) {
                document.getElementById('fill-teacher').style.display = 'none';
                document.getElementById('start-process').style.display = 'none';
            }
        });
        document.body.appendChild(btn);
    }
}

initialize();
