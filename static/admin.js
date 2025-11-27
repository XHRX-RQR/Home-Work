// 管理端JavaScript

let selectedFile = null;

// 切换标签页
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'teachers') {
        document.getElementById('teachers-tab').classList.add('active');
        loadTeachers();
    } else if (tab === 'students') {
        document.getElementById('students-tab').classList.add('active');
        loadStudents();
    } else if (tab === 'homeworks') {
        document.getElementById('homeworks-tab').classList.add('active');
        loadHomeworks();
    }
}

// 加载统计数据
async function loadStats() {
    try {
        const [teachersRes, studentsRes, homeworksRes] = await Promise.all([
            fetch('/api/admin/teachers'),
            fetch('/api/admin/students'),
            fetch('/api/admin/homeworks')
        ]);

        const teachers = await teachersRes.json();
        const students = await studentsRes.json();
        const homeworks = await homeworksRes.json();

        document.getElementById('total-teachers').textContent = teachers.length;
        document.getElementById('total-students').textContent = students.length;
        document.getElementById('total-homeworks').textContent = homeworks.length;
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 教师管理
async function loadTeachers() {
    try {
        const response = await fetch('/api/admin/teachers');
        const teachers = await response.json();

        const tbody = document.getElementById('teachers-body');
        tbody.innerHTML = '';

        if (teachers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">暂无教师</td></tr>';
            return;
        }

        teachers.forEach(teacher => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teacher.username}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.homework_count}</td>
                <td>${teacher.enable_ai_review ? '✓ 已启用' : '✗ 已禁用'}</td>
                <td>${teacher.created_at}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="showEditTeacherModal(${teacher.id}, '${teacher.username}', '${teacher.subject}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteTeacher(${teacher.id}, '${teacher.username}')">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载教师列表失败:', error);
        alert('加载失败，请刷新页面');
    }
}

function showAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'block';
    document.getElementById('teacher-username').value = '';
    document.getElementById('teacher-password').value = '';
    document.getElementById('teacher-subject').value = '';
}

function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'none';
}

async function addTeacher(event) {
    event.preventDefault();

    const username = document.getElementById('teacher-username').value;
    const password = document.getElementById('teacher-password').value;
    const subject = document.getElementById('teacher-subject').value;

    try {
        const response = await fetch('/api/admin/add-teacher', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, subject })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeAddTeacherModal();
            loadTeachers();
            loadStats();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('添加教师失败:', error);
        alert('添加失败，请重试');
    }
}

function showEditTeacherModal(id, username, subject) {
    document.getElementById('editTeacherModal').style.display = 'block';
    document.getElementById('edit-teacher-id').value = id;
    document.getElementById('edit-teacher-username').value = username;
    document.getElementById('edit-teacher-password').value = '';
    document.getElementById('edit-teacher-subject').value = subject;
}

function closeEditTeacherModal() {
    document.getElementById('editTeacherModal').style.display = 'none';
}

async function editTeacher(event) {
    event.preventDefault();

    const id = document.getElementById('edit-teacher-id').value;
    const username = document.getElementById('edit-teacher-username').value;
    const password = document.getElementById('edit-teacher-password').value;
    const subject = document.getElementById('edit-teacher-subject').value;

    try {
        const response = await fetch(`/api/admin/edit-teacher/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, subject })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeEditTeacherModal();
            loadTeachers();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('编辑教师失败:', error);
        alert('编辑失败，请重试');
    }
}

async function deleteTeacher(id, username) {
    if (!confirm(`确定要删除教师 "${username}" 吗？\n\n删除教师将同时删除该教师布置的所有作业及相关提交记录！`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/delete-teacher/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadTeachers();
            loadStats();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('删除教师失败:', error);
        alert('删除失败，请重试');
    }
}

// 学生管理
async function loadStudents() {
    try {
        const response = await fetch('/api/admin/students');
        const students = await response.json();

        const tbody = document.getElementById('students-body');
        tbody.innerHTML = '';

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">暂无学生</td></tr>';
            return;
        }

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.student_id}</td>
                <td>${student.submission_count}</td>
                <td>${student.created_at}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="showEditStudentModal(${student.id}, '${student.name}', '${student.student_id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteStudent(${student.id}, '${student.name}')">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载学生列表失败:', error);
        alert('加载失败，请刷新页面');
    }
}

function showAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'block';
    document.getElementById('student-name').value = '';
    document.getElementById('student-id').value = '';
}

function closeAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'none';
}

async function addStudent(event) {
    event.preventDefault();

    const name = document.getElementById('student-name').value;
    const student_id = document.getElementById('student-id').value;

    try {
        const response = await fetch('/api/admin/add-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, student_id })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeAddStudentModal();
            loadStudents();
            loadStats();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('添加学生失败:', error);
        alert('添加失败，请重试');
    }
}

function showEditStudentModal(id, name, student_id) {
    document.getElementById('editStudentModal').style.display = 'block';
    document.getElementById('edit-student-db-id').value = id;
    document.getElementById('edit-student-name').value = name;
    document.getElementById('edit-student-id').value = student_id;
}

function closeEditStudentModal() {
    document.getElementById('editStudentModal').style.display = 'none';
}

async function editStudent(event) {
    event.preventDefault();

    const id = document.getElementById('edit-student-db-id').value;
    const name = document.getElementById('edit-student-name').value;
    const student_id = document.getElementById('edit-student-id').value;

    try {
        const response = await fetch(`/api/admin/edit-student/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, student_id })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeEditStudentModal();
            loadStudents();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('编辑学生失败:', error);
        alert('编辑失败，请重试');
    }
}

