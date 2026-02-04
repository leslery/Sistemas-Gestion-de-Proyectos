/* ========================================
   SGI - Sistema de Gestión de Iniciativas
   JavaScript Principal - CGE Chile
   ======================================== */

// State Management
const AppState = {
    currentView: 'dashboard-ejecutiva',
    sidebarCollapsed: false,
    projects: [],
    filters: {}
};

// Sample Data
const SampleData = {
    projects: [
        { id: 1, code: 'PRY-2026-001', name: 'Modernización ERP SAP S/4HANA', priority: 'P1', status: 'en-ejecucion', phase: 'Construcción', type: 'CAPEX Intangible', budget: 850000, spent: 510000, owner: 'Carlos Méndez', area: 'TI', startDate: '2025-06-01', endDate: '2026-08-30' },
        { id: 2, code: 'PRY-2026-002', name: 'Automatización Procesos Comerciales', priority: 'P2', status: 'en-revision', phase: 'Análisis', type: 'CAPEX Intangible', budget: 320000, spent: 64000, owner: 'Ana García', area: 'Comercial', startDate: '2025-09-15', endDate: '2026-05-30' },
        { id: 3, code: 'PRY-2026-003', name: 'Ciberseguridad - Zero Trust', priority: 'P1', status: 'en-riesgo', phase: 'Pruebas', type: 'CAPEX Tangible', budget: 450000, spent: 380000, owner: 'Roberto Silva', area: 'Seguridad', startDate: '2025-03-01', endDate: '2026-02-28' },
        { id: 4, code: 'PRY-2026-004', name: 'Portal de Autoatención Clientes', priority: 'P3', status: 'en-ejecucion', phase: 'Transición', type: 'OPEX', budget: 180000, spent: 162000, owner: 'María López', area: 'Digital', startDate: '2025-07-01', endDate: '2026-03-15' },
        { id: 5, code: 'PRY-2026-005', name: 'Migración Data Center', priority: 'P2', status: 'pendiente', phase: 'Planificación', type: 'CAPEX Tangible', budget: 1200000, spent: 0, owner: 'Pedro Rojas', area: 'Infraestructura', startDate: '2026-03-01', endDate: '2026-12-31' },
        { id: 6, code: 'PRY-2026-006', name: 'App Móvil Técnicos Terreno', priority: 'P3', status: 'pendiente', phase: 'Factibilidad', type: 'CAPEX Intangible', budget: 95000, spent: 0, owner: 'Luis Torres', area: 'Operaciones', startDate: '2026-04-01', endDate: '2026-09-30' },
    ],
    bancoReserva: [
        { id: 101, name: 'Sistema de Gestión Documental', priority: 'P3', score: 85, area: 'Administración', estimatedBudget: 120000 },
        { id: 102, name: 'Plataforma de Capacitación Online', priority: 'P4', score: 72, area: 'RRHH', estimatedBudget: 80000 },
        { id: 103, name: 'Integración SCADA-ERP', priority: 'P1', score: 92, area: 'Operaciones', estimatedBudget: 350000 },
        { id: 104, name: 'Dashboard Operacional Tiempo Real', priority: 'P2', score: 88, area: 'Operaciones', estimatedBudget: 150000 },
    ],
    pendingApprovals: [
        { id: 201, name: 'Migración Data Center', stage: 'Comité de Expertos', days: 3, priority: 'P2' },
        { id: 202, name: 'App Móvil Técnicos Terreno', stage: 'Informe Factibilidad', days: 5, priority: 'P3' },
        { id: 203, name: 'Integración SCADA-ERP', stage: 'Activación Plan Anual', days: 1, priority: 'P1' },
    ],
    sessions: [
        { date: '2026-02-05', time: '10:00', type: 'Comité Expertos', projects: 4 },
        { date: '2026-02-12', time: '15:00', type: 'Comité Inversiones', projects: 6 },
        { date: '2026-02-19', time: '09:00', type: 'Review Gobernanza', projects: 8 },
    ]
};

// Notifications Data
const NotificationsData = [
    { id: 1, type: 'warning', title: 'Proyecto en Riesgo', message: 'Ciberseguridad Zero Trust requiere atención', time: '5 min', read: false, link: 'seguimiento-riesgos' },
    { id: 2, type: 'info', title: 'Comité de Expertos', message: 'Sesión programada para el 05 Feb 2026', time: '1 hora', read: false, link: 'activacion-comite' },
    { id: 3, type: 'success', title: 'Proyecto Aprobado', message: 'Integración SCADA-ERP fue aprobado', time: '2 horas', read: false, link: 'activacion-banco' },
    { id: 4, type: 'warning', title: 'Presupuesto Excedido', message: 'ERP SAP superó el 80% del presupuesto', time: '3 horas', read: true, link: 'seguimiento-presupuestario' },
    { id: 5, type: 'info', title: 'Documento Pendiente', message: 'Informe de factibilidad por revisar', time: '1 día', read: true, link: 'activacion-factibilidad' },
];

// Show Notification Toast
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.toast-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initNavigation();
    initModals();
    initForms();
    initTabs();
    initHeader();
    loadView(AppState.currentView);
});

// Header Functions
function initHeader() {
    initGlobalSearch();
    initNotifications();
    initUserMenu();
    initHelpPanel();
}

// Global Search
function initGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            const results = performSearch(query);
            showSearchResults(results, query);
        } else {
            hideSearchResults();
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 2) {
            searchResults?.classList.add('active');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search')) {
            hideSearchResults();
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideSearchResults();
            searchInput.blur();
        }
    });
}

function performSearch(query) {
    query = query.toLowerCase();
    const results = {
        projects: SampleData.projects.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            p.owner.toLowerCase().includes(query)
        ),
        banco: SampleData.bancoReserva.filter(p =>
            p.name.toLowerCase().includes(query)
        )
    };
    return results;
}

function showSearchResults(results, query) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    const totalResults = results.projects.length + results.banco.length;

    if (totalResults === 0) {
        container.innerHTML = `
            <div class="search-empty">
                <i class="fas fa-search"></i>
                <p>No se encontraron resultados para "${query}"</p>
            </div>
        `;
    } else {
        let html = '';

        if (results.projects.length > 0) {
            html += `<div class="search-category">Proyectos Activos</div>`;
            html += results.projects.slice(0, 4).map(p => `
                <div class="search-item" onclick="goToProject('${p.id}')">
                    <div class="search-icon"><i class="fas fa-project-diagram"></i></div>
                    <div class="search-info">
                        <div class="search-title">${highlightMatch(p.name, query)}</div>
                        <div class="search-meta">${p.code} · ${p.phase} · ${p.owner}</div>
                    </div>
                    <span class="status ${p.status}">${formatStatus(p.status)}</span>
                </div>
            `).join('');
        }

        if (results.banco.length > 0) {
            html += `<div class="search-category">Banco de Reserva</div>`;
            html += results.banco.slice(0, 3).map(p => `
                <div class="search-item" onclick="navigateTo('activacion-banco')">
                    <div class="search-icon"><i class="fas fa-university"></i></div>
                    <div class="search-info">
                        <div class="search-title">${highlightMatch(p.name, query)}</div>
                        <div class="search-meta">${p.area} · Score: ${p.score}</div>
                    </div>
                    <span class="priority ${p.priority.toLowerCase()}">${p.priority}</span>
                </div>
            `).join('');
        }

        html += `
            <div class="search-footer">
                <span>${totalResults} resultado(s) encontrado(s)</span>
                <a href="#" onclick="advancedSearch('${query}')">Búsqueda avanzada</a>
            </div>
        `;

        container.innerHTML = html;
    }

    container.classList.add('active');
}

function hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) container.classList.remove('active');
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function goToProject(projectId) {
    hideSearchResults();
    document.getElementById('globalSearch').value = '';
    const project = SampleData.projects.find(p => p.id == projectId);
    if (project) {
        showToast(`Abriendo: ${project.name}`, 'info');
        navigateTo('dashboard-portafolio');
    }
}

function advancedSearch(query) {
    hideSearchResults();
    showToast(`Búsqueda avanzada: "${query}"`, 'info');
    navigateTo('dashboard-portafolio');
}

// Notifications
function initNotifications() {
    const btn = document.getElementById('btnNotifications');
    const panel = document.getElementById('notificationsPanel');

    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPanels();
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            renderNotifications();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notifications-panel') && !e.target.closest('#btnNotifications')) {
            panel.classList.remove('active');
        }
    });

    updateNotificationBadge();
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    const unreadCount = NotificationsData.filter(n => !n.read).length;

    const html = NotificationsData.map(n => `
        <div class="notification-item ${n.read ? 'read' : ''}" onclick="openNotification(${n.id})">
            <div class="notification-icon ${n.type}">
                <i class="fas fa-${n.type === 'warning' ? 'exclamation-triangle' : n.type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${n.title}</div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-time"><i class="fas fa-clock"></i> ${n.time}</div>
            </div>
            ${!n.read ? '<div class="notification-dot"></div>' : ''}
        </div>
    `).join('');

    container.innerHTML = html;
}

function openNotification(id) {
    const notification = NotificationsData.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
        document.getElementById('notificationsPanel').classList.remove('active');
        navigateTo(notification.link);
        showToast(notification.message, 'info');
    }
}

function markAllRead() {
    NotificationsData.forEach(n => n.read = true);
    updateNotificationBadge();
    renderNotifications();
    showToast('Todas las notificaciones marcadas como leídas', 'success');
}

function updateNotificationBadge() {
    const badge = document.querySelector('#btnNotifications .badge');
    const unreadCount = NotificationsData.filter(n => !n.read).length;

    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// User Menu
function initUserMenu() {
    const profile = document.getElementById('userProfile');
    const menu = document.getElementById('userMenu');

    if (!profile || !menu) return;

    profile.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPanels();
        menu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu') && !e.target.closest('#userProfile')) {
            menu.classList.remove('active');
        }
    });
}

function userAction(action) {
    document.getElementById('userMenu').classList.remove('active');

    switch(action) {
        case 'profile':
            openModal('modal-perfil');
            break;
        case 'settings':
            navigateTo('config-usuarios');
            break;
        case 'help':
            toggleHelpPanel();
            break;
        case 'logout':
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                showToast('Cerrando sesión...', 'info');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
            break;
    }
}

// Help Panel
function initHelpPanel() {
    const btn = document.getElementById('btnHelp');
    const panel = document.getElementById('helpPanel');

    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPanels();
        panel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.help-panel') && !e.target.closest('#btnHelp')) {
            panel.classList.remove('active');
        }
    });
}

function toggleHelpPanel() {
    const panel = document.getElementById('helpPanel');
    if (panel) {
        closeAllPanels();
        panel.classList.toggle('active');
    }
}

function showHelp(topic) {
    document.getElementById('helpPanel').classList.remove('active');

    const helpTopics = {
        'inicio': 'El Dashboard muestra un resumen ejecutivo de todos los proyectos e iniciativas.',
        'proyectos': 'Gestione el ciclo de vida completo de sus proyectos desde la activación hasta el cierre.',
        'busqueda': 'Use la barra de búsqueda para encontrar proyectos por nombre, código o responsable.',
        'shortcuts': 'Atajos: Ctrl+K (Búsqueda), Ctrl+N (Nueva Iniciativa), Esc (Cerrar modal)'
    };

    showToast(helpTopics[topic] || 'Consulte el manual de usuario para más información.', 'info');
}

function closeAllPanels() {
    document.querySelectorAll('.dropdown-panel').forEach(p => p.classList.remove('active'));
}

// Sidebar Functions
function initSidebar() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('mainContent');

    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
            AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
        });
    }

    // Sidebar search
    const search = document.getElementById('sidebarSearch');
    if (search) {
        search.addEventListener('input', (e) => filterNavigation(e.target.value));
    }
}

function toggleSection(header) {
    const section = header.parentElement;
    const wasExpanded = section.classList.contains('expanded');

    // Close all sections
    document.querySelectorAll('.nav-section').forEach(s => {
        s.classList.remove('expanded');
        s.querySelector('.nav-header').classList.remove('expanded', 'active');
    });

    // Open if wasn't expanded
    if (!wasExpanded) {
        section.classList.add('expanded');
        header.classList.add('expanded', 'active');
    }
}

function filterNavigation(query) {
    query = query.toLowerCase();
    document.querySelectorAll('.nav-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });

    if (query) {
        document.querySelectorAll('.nav-section').forEach(section => {
            const hasVisible = [...section.querySelectorAll('.nav-item')].some(
                item => item.style.display !== 'none'
            );
            if (hasVisible) {
                section.classList.add('expanded');
                section.querySelector('.nav-header').classList.add('expanded');
            }
        });
    }
}

// Navigation Functions
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.dataset.view;
            if (viewId) {
                navigateTo(viewId);

                // Update active state
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
}

function navigateTo(viewId) {
    AppState.currentView = viewId;
    loadView(viewId);
    updateBreadcrumb(viewId);

    // Close mobile sidebar
    if (window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('mobile-open');
    }
}

function loadView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Show target view
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.add('active');
        initViewData(viewId);
    }
}

function updateBreadcrumb(viewId) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    const parts = viewId.split('-');
    const viewNames = {
        'dashboard': 'Dashboard',
        'ejecutiva': 'Vista Ejecutiva',
        'portafolio': 'Portafolio',
        'planificacion': 'Planificación',
        'financiera': 'Vista Financiera',
        'gobernanza': 'Gobernanza',
        'reportes': 'Reportes',
        'activacion': 'Activación y Aprobación',
        'estrategica': 'Planificación Estratégica',
        'requerimientos': 'Ingreso de Requerimientos',
        'factibilidad': 'Informes de Factibilidad',
        'comite': 'Comité de Expertos',
        'banco': 'Banco de Reserva',
        'plan-anual': 'Plan Anual Digitalización',
        'individual': 'Activación Individual',
        'extraordinario': 'Ingreso Extraordinario',
        'implementacion': 'Implementación',
        'kickoff': 'Planificación / Kick Off',
        'analisis': 'Análisis y Diseño',
        'construccion': 'Construcción',
        'pruebas': 'Pruebas',
        'transicion': 'Transición',
        'golive': 'Go Live y Soporte',
        'seguimiento': 'Seguimiento y Control',
        'presupuestario': 'Control Presupuestario',
        'riesgos': 'Gestión de Riesgos',
        'documental': 'Gestión Documental',
        'metricas': 'Evaluación y Métricas',
        'historia': 'Historia',
        'cierre': 'En Proceso de Cierre',
        'cerrados': 'Proyectos Cerrados',
        'rechazados': 'Rechazados',
        'suspendidos': 'Suspendidos',
        'eliminados': 'Eliminados del Banco',
        'compras': 'Gestión de Compras',
        'solicitudes': 'Solicitudes Sin Contrato',
        'proveedores': 'Evaluación Proveedores',
        'contratos': 'Gestión de Contratos',
        'ordenes': 'Seguimiento de Órdenes',
        'configuracion': 'Configuración',
        'catalogos': 'Catálogos Maestros',
        'usuarios': 'Usuarios y Permisos',
        'flujos': 'Flujos de Trabajo',
        'plantillas': 'Plantillas',
        'integraciones': 'Integraciones'
    };

    let html = '<a href="#" onclick="navigateTo(\'dashboard-ejecutiva\')">Inicio</a>';
    parts.forEach((part, i) => {
        html += ` <i class="fas fa-chevron-right"></i> `;
        if (i === parts.length - 1) {
            html += `<span>${viewNames[part] || part}</span>`;
        } else {
            html += `<a href="#">${viewNames[part] || part}</a>`;
        }
    });

    breadcrumb.innerHTML = html;
}

function initViewData(viewId) {
    switch(viewId) {
        case 'dashboard-ejecutiva':
            renderDashboardStats();
            renderProjectList();
            break;
        case 'activacion-banco':
            renderBancoReserva();
            break;
        case 'implementacion-kanban':
            renderKanbanBoard();
            break;
    }
}

// Render Functions
function renderDashboardStats() {
    const active = SampleData.projects.filter(p => ['en-ejecucion', 'en-revision', 'en-riesgo'].includes(p.status)).length;
    const atRisk = SampleData.projects.filter(p => p.status === 'en-riesgo').length;
    const totalBudget = SampleData.projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = SampleData.projects.reduce((sum, p) => sum + p.spent, 0);

    updateElement('stat-active', active);
    updateElement('stat-risk', atRisk);
    updateElement('stat-budget', formatCurrency(totalBudget));
    updateElement('stat-execution', Math.round(totalSpent / totalBudget * 100) + '%');
}

