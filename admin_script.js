// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAXlEha6cyLALeVfE7Uhlh3cqU1yFpdDlQ",
    authDomain: "student-app-939d7.firebaseapp.com",
    databaseURL: "https://student-app-939d7-default-rtdb.firebaseio.com",
    projectId: "student-app-939d7",
    storageBucket: "student-app-939d7.appspot.com",
    messagingSenderId: "614984408185",
    appId: "1:614984408185:web:1f402a120ff92421fb08a8"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// State variables to keep track of where the user is
let currentClass = null;
let currentSubjectId = null;

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

// --- App Initialization ---
function initializeApp() {
    setupEventListeners();
    renderClassCards();
    showView('classes-view');
}

// --- View Management ---
function showView(viewId) {
    document.querySelectorAll('#main-content > div').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function showClassesView() {
    showView('classes-view');
}

function showSubjectsView(className) {
    currentClass = className;
    document.getElementById('class-name-for-subjects').textContent = `STD ${className}`;
    loadSubjects();
    showView('subjects-view');
}

function showLessonsView(subjectId, subjectName) {
    currentSubjectId = subjectId;
    document.getElementById('subject-name-for-lessons').textContent = subjectName;
    loadLessons();
    showView('lessons-view');
}


// --- Rendering Content ---

function renderClassCards() {
    const container = document.getElementById('class-cards-container');
    container.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-blue-100 transition';
        card.innerHTML = `<i class="fas fa-chalkboard-teacher text-4xl text-blue-500 mb-2"></i><h3 class="text-xl font-bold">STD ${i}</h3>`;
        card.onclick = () => showSubjectsView(i);
        container.appendChild(card);
    }
}

function loadSubjects() {
    const container = document.getElementById('subjects-list-container');
    container.innerHTML = '<p>Loading subjects...</p>';
    const path = `classes/${currentClass}/subjects`;

    database.ref(path).on('value', snapshot => {
        container.innerHTML = '';
        if (snapshot.exists()) {
            const subjects = snapshot.val();
            for (const subjectId in subjects) {
                const subject = subjects[subjectId];
                const card = document.createElement('div');
                card.className = 'bg-white p-4 rounded-lg shadow-md flex flex-col justify-between';
                card.innerHTML = `
                    <div>
                        <h4 class="text-lg font-semibold"><i class="fas ${subject.icon || 'fa-book'} mr-2"></i>${subject.name}</h4>
                    </div>
                    <div class="flex space-x-2 mt-4">
                        <button onclick="showLessonsView('${subjectId}', '${subject.name}')" class="w-full bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-sm">View Lessons</button>
                        <button onclick="openSubjectModal('${subjectId}', '${subject.name}', '${subject.icon}')" class="bg-yellow-500 text-white font-bold py-2 px-3 rounded-lg text-sm"><i class="fas fa-pencil-alt"></i></button>
                        <button onclick="confirmDelete('subject', '${subjectId}')" class="bg-red-500 text-white font-bold py-2 px-3 rounded-lg text-sm"><i class="fas fa-trash"></i></button>
                    </div>`;
                container.appendChild(card);
            }
        } else {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No subjects found. Click "Add Subject" to begin.</p>';
        }
    });
}

function loadLessons() {
    const container = document.getElementById('lessons-list-container');
    container.innerHTML = '<p>Loading lessons...</p>';
    const path = `classes/${currentClass}/subjects/${currentSubjectId}/lessons`;

    database.ref(path).on('value', snapshot => {
        container.innerHTML = '';
        if (snapshot.exists()) {
            const lessons = snapshot.val();
            for (const lessonId in lessons) {
                const lesson = lessons[lessonId];
                const item = document.createElement('div');
                item.className = 'bg-gray-50 p-4 rounded-lg shadow-md border flex justify-between items-center mb-4';
                item.innerHTML = `
                    <div>
                        <h4 class="text-lg font-semibold">${lesson.title}</h4>
                        <p class="text-sm text-gray-600">${lesson.qna ? lesson.qna.length : 0} questions</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="openLessonModal('${lessonId}')" class="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg"><i class="fas fa-pencil-alt"></i></button>
                        <button onclick="confirmDelete('lesson', '${lessonId}')" class="bg-red-500 text-white font-bold py-2 px-4 rounded-lg"><i class="fas fa-trash"></i></button>
                    </div>`;
                container.appendChild(item);
            }
        } else {
            container.innerHTML = '<p class="text-center text-gray-500">No lessons found. Click "Add Lesson" to create one.</p>';
        }
    });
}

