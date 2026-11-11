/**
 * MyGarage – Personal Model Collection Manager
 * Frontend Application Logic (Pure JavaScript)
 * Theme: Pastel Aesthetic (Palette -02)
 * Features:
 *   - User Authentication & Registration (Werkzeug hashed passwords, MySQL)
 *   - Model Ownership Authorization & Strict Privacy Masking (Prices/Dates hidden for non-owners)
 *   - Custom Collections (Thư viện mô hình: Private by default, Public community view)
 *   - Bilingual English / Vietnamese Toggle
 *   - Corner Triangle Category Badges with Icons (Car, Gundam, Other)
 *   - CSRF Protection & Safe Flask Session Cookies
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
        navLibraries: 'Thư Viện',
        navAddModel: 'Thêm Mô Hình',
        crumbOverview: 'Tổng quan',
        adminRole: 'Thành viên Garage',
        guestRole: 'Chế độ Khách',
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
        optCustomCategory: '+ Thêm danh mục mới...',
        placeholderCustomCategory: 'Nhập tên danh mục mới (VD: Tàu hỏa, Lego, Figure...)',
        themePastel: 'Theme Pastel',
        themeVintage: 'Theme Cổ Điển',
        fieldBrand: 'Hãng Sản Xuất',
        fieldScale: 'Tỷ Lệ / Cấp Độ (Scale/Grade)',
        fieldPrice: 'Giá Mua (VNĐ)',
        fieldPurchaseDate: 'Ngày Mua',
        fieldDescription: 'Ghi Chú / Mô Tả Chi Tiết',
        btnCancel: 'Hủy Bỏ',
        btnSaveModel: 'Lưu Mô Hình Vào Garage',
        removeImg: 'Gỡ ảnh',
        
        // Auth strings
        authModalTitle: 'Tài Khoản MyGarage',
        authModalSubtitle: 'Quản lý và đồng bộ bộ sưu tập mô hình của bạn',
        tabSignIn: 'Đăng Nhập',
        tabSignUp: 'Đăng Ký',
        loginUsernameLabel: 'Tên đăng nhập hoặc Email',
        loginPasswordLabel: 'Mật khẩu',
        rememberMe: 'Ghi nhớ đăng nhập',
        btnLoginAction: 'Đăng Nhập',
        noAccountText: 'Chưa có tài khoản?',
        linkRegisterNow: 'Đăng ký ngay',
        hasAccountText: 'Đã có tài khoản?',
        linkLoginNow: 'Đăng nhập ngay',
        regUsernameLabel: 'Tên đăng nhập (Username)',
        regEmailLabel: 'Địa chỉ Email',
        regDisplayNameLabel: 'Tên hiển thị (Display Name)',
        regPasswordLabel: 'Mật khẩu (Tối thiểu 8 ký tự)',
        regConfirmPasswordLabel: 'Xác nhận mật khẩu',
        btnRegisterAction: 'Tạo Tài Khoản',
        btnGuestMode: 'Tiếp tục duyệt ở chế độ khách',

        // Detail Modal
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
        btnAddToCol: 'Thêm vào Thư Viện',
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
        noPrice: 'Chưa cập nhật',
        notUpdated: 'Chưa cập nhật',

        // Libraries / Collections
        libTitle: 'Thư Viện Bộ Sưu Tập',
        libSubtitle: 'Tạo và phân loại các chủ đề mô hình theo phong cách riêng của bạn',
        btnCreateLib: 'Tạo Thư Viện Mới',
        tabMyLibraries: 'Thư Viện Của Tôi',
        tabPublicLibraries: 'Khám Phá Cộng Đồng',
        libEmptyTitle: 'Chưa Có Thư Viện Nào',
        libEmptyDesc: 'Bạn chưa có thư viện nào trong mục này. Bấm "Tạo Thư Viện Mới" để bắt đầu gom nhóm!',
        createColModalTitle: 'Tạo Thư Viện Mới',
        fieldColName: 'Tên Thư Viện',
        fieldColDesc: 'Mô Tả / Giới Thiệu',
        fieldColCover: 'URL Ảnh Bìa (Tùy chọn)',
        fieldColVisibility: 'Chế Độ Hiển Thị',
        optVisibilityPrivate: '🔒 Riêng tư (Private) – Chỉ mình tôi xem được (Mặc định)',
        optVisibilityPublic: '🌍 Công khai (Public) – Mọi người đều có thể khám phá',
        btnSaveCol: 'Lưu Thư Viện',
        modelsInCollection: 'Mô hình trong thư viện',
        btnDeleteCol: 'Xóa Thư Viện',
        addToColTitle: 'Thêm Vào Thư Viện',
        selectColPrompt: 'Chọn thư viện để lưu mô hình:',
        labelChooseCol: 'Thư viện của bạn',
        btnConfirmAdd: 'Thêm Vào',
        requireLoginToAdd: 'Vui lòng đăng nhập để thêm mô hình vào garage của bạn.',

        // Community & Leaderboard & Profile
        navCommunity: 'Cộng Đồng',
        navLeaderboard: 'Top Collections',
        navProfile: 'Trang Cá Nhân',
        communityTitle: 'Cộng Đồng Sưu Tầm',
        communitySubtitle: 'Khám phá các thư viện mô hình công khai được chia sẻ bởi cộng đồng đam mê',
        searchCommunityPlaceholder: 'Tìm kiếm bộ sưu tập, người sưu tầm...',
        sortMostVoted: 'Nhiều lượt vote nhất',
        sortMostModels: 'Nhiều mô hình nhất',
        communityEmptyTitle: 'Không Tìm Thấy Bộ Sưu Tập Nào',
        communityEmptyDesc: 'Chưa có bộ sưu tập công khai nào phù hợp với từ khóa tìm kiếm.',
        leaderboardTitle: 'Bảng Xếp Hạng Bộ Sưu Tập',
        leaderboardSubtitle: 'Vinh danh các thư viện mô hình được yêu thích và bình chọn nhiều nhất',
        lbTabAllTime: 'Toàn Thời Gian (All Time)',
        lbTabThisMonth: 'Tháng Này (This Month)',
        lbEmptyTitle: 'Chưa Có Bảng Xếp Hạng',
        lbEmptyDesc: 'Hãy là người đầu tiên chia sẻ thư viện công khai và nhận những lượt vote đầu tiên!',
        btnEditProfile: 'Chỉnh Sửa Hồ Sơ',
        joinedDate: 'Tham gia:',
        statPublicLibs: 'Thư Viện Công Khai',
        statPublicModels: 'Mô Hình Công Khai',
        statTotalVotes: 'Lượt Vote Nhận Được',
        userCollectionsTitle: 'Danh Sách Thư Viện',
        profileEmptyTitle: 'Chưa Có Thư Viện Công Khai',
        profileEmptyDesc: 'Người dùng này chưa công khai thư viện mô hình nào.',
        editProfileTitle: 'Chỉnh Sửa Thông Tin Cá Nhân',
        fieldBio: 'Giới thiệu bản thân (Bio)',
        fieldAvatar: 'Ảnh đại diện (URL hoặc tải tệp)',
        fieldCover: 'Ảnh bìa cá nhân (URL hoặc tải tệp)',
        btnSaveProfile: 'Lưu Thay Đổi',
        btnVote: 'Vote',
        btnVoted: 'Đã Vote',
        voteRequireLogin: 'Vui lòng đăng nhập để bình chọn bộ sưu tập!',
        cannotSelfVote: 'Bạn không thể tự vote cho bộ sưu tập của chính mình.',
        viewCollection: 'Chi tiết'
    },
    en: {
        tagline: 'COLLECTION MANAGER',
        navDashboard: 'Dashboard',
        navCollection: 'My Collection',
        navLibraries: 'Libraries',
        navAddModel: 'Add Model',
        crumbOverview: 'Overview',
        adminRole: 'Garage Member',
        guestRole: 'Guest Mode',
        login: 'Sign In',
        logout: 'Sign Out',
        systemReady: 'System Ready',
        systemConnecting: 'Connecting to database...',
        systemOffline: 'Backend Disconnected',
        estValue: 'Estimated Value',
        btnTopAdd: 'Add Model',
        dashboardTitle: 'Overview Dashboard',
        dashboardSubtitle: 'Monitor scale, categorization, and estimated valuation of your models',
        statTotalModels: 'Total Models',
        statCars: 'Car Die-casts',
        statGundams: 'Gundam Kits',
        statOthers: 'Other Collectibles',
        statTotalValue: 'Total Est. Value',
        unitModels: 'models',
        chartCategory: 'Category Distribution',
        chartBrand: 'Top Manufacturers',
        recentAdditions: 'Recently Added Models',
        viewAll: 'View All',
        thImage: 'Image',
        thName: 'Model Name',
        thCategory: 'Category',
        thBrand: 'Brand',
        thScale: 'Scale',
        thPrice: 'Price',
        thDate: 'Added Date',
        thAction: 'Action',
        loading: 'Loading data...',
        collectionTitle: 'Model Collection',
        collectionSubtitle: 'Explore all the miniature models currently saved in your garage',
        btnAddModel: 'Add New Model',
        searchPlaceholder: 'Search by model name, brand...',
        catAll: 'All',
        catCars: 'Cars',
        catGundam: 'Gundam',
        catOther: 'Others',
        labelBrand: 'Brand:',
        optAllBrands: 'All Brands',
        labelSort: 'Sort By:',
        sortNewest: 'Newest First',
        sortOldest: 'Oldest First',
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
        optCustomCategory: '+ Add new category...',
        placeholderCustomCategory: 'Enter custom category name (e.g. Train, Lego, Figure...)',
        themePastel: 'Pastel Theme',
        themeVintage: 'Vintage Theme',
        fieldBrand: 'Brand / Manufacturer',
        fieldScale: 'Scale / Grade',
        fieldPrice: 'Purchase Price (VND)',
        fieldPurchaseDate: 'Purchase Date',
        fieldDescription: 'Notes & Description',
        btnCancel: 'Cancel',
        btnSaveModel: 'Save Model to Garage',
        removeImg: 'Remove image',

        // Auth strings
        authModalTitle: 'MyGarage Account',
        authModalSubtitle: 'Manage and sync your personal model collections',
        tabSignIn: 'Sign In',
        tabSignUp: 'Sign Up',
        loginUsernameLabel: 'Username or Email',
        loginPasswordLabel: 'Password',
        rememberMe: 'Remember me',
        btnLoginAction: 'Sign In',
        noAccountText: "Don't have an account?",
        linkRegisterNow: 'Register now',
        hasAccountText: 'Already have an account?',
        linkLoginNow: 'Sign in now',
        regUsernameLabel: 'Username',
        regEmailLabel: 'Email Address',
        regDisplayNameLabel: 'Display Name',
        regPasswordLabel: 'Password (Min 8 chars)',
        regConfirmPasswordLabel: 'Confirm Password',
        btnRegisterAction: 'Create Account',
        btnGuestMode: 'Continue browsing as guest',

        // Detail Modal
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
        btnAddToCol: 'Add to Library',
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
        noPrice: 'Not updated',
        notUpdated: 'Not updated',

        // Libraries / Collections
        libTitle: 'Model Libraries',
        libSubtitle: 'Curate and organize themed miniature collections',
        btnCreateLib: 'Create New Library',
        tabMyLibraries: 'My Libraries',
        tabPublicLibraries: 'Community Showcase',
        libEmptyTitle: 'No Libraries Found',
        libEmptyDesc: 'You do not have any libraries here yet. Click "Create New Library" to start organizing!',
        createColModalTitle: 'Create New Library',
        fieldColName: 'Library Name',
        fieldColDesc: 'Description',
        fieldColCover: 'Cover Image URL (Optional)',
        fieldColVisibility: 'Visibility Mode',
        optVisibilityPrivate: '🔒 Private – Visible only to you (Default)',
        optVisibilityPublic: '🌍 Public – Visible to everyone',
        btnSaveCol: 'Save Library',
        modelsInCollection: 'Models in this library',
        btnDeleteCol: 'Delete Library',
        addToColTitle: 'Add to Library',
        selectColPrompt: 'Choose a library for this model:',
        labelChooseCol: 'Your Libraries',
        btnConfirmAdd: 'Add Model',
        requireLoginToAdd: 'Please sign in to add models to your garage.',

        // Community & Leaderboard & Profile
        navCommunity: 'Community',
        navLeaderboard: 'Top Collections',
        navProfile: 'User Profile',
        communityTitle: 'Collector Community',
        communitySubtitle: 'Discover public model libraries curated and shared by enthusiasts',
        searchCommunityPlaceholder: 'Search collections, collectors...',
        sortMostVoted: 'Most Voted',
        sortMostModels: 'Most Models',
        communityEmptyTitle: 'No Collections Found',
        communityEmptyDesc: 'No public collections match your search criteria.',
        leaderboardTitle: 'Collection Leaderboard',
        leaderboardSubtitle: 'Honoring the most celebrated and highly-voted miniature showcases',
        lbTabAllTime: 'All Time',
        lbTabThisMonth: 'This Month',
        lbEmptyTitle: 'No Leaderboard Data',
        lbEmptyDesc: 'Be the first to share a public library and earn community votes!',
        btnEditProfile: 'Edit Profile',
        joinedDate: 'Joined:',
        statPublicLibs: 'Public Libraries',
        statPublicModels: 'Public Models',
        statTotalVotes: 'Total Votes Received',
        userCollectionsTitle: 'Curated Libraries',
        profileEmptyTitle: 'No Public Libraries',
        profileEmptyDesc: 'This user has not published any public model collections yet.',
        editProfileTitle: 'Edit User Profile',
        fieldBio: 'Personal Bio',
        fieldAvatar: 'Avatar (URL or upload file)',
        fieldCover: 'Cover Banner (URL or upload file)',
        btnSaveProfile: 'Save Changes',
        btnVote: 'Vote',
        btnVoted: 'Voted',
        voteRequireLogin: 'Please sign in to vote for collections!',
        cannotSelfVote: 'You cannot vote for your own collection.',
        viewCollection: 'Details'
    }
};

// ============================================================================
// APP STATE
// ============================================================================
const state = {
    currentLang: localStorage.getItem('mygarage_lang') || 'vi',
    currentTheme: localStorage.getItem('mygarage_theme') || 'pastel',
    currentView: 'dashboard',
    models: [],
    stats: null,
    categories: ['Car', 'Gundam', 'Other'],
    availableCategories: ['Car', 'Gundam', 'Other'],
    activeCategory: 'all',
    searchQuery: '',
    selectedBrand: 'all',
    sortBy: 'newest',
    selectedModelId: null,
    
    // Auth & Session
    currentUser: null,
    csrfToken: null,

    // Custom Collections State
    collections: [],
    activeColTab: 'my',
    selectedColId: null,
    selectedModelForCol: null,

    // Community & Leaderboard & Profile State
    communityCollections: [],
    communitySearch: '',
    communitySort: 'most_voted',
    leaderboardPeriod: 'all',
    leaderboardData: [],
    currentProfileUsername: null,
    profileData: null,

    charts: {
        category: null,
        brand: null
    }
};

// ============================================================================
// DOM ELEMENTS CACHE
// ============================================================================
const dom = {
    // Theme Switchers
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeLabel: document.getElementById('themeLabel'),
    mobileThemeToggleBtn: document.getElementById('mobileThemeToggleBtn'),

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

    // Auth Modal (Login & Register)
    authModal: document.getElementById('authModal'),
    authModalTitle: document.getElementById('authModalTitle'),
    authModalSubtitle: document.getElementById('authModalSubtitle'),
    authTabLogin: document.getElementById('authTabLogin'),
    authTabRegister: document.getElementById('authTabRegister'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    toggleLoginPasswordBtn: document.getElementById('toggleLoginPasswordBtn'),
    submitLoginBtn: document.getElementById('submitLoginBtn'),
    switchToRegisterLink: document.getElementById('switchToRegisterLink'),
    switchToLoginLink: document.getElementById('switchToLoginLink'),
    closeLoginModalBtn: document.getElementById('closeLoginModalBtn'),
    closeRegisterModalBtn: document.getElementById('closeRegisterModalBtn'),
    
    // Register Form Fields
    regUsername: document.getElementById('regUsername'),
    regEmail: document.getElementById('regEmail'),
    regDisplayName: document.getElementById('regDisplayName'),
    regPassword: document.getElementById('regPassword'),
    regConfirmPassword: document.getElementById('regConfirmPassword'),
    toggleRegPasswordBtn: document.getElementById('toggleRegPasswordBtn'),
    submitRegisterBtn: document.getElementById('submitRegisterBtn'),

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
    categoryPillsContainer: document.getElementById('categoryPillsContainer'),
    categoryPills: document.querySelectorAll('.category-pills .pill-btn'),
    brandFilterSelect: document.getElementById('brandFilterSelect'),
    sortSelect: document.getElementById('sortSelect'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    modelsGrid: document.getElementById('modelsGrid'),
    emptyCollectionState: document.getElementById('emptyCollectionState'),
    collectionResultsCount: document.getElementById('collectionResultsCount'),

    // Add Model Form
    addModelForm: document.getElementById('addModelForm'),
    addNameInput: document.getElementById('addNameInput'),
    addCategorySelect: document.getElementById('addCategorySelect'),
    addCustomCategoryWrap: document.getElementById('addCustomCategoryWrap'),
    addCustomCategoryInput: document.getElementById('addCustomCategoryInput'),
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
    detailModelTitle: document.getElementById('detailModelTitle'),
    detailCategoryBadge: document.getElementById('detailCategoryBadge'),
    detailImg: document.getElementById('detailImg'),
    detailBrand: document.getElementById('detailBrand'),
    detailScale: document.getElementById('detailScale'),
    detailPrice: document.getElementById('detailPrice'),
    detailPurchaseDate: document.getElementById('detailPurchaseDate'),
    detailCreatedAt: document.getElementById('detailCreatedAt'),
    detailDescription: document.getElementById('detailDescription'),
    closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
    detailCloseBtn: document.getElementById('detailCloseBtn'),
    detailEditBtn: document.getElementById('detailEditBtn'),
    detailDeleteBtn: document.getElementById('detailDeleteBtn'),
    detailAddToColBtn: document.getElementById('detailAddToColBtn'),

    // Edit Model Modal
    editModal: document.getElementById('editModal'),
    editModelForm: document.getElementById('editModelForm'),
    editModelId: document.getElementById('editModelId'),
    editNameInput: document.getElementById('editNameInput'),
    editCategorySelect: document.getElementById('editCategorySelect'),
    editCustomCategoryWrap: document.getElementById('editCustomCategoryWrap'),
    editCustomCategoryInput: document.getElementById('editCustomCategoryInput'),
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
    closeEditModalBtn: document.getElementById('closeEditModalBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    submitEditBtn: document.getElementById('submitEditBtn'),

    // Delete Confirm Modal
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    deleteTargetName: document.getElementById('deleteTargetName'),
    cancelDeleteConfirmBtn: document.getElementById('cancelDeleteConfirmBtn'),
    confirmDeleteActionBtn: document.getElementById('confirmDeleteActionBtn'),

    // Custom Collections View Elements
    openCreateColBtn: document.getElementById('openCreateColBtn'),
    tabMyCols: document.getElementById('tabMyCols'),
    tabPublicCols: document.getElementById('tabPublicCols'),
    collectionsGrid: document.getElementById('collectionsGrid'),
    collectionsEmptyState: document.getElementById('collectionsEmptyState'),

    // Create Collection Modal
    createCollectionModal: document.getElementById('createCollectionModal'),
    createColForm: document.getElementById('createColForm'),
    colNameInput: document.getElementById('colNameInput'),
    colDescInput: document.getElementById('colDescInput'),
    colCoverInput: document.getElementById('colCoverInput'),
    colVisibilitySelect: document.getElementById('colVisibilitySelect'),
    closeCreateColModalBtn: document.getElementById('closeCreateColModalBtn'),
    cancelCreateColBtn: document.getElementById('cancelCreateColBtn'),

    // Collection Details Modal
    colDetailModal: document.getElementById('colDetailModal'),
    colDetailVisibilityBadge: document.getElementById('colDetailVisibilityBadge'),
    colDetailTitle: document.getElementById('colDetailTitle'),
    colDetailDesc: document.getElementById('colDetailDesc'),
    colDetailCount: document.getElementById('colDetailCount'),
    colOwnerActions: document.getElementById('colOwnerActions'),
    deleteColBtn: document.getElementById('deleteColBtn'),
    colModelsGrid: document.getElementById('colModelsGrid'),
    closeColDetailModalBtn: document.getElementById('closeColDetailModalBtn'),
    closeColDetailBtn: document.getElementById('closeColDetailBtn'),

    // Add To Collection Modal
    addToColModal: document.getElementById('addToColModal'),
    targetModelNameForCol: document.getElementById('targetModelNameForCol'),
    selectUserCol: document.getElementById('selectUserCol'),
    cancelAddToColBtn: document.getElementById('cancelAddToColBtn'),
    confirmAddToColBtn: document.getElementById('confirmAddToColBtn'),
    closeAddToColModalBtn: document.getElementById('closeAddToColModalBtn'),

    // Community View Elements
    communitySearchInput: document.getElementById('communitySearchInput'),
    clearCommunitySearchBtn: document.getElementById('clearCommunitySearchBtn'),
    communitySortSelect: document.getElementById('communitySortSelect'),
    communityGrid: document.getElementById('communityGrid'),
    communityEmptyState: document.getElementById('communityEmptyState'),

    // Top Collections Leaderboard Elements
    tabLbAllTime: document.getElementById('tabLbAllTime'),
    tabLbThisMonth: document.getElementById('tabLbThisMonth'),
    leaderboardList: document.getElementById('leaderboardList'),
    leaderboardEmptyState: document.getElementById('leaderboardEmptyState'),

    // User Profile Elements
    profileCoverBanner: document.getElementById('profileCoverBanner'),
    profileAvatarLarge: document.getElementById('profileAvatarLarge'),
    profileDisplayName: document.getElementById('profileDisplayName'),
    profileUsername: document.getElementById('profileUsername'),
    profileOwnerControls: document.getElementById('profileOwnerControls'),
    openEditProfileBtn: document.getElementById('openEditProfileBtn'),
    profileBio: document.getElementById('profileBio'),
    profileJoinedDate: document.getElementById('profileJoinedDate'),
    profileStatCollections: document.getElementById('profileStatCollections'),
    profileStatModels: document.getElementById('profileStatModels'),
    profileStatVotes: document.getElementById('profileStatVotes'),
    profileCollectionsGrid: document.getElementById('profileCollectionsGrid'),
    profileEmptyState: document.getElementById('profileEmptyState'),

    // Edit Profile Modal
    editProfileModal: document.getElementById('editProfileModal'),
    editProfileForm: document.getElementById('editProfileForm'),
    closeEditProfileModalBtn: document.getElementById('closeEditProfileModalBtn'),
    cancelEditProfileBtn: document.getElementById('cancelEditProfileBtn'),
    editProfileDisplayName: document.getElementById('editProfileDisplayName'),
    editProfileBio: document.getElementById('editProfileBio'),
    editProfileAvatarUrl: document.getElementById('editProfileAvatarUrl'),
    editProfileAvatarFile: document.getElementById('editProfileAvatarFile'),
    editProfileCoverUrl: document.getElementById('editProfileCoverUrl'),
    editProfileCoverFile: document.getElementById('editProfileCoverFile'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
};

// ============================================================================
// BILINGUAL LANGUAGE ENGINE
// ============================================================================
const setLanguage = (lang, triggerToast = false) => {
    state.currentLang = lang;
    localStorage.setItem('mygarage_lang', lang);

    document.documentElement.lang = lang;
    const isVi = lang === 'vi';

    // Update Flag and text labels
    if (dom.langFlag) dom.langFlag.textContent = isVi ? '🇻🇳' : '🇬🇧';
    if (dom.langLabel) dom.langLabel.textContent = isVi ? 'VI' : 'EN';
    if (dom.mobileLangFlag) dom.mobileLangFlag.textContent = isVi ? '🇻🇳' : '🇬🇧';

    const dict = i18n[lang] || i18n.vi;

    // Apply translations to all DOM elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    if (dom.searchInput) dom.searchInput.placeholder = dict.searchPlaceholder;
    if (dom.themeLabel) {
        dom.themeLabel.textContent = state.currentTheme === 'vintage' ? dict.themeVintage : dict.themePastel;
    }

    // Update Breadcrumb
    const titles = {
        'dashboard': dict.navDashboard,
        'collection': dict.navCollection,
        'libraries': dict.navLibraries,
        'add-model': dict.navAddModel
    };
    if (dom.currentViewCrumb) dom.currentViewCrumb.textContent = titles[state.currentView] || dict.navDashboard;

    // Re-render UI components with updated language
    if (state.stats) {
        renderCategoryChart(state.stats.categories);
        renderBrandChart(state.stats.top_brands);
        renderRecentModels(state.stats.recent_models);
    }
    if (state.models.length > 0) {
        renderModelsGrid(state.models);
    }

    updateAuthUI();

    if (triggerToast) {
        showToast(dict.toastLangSwitched, 'info');
    }
};

const toggleLanguage = () => {
    const nextLang = state.currentLang === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang, true);
};

// ============================================================================
// THEME SWITCHER ENGINE (PASTEL <-> VINTAGE RACING)
// ============================================================================
const initTheme = () => {
    const savedTheme = localStorage.getItem('mygarage_theme') || 'pastel';
    applyTheme(savedTheme, false);
};

const applyTheme = (themeName, triggerToast = false) => {
    state.currentTheme = themeName;
    localStorage.setItem('mygarage_theme', themeName);
    const dict = i18n[state.currentLang] || i18n.vi;

    if (themeName === 'vintage') {
        document.body.classList.add('theme-vintage');
        if (dom.themeLabel) {
            dom.themeLabel.textContent = dict.themeVintage;
        }
    } else {
        document.body.classList.remove('theme-vintage');
        if (dom.themeLabel) {
            dom.themeLabel.textContent = dict.themePastel;
        }
    }

    if (state.stats) {
        renderCategoryChart(state.stats.categories);
        renderBrandChart(state.stats.top_brands);
    }

    if (triggerToast) {
        const msg = themeName === 'vintage'
            ? (state.currentLang === 'vi' ? 'Đã đổi sang Theme Cổ Điển (Polo Burgundy & Racing Green)' : 'Switched to Vintage Automotive Theme')
            : (state.currentLang === 'vi' ? 'Đã đổi sang Theme Pastel Mặc Định' : 'Switched to Default Pastel Theme');
        showToast(msg, 'info');
    }
};

const toggleTheme = () => {
    const nextTheme = state.currentTheme === 'vintage' ? 'pastel' : 'vintage';
    applyTheme(nextTheme, true);
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================
const formatCurrency = (amount) => {
    const dict = i18n[state.currentLang] || i18n.vi;
    if (amount === null || amount === undefined || amount === '' || isNaN(amount)) {
        return dict.notUpdated || 'Chưa cập nhật';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateStr) => {
    const dict = i18n[state.currentLang] || i18n.vi;
    if (!dateStr || dateStr === 'None' || dateStr === 'null') {
        return dict.notUpdated || 'Chưa cập nhật';
    }
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dict.notUpdated || 'Chưa cập nhật';
        const locale = state.currentLang === 'vi' ? 'vi-VN' : 'en-US';
        return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return dict.notUpdated || 'Chưa cập nhật';
    }
};

const sanitizeImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    if (url.startsWith('/uploads/')) {
        return `${API_BASE}${url}`;
    }
    return url;
};

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

const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase().trim();
    if (cat.includes('car') || cat.includes('xe') || cat.includes('oto') || cat.includes('ô tô')) return 'fa-car-side';
    if (cat.includes('gundam') || cat.includes('gunpla') || cat.includes('robot') || cat.includes('mecha')) return 'fa-robot';
    if (cat.includes('plane') || cat.includes('bay') || cat.includes('aircraft')) return 'fa-plane';
    if (cat.includes('ship') || cat.includes('tàu') || cat.includes('thuyền') || cat.includes('boat')) return 'fa-ship';
    if (cat.includes('moto') || cat.includes('bike')) return 'fa-motorcycle';
    if (cat.includes('figure') || cat.includes('tượng') || cat.includes('anime')) return 'fa-person';
    if (cat.includes('lego') || cat.includes('brick')) return 'fa-cubes-stacked';
    return 'fa-shapes';
};

const syncAvailableCategories = (cats) => {
    if (!Array.isArray(cats)) return;
    cats.forEach(c => {
        const trimmed = (c || '').trim();
        if (trimmed && !state.availableCategories.includes(trimmed)) {
            state.availableCategories.push(trimmed);
        }
    });

    // Populate #addCategorySelect and #editCategorySelect options if not present
    [dom.addCategorySelect, dom.editCategorySelect].forEach(select => {
        if (!select) return;
        const customOpt = select.querySelector('option[value="__custom__"]');
        state.availableCategories.forEach(cat => {
            if (!select.querySelector(`option[value="${cat}"]`)) {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                if (customOpt) {
                    select.insertBefore(opt, customOpt);
                } else {
                    select.appendChild(opt);
                }
            }
        });
    });

    // Populate category pills on collection view
    if (dom.categoryPillsContainer) {
        const existingPills = Array.from(dom.categoryPillsContainer.querySelectorAll('.pill-btn'));
        const existingCats = existingPills.map(p => p.getAttribute('data-category'));

        state.availableCategories.forEach(cat => {
            if (!existingCats.includes(cat)) {
                const btn = document.createElement('button');
                btn.className = `pill-btn ${state.activeCategory === cat ? 'active' : ''}`;
                btn.setAttribute('data-category', cat);
                btn.innerHTML = `<i class="fa-solid ${getCategoryIcon(cat)}"></i> <span>${cat}</span>`;
                dom.categoryPillsContainer.appendChild(btn);
            }
        });
    }
};

// ============================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================================================
const checkCurrentUser = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
            credentials: 'include'
        });
        const json = await res.json();

        if (json.csrf_token) {
            state.csrfToken = json.csrf_token;
        }

        if (json.authenticated && json.user) {
            state.currentUser = json.user;
        } else {
            state.currentUser = null;
        }
    } catch (err) {
        console.warn('Backend auth check skipped:', err);
        state.currentUser = null;
    } finally {
        updateAuthUI();
    }
};

const updateAuthUI = () => {
    const dict = i18n[state.currentLang] || i18n.vi;

    if (state.currentUser) {
        const displayName = state.currentUser.display_name || state.currentUser.username;
        const initials = displayName
            ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            : 'U';

        if (dom.topUserName) dom.topUserName.textContent = displayName;
        if (state.currentUser.avatar_url) {
            dom.topAvatar.innerHTML = `<img src="${sanitizeImageUrl(state.currentUser.avatar_url)}" alt="${displayName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            dom.sidebarAvatar.innerHTML = `<img src="${sanitizeImageUrl(state.currentUser.avatar_url)}" alt="${displayName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            dom.topAvatar.textContent = initials;
            dom.sidebarAvatar.textContent = initials;
        }
        if (dom.topUserProfile) dom.topUserProfile.classList.remove('hidden');
        if (dom.topLoginBtn) dom.topLoginBtn.classList.add('hidden');

        if (dom.sidebarUserName) dom.sidebarUserName.textContent = displayName;
        if (dom.sidebarUserRole) dom.sidebarUserRole.textContent = `@${state.currentUser.username}`;
        if (dom.sidebarUserBox) dom.sidebarUserBox.classList.remove('hidden');
        if (dom.sidebarLoginBtn) dom.sidebarLoginBtn.classList.add('hidden');
    } else {
        if (dom.topUserProfile) dom.topUserProfile.classList.add('hidden');
        if (dom.topLoginBtn) dom.topLoginBtn.classList.remove('hidden');

        if (dom.sidebarUserBox) dom.sidebarUserBox.classList.add('hidden');
        if (dom.sidebarLoginBtn) dom.sidebarLoginBtn.classList.remove('hidden');
    }
};

const openAuthModal = (initialTab = 'login') => {
    switchAuthTab(initialTab);
    dom.authModal.classList.add('show');
    if (initialTab === 'login') {
        dom.loginUsername.focus();
    } else {
        dom.regUsername.focus();
    }
};

const closeAuthModal = () => {
    dom.authModal.classList.remove('show');
};

const switchAuthTab = (tab) => {
    if (tab === 'login') {
        dom.authTabLogin.classList.add('active');
        dom.authTabRegister.classList.remove('active');
        dom.loginForm.classList.remove('hidden');
        dom.registerForm.classList.add('hidden');
    } else {
        dom.authTabRegister.classList.add('active');
        dom.authTabLogin.classList.remove('active');
        dom.registerForm.classList.remove('hidden');
        dom.loginForm.classList.add('hidden');
    }
};

const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const username = dom.loginUsername.value.trim();
    const password = dom.loginPassword.value.trim();

    if (!username || !password) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên đăng nhập và mật khẩu!' : 'Please enter credentials!', 'error');
        return;
    }

    dom.submitLoginBtn.disabled = true;
    dom.submitLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        state.currentUser = json.user;
        if (json.csrf_token) state.csrfToken = json.csrf_token;

        updateAuthUI();
        closeAuthModal();
        showToast(json.message, 'success');

        // Refresh stats and models with ownership permissions unlocked
        loadDashboardStats();
        loadModels();
        if (state.currentView === 'libraries') loadCollections();

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        showToast(err.message || 'Login failed', 'error');
    } finally {
        dom.submitLoginBtn.disabled = false;
        const dict = i18n[state.currentLang] || i18n.vi;
        dom.submitLoginBtn.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i> ${dict.btnLoginAction}`;
    }
};

const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const username = dom.regUsername.value.trim();
    const email = dom.regEmail.value.trim();
    const displayName = dom.regDisplayName.value.trim();
    const password = dom.regPassword.value;
    const confirmPassword = dom.regConfirmPassword.value;

    if (!username || !email || !password) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng điền đủ Username, Email và Mật khẩu!' : 'Please fill all required fields!', 'error');
        return;
    }

    if (password.length < 8) {
        showToast(state.currentLang === 'vi' ? 'Mật khẩu phải có độ dài tối thiểu 8 ký tự!' : 'Password must be at least 8 characters!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast(state.currentLang === 'vi' ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!', 'error');
        return;
    }

    dom.submitRegisterBtn.disabled = true;
    dom.submitRegisterBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                username,
                email,
                display_name: displayName,
                password,
                confirm_password: confirmPassword
            })
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        state.currentUser = json.user;
        if (json.csrf_token) state.csrfToken = json.csrf_token;

        updateAuthUI();
        closeAuthModal();
        showToast(json.message, 'success');

        loadDashboardStats();
        loadModels();
        if (state.currentView === 'libraries') loadCollections();

    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        showToast(err.message || 'Registration failed', 'error');
    } finally {
        dom.submitRegisterBtn.disabled = false;
        const dict = i18n[state.currentLang] || i18n.vi;
        dom.submitRegisterBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${dict.btnRegisterAction}`;
    }
};

const handleLogout = async () => {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: state.csrfToken ? { 'X-CSRF-Token': state.csrfToken } : {}
        });
    } catch (e) {}

    state.currentUser = null;
    updateAuthUI();
    showToast(state.currentLang === 'vi' ? 'Đã đăng xuất an toàn.' : 'Logged out safely.', 'info');
    
    // Refresh to update masked prices
    loadDashboardStats();
    loadModels();
    if (state.currentView === 'libraries') loadCollections();
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
        'libraries': dict.navLibraries,
        'community': dict.navCommunity,
        'leaderboard': dict.navLeaderboard,
        'profile': dict.navProfile,
        'add-model': dict.navAddModel
    };
    dom.currentViewCrumb.textContent = titles[viewName] || dict.navDashboard;

    closeMobileSidebar();

    // Trigger data fetch for view
    if (viewName === 'dashboard') {
        loadDashboardStats();
    } else if (viewName === 'collection') {
        loadModels();
    } else if (viewName === 'libraries') {
        loadCollections();
    } else if (viewName === 'community') {
        loadCommunityCollections(state.communitySearch, state.communitySort);
    } else if (viewName === 'leaderboard') {
        loadLeaderboard(state.leaderboardPeriod || 'all');
    } else if (viewName === 'profile') {
        if (state.currentProfileUsername) {
            loadUserProfile(state.currentProfileUsername);
        } else if (state.currentUser) {
            navigateToProfile(state.currentUser.username);
        } else {
            showToast(state.currentLang === 'vi' ? 'Vui lòng đăng nhập để xem hồ sơ của bạn.' : 'Please sign in to view your profile.', 'info');
            openAuthModal('login');
        }
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
            dom.systemStatusDot.className = 'status-dot connecting';
            dom.systemStatusText.textContent = dict.systemConnecting;
        }
    } catch {
        dom.systemStatusDot.className = 'status-dot offline';
        dom.systemStatusText.textContent = dict.systemOffline;
    }
};

// ============================================================================
// DASHBOARD STATS & CHARTS (CHART.JS WITH PALETTE -02)
// ============================================================================
const loadDashboardStats = async () => {
    if (!state.currentUser) {
        state.stats = null;
        dom.statTotalCount.textContent = '0';
        dom.statCarCount.textContent = '0';
        dom.statGundamCount.textContent = '0';
        dom.statOtherCount.textContent = '0';
        dom.statTotalValue.textContent = '—';
        dom.sidebarTotalValue.textContent = '—';
        dom.statCarPercent.textContent = '0%';
        dom.statGundamPercent.textContent = '0%';
        dom.statOtherPercent.textContent = '0%';
        renderCategoryChart({});
        renderBrandChart([]);
        renderRecentModels([]);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/stats`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const data = json.data;
        state.stats = data;

        // Animate counter values
        dom.statTotalCount.textContent = data.total;
        dom.statCarCount.textContent = data.total_cars;
        dom.statGundamCount.textContent = data.total_gundams;
        dom.statOtherCount.textContent = data.total_others;

        // If user is authenticated, show their personal total value
        if (state.currentUser && data.my_value !== undefined) {
            dom.statTotalValue.textContent = formatCurrency(data.my_value);
            dom.sidebarTotalValue.textContent = formatCurrency(data.my_value);
        } else {
            // For public / guests, hide aggregate value or show masked notice
            dom.statTotalValue.textContent = formatCurrency(null);
            dom.sidebarTotalValue.textContent = '—';
        }

        // Percentage calculations
        const total = data.total || 1;
        dom.statCarPercent.textContent = `${Math.round((data.total_cars / total) * 100)}%`;
        dom.statGundamPercent.textContent = `${Math.round((data.total_gundams / total) * 100)}%`;
        dom.statOtherPercent.textContent = `${Math.round((data.total_others / total) * 100)}%`;

        // Render Charts with Palette -02
        renderCategoryChart(data.categories);
        renderBrandChart(data.top_brands);

        // Render Recent Models
        renderRecentModels(data.recent_models);

        // Update brand filter datalist
        updateBrandFilterOptions(data.available_brands);

        // Sync custom categories across UI
        if (data.available_categories) {
            syncAvailableCategories(data.available_categories);
        }

    } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
    }
};

// Category Donut Chart
const renderCategoryChart = (categories) => {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (state.charts.category) {
        state.charts.category.destroy();
    }

    const dict = i18n[state.currentLang] || i18n.vi;
    const isVintage = state.currentTheme === 'vintage';

    const labels = [];
    const data = [];
    const colors = isVintage
        ? ['#C9B99A', '#641E2A', '#18352B', '#dfd4bc', '#832737', '#2e5f50', '#a3957a', '#c29d38']
        : ['#90C9FF', '#FFAFCA', '#DEE3FF', '#BDE0FE', '#FFC8DC', '#A2D2FF', '#86efac', '#fde047'];

    if (categories && typeof categories === 'object') {
        Object.entries(categories).forEach(([cat, count]) => {
            if (count > 0 || cat === 'Car' || cat === 'Gundam' || cat === 'Other') {
                let label = cat;
                if (cat === 'Car') label = dict.chartLabelCars;
                else if (cat === 'Gundam') label = dict.chartLabelGundam;
                else if (cat === 'Other') label = dict.chartLabelOther;
                labels.push(label);
                data.push(count);
            }
        });
    }

    if (labels.length === 0) {
        labels.push(dict.chartLabelCars, dict.chartLabelGundam, dict.chartLabelOther);
        data.push(0, 0, 0);
    }

    state.charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: isVintage ? '#0b1713' : '#131224',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isVintage ? '#C9B99A' : '#DEE3FF',
                        font: { family: "'Outfit', sans-serif", size: 12 },
                        padding: 16,
                        usePointStyle: true
                    }
                }
            },
            cutout: '70%'
        }
    });
};

// Brand Bar Chart
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
// COLLECTION VIEW: CORNER TRIANGLE BADGES & FILTERS
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
    if (!state.currentUser) {
        state.models = [];
        renderModelsGrid([]);
        dom.collectionResultsCount.textContent = '0';
        dom.navCountBadge.textContent = '0';
        return;
    }

    try {
        const params = new URLSearchParams();
        if (state.searchQuery) params.append('search', state.searchQuery);
        if (state.activeCategory && state.activeCategory !== 'all') params.append('category', state.activeCategory);
        if (state.selectedBrand && state.selectedBrand !== 'all') params.append('brand', state.selectedBrand);
        if (state.sortBy) params.append('sort', state.sortBy);

        const res = await fetch(`${API_BASE}/api/models?${params.toString()}`, {
            credentials: 'include'
        });
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        state.models = json.data;
        const foundCategories = state.models.map(m => m.category).filter(Boolean);
        syncAvailableCategories(foundCategories);
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

    dom.modelsGrid.innerHTML = models.map(item => {
        const catClass = (item.category || 'other').toLowerCase();
        const iconClass = getCategoryIcon(item.category);

        return `
            <div class="model-card" data-id="${item.id}">
                <div class="card-img-wrap">
                    <img class="card-img" src="${sanitizeImageUrl(item.image_url)}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'">
                    <div class="card-img-overlay"></div>
                    
                    <!-- Corner Triangle Tag with Icon -->
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

    dom.modelsGrid.querySelectorAll('.view-detail-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'), 10);
            openModelDetails(id);
        });
    });

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

    dom.removeAddImgBtn.addEventListener('click', () => {
        addSelectedFile = null;
        dom.addImageInput.value = '';
        dom.addCameraInput.value = '';
        dom.addPreviewImg.src = '';
        dom.addPreviewContainer.classList.add('hidden');
        dom.addDropzoneContent.classList.remove('hidden');
    });

    dom.editChooseFileBtn.addEventListener('click', () => dom.editImageInput.click());
    dom.editCameraBtn.addEventListener('click', () => dom.editCameraInput.click());

    dom.editImageInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0], 'edit'));
    dom.editCameraInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0], 'edit'));
};

const handleFileSelection = (file, context = 'add') => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng chọn tập tin hình ảnh (JPG, PNG, WebP)!' : 'Please select a valid image file!', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast(state.currentLang === 'vi' ? 'Kích thước ảnh tối đa 5MB!' : 'Image size cannot exceed 5MB!', 'error');
        return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (context === 'add') {
        addSelectedFile = file;
        dom.addPreviewImg.src = objectUrl;
        dom.addPreviewContainer.classList.remove('hidden');
        dom.addDropzoneContent.classList.add('hidden');
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

    if (!state.currentUser) {
        showToast(i18n[state.currentLang].requireLoginToAdd, 'error');
        openAuthModal('login');
        return;
    }

    const name = dom.addNameInput.value.trim();
    if (!name) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên mô hình!' : 'Please enter model name!', 'error');
        dom.addNameInput.focus();
        return;
    }

    dom.submitAddBtn.disabled = true;
    dom.submitAddBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';

    let category = dom.addCategorySelect.value;
    if (category === '__custom__') {
        category = dom.addCustomCategoryInput.value.trim();
        if (!category) {
            showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên danh mục tùy chỉnh!' : 'Please enter custom category name!', 'error');
            dom.addCustomCategoryInput.focus();
            dom.submitAddBtn.disabled = false;
            const dict = i18n[state.currentLang] || i18n.vi;
            dom.submitAddBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${dict.btnSaveModel}`;
            return;
        }
    }

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
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

        const headers = {};
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/models`, {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: formData
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(state.currentLang === 'vi' ? 'Đã thêm mô hình mới vào garage thành công!' : 'Model successfully added!', 'success');

        dom.addModelForm.reset();
        dom.addCustomCategoryWrap.classList.add('hidden');
        dom.addCustomCategoryInput.value = '';
        dom.removeAddImgBtn.click();
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
// MODEL DETAILS MODAL
// ============================================================================
const openModelDetails = async (modelId) => {
    state.selectedModelId = modelId;

    try {
        const res = await fetch(`${API_BASE}/api/models/${modelId}`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const item = json.data;

        dom.detailModelTitle.textContent = item.name;
        dom.detailCategoryBadge.textContent = item.category;
        dom.detailCategoryBadge.className = `badge badge-${item.category.toLowerCase()}`;
        dom.detailImg.src = sanitizeImageUrl(item.image_url);
        dom.detailBrand.textContent = item.brand || '—';
        dom.detailScale.textContent = item.scale || '—';
        dom.detailPrice.textContent = formatCurrency(item.price);
        dom.detailPurchaseDate.textContent = formatDate(item.purchase_date);
        dom.detailCreatedAt.textContent = formatDate(item.created_at);
        dom.detailDescription.textContent = item.description || (state.currentLang === 'vi' ? 'Chưa cập nhật' : 'Not updated');

        // Ownership authorization check
        const isOwner = Boolean(
            item.is_owner || 
            (state.currentUser && (
                (item.owner_id && state.currentUser.id === item.owner_id) ||
                (item.owner_name && (state.currentUser.username === item.owner_name || state.currentUser.display_name === item.owner_name))
            ))
        );

        if (isOwner) {
            dom.detailDeleteBtn.classList.remove('hidden');
            dom.detailEditBtn.classList.remove('hidden');
            dom.detailDeleteBtn.style.display = 'inline-flex';
            dom.detailEditBtn.style.display = 'inline-flex';
        } else {
            dom.detailDeleteBtn.classList.add('hidden');
            dom.detailEditBtn.classList.add('hidden');
            dom.detailDeleteBtn.style.display = 'none';
            dom.detailEditBtn.style.display = 'none';
        }

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
        const res = await fetch(`${API_BASE}/api/models/${modelId}`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const item = json.data;
        const isOwner = Boolean(
            item.is_owner || 
            (state.currentUser && (
                (item.owner_id && state.currentUser.id === item.owner_id) ||
                (item.owner_name && (state.currentUser.username === item.owner_name || state.currentUser.display_name === item.owner_name))
            ))
        );

        if (!isOwner) {
            showToast(state.currentLang === 'vi' ? 'Bạn không có quyền chỉnh sửa mô hình này!' : 'Unauthorized!', 'error');
            return;
        }

        dom.editModelId.value = item.id;
        dom.editNameInput.value = item.name || '';

        const cat = item.category || 'Car';
        let opt = dom.editCategorySelect.querySelector(`option[value="${cat}"]`);
        if (!opt) {
            const customOpt = dom.editCategorySelect.querySelector('option[value="__custom__"]');
            opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            if (customOpt) {
                dom.editCategorySelect.insertBefore(opt, customOpt);
            } else {
                dom.editCategorySelect.appendChild(opt);
            }
        }
        dom.editCategorySelect.value = cat;
        dom.editCustomCategoryWrap.classList.add('hidden');
        dom.editCustomCategoryInput.value = '';

        dom.editBrandInput.value = item.brand || '';
        dom.editScaleInput.value = item.scale || '';
        dom.editPriceInput.value = item.price !== null ? item.price : '';
        dom.editPurchaseDateInput.value = item.purchase_date || '';
        dom.editDescriptionInput.value = item.description || '';
        dom.editImageUrlInput.value = item.image_url && !item.image_url.startsWith('/uploads/') ? item.image_url : '';
        dom.editPreviewImg.src = sanitizeImageUrl(item.image_url);

        editSelectedFile = null;

        closeDetailsModal();
        dom.editModal.classList.add('show');
    } catch (err) {
        console.error('Lỗi mở form sửa:', err);
        showToast('Error loading model for editing', 'error');
    }
};

const closeEditModal = () => {
    dom.editModal.classList.remove('show');
    if (state.selectedModelId) {
        dom.detailsModal.classList.add('show');
    }
};

const handleEditModelSubmit = async (e) => {
    e.preventDefault();

    const modelId = dom.editModelId.value;
    const name = dom.editNameInput.value.trim();

    if (!name) {
        showToast(state.currentLang === 'vi' ? 'Tên mô hình không được để trống!' : 'Model name is required!', 'error');
        return;
    }

    dom.submitEditBtn.disabled = true;
    dom.submitEditBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';

    let category = dom.editCategorySelect.value;
    if (category === '__custom__') {
        category = dom.editCustomCategoryInput.value.trim();
        if (!category) {
            showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên danh mục tùy chỉnh!' : 'Please enter custom category name!', 'error');
            dom.editCustomCategoryInput.focus();
            dom.submitEditBtn.disabled = false;
            const dict = i18n[state.currentLang] || i18n.vi;
            dom.submitEditBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${dict.btnSaveChange}`;
            return;
        }
    }

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('brand', dom.editBrandInput.value.trim());
        formData.append('scale', dom.editScaleInput.value.trim());
        if (dom.editPriceInput.value) formData.append('price', dom.editPriceInput.value);
        if (dom.editPurchaseDateInput.value) formData.append('purchase_date', dom.editPurchaseDateInput.value);
        formData.append('description', dom.editDescriptionInput.value.trim());

        if (editSelectedFile) {
            formData.append('image', editSelectedFile);
        } else if (dom.editImageUrlInput.value.trim()) {
            formData.append('image_url', dom.editImageUrlInput.value.trim());
        }

        const headers = {};
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/models/${modelId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: headers,
            body: formData
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(state.currentLang === 'vi' ? 'Cập nhật thông tin mô hình thành công!' : 'Model updated successfully!', 'success');

        dom.editModal.classList.remove('show');
        loadModels();
        loadDashboardStats();
        openModelDetails(modelId);

    } catch (err) {
        console.error('Lỗi khi cập nhật mô hình:', err);
        showToast(err.message || 'Error updating model', 'error');
    } finally {
        dom.submitEditBtn.disabled = false;
        const dict = i18n[state.currentLang] || i18n.vi;
        dom.submitEditBtn.innerHTML = `<i class="fa-solid fa-check"></i> ${dict.btnSaveChange}`;
    }
};

// ============================================================================
// DELETE MODEL CONFIRMATION MODAL
// ============================================================================
const openDeleteConfirmModal = () => {
    const model = state.models.find(m => m.id === state.selectedModelId);
    if (!model) return;

    dom.deleteTargetName.textContent = `"${model.name}"`;
    closeDetailsModal();
    dom.deleteConfirmModal.classList.add('show');
};

const closeDeleteConfirmModal = () => {
    dom.deleteConfirmModal.classList.remove('show');
    if (state.selectedModelId) {
        dom.detailsModal.classList.add('show');
    }
};

const handleConfirmDelete = async () => {
    const modelId = state.selectedModelId;
    if (!modelId) return;

    dom.confirmDeleteActionBtn.disabled = true;
    dom.confirmDeleteActionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ...';

    try {
        const headers = {};
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/models/${modelId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: headers
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(json.message || 'Model deleted', 'success');

        dom.deleteConfirmModal.classList.remove('show');
        state.selectedModelId = null;
        loadModels();
        loadDashboardStats();

    } catch (err) {
        console.error('Lỗi khi xóa mô hình:', err);
        showToast(err.message || 'Error deleting model', 'error');
    } finally {
        dom.confirmDeleteActionBtn.disabled = false;
        const dict = i18n[state.currentLang] || i18n.vi;
        dom.confirmDeleteActionBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i> ${dict.btnDeletePermanent}`;
    }
};

// ============================================================================
// CUSTOM COLLECTIONS (THƯ VIỆN BỘ SƯU TẬP TÙY CHỈNH)
// ============================================================================
const loadCollections = async (tab = state.activeColTab) => {
    state.activeColTab = tab;

    if (tab === 'my') {
        dom.tabMyCols.classList.add('active');
        dom.tabPublicCols.classList.remove('active');

        if (!state.currentUser) {
            dom.collectionsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-surface); border-radius: var(--radius-md);">
                    <i class="fa-solid fa-lock" style="font-size: 2rem; color: var(--color-primary); margin-bottom: 12px;"></i>
                    <h3 style="margin-bottom: 8px;">${state.currentLang === 'vi' ? 'Vui lòng đăng nhập để xem thư viện cá nhân' : 'Please sign in to view your libraries'}</h3>
                    <p style="color: var(--text-muted); margin-bottom: 16px;">${state.currentLang === 'vi' ? 'Tạo và quản lý các bộ sưu tập riêng tư theo chủ đề bạn yêu thích.' : 'Curate and manage your own private themed libraries.'}</p>
                    <button class="btn btn-primary" onclick="openAuthModal('login')">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> ${i18n[state.currentLang].login}
                    </button>
                </div>
            `;
            dom.collectionsEmptyState.classList.add('hidden');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/collections`, {
                credentials: 'include'
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            state.collections = json.data;
            renderCollectionsGrid(state.collections);
        } catch (err) {
            console.error('Lỗi khi tải thư viện cá nhân:', err);
        }
    } else {
        dom.tabPublicCols.classList.add('active');
        dom.tabMyCols.classList.remove('active');

        try {
            const res = await fetch(`${API_BASE}/api/public/collections`, {
                credentials: 'include'
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            state.collections = json.data;
            renderCollectionsGrid(state.collections);
        } catch (err) {
            console.error('Lỗi khi tải thư viện công khai:', err);
        }
    }
};

const renderCollectionsGrid = (cols) => {
    if (!cols || cols.length === 0) {
        dom.collectionsGrid.innerHTML = '';
        dom.collectionsEmptyState.classList.remove('hidden');
        return;
    }

    dom.collectionsEmptyState.classList.add('hidden');

    dom.collectionsGrid.innerHTML = cols.map(col => {
        const cover = col.cover_image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
        const isPriv = col.visibility === 'private';
        const badgeClass = isPriv ? 'badge-private' : 'badge-public';
        const badgeIcon = isPriv ? 'fa-lock' : 'fa-globe';
        const badgeText = isPriv 
            ? (state.currentLang === 'vi' ? 'Riêng tư' : 'Private') 
            : (state.currentLang === 'vi' ? 'Công khai' : 'Public');

        return `
            <div class="collection-card" data-col-id="${col.id}">
                <div class="collection-cover" style="background-image: url('${cover}');">
                    <div class="collection-cover-overlay"></div>
                    <div class="collection-badge-wrap">
                        <span class="badge-privacy ${badgeClass}">
                            <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
                        </span>
                    </div>
                </div>
                <div class="collection-body">
                    <h3 class="collection-title">${col.name}</h3>
                    <p class="collection-desc">${col.description || (state.currentLang === 'vi' ? 'Chưa có mô tả' : 'No description')}</p>
                    <div class="collection-footer">
                        <span><i class="fa-solid fa-shapes"></i> ${col.model_count} ${i18n[state.currentLang].unitModels}</span>
                        <span><i class="fa-solid fa-user"></i> ${col.owner_name || 'Collector'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    dom.collectionsGrid.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', () => {
            const colId = parseInt(card.getAttribute('data-col-id'), 10);
            openCollectionDetails(colId);
        });
    });
};

const openCreateCollectionModal = () => {
    if (!state.currentUser) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng đăng nhập để tạo thư viện!' : 'Please sign in to create libraries!', 'error');
        openAuthModal('login');
        return;
    }
    dom.createColForm.reset();
    dom.colVisibilitySelect.value = 'private'; // Strictly defaults to private as requested!
    dom.createCollectionModal.classList.add('show');
    dom.colNameInput.focus();
};

const closeCreateCollectionModal = () => {
    dom.createCollectionModal.classList.remove('show');
};

const handleCreateCollectionSubmit = async (e) => {
    e.preventDefault();

    const name = dom.colNameInput.value.trim();
    if (!name) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên thư viện!' : 'Please enter library name!', 'error');
        return;
    }

    const description = dom.colDescInput.value.trim();
    const cover_image_url = dom.colCoverInput.value.trim();
    const visibility = dom.colVisibilitySelect.value || 'private';

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/collections`, {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({ name, description, cover_image_url, visibility })
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(json.message, 'success');
        closeCreateCollectionModal();
        loadCollections('my');

    } catch (err) {
        console.error('Lỗi tạo thư viện:', err);
        showToast(err.message || 'Error creating library', 'error');
    }
};

const openCollectionDetails = async (colId) => {
    state.selectedColId = colId;

    try {
        const res = await fetch(`${API_BASE}/api/collections/${colId}`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const col = json.data;

        dom.colDetailTitle.textContent = col.name;
        dom.colDetailDesc.textContent = col.description || (state.currentLang === 'vi' ? 'Chưa có mô tả cho thư viện này.' : 'No description.');
        dom.colDetailCount.textContent = (col.models || []).length;

        const isPriv = col.visibility === 'private';
        dom.colDetailVisibilityBadge.className = `badge-privacy ${isPriv ? 'badge-private' : 'badge-public'}`;
        dom.colDetailVisibilityBadge.innerHTML = `<i class="fa-solid ${isPriv ? 'fa-lock' : 'fa-globe'}"></i> ${isPriv ? (state.currentLang === 'vi' ? 'Riêng tư' : 'Private') : (state.currentLang === 'vi' ? 'Công khai' : 'Public')}`;

        if (col.is_owner) {
            dom.colOwnerActions.classList.remove('hidden');
        } else {
            dom.colOwnerActions.classList.add('hidden');
        }

        // Render models inside this collection
        if (!col.models || col.models.length === 0) {
            dom.colModelsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 30px;">
                    ${state.currentLang === 'vi' ? 'Thư viện này chưa có mô hình nào.' : 'No models in this library yet.'}
                </div>
            `;
        } else {
            dom.colModelsGrid.innerHTML = col.models.map(m => {
                const catClass = (m.category || 'other').toLowerCase();
                const iconClass = getCategoryIcon(m.category);

                return `
                    <div class="model-card" style="margin-bottom: 0;">
                        <div class="card-img-wrap" style="height: 140px;">
                            <img class="card-img" src="${sanitizeImageUrl(m.image_url)}" alt="${m.name}">
                            <div class="card-corner-tag card-corner-${catClass}"><i class="fa-solid ${iconClass}"></i></div>
                        </div>
                        <div class="card-content" style="padding: 12px;">
                            <span class="card-brand">${m.brand || '—'}</span>
                            <h4 class="card-model-name" style="font-size: 0.95rem;">${m.name}</h4>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                <span class="card-price-value">${formatCurrency(m.price)}</span>
                                ${col.is_owner ? `
                                    <button class="btn btn-danger-outline btn-sm remove-from-col-btn" data-model-id="${m.id}" title="Gỡ khỏi thư viện">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Bind remove buttons
            dom.colModelsGrid.querySelectorAll('.remove-from-col-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const mId = btn.getAttribute('data-model-id');
                    await removeModelFromCollection(col.id, mId);
                });
            });
        }

        dom.colDetailModal.classList.add('show');
    } catch (err) {
        console.error('Lỗi mở chi tiết thư viện:', err);
        showToast(err.message || 'Cannot access private library', 'error');
    }
};

const closeCollectionDetails = () => {
    dom.colDetailModal.classList.remove('show');
};

const removeModelFromCollection = async (colId, modelId) => {
    try {
        const headers = {};
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/collections/${colId}/models/${modelId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: headers
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(json.message, 'success');
        openCollectionDetails(colId);
        loadCollections();
    } catch (err) {
        showToast(err.message || 'Error removing model', 'error');
    }
};

const handleDeleteCollection = async () => {
    const colId = state.selectedColId;
    if (!colId) return;

    if (!confirm(state.currentLang === 'vi' ? 'Bạn có chắc chắn muốn xóa thư viện này?' : 'Delete this library?')) {
        return;
    }

    try {
        const headers = {};
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/collections/${colId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: headers
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(json.message, 'success');
        closeCollectionDetails();
        loadCollections('my');
    } catch (err) {
        showToast(err.message || 'Error deleting library', 'error');
    }
};

// Add Model To Collection Dialog
const openAddToCollectionModal = async () => {
    if (!state.currentUser) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng đăng nhập để dùng tính năng này!' : 'Please sign in!', 'error');
        openAuthModal('login');
        return;
    }

    const modelId = state.selectedModelId;
    const model = state.models.find(m => m.id === modelId);
    if (!model) return;

    state.selectedModelForCol = modelId;
    dom.targetModelNameForCol.textContent = model.name;

    try {
        const res = await fetch(`${API_BASE}/api/collections`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        if (!json.data || json.data.length === 0) {
            showToast(state.currentLang === 'vi' ? 'Bạn chưa có thư viện nào. Hãy tạo thư viện trước!' : 'Please create a library first!', 'info');
            navigateTo('libraries');
            closeDetailsModal();
            openCreateCollectionModal();
            return;
        }

        dom.selectUserCol.innerHTML = json.data.map(c => `
            <option value="${c.id}">${c.name} (${c.visibility === 'private' ? '🔒 Riêng tư' : '🌍 Công khai'})</option>
        `).join('');

        dom.addToColModal.classList.add('show');
    } catch (err) {
        showToast('Error loading collections', 'error');
    }
};

const closeAddToCollectionModal = () => {
    dom.addToColModal.classList.remove('show');
};

const handleConfirmAddToCol = async () => {
    const colId = dom.selectUserCol.value;
    const modelId = state.selectedModelForCol;

    if (!colId || !modelId) return;

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/collections/${colId}/models`, {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: JSON.stringify({ model_id: modelId })
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(json.message || 'Added to collection!', 'success');
        closeAddToCollectionModal();
    } catch (err) {
        showToast(err.message || 'Error adding to collection', 'error');
    }
};

// ============================================================================
// COLLECTION VOTING SYSTEM
// ============================================================================
const toggleVote = async (colId, btnEl) => {
    if (!state.currentUser) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng đăng nhập để bình chọn bộ sưu tập!' : 'Please sign in to vote for collections!', 'info');
        openAuthModal('login');
        return;
    }

    try {
        const headers = {};
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/collections/${colId}/vote`, {
            method: 'POST',
            credentials: 'include',
            headers: headers
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Cannot vote');
        }

        showToast(json.message, 'success');

        // Update all vote buttons and badges with this colId on the screen
        document.querySelectorAll(`.vote-btn[data-col-id="${colId}"]`).forEach(btn => {
            const countEl = btn.querySelector('.vote-count');
            if (countEl) countEl.textContent = json.votes_count;
            if (json.has_voted) {
                btn.classList.add('voted');
                btn.title = state.currentLang === 'vi' ? 'Bỏ thích' : 'Unlike';
            } else {
                btn.classList.remove('voted');
                btn.title = state.currentLang === 'vi' ? 'Bình chọn' : 'Vote';
            }
        });

        document.querySelectorAll(`.lb-vote-stat[data-col-id="${colId}"] .vote-count`).forEach(el => {
            el.textContent = json.votes_count;
        });

        // If on user profile, reload stats
        if (state.currentView === 'profile' && state.currentProfileUsername) {
            loadUserProfile(state.currentProfileUsername);
        }

    } catch (err) {
        showToast(err.message || 'Vote failed', 'error');
    }
};

// ============================================================================
// COMMUNITY COLLECTIONS
// ============================================================================
const loadCommunityCollections = async (search = state.communitySearch, sort = state.communitySort) => {
    state.communitySearch = search || '';
    state.communitySort = sort || 'most_voted';

    try {
        const params = new URLSearchParams();
        if (state.communitySearch) params.append('search', state.communitySearch);
        if (state.communitySort) params.append('sort', state.communitySort);

        const res = await fetch(`${API_BASE}/api/community/collections?${params.toString()}`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        state.communityCollections = json.data || [];
        renderCommunityGrid(state.communityCollections);
    } catch (err) {
        console.error('Lỗi tải cộng đồng:', err);
        showToast(err.message || 'Error loading community collections', 'error');
    }
};

const renderCommunityGrid = (cols) => {
    if (!cols || cols.length === 0) {
        dom.communityGrid.innerHTML = '';
        dom.communityEmptyState.classList.remove('hidden');
        return;
    }
    dom.communityEmptyState.classList.add('hidden');

    const dict = i18n[state.currentLang] || i18n.vi;

    dom.communityGrid.innerHTML = cols.map(col => {
        const cover = col.cover_image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
        const ownerInitial = (col.owner_name || col.owner_username || 'U').charAt(0).toUpperCase();
        const avatarHtml = col.owner_avatar 
            ? `<img src="${sanitizeImageUrl(col.owner_avatar)}" alt="${col.owner_name}">`
            : ownerInitial;

        return `
            <div class="collection-card" data-col-id="${col.id}">
                <div class="collection-cover" style="background-image: url('${cover}');">
                    <div class="collection-cover-overlay"></div>
                    <div class="collection-badge-wrap">
                        <span class="badge-privacy badge-public">
                            <i class="fa-solid fa-globe"></i> ${state.currentLang === 'vi' ? 'Công khai' : 'Public'}
                        </span>
                    </div>
                </div>
                <div class="collection-body">
                    <div class="col-card-creator" data-username="${col.owner_username}" title="${state.currentLang === 'vi' ? 'Xem trang cá nhân' : 'View profile'}">
                        <div class="creator-avatar">${avatarHtml}</div>
                        <div class="creator-meta">
                            <span class="creator-name">${col.owner_name || col.owner_username}</span>
                            <span class="creator-username">@${col.owner_username}</span>
                        </div>
                    </div>

                    <h3 class="collection-title">${col.name}</h3>
                    <p class="collection-desc">${col.description || (state.currentLang === 'vi' ? 'Chưa có mô tả' : 'No description')}</p>
                    
                    <div class="col-card-footer">
                        <span class="col-stats-badge">
                            <i class="fa-solid fa-shapes"></i> ${col.model_count || 0} ${dict.unitModels}
                        </span>
                        <button class="vote-btn ${col.has_voted ? 'voted' : ''}" data-col-id="${col.id}" title="${col.has_voted ? (state.currentLang === 'vi' ? 'Bỏ thích' : 'Unlike') : (state.currentLang === 'vi' ? 'Bình chọn' : 'Vote')}">
                            <i class="fa-solid fa-heart"></i>
                            <span class="vote-count">${col.votes_count || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    dom.communityGrid.querySelectorAll('.collection-card').forEach(card => {
        const colId = parseInt(card.getAttribute('data-col-id'), 10);

        const creatorEl = card.querySelector('.col-card-creator');
        if (creatorEl) {
            creatorEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const username = creatorEl.getAttribute('data-username');
                if (username) navigateToProfile(username);
            });
        }

        const voteBtn = card.querySelector('.vote-btn');
        if (voteBtn) {
            voteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleVote(colId, voteBtn);
            });
        }

        card.addEventListener('click', () => {
            openCollectionDetails(colId);
        });
    });
};

// ============================================================================
// TOP COLLECTIONS LEADERBOARD
// ============================================================================
const loadLeaderboard = async (period = state.leaderboardPeriod || 'all') => {
    state.leaderboardPeriod = period;

    if (dom.tabLbAllTime && dom.tabLbThisMonth) {
        if (period === 'all') {
            dom.tabLbAllTime.classList.add('active');
            dom.tabLbThisMonth.classList.remove('active');
        } else {
            dom.tabLbAllTime.classList.remove('active');
            dom.tabLbThisMonth.classList.add('active');
        }
    }

    try {
        const res = await fetch(`${API_BASE}/api/collections/leaderboard?period=${period}`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        state.leaderboardData = json.data || [];
        renderLeaderboard(state.leaderboardData);
    } catch (err) {
        console.error('Lỗi tải bảng xếp hạng:', err);
        showToast(err.message || 'Error loading leaderboard', 'error');
    }
};

const renderLeaderboard = (items) => {
    if (!items || items.length === 0) {
        dom.leaderboardList.innerHTML = '';
        dom.leaderboardEmptyState.classList.remove('hidden');
        return;
    }
    dom.leaderboardEmptyState.classList.add('hidden');

    const dict = i18n[state.currentLang] || i18n.vi;

    dom.leaderboardList.innerHTML = items.map((col, index) => {
        const rank = col.rank || (index + 1);
        let rankClass = 'rank-other';
        let rankIconOrNum = `#${rank}`;
        if (rank === 1) {
            rankClass = 'rank-1';
            rankIconOrNum = '<i class="fa-solid fa-crown"></i>';
        } else if (rank === 2) {
            rankClass = 'rank-2';
        } else if (rank === 3) {
            rankClass = 'rank-3';
        }

        const cover = col.cover_image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
        const ownerInitial = (col.owner_name || col.owner_username || 'U').charAt(0).toUpperCase();
        const avatarHtml = col.owner_avatar 
            ? `<img src="${sanitizeImageUrl(col.owner_avatar)}" alt="${col.owner_name}">`
            : ownerInitial;

        return `
            <div class="leaderboard-card" data-col-id="${col.id}">
                <div class="rank-badge ${rankClass}">${rankIconOrNum}</div>
                <img class="lb-thumb" src="${sanitizeImageUrl(cover)}" alt="${col.name}">
                <div class="lb-info">
                    <h3 class="lb-title">${col.name}</h3>
                    <div class="lb-meta">
                        <div class="col-card-creator" data-username="${col.owner_username}" style="margin-bottom: 0;" title="${state.currentLang === 'vi' ? 'Xem trang cá nhân' : 'View profile'}">
                            <div class="creator-avatar" style="width: 24px; height: 24px; font-size: 0.65rem;">${avatarHtml}</div>
                            <span class="creator-name" style="font-size: 0.8rem;">${col.owner_name || col.owner_username}</span>
                        </div>
                        <span><i class="fa-solid fa-shapes"></i> ${col.model_count || 0} ${dict.unitModels}</span>
                        <div class="lb-vote-stat" data-col-id="${col.id}">
                            <i class="fa-solid fa-heart"></i>
                            <span class="vote-count">${col.votes_count || 0}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="vote-btn ${col.has_voted ? 'voted' : ''}" data-col-id="${col.id}" title="${col.has_voted ? (state.currentLang === 'vi' ? 'Bỏ thích' : 'Unlike') : (state.currentLang === 'vi' ? 'Bình chọn' : 'Vote')}">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    <button class="btn btn-outline btn-sm lb-detail-btn" data-col-id="${col.id}">
                        ${dict.viewCollection || 'Chi tiết'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    dom.leaderboardList.querySelectorAll('.leaderboard-card').forEach(card => {
        const colId = parseInt(card.getAttribute('data-col-id'), 10);

        const creatorEl = card.querySelector('.col-card-creator');
        if (creatorEl) {
            creatorEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const username = creatorEl.getAttribute('data-username');
                if (username) navigateToProfile(username);
            });
        }

        const voteBtn = card.querySelector('.vote-btn');
        if (voteBtn) {
            voteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleVote(colId, voteBtn);
            });
        }

        const detailBtn = card.querySelector('.lb-detail-btn');
        if (detailBtn) {
            detailBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openCollectionDetails(colId);
            });
        }

        card.addEventListener('click', () => {
            openCollectionDetails(colId);
        });
    });
};

// ============================================================================
// USER PROFILE (/u/username)
// ============================================================================
const navigateToProfile = async (username, pushState = true) => {
    if (!username) {
        if (state.currentUser) {
            username = state.currentUser.username;
        } else {
            showToast(state.currentLang === 'vi' ? 'Không tìm thấy người dùng.' : 'User not found.', 'error');
            return;
        }
    }

    state.currentProfileUsername = username;
    navigateTo('profile');

    if (pushState && window.location.pathname !== `/u/${username}`) {
        window.history.pushState({ username }, '', `/u/${username}`);
    }

    await loadUserProfile(username);
};

const loadUserProfile = async (username) => {
    try {
        dom.profileDisplayName.textContent = state.currentLang === 'vi' ? 'Đang tải...' : 'Loading...';
        dom.profileUsername.textContent = `@${username}`;

        const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}/profile`, {
            credentials: 'include'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const data = json.data;
        state.profileData = data;

        // Cover banner
        if (data.cover_url) {
            dom.profileCoverBanner.style.backgroundImage = `url('${sanitizeImageUrl(data.cover_url)}')`;
        } else {
            dom.profileCoverBanner.style.backgroundImage = '';
        }

        // Avatar
        const initials = (data.display_name || data.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        if (data.avatar_url) {
            dom.profileAvatarLarge.innerHTML = `<img src="${sanitizeImageUrl(data.avatar_url)}" alt="${data.display_name}">`;
        } else {
            dom.profileAvatarLarge.textContent = initials;
        }

        // Text metadata
        dom.profileDisplayName.textContent = data.display_name || data.username;
        dom.profileUsername.textContent = `@${data.username}`;
        dom.profileBio.textContent = data.bio || (state.currentLang === 'vi' ? 'Người dùng này chưa cập nhật tiểu sử.' : 'No bio provided.');

        if (data.created_at) {
            const dateObj = new Date(data.created_at);
            dom.profileJoinedDate.textContent = dateObj.toLocaleDateString(state.currentLang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } else {
            dom.profileJoinedDate.textContent = '—';
        }

        // Stats
        dom.profileStatCollections.textContent = (data.stats && data.stats.public_collections_count) || 0;
        dom.profileStatModels.textContent = (data.stats && data.stats.public_models_count) || 0;
        dom.profileStatVotes.textContent = (data.stats && data.stats.total_votes_received) || 0;

        // Owner Controls
        if (data.is_self) {
            dom.profileOwnerControls.classList.remove('hidden');
        } else {
            dom.profileOwnerControls.classList.add('hidden');
        }

        renderProfileCollections(data.collections || []);

    } catch (err) {
        console.error('Lỗi tải profile:', err);
        showToast(err.message || 'Cannot load profile', 'error');
    }
};

const renderProfileCollections = (cols) => {
    if (!cols || cols.length === 0) {
        dom.profileCollectionsGrid.innerHTML = '';
        dom.profileEmptyState.classList.remove('hidden');
        return;
    }
    dom.profileEmptyState.classList.add('hidden');

    const dict = i18n[state.currentLang] || i18n.vi;

    dom.profileCollectionsGrid.innerHTML = cols.map(col => {
        const cover = col.cover_image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
        const isPriv = col.visibility === 'private';
        const badgeClass = isPriv ? 'badge-private' : 'badge-public';
        const badgeIcon = isPriv ? 'fa-lock' : 'fa-globe';
        const badgeText = isPriv 
            ? (state.currentLang === 'vi' ? 'Riêng tư' : 'Private') 
            : (state.currentLang === 'vi' ? 'Công khai' : 'Public');

        return `
            <div class="collection-card" data-col-id="${col.id}">
                <div class="collection-cover" style="background-image: url('${cover}');">
                    <div class="collection-cover-overlay"></div>
                    <div class="collection-badge-wrap">
                        <span class="badge-privacy ${badgeClass}">
                            <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
                        </span>
                    </div>
                </div>
                <div class="collection-body">
                    <h3 class="collection-title">${col.name}</h3>
                    <p class="collection-desc">${col.description || (state.currentLang === 'vi' ? 'Chưa có mô tả' : 'No description')}</p>
                    <div class="col-card-footer">
                        <span class="col-stats-badge">
                            <i class="fa-solid fa-shapes"></i> ${col.model_count || 0} ${dict.unitModels}
                        </span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${!isPriv ? `
                                <button class="vote-btn ${col.has_voted ? 'voted' : ''}" data-col-id="${col.id}" title="${col.has_voted ? (state.currentLang === 'vi' ? 'Bỏ thích' : 'Unlike') : (state.currentLang === 'vi' ? 'Bình chọn' : 'Vote')}">
                                    <i class="fa-solid fa-heart"></i>
                                    <span class="vote-count">${col.votes_count || 0}</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    dom.profileCollectionsGrid.querySelectorAll('.collection-card').forEach(card => {
        const colId = parseInt(card.getAttribute('data-col-id'), 10);

        const voteBtn = card.querySelector('.vote-btn');
        if (voteBtn) {
            voteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleVote(colId, voteBtn);
            });
        }

        card.addEventListener('click', () => {
            openCollectionDetails(colId);
        });
    });
};

// Edit Profile Modal
const openEditProfileModal = () => {
    if (!state.currentUser) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng đăng nhập!' : 'Please sign in!', 'error');
        openAuthModal('login');
        return;
    }

    const data = state.profileData || state.currentUser;
    dom.editProfileDisplayName.value = data.display_name || '';
    dom.editProfileBio.value = data.bio || '';
    dom.editProfileAvatarUrl.value = data.avatar_url || '';
    dom.editProfileCoverUrl.value = data.cover_url || '';
    if (dom.editProfileAvatarFile) dom.editProfileAvatarFile.value = '';
    if (dom.editProfileCoverFile) dom.editProfileCoverFile.value = '';

    dom.editProfileModal.classList.add('show');
    dom.editProfileDisplayName.focus();
};

const closeEditProfileModal = () => {
    dom.editProfileModal.classList.remove('show');
};

const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const displayName = dom.editProfileDisplayName.value.trim();
    if (!displayName) {
        showToast(state.currentLang === 'vi' ? 'Vui lòng nhập tên hiển thị!' : 'Please enter display name!', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('display_name', displayName);
        formData.append('bio', dom.editProfileBio.value.trim());

        const avatarFile = dom.editProfileAvatarFile && dom.editProfileAvatarFile.files[0];
        const coverFile = dom.editProfileCoverFile && dom.editProfileCoverFile.files[0];

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        } else if (dom.editProfileAvatarUrl.value.trim()) {
            formData.append('avatar_url', dom.editProfileAvatarUrl.value.trim());
        }

        if (coverFile) {
            formData.append('cover', coverFile);
        } else if (dom.editProfileCoverUrl.value.trim()) {
            formData.append('cover_url', dom.editProfileCoverUrl.value.trim());
        }

        const headers = {};
        if (state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;

        const res = await fetch(`${API_BASE}/api/users/profile`, {
            method: 'PUT',
            headers: headers,
            credentials: 'include',
            body: formData
        });

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast(json.message, 'success');
        closeEditProfileModal();

        // Update local current user state
        if (state.currentUser) {
            state.currentUser.display_name = json.data.display_name;
            state.currentUser.avatar_url = json.data.avatar_url;
            state.currentUser.cover_url = json.data.cover_url;
            updateAuthUI();
        }

        if (state.currentProfileUsername) {
            await loadUserProfile(state.currentProfileUsername);
        }

    } catch (err) {
        console.error('Lỗi cập nhật hồ sơ:', err);
        showToast(err.message || 'Cannot update profile', 'error');
    }
};

// ============================================================================
// FILTER & SEARCH LOGIC
// ============================================================================
const setupFilterEvents = () => {
    let debounceTimer = null;
    dom.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        state.searchQuery = query;

        dom.clearSearchBtn.style.display = query ? 'flex' : 'none';

        debounceTimer = setTimeout(() => {
            loadModels();
        }, 300);
    });

    dom.clearSearchBtn.addEventListener('click', () => {
        dom.searchInput.value = '';
        state.searchQuery = '';
        dom.clearSearchBtn.style.display = 'none';
        loadModels();
    });

    if (dom.categoryPillsContainer) {
        dom.categoryPillsContainer.addEventListener('click', (e) => {
            const pill = e.target.closest('.pill-btn');
            if (!pill) return;
            dom.categoryPillsContainer.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeCategory = pill.getAttribute('data-category');
            loadModels();
        });
    } else {
        dom.categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                dom.categoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.activeCategory = pill.getAttribute('data-category');
                loadModels();
            });
        });
    }

    dom.brandFilterSelect.addEventListener('change', (e) => {
        state.selectedBrand = e.target.value;
        loadModels();
    });

    dom.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        loadModels();
    });

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
    // Language Switcher Events
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

    // Theme Switchers
    if (dom.themeToggleBtn) dom.themeToggleBtn.addEventListener('click', toggleTheme);
    if (dom.mobileThemeToggleBtn) dom.mobileThemeToggleBtn.addEventListener('click', toggleTheme);

    // Custom Category Input Toggles
    if (dom.addCategorySelect) {
        dom.addCategorySelect.addEventListener('change', (e) => {
            if (e.target.value === '__custom__') {
                dom.addCustomCategoryWrap.classList.remove('hidden');
                dom.addCustomCategoryInput.focus();
            } else {
                dom.addCustomCategoryWrap.classList.add('hidden');
            }
        });
    }

    if (dom.editCategorySelect) {
        dom.editCategorySelect.addEventListener('change', (e) => {
            if (e.target.value === '__custom__') {
                dom.editCustomCategoryWrap.classList.remove('hidden');
                dom.editCustomCategoryInput.focus();
            } else {
                dom.editCustomCategoryWrap.classList.add('hidden');
            }
        });
    }

    // Top action buttons
    dom.refreshDataBtn.addEventListener('click', () => {
        const dict = i18n[state.currentLang] || i18n.vi;
        showToast(dict.toastRefreshing, 'info');
        loadDashboardStats();
        if (state.currentView === 'collection') loadModels();
        if (state.currentView === 'libraries') loadCollections();
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
    if (dom.topUserProfile) {
        dom.topUserProfile.addEventListener('click', () => {
            if (state.currentUser) {
                navigateToProfile(state.currentUser.username);
            } else {
                openAuthModal('login');
            }
        });
    }
    if (dom.sidebarUserBox) {
        dom.sidebarUserBox.addEventListener('click', () => {
            if (state.currentUser) {
                navigateToProfile(state.currentUser.username);
            }
        });
    }
    if (dom.topLoginBtn) dom.topLoginBtn.addEventListener('click', () => openAuthModal('login'));
    if (dom.sidebarLoginBtn) dom.sidebarLoginBtn.addEventListener('click', () => openAuthModal('login'));
    if (dom.quickLoginMobileBtn) dom.quickLoginMobileBtn.addEventListener('click', () => openAuthModal('login'));
    if (dom.sidebarLogoutBtn) dom.sidebarLogoutBtn.addEventListener('click', handleLogout);

    // Tab Switching in Auth Modal
    if (dom.authTabLogin) dom.authTabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (dom.authTabRegister) dom.authTabRegister.addEventListener('click', () => switchAuthTab('register'));
    if (dom.switchToRegisterLink) dom.switchToRegisterLink.addEventListener('click', () => switchAuthTab('register'));
    if (dom.switchToLoginLink) dom.switchToLoginLink.addEventListener('click', () => switchAuthTab('login'));

    // Forms in Auth Modal
    if (dom.loginForm) dom.loginForm.addEventListener('submit', handleLoginSubmit);
    if (dom.registerForm) dom.registerForm.addEventListener('submit', handleRegisterSubmit);
    if (dom.closeLoginModalBtn) dom.closeLoginModalBtn.addEventListener('click', closeAuthModal);
    if (dom.closeRegisterModalBtn) dom.closeRegisterModalBtn.addEventListener('click', closeAuthModal);

    // Toggle Password Visibility
    if (dom.toggleLoginPasswordBtn) {
        dom.toggleLoginPasswordBtn.addEventListener('click', () => {
            const isPassword = dom.loginPassword.type === 'password';
            dom.loginPassword.type = isPassword ? 'text' : 'password';
            dom.toggleLoginPasswordBtn.innerHTML = isPassword 
                ? '<i class="fa-regular fa-eye-slash"></i>' 
                : '<i class="fa-regular fa-eye"></i>';
        });
    }

    if (dom.toggleRegPasswordBtn) {
        dom.toggleRegPasswordBtn.addEventListener('click', () => {
            const isPassword = dom.regPassword.type === 'password';
            dom.regPassword.type = isPassword ? 'text' : 'password';
            dom.toggleRegPasswordBtn.innerHTML = isPassword 
                ? '<i class="fa-regular fa-eye-slash"></i>' 
                : '<i class="fa-regular fa-eye"></i>';
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
    dom.detailAddToColBtn.addEventListener('click', openAddToCollectionModal);

    // Edit Modal
    dom.closeEditModalBtn.addEventListener('click', closeEditModal);
    dom.cancelEditBtn.addEventListener('click', closeEditModal);

    // Delete Confirm Modal
    dom.cancelDeleteConfirmBtn.addEventListener('click', closeDeleteConfirmModal);
    dom.confirmDeleteActionBtn.addEventListener('click', handleConfirmDelete);

    // Custom Collections Listeners
    if (dom.openCreateColBtn) dom.openCreateColBtn.addEventListener('click', openCreateCollectionModal);
    if (dom.tabMyCols) dom.tabMyCols.addEventListener('click', () => loadCollections('my'));
    if (dom.tabPublicCols) dom.tabPublicCols.addEventListener('click', () => loadCollections('public'));
    if (dom.createColForm) dom.createColForm.addEventListener('submit', handleCreateCollectionSubmit);
    if (dom.closeCreateColModalBtn) dom.closeCreateColModalBtn.addEventListener('click', closeCreateCollectionModal);
    if (dom.cancelCreateColBtn) dom.cancelCreateColBtn.addEventListener('click', closeCreateCollectionModal);
    if (dom.closeColDetailModalBtn) dom.closeColDetailModalBtn.addEventListener('click', closeCollectionDetails);
    if (dom.closeColDetailBtn) dom.closeColDetailBtn.addEventListener('click', closeCollectionDetails);
    if (dom.deleteColBtn) dom.deleteColBtn.addEventListener('click', handleDeleteCollection);

    // Add To Collection Modal Listeners
    if (dom.closeAddToColModalBtn) dom.closeAddToColModalBtn.addEventListener('click', closeAddToCollectionModal);
    if (dom.cancelAddToColBtn) dom.cancelAddToColBtn.addEventListener('click', closeAddToCollectionModal);
    if (dom.confirmAddToColBtn) dom.confirmAddToColBtn.addEventListener('click', handleConfirmAddToCol);

    // Community View Listeners
    if (dom.communitySearchInput) {
        let commDebounce = null;
        dom.communitySearchInput.addEventListener('input', (e) => {
            clearTimeout(commDebounce);
            const q = e.target.value.trim();
            if (dom.clearCommunitySearchBtn) dom.clearCommunitySearchBtn.classList.toggle('hidden', !q);
            commDebounce = setTimeout(() => {
                loadCommunityCollections(q, dom.communitySortSelect ? dom.communitySortSelect.value : 'most_voted');
            }, 300);
        });
    }

    if (dom.clearCommunitySearchBtn) {
        dom.clearCommunitySearchBtn.addEventListener('click', () => {
            if (dom.communitySearchInput) dom.communitySearchInput.value = '';
            dom.clearCommunitySearchBtn.classList.add('hidden');
            loadCommunityCollections('', dom.communitySortSelect ? dom.communitySortSelect.value : 'most_voted');
        });
    }

    if (dom.communitySortSelect) {
        dom.communitySortSelect.addEventListener('change', (e) => {
            const q = dom.communitySearchInput ? dom.communitySearchInput.value.trim() : '';
            loadCommunityCollections(q, e.target.value);
        });
    }

    // Top Collections Leaderboard Tabs
    if (dom.tabLbAllTime) {
        dom.tabLbAllTime.addEventListener('click', () => loadLeaderboard('all'));
    }
    if (dom.tabLbThisMonth) {
        dom.tabLbThisMonth.addEventListener('click', () => loadLeaderboard('month'));
    }

    // User Profile & Edit Profile Modal Listeners
    if (dom.openEditProfileBtn) dom.openEditProfileBtn.addEventListener('click', openEditProfileModal);
    if (dom.closeEditProfileModalBtn) dom.closeEditProfileModalBtn.addEventListener('click', closeEditProfileModal);
    if (dom.cancelEditProfileBtn) dom.cancelEditProfileBtn.addEventListener('click', closeEditProfileModal);
    if (dom.editProfileForm) dom.editProfileForm.addEventListener('submit', handleProfileUpdate);

    // Close modals on clicking backdrop
    [
        dom.detailsModal, 
        dom.editModal, 
        dom.deleteConfirmModal, 
        dom.authModal,
        dom.createCollectionModal,
        dom.colDetailModal,
        dom.addToColModal,
        dom.editProfileModal
    ].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    });

    // Keyboard Shortcuts (Escape to close modals)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetailsModal();
            closeEditModal();
            closeDeleteConfirmModal();
            closeAuthModal();
            closeCreateCollectionModal();
            closeCollectionDetails();
            closeAddToCollectionModal();
            closeEditProfileModal();
            closeMobileSidebar();
        }
    });

    // History popstate routing
    window.addEventListener('popstate', () => {
        const path = window.location.pathname;
        const uMatch = path.match(/^\/u\/([a-zA-Z0-9_-]+)/);
        if (uMatch) {
            navigateToProfile(uMatch[1], false);
        } else if (window.location.hash) {
            const targetView = window.location.hash.replace('#', '');
            if (targetView) navigateTo(targetView);
        } else {
            navigateTo('dashboard');
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
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initEventListeners();
    setLanguage(state.currentLang, false);
    await checkCurrentUser();
    if (!state.currentUser) {
        openAuthModal('login');
    }
    checkSystemReadiness();

    // Handle URL routing (/u/username or #hash)
    const path = window.location.pathname;
    const uMatch = path.match(/^\/u\/([a-zA-Z0-9_-]+)/);
    if (uMatch) {
        navigateToProfile(uMatch[1], false);
    } else if (window.location.hash) {
        const targetView = window.location.hash.replace('#', '');
        if (['dashboard', 'collection', 'libraries', 'community', 'leaderboard', 'add-model'].includes(targetView)) {
            navigateTo(targetView);
        } else {
            navigateTo('dashboard');
        }
    } else {
        loadDashboardStats();
        loadModels();
    }

    setInterval(checkSystemReadiness, 30000);
});