function renderProjectList() {
    const container = document.getElementById('project-list');
    if (!container) return;

    const html = SampleData.projects.slice(0, 5).map(p => `
        <div class="project-item" onclick="openProjectDetail(${p.id})">
            <div class="priority ${p.priority.toLowerCase()}"></div>
            <div class="info">
                <div class="title">${p.name}</div>
                <div class="meta">${p.type} · ${formatCurrency(p.budget)} · Fase: ${p.phase}</div>
            </div>
            <span class="status ${p.status}">${formatStatus(p.status)}</span>
        </div>
    `).join('');

    container.innerHTML = html;
}

function renderBancoReserva() {
    const container = document.getElementById('banco-table-body');
    if (!container) return;

    const html = SampleData.bancoReserva.map(p => `
        <tr>
            <td><span class="priority ${p.priority.toLowerCase()}"></span></td>
            <td><strong>${p.name}</strong><br><small>${p.area}</small></td>
            <td>${p.priority}</td>
            <td>${p.score}</td>
            <td>${formatCurrency(p.estimatedBudget)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="activateProject(${p.id})">
                    <i class="fas fa-check"></i> Activar
                </button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = html;
}

function renderKanbanBoard() {
    const phases = ['Planificación', 'Análisis', 'Construcción', 'Pruebas', 'Transición', 'Go Live'];

    phases.forEach(phase => {
        const container = document.getElementById(`kanban-${phase.toLowerCase().replace(' ', '-')}`);
        if (!container) return;

        const projects = SampleData.projects.filter(p => p.phase === phase || p.phase.includes(phase));
        const html = projects.map(p => `
            <div class="kanban-card" draggable="true" data-id="${p.id}">
                <div class="priority ${p.priority.toLowerCase()}" style="margin-bottom: 8px;"></div>
                <div class="title">${p.name}</div>
                <div class="meta">${p.owner} · ${p.area}</div>
                <span class="status ${p.status}" style="margin-top: 8px;">${formatStatus(p.status)}</span>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="empty-state"><p>Sin proyectos</p></div>';
    });
}

// Modal Functions
function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) closeModal(modal.id);
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Form Functions
function initForms() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(form);
        });
    });
}

function handleFormSubmit(form) {
    const formId = form.id;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate
    if (!validateForm(form)) {
        showToast('Por favor complete los campos requeridos', 'error');
        return;
    }

    // Process based on form type
    switch(formId) {
        case 'form-requerimiento':
            submitRequerimiento(data);
            break;
        case 'form-factibilidad':
            submitFactibilidad(data);
            break;
        default:
            console.log('Form submitted:', data);
            showToast('Guardado exitosamente', 'success');
    }
}

function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            valid = false;
        } else {
            field.classList.remove('error');
        }
    });
    return valid;
}

// submitRequerimiento se define en la sección de Requerimientos más abajo

function submitFactibilidad(data) {
    console.log('Informe de factibilidad:', data);
    showNotification('Informe guardado exitosamente', 'success');
    closeModal('modal-factibilidad');
}

// Tab Functions
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabGroup = tab.closest('.tabs');
            const tabContainer = tabGroup.closest('.tabs-container') || tabGroup.parentElement;
            const viewContainer = tabGroup.closest('.view') || tabGroup.parentElement.parentElement;
            const targetId = tab.dataset.tab;

            // Update tabs
            tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Find and update content - look in the view container
            const allTabContents = viewContainer.querySelectorAll('.tab-content');
            allTabContents.forEach(c => c.classList.remove('active'));

            const target = document.getElementById(targetId);
            if (target) {
                target.classList.add('active');
            }
        });
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility Functions
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatCurrency(value) {
    return '$' + (value / 1000).toFixed(0) + 'K';
}