async function deleteStudent(id, name) {
    if (!confirm(`确定要删除学生 "${name}" 吗？\n\n删除学生将同时删除该学生的所有作业提交记录！`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/delete-student/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadStudents();
            loadStats();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('删除学生失败:', error);
        alert('删除失败，请重试');
    }
}

// 导入学生
function showImportStudentsModal() {
    document.getElementById('importStudentsModal').style.display = 'block';
    selectedFile = null;
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('upload-btn').disabled = true;
    document.getElementById('excel-file').value = '';
}

function closeImportStudentsModal() {
    document.getElementById('importStudentsModal').style.display = 'none';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file;
    const fileInfo = document.getElementById('file-info');
    fileInfo.style.display = 'block';
    fileInfo.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 4px;">已选择文件:</div>
        <div>${file.name}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">大小: ${(file.size / 1024).toFixed(2)} KB</div>
    `;
    document.getElementById('upload-btn').disabled = false;
}

async function uploadExcel() {
    if (!selectedFile) {
        alert('请先选择文件');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        document.getElementById('upload-btn').disabled = true;
        document.getElementById('upload-btn').textContent = '导入中...';

        const response = await fetch('/api/admin/import-students', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            let message = result.message;
            if (result.errors && result.errors.length > 0) {
                message += '\n\n错误详情:\n' + result.errors.join('\n');
            }
            alert(message);
            closeImportStudentsModal();
            loadStudents();
            loadStats();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请重试');
    } finally {
        document.getElementById('upload-btn').disabled = false;
        document.getElementById('upload-btn').textContent = '开始导入';
    }
}

// 作业管理
async function loadHomeworks() {
    try {
        const response = await fetch('/api/admin/homeworks');
        const homeworks = await response.json();

        const tbody = document.getElementById('homeworks-body');
        tbody.innerHTML = '';

        if (homeworks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">暂无作业</td></tr>';
            return;
        }

        homeworks.forEach(hw => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${hw.title}</td>
                <td>${hw.subject}</td>
                <td>${hw.teacher_name}</td>
                <td>${hw.created_at}</td>
                <td>${hw.submitted_count} / ${hw.total_students}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteHomework(${hw.id}, '${hw.title}')">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载作业列表失败:', error);
        alert('加载失败，请刷新页面');
    }
}

async function deleteHomework(id, title) {
    if (!confirm(`确定要删除作业 "${title}" 吗？\n\n删除作业将同时删除相关的所有提交记录！`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/delete-homework/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadHomeworks();
            loadStats();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('删除作业失败:', error);
        alert('删除失败，请重试');
    }
}

// 退出登录
async function logout() {
    if (!confirm('确定要退出登录吗？')) {
        return;
    }

    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    } catch (error) {
        console.error('退出登录失败:', error);
        window.location.href = '/admin/login';
    }
}

// 页面加载时初始化
window.addEventListener('load', () => {
    loadStats();
    loadTeachers();
});