// --- Subject Modal & Form ---
function openSubjectModal(id = null, name = '', icon = '') {
    const modal = document.getElementById('subject-modal');
    document.getElementById('subject-id').value = id;
    document.getElementById('subject-name').value = name;
    document.getElementById('subject-icon').value = icon;
    document.getElementById('subject-modal-title').textContent = id ? 'Edit Subject' : 'Add Subject';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeSubjectModal() {
    document.getElementById('subject-modal').classList.add('hidden');
    document.getElementById('subject-modal').classList.remove('flex');
    document.getElementById('subject-form').reset();
}

function saveSubject(event) {
    event.preventDefault();
    const id = document.getElementById('subject-id').value;
    const name = document.getElementById('subject-name').value;
    const icon = document.getElementById('subject-icon').value;

    const subjectData = { name, icon };
    const path = `classes/${currentClass}/subjects`;
    let ref = id ? database.ref(`${path}/${id}`) : database.ref(path).push();
    
    ref.set(subjectData)
        .then(() => {
            console.log("Subject saved successfully!");
            closeSubjectModal();
        })
        .catch(error => console.error("Error saving subject:", error));
}


// --- Lesson Modal & Form ---
let qnaCount = 0;

function openLessonModal(lessonId = null) {
    const modal = document.getElementById('lesson-modal');
    document.getElementById('lesson-id').value = lessonId;
    document.getElementById('lesson-modal-title').textContent = lessonId ? 'Edit Lesson' : 'Add Lesson';
    clearQnaContainer();

    if (lessonId) {
        const path = `classes/${currentClass}/subjects/${currentSubjectId}/lessons/${lessonId}`;
        database.ref(path).once('value', snapshot => {
            if (snapshot.exists()) {
                const lesson = snapshot.val();
                document.getElementById('lesson-title').value = lesson.title;
                document.getElementById('lesson-notes').value = lesson.notes || '';
                if (lesson.qna) {
                    lesson.qna.forEach(pair => addQnaPair(pair.question, pair.answer));
                }
            }
        });
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}


function closeLessonModal() {
    document.getElementById('lesson-modal').classList.add('hidden');
    document.getElementById('lesson-modal').classList.remove('flex');
    document.getElementById('lesson-form').reset();
    clearQnaContainer();
}

function saveLesson(event) {
    event.preventDefault();
    const id = document.getElementById('lesson-id').value;
    const title = document.getElementById('lesson-title').value;
    const notes = document.getElementById('lesson-notes').value;

    const qna = [];
    document.querySelectorAll('.qna-pair').forEach(pair => {
        const question = pair.querySelector('.qna-question').value;
        const answer = pair.querySelector('.qna-answer').value;
        if (question && answer) {
            qna.push({ question, answer });
        }
    });

    const lessonData = { title, notes, qna };
    const path = `classes/${currentClass}/subjects/${currentSubjectId}/lessons`;
    let ref = id ? database.ref(`${path}/${id}`) : database.ref(path).push();
    
    ref.set(lessonData)
        .then(() => {
            console.log("Lesson saved successfully!");
            closeLessonModal();
        })
        .catch(error => console.error("Error saving lesson:", error));
}


function addQnaPair(question = '', answer = '') {
    qnaCount++;
    const container = document.getElementById('qna-container');
    const div = document.createElement('div');
    div.id = `qna-pair-${qnaCount}`;
    div.className = 'qna-pair grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 border-t pt-2';
    div.innerHTML = `
        <input type="text" placeholder="Question ${qnaCount}" value="${question}" class="qna-question w-full p-2 border rounded-lg" required>
        <div class="flex">
            <input type="text" placeholder="Answer ${qnaCount}" value="${answer}" class="qna-answer w-full p-2 border rounded-lg" required>
            <button type="button" onclick="this.parentElement.parentElement.remove()" class="ml-2 text-red-500 p-2"><i class="fas fa-trash"></i></button>
        </div>`;
    container.appendChild(div);
}

function clearQnaContainer() {
    document.getElementById('qna-container').innerHTML = '<h3 class="text-lg font-semibold mt-4">Questions & Answers</h3>';
    qnaCount = 0;
}

// --- Deletion Logic ---
function confirmDelete(type, id) {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    document.getElementById('delete-modal-text').textContent = `Are you sure you want to delete this ${type}? This action cannot be undone.`;

    const confirmBtn = document.getElementById('confirm-delete-btn');
    const cancelBtn = document.getElementById('cancel-delete-btn');

    const confirmHandler = () => {
        if (type === 'subject') {
            deleteSubject(id);
        } else if (type === 'lesson') {
            deleteLesson(id);
        }
        cleanup();
    };

    const cleanup = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cleanup);
    };

    confirmBtn.addEventListener('click', confirmHandler, { once: true });
    cancelBtn.addEventListener('click', cleanup, { once: true });
}

function deleteSubject(subjectId) {
    const path = `classes/${currentClass}/subjects/${subjectId}`;
    database.ref(path).remove()
        .then(() => console.log("Subject deleted."))
        .catch(error => console.error("Deletion error:", error));
}

function deleteLesson(lessonId) {
    const path = `classes/${currentClass}/subjects/${currentSubjectId}/lessons/${lessonId}`;
    database.ref(path).remove()
        .then(() => console.log("Lesson deleted."))
        .catch(error => console.error("Deletion error:", error));
}

// --- Event Listeners ---
function setupEventListeners() {
    document.getElementById('subject-form').addEventListener('submit', saveSubject);
    document.getElementById('lesson-form').addEventListener('submit', saveLesson);
}