function formatStatus(status) {
    const labels = {
        'en-ejecucion': 'En Ejecución',
        'en-revision': 'En Revisión',
        'en-riesgo': 'En Riesgo',
        'pendiente': 'Pendiente',
        'cerrado': 'Cerrado',
        'aprobado': 'Aprobado',
        'rechazado': 'Rechazado'
    };
    return labels[status] || status;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Project Actions
function openProjectDetail(projectId) {
    const project = SampleData.projects.find(p => p.id === projectId);
    if (!project) return;

    // Populate modal header
    document.getElementById('proyecto-code').textContent = project.code;
    document.getElementById('proyecto-titulo').textContent = project.name;
    document.getElementById('proyecto-priority').textContent = project.priority;
    document.getElementById('proyecto-priority').className = `priority ${project.priority}`;
    document.getElementById('proyecto-status').textContent = formatStatus(project.status);
    document.getElementById('proyecto-status').className = `status ${project.status}`;
    document.getElementById('proyecto-type').innerHTML = `<i class="fas fa-tag"></i> ${project.type}`;
    document.getElementById('proyecto-area').innerHTML = `<i class="fas fa-building"></i> ${project.area}`;

    // Calculate progress
    const progress = Math.round((project.spent / project.budget) * 100);
    document.getElementById('proyecto-progress').style.width = `${progress}%`;
    document.getElementById('proyecto-progress-text').textContent = `${progress}%`;

    // Render timeline
    renderProjectTimeline(project);

    // Render phases accordion
    renderFasesAccordion(project);

    // Render project details
    renderProjectDetails(project);

    // Render history
    renderProjectHistory(project);

    // Initialize proyecto tabs
    initProyectoTabs();

    openModal('modal-proyecto');
}

// Project Detail Data
const ProjectPhases = [
    { id: 'planificacion', name: 'Planificación', icon: 'fa-flag', duration: '4 semanas' },
    { id: 'analisis', name: 'Análisis', icon: 'fa-pencil-ruler', duration: '6 semanas' },
    { id: 'construccion', name: 'Construcción', icon: 'fa-hammer', duration: '12 semanas' },
    { id: 'pruebas', name: 'Pruebas', icon: 'fa-vial', duration: '4 semanas' },
    { id: 'transicion', name: 'Transición', icon: 'fa-exchange-alt', duration: '3 semanas' },
    { id: 'golive', name: 'Go Live', icon: 'fa-rocket', duration: '2 semanas' }
];

const ProjectHistory = [
    { id: 1, type: 'cambio', title: 'Cambio de estado', description: 'El proyecto pasó de "En Revisión" a "En Ejecución"', user: 'Luis Tolorzar', date: '02 Feb 2026', time: '10:30', details: 'Se aprobó el avance a la fase de construcción después de validar los entregables de análisis.' },
    { id: 2, type: 'documento', title: 'Documento agregado', description: 'Se subió "Reporte_Avance_Q4_2025.pdf"', user: 'Carlos Méndez', date: '05 Ene 2026', time: '14:20', details: 'Reporte trimestral de avance con el detalle del cumplimiento de hitos y ejecución presupuestaria.' },
    { id: 3, type: 'aprobacion', title: 'Aprobación de presupuesto', description: 'Se aprobó ampliación presupuestaria de $50,000 USD', user: 'Director TI', date: '15 Dic 2025', time: '09:00', details: 'Aprobación de contingencia para cubrir costos adicionales de licenciamiento SAP.' },
    { id: 4, type: 'comentario', title: 'Comentario del PMO', description: 'Revisión de indicadores de avance', user: 'María López', date: '01 Dic 2025', time: '16:45', details: 'Se recomienda acelerar la fase de análisis para no impactar la fecha de go-live. Revisar recursos disponibles.' },
    { id: 5, type: 'cambio', title: 'Inicio fase Construcción', description: 'Se inició oficialmente la fase de Construcción', user: 'Carlos Méndez', date: '15 Nov 2025', time: '08:00', details: 'Kick-off de la fase de construcción con el equipo de desarrollo. Se definieron sprints de 2 semanas.' },
    { id: 6, type: 'documento', title: 'Documento agregado', description: 'Se subió "Arquitectura_Solucion.pdf"', user: 'Pedro Rojas', date: '20 Ago 2025', time: '11:30', details: 'Documento de arquitectura técnica aprobado por el comité de arquitectura.' },
    { id: 7, type: 'aprobacion', title: 'Aprobación Comité Expertos', description: 'Proyecto aprobado por el Comité de Expertos', user: 'Comité', date: '01 Jun 2025', time: '10:00', details: 'Score de evaluación: 92/100. Recomendación: Aprobar con prioridad P1.' }
];

function renderProjectTimeline(project) {
    const container = document.getElementById('proyecto-timeline-container');
    if (!container) return;

    // Determine current phase index based on project.phase
    const phaseNames = ['Planificación', 'Análisis', 'Construcción', 'Pruebas', 'Transición', 'Go Live'];
    let currentPhaseIndex = phaseNames.findIndex(p =>
        project.phase.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(project.phase.toLowerCase())
    );
    if (currentPhaseIndex === -1) currentPhaseIndex = 2; // Default to Construcción

    const html = ProjectPhases.map((phase, index) => {
        let status = 'pending';
        if (index < currentPhaseIndex) status = 'completed';
        else if (index === currentPhaseIndex) status = 'current';

        return `
            <div class="timeline-phase ${status}">
                <div class="phase-icon">
                    <i class="fas ${phase.icon}"></i>
                </div>
                <span class="phase-name">${phase.name}</span>
                <span class="phase-dates">${phase.duration}</span>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function renderFasesAccordion(project) {
    const container = document.getElementById('fases-accordion');
    if (!container) return;

    const phaseNames = ['Planificación', 'Análisis', 'Construcción', 'Pruebas', 'Transición', 'Go Live'];
    let currentPhaseIndex = phaseNames.findIndex(p =>
        project.phase.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(project.phase.toLowerCase())
    );
    if (currentPhaseIndex === -1) currentPhaseIndex = 2;

    const phaseData = [
        { progress: 100, startDate: '01 Jun 2025', endDate: '28 Jun 2025', responsible: 'Carlos Méndez', deliverables: ['Project Charter', 'Plan de Proyecto', 'Kick-off realizado'] },
        { progress: 100, startDate: '01 Jul 2025', endDate: '15 Ago 2025', responsible: 'Roberto Silva', deliverables: ['Documento de Requerimientos', 'Arquitectura de Solución', 'Diagramas AS-IS/TO-BE'] },
        { progress: 65, startDate: '01 Sep 2025', endDate: '30 Nov 2025', responsible: 'Equipo Desarrollo', deliverables: ['Módulo Finanzas (Completado)', 'Módulo Logística (En progreso)', 'Módulo RRHH (Pendiente)'] },
        { progress: 0, startDate: '01 Dic 2025', endDate: '31 Dic 2025', responsible: 'QA Team', deliverables: ['Plan de Pruebas', 'Casos de Prueba', 'Certificación UAT'] },
        { progress: 0, startDate: '01 Ene 2026', endDate: '15 Ene 2026', responsible: 'Carlos Méndez', deliverables: ['Migración de Datos', 'Capacitación Usuarios', 'Documentación'] },
        { progress: 0, startDate: '16 Ene 2026', endDate: '30 Ene 2026', responsible: 'Equipo Soporte', deliverables: ['Go-Live', 'Soporte Post-Implementación', 'Cierre de Proyecto'] }
    ];

    const html = ProjectPhases.map((phase, index) => {
        let status = 'pending';
        let statusIcon = 'fa-clock';
        if (index < currentPhaseIndex) {
            status = 'completed';
            statusIcon = 'fa-check';
        } else if (index === currentPhaseIndex) {
            status = 'current';
            statusIcon = 'fa-play';
        }

        const data = phaseData[index];
        const deliverablesHtml = data.deliverables.map(d => {
            const isPending = d.includes('Pendiente') || d.includes('pendiente');
            return `<div class="deliverable-item ${isPending ? 'pending' : ''}">
                <i class="fas ${isPending ? 'fa-circle' : 'fa-check-circle'}"></i>
                <span>${d}</span>
            </div>`;
        }).join('');

        return `
            <div class="fase-item">
                <div class="fase-header" onclick="toggleFase(this)">
                    <div class="fase-status-icon ${status}">
                        <i class="fas ${statusIcon}"></i>
                    </div>
                    <div class="fase-info">
                        <h4>${phase.name}</h4>
                        <p>${data.startDate} - ${data.endDate}</p>
                    </div>
                    <div class="fase-progress">
                        <div class="fase-progress-bar">
                            <div class="fase-progress-fill" style="width:${data.progress}%;"></div>
                        </div>
                        <div class="fase-progress-text">${data.progress}%</div>
                    </div>
                    <i class="fas fa-chevron-down fase-toggle"></i>
                </div>
                <div class="fase-content">
                    <div class="fase-details">
                        <div class="fase-detail-item">
                            <label>Responsable</label>
                            <span>${data.responsible}</span>
                        </div>
                        <div class="fase-detail-item">
                            <label>Duración</label>
                            <span>${phase.duration}</span>
                        </div>
                        <div class="fase-detail-item">
                            <label>Fecha Inicio</label>
                            <span>${data.startDate}</span>
                        </div>
                        <div class="fase-detail-item">
                            <label>Fecha Fin</label>
                            <span>${data.endDate}</span>
                        </div>
                    </div>
                    <div class="fase-deliverables">
                        <h5><i class="fas fa-tasks"></i> Entregables</h5>
                        ${deliverablesHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function toggleFase(header) {
    const content = header.nextElementSibling;
    const isExpanded = header.classList.contains('expanded');

    // Close all
    document.querySelectorAll('.fase-header').forEach(h => h.classList.remove('expanded'));
    document.querySelectorAll('.fase-content').forEach(c => c.classList.remove('show'));

    // Toggle current
    if (!isExpanded) {
        header.classList.add('expanded');
        content.classList.add('show');
    }
}

function renderProjectDetails(project) {
    // Update detail fields
    document.getElementById('det-codigo').textContent = project.code;
    document.getElementById('det-nombre').textContent = project.name;
    document.getElementById('det-pm').textContent = project.owner;
    document.getElementById('det-area').textContent = project.area;
    document.getElementById('det-clasificacion').textContent = project.type;
    document.getElementById('det-presupuesto').textContent = `$${project.budget.toLocaleString()} USD`;
    document.getElementById('det-ejecutado').textContent = `$${project.spent.toLocaleString()} USD (${Math.round(project.spent/project.budget*100)}%)`;
    document.getElementById('det-fecha-inicio').textContent = formatDate(project.startDate);
    document.getElementById('det-fecha-fin').textContent = formatDate(project.endDate);

    // Calculate duration
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
    document.getElementById('det-duracion').textContent = `${months} meses`;

    // Days remaining
    const today = new Date();
    const daysRemaining = Math.round((end - today) / (1000 * 60 * 60 * 24));
    document.getElementById('det-dias-restantes').textContent = `${daysRemaining} días`;
}

function renderProjectHistory(project) {
    const container = document.getElementById('historial-accordion');
    if (!container) return;

    const html = ProjectHistory.map(item => `
        <div class="historial-item" onclick="toggleHistorial(this)">
            <div class="historial-header-row">
                <div class="historial-icon ${item.type}">
                    <i class="fas ${getHistorialIcon(item.type)}"></i>
                </div>
                <div class="historial-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
                <div class="historial-date">
                    <strong>${item.date}</strong>
                    ${item.time} · ${item.user}
                </div>
            </div>
            <div class="historial-content">
                <p>${item.details}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function getHistorialIcon(type) {
    const icons = {
        'cambio': 'fa-exchange-alt',
        'documento': 'fa-file-alt',
        'aprobacion': 'fa-check-circle',
        'comentario': 'fa-comment'
    };
    return icons[type] || 'fa-info-circle';
}

function toggleHistorial(item) {
    item.classList.toggle('expanded');
}

function initProyectoTabs() {
    document.querySelectorAll('.proyecto-tab').forEach(tab => {
        tab.onclick = () => {
            const tabId = tab.dataset.tab;

            // Update tabs
            document.querySelectorAll('.proyecto-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content
            document.querySelectorAll('.proyecto-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tabId)?.classList.add('active');
        };
    });
}

function toggleCategoria(header) {
    const content = header.nextElementSibling;
    const isExpanded = header.classList.contains('expanded');

    header.classList.toggle('expanded');
    content.classList.toggle('show');
}

function agregarAdjunto() {
    showToast('Función de carga de documentos disponible próximamente', 'info');
}

function editarProyecto() {
    showToast('Abriendo editor de proyecto...', 'info');
}

function activateProject(projectId) {
    showToast('Proyecto activado y movido al Plan Anual', 'success');
}

function openNewRequerimiento() {
    openModal('modal-requerimiento');
}

function exportData(format) {
    showToast(`Exportando datos en formato ${format.toUpperCase()}...`, 'success');
}

// Quick Actions
function quickAction(action) {
    switch(action) {
        case 'new-initiative':
            openModal('modal-requerimiento');
            break;
        case 'new-factibilidad':
            navigateTo('activacion-factibilidad');
            break;
        case 'comite':
            navigateTo('activacion-comite');
            break;
        case 'schedule':
            showToast('Abriendo calendario de sesiones...', 'success');
            break;
        case 'reports':
            navigateTo('dashboard-reportes');
            break;
        case 'alerts':
            showToast('Mostrando alertas pendientes', 'success');
            break;
        default:
            showToast(`Acción: ${action}`, 'success');
    }
}

// Filters
function applyFilters() {
    const status = document.getElementById('filter-status')?.value;
    const priority = document.getElementById('filter-priority')?.value;
    const area = document.getElementById('filter-area')?.value;

    AppState.filters = { status, priority, area };
    renderProjectList();
    showToast('Filtros aplicados', 'success');
}

function clearFilters() {
    document.querySelectorAll('.filter-group select').forEach(s => s.value = '');
    AppState.filters = {};
    renderProjectList();
    showToast('Filtros limpiados', 'success');
}

// Search
function globalSearch(query) {
    if (query.length < 2) return;

    const results = SampleData.projects.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.code.toLowerCase().includes(query.toLowerCase())
    );

    console.log('Search results:', results);
    // Show search results dropdown
}

// Initialize on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        document.getElementById('sidebar')?.classList.remove('mobile-open');
    }
});

// ==================== GESTIÓN DE USUARIOS Y ROLES ====================

// Datos de Usuarios
const UsersData = [
    { id: 1, username: 'ltolorzar', firstName: 'Luis', lastName: 'Tolorzar', email: 'ltolorzar@cge.cl', role: 'admin', area: 'PMO', phone: '+56 9 1234 5678', status: 'activo', lastAccess: '2026-02-02 10:30', permisos: ['aprobar_proyectos', 'ver_costos', 'exportar_datos', 'notificaciones_email'] },
    { id: 2, username: 'cmendez', firstName: 'Carlos', lastName: 'Méndez', email: 'cmendez@cge.cl', role: 'pm', area: 'TI', phone: '+56 9 2345 6789', status: 'activo', lastAccess: '2026-02-02 09:15', permisos: ['ver_costos', 'notificaciones_email'] },
    { id: 3, username: 'agarcia', firstName: 'Ana', lastName: 'García', email: 'agarcia@cge.cl', role: 'pm', area: 'Comercial', phone: '+56 9 3456 7890', status: 'activo', lastAccess: '2026-02-01 16:45', permisos: ['notificaciones_email'] },
    { id: 4, username: 'rsilva', firstName: 'Roberto', lastName: 'Silva', email: 'rsilva@cge.cl', role: 'analista', area: 'Seguridad', phone: '+56 9 4567 8901', status: 'activo', lastAccess: '2026-02-02 08:00', permisos: ['ver_costos'] },
    { id: 5, username: 'mlopez', firstName: 'María', lastName: 'López', email: 'mlopez@cge.cl', role: 'pmo', area: 'Digital', phone: '+56 9 5678 9012', status: 'activo', lastAccess: '2026-01-31 14:30', permisos: ['aprobar_proyectos', 'ver_costos', 'exportar_datos'] },
    { id: 6, username: 'projvas', firstName: 'Pedro', lastName: 'Rojas', email: 'projvas@cge.cl', role: 'usuario', area: 'Infraestructura', phone: '+56 9 6789 0123', status: 'activo', lastAccess: '2026-02-01 11:20', permisos: [] },
    { id: 7, username: 'viewer1', firstName: 'Juan', lastName: 'Pérez', email: 'jperez@cge.cl', role: 'viewer', area: 'Finanzas', phone: '+56 9 7890 1234', status: 'activo', lastAccess: '2026-01-30 09:00', permisos: [] },
    { id: 8, username: 'ltorres', firstName: 'Luis', lastName: 'Torres', email: 'ltorres@cge.cl', role: 'pm', area: 'Operaciones', phone: '+56 9 8901 2345', status: 'inactivo', lastAccess: '2026-01-15 10:00', permisos: ['notificaciones_email'] }
];

// Datos de Roles predefinidos
const RolesData = [
    {
        id: 'admin',
        name: 'Administrador',
        description: 'Acceso completo al sistema. Puede gestionar usuarios, roles y todas las configuraciones.',
        icon: 'fa-crown',
        color: '#dc2626',
        type: 'predefinido',
        usersCount: 1
    },
    {
        id: 'pmo',
        name: 'PMO Manager',
        description: 'Gestión del portafolio de proyectos. Acceso a dashboards ejecutivos y aprobaciones.',
        icon: 'fa-briefcase',
        color: '#2563eb',
        type: 'predefinido',
        usersCount: 1
    },
    {
        id: 'pm',
        name: 'Project Manager',
        description: 'Gestión de proyectos asignados. Seguimiento, control y reportes de sus proyectos.',
        icon: 'fa-tasks',
        color: '#059669',
        type: 'predefinido',
        usersCount: 3
    },
    {
        id: 'analista',
        name: 'Analista',
        description: 'Análisis de datos y generación de reportes. Acceso de lectura a métricas y KPIs.',
        icon: 'fa-chart-line',
        color: '#d97706',
        type: 'predefinido',
        usersCount: 1
    },
    {
        id: 'usuario',
        name: 'Usuario Estándar',
        description: 'Acceso básico para ingresar requerimientos y consultar estado de iniciativas.',
        icon: 'fa-user',
        color: '#64748b',
        type: 'predefinido',
        usersCount: 1
    },
    {
        id: 'viewer',
        name: 'Visualizador',
        description: 'Solo lectura. Puede ver dashboards y reportes sin capacidad de edición.',
        icon: 'fa-eye',
        color: '#7c3aed',
        type: 'predefinido',
        usersCount: 1
    }
];

// Estructura de Permisos del Sistema
const PermisosEstructura = [
    {
        modulo: 'Dashboard',
        icon: 'fa-tachometer-alt',
        funcionalidades: [
            { id: 'dashboard_vista_ejecutiva', name: 'Vista Ejecutiva', icon: 'fa-chart-pie' },
            { id: 'dashboard_portafolio', name: 'Portafolio de Proyectos', icon: 'fa-folder-open' },
            { id: 'dashboard_planificacion', name: 'Planificación Anual', icon: 'fa-calendar-alt' },
            { id: 'dashboard_financiera', name: 'Vista Financiera', icon: 'fa-dollar-sign' },
            { id: 'dashboard_gobernanza', name: 'Gobernanza', icon: 'fa-balance-scale' },
            { id: 'dashboard_reportes', name: 'Reportes', icon: 'fa-file-alt' }
        ]
    },
    {
        modulo: 'Activación y Aprobación',
        icon: 'fa-rocket',
        funcionalidades: [
            { id: 'activacion_estrategica', name: 'Planificación Estratégica', icon: 'fa-chess' },
            { id: 'activacion_requerimientos', name: 'Ingreso de Requerimientos', icon: 'fa-inbox' },
            { id: 'activacion_factibilidad', name: 'Informes de Factibilidad', icon: 'fa-file-signature' },
            { id: 'activacion_comite', name: 'Comité de Expertos', icon: 'fa-users' },
            { id: 'activacion_banco', name: 'Banco de Reserva', icon: 'fa-piggy-bank' },
            { id: 'activacion_plan_anual', name: 'Plan Anual Digitalización', icon: 'fa-list-check' },
            { id: 'activacion_individual', name: 'Activación Individual', icon: 'fa-user-check' },
            { id: 'activacion_extraordinario', name: 'Ingreso Extraordinario', icon: 'fa-exclamation-circle' }
        ]
    },
    {
        modulo: 'Implementación',
        icon: 'fa-cogs',
        funcionalidades: [
            { id: 'impl_kickoff', name: 'Planificación / Kick Off', icon: 'fa-flag' },
            { id: 'impl_analisis', name: 'Análisis y Diseño', icon: 'fa-pencil-ruler' },
            { id: 'impl_construccion', name: 'Construcción', icon: 'fa-hammer' },
            { id: 'impl_pruebas', name: 'Pruebas', icon: 'fa-vial' },
            { id: 'impl_transicion', name: 'Transición', icon: 'fa-exchange-alt' },
            { id: 'impl_golive', name: 'Go Live y Soporte', icon: 'fa-rocket' }
        ]
    },
    {
        modulo: 'Seguimiento y Control',
        icon: 'fa-eye',
        funcionalidades: [
            { id: 'seguimiento_presupuesto', name: 'Control Presupuestario', icon: 'fa-coins' },
            { id: 'seguimiento_planificacion', name: 'Control de Planificación', icon: 'fa-calendar-check' },
            { id: 'seguimiento_riesgos', name: 'Gestión de Riesgos', icon: 'fa-exclamation-triangle' },
            { id: 'seguimiento_gobernanza', name: 'Control de Gobernanza', icon: 'fa-gavel' },
            { id: 'seguimiento_documental', name: 'Gestión Documental', icon: 'fa-folder' },
            { id: 'seguimiento_metricas', name: 'Evaluación y Métricas', icon: 'fa-chart-bar' }
        ]
    },
    {
        modulo: 'Historia',
        icon: 'fa-history',
        funcionalidades: [
            { id: 'historia_cierre', name: 'En Proceso de Cierre', icon: 'fa-hourglass-half' },
            { id: 'historia_cerrados', name: 'Proyectos Cerrados', icon: 'fa-check-circle' },
            { id: 'historia_rechazados', name: 'Rechazados', icon: 'fa-times-circle' },
            { id: 'historia_suspendidos', name: 'Suspendidos', icon: 'fa-pause-circle' },
            { id: 'historia_eliminados', name: 'Eliminados del Banco', icon: 'fa-trash' }
        ]
    },
    {
        modulo: 'Gestión de Compras',
        icon: 'fa-shopping-cart',
        funcionalidades: [
            { id: 'compras_solicitudes', name: 'Solicitudes Sin Contrato Marco', icon: 'fa-file-invoice' },
            { id: 'compras_proveedores', name: 'Evaluación de Proveedores', icon: 'fa-building' },
            { id: 'compras_contratos', name: 'Gestión de Contratos', icon: 'fa-file-contract' },
            { id: 'compras_ordenes', name: 'Seguimiento de Órdenes', icon: 'fa-truck' }
        ]
    },
    {
        modulo: 'Configuración',
        icon: 'fa-cog',
        funcionalidades: [
            { id: 'config_catalogos', name: 'Catálogos Maestros', icon: 'fa-database' },
            { id: 'config_usuarios', name: 'Usuarios y Permisos', icon: 'fa-user-cog' },
            { id: 'config_flujos', name: 'Flujos de Trabajo', icon: 'fa-project-diagram' },
            { id: 'config_plantillas', name: 'Plantillas', icon: 'fa-file-word' },
            { id: 'config_integraciones', name: 'Integraciones', icon: 'fa-plug' }
        ]
    }
];

// Matriz de Permisos por Rol (full = completo, read = solo lectura, none = sin acceso)
const MatrizPermisos = {
    admin: {}, // Se llena con 'full' para todo
    pmo: {},
    pm: {},
    analista: {},
    usuario: {},
    viewer: {}
};

// Inicializar permisos por defecto
function initPermisosDefault() {
    // Admin: acceso total
    PermisosEstructura.forEach(modulo => {
        modulo.funcionalidades.forEach(func => {
            MatrizPermisos.admin[func.id] = 'full';
        });
    });

    // PMO Manager: acceso casi total excepto configuración de usuarios
    PermisosEstructura.forEach(modulo => {
        modulo.funcionalidades.forEach(func => {
            if (func.id === 'config_usuarios' || func.id === 'config_integraciones') {
                MatrizPermisos.pmo[func.id] = 'read';
            } else {
                MatrizPermisos.pmo[func.id] = 'full';
            }
        });
    });

    // Project Manager: gestión de proyectos, sin config ni compras avanzadas
    PermisosEstructura.forEach(modulo => {
        modulo.funcionalidades.forEach(func => {
            if (modulo.modulo === 'Configuración') {
                MatrizPermisos.pm[func.id] = 'none';
            } else if (modulo.modulo === 'Gestión de Compras' && func.id !== 'compras_solicitudes') {
                MatrizPermisos.pm[func.id] = 'read';
            } else if (func.id.includes('dashboard_financiera') || func.id.includes('dashboard_gobernanza')) {
                MatrizPermisos.pm[func.id] = 'read';
            } else {
                MatrizPermisos.pm[func.id] = 'full';
            }
        });
    });

    // Analista: principalmente lectura y reportes
    PermisosEstructura.forEach(modulo => {
        modulo.funcionalidades.forEach(func => {
            if (modulo.modulo === 'Configuración') {
                MatrizPermisos.analista[func.id] = 'none';
            } else if (func.id.includes('dashboard') || func.id.includes('seguimiento') || func.id.includes('historia')) {
                MatrizPermisos.analista[func.id] = 'full';
            } else {
                MatrizPermisos.analista[func.id] = 'read';
            }
        });
    });

    // Usuario Estándar: acceso básico
    PermisosEstructura.forEach(modulo => {
        modulo.funcionalidades.forEach(func => {
            if (func.id === 'activacion_requerimientos') {
                MatrizPermisos.usuario[func.id] = 'full';
            } else if (func.id.includes('dashboard_ejecutiva') || func.id.includes('dashboard_portafolio')) {
                MatrizPermisos.usuario[func.id] = 'read';
            } else if (modulo.modulo === 'Configuración' || modulo.modulo === 'Gestión de Compras') {
                MatrizPermisos.usuario[func.id] = 'none';
            } else {
                MatrizPermisos.usuario[func.id] = 'read';
            }
        });
    });

    // Visualizador: solo lectura en dashboards y reportes
    PermisosEstructura.forEach(modulo => {
        modulo.funcionalidades.forEach(func => {
            if (func.id.includes('dashboard') || func.id.includes('historia_cerrados')) {
                MatrizPermisos.viewer[func.id] = 'read';
            } else {
                MatrizPermisos.viewer[func.id] = 'none';
            }
        });
    });
}

// Inicializar permisos al cargar
initPermisosDefault();

// Renderizar lista de usuarios
function renderUsuarios() {
    const container = document.getElementById('listaUsuarios');
    if (!container) return;

    const filterText = document.getElementById('filterUsuarios')?.value?.toLowerCase() || '';
    const filterRol = document.getElementById('filterRolUsuario')?.value || '';

    let usuarios = UsersData;

    if (filterText) {
        usuarios = usuarios.filter(u =>
            u.username.toLowerCase().includes(filterText) ||
            u.firstName.toLowerCase().includes(filterText) ||
            u.lastName.toLowerCase().includes(filterText) ||
            u.email.toLowerCase().includes(filterText)
        );
    }

    if (filterRol) {
        usuarios = usuarios.filter(u => u.role === filterRol);
    }

    const html = usuarios.map(u => {
        const rol = RolesData.find(r => r.id === u.role);
        const statusClass = u.status === 'activo' ? 'en-ejecucion' : u.status === 'inactivo' ? 'pendiente' : 'en-riesgo';
        const statusLabel = u.status.charAt(0).toUpperCase() + u.status.slice(1);

        return `
            <tr>
                <td><strong>${u.username}</strong></td>
                <td>${u.firstName} ${u.lastName}</td>
                <td><a href="mailto:${u.email}">${u.email}</a></td>
                <td>
                    <span class="role-badge" style="background:${rol?.color}15;color:${rol?.color};">
                        <i class="fas ${rol?.icon}"></i> ${rol?.name || u.role}
                    </span>
                </td>
                <td>${u.area}</td>
                <td><small>${u.lastAccess}</small></td>
                <td><span class="status ${statusClass}">${statusLabel}</span></td>
                <td>
                    <div class="user-actions">
                        <button class="btn btn-sm btn-icon btn-secondary" onclick="editarUsuario(${u.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-secondary" onclick="verPermisosUsuario(${u.id})" title="Ver permisos">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-danger" onclick="confirmarEliminarUsuario(${u.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = html || '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--gray-500);">No se encontraron usuarios</td></tr>';
}

// Renderizar grid de roles
function renderRoles() {
    const container = document.getElementById('rolesGrid');
    if (!container) return;

    const html = RolesData.map(rol => {
        const usersInRole = UsersData.filter(u => u.role === rol.id).length;
        const permisosCount = Object.values(MatrizPermisos[rol.id] || {}).filter(p => p !== 'none').length;

        return `
            <div class="role-card ${rol.type}">
                <div class="role-card-header">
                    <div class="role-icon" style="background:${rol.color};">
                        <i class="fas ${rol.icon}"></i>
                    </div>
                    <div class="role-info">
                        <h3>${rol.name}</h3>
                        <p>${rol.description}</p>
                    </div>
                </div>
                <div class="role-card-body">
                    <div class="role-stats">
                        <div class="role-stat">
                            <div class="number">${usersInRole}</div>
                            <div class="label">Usuarios</div>
                        </div>
                        <div class="role-stat">
                            <div class="number">${permisosCount}</div>
                            <div class="label">Permisos</div>
                        </div>
                    </div>
                </div>
                <div class="role-card-footer">
                    <span class="role-badge ${rol.type}">${rol.type === 'predefinido' ? 'Predefinido' : 'Personalizado'}</span>
                    <button class="btn btn-sm btn-secondary" onclick="verPermisosRol('${rol.id}')">
                        <i class="fas fa-key"></i> Permisos
                    </button>
                    ${rol.type !== 'predefinido' ? `
                        <button class="btn btn-sm btn-secondary" onclick="editarRol('${rol.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Renderizar matriz de permisos
function renderMatrizPermisos() {
    const container = document.getElementById('matrizBody');
    if (!container) return;

    let html = '';
    const roles = ['admin', 'pmo', 'pm', 'analista', 'usuario', 'viewer'];

    PermisosEstructura.forEach(modulo => {
        // Fila del módulo
        html += `
            <tr class="modulo-row">
                <td colspan="7"><i class="fas ${modulo.icon}"></i> ${modulo.modulo}</td>
            </tr>
        `;

        // Filas de funcionalidades
        modulo.funcionalidades.forEach(func => {
            html += `
                <tr>
                    <td class="funcionalidad-cell"><i class="fas ${func.icon}"></i> ${func.name}</td>
                    ${roles.map(rol => {
                        const permiso = MatrizPermisos[rol]?.[func.id] || 'none';
                        return `
                            <td>
                                <select class="permiso-select ${permiso}"
                                        data-rol="${rol}"
                                        data-func="${func.id}"
                                        onchange="cambiarPermiso(this)"
                                        ${rol === 'admin' ? 'disabled' : ''}>
                                    <option value="full" ${permiso === 'full' ? 'selected' : ''}>Completo</option>
                                    <option value="read" ${permiso === 'read' ? 'selected' : ''}>Lectura</option>
                                    <option value="none" ${permiso === 'none' ? 'selected' : ''}>Sin acceso</option>
                                </select>
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
        });
    });

    container.innerHTML = html;
}

// Cambiar permiso en la matriz
function cambiarPermiso(select) {
    const rol = select.dataset.rol;
    const func = select.dataset.func;
    const valor = select.value;

    MatrizPermisos[rol][func] = valor;

    // Actualizar clase visual
    select.className = `permiso-select ${valor}`;
}

// Guardar cambios de la matriz
function guardarMatrizPermisos() {
    // Aquí se enviaría al servidor
    console.log('Matriz de permisos actualizada:', MatrizPermisos);
    showToast('Matriz de permisos guardada exitosamente', 'success');
}

// Exportar matriz
function exportarMatriz() {
    showToast('Exportando matriz de permisos a Excel...', 'info');
    // Implementar exportación real
}

// Editar usuario
function editarUsuario(userId) {
    const user = UsersData.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('modal-usuario-titulo').textContent = 'Editar Usuario';
    document.getElementById('userId').value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('firstName').value = user.firstName;
    document.getElementById('lastName').value = user.lastName;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userArea').value = user.area;
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userStatus').value = user.status;

    // Marcar permisos adicionales
    document.querySelectorAll('input[name="permisos"]').forEach(cb => {
        cb.checked = user.permisos?.includes(cb.value) || false;
    });

    openModal('modal-usuario');
}

// Guardar usuario
function guardarUsuario() {
    const form = document.getElementById('form-usuario');
    if (!validateForm(form)) {
        showToast('Por favor complete los campos requeridos', 'error');
        return;
    }

    const userId = document.getElementById('userId').value;
    const userData = {
        id: userId ? parseInt(userId) : UsersData.length + 1,
        username: document.getElementById('username').value,
        email: document.getElementById('userEmail').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        role: document.getElementById('userRole').value,
        area: document.getElementById('userArea').value,
        phone: document.getElementById('userPhone').value,
        status: document.getElementById('userStatus').value,
        lastAccess: new Date().toISOString().slice(0, 16).replace('T', ' '),
        permisos: [...document.querySelectorAll('input[name="permisos"]:checked')].map(cb => cb.value)
    };

    if (userId) {
        // Actualizar existente
        const index = UsersData.findIndex(u => u.id === parseInt(userId));
        if (index !== -1) {
            UsersData[index] = { ...UsersData[index], ...userData };
        }
        showToast('Usuario actualizado exitosamente', 'success');
    } else {
        // Crear nuevo
        UsersData.push(userData);
        showToast('Usuario creado exitosamente', 'success');
    }

    closeModal('modal-usuario');
    renderUsuarios();
    form.reset();
    document.getElementById('modal-usuario-titulo').textContent = 'Nuevo Usuario';
}

// Ver permisos de usuario
function verPermisosUsuario(userId) {
    const user = UsersData.find(u => u.id === userId);
    if (!user) return;

    const rol = RolesData.find(r => r.id === user.role);
    showToast(`${user.firstName} ${user.lastName} tiene rol: ${rol?.name}`, 'info');
}

// Confirmar eliminar usuario
function confirmarEliminarUsuario(userId) {
    const user = UsersData.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`¿Está seguro de eliminar al usuario ${user.firstName} ${user.lastName}?`)) {
        const index = UsersData.findIndex(u => u.id === userId);
        if (index !== -1) {
            UsersData.splice(index, 1);
            showToast('Usuario eliminado', 'success');
            renderUsuarios();
        }
    }
}

// Ver permisos del rol
function verPermisosRol(rolId) {
    const rol = RolesData.find(r => r.id === rolId);
    if (!rol) return;

    document.getElementById('nombre-rol-permisos').textContent = rol.name;

    const container = document.getElementById('permisosEditor');
    let html = '';

    PermisosEstructura.forEach(modulo => {
        html += `
            <div class="permiso-modulo">
                <div class="permiso-modulo-header">
                    <span><i class="fas ${modulo.icon}"></i> ${modulo.modulo}</span>
                    <button class="toggle-all" onclick="toggleModuloPermisos('${rolId}', '${modulo.modulo}')">
                        Alternar todo
                    </button>
                </div>
                <div class="permiso-items">
                    ${modulo.funcionalidades.map(func => {
                        const permiso = MatrizPermisos[rolId]?.[func.id] || 'none';
                        return `
                            <div class="permiso-item">
                                <div class="permiso-item-name">
                                    <i class="fas ${func.icon}"></i>
                                    ${func.name}
                                </div>
                                <select class="permiso-select ${permiso}"
                                        data-rol="${rolId}"
                                        data-func="${func.id}"
                                        onchange="cambiarPermiso(this)"
                                        ${rolId === 'admin' ? 'disabled' : ''}>
                                    <option value="full" ${permiso === 'full' ? 'selected' : ''}>Completo</option>
                                    <option value="read" ${permiso === 'read' ? 'selected' : ''}>Solo Lectura</option>
                                    <option value="none" ${permiso === 'none' ? 'selected' : ''}>Sin Acceso</option>
                                </select>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    openModal('modal-permisos-rol');
}

// Alternar permisos de un módulo completo
function toggleModuloPermisos(rolId, moduloName) {
    const modulo = PermisosEstructura.find(m => m.modulo === moduloName);
    if (!modulo || rolId === 'admin') return;

    // Determinar el estado actual (si todos son 'full', cambiar a 'none', y viceversa)
    const allFull = modulo.funcionalidades.every(f => MatrizPermisos[rolId][f.id] === 'full');
    const newValue = allFull ? 'none' : 'full';

    modulo.funcionalidades.forEach(func => {
        MatrizPermisos[rolId][func.id] = newValue;
    });

    // Actualizar la UI
    verPermisosRol(rolId);
}

// Guardar permisos del rol
function guardarPermisosRol() {
    console.log('Permisos actualizados:', MatrizPermisos);
    showToast('Permisos del rol guardados exitosamente', 'success');
    closeModal('modal-permisos-rol');
    renderMatrizPermisos();
}

// Guardar rol
function guardarRol() {
    const form = document.getElementById('form-rol');
    if (!validateForm(form)) {
        showToast('Por favor complete los campos requeridos', 'error');
        return;
    }

    const rolId = document.getElementById('rolId').value;
    const rolData = {
        id: document.getElementById('rolCode').value,
        name: document.getElementById('rolName').value,
        description: document.getElementById('rolDescription').value,
        color: document.querySelector('input[name="rolColor"]:checked')?.value || '#2563eb',
        icon: document.querySelector('input[name="rolIcon"]:checked')?.value || 'fa-user-shield',
        type: document.getElementById('rolType').value,
        usersCount: 0
    };

    if (rolId) {
        // Actualizar existente
        const index = RolesData.findIndex(r => r.id === rolId);
        if (index !== -1) {
            RolesData[index] = { ...RolesData[index], ...rolData };
        }
        showToast('Rol actualizado exitosamente', 'success');
    } else {
        // Crear nuevo
        RolesData.push(rolData);
        // Inicializar permisos del nuevo rol
        MatrizPermisos[rolData.id] = {};
        PermisosEstructura.forEach(modulo => {
            modulo.funcionalidades.forEach(func => {
                MatrizPermisos[rolData.id][func.id] = 'none';
            });
        });
        showToast('Rol creado exitosamente', 'success');
    }

    closeModal('modal-rol');
    renderRoles();
    renderMatrizPermisos();
    form.reset();
}

// Editar rol
function editarRol(rolId) {
    const rol = RolesData.find(r => r.id === rolId);
    if (!rol || rol.type === 'predefinido') {
        showToast('No se pueden editar roles predefinidos', 'error');
        return;
    }

    document.getElementById('modal-rol-titulo').textContent = 'Editar Rol';
    document.getElementById('rolId').value = rol.id;
    document.getElementById('rolCode').value = rol.id;
    document.getElementById('rolName').value = rol.name;
    document.getElementById('rolDescription').value = rol.description;
    document.getElementById('rolType').value = rol.type;

    // Seleccionar color
    document.querySelectorAll('input[name="rolColor"]').forEach(radio => {
        radio.checked = radio.value === rol.color;
    });

    // Seleccionar icono
    document.querySelectorAll('input[name="rolIcon"]').forEach(radio => {
        radio.checked = radio.value === rol.icon;
    });

    openModal('modal-rol');
}

// Inicializar filtros de usuarios
function initUserFilters() {
    const filterInput = document.getElementById('filterUsuarios');
    const filterSelect = document.getElementById('filterRolUsuario');

    if (filterInput) {
        filterInput.addEventListener('input', renderUsuarios);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', renderUsuarios);
    }
}

// Extender initViewData para cargar datos de usuarios/roles
const originalInitViewData = initViewData;
initViewData = function(viewId) {
    originalInitViewData(viewId);

    if (viewId === 'config-usuarios') {
        renderUsuarios();
        renderRoles();
        renderMatrizPermisos();
        initUserFilters();
    }

    if (viewId === 'activacion-requerimientos') {
        renderRequerimientos();
        updateRequerimientosKPIs();
        initRequerimientosFilters();
    }
};

/* ========================================
   Requerimientos - Datos y Funciones
   ======================================== */

// Datos de ejemplo de requerimientos
const RequerimientosData = [
    {
        id: 1,
        codigo: 'REQ-2026-001',
        nombre: 'Sistema de Gestión Documental',
        area: 'Administración',
        solicitante: 'María López',
        fechaSolicitud: '2026-01-15',
        prioridad: 'P2',
        estado: 'en-proceso',
        tipo: 'Nuevo Sistema',
        presupuestoEstimado: 120000,
        descripcion: 'Implementación de un sistema de gestión documental corporativo',
        score: 85
    },
    {
        id: 2,
        codigo: 'REQ-2026-002',
        nombre: 'Integración SCADA-ERP',
        area: 'Operaciones',
        solicitante: 'Carlos Méndez',
        fechaSolicitud: '2026-01-18',
        prioridad: 'P1',
        estado: 'aprobado',
        tipo: 'Integración',
        presupuestoEstimado: 350000,
        descripcion: 'Integración de sistemas SCADA con el ERP corporativo',
        score: 92
    },
    {
        id: 3,
        codigo: 'REQ-2026-003',
        nombre: 'App Móvil Técnicos',
        area: 'Operaciones',
        solicitante: 'Pedro Rojas',
        fechaSolicitud: '2026-01-20',
        prioridad: 'P3',
        estado: 'pendiente',
        tipo: 'Nuevo Desarrollo',
        presupuestoEstimado: 95000,
        descripcion: 'Aplicación móvil para técnicos en terreno',
        score: 78
    },
    {
        id: 4,
        codigo: 'REQ-2026-004',
        nombre: 'Dashboard Operacional',
        area: 'TI',
        solicitante: 'Ana García',
        fechaSolicitud: '2026-01-22',
        prioridad: 'P2',
        estado: 'revision',
        tipo: 'Business Intelligence',
        presupuestoEstimado: 150000,
        descripcion: 'Dashboard de indicadores operacionales en tiempo real',
        score: 88
    },
    {
        id: 5,
        codigo: 'REQ-2026-005',
        nombre: 'Plataforma E-Learning',
        area: 'RRHH',
        solicitante: 'Luis Torres',
        fechaSolicitud: '2026-01-25',
        prioridad: 'P4',
        estado: 'pendiente',
        tipo: 'Nuevo Sistema',
        presupuestoEstimado: 80000,
        descripcion: 'Plataforma de capacitación en línea para empleados',
        score: 72
    },
    {
        id: 6,
        codigo: 'REQ-2026-006',
        nombre: 'Automatización Facturación',
        area: 'Finanzas',
        solicitante: 'Roberto Silva',
        fechaSolicitud: '2026-01-28',
        prioridad: 'P1',
        estado: 'en-proceso',
        tipo: 'Automatización',
        presupuestoEstimado: 200000,
        descripcion: 'Automatización del proceso de facturación electrónica',
        score: 90
    }
];

// Estado del wizard
let wizardCurrentStep = 1;
const wizardTotalSteps = 4;

// Inicializar wizard de requerimiento
function initWizard() {
    wizardCurrentStep = 1;
    updateWizardUI();
}

// Actualizar UI del wizard
function updateWizardUI() {
    // Actualizar indicadores de pasos
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNum < wizardCurrentStep) {
            step.classList.add('completed');
        } else if (stepNum === wizardCurrentStep) {
            step.classList.add('active');
        }
    });

    // Mostrar/ocultar contenido
    document.querySelectorAll('.wizard-content').forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === wizardCurrentStep) {
            content.classList.add('active');
        }
    });

    // Actualizar botones de navegación
    const prevBtn = document.getElementById('wizard-prev');
    const nextBtn = document.getElementById('wizard-next');
    const submitBtn = document.getElementById('wizard-submit');

    if (prevBtn) {
        prevBtn.style.display = wizardCurrentStep === 1 ? 'none' : 'inline-flex';
    }

    if (nextBtn) {
        nextBtn.style.display = wizardCurrentStep === wizardTotalSteps ? 'none' : 'inline-flex';
    }

    if (submitBtn) {
        submitBtn.style.display = wizardCurrentStep === wizardTotalSteps ? 'inline-flex' : 'none';
    }

    // Si es el último paso, preparar resumen
    if (wizardCurrentStep === wizardTotalSteps) {
        prepareWizardSummary();
    }
}

// Siguiente paso del wizard
function wizardNext() {
    if (wizardCurrentStep < wizardTotalSteps) {
        // Validar paso actual
        if (validateWizardStep(wizardCurrentStep)) {
            wizardCurrentStep++;
            updateWizardUI();
        }
    }
}

// Paso anterior del wizard
function wizardPrev() {
    if (wizardCurrentStep > 1) {
        wizardCurrentStep--;
        updateWizardUI();
    }
}

// Validar paso del wizard
function validateWizardStep(step) {
    const stepContent = document.getElementById(`wizard-step-${step}`);
    if (!stepContent) return true;

    const requiredFields = stepContent.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            valid = false;
        } else {
            field.classList.remove('error');
        }
    });

    if (!valid) {
        showNotification('Por favor complete todos los campos requeridos', 'warning');
    }

    return valid;
}

// Preparar resumen del wizard
function prepareWizardSummary() {
    const summaryContainer = document.getElementById('resumen-requerimiento');
    if (!summaryContainer) return;

    const formData = getWizardFormData();

    // Mapear valores de clasificación
    const clasificacionLabels = {
        'capex_intangible': 'CAPEX Intangible',
        'capex_tangible': 'CAPEX Tangible',
        'opex': 'OPEX',
        'niif16': 'NIIF 16'
    };

    // Mapear tipos
    const tipoLabels = {
        'nuevo': 'Nuevo Desarrollo',
        'mejora': 'Mejora Sistema',
        'infraestructura': 'Infraestructura',
        'integracion': 'Integración',
        'migracion': 'Migración',
        'otro': 'Otro'
    };

    summaryContainer.innerHTML = `
        <div class="confirmation-summary">
            <div class="summary-card">
                <h5><i class="fas fa-info-circle"></i> Información Básica</h5>
                <div class="summary-item">
                    <span class="label">Nombre:</span>
                    <span class="value">${formData.nombre || '-'}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Área Solicitante:</span>
                    <span class="value">${formData.area || '-'}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Tipo:</span>
                    <span class="value">${tipoLabels[formData.tipo] || formData.tipo || '-'}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Prioridad:</span>
                    <span class="value highlight">${formData.prioridad || '-'}</span>
                </div>
            </div>
            <div class="summary-card">
                <h5><i class="fas fa-file-alt"></i> Justificación</h5>
                <div class="summary-item">
                    <span class="label">Descripción:</span>
                    <span class="value">${(formData.descripcion || '').substring(0, 50)}${formData.descripcion?.length > 50 ? '...' : ''}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Beneficios:</span>
                    <span class="value">${(formData.beneficios || '').substring(0, 50)}${formData.beneficios?.length > 50 ? '...' : ''}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Objetivo Estratégico:</span>
                    <span class="value">${formData.objetivo || '-'}</span>
                </div>
            </div>
            <div class="summary-card">
                <h5><i class="fas fa-calculator"></i> Estimación</h5>
                <div class="summary-item">
                    <span class="label">Presupuesto:</span>
                    <span class="value highlight">$${formatNumber(formData.presupuesto || 0)}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Duración:</span>
                    <span class="value">${formData.duracion || '-'} meses</span>
                </div>
                <div class="summary-item">
                    <span class="label">Clasificación:</span>
                    <span class="value">${clasificacionLabels[formData.clasificacion] || formData.clasificacion || '-'}</span>
                </div>
            </div>
            <div class="summary-card">
                <h5><i class="fas fa-paperclip"></i> Documentos</h5>
                <div class="summary-item">
                    <span class="label">Archivos adjuntos:</span>
                    <span class="value">${formData.archivos || 0} archivo(s)</span>
                </div>
            </div>
        </div>
    `;
}

// Obtener datos del formulario del wizard
function getWizardFormData() {
    return {
        nombre: document.getElementById('req_nombre')?.value || '',
        area: document.getElementById('req_area')?.value || '',
        tipo: document.getElementById('req_tipo')?.value || '',
        prioridad: document.getElementById('req_prioridad')?.value || '',
        descripcion: document.getElementById('req_descripcion')?.value || '',
        beneficios: document.getElementById('req_beneficios')?.value || '',
        objetivo: document.getElementById('req_objetivo')?.value || '',
        presupuesto: document.getElementById('req_presupuesto')?.value || 0,
        duracion: document.getElementById('req_duracion')?.value || '',
        clasificacion: document.getElementById('req_clasificacion')?.value || '',
        archivos: document.querySelectorAll('.uploaded-file').length
    };
}

// Enviar requerimiento
function submitRequerimiento() {
    const formData = getWizardFormData();

    // Generar código
    const nextId = RequerimientosData.length + 1;
    const codigo = `REQ-2026-${String(nextId).padStart(3, '0')}`;

    // Crear nuevo requerimiento
    const newRequerimiento = {
        id: nextId,
        codigo: codigo,
        nombre: formData.nombre,
        area: formData.area,
        solicitante: 'Usuario Actual', // En producción, obtener del usuario logueado
        fechaSolicitud: new Date().toISOString().split('T')[0],
        prioridad: formData.prioridad,
        estado: 'pendiente',
        tipo: formData.tipo,
        presupuestoEstimado: parseInt(formData.presupuesto) || 0,
        descripcion: formData.problema,
        score: 0
    };

    RequerimientosData.push(newRequerimiento);

    closeModal('modal-requerimiento');
    showNotification('Requerimiento creado exitosamente: ' + codigo, 'success');

    // Actualizar vista si está activa
    if (AppState.currentView === 'activacion-requerimientos') {
        renderRequerimientos();
        updateRequerimientosKPIs();
    }

    // Resetear wizard
    resetWizard();
}

// Resetear wizard
function resetWizard() {
    wizardCurrentStep = 1;
    document.getElementById('form-requerimiento')?.reset();
    document.querySelectorAll('.uploaded-file').forEach(el => el.remove());
    updateWizardUI();
}

// Renderizar tabla de requerimientos
function renderRequerimientos() {
    const tbody = document.getElementById('requerimientosTableBody');
    if (!tbody) return;

    // Aplicar filtros
    const filterEstado = document.getElementById('filterEstadoReq')?.value || '';
    const filterPrioridad = document.getElementById('filterPrioridadReq')?.value || '';
    const filterArea = document.getElementById('filterAreaReq')?.value || '';
    const searchText = document.getElementById('searchReq')?.value?.toLowerCase() || '';

    let filtered = RequerimientosData.filter(req => {
        if (filterEstado && req.estado !== filterEstado) return false;
        if (filterPrioridad && req.prioridad !== filterPrioridad) return false;
        if (filterArea && req.area !== filterArea) return false;
        if (searchText && !req.nombre.toLowerCase().includes(searchText) &&
            !req.codigo.toLowerCase().includes(searchText)) return false;
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state" style="padding: 40px;">
                        <i class="fas fa-inbox"></i>
                        <h4>No hay requerimientos</h4>
                        <p>No se encontraron requerimientos con los filtros aplicados</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(req => `
        <tr>
            <td class="code-cell">${req.codigo}</td>
            <td>
                <div style="max-width: 250px;">
                    <strong>${req.nombre}</strong>
                    <br><small class="text-gray">${req.tipo}</small>
                </div>
            </td>
            <td>${req.area}</td>
            <td>${req.solicitante}</td>
            <td>${formatDate(req.fechaSolicitud)}</td>
            <td><span class="priority-badge ${req.prioridad}">${req.prioridad}</span></td>
            <td><span class="status-badge ${req.estado}">${getEstadoLabel(req.estado)}</span></td>
            <td>
                <div class="score-indicator">
                    <div class="score-bar">
                        <div class="score-fill ${getScoreClass(req.score)}" style="width: ${req.score}%"></div>
                    </div>
                    <span class="score-value">${req.score}</span>
                </div>
            </td>
            <td class="actions-cell">
                <button class="btn btn-icon btn-sm" onclick="viewRequerimiento(${req.id})" title="Ver detalle">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-icon btn-sm" onclick="editRequerimiento(${req.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                ${req.estado === 'pendiente' ? `
                    <button class="btn btn-icon btn-sm btn-success" onclick="aprobarRequerimiento(${req.id})" title="Aprobar">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Actualizar KPIs de requerimientos
function updateRequerimientosKPIs() {
    const total = RequerimientosData.length;
    const pendientes = RequerimientosData.filter(r => r.estado === 'pendiente').length;
    const enProceso = RequerimientosData.filter(r => r.estado === 'en-proceso').length;
    const aprobados = RequerimientosData.filter(r => r.estado === 'aprobado').length;

    const kpiTotal = document.getElementById('kpiTotalReq');
    const kpiPendientes = document.getElementById('kpiPendientesReq');
    const kpiEnProceso = document.getElementById('kpiEnProcesoReq');
    const kpiAprobados = document.getElementById('kpiAprobadosReq');

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiPendientes) kpiPendientes.textContent = pendientes;
    if (kpiEnProceso) kpiEnProceso.textContent = enProceso;
    if (kpiAprobados) kpiAprobados.textContent = aprobados;
}

// Funciones auxiliares
function getEstadoLabel(estado) {
    const labels = {
        'pendiente': 'Pendiente',
        'en-proceso': 'En Proceso',
        'aprobado': 'Aprobado',
        'rechazado': 'Rechazado',
        'revision': 'En Revisión'
    };
    return labels[estado] || estado;
}

function getScoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Ver detalle de requerimiento
function viewRequerimiento(id) {
    const req = RequerimientosData.find(r => r.id === id);
    if (!req) return;

    showNotification(`Abriendo detalle de ${req.codigo}...`, 'info');
    // Aquí se podría abrir un modal de detalle
}

// Editar requerimiento
function editRequerimiento(id) {
    const req = RequerimientosData.find(r => r.id === id);
    if (!req) return;

    // Cargar datos en el wizard
    const nombreField = document.getElementById('req_nombre');
    const areaField = document.getElementById('req_area');
    const tipoField = document.getElementById('req_tipo');
    const prioridadField = document.getElementById('req_prioridad');
    const descripcionField = document.getElementById('req_descripcion');
    const presupuestoField = document.getElementById('req_presupuesto');

    if (nombreField) nombreField.value = req.nombre;
    if (areaField) areaField.value = req.area;
    if (tipoField) tipoField.value = req.tipo;
    if (prioridadField) prioridadField.value = req.prioridad;
    if (descripcionField) descripcionField.value = req.descripcion;
    if (presupuestoField) presupuestoField.value = req.presupuestoEstimado;

    initWizard();
    openModal('modal-requerimiento');
}

// Aprobar requerimiento
function aprobarRequerimiento(id) {
    const req = RequerimientosData.find(r => r.id === id);
    if (!req) return;

    req.estado = 'en-proceso';
    renderRequerimientos();
    updateRequerimientosKPIs();
    showNotification(`Requerimiento ${req.codigo} enviado a proceso de evaluación`, 'success');
}

// Inicializar filtros de requerimientos
function initRequerimientosFilters() {
    const filters = ['filterEstadoReq', 'filterPrioridadReq', 'filterAreaReq', 'searchReq'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', renderRequerimientos);
            el.addEventListener('input', renderRequerimientos);
        }
    });
}

// Limpiar filtros de requerimientos
function clearRequerimientosFilters() {
    document.getElementById('filterEstadoReq').value = '';
    document.getElementById('filterPrioridadReq').value = '';
    document.getElementById('filterAreaReq').value = '';
    document.getElementById('searchReq').value = '';
    renderRequerimientos();
}

// File upload handling
function initFileUpload() {
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    Array.from(files).forEach(file => {
        const fileEl = document.createElement('div');
        fileEl.className = 'uploaded-file';
        fileEl.innerHTML = `
            <i class="fas ${getFileIcon(file.name)}"></i>
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <span class="btn-remove" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </span>
        `;
        container.appendChild(fileEl);
    });
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: 'fa-file-pdf file-icon pdf',
        doc: 'fa-file-word file-icon word',
        docx: 'fa-file-word file-icon word',
        xls: 'fa-file-excel file-icon excel',
        xlsx: 'fa-file-excel file-icon excel',
        ppt: 'fa-file-powerpoint file-icon ppt',
        pptx: 'fa-file-powerpoint file-icon ppt',
        jpg: 'fa-file-image file-icon img',
        jpeg: 'fa-file-image file-icon img',
        png: 'fa-file-image file-icon img'
    };
    return icons[ext] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Inicializar cuando se abre el modal de requerimiento
const originalOpenModal = openModal;
openModal = function(modalId) {
    originalOpenModal(modalId);

    if (modalId === 'modal-requerimiento') {
        initWizard();
        initFileUpload();
    }
};

// Mostrar información de clasificación contable
function mostrarInfoClasificacion(value) {
    const infoDiv = document.getElementById('clasificacion-info');
    if (!infoDiv) return;

    const info = {
        'capex_intangible': 'Software desarrollado internamente o adquirido que cumple con los criterios de NIC 38. Se capitaliza y amortiza durante su vida útil estimada (3-5 años).',
        'capex_tangible': 'Equipamiento físico (hardware, infraestructura) que cumple con NIC 16. Se capitaliza y deprecia según vida útil del activo.',
        'opex': 'Gastos operativos que no cumplen criterios de capitalización. Se imputan directamente al resultado del ejercicio.',
        'niif16': 'Contratos de arrendamiento que cumplen criterios NIIF 16. Genera activo por derecho de uso y pasivo por arrendamiento.'
    };

    if (value && info[value]) {
        infoDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${info[value]}`;
        infoDiv.classList.add('show');
    } else {
        infoDiv.classList.remove('show');
    }
}

// Exportar requerimientos a Excel/CSV
function exportarRequerimientos() {
    showNotification('Generando archivo de exportación...', 'info');

    // Simular descarga
    setTimeout(() => {
        showNotification('Archivo descargado: Requerimientos_2026.xlsx', 'success');
    }, 1500);
}

// Inicializar componentes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar filtros si estamos en la vista de requerimientos
    if (document.getElementById('filterEstadoReq')) {
        initRequerimientosFilters();
    }
});

/* ========================================
   Factibilidad - Datos y Funciones
   ======================================== */

// Datos de ejemplo de informes de factibilidad
const FactibilidadData = {
    pendientes: [
        { id: 1, codigo: 'REQ-2026-003', nombre: 'App Móvil Técnicos', area: 'Operaciones', solicitante: 'Pedro Rojas', fechaSolicitud: '2026-01-20', diasPendiente: 13, prioridad: 'P3' },
        { id: 2, codigo: 'REQ-2026-005', nombre: 'Plataforma E-Learning', area: 'RRHH', solicitante: 'Luis Torres', fechaSolicitud: '2026-01-25', diasPendiente: 8, prioridad: 'P4' },
        { id: 3, codigo: 'REQ-2026-007', nombre: 'Sistema de Notificaciones', area: 'TI', solicitante: 'Usuario Actual', fechaSolicitud: '2026-02-01', diasPendiente: 1, prioridad: 'P2' },
        { id: 4, codigo: 'REQ-2026-008', nombre: 'Migración Data Center', area: 'Infraestructura', solicitante: 'Pedro Rojas', fechaSolicitud: '2026-01-15', diasPendiente: 18, prioridad: 'P2' }
    ],
    enRevision: [
        { id: 5, codigo: 'REQ-2026-001', nombre: 'Sistema de Gestión Documental', analista: 'Carlos Méndez', fechaInforme: '2026-01-28', scorePreliminar: 85, recomendacion: 'aprobar' },
        { id: 6, codigo: 'REQ-2026-004', nombre: 'Dashboard Operacional', analista: 'Ana García', fechaInforme: '2026-01-30', scorePreliminar: 78, recomendacion: 'aprobar_condiciones' }
    ],
    completados: [
        { id: 7, codigo: 'REQ-2025-045', nombre: 'Integración SCADA-ERP', analista: 'Carlos Méndez', fechaEvaluacion: '2026-01-10', scoreFinal: 92, capex: 350000, resultado: 'aprobado' },
        { id: 8, codigo: 'REQ-2025-042', nombre: 'Portal Autoatención', analista: 'Ana García', fechaEvaluacion: '2025-12-15', scoreFinal: 88, capex: 180000, resultado: 'aprobado' },
        { id: 9, codigo: 'REQ-2025-039', nombre: 'Modernización ERP', analista: 'Roberto Silva', fechaEvaluacion: '2025-11-20', scoreFinal: 95, capex: 850000, resultado: 'aprobado' },
        { id: 10, codigo: 'REQ-2025-038', nombre: 'Sistema Legacy X', analista: 'María López', fechaEvaluacion: '2025-11-05', scoreFinal: 62, capex: 200000, resultado: 'rechazado' }
    ]
};

// Estado del wizard de factibilidad
let factWizardCurrentStep = 1;
const factWizardTotalSteps = 5;

// Inicializar wizard de factibilidad
function initFactWizard() {
    factWizardCurrentStep = 1;
    updateFactWizardUI();
    cargarIniciativasPendientes();

    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fact_fecha');
    if (fechaInput) fechaInput.value = today;
}

// Actualizar UI del wizard de factibilidad
function updateFactWizardUI() {
    // Actualizar indicadores de pasos
    document.querySelectorAll('#modal-factibilidad .wizard-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNum < factWizardCurrentStep) {
            step.classList.add('completed');
        } else if (stepNum === factWizardCurrentStep) {
            step.classList.add('active');
        }
    });

    // Mostrar/ocultar contenido
    for (let i = 1; i <= factWizardTotalSteps; i++) {
        const content = document.getElementById(`fact-wizard-step-${i}`);
        if (content) {
            content.classList.remove('active');
            if (i === factWizardCurrentStep) {
                content.classList.add('active');
            }
        }
    }

    // Actualizar botones de navegación
    const prevBtn = document.getElementById('fact-wizard-prev');
    const nextBtn = document.getElementById('fact-wizard-next');
    const submitBtn = document.getElementById('fact-wizard-submit');

    if (prevBtn) {
        prevBtn.style.display = factWizardCurrentStep === 1 ? 'none' : 'inline-flex';
    }

    if (nextBtn) {
        nextBtn.style.display = factWizardCurrentStep === factWizardTotalSteps ? 'none' : 'inline-flex';
    }

    if (submitBtn) {
        submitBtn.style.display = factWizardCurrentStep === factWizardTotalSteps ? 'inline-flex' : 'none';
    }

    // Si es el último paso, preparar resumen
    if (factWizardCurrentStep === factWizardTotalSteps) {
        prepareFactSummary();
    }
}

// Siguiente paso del wizard de factibilidad
function factWizardNext() {
    if (factWizardCurrentStep < factWizardTotalSteps) {
        factWizardCurrentStep++;
        updateFactWizardUI();
    }
}

// Paso anterior del wizard de factibilidad
function factWizardPrev() {
    if (factWizardCurrentStep > 1) {
        factWizardCurrentStep--;
        updateFactWizardUI();
    }
}

// Cargar iniciativas pendientes en el select
function cargarIniciativasPendientes() {
    const select = document.getElementById('fact_iniciativa');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar iniciativa pendiente...</option>';

    FactibilidadData.pendientes.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.codigo} - ${item.nombre}`;
        select.appendChild(option);
    });
}

// Cargar datos de la iniciativa seleccionada
function cargarDatosIniciativa(id) {
    const preview = document.getElementById('iniciativaPreview');
    if (!preview) return;

    if (!id) {
        preview.style.display = 'none';
        return;
    }

    const iniciativa = FactibilidadData.pendientes.find(i => i.id == id);
    if (!iniciativa) {
        preview.style.display = 'none';
        return;
    }

    // Buscar datos adicionales en RequerimientosData si existe
    const reqData = typeof RequerimientosData !== 'undefined'
        ? RequerimientosData.find(r => r.codigo === iniciativa.codigo)
        : null;

    document.getElementById('prevCodigo').textContent = iniciativa.codigo;
    document.getElementById('prevArea').textContent = iniciativa.area;
    document.getElementById('prevSponsor').textContent = iniciativa.solicitante;
    document.getElementById('prevFecha').textContent = formatDate(iniciativa.fechaSolicitud);
    document.getElementById('prevDescripcion').textContent = reqData?.descripcion || 'Ver detalle en requerimiento original';
    document.getElementById('prevPresupuesto').textContent = reqData?.presupuestoEstimado ? `$${formatNumber(reqData.presupuestoEstimado)}` : 'Por definir';
    document.getElementById('prevObjetivo').textContent = reqData?.objetivo || 'Ver detalle';

    preview.style.display = 'block';
}

// Calcular totales económicos
function calcularTotales() {
    const capexHW = parseFloat(document.getElementById('fact_capex_hw')?.value) || 0;
    const capexSW = parseFloat(document.getElementById('fact_capex_sw')?.value) || 0;
    const capexSRV = parseFloat(document.getElementById('fact_capex_srv')?.value) || 0;
    const opex = parseFloat(document.getElementById('fact_opex')?.value) || 0;
    const ahorro = parseFloat(document.getElementById('fact_ahorro')?.value) || 0;
    const ingresos = parseFloat(document.getElementById('fact_ingresos')?.value) || 0;

    const capexTotal = capexHW + capexSW + capexSRV;
    const beneficioAnual = ahorro + ingresos;

    // Mostrar CAPEX total
    const capexTotalInput = document.getElementById('fact_capex_total');
    if (capexTotalInput) {
        capexTotalInput.value = `$${formatNumber(capexTotal)}`;
    }

    // Calcular ROI
    const roiInput = document.getElementById('fact_roi');
    if (roiInput && capexTotal > 0 && beneficioAnual > 0) {
        const roi = ((beneficioAnual / capexTotal) * 100).toFixed(1);
        roiInput.value = `${roi}%`;
    } else if (roiInput) {
        roiInput.value = '-';
    }

    // Calcular Payback
    const paybackInput = document.getElementById('fact_payback');
    if (paybackInput && capexTotal > 0 && beneficioAnual > 0) {
        const paybackMeses = Math.ceil((capexTotal / beneficioAnual) * 12);
        paybackInput.value = `${paybackMeses} meses`;
    } else if (paybackInput) {
        paybackInput.value = '-';
    }

    // Calcular VAN (simplificado, 5 años, 10% tasa)
    const vanInput = document.getElementById('fact_van');
    if (vanInput && beneficioAnual > 0) {
        const tasa = 0.10;
        let van = -capexTotal;
        for (let i = 1; i <= 5; i++) {
            van += (beneficioAnual - opex) / Math.pow(1 + tasa, i);
        }
        vanInput.value = `$${formatNumber(Math.round(van))}`;
    } else if (vanInput) {
        vanInput.value = '-';
    }
}

// Calcular score total
function calcularScoreTotal() {
    // Alineación Estratégica (40%)
    const scoreObjEstrategico = parseInt(document.getElementById('score_obj_estrategico')?.value) || 0;
    const scoreImpacto = parseInt(document.getElementById('score_impacto')?.value) || 0;
    const scoreUrgencia = parseInt(document.getElementById('score_urgencia')?.value) || 0;
    const scoreRegulatorio = parseInt(document.getElementById('score_regulatorio')?.value) || 0;
    const subtotalAlineacion = scoreObjEstrategico + scoreImpacto + scoreUrgencia + scoreRegulatorio;

    // Factibilidad Técnica (35%)
    const scoreMadurez = parseInt(document.getElementById('score_madurez')?.value) || 0;
    const scoreEquipo = parseInt(document.getElementById('score_equipo')?.value) || 0;
    const scoreIntegracion = parseInt(document.getElementById('score_integracion')?.value) || 0;
    // Ajustar para que 3 items sumen 35 (cada uno vale ~11.67, redondeamos)
    const subtotalTecnico = Math.round((scoreMadurez + scoreEquipo + scoreIntegracion) * 35 / 30);

    // Viabilidad Económica (25%)
    const scoreROI = parseInt(document.getElementById('score_roi')?.value) || 0;
    const scorePresupuesto = parseInt(document.getElementById('score_presupuesto')?.value) || 0;
    // Ajustar para que 2 items sumen 25 (cada uno vale 12.5)
    const subtotalEconomico = Math.round((scoreROI + scorePresupuesto) * 25 / 20);

    // Actualizar subtotales
    const subtotalAlineacionEl = document.getElementById('subtotalAlineacion');
    const subtotalTecnicoEl = document.getElementById('subtotalTecnico');
    const subtotalEconomicoEl = document.getElementById('subtotalEconomico');

    if (subtotalAlineacionEl) subtotalAlineacionEl.textContent = subtotalAlineacion;
    if (subtotalTecnicoEl) subtotalTecnicoEl.textContent = subtotalTecnico;
    if (subtotalEconomicoEl) subtotalEconomicoEl.textContent = subtotalEconomico;

    // Score total
    const scoreTotal = subtotalAlineacion + subtotalTecnico + subtotalEconomico;
    const scoreTotalEl = document.getElementById('scoreTotal');
    if (scoreTotalEl) scoreTotalEl.textContent = scoreTotal;

    // Indicador de resultado
    const indicatorEl = document.getElementById('scoreIndicator');
    if (indicatorEl) {
        indicatorEl.classList.remove('aprobado', 'rechazado');
        if (scoreTotal >= 80) {
            indicatorEl.classList.add('aprobado');
            indicatorEl.querySelector('.indicator-text').textContent = 'APROBADO';
        } else if (scoreTotal > 0) {
            indicatorEl.classList.add('rechazado');
            indicatorEl.querySelector('.indicator-text').textContent = 'NO APROBADO';
        } else {
            indicatorEl.querySelector('.indicator-text').textContent = 'Complete la evaluación';
        }
    }

    return { subtotalAlineacion, subtotalTecnico, subtotalEconomico, scoreTotal };
}

// Preparar resumen de scoring para paso final
function prepareFactSummary() {
    const scores = calcularScoreTotal();
    const summaryContainer = document.getElementById('resumenScoring');
    if (!summaryContainer) return;

    const resultado = scores.scoreTotal >= 80 ? 'aprobado' : 'rechazado';
    const resultadoText = scores.scoreTotal >= 80 ? 'APROBADO' : 'NO APROBADO';

    summaryContainer.innerHTML = `
        <div class="resumen-score-card">
            <h6>Alineación Estratégica</h6>
            <span class="score">${scores.subtotalAlineacion}</span><span class="max">/40</span>
        </div>
        <div class="resumen-score-card">
            <h6>Factibilidad Técnica</h6>
            <span class="score">${scores.subtotalTecnico}</span><span class="max">/35</span>
        </div>
        <div class="resumen-score-card">
            <h6>Viabilidad Económica</h6>
            <span class="score">${scores.subtotalEconomico}</span><span class="max">/25</span>
        </div>
        <div class="resumen-score-card total" style="grid-column: 1 / -1;">
            <h6>Score Total</h6>
            <span class="score">${scores.scoreTotal}</span><span class="max">/100</span>
            <div class="resultado ${resultado}">${resultadoText}</div>
        </div>
    `;
}

// Enviar informe de factibilidad
function submitFactibilidadWizard() {
    const scores = calcularScoreTotal();
    const iniciativaId = document.getElementById('fact_iniciativa')?.value;
    const recomendacion = document.getElementById('fact_recomendacion')?.value;
    const justificacion = document.getElementById('fact_justificacion')?.value;

    if (!iniciativaId || !recomendacion || !justificacion) {
        showNotification('Por favor complete todos los campos requeridos', 'warning');
        return;
    }

    const iniciativa = FactibilidadData.pendientes.find(i => i.id == iniciativaId);
    if (!iniciativa) return;

    // Simular guardado
    showNotification(`Informe de factibilidad guardado para ${iniciativa.codigo}`, 'success');
    closeModal('modal-factibilidad');

    // Mover de pendientes a revisión (simulado)
    const index = FactibilidadData.pendientes.findIndex(i => i.id == iniciativaId);
    if (index > -1) {
        const item = FactibilidadData.pendientes.splice(index, 1)[0];
        FactibilidadData.enRevision.push({
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            analista: document.getElementById('fact_analista')?.selectedOptions[0]?.text?.split(' - ')[0] || 'Analista',
            fechaInforme: new Date().toISOString().split('T')[0],
            scorePreliminar: scores.scoreTotal,
            recomendacion: recomendacion
        });
    }

    // Actualizar vista si está activa
    if (AppState.currentView === 'activacion-factibilidad') {
        renderFactibilidad();
        updateFactibilidadKPIs();
    }

    // Resetear wizard
    resetFactWizard();
}

// Resetear wizard de factibilidad
function resetFactWizard() {
    factWizardCurrentStep = 1;
    const formFact = document.getElementById('form-factibilidad');
    if (formFact) formFact.reset();
    const preview = document.getElementById('iniciativaPreview');
    if (preview) preview.style.display = 'none';
    const uploadedFiles = document.getElementById('factUploadedFiles');
    if (uploadedFiles) uploadedFiles.innerHTML = '';
    updateFactWizardUI();
}

// Renderizar tablas de factibilidad
function renderFactibilidad() {
    renderFactPendientes();
    renderFactRevision();
    renderFactCompletados();
}

function renderFactPendientes() {
    const tbody = document.getElementById('factPendientesTableBody');
    if (!tbody) return;

    tbody.innerHTML = FactibilidadData.pendientes.map(item => `
        <tr>
            <td class="code-cell">${item.codigo}</td>
            <td><strong>${item.nombre}</strong></td>
            <td>${item.area}</td>
            <td>${item.solicitante}</td>
            <td>${formatDate(item.fechaSolicitud)}</td>
            <td><span class="days-badge ${getDaysBadgeClass(item.diasPendiente)}">${item.diasPendiente} días</span></td>
            <td><span class="priority-badge ${item.prioridad}">${item.prioridad}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="abrirInformeFact(${item.id})">
                    <i class="fas fa-file-signature"></i> Elaborar Informe
                </button>
            </td>
        </tr>
    `).join('');
}

function renderFactRevision() {
    const tbody = document.getElementById('factRevisionTableBody');
    if (!tbody) return;

    tbody.innerHTML = FactibilidadData.enRevision.map(item => `
        <tr>
            <td class="code-cell">${item.codigo}</td>
            <td><strong>${item.nombre}</strong></td>
            <td>${item.analista}</td>
            <td>${formatDate(item.fechaInforme)}</td>
            <td>
                <div class="score-indicator">
                    <div class="score-bar">
                        <div class="score-fill ${getScoreClass(item.scorePreliminar)}" style="width: ${item.scorePreliminar}%"></div>
                    </div>
                    <span class="score-value">${item.scorePreliminar}</span>
                </div>
            </td>
            <td><span class="recomendacion-badge ${item.recomendacion}">${getRecomendacionLabel(item.recomendacion)}</span></td>
            <td class="actions-cell">
                <button class="btn btn-icon btn-sm" title="Ver informe"><i class="fas fa-eye"></i></button>
                <button class="btn btn-icon btn-sm btn-success" title="Aprobar"><i class="fas fa-check"></i></button>
                <button class="btn btn-icon btn-sm btn-danger" title="Devolver"><i class="fas fa-undo"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderFactCompletados() {
    const tbody = document.getElementById('factCompletadosTableBody');
    if (!tbody) return;

    tbody.innerHTML = FactibilidadData.completados.map(item => `
        <tr>
            <td class="code-cell">${item.codigo}</td>
            <td><strong>${item.nombre}</strong></td>
            <td>${item.analista}</td>
            <td>${formatDate(item.fechaEvaluacion)}</td>
            <td>
                <div class="score-indicator">
                    <div class="score-bar">
                        <div class="score-fill ${getScoreClass(item.scoreFinal)}" style="width: ${item.scoreFinal}%"></div>
                    </div>
                    <span class="score-value">${item.scoreFinal}</span>
                </div>
            </td>
            <td>$${formatNumber(item.capex)}</td>
            <td><span class="status-badge ${item.resultado}">${item.resultado === 'aprobado' ? 'Aprobado' : 'Rechazado'}</span></td>
            <td class="actions-cell">
                <button class="btn btn-icon btn-sm" title="Ver informe"><i class="fas fa-eye"></i></button>
                <button class="btn btn-icon btn-sm" title="Descargar PDF"><i class="fas fa-file-pdf"></i></button>
            </td>
        </tr>
    `).join('');
}

// Actualizar KPIs de factibilidad
function updateFactibilidadKPIs() {
    const pendientes = FactibilidadData.pendientes.length;
    const enRevision = FactibilidadData.enRevision.length;
    const aprobados = FactibilidadData.completados.filter(i => i.resultado === 'aprobado').length;
    const rechazados = FactibilidadData.completados.filter(i => i.resultado === 'rechazado').length;

    const kpiPendientes = document.getElementById('kpiPendientesFact');
    const kpiEnRevision = document.getElementById('kpiEnRevisionFact');
    const kpiAprobados = document.getElementById('kpiAprobadosFact');
    const kpiRechazados = document.getElementById('kpiRechazadosFact');

    if (kpiPendientes) kpiPendientes.textContent = pendientes;
    if (kpiEnRevision) kpiEnRevision.textContent = enRevision;
    if (kpiAprobados) kpiAprobados.textContent = aprobados;
    if (kpiRechazados) kpiRechazados.textContent = rechazados;

    // Actualizar contadores de tabs
    const tabPendientes = document.getElementById('tabPendientesCount');
    const tabRevision = document.getElementById('tabRevisionCount');
    const tabCompletados = document.getElementById('tabCompletadosCount');

    if (tabPendientes) tabPendientes.textContent = pendientes;
    if (tabRevision) tabRevision.textContent = enRevision;
    if (tabCompletados) tabCompletados.textContent = FactibilidadData.completados.length;

    // Actualizar alerta SLA
    const slaCount = FactibilidadData.pendientes.filter(i => i.diasPendiente > 15).length;
    const slaCountEl = document.getElementById('factSlaCount');
    if (slaCountEl) slaCountEl.textContent = slaCount;
}

// Funciones auxiliares
function getDaysBadgeClass(days) {
    if (days > 15) return 'danger';
    if (days > 10) return 'warning';
    return 'normal';
}

function getRecomendacionLabel(rec) {
    const labels = {
        'aprobar': 'Aprobar',
        'aprobar_condiciones': 'Aprobar c/Condiciones',
        'revisar': 'Revisar',
        'rechazar': 'Rechazar'
    };
    return labels[rec] || rec;
}

// Abrir modal con iniciativa preseleccionada
function abrirInformeFact(id) {
    openModal('modal-factibilidad');
    setTimeout(() => {
        const select = document.getElementById('fact_iniciativa');
        if (select) {
            select.value = id;
            cargarDatosIniciativa(id);
        }
    }, 100);
}

// Exportar factibilidad
function exportarFactibilidad() {
    showNotification('Generando reporte de factibilidad...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Factibilidad_2026.xlsx', 'success');
    }, 1500);
}

// Filtrar por SLA
function filtrarFactibilidadSLA() {
    showNotification('Filtrando iniciativas que superan SLA...', 'info');
}

// Actualizar openModal para factibilidad
const existingOpenModal = openModal;
openModal = function(modalId) {
    existingOpenModal(modalId);

    if (modalId === 'modal-factibilidad') {
        initFactWizard();
    }
};

// Extender initViewData para factibilidad
const originalInitViewData2 = initViewData;
initViewData = function(viewId) {
    originalInitViewData2(viewId);

    if (viewId === 'activacion-factibilidad') {
        renderFactibilidad();
        updateFactibilidadKPIs();
    }

    if (viewId === 'activacion-individual') {
        initActivacionIndividual();
    }

    if (viewId === 'activacion-plan-anual') {
        initPlanAnual();
    }

    if (viewId === 'activacion-extraordinario') {
        initExtraordinario();
    }
};

/* ========================================
   Activación Individual - Funciones
   ======================================== */

function initActivacionIndividual() {
    // Inicializar vista de activación individual
    console.log('Activación Individual inicializada');
}

function abrirActivacion(id) {
    showNotification(`Abriendo formulario de activación para proyecto ${id}`, 'info');
    // Aquí se abriría el modal de activación
}

function exportarActivaciones() {
    showNotification('Generando reporte de activaciones...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Activaciones_2026.xlsx', 'success');
    }, 1500);
}

/* ========================================
   Plan Anual - Funciones
   ======================================== */

function initPlanAnual() {
    // Inicializar filtros del plan anual
    const filterEstado = document.getElementById('filterEstadoPlan');
    const filterArea = document.getElementById('filterAreaPlan');
    const filterPrioridad = document.getElementById('filterPrioridadPlan');
    const filterTrimestre = document.getElementById('filterTrimestrePlan');

    [filterEstado, filterArea, filterPrioridad, filterTrimestre].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filtrarPlanAnual);
        }
    });
}

function filtrarPlanAnual() {
    showNotification('Filtrando proyectos del plan...', 'info');
    // Aquí se implementaría la lógica de filtrado
}

function exportarPlanAnual() {
    showNotification('Generando PDF del Plan Anual 2026...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Plan_Anual_2026.pdf', 'success');
    }, 2000);
}

/* ========================================
   Ingreso Extraordinario - Funciones
   ======================================== */

function initExtraordinario() {
    // Inicializar fecha por defecto
    const fechaInput = document.getElementById('ext_fecha_inicio');
    if (fechaInput) {
        const today = new Date();
        today.setDate(today.getDate() + 7); // Una semana desde hoy
        fechaInput.value = today.toISOString().split('T')[0];
    }
}

function calcularNivelAprobacion() {
    const presupuesto = parseFloat(document.getElementById('ext_presupuesto')?.value) || 0;
    const nivelInput = document.getElementById('ext_nivel_aprobacion');

    if (!nivelInput) return;

    let nivel = '';
    if (presupuesto <= 0) {
        nivel = 'Ingrese presupuesto';
    } else if (presupuesto <= 50000) {
        nivel = 'Gerencia de Área';
    } else if (presupuesto <= 200000) {
        nivel = 'Comité de Expertos';
    } else if (presupuesto <= 500000) {
        nivel = 'Comité de Inversiones';
    } else {
        nivel = 'Directorio';
    }

    nivelInput.value = nivel;
}

function submitExtraordinario(event) {
    event.preventDefault();

    const nombre = document.getElementById('ext_nombre')?.value;
    const area = document.getElementById('ext_area')?.value;
    const presupuesto = document.getElementById('ext_presupuesto')?.value;
    const motivo = document.getElementById('ext_motivo')?.value;
    const justificacion = document.getElementById('ext_justificacion')?.value;

    if (!nombre || !area || !presupuesto || !motivo || !justificacion) {
        showNotification('Por favor complete todos los campos requeridos', 'warning');
        return;
    }

    // Generar código de solicitud
    const codigo = `EXT-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

    showNotification(`Solicitud ${codigo} enviada correctamente`, 'success');

    // Limpiar formulario
    limpiarFormExtraordinario();

    // Actualizar contador de pendientes
    const tabPendientes = document.getElementById('tabExtPendientes');
    if (tabPendientes) {
        tabPendientes.textContent = parseInt(tabPendientes.textContent) + 1;
    }

    const kpiPendientes = document.getElementById('kpiPendientesExt');
    if (kpiPendientes) {
        kpiPendientes.textContent = parseInt(kpiPendientes.textContent) + 1;
    }
}

function limpiarFormExtraordinario() {
    const form = document.getElementById('form-extraordinario');
    if (form) form.reset();

    const nivelInput = document.getElementById('ext_nivel_aprobacion');
    if (nivelInput) nivelInput.value = 'Ingrese presupuesto';

    const uploadedFiles = document.getElementById('extUploadedFiles');
    if (uploadedFiles) uploadedFiles.innerHTML = '';
}

function verHistorialExtraordinarios() {
    // Cambiar a tab de historial
    document.querySelectorAll('#activacion-extraordinario .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#activacion-extraordinario .tab-content').forEach(c => c.classList.remove('active'));

    document.querySelector('[data-tab="ext-historial"]')?.classList.add('active');
    document.getElementById('ext-historial')?.classList.add('active');

    showNotification('Mostrando historial de solicitudes extraordinarias', 'info');
}

/* ========================================
   Kanban Board - Implementación y Construcción
   ======================================== */

// Datos de ejemplo para el Kanban
const KanbanData = {
    columns: ['kick-off', 'analisis', 'construccion', 'pruebas', 'transicion', 'go-live'],
    projects: [
        { id: 'PRY-2026-001', nombre: 'Renovación Red MT', columna: 'kick-off', prioridad: 'alta', asignado: 'J. Pérez', fechaLimite: '2026-02-15', progreso: 5, estado: 'normal' },
        { id: 'PRY-2026-003', nombre: 'Migración SAP S/4', columna: 'kick-off', prioridad: 'alta', asignado: 'M. Soto', fechaLimite: '2026-02-28', progreso: 0, estado: 'normal' },
        { id: 'PRY-2026-005', nombre: 'Smart Meters Fase 2', columna: 'analisis', prioridad: 'alta', asignado: 'R. García', fechaLimite: '2026-02-10', progreso: 25, estado: 'at-risk' },
        { id: 'PRY-2026-007', nombre: 'App Clientes v3.0', columna: 'analisis', prioridad: 'media', asignado: 'A. López', fechaLimite: '2026-03-05', progreso: 35, estado: 'normal' },
        { id: 'PRY-2025-089', nombre: 'Centro de Control Regional', columna: 'construccion', prioridad: 'alta', asignado: 'P. Muñoz', fechaLimite: '2026-02-20', progreso: 60, estado: 'normal' },
        { id: 'PRY-2025-092', nombre: 'Plataforma IoT', columna: 'construccion', prioridad: 'media', asignado: 'C. Vera', fechaLimite: '2026-03-10', progreso: 45, estado: 'blocked', bloqueadoPor: 'Espera aprobación proveedor' },
        { id: 'PRY-2025-078', nombre: 'Sistema SCADA v2', columna: 'pruebas', prioridad: 'alta', asignado: 'L. Torres', fechaLimite: '2026-02-08', progreso: 85, estado: 'normal' },
        { id: 'PRY-2025-081', nombre: 'Portal Proveedores', columna: 'pruebas', prioridad: 'media', asignado: 'F. Reyes', fechaLimite: '2026-02-25', progreso: 70, estado: 'normal' },
        { id: 'PRY-2025-065', nombre: 'Automatización Subestaciones', columna: 'transicion', prioridad: 'alta', asignado: 'D. Silva', fechaLimite: '2026-02-12', progreso: 95, estado: 'normal' },
        { id: 'PRY-2025-045', nombre: 'ERP Financiero', columna: 'go-live', prioridad: 'alta', asignado: 'M. González', fechaLimite: '2026-01-31', progreso: 100, estado: 'completed' }
    ]
};

let draggedCard = null;

function initKanban() {
    console.log('Inicializando Kanban Board...');

    // Hacer las tarjetas arrastrables
    const cards = document.querySelectorAll('.kanban-card');
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    // Configurar las zonas de drop (columnas)
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        const cardsContainer = column.querySelector('.kanban-cards');
        if (cardsContainer) {
            cardsContainer.addEventListener('dragover', handleDragOver);
            cardsContainer.addEventListener('dragenter', handleDragEnter);
            cardsContainer.addEventListener('dragleave', handleDragLeave);
            cardsContainer.addEventListener('drop', handleDrop);
        }
    });

    // Actualizar contadores de columnas
    updateKanbanCounters();
}

function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);

    // Agregar clase a todas las columnas para indicar que se puede soltar
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.add('drop-target');
    });
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedCard = null;

    // Remover clases de drop de todas las columnas
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drop-target', 'drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    const column = this.closest('.kanban-column');
    if (column) {
        column.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const column = this.closest('.kanban-column');
    if (column && !column.contains(e.relatedTarget)) {
        column.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const column = this.closest('.kanban-column');
    if (column) {
        column.classList.remove('drag-over');
    }

    if (draggedCard) {
        const projectId = draggedCard.querySelector('.kanban-code')?.textContent || draggedCard.dataset.id;
        const oldColumn = draggedCard.closest('.kanban-column');
        const newColumnId = column.dataset.phase;
        const oldColumnId = oldColumn ? oldColumn.dataset.phase : null;

        // Mover la tarjeta al nuevo contenedor
        this.appendChild(draggedCard);

        // Actualizar estado de la tarjeta si es la última columna
        if (newColumnId === 'golive') {
            draggedCard.classList.remove('blocked', 'at-risk');
            draggedCard.classList.add('completed');

            // Actualizar la barra de progreso a 100%
            const progressBar = draggedCard.querySelector('.progress-fill');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            const progressText = draggedCard.querySelector('.kanban-card-progress span');
            if (progressText) {
                progressText.textContent = '100%';
            }
        }

        // Notificar el cambio
        const columnNames = {
            'kickoff': 'Kick Off',
            'analisis': 'Análisis',
            'construccion': 'Construcción',
            'pruebas': 'Pruebas',
            'transicion': 'Transición',
            'golive': 'Go Live'
        };

        if (oldColumnId !== newColumnId) {
            showNotification(`Proyecto ${projectId} movido a ${columnNames[newColumnId]}`, 'success');
        }

        // Actualizar contadores
        updateKanbanCounters();
    }
}

function updateKanbanCounters() {
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        const cards = column.querySelectorAll('.kanban-card');
        const counter = column.querySelector('.kanban-count');
        if (counter) {
            counter.textContent = cards.length;
        }
    });

    // Actualizar KPIs generales
    updateKanbanKPIs();
}

