/**
 * MyGarage – Personal Model Collection Manager
 * Frontend Application Logic (Pure JavaScript)
 * Theme: Pastel Aesthetic (Palette -02)
 * Features:
 *   - Bilingual English / Vietnamese Toggle
 *   - Corner Triangle Category Badges with Icons (Car, Gundam, Other)
 *   - Full REST API Client & Auth Management
 */

// ============================================================================
// CONFIGURATION & API BASE URL RESOLVER
// ============================================================================
const getApiBaseUrl = () => {
    if (window.location.protocol === 'file:') {
        return 'http://127.0.0.1:5000';
    }
    return '';
};

const API_BASE = getApiBaseUrl();

// ============================================================================
// BILINGUAL TRANSLATION DICTIONARY (VI / EN)
// ============================================================================
const i18n = {
    vi: {
        tagline: 'COLLECTION MANAGER',
        navDashboard: 'Dashboard',
        navCollection: 'Bộ Sưu Tập',
        navAddModel: 'Thêm Mô Hình',
        crumbOverview: 'Tổng quan',
        adminRole: 'Quản trị viên',
        login: 'Đăng Nhập',
        logout: 'Đăng xuất',
        systemReady: 'Hệ thống sẵn sàng',
        systemConnecting: 'Đang kết nối database...',
        systemOffline: 'Chưa kết nối backend',
        estValue: 'Ước tính giá trị',
        btnTopAdd: 'Thêm Mô Hình',
        dashboardTitle: 'Bảng Thống Kê Tổng Quan',
        dashboardSubtitle: 'Theo dõi quy mô, phân loại và giá trị bộ sưu tập mô hình cá nhân',
        statTotalModels: 'Tổng Số Mô Hình',
        statCars: 'Mô Hình Xe (Car)',
        statGundams: 'Mô Hình Gundam',
        statOthers: 'Mô Hình Khác',
        statTotalValue: 'Tổng Giá Trị Ước Tính',
        unitModels: 'mô hình',
        chartCategory: 'Phân Bố Theo Danh Mục',
        chartBrand: 'Thương Hiệu Hàng Đầu',
        recentAdditions: 'Mô Hình Mới Thêm Gần Đây',
        viewAll: 'Xem tất cả',
        thImage: 'Ảnh',
        thName: 'Tên Mô Hình',
        thCategory: 'Danh Mục',
        thBrand: 'Hãng',
        thScale: 'Tỷ Lệ',
        thPrice: 'Giá Mua',
        thDate: 'Ngày Thêm',
        thAction: 'Thao Tác',
        loading: 'Đang tải dữ liệu...',
        collectionTitle: 'Bộ Sưu Tập Mô Hình',
        collectionSubtitle: 'Toàn bộ mô hình đã được lưu trữ trong garage của bạn',
        btnAddModel: 'Thêm Mô Hình Mới',
        searchPlaceholder: 'Tìm theo tên mô hình, hãng sản xuất...',
        catAll: 'Tất cả',
        catCars: 'Xe (Car)',
        catGundam: 'Gundam',
        catOther: 'Khác',
        labelBrand: 'Hãng:',
        optAllBrands: 'Tất cả thương hiệu',
        labelSort: 'Sắp xếp:',
        sortNewest: 'Mới thêm gần đây',
        sortOldest: 'Cũ nhất',
        sortNameAsc: 'Tên (A → Z)',
        sortNameDesc: 'Tên (Z → A)',
        sortPriceDesc: 'Giá cao nhất',
        sortPriceAsc: 'Giá thấp nhất',
        modelsFound: 'mô hình tìm thấy',
        priceLabel: 'Giá mua',
        btnDetail: 'Chi tiết',
        emptyTitle: 'Không tìm thấy mô hình nào',
        emptyDesc: 'Không có mô hình nào khớp với bộ lọc hoặc garage của bạn đang trống.',
        resetFilters: 'Đặt Lại Bộ Lọc',
        addTitle: 'Thêm Mô Hình Mới',
        addSubtitle: 'Nhập thông số, đính kèm hình ảnh hoặc chụp trực tiếp từ camera điện thoại',
        fieldImage: 'Hình Ảnh Mô Hình',
        dropzoneTitle: 'Kéo & thả ảnh vào đây',
        dropzoneSubtitle: 'Hỗ trợ JPG, PNG, WebP (Tối đa 5 MB)',
        btnChooseFile: 'Chọn từ máy',
        btnCamera: 'Chụp ảnh',
        fieldImageUrlSub: 'Hoặc dán đường link ảnh (URL online)',
        fieldName: 'Tên Mô Hình',
        fieldCategory: 'Danh Mục',
        optCar: 'Mô hình Xe (Car)',
        optGundam: 'Mô hình Gundam',
        optOther: 'Mô hình Khác (Other)',
        fieldBrand: 'Hãng Sản Xuất',
        fieldScale: 'Tỷ Lệ / Cấp Độ (Scale/Grade)',
        fieldPrice: 'Giá Mua (VNĐ)',
        fieldPurchaseDate: 'Ngày Mua',
        fieldDescription: 'Ghi Chú / Mô Tả Chi Tiết',
        btnCancel: 'Hủy Bỏ',
        btnSaveModel: 'Lưu Mô Hình Vào Garage',
        removeImg: 'Gỡ ảnh',
        loginModalTitle: 'Đăng Nhập Garage',
        loginModalSubtitle: 'Truy cập quyền quản trị bộ sưu tập mô hình',
        loginUsernameLabel: 'Tên đăng nhập hoặc Email',
        loginPasswordLabel: 'Mật khẩu',
        rememberMe: 'Ghi nhớ đăng nhập',
        forgotPassword: 'Quên mật khẩu?',
        btnLoginAction: 'Đăng Nhập',
        demoAccountLabel: 'Tài khoản Demo mẫu:',
        btnQuickFill: 'Điền Nhanh',
        btnGuestMode: 'Tiếp tục duyệt ở chế độ khách',
        detailModalTitle: 'Chi Tiết Mô Hình',
        specBrand: 'Thương hiệu:',
        specScale: 'Tỷ lệ / Cấp độ:',
        specPrice: 'Giá mua:',
        specPurchaseDate: 'Ngày mua:',
        specCreated: 'Ngày thêm:',
        specNotes: 'Ghi Chú & Mô Tả',
        btnDeleteModel: 'Xóa Mô Hình',
        btnClose: 'Đóng',
        btnEditModel: 'Chỉnh Sửa',
        editModalTitle: 'Chỉnh Sửa Thông Tin Mô Hình',
        editCurrentImg: 'Ảnh Mô Hình Hiện Tại',
        btnChangeImg: 'Đổi ảnh mới',
        btnRetake: 'Chụp lại',
        editChangeUrlSub: 'Hoặc đổi URL ảnh online',
        btnSaveChange: 'Lưu Thay Đổi',
        deleteConfirmTitle: 'Xác Nhận Xóa',
        deleteConfirmMsg1: 'Bạn có chắc chắn muốn xóa mô hình',
        deleteConfirmMsg2: 'khỏi bộ sưu tập? Hành động này không thể hoàn tác.',
        btnDeletePermanent: 'Xóa Vĩnh Viễn',
        chartLabelCars: 'Xe (Car)',
        chartLabelGundam: 'Gundam',
        chartLabelOther: 'Khác',
        chartLabelBrandCount: 'Số lượng mô hình',
        toastLangSwitched: 'Đã chuyển sang Tiếng Việt',
        toastRefreshing: 'Đang làm mới dữ liệu...',
        noPrice: 'Chưa có giá'
    },
    en: {
        tagline: 'COLLECTION MANAGER',
        navDashboard: 'Dashboard',
        navCollection: 'My Collection',
        navAddModel: 'Add Model',
        crumbOverview: 'Overview',
        adminRole: 'Administrator',
        login: 'Sign In',
        logout: 'Log Out',
        systemReady: 'System Ready',
        systemConnecting: 'Connecting to database...',
        systemOffline: 'Backend disconnected',
        estValue: 'Est. Total Value',
        btnTopAdd: 'Add Model',
        dashboardTitle: 'Collection Statistics & Dashboard',
        dashboardSubtitle: 'Monitor scale, categories, and appraisal value of personal model collections',
        statTotalModels: 'Total Models',
        statCars: 'Car Models',
        statGundams: 'Gundam Kits',
        statOthers: 'Other Collectibles',
        statTotalValue: 'Total Estimated Value',
        unitModels: 'items',
        chartCategory: 'Category Distribution',
        chartBrand: 'Top Brands & Manufacturers',
        recentAdditions: 'Recently Added Models',
        viewAll: 'View All',
        thImage: 'Image',
        thName: 'Model Name',
        thCategory: 'Category',
        thBrand: 'Brand',
        thScale: 'Scale',
        thPrice: 'Price',
        thDate: 'Added Date',
        thAction: 'Actions',
        loading: 'Loading data...',
        collectionTitle: 'My Model Collection',
        collectionSubtitle: 'All scale models and gunpla kits stored in your garage',
        btnAddModel: 'Add New Model',
        searchPlaceholder: 'Search by model name, brand or notes...',
        catAll: 'All',
        catCars: 'Cars',
        catGundam: 'Gundam',
        catOther: 'Others',
        labelBrand: 'Brand:',
        optAllBrands: 'All Brands',
        labelSort: 'Sort by:',
        sortNewest: 'Recently Added',
        sortOldest: 'Oldest Added',
        sortNameAsc: 'Name (A → Z)',
        sortNameDesc: 'Name (Z → A)',
        sortPriceDesc: 'Price (High to Low)',
        sortPriceAsc: 'Price (Low to High)',
        modelsFound: 'models found',
        priceLabel: 'Price',
        btnDetail: 'Details',
        emptyTitle: 'No models found',
        emptyDesc: 'No models matched your filter criteria or your garage is currently empty.',
        resetFilters: 'Reset Filters',
        addTitle: 'Add New Model',
        addSubtitle: 'Enter specifications, attach high-res photo or snap directly using phone camera',
        fieldImage: 'Model Photo',
        dropzoneTitle: 'Drag & drop image here',
        dropzoneSubtitle: 'Supports JPG, PNG, WebP (Max 5 MB)',
        btnChooseFile: 'Browse Device',
        btnCamera: 'Snap Camera',
        fieldImageUrlSub: 'Or paste external image URL',
        fieldName: 'Model Name',
        fieldCategory: 'Category',
        optCar: 'Car Die-cast',
        optGundam: 'Gundam / Gunpla',
        optOther: 'Other Figures',
        fieldBrand: 'Brand / Manufacturer',
        fieldScale: 'Scale / Grade',
        fieldPrice: 'Purchase Price (VND)',
        fieldPurchaseDate: 'Purchase Date',
        fieldDescription: 'Notes & Description',
        btnCancel: 'Cancel',
        btnSaveModel: 'Save Model to Garage',
        removeImg: 'Remove image',
        loginModalTitle: 'Garage Login',
        loginModalSubtitle: 'Access personal model collection management portal',
        loginUsernameLabel: 'Username or Email',
        loginPasswordLabel: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        btnLoginAction: 'Sign In',
        demoAccountLabel: 'Demo Account:',
        btnQuickFill: 'Quick Fill',
        btnGuestMode: 'Continue browsing as guest',
        detailModalTitle: 'Model Details',
        specBrand: 'Brand:',
        specScale: 'Scale / Grade:',
        specPrice: 'Price:',
        specPurchaseDate: 'Purchase Date:',
        specCreated: 'Added On:',
        specNotes: 'Notes & Description',
        btnDeleteModel: 'Delete Model',
        btnClose: 'Close',
        btnEditModel: 'Edit Model',
        editModalTitle: 'Edit Model Details',
        editCurrentImg: 'Current Model Photo',
        btnChangeImg: 'Change Image',
        btnRetake: 'Retake Photo',
        editChangeUrlSub: 'Or update online image URL',
        btnSaveChange: 'Save Changes',
        deleteConfirmTitle: 'Confirm Deletion',
        deleteConfirmMsg1: 'Are you sure you want to delete model',
        deleteConfirmMsg2: 'from your collection? This action cannot be undone.',
        btnDeletePermanent: 'Delete Permanently',
        chartLabelCars: 'Cars',
        chartLabelGundam: 'Gundam',
        chartLabelOther: 'Others',
        chartLabelBrandCount: 'Number of Models',
        toastLangSwitched: 'Switched language to English',
        toastRefreshing: 'Refreshing collection data...',
        noPrice: 'No price set'
    }
};

