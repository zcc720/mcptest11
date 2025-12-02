// DOM元素引用
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const allBtn = document.getElementById('allBtn');
const activeBtn = document.getElementById('activeBtn');
const completedBtn = document.getElementById('completedBtn');
const clearBtn = document.getElementById('clearBtn');
const allCount = document.getElementById('allCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeModal = document.getElementById('closeModal');

// 应用状态
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    updateCounters();
    renderTasks();
});

// 设置事件监听器
function setupEventListeners() {
    // 添加任务
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // 筛选按钮
    allBtn.addEventListener('click', () => setFilter('all'));
    activeBtn.addEventListener('click', () => setFilter('active'));
    completedBtn.addEventListener('click', () => setFilter('completed'));

    // 清除已完成任务
    clearBtn.addEventListener('click', clearCompletedTasks);

    // 模态框事件
    closeModal.addEventListener('click', closeEditModal);
    cancelBtn.addEventListener('click', closeEditModal);
    saveBtn.addEventListener('click', saveEditedTask);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    // 键盘事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeEditModal();
    });

    // 编辑输入框回车保存
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEditedTask();
    });
}

// 添加新任务
function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        showNotification('请输入任务内容！', 'warning');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    taskInput.value = '';
    saveTasks();
    renderTasks();
    updateCounters();
    
    showNotification('任务添加成功！', 'success');
}

// 渲染任务列表
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${getEmptyStateMessage()}</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item" data-task-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="toggleTask(${task.id})">
            </div>
            <span class="task-text ${task.completed ? 'completed' : ''}">
                ${escapeHtml(task.text)}
            </span>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="openEditModal(${task.id})" 
                        title="编辑任务">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" 
                        title="删除任务">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

// 切换任务完成状态
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateCounters();
        
        const message = task.completed ? '任务已完成！' : '任务已标记为未完成！';
        showNotification(message, 'success');
    }
}

// 删除任务
function deleteTask(id) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateCounters();
        
        showNotification('任务已删除！', 'success');
    }
}

// 打开编辑模态框
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        editingTaskId = id;
        editInput.value = task.text;
        editModal.classList.add('show');
        editInput.focus();
        editInput.select();
    }
}

// 关闭编辑模态框
function closeEditModal() {
    editModal.classList.remove('show');
    editingTaskId = null;
    editInput.value = '';
}

// 保存编辑的任务
function saveEditedTask() {
    const text = editInput.value.trim();
    
    if (text === '') {
        showNotification('任务内容不能为空！', 'warning');
        return;
    }

    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.text = text;
        saveTasks();
        renderTasks();
        closeEditModal();
        
        showNotification('任务已更新！', 'success');
    }
}

// 设置筛选器
function setFilter(filter) {
    currentFilter = filter;
    
    // 更新按钮状态
    allBtn.classList.toggle('active', filter === 'all');
    activeBtn.classList.toggle('active', filter === 'active');
    completedBtn.classList.toggle('active', filter === 'completed');
    
    renderTasks();
}

// 获取筛选后的任务
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// 清除已完成的任务
function clearCompletedTasks() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showNotification('没有已完成的任务可清除！', 'info');
        return;
    }

    if (confirm(`确定要清除 ${completedCount} 个已完成的任务吗？`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateCounters();
        
        showNotification(`已清除 ${completedCount} 个已完成的任务！`, 'success');
    }
}

// 更新计数器
function updateCounters() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    allCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// 获取空状态消息
function getEmptyStateMessage() {
    switch (currentFilter) {
        case 'active':
            return '没有未完成的任务';
        case 'completed':
            return '没有已完成的任务';
        default:
            return '还没有任务，添加一个开始吧！';
    }
}

// 本地存储相关函数
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('todoTasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除现有通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);

    // 添加动画样式
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 获取通知颜色
function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#4a6cf7'
    };
    return colors[type] || colors.info;
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 导出函数到全局作用域（用于HTML中的onclick）
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.openEditModal = openEditModal;