function updateKanbanKPIs() {
    const totalCards = document.querySelectorAll('.kanban-card').length;
    const blockedCards = document.querySelectorAll('.kanban-card.blocked').length;
    const atRiskCards = document.querySelectorAll('.kanban-card.at-risk').length;
    const completedCards = document.querySelectorAll('.kanban-card.completed').length;
    const goLiveCards = document.querySelectorAll('.kanban-column[data-phase="golive"] .kanban-card').length;

    // Contar proyectos activos (en construcción y pruebas)
    const enConstruccion = document.querySelectorAll('.kanban-column[data-phase="construccion"] .kanban-card').length;
    const enPruebas = document.querySelectorAll('.kanban-column[data-phase="pruebas"] .kanban-card').length;
    const enCurso = enConstruccion + enPruebas;

    // Actualizar elementos KPI si existen (IDs del HTML actual)
    const kpiTotal = document.getElementById('kpiTotalKanban');
    const kpiEnCurso = document.getElementById('kpiEnCursoKanban');
    const kpiBloqueados = document.getElementById('kpiBloqueadosKanban');
    const kpiCompletados = document.getElementById('kpiCompletadosKanban');

    if (kpiTotal) kpiTotal.textContent = totalCards;
    if (kpiEnCurso) kpiEnCurso.textContent = enCurso;
    if (kpiBloqueados) kpiBloqueados.textContent = blockedCards;
    if (kpiCompletados) kpiCompletados.textContent = goLiveCards;
}