// App State
const state = {
    currentLang: localStorage.getItem('mygarage_lang') || 'vi',
    currentView: 'dashboard',
    models: [],
    stats: null,
    categories: ['Car', 'Gundam', 'Other'],
    activeCategory: 'all',
    searchQuery: '',
    selectedBrand: 'all',
    sortBy: 'newest',
    selectedModelId: null,
    // Auth State
    currentUser: JSON.parse(localStorage.getItem('mygarage_user') || '{"username": "admin", "name": "Thái Hoàng", "role": "Quản trị viên"}'),
    authToken: localStorage.getItem('mygarage_token') || 'mygarage-demo-token',
    charts: {
        category: null,
        brand: null
    }
};

// ============================================================================
// DOM ELEMENTS CACHE
// ============================================================================
const dom = {
    // Language Switchers
    langToggleBtn: document.getElementById('langToggleBtn'),
    langFlag: document.getElementById('langFlag'),
    langLabel: document.getElementById('langLabel'),
    mobileLangToggleBtn: document.getElementById('mobileLangToggleBtn'),
    mobileLangFlag: document.getElementById('mobileLangFlag'),

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
    quickLoginMobileBtn: document.getElementById('quickLoginMobileBtn'),
    collectionAddBtn: document.getElementById('collectionAddBtn'),
    viewAllRecentBtn: document.getElementById('viewAllRecentBtn'),

    // User & Auth Elements
    topUserProfile: document.getElementById('topUserProfile'),
    topUserName: document.getElementById('topUserName'),
    topAvatar: document.getElementById('topAvatar'),
    topLoginBtn: document.getElementById('topLoginBtn'),
    sidebarUserBox: document.getElementById('sidebarUserBox'),
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserRole: document.getElementById('sidebarUserRole'),
    sidebarAvatar: document.getElementById('sidebarAvatar'),
    sidebarLogoutBtn: document.getElementById('sidebarLogoutBtn'),
    sidebarLoginBtn: document.getElementById('sidebarLoginBtn'),

    // Login Modal
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    toggleLoginPasswordBtn: document.getElementById('toggleLoginPasswordBtn'),
    submitLoginBtn: document.getElementById('submitLoginBtn'),
    quickFillDemoBtn: document.getElementById('quickFillDemoBtn'),
    closeLoginModalBtn: document.getElementById('closeLoginModalBtn'),
    forgotPasswordLink: document.getElementById('forgotPasswordLink'),

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
// LANGUAGE TOGGLE & TRANSLATION ENGINE (YÊU CẦU 2)
// ============================================================================
const setLanguage = (lang, triggerToast = false) => {
    state.currentLang = lang;
    localStorage.setItem('mygarage_lang', lang);

    const dict = i18n[lang] || i18n.vi;

    // Update Flag & Button Label
    if (dom.langFlag) dom.langFlag.textContent = lang === 'vi' ? '🇻🇳' : '🇬🇧';
    if (dom.langLabel) dom.langLabel.textContent = lang === 'vi' ? 'VI' : 'EN';
    if (dom.mobileLangFlag) dom.mobileLangFlag.textContent = lang === 'vi' ? '🇻🇳' : '🇬🇧';

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Update dynamic placeholders
    if (dom.searchInput) dom.searchInput.placeholder = dict.searchPlaceholder;

    // Update Breadcrumb
    const titles = {
        'dashboard': dict.navDashboard,
        'collection': dict.navCollection,
        'add-model': dict.navAddModel
    };
    if (dom.currentViewCrumb) dom.currentViewCrumb.textContent = titles[state.currentView] || dict.navDashboard;

    // Re-render charts and grids with updated language
    if (state.stats) {
        renderCategoryChart(state.stats.categories);
        renderBrandChart(state.stats.top_brands);
        renderRecentModels(state.stats.recent_models);
    }
    if (state.models.length > 0) {
        renderModelsGrid(state.models);
    }

    if (triggerToast) {
        showToast(dict.toastLangSwitched, 'info');
    }
};

const toggleLanguage = () => {
    const nextLang = state.currentLang === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang, true);
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================
const formatCurrency = (amount) => {
    const dict = i18n[state.currentLang] || i18n.vi;
    if (amount === null || amount === undefined || isNaN(amount)) return dict.noPrice;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        const locale = state.currentLang === 'vi' ? 'vi-VN' : 'en-US';
        return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
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

// Category Icon Resolver
const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'car') return 'fa-car-side';
    if (cat === 'gundam') return 'fa-robot';
    return 'fa-cube';
};

