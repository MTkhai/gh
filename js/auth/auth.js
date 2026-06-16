import { db, auth, collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, where, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "../config/firebase-config.js";
import { state } from "../store/state.js";
import { loadData } from "../pages/pages.js";
// ================= 2. ĐẬP CÁC HÀM GIAO DIỆN LÊN ĐẦU ĐỂ KHÔNG BỊ CHẶN LỖI =================
export const openAuth = (type) => {
    state.isLogin = (type === 'login');
    const modal = document.getElementById("auth-modal");
    if (modal) { 
        modal.classList.remove("hidden"); 
        modal.classList.add("flex"); 
        updateAuthUI(); 
    }
};

export const closeAuth = () => {
    const modal = document.getElementById("auth-modal");
    if (modal) { modal.classList.add("hidden"); modal.classList.remove("flex"); }
};

export const updateAuthUI = () => {
    const title = document.getElementById("auth-title");
    const btn = document.getElementById("auth-toggle-btn");
    if (title) title.innerText = state.isLogin ? "Sign in to Zotion" : "Create account";
    if (btn) btn.innerText = state.isLogin ? "Sign up" : "Sign in";
};


document.addEventListener("click", () => {
    ['share-menu', 'more-menu', 'trash-menu', 'history-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });
});






// ================= 7. AUTHENTICATION & GUEST MODE =================
export const authToggleBtn = document.getElementById("auth-toggle-btn");
if (authToggleBtn) {
    authToggleBtn.onclick = () => { state.isLogin = !state.isLogin; updateAuthUI(); };
}

export const authForm = document.getElementById("auth-form");
if (authForm) {
    authForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-email").value, pass = document.getElementById("auth-password").value;
        try {
            if (state.isLogin) await signInWithEmailAndPassword(auth, email, pass);
            else await createUserWithEmailAndPassword(auth, email, pass);
            window.closeAuth();
        } catch (err) { alert(err.message); }
    };
}

export const logout = () => signOut(auth);



onAuthStateChanged(auth, (u) => {
    const landing = document.getElementById("landing-page"), dash = document.getElementById("dashboard");
    if (!landing || !dash) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPageId = urlParams.get('page');

    if (u) {
        state.user = u; landing.classList.add("hidden"); dash.classList.remove("hidden");
        setTimeout(() => dash.classList.add("opacity-100"), 50);
        document.getElementById("user-display").innerText = `${u.email.split('@')[0]}'s Zotion`;
        loadData(u.uid);
    } else {
        if (sharedPageId) {
            state.user = null; landing.classList.add("hidden"); dash.classList.remove("hidden");
            setTimeout(() => dash.classList.add("opacity-100"), 50);
            document.getElementById("user-display").innerText = `Guest Mode 🌐`;
            document.querySelector("aside").classList.add("hidden");
            loadPublicPage(sharedPageId);
        } else {
            state.user = null; landing.classList.remove("hidden"); dash.classList.add("hidden");
            state.curId = null; state.pages = [];
        }
    }
});

export const loadPublicPage = async (pageId) => {
    state.curId = pageId;
    onSnapshot(doc(db, "docs", pageId), async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            state.currentPublicPageData = { id: docSnap.id, ...data };
            
            if (data.isPublic) {
                document.getElementById("page-title").value = data.title || "";
                document.getElementById("page-content").value = data.content || "";
                document.getElementById("breadcrumb-title").innerText = data.title || "Shared Page";
                
                const isEditor = data.publicRole === 'editor';
                document.getElementById("page-title").disabled = !isEditor;
                document.getElementById("page-content").disabled = !isEditor;
                if (document.getElementById("page-priority")) document.getElementById("page-priority").disabled = true;

                // 🌟 XỬ LÝ ĐẶC SẢN HIỂN THỊ CHO GUEST
                const favZone = document.getElementById("dynamic-fav-zone");
                if (favZone) {
                    if (data.allowFavourites !== false) {
                        const totalFavs = data.favouritesBy ? data.favouritesBy.length : 0;
                        const userHasFav = state.user && data.favouritesBy && data.favouritesBy.includes(state.user.uid);
                        
                        // Khách chỉ nhìn thấy nút bấm + Tổng số lượt sao, không có list tên!
                        favZone.innerHTML = `
                            <button onclick="window.toggleFavourite('${pageId}', false)" class="flex items-center space-x-1 px-2 py-0.5 bg-[#252525] hover:bg-[#2f2f2f] rounded text-xs transition border border-[#3f3f3f] text-gray-300">
                                <i class="${userHasFav ? 'fa-solid text-yellow-500' : 'fa-regular text-gray-400'} fa-star"></i>
                                <span class="font-medium text-[11px]">${totalFavs}</span>
                            </button>
                        `;
                    } else {
                        // Nếu chủ bài viết tắt quyền, hiện ổ khoá
                        favZone.innerHTML = `<i class="fa-solid fa-lock text-gray-600 text-xs p-1" title="Favorites disabled by owner"></i>`;
                    }
                }
            }
        }
    });
}