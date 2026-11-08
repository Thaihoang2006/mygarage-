/**
 * MyGarage – Personal Model Collection Manager
 * Frontend Application Logic (Pure JavaScript)
 */

// ============================================================================
// CONFIGURATION & API BASE URL RESOLVER
// ============================================================================
const getApiBaseUrl = () => {
    // If opened directly from filesystem (file://), target localhost:5000
    if (window.location.protocol === 'file:') {
        return 'http://127.0.0.1:5000';
    }
    // In Docker / Nginx / Kubernetes, relative path handles reverse-proxy transparently
    return '';
};

const API_BASE = getApiBaseUrl();

// App State
const state = {
    currentView: 'dashboard',
    models: [],
    stats: null,
    categories: ['Car', 'Gundam', 'Other'],
    activeCategory: 'all',
    searchQuery: '',
    selectedBrand: 'all',
    sortBy: 'newest',
    selectedModelId: null,
    charts: {
        category: null,
        brand: null
    }
};

// ============================================================================
// DOM ELEMENTS CACHE
// ============================================================================
const dom = {
    // Navigation & Views
    navLinks: document.querySelectorAll('.nav-link'),
    views: document.querySelectorAll('.content-view'),
    currentViewCrumb: document.getElementById('currentViewCrumb'),
    navCountBadge: document.getElementById('navCountBadge'),
    sidebarTotalValue: document.getElementById('sidebarTotalValue'),
    systemStatusDot: document.getElementById('systemStatusDot'),
    systemStatusText: document.getElementById('systemStatusText'),
    refreshDataBtn: document.getElementById('refreshDataBtn'),
    topNavAddBtn: document.getElementById('topNavAddBtn'),
    quickAddMobileBtn: document.getElementById('quickAddMobileBtn'),
    collectionAddBtn: document.getElementById('collectionAddBtn'),
    viewAllRecentBtn: document.getElementById('viewAllRecentBtn'),

    // Sidebar Mobile Drawer
    sidebar: document.getElementById('sidebar'),
    sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),

    // Dashboard Elements
    statTotalCount: document.getElementById('statTotalCount'),
    statCarCount: document.getElementById('statCarCount'),
    statCarPercent: document.getElementById('statCarPercent'),
    statGundamCount: document.getElementById('statGundamCount'),
    statGundamPercent: document.getElementById('statGundamPercent'),
    statOtherCount: document.getElementById('statOtherCount'),
    statOtherPercent: document.getElementById('statOtherPercent'),
    statTotalValue: document.getElementById('statTotalValue'),
    recentModelsTableBody: document.getElementById('recentModelsTableBody'),

    // Collection Elements
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    categoryPills: document.querySelectorAll('.pill-btn'),
    brandFilterSelect: document.getElementById('brandFilterSelect'),
    sortSelect: document.getElementById('sortSelect'),
    collectionResultsCount: document.getElementById('collectionResultsCount'),
    modelsGrid: document.getElementById('modelsGrid'),
    emptyCollectionState: document.getElementById('emptyCollectionState'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Add Model Form Elements
    addModelForm: document.getElementById('addModelForm'),
    addNameInput: document.getElementById('addNameInput'),
    addCategorySelect: document.getElementById('addCategorySelect'),
    addBrandInput: document.getElementById('addBrandInput'),
    addScaleInput: document.getElementById('addScaleInput'),
    addPriceInput: document.getElementById('addPriceInput'),
    addPurchaseDateInput: document.getElementById('addPurchaseDateInput'),
    addDescriptionInput: document.getElementById('addDescriptionInput'),
    addImageUrlInput: document.getElementById('addImageUrlInput'),
    addImageInput: document.getElementById('addImageInput'),
    addCameraInput: document.getElementById('addCameraInput'),
    addDropzone: document.getElementById('addDropzone'),
    addDropzoneContent: document.getElementById('addDropzoneContent'),
    addPreviewContainer: document.getElementById('addPreviewContainer'),
    addPreviewImg: document.getElementById('addPreviewImg'),
    removeAddImgBtn: document.getElementById('removeAddImgBtn'),
    chooseFileBtn: document.getElementById('chooseFileBtn'),
    openCameraBtn: document.getElementById('openCameraBtn'),
    cancelAddBtn: document.getElementById('cancelAddBtn'),
    submitAddBtn: document.getElementById('submitAddBtn'),

    // Details Modal
    detailsModal: document.getElementById('detailsModal'),
    closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
    detailCloseBtn: document.getElementById('detailCloseBtn'),
    detailCategoryBadge: document.getElementById('detailCategoryBadge'),
    detailModelTitle: document.getElementById('detailModelTitle'),
    detailImg: document.getElementById('detailImg'),
    detailBrand: document.getElementById('detailBrand'),
    detailScale: document.getElementById('detailScale'),
    detailPrice: document.getElementById('detailPrice'),
    detailPurchaseDate: document.getElementById('detailPurchaseDate'),
    detailCreatedAt: document.getElementById('detailCreatedAt'),
    detailDescription: document.getElementById('detailDescription'),
    detailEditBtn: document.getElementById('detailEditBtn'),
    detailDeleteBtn: document.getElementById('detailDeleteBtn'),

    // Edit Modal
    editModal: document.getElementById('editModal'),
    closeEditModalBtn: document.getElementById('closeEditModalBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    editModelForm: document.getElementById('editModelForm'),
    editModelId: document.getElementById('editModelId'),
    editNameInput: document.getElementById('editNameInput'),
    editCategorySelect: document.getElementById('editCategorySelect'),
    editBrandInput: document.getElementById('editBrandInput'),
    editScaleInput: document.getElementById('editScaleInput'),
    editPriceInput: document.getElementById('editPriceInput'),
    editPurchaseDateInput: document.getElementById('editPurchaseDateInput'),
    editDescriptionInput: document.getElementById('editDescriptionInput'),
    editImageUrlInput: document.getElementById('editImageUrlInput'),
    editImageInput: document.getElementById('editImageInput'),
    editCameraInput: document.getElementById('editCameraInput'),
    editPreviewImg: document.getElementById('editPreviewImg'),
    editChooseFileBtn: document.getElementById('editChooseFileBtn'),
    editCameraBtn: document.getElementById('editCameraBtn'),

    // Confirm Delete Modal
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    deleteTargetName: document.getElementById('deleteTargetName'),
    cancelDeleteConfirmBtn: document.getElementById('cancelDeleteConfirmBtn'),
    confirmDeleteActionBtn: document.getElementById('confirmDeleteActionBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'Chưa có giá';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const sanitizeImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    if (url.startsWith('/uploads/')) {
        return `${API_BASE}${url}`;
    }
    return url;
};

// Toast Notifications
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
        <span class="toast-icon"><i class="fa-solid ${icon}"></i></span>
        <span class="toast-message">${message}</span>
    `;

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(60px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

// ============================================================================
// NAVIGATION & VIEW SWITCHING
// ============================================================================
const navigateTo = (viewName) => {
    state.currentView = viewName;

    // Update active nav link
    dom.navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update active section
    dom.views.forEach(view => {
        if (view.id === `view-${viewName}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Update Breadcrumb
    const titles = {
        'dashboard': 'Dashboard',
        'collection': 'Bộ Sưu Tập',
        'add-model': 'Thêm Mô Hình'
    };
    dom.currentViewCrumb.textContent = titles[viewName] || 'Dashboard';

    // Close mobile sidebar if open
    closeMobileSidebar();

    // Trigger data fetch if needed
    if (viewName === 'dashboard') {
        loadDashboardStats();
    } else if (viewName === 'collection') {
        loadModels();
    }
};