// ============================================================================
// AUTHENTICATION & LOGIN LOGIC
// ============================================================================
const updateAuthUI = () => {
    const dict = i18n[state.currentLang] || i18n.vi;
    if (state.currentUser && state.authToken) {
        const initials = state.currentUser.name
            ? state.currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            : 'AD';

        if (dom.topUserName) dom.topUserName.textContent = state.currentUser.name;
        if (dom.topAvatar) dom.topAvatar.textContent = initials;
        if (dom.topUserProfile) dom.topUserProfile.classList.remove('hidden');
        if (dom.topLoginBtn) dom.topLoginBtn.classList.add('hidden');

        if (dom.sidebarUserName) dom.sidebarUserName.textContent = state.currentUser.name;
        if (dom.sidebarUserRole) dom.sidebarUserRole.textContent = state.currentUser.role || dict.adminRole;
        if (dom.sidebarAvatar) dom.sidebarAvatar.textContent = initials;
        if (dom.sidebarUserBox) dom.sidebarUserBox.classList.remove('hidden');
        if (dom.sidebarLoginBtn) dom.sidebarLoginBtn.classList.add('hidden');
    } else {
        if (dom.topUserProfile) dom.topUserProfile.classList.add('hidden');
        if (dom.topLoginBtn) dom.topLoginBtn.classList.remove('hidden');

        if (dom.sidebarUserBox) dom.sidebarUserBox.classList.add('hidden');
        if (dom.sidebarLoginBtn) dom.sidebarLoginBtn.classList.remove('hidden');
    }
};