function verDetalleProyecto(id) {
    showNotification(`Abriendo detalle del proyecto ${id}...`, 'info');
    // Aquí se abriría un modal con el detalle del proyecto
}

function editarProyecto(id) {
    showNotification(`Editando proyecto ${id}...`, 'info');
    // Aquí se abriría el modal de edición
}

function desbloquearProyecto(id) {
    const card = document.querySelector(`.kanban-card[data-id="${id}"]`);
    if (card) {
        card.classList.remove('blocked');
        const blockedReason = card.querySelector('.blocked-reason');
        if (blockedReason) {
            blockedReason.remove();
        }
        const blockedBadge = card.querySelector('.blocked-badge');
        if (blockedBadge) {
            blockedBadge.remove();
        }
        showNotification(`Proyecto ${id} desbloqueado`, 'success');
        updateKanbanKPIs();
    }
}

function filtrarKanban() {
    const filterValue = document.getElementById('kanbanFilter')?.value || 'todos';
    const searchValue = document.getElementById('kanbanSearch')?.value.toLowerCase() || '';

    const cards = document.querySelectorAll('.kanban-card');
    cards.forEach(card => {
        let showCard = true;

        // Filtrar por estado
        if (filterValue === 'bloqueados' && !card.classList.contains('blocked')) {
            showCard = false;
        } else if (filterValue === 'riesgo' && !card.classList.contains('at-risk')) {
            showCard = false;
        } else if (filterValue === 'normal' && (card.classList.contains('blocked') || card.classList.contains('at-risk') || card.classList.contains('completed'))) {
            showCard = false;
        }

        // Filtrar por búsqueda
        if (searchValue) {
            const cardText = card.textContent.toLowerCase();
            if (!cardText.includes(searchValue)) {
                showCard = false;
            }
        }

        card.style.display = showCard ? 'block' : 'none';
    });

    updateKanbanCounters();
}