const openMobileSidebar = () => {
    dom.sidebar.classList.add('open');
    dom.sidebarOverlay.classList.add('show');
};

const closeMobileSidebar = () => {
    dom.sidebar.classList.remove('open');
    dom.sidebarOverlay.classList.remove('show');
};

// ============================================================================
// SYSTEM READINESS & HEALTH CHECK
// ============================================================================
const checkSystemReadiness = async () => {
    try {
        const res = await fetch(`${API_BASE}/readyz`);
        if (res.ok) {
            dom.systemStatusDot.className = 'status-dot online';
            dom.systemStatusText.textContent = 'MySQL & Backend Sẵn sàng';
        } else {
            dom.systemStatusDot.className = 'status-dot';
            dom.systemStatusDot.style.background = '#f59e0b';
            dom.systemStatusText.textContent = 'Đang chờ Database...';
        }
    } catch {
        dom.systemStatusDot.className = 'status-dot';
        dom.systemStatusDot.style.background = '#e63946';
        dom.systemStatusText.textContent = 'Chưa kết nối Backend';
    }
};

// ============================================================================
// DASHBOARD STATS & CHARTS
// ============================================================================
const loadDashboardStats = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/stats`);
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        const data = json.data;
        state.stats = data;

        // Update Stat Numbers
        dom.statTotalCount.textContent = data.total;
        dom.navCountBadge.textContent = data.total;
        dom.statCarCount.textContent = data.total_cars;
        dom.statGundamCount.textContent = data.total_gundams;
        dom.statOtherCount.textContent = data.total_others;

        // Percentages
        const total = data.total || 1;
        dom.statCarPercent.textContent = `${Math.round((data.total_cars / total) * 100)}%`;
        dom.statGundamPercent.textContent = `${Math.round((data.total_gundams / total) * 100)}%`;
        dom.statOtherPercent.textContent = `${Math.round((data.total_others / total) * 100)}%`;

        // Value
        const formattedValue = formatCurrency(data.total_value);
        dom.statTotalValue.textContent = formattedValue;
        dom.sidebarTotalValue.textContent = formattedValue;

        // Render Charts
        renderCategoryChart(data.categories);
        renderBrandChart(data.top_brands);

        // Render Recent Models
        renderRecentModels(data.recent_models);

        // Populate Brand Dropdown for Collection Filter
        updateBrandFilterOptions(data.available_brands);

    } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
    }
};

// Category Donut Chart (Chart.js)
const renderCategoryChart = (categories) => {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (state.charts.category) {
        state.charts.category.destroy();
    }

    const labels = ['Xe (Car)', 'Gundam', 'Khác'];
    const counts = [categories.Car || 0, categories.Gundam || 0, categories.Other || 0];

    state.charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: [
                    '#18352B', // Racing Green
                    '#641E2A', // Polo Burgundy
                    '#334155'  // Dark Slate Other
                ],
                borderColor: '#0a1310',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#C9B99A',
                        font: { family: "'Outfit', sans-serif", size: 12 },
                        padding: 16
                    }
                }
            },
            cutout: '70%'
        }
    });
};

// Brand Bar Chart (Chart.js)
const renderBrandChart = (topBrands) => {
    const ctx = document.getElementById('brandChart');
    if (!ctx) return;

    if (state.charts.brand) {
        state.charts.brand.destroy();
    }

    const labels = (topBrands && topBrands.length) ? topBrands.map(b => b.brand) : ['Chưa có'];
    const counts = (topBrands && topBrands.length) ? topBrands.map(b => b.count) : [0];

    state.charts.brand = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng mô hình',
                data: counts,
                backgroundColor: 'rgba(201, 185, 154, 0.45)',
                borderColor: '#C9B99A',
                borderWidth: 1.5,
                borderRadius: 4,
                hoverBackgroundColor: '#641E2A'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: '#8e9e95', font: { family: "'Outfit', sans-serif", size: 11 } },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: '#8e9e95', stepSize: 1, font: { family: "'Outfit', sans-serif", size: 11 } },
                    grid: { color: 'rgba(201, 185, 154, 0.08)' },
                    beginAtZero: true
                }
            }
        }
    });
};

// Recent Models Table Rendering
const renderRecentModels = (recentList) => {
    if (!recentList || recentList.length === 0) {
        dom.recentModelsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4" style="color: var(--text-dim);">Chưa có mô hình nào trong bộ sưu tập.</td>
            </tr>
        `;
        return;
    }

    dom.recentModelsTableBody.innerHTML = recentList.map(item => `
        <tr>
            <td>
                <img src="${sanitizeImageUrl(item.image_url)}" class="table-thumb" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=100&q=80'">
            </td>
            <td><strong>${item.name}</strong></td>
            <td><span class="badge badge-${item.category.toLowerCase()}">${item.category}</span></td>
            <td class="accent-tan">${item.brand || '—'}</td>
            <td>${item.scale || '—'}</td>
            <td class="accent-tan font-bold">${formatCurrency(item.price)}</td>
            <td style="color: var(--text-dim); font-size: 0.8rem;">${formatDate(item.created_at)}</td>
            <td>
                <button class="btn btn-outline btn-sm view-detail-btn" data-id="${item.id}">
                    <i class="fa-solid fa-eye"></i> Chi tiết
                </button>
            </td>
        </tr>
    `).join('');

    // Attach event listeners to "Chi tiết" buttons
    dom.recentModelsTableBody.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'), 10);
            openModelDetails(id);
        });
    });
};