const openLoginModal = () => {
    dom.loginModal.classList.add('show');
    dom.loginUsername.focus();
};

const closeLoginModal = () => {
    dom.loginModal.classList.remove('show');
};

const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const username = dom.loginUsername.value.trim();
    const password = dom.loginPassword.value.trim();

    if (!username || !password) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên đăng nhập và mật khẩu!' : 'Please enter username and password!', 'error');
        return;
    }

    dom.submitLoginBtn.disabled = true;
    dom.submitLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        // Store session
        state.currentUser = json.user;
        state.authToken = json.token;
        localStorage.setItem('mygarage_user', JSON.stringify(json.user));
        localStorage.setItem('mygarage_token', json.token);

        updateAuthUI();
        closeLoginModal();
        showToast(json.message || 'Login successful!', 'success');

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        showToast(err.message || 'Login failed', 'error');
    } finally {
        dom.submitLoginBtn.disabled = false;
        const dict = i18n[state.currentLang] || i18n.vi;
        dom.submitLoginBtn.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i> ${dict.btnLoginAction}`;
    }
};

const handleLogout = async () => {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    } catch (e) {}

    state.currentUser = null;
    state.authToken = null;
    localStorage.removeItem('mygarage_user');
    localStorage.removeItem('mygarage_token');

    updateAuthUI();
    showToast(state.currentLang === 'vi' ? 'Đã đăng xuất an toàn.' : 'Logged out safely.', 'info');
    openLoginModal();
};

// ============================================================================
// NAVIGATION & VIEW SWITCHING
// ============================================================================
const navigateTo = (viewName) => {
    state.currentView = viewName;
    const dict = i18n[state.currentLang] || i18n.vi;

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
        'dashboard': dict.navDashboard,
        'collection': dict.navCollection,
        'add-model': dict.navAddModel
    };
    dom.currentViewCrumb.textContent = titles[viewName] || dict.navDashboard;

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
    const dict = i18n[state.currentLang] || i18n.vi;
    try {
        const res = await fetch(`${API_BASE}/readyz`);
        if (res.ok) {
            dom.systemStatusDot.className = 'status-dot online';
            dom.systemStatusText.textContent = dict.systemReady;
        } else {
            dom.systemStatusDot.className = 'status-dot';
            dom.systemStatusDot.style.background = '#feca57';
            dom.systemStatusText.textContent = dict.systemConnecting;
        }
    } catch {
        dom.systemStatusDot.className = 'status-dot';
        dom.systemStatusDot.style.background = '#ff6b81';
        dom.systemStatusText.textContent = dict.systemOffline;
    }
};

// ============================================================================
// DASHBOARD STATS & CHARTS (THEME PALETTE -02)
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

        // Render Charts with Palette -02
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

    const dict = i18n[state.currentLang] || i18n.vi;
    const labels = [dict.chartLabelCars, dict.chartLabelGundam, dict.chartLabelOther];
    const counts = [categories.Car || 0, categories.Gundam || 0, categories.Other || 0];

    state.charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: [
                    '#90C9FF', // Sky Blue (Cars)
                    '#FFAFCA', // Bubblegum Pink (Gundam)
                    '#DEE3FF'  // Ice Lavender (Other)
                ],
                borderColor: '#1c1b35',
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
                        color: '#DEE3FF',
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

    const dict = i18n[state.currentLang] || i18n.vi;
    const labels = (topBrands && topBrands.length) ? topBrands.map(b => b.brand) : ['None'];
    const counts = (topBrands && topBrands.length) ? topBrands.map(b => b.count) : [0];

    state.charts.brand = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: dict.chartLabelBrandCount,
                data: counts,
                backgroundColor: 'rgba(144, 201, 255, 0.65)',
                borderColor: '#90C9FF',
                borderWidth: 1.5,
                borderRadius: 4,
                hoverBackgroundColor: '#FFAFCA'
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
                    ticks: { color: '#9fa5c7', font: { family: "'Outfit', sans-serif", size: 11 } },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: '#9fa5c7', stepSize: 1, font: { family: "'Outfit', sans-serif", size: 11 } },
                    grid: { color: 'rgba(222, 227, 255, 0.08)' },
                    beginAtZero: true
                }
            }
        }
    });
};

// Recent Models Table Rendering
const renderRecentModels = (recentList) => {
    const dict = i18n[state.currentLang] || i18n.vi;
    if (!recentList || recentList.length === 0) {
        dom.recentModelsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4" style="color: var(--text-dim);">${dict.emptyTitle}</td>
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
            <td>
                <span class="badge badge-${item.category.toLowerCase()}">
                    <i class="fa-solid ${getCategoryIcon(item.category)}"></i> ${item.category}
                </span>
            </td>
            <td class="accent-sky">${item.brand || '—'}</td>
            <td>${item.scale || '—'}</td>
            <td class="accent-pink font-bold">${formatCurrency(item.price)}</td>
            <td style="color: var(--text-dim); font-size: 0.8rem;">${formatDate(item.created_at)}</td>
            <td>
                <button class="btn btn-outline btn-sm view-detail-btn" data-id="${item.id}">
                    <i class="fa-solid fa-eye"></i> ${dict.btnDetail}
                </button>
            </td>
        </tr>
    `).join('');

    dom.recentModelsTableBody.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'), 10);
            openModelDetails(id);
        });
    });
};