function exportarKanban() {
    showNotification('Generando reporte del tablero Kanban...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Kanban_Proyectos_2026.xlsx', 'success');
    }, 1500);
}

// Extender initViewData para Kanban
const originalInitViewData3 = initViewData;
initViewData = function(viewId) {
    originalInitViewData3(viewId);

    if (viewId === 'implementacion-construccion') {
        setTimeout(() => {
            initKanban();
        }, 100);
    }

    if (viewId === 'dashboard-reportes') {
        initReportes();
    }
};

/* ========================================
   Reportes y Análisis - Funciones
   ======================================== */

function initReportes() {
    console.log('Centro de Reportes inicializado');
}

function generarReporte(tipo) {
    const reporteNombres = {
        'ejecutivo-directorio': 'Reporte Directorio',
        'ejecutivo-comite': 'Presentación Comité Inversiones',
        'ejecutivo-kpis': 'Dashboard KPIs Mensual',
        'ejecutivo-riesgos': 'Reporte de Riesgos',
        'operacional-portafolio': 'Detalle Completo Portafolio',
        'operacional-avance': 'Control de Avance Semanal',
        'operacional-presupuesto': 'Control Presupuestario',
        'operacional-recursos': 'Asignación de Recursos',
        'operacional-hitos': 'Hitos y Entregables',
        'financiero-capex': 'Ejecución CAPEX 2026',
        'financiero-forecast': 'Forecast Trimestral',
        'financiero-roi': 'Análisis ROI Proyectos'
    };

    const formatoPorTipo = {
        'ejecutivo-directorio': 'PDF',
        'ejecutivo-comite': 'PPT',
        'ejecutivo-kpis': 'PDF',
        'ejecutivo-riesgos': 'PDF',
        'operacional-portafolio': 'Excel',
        'operacional-avance': 'Excel',
        'operacional-presupuesto': 'Excel',
        'operacional-recursos': 'Excel',
        'operacional-hitos': 'Excel',
        'financiero-capex': 'Excel',
        'financiero-forecast': 'Excel',
        'financiero-roi': 'PDF'
    };

    const nombre = reporteNombres[tipo] || tipo;
    const formato = formatoPorTipo[tipo] || 'PDF';

    showNotification(`Generando ${nombre}...`, 'info');

    setTimeout(() => {
        const extension = formato.toLowerCase() === 'ppt' ? 'pptx' : formato.toLowerCase();
        showNotification(`Archivo descargado: ${nombre.replace(/\s+/g, '_')}_2026.${extension}`, 'success');

        // Actualizar contador de reportes generados
        const kpiGenerados = document.getElementById('kpiReportesGenerados');
        if (kpiGenerados) {
            kpiGenerados.textContent = parseInt(kpiGenerados.textContent) + 1;
        }
    }, 2000);
}