// ============================================================================
// COLLECTION VIEW: FETCHING, FILTERING & RENDERING
// ============================================================================
const updateBrandFilterOptions = (brands) => {
    if (!brands || !dom.brandFilterSelect) return;
    const currentVal = dom.brandFilterSelect.value;
    dom.brandFilterSelect.innerHTML = '<option value="all">Tất cả thương hiệu</option>';
    brands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        dom.brandFilterSelect.appendChild(opt);
    });
    if (brands.includes(currentVal)) {
        dom.brandFilterSelect.value = currentVal;
    }
};

const loadModels = async () => {
    try {
        const params = new URLSearchParams();
        if (state.searchQuery) params.append('search', state.searchQuery);
        if (state.activeCategory && state.activeCategory !== 'all') params.append('category', state.activeCategory);
        if (state.selectedBrand && state.selectedBrand !== 'all') params.append('brand', state.selectedBrand);
        if (state.sortBy) params.append('sort', state.sortBy);

        const res = await fetch(`${API_BASE}/api/models?${params.toString()}`);
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        state.models = json.data;
        renderModelsGrid(state.models);
        dom.collectionResultsCount.textContent = json.count;
        dom.navCountBadge.textContent = json.count;

    } catch (err) {
        console.error('Lỗi khi tải danh sách mô hình:', err);
        showToast('Không thể kết nối đến máy chủ MySQL', 'error');
    }
};