// ============================================================================
// COLLECTION VIEW: CORNER TRIANGLE BADGES (YÊU CẦU 3)
// ============================================================================
const updateBrandFilterOptions = (brands) => {
    if (!brands || !dom.brandFilterSelect) return;
    const currentVal = dom.brandFilterSelect.value;
    const dict = i18n[state.currentLang] || i18n.vi;

    dom.brandFilterSelect.innerHTML = `<option value="all">${dict.optAllBrands}</option>`;
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
    }
};

const renderModelsGrid = (models) => {
    const dict = i18n[state.currentLang] || i18n.vi;
    if (!models || models.length === 0) {
        dom.modelsGrid.innerHTML = '';
        dom.emptyCollectionState.classList.remove('hidden');
        return;
    }

    dom.emptyCollectionState.classList.add('hidden');

    // Render Cards with Corner Triangle Badges (Yêu cầu 3)
    dom.modelsGrid.innerHTML = models.map(item => {
        const catClass = (item.category || 'other').toLowerCase();
        const iconClass = getCategoryIcon(item.category);

        return `
            <div class="model-card" data-id="${item.id}">
                <div class="card-img-wrap">
                    <img class="card-img" src="${sanitizeImageUrl(item.image_url)}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'">
                    <div class="card-img-overlay"></div>
                    
                    <!-- Corner Triangle Tag replacing rounded badge (Yêu cầu 3) -->
                    <div class="card-corner-tag card-corner-${catClass}" title="${item.category}">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>

                    ${item.scale ? `<span class="badge-scale">${item.scale}</span>` : ''}
                </div>

                <div class="card-content">
                    <span class="card-brand">${item.brand || 'COLLECTION'}</span>
                    <h4 class="card-model-name" title="${item.name}">${item.name}</h4>

                    <div class="card-footer-row">
                        <div class="card-price-wrap">
                            <span class="card-price-label">${dict.priceLabel}</span>
                            <span class="card-price-value">${formatCurrency(item.price)}</span>
                        </div>
                        <button class="btn btn-outline btn-sm view-detail-card-btn" data-id="${item.id}">
                            ${dict.btnDetail} <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

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
    dom.chooseFileBtn.addEventListener('click', () => dom.addImageInput.click());
    dom.openCameraBtn.addEventListener('click', () => dom.addCameraInput.click());

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

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast(state.currentLang === 'vi' ? 'Kích thước ảnh vượt quá 5MB.' : 'File exceeds 5MB limit.', 'error');
        return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast(state.currentLang === 'vi' ? 'Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.' : 'Only JPG, PNG, or WebP allowed.', 'error');
        return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (mode === 'add') {
        addSelectedFile = file;
        dom.addPreviewImg.src = objectUrl;
        dom.addDropzoneContent.classList.add('hidden');
        dom.addPreviewContainer.classList.remove('hidden');
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
        showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên mô hình!' : 'Please enter model name!', 'error');
        dom.addNameInput.focus();
        return;
    }

    dom.submitAddBtn.disabled = true;
    dom.submitAddBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';

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

        showToast(state.currentLang === 'vi' ? 'Đã thêm mô hình mới vào garage thành công!' : 'Model successfully added!', 'success');

        // Reset form
        dom.addModelForm.reset();
        dom.removeAddImgBtn.click();

        // Switch to collection view and refresh
        navigateTo('collection');

    } catch (err) {
        console.error('Lỗi khi thêm mô hình:', err);
        showToast(err.message || 'Error saving model', 'error');
    } finally {
        dom.submitAddBtn.disabled = false;
        const dict = i18n[state.currentLang] || i18n.vi;
        dom.submitAddBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${dict.btnSaveModel}`;
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
        dom.detailDescription.textContent = item.description || (state.currentLang === 'vi' ? 'Chưa có ghi chú mô tả nào.' : 'No notes available.');

        // Show modal
        dom.detailsModal.classList.add('show');
    } catch (err) {
        console.error('Lỗi khi mở chi tiết:', err);
        showToast('Error loading model details', 'error');
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
        showToast(state.currentLang === 'vi' ? 'Tên mô hình không được để trống!' : 'Model name cannot be empty!', 'error');
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

        showToast(state.currentLang === 'vi' ? 'Cập nhật mô hình thành công!' : 'Model updated successfully!', 'success');
        closeEditModal();

        // Refresh views
        if (state.currentView === 'dashboard') loadDashboardStats();
        if (state.currentView === 'collection') loadModels();

        // Re-open updated details
        openModelDetails(modelId);

    } catch (err) {
        console.error('Lỗi khi cập nhật mô hình:', err);
        showToast(err.message || 'Update failed', 'error');
    }
};

// ============================================================================
// DELETE MODEL CONFIRMATION
// ============================================================================
const openDeleteConfirmModal = () => {
    const item = state.models.find(m => m.id === state.selectedModelId);
    dom.deleteTargetName.textContent = item ? `"${item.name}"` : 'this model';
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

        showToast(json.message || (state.currentLang === 'vi' ? 'Đã xóa mô hình khỏi garage' : 'Model deleted'), 'success');
        closeDeleteConfirmModal();
        closeDetailsModal();

        loadDashboardStats();
        loadModels();

    } catch (err) {
        console.error('Lỗi khi xóa mô hình:', err);
        showToast(err.message || 'Delete failed', 'error');
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
    // Language Switcher Events (Yêu cầu 2)
    if (dom.langToggleBtn) dom.langToggleBtn.addEventListener('click', toggleLanguage);
    if (dom.mobileLangToggleBtn) dom.mobileLangToggleBtn.addEventListener('click', toggleLanguage);

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
        const dict = i18n[state.currentLang] || i18n.vi;
        showToast(dict.toastRefreshing, 'info');
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

    // Auth & Login UI
    if (dom.topUserProfile) dom.topUserProfile.addEventListener('click', openLoginModal);
    if (dom.topLoginBtn) dom.topLoginBtn.addEventListener('click', openLoginModal);
    if (dom.sidebarLoginBtn) dom.sidebarLoginBtn.addEventListener('click', openLoginModal);
    if (dom.quickLoginMobileBtn) dom.quickLoginMobileBtn.addEventListener('click', openLoginModal);
    if (dom.sidebarLogoutBtn) dom.sidebarLogoutBtn.addEventListener('click', handleLogout);

    // Login Form
    dom.loginForm.addEventListener('submit', handleLoginSubmit);
    dom.closeLoginModalBtn.addEventListener('click', closeLoginModal);

    // Toggle Password Visibility
    dom.toggleLoginPasswordBtn.addEventListener('click', () => {
        const isPassword = dom.loginPassword.type === 'password';
        dom.loginPassword.type = isPassword ? 'text' : 'password';
        dom.toggleLoginPasswordBtn.innerHTML = isPassword 
            ? '<i class="fa-regular fa-eye-slash"></i>' 
            : '<i class="fa-regular fa-eye"></i>';
    });

    // Quick Fill Demo Credentials
    dom.quickFillDemoBtn.addEventListener('click', () => {
        dom.loginUsername.value = 'admin';
        dom.loginPassword.value = 'garage2026';
        showToast(state.currentLang === 'vi' ? 'Đã điền thông tin tài khoản mẫu!' : 'Filled demo credentials!', 'info');
    });

    if (dom.forgotPasswordLink) {
        dom.forgotPasswordLink.addEventListener('click', () => {
            showToast('Demo Account: admin / garage2026', 'info');
        });
    }

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
    [dom.detailsModal, dom.editModal, dom.deleteConfirmModal, dom.loginModal].forEach(modal => {
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
            closeLoginModal();
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
    setLanguage(state.currentLang, false);
    updateAuthUI();
    checkSystemReadiness();
    loadDashboardStats();
    loadModels();

    setInterval(checkSystemReadiness, 30000);
});