function exportarGrafico(tipo) {
    const graficoNombres = {
        'estado': 'Distribución por Estado',
        'presupuesto': 'Ejecución Presupuestaria',
        'tendencia': 'Tendencia Proyectos',
        'area': 'Distribución por Área'
    };

    const nombre = graficoNombres[tipo] || tipo;
    showNotification(`Exportando gráfico: ${nombre}...`, 'info');

    setTimeout(() => {
        showNotification(`Gráfico exportado: ${nombre}.png`, 'success');
    }, 1000);
}

function programarReporte() {
    showNotification('Abriendo configuración de reporte programado...', 'info');
    // Aquí se abriría un modal para programar el reporte
}

function verHistorialReportes() {
    // Cambiar a tab de historial
    document.querySelectorAll('#dashboard-reportes .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#dashboard-reportes .tab-content').forEach(c => c.classList.remove('active'));

    const tabHistorial = document.querySelector('[data-tab="rep-historial"]');
    const contentHistorial = document.getElementById('rep-historial');

    if (tabHistorial) tabHistorial.classList.add('active');
    if (contentHistorial) contentHistorial.classList.add('active');

    showNotification('Mostrando historial de reportes', 'info');
}

/* ========================================
   Filtros Avanzados - Portafolio
   ======================================== */