const renderModelsGrid = (models) => {
    if (!models || models.length === 0) {
        dom.modelsGrid.innerHTML = '';
        dom.emptyCollectionState.classList.remove('hidden');
        return;
    }

    dom.emptyCollectionState.classList.add('hidden');

    dom.modelsGrid.innerHTML = models.map(item => `
        <div class="model-card" data-id="${item.id}">
            <div class="card-img-wrap">
                <img class="card-img" src="${sanitizeImageUrl(item.image_url)}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'">
                <div class="card-img-overlay"></div>
                <div class="card-badge-top">
                    <span class="badge badge-${item.category.toLowerCase()}">${item.category}</span>
                </div>
                ${item.scale ? `<span class="badge-scale">${item.scale}</span>` : ''}
            </div>

            <div class="card-content">
                <span class="card-brand">${item.brand || 'CHƯA RÕ HÃNG'}</span>
                <h4 class="card-model-name" title="${item.name}">${item.name}</h4>

                <div class="card-footer-row">
                    <div class="card-price-wrap">
                        <span class="card-price-label">Giá mua</span>
                        <span class="card-price-value">${formatCurrency(item.price)}</span>
                    </div>
                    <button class="btn btn-outline btn-sm view-detail-card-btn" data-id="${item.id}">
                        Chi tiết <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach click events on detail buttons
    dom.modelsGrid.querySelectorAll('.view-detail-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'), 10);
            openModelDetails(id);
        });
    });

    // Also clicking whole card opens details
    dom.modelsGrid.querySelectorAll('.model-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.getAttribute('data-id'), 10);
            openModelDetails(id);
        });
    });
};

// ============================================================================
// IMAGE UPLOAD & CAMERA PREVIEW LOGIC
// ============================================================================
let addSelectedFile = null;
let editSelectedFile = null;

const setupDropzone = () => {
    // Add Dropzone click triggers
    dom.chooseFileBtn.addEventListener('click', () => dom.addImageInput.click());
    dom.openCameraBtn.addEventListener('click', () => dom.addCameraInput.click());

    // File input changes
    dom.addImageInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0], 'add'));
    dom.addCameraInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0], 'add'));

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(name => {
        dom.addDropzone.addEventListener(name, (e) => {
            e.preventDefault();
            dom.addDropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(name => {
        dom.addDropzone.addEventListener(name, (e) => {
            e.preventDefault();
            dom.addDropzone.classList.remove('dragover');
        });
    });

    dom.addDropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelection(file, 'add');
    });

    // Remove preview
    dom.removeAddImgBtn.addEventListener('click', () => {
        addSelectedFile = null;
        dom.addImageInput.value = '';
        dom.addCameraInput.value = '';
        dom.addPreviewImg.src = '';
        dom.addPreviewContainer.classList.add('hidden');
        dom.addDropzoneContent.classList.remove('hidden');
    });

    // Edit modal file inputs
    dom.editChooseFileBtn.addEventListener('click', () => dom.editImageInput.click());
    dom.editCameraBtn.addEventListener('click', () => dom.editCameraInput.click());

    dom.editImageInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0], 'edit'));
    dom.editCameraInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0], 'edit'));
};

const handleFileSelection = (file, mode = 'add') => {
    if (!file) return;

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.', 'error');
        return;
    }

    // Validate extension
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WebP.', 'error');
        return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (mode === 'add') {
        addSelectedFile = file;
        dom.addPreviewImg.src = objectUrl;
        dom.addDropzoneContent.classList.add('hidden');
        dom.addPreviewContainer.classList.remove('hidden');
        // Clear external URL input if file is picked
        dom.addImageUrlInput.value = '';
    } else {
        editSelectedFile = file;
        dom.editPreviewImg.src = objectUrl;
        dom.editImageUrlInput.value = '';
    }
};

// ============================================================================
// ADD MODEL FORM SUBMISSION
// ============================================================================
const handleAddModelSubmit = async (e) => {
    e.preventDefault();

    const name = dom.addNameInput.value.trim();
    if (!name) {
        showToast('Vui lòng nhập tên mô hình!', 'error');
        dom.addNameInput.focus();
        return;
    }

    dom.submitAddBtn.disabled = true;
    dom.submitAddBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', dom.addCategorySelect.value);
        formData.append('brand', dom.addBrandInput.value.trim());
        formData.append('scale', dom.addScaleInput.value.trim());
        if (dom.addPriceInput.value) formData.append('price', dom.addPriceInput.value);
        if (dom.addPurchaseDateInput.value) formData.append('purchase_date', dom.addPurchaseDateInput.value);
        formData.append('description', dom.addDescriptionInput.value.trim());

        if (addSelectedFile) {
            formData.append('image', addSelectedFile);
        } else if (dom.addImageUrlInput.value.trim()) {
            formData.append('image_url', dom.addImageUrlInput.value.trim());
        }

        const res = await fetch(`${API_BASE}/api/models`, {
            method: 'POST',
            body: formData
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast('Đã thêm mô hình mới vào garage thành công!', 'success');

        // Reset form
        dom.addModelForm.reset();
        dom.removeAddImgBtn.click();

        // Switch to collection view and refresh
        navigateTo('collection');

    } catch (err) {
        console.error('Lỗi khi thêm mô hình:', err);
        showToast(err.message || 'Không thể lưu mô hình', 'error');
    } finally {
        dom.submitAddBtn.disabled = false;
        dom.submitAddBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Mô Hình Vào Garage';
    }
};

// ============================================================================
// MODEL DETAILS MODAL (VIEW 4)
// ============================================================================
const openModelDetails = async (modelId) => {
    state.selectedModelId = modelId;

    try {
        const res = await fetch(`${API_BASE}/api/models/${modelId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const item = json.data;

        // Populate detail modal fields
        dom.detailModelTitle.textContent = item.name;
        dom.detailCategoryBadge.textContent = item.category;
        dom.detailCategoryBadge.className = `badge badge-${item.category.toLowerCase()}`;
        dom.detailImg.src = sanitizeImageUrl(item.image_url);
        dom.detailBrand.textContent = item.brand || '—';
        dom.detailScale.textContent = item.scale || '—';
        dom.detailPrice.textContent = formatCurrency(item.price);
        dom.detailPurchaseDate.textContent = formatDate(item.purchase_date);
        dom.detailCreatedAt.textContent = formatDate(item.created_at);
        dom.detailDescription.textContent = item.description || 'Chưa có ghi chú mô tả nào.';

        // Show modal
        dom.detailsModal.classList.add('show');
    } catch (err) {
        console.error('Lỗi khi mở chi tiết:', err);
        showToast('Không thể tải thông tin mô hình', 'error');
    }
};

const closeDetailsModal = () => {
    dom.detailsModal.classList.remove('show');
};

// ============================================================================
// EDIT MODEL MODAL
// ============================================================================
const openEditModal = async () => {
    const modelId = state.selectedModelId;
    if (!modelId) return;

    try {
        const res = await fetch(`${API_BASE}/api/models/${modelId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const item = json.data;

        // Populate edit form fields
        dom.editModelId.value = item.id;
        dom.editNameInput.value = item.name || '';
        dom.editCategorySelect.value = item.category || 'Car';
        dom.editBrandInput.value = item.brand || '';
        dom.editScaleInput.value = item.scale || '';
        dom.editPriceInput.value = item.price !== null ? item.price : '';
        dom.editPurchaseDateInput.value = item.purchase_date || '';
        dom.editDescriptionInput.value = item.description || '';
        dom.editImageUrlInput.value = (item.image_url && !item.image_url.startsWith('/uploads/')) ? item.image_url : '';

        // Reset selected file & show current preview
        editSelectedFile = null;
        dom.editPreviewImg.src = sanitizeImageUrl(item.image_url);

        // Hide details modal, open edit modal
        closeDetailsModal();
        dom.editModal.classList.add('show');

    } catch (err) {
        console.error('Lỗi khi mở form sửa:', err);
        showToast('Không thể chuẩn bị form chỉnh sửa', 'error');
    }
};

const closeEditModal = () => {
    dom.editModal.classList.remove('show');
};

const handleEditModelSubmit = async (e) => {
    e.preventDefault();

    const modelId = dom.editModelId.value;
    const name = dom.editNameInput.value.trim();

    if (!name) {
        showToast('Tên mô hình không được để trống!', 'error');
        dom.editNameInput.focus();
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', dom.editCategorySelect.value);
        formData.append('brand', dom.editBrandInput.value.trim());
        formData.append('scale', dom.editScaleInput.value.trim());
        formData.append('price', dom.editPriceInput.value || '');
        formData.append('purchase_date', dom.editPurchaseDateInput.value || '');
        formData.append('description', dom.editDescriptionInput.value.trim());

        if (editSelectedFile) {
            formData.append('image', editSelectedFile);
        } else if (dom.editImageUrlInput.value.trim()) {
            formData.append('image_url', dom.editImageUrlInput.value.trim());
        }

        const res = await fetch(`${API_BASE}/api/models/${modelId}`, {
            method: 'PUT',
            body: formData
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast('Cập nhật mô hình thành công!', 'success');
        closeEditModal();

        // Refresh views
        if (state.currentView === 'dashboard') loadDashboardStats();
        if (state.currentView === 'collection') loadModels();

        // Re-open updated details
        openModelDetails(modelId);

    } catch (err) {
        console.error('Lỗi khi cập nhật mô hình:', err);
        showToast(err.message || 'Lỗi khi cập nhật', 'error');
    }
};

// ============================================================================
// DELETE MODEL CONFIRMATION
// ============================================================================
const openDeleteConfirmModal = () => {
    const item = state.models.find(m => m.id === state.selectedModelId);
    dom.deleteTargetName.textContent = item ? `"${item.name}"` : 'này';
    dom.deleteConfirmModal.classList.add('show');
};

const closeDeleteConfirmModal = () => {
    dom.deleteConfirmModal.classList.remove('show');
};

const handleConfirmDelete = async () => {
    const modelId = state.selectedModelId;
    if (!modelId) return;

    try {
        const res = await fetch(`${API_BASE}/api/models/${modelId}`, {
            method: 'DELETE'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(json.message || 'Đã xóa mô hình khỏi garage', 'success');
        closeDeleteConfirmModal();
        closeDetailsModal();

        // Reload views
        loadDashboardStats();
        loadModels();

    } catch (err) {
        console.error('Lỗi khi xóa mô hình:', err);
        showToast(err.message || 'Không thể xóa mô hình', 'error');
    }
};

// ============================================================================
// SEARCH & FILTER EVENTS
// ============================================================================
const setupFilterEvents = () => {
    let debounceTimer;

    // Search Input
    dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        dom.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            loadModels();
        }, 300);
    });

    // Clear Search Button
    dom.clearSearchBtn.addEventListener('click', () => {
        dom.searchInput.value = '';
        state.searchQuery = '';
        dom.clearSearchBtn.style.display = 'none';
        loadModels();
    });

    // Category Filter Pills
    dom.categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            dom.categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeCategory = pill.getAttribute('data-category');
            loadModels();
        });
    });

    // Brand Select
    dom.brandFilterSelect.addEventListener('change', (e) => {
        state.selectedBrand = e.target.value;
        loadModels();
    });

    // Sort Select
    dom.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        loadModels();
    });

    // Reset Filters
    dom.resetFiltersBtn.addEventListener('click', () => {
        dom.searchInput.value = '';
        state.searchQuery = '';
        dom.clearSearchBtn.style.display = 'none';

        dom.categoryPills.forEach(p => p.classList.remove('active'));
        document.querySelector('.pill-btn[data-category="all"]').classList.add('active');
        state.activeCategory = 'all';

        dom.brandFilterSelect.value = 'all';
        state.selectedBrand = 'all';

        dom.sortSelect.value = 'newest';
        state.sortBy = 'newest';

        loadModels();
    });
};

// ============================================================================
// GLOBAL EVENT LISTENERS INITIALIZATION
// ============================================================================
const initEventListeners = () => {
    // Nav Links (Sidebar)
    dom.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            navigateTo(viewName);
        });
    });

    // Top action buttons
    dom.refreshDataBtn.addEventListener('click', () => {
        showToast('Đang làm mới dữ liệu...', 'info');
        loadDashboardStats();
        if (state.currentView === 'collection') loadModels();
        checkSystemReadiness();
    });

    dom.topNavAddBtn.addEventListener('click', () => navigateTo('add-model'));
    dom.quickAddMobileBtn.addEventListener('click', () => navigateTo('add-model'));
    dom.collectionAddBtn.addEventListener('click', () => navigateTo('add-model'));
    dom.viewAllRecentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('collection');
    });

    // Mobile Sidebar Drawer
    dom.sidebarToggleBtn.addEventListener('click', openMobileSidebar);
    dom.sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // Cancel Add Form
    dom.cancelAddBtn.addEventListener('click', () => navigateTo('collection'));

    // Forms submission
    dom.addModelForm.addEventListener('submit', handleAddModelSubmit);
    dom.editModelForm.addEventListener('submit', handleEditModelSubmit);

    // Details Modal
    dom.closeDetailModalBtn.addEventListener('click', closeDetailsModal);
    dom.detailCloseBtn.addEventListener('click', closeDetailsModal);
    dom.detailEditBtn.addEventListener('click', openEditModal);
    dom.detailDeleteBtn.addEventListener('click', openDeleteConfirmModal);

    // Edit Modal
    dom.closeEditModalBtn.addEventListener('click', closeEditModal);
    dom.cancelEditBtn.addEventListener('click', closeEditModal);

    // Delete Confirm Modal
    dom.cancelDeleteConfirmBtn.addEventListener('click', closeDeleteConfirmModal);
    dom.confirmDeleteActionBtn.addEventListener('click', handleConfirmDelete);

    // Close modals on clicking outside
    [dom.detailsModal, dom.editModal, dom.deleteConfirmModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Keyboard Shortcuts (Escape to close modals)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetailsModal();
            closeEditModal();
            closeDeleteConfirmModal();
            closeMobileSidebar();
        }
    });

    // Initialize Dropzone
    setupDropzone();

    // Initialize Search & Filter
    setupFilterEvents();
};

// ============================================================================
// APPLICATION BOOTSTRAP
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkSystemReadiness();
    loadDashboardStats();
    loadModels();

    // Periodic system readiness ping (every 30 seconds)
    setInterval(checkSystemReadiness, 30000);
});
