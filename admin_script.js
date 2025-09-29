// Firebase Config (same as student app)
const firebaseConfig = { apiKey: "AIzaSyAXlEha6cyLALeVfE7Uhlh3cqU1yFpdDlQ", authDomain: "student-app-939d7.firebaseapp.com", databaseURL: "https://student-app-939d7-default-rtdb.firebaseio.com", projectId: "student-app-939d7", storageBucket: "student-app-939d7.appspot.com", messagingSenderId: "614984408185", appId: "1:614984408185:web:1f402a120ff92421fb08a8" };

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// --- Admin Authentication ---
async function adminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('admin-error');
    errorEl.textContent = 'Logging in...';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-content').classList.remove('hidden');
        errorEl.textContent = '';
        initializeApp(); 
    } catch (error) {
        errorEl.textContent = "Login failed. Check email and password.";
    }
}

// --- App Initialization & Event Listeners ---
function initializeApp() {
    // Populate form and view sections inside the #admin-content div
    // This is to avoid redundancy. The HTML for these sections is in admin.html
    const addEditSection = document.getElementById('add-edit-section');
    addEditSection.querySelector('form').innerHTML = `
        <input type="hidden" id="lesson-id">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select id="lesson-class" class="w-full p-3 border rounded-lg" required></select>
            <select id="lesson-medium" class="w-full p-3 border rounded-lg" required><option value="">Select Medium</option><option value="English">English</option><option value="Marathi">Marathi</option><option value="Semi-English">Semi-English</option></select>
            <select id="lesson-subject" class="w-full p-3 border rounded-lg" required></select>
        </div>
        <input type="text" id="lesson-title" placeholder="Lesson/Chapter Title" class="w-full p-3 border rounded-lg" required>
        <textarea id="free-content" placeholder="Free Content (Short Preview)" class="w-full p-3 border rounded-lg" rows="3"></textarea>
        <textarea id="full-content" placeholder="Full Lesson Content" class="w-full p-3 border rounded-lg" rows="6" required></textarea>
        <div class="flex items-center"><input type="checkbox" id="is-paid" class="h-4 w-4 text-blue-600"><label for="is-paid" class="ml-2">Mark as Premium</label></div>
        <div id="qna-container"><h3 class="text-lg font-semibold mt-4">Questions & Answers</h3></div>
        <button type="button" onclick="addQnaPair()" class="mt-2 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded-lg"><i class="fas fa-plus mr-2"></i>Add Question</button>
        <div class="flex space-x-4 mt-6"><button type="submit" class="w-full gradient-success text-white font-bold py-3 px-4 rounded-lg">Save Lesson</button><button type="button" onclick="resetForm()" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg">Cancel</button></div>
        <p id="success-message" class="text-green-500 text-center mt-4"></p>`;
        
    const manageSection = addEditSection.nextElementSibling;
    manageSection.innerHTML += `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select id="view-class" class="w-full p-3 border rounded-lg"></select>
            <select id="view-medium" class="w-full p-3 border rounded-lg"><option value="">Select Medium</option><option value="English">English</option><option value="Marathi">Marathi</option><option value="Semi-English">Semi-English</option></select>
            <select id="view-subject" class="w-full p-3 border rounded-lg"></select>
        </div>
        <div id="lessons-list-container" class="mt-6"></div>`;

    populateClassDropdowns();
    setupEventListeners();
    document.getElementById('lesson-form').addEventListener('submit', saveLesson);
}
// All other functions (populateClassDropdowns, setupEventListeners, loadSubjects, addQnaPair, removeQnaPair, saveLesson, resetForm, loadLessonsToView, editLesson) remain the same as the previous version.
// They are included here for completeness.
function populateClassDropdowns(){const e=[document.getElementById("lesson-class"),document.getElementById("view-class")];e.forEach(t=>{t.innerHTML='<option value="">Select Class</option>';for(let n=1;n<=10;n++)t.innerHTML+=`<option value="${n}th">${n}th</option>`})}
function setupEventListeners(){document.getElementById("lesson-class").addEventListener("change",()=>loadSubjects("lesson")),document.getElementById("lesson-medium").addEventListener("change",()=>loadSubjects("lesson")),document.getElementById("view-class").addEventListener("change",()=>loadSubjects("view")),document.getElementById("view-medium").addEventListener("change",()=>loadSubjects("view")),document.getElementById("view-subject").addEventListener("change",loadLessonsToView)}
function loadSubjects(e){const t=document.getElementById(`${e}-class`).value,n=document.getElementById(`${e}-medium`).value,o=document.getElementById(`${e}-subject`);if(o.innerHTML='<option value="">Loading Subjects...</option>',!t||!n)return void(o.innerHTML='<option value="">Select Class and Medium</option>');const l=`subjects/${t}/${n}`;database.ref(l).once("value",a=>{if(o.innerHTML='<option value="">Select Subject</option>',a.exists()){const c=a.val();for(const d in c)o.innerHTML+=`<option value="${d}">${c[d].name}</option>`}else o.innerHTML='<option value="">No subjects found</option>'})}
let qnaCount=0;function addQnaPair(e="",t=""){qnaCount++;const n=document.getElementById("qna-container"),o=document.createElement("div");o.id=`qna-pair-${qnaCount}`,o.className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 border-t pt-2",o.innerHTML=`<input type="text" placeholder="Question ${qnaCount}" value="${e}" class="qna-question w-full p-2 border rounded-lg" required><div class="flex"><input type="text" placeholder="Answer ${qnaCount}" value="${t}" class="qna-answer w-full p-2 border rounded-lg" required><button type="button" onclick="removeQnaPair(${qnaCount})" class="ml-2 text-red-500 p-2"><i class="fas fa-trash"></i></button></div>`,n.appendChild(o)}
function removeQnaPair(e){document.getElementById(`qna-pair-${e}`).remove()}
function clearQnaContainer(){document.getElementById("qna-container").innerHTML='<h3 class="text-lg font-semibold mt-4">Questions & Answers</h3>',qnaCount=0}
function saveLesson(e){e.preventDefault();const t=document.getElementById("success-message");t.textContent="Saving...";const n=document.getElementById("lesson-class").value,o=document.getElementById("lesson-medium").value,l=document.getElementById("lesson-subject").value,a=document.getElementById("lesson-id").value,c=[];document.querySelectorAll("#qna-container > div").forEach(s=>{const i=s.querySelector(".qna-question").value,r=s.querySelector(".qna-answer").value;i&&r&&c.push({question:i,answer:r})});const d={title:document.getElementById("lesson-title").value,freeContent:document.getElementById("free-content").value,fullContent:document.getElementById("full-content").value,isPaid:document.getElementById("is-paid").checked,qna:c},s=`lessons/${n}/${o}/${l}`;let i;i=a?database.ref(`${s}/${a}`):database.ref(s).push(),i.set(d).then(()=>{t.textContent="Lesson saved successfully!",resetForm(),loadLessonsToView(),setTimeout(()=>t.textContent="",3e3)}).catch(r=>{console.error("Error saving lesson:",r),t.textContent="Error saving lesson."})}
function resetForm(){document.getElementById("lesson-form").reset(),document.getElementById("lesson-id").value="",document.getElementById("form-title").textContent="Add a New Lesson",clearQnaContainer(),window.scrollTo(0,0)}
function loadLessonsToView(){const e=document.getElementById("view-class").value,t=document.getElementById("view-medium").value,n=document.getElementById("view-subject").value,o=document.getElementById("lessons-list-container");if(o.innerHTML='<p class="text-center">Loading...</p>',!e||!t||!n)return void(o.innerHTML='<p class="text-center text-gray-500">Please select all fields.</p>');const l=`lessons/${e}/${t}/${n}`;database.ref(l).once("value",a=>{if(a.exists()){const c=a.val();o.innerHTML=`<h3 class="text-xl font-bold mb-4">Found ${Object.keys(c).length} lessons</h3>`,o.innerHTML+=Object.keys(c).map(d=>{const s=c[d];return`<div class="bg-gray-50 p-4 rounded-lg shadow-md border flex justify-between items-center mb-4"><div><h4 class="text-lg font-semibold">${s.title}</h4><p class="text-sm text-gray-600">${s.isPaid?"Premium":"Free"}</p></div><div class="flex space-x-2"><button onclick="editLesson('${d}')" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"><i class="fas fa-pencil-alt"></i></button><button onclick="confirmDeleteLesson('${d}')" class="bg-red-500 text-white font-bold py-2 px-4 rounded-lg"><i class="fas fa-trash"></i></button></div></div>`}).join("")}else o.innerHTML='<p class="text-center text-gray-500">No lessons found.</p>'})}
function editLesson(e){const t=document.getElementById("view-class").value,n=document.getElementById("view-medium").value,o=document.getElementById("view-subject").value,l=`lessons/${t}/${n}/${o}/${e}`;database.ref(l).once("value",a=>{if(a.exists()){const c=a.val();document.getElementById("lesson-id").value=e,document.getElementById("lesson-class").value=t,document.getElementById("lesson-medium").value=n,loadSubjects("lesson"),setTimeout(()=>{document.getElementById("lesson-subject").value=o},500),document.getElementById("lesson-title").value=c.title,document.getElementById("free-content").value=c.freeContent||"",document.getElementById("full-content").value=c.fullContent||"",document.getElementById("is-paid").checked=c.isPaid,clearQnaContainer(),c.qna&&c.qna.forEach(d=>addQnaPair(d.question,d.answer)),document.getElementById("form-title").textContent=`Editing: ${c.title}`,window.scrollTo(0,0)}})}

// --- NEW Custom Deletion Modal Logic ---
function confirmDeleteLesson(lessonId) {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const confirmBtn = document.getElementById('confirm-delete-btn');
    const cancelBtn = document.getElementById('cancel-delete-btn');

    const confirmHandler = () => {
        deleteLesson(lessonId);
        cleanup();
    };

    const cleanup = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cleanup);
    };

    confirmBtn.addEventListener('click', confirmHandler);
    cancelBtn.addEventListener('click', cleanup);
}

function deleteLesson(lessonId) {
    const classVal = document.getElementById('view-class').value;
    const mediumVal = document.getElementById('view-medium').value;
    const subjectId = document.getElementById('view-subject').value;
    const path = `lessons/${classVal}/${mediumVal}/${subjectId}/${lessonId}`;

    database.ref(path).remove()
        .then(() => {
            console.log("Lesson deleted successfully!");
            loadLessonsToView(); // Refresh the list
        })
        .catch(error => {
            console.error("Deletion error:", error);
        });
}