function toggleAdvancedFilters() {
    const panel = document.getElementById('advancedFiltersPanel');
    if (panel) {
        panel.classList.toggle('open');
    }
}

function aplicarFiltrosAvanzados() {
    showNotification('Aplicando filtros...', 'info');

    // Simular filtrado
    setTimeout(() => {
        // Actualizar resumen de resultados
        const numResults = Math.floor(Math.random() * 20) + 5;
        const summaryStats = document.querySelector('.summary-stats');
        if (summaryStats) {
            summaryStats.innerHTML = `
                <span><strong>${numResults}</strong> proyectos encontrados</span>
                <span class="separator">|</span>
                <span>Presupuesto total: <strong>$${(Math.random() * 3 + 1).toFixed(1)}M</strong></span>
                <span class="separator">|</span>
                <span>Promedio ejecución: <strong>${Math.floor(Math.random() * 40 + 40)}%</strong></span>
            `;
        }

        showNotification(`${numResults} proyectos encontrados`, 'success');
    }, 500);
}

function limpiarFiltrosAvanzados() {
    // Limpiar todos los campos
    document.querySelectorAll('#advancedFiltersPanel input[type="text"]').forEach(i => i.value = '');
    document.querySelectorAll('#advancedFiltersPanel input[type="number"]').forEach(i => i.value = '');
    document.querySelectorAll('#advancedFiltersPanel input[type="date"]').forEach(i => i.value = '');
    document.querySelectorAll('#advancedFiltersPanel select').forEach(s => s.selectedIndex = 0);
    document.querySelectorAll('#advancedFiltersPanel input[type="checkbox"]').forEach(c => c.checked = false);

    // Marcar checkboxes de prioridad por defecto
    document.querySelectorAll('input[name="prioridad"]').forEach((c, i) => {
        c.checked = i < 3; // P1, P2, P3
    });

    // Marcar checkboxes de tipo inversión por defecto
    document.querySelectorAll('input[name="tipo-inv"]').forEach((c, i) => {
        c.checked = i < 3;
    });

    // Reset range sliders
    const ejMinSlider = document.getElementById('adv-filter-ejec-min');
    const ejMaxSlider = document.getElementById('adv-filter-ejec-max');
    if (ejMinSlider) ejMinSlider.value = 0;
    if (ejMaxSlider) ejMaxSlider.value = 100;

    updateRangeValues();
    showNotification('Filtros limpiados', 'info');
}

function updateRangeValues() {
    const minVal = document.getElementById('adv-filter-ejec-min')?.value || 0;
    const maxVal = document.getElementById('adv-filter-ejec-max')?.value || 100;

    const minSpan = document.getElementById('ejec-min-val');
    const maxSpan = document.getElementById('ejec-max-val');

    if (minSpan) minSpan.textContent = minVal + '%';
    if (maxSpan) maxSpan.textContent = maxVal + '%';
}

function guardarFiltro() {
    const nombreFiltro = prompt('Nombre para guardar este filtro:');
    if (nombreFiltro) {
        showNotification(`Filtro "${nombreFiltro}" guardado correctamente`, 'success');
    }
}

function cargarFiltroGuardado() {
    showNotification('Cargando filtros guardados...', 'info');
    // Aquí se mostraría un modal con los filtros guardados
}

function aplicarPeriodoPredefinido() {
    const periodo = document.getElementById('adv-filter-periodo')?.value;
    const hoy = new Date();

    const inicioDesde = document.getElementById('adv-filter-inicio-desde');
    const inicioHasta = document.getElementById('adv-filter-inicio-hasta');
    const terminoDesde = document.getElementById('adv-filter-termino-desde');
    const terminoHasta = document.getElementById('adv-filter-termino-hasta');

    if (!periodo) return;

    let desde, hasta;

    switch (periodo) {
        case 'este-mes':
            desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
            break;
        case 'este-trimestre':
            const trimestre = Math.floor(hoy.getMonth() / 3);
            desde = new Date(hoy.getFullYear(), trimestre * 3, 1);
            hasta = new Date(hoy.getFullYear(), trimestre * 3 + 3, 0);
            break;
        case 'este-ano':
            desde = new Date(hoy.getFullYear(), 0, 1);
            hasta = new Date(hoy.getFullYear(), 11, 31);
            break;
        case 'prox-30':
            desde = hoy;
            hasta = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
        case 'prox-90':
            desde = hoy;
            hasta = new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000);
            break;
    }

    if (desde && hasta) {
        if (terminoDesde) terminoDesde.value = desde.toISOString().split('T')[0];
        if (terminoHasta) terminoHasta.value = hasta.toISOString().split('T')[0];
    }
}

function removeFilter(filterName) {
    showNotification(`Filtro ${filterName} eliminado`, 'info');
}

function exportarPortafolio() {
    showNotification('Generando exportación del portafolio...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Portafolio_2026.xlsx', 'success');
    }, 1500);
}

function cambiarVistaPortafolio(vista) {
    showNotification(`Cambiando a vista ${vista}`, 'info');
}

function ordenarPortafolio() {
    const criterio = document.getElementById('sortPortafolio')?.value;
    showNotification(`Ordenando por ${criterio}`, 'info');
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAllProjects');
    const checkboxes = document.querySelectorAll('.project-checkbox');

    checkboxes.forEach(cb => {
        cb.checked = selectAll?.checked || false;
    });
}

function sortTable(column) {
    showNotification(`Ordenando por ${column}`, 'info');
}

function cambiarTamanioPagina() {
    showNotification('Actualizando tamaño de página', 'info');
}

function verProyecto(id) {
    showNotification(`Abriendo detalle del proyecto ${id}`, 'info');
}

// Inicializar eventos de range sliders
document.addEventListener('DOMContentLoaded', function() {
    const ejMinSlider = document.getElementById('adv-filter-ejec-min');
    const ejMaxSlider = document.getElementById('adv-filter-ejec-max');

    if (ejMinSlider) ejMinSlider.addEventListener('input', updateRangeValues);
    if (ejMaxSlider) ejMaxSlider.addEventListener('input', updateRangeValues);

    // Initialize dropdowns and search panel
    initGlobalUI();
});

// ==================== GLOBAL UI FUNCTIONS ====================

function initGlobalUI() {
    // Click outside to close dropdowns
    document.addEventListener('click', function(e) {
        // Close notifications dropdown
        const notifDropdown = document.getElementById('notifications-dropdown');
        const notifBtn = document.querySelector('.notification-btn');
        if (notifDropdown && notifBtn && !notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
            notifDropdown.classList.remove('show');
        }

        // Close user dropdown
        const userDropdown = document.getElementById('user-dropdown');
        const userBtn = document.querySelector('.user-info');
        if (userDropdown && userBtn && !userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });

    // Global search keyboard shortcut (Ctrl+K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleSearchPanel();
        }

        // ESC to close search panel
        if (e.key === 'Escape') {
            closeSearchPanel();
        }
    });
}

// Notifications Dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    const userDropdown = document.getElementById('user-dropdown');

    // Close user dropdown if open
    if (userDropdown) userDropdown.classList.remove('show');

    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function marcarTodasLeidas() {
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));

    // Update badge count
    const badge = document.querySelector('.notification-btn .badge');
    if (badge) badge.textContent = '0';

    showNotification('Todas las notificaciones marcadas como leídas', 'success');
}

function verTodasNotificaciones() {
    closeNotifications();
    showNotification('Abriendo centro de notificaciones...', 'info');
}

function closeNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown) dropdown.classList.remove('show');
}

// User Dropdown
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    const notifDropdown = document.getElementById('notifications-dropdown');

    // Close notifications dropdown if open
    if (notifDropdown) notifDropdown.classList.remove('show');

    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Global Search Panel
function toggleSearchPanel() {
    const panel = document.getElementById('search-panel');
    if (panel) {
        panel.classList.toggle('show');
        if (panel.classList.contains('show')) {
            const input = document.getElementById('global-search-input');
            if (input) input.focus();
        }
    }
}

function closeSearchPanel() {
    const panel = document.getElementById('search-panel');
    if (panel) panel.classList.remove('show');
}

function globalSearch(query) {
    // Simulate search functionality
    console.log('Searching for:', query);
    // In a real implementation, this would filter results
}

// ==================== NUEVO PROYECTO FUNCTIONS ====================

function crearProyecto() {
    const form = document.getElementById('form-nuevo-proyecto');
    if (!form) return;

    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    showNotification('Creando proyecto...', 'info');

    setTimeout(() => {
        closeModal('modal-nuevo-proyecto');
        showNotification('Proyecto PRY-2026-016 creado exitosamente', 'success');
        form.reset();
    }, 1500);
}

// ==================== COMPRAS FUNCTIONS ====================

function crearSolicitudCompra() {
    const form = document.getElementById('form-solicitud-compra');
    if (!form) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    showNotification('Enviando solicitud...', 'info');

    setTimeout(() => {
        closeModal('modal-solicitud-compra');
        showNotification('Solicitud SOL-2026-016 enviada para aprobación', 'success');

        // Update KPI
        const kpi = document.getElementById('kpiSolPendientes');
        if (kpi) kpi.textContent = parseInt(kpi.textContent) + 1;

        form.reset();
    }, 1500);
}

function exportarSolicitudes() {
    showNotification('Exportando solicitudes a Excel...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Solicitudes_Compra_2026.xlsx', 'success');
    }, 2000);
}

function crearContrato() {
    const form = document.getElementById('form-nuevo-contrato');
    if (!form) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    showNotification('Guardando contrato...', 'info');

    setTimeout(() => {
        closeModal('modal-nuevo-contrato');
        showNotification('Contrato CTR-2026-045 registrado exitosamente', 'success');
        form.reset();
    }, 1500);
}

// ==================== REPORTES PERSONALIZADOS ====================

function previsualizarReporte() {
    showNotification('Generando previsualización...', 'info');
    setTimeout(() => {
        showNotification('Previsualización lista en nueva pestaña', 'success');
    }, 2000);
}

function generarReportePersonalizado() {
    showNotification('Generando reporte personalizado...', 'info');
    setTimeout(() => {
        closeModal('modal-reporte-personalizado');
        showNotification('Reporte descargado: Reporte_Personalizado.pdf', 'success');
    }, 3000);
}

function programarReporte() {
    showNotification('Programando envío automático...', 'info');
    setTimeout(() => {
        closeModal('modal-programar-reporte');
        showNotification('Reporte programado para envío semanal', 'success');
    }, 1500);
}

// ==================== SEGUIMIENTO FUNCTIONS ====================

function exportarPresupuesto() {
    showNotification('Exportando datos presupuestarios...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Control_Presupuestario_2026.xlsx', 'success');
    }, 2000);
}

function exportarCronograma() {
    showNotification('Exportando cronograma a PDF...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Gantt_Portafolio_2026.pdf', 'success');
    }, 2000);
}

function exportarRiesgos() {
    showNotification('Exportando matriz de riesgos...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Matriz_Riesgos_2026.xlsx', 'success');
    }, 2000);
}

// ==================== DOCUMENT FUNCTIONS ====================

function toggleFolder(header) {
    const folderItem = header.closest('.folder-item');
    if (folderItem) {
        folderItem.classList.toggle('expanded');

        // Update icon
        const icon = header.querySelector('.fa-folder, .fa-folder-open');
        if (icon) {
            if (folderItem.classList.contains('expanded')) {
                icon.classList.remove('fa-folder');
                icon.classList.add('fa-folder-open');
            } else {
                icon.classList.remove('fa-folder-open');
                icon.classList.add('fa-folder');
            }
        }
    }
}

function filterByType(type) {
    showNotification(`Filtrando documentos por tipo: ${type}`, 'info');
}

// ==================== CONFIGURATION FUNCTIONS ====================

function exportarMatriz() {
    showNotification('Exportando matriz de permisos...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: Matriz_Permisos.xlsx', 'success');
    }, 2000);
}

function guardarMatrizPermisos() {
    showNotification('Guardando cambios en permisos...', 'info');
    setTimeout(() => {
        showNotification('Matriz de permisos actualizada', 'success');
    }, 1500);
}

// ==================== HISTORIA FUNCTIONS ====================

function reactivarProyecto(codigo) {
    showNotification(`Reactivando proyecto ${codigo}...`, 'info');
    setTimeout(() => {
        showNotification(`Proyecto ${codigo} reactivado. Movido a portafolio activo.`, 'success');
    }, 1500);
}

function cancelarProyecto(codigo) {
    if (confirm(`¿Está seguro de cancelar definitivamente el proyecto ${codigo}?`)) {
        showNotification(`Cancelando proyecto ${codigo}...`, 'warning');
        setTimeout(() => {
            showNotification(`Proyecto ${codigo} cancelado y movido a archivo histórico`, 'info');
        }, 1500);
    }
}

// ==================== MISC FUNCTIONS ====================

function editarProyecto() {
    showNotification('Abriendo modo de edición...', 'info');
}

function openNuevoProyecto() {
    openModal('modal-nuevo-proyecto');
}

// Add click handlers to header buttons
document.addEventListener('DOMContentLoaded', function() {
    // Notification button
    const notifBtn = document.querySelector('.notification-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleNotifications();
        });
    }

    // User menu button
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.style.cursor = 'pointer';
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleUserMenu();
        });
    }

    // Search button
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            toggleSearchPanel();
            this.blur();
        });
    }
});
