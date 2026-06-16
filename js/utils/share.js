import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, db } from "../config/firebase-config.js";
import { state } from "../store/state.js";

// ================= 10. SHARE LINK & PHÂN QUYỀN ĐỘNG =================
export const togglePublicShare = async () => {
    if (!state.curId) return;
    const isChecked = document.getElementById("share-public-toggle").checked;
    const role = document.getElementById("share-access-role").value;
    
    // Giữ nguyên trạng thái bật/tắt cho phép thả sao hiện tại khi gạt share link
    const allowFavEl = document.getElementById("allow-fav-toggle");
    const allowFav = allowFavEl ? allowFavEl.checked : true;

    await updateDoc(doc(db, "docs", state.curId), { 
        isPublic: isChecked, 
        publicRole: isChecked ? role : 'viewer',
        allowFavourites: allowFav
    });
    updateShareUI(isChecked);
};

export const updateShareRole = async () => {
    if (!state.curId) return;
    const role = document.getElementById("share-access-role").value;
    await updateDoc(doc(db, "docs", state.curId), { publicRole: role });
};

export const copyPublicLink = () => {
    if (!state.curId) return;
    const publicUrl = `${window.location.origin}${window.location.pathname}?page=${state.curId}`;
    navigator.clipboard.writeText(publicUrl);
    alert("Đã copy link chia sẻ công khai rồi nha bro! 🚀");
};

export const toggleAllowFavourites = async () => {
    if (!state.curId) return;
    const isChecked = document.getElementById("allow-fav-toggle").checked;
    await updateDoc(doc(db, "docs", state.curId), { allowFavourites: isChecked });
};

export const toggleFavourite = async (pageId, currentStatus) => {
    if (!pageId) return;
    const pageRef = doc(db, "docs", pageId);
    const curPage = state.pages.find(x => x.id === pageId);

    // 1. Nếu là CHỦ bài viết tự bấm thích bài của mình
    if (curPage && state.user && curPage.uid === state.user.uid) {
        await updateDoc(pageRef, { isFavourite: !currentStatus });
        return;
    }

    // 2. Nếu là NGƯỜI NGOÀI (GUEST) bấm thả sao
    if (!state.user) {
        alert("Bro đăng nhập vào mới thả sao tích điểm được chứ! 😄");
        window.openAuth('login');
        return;
    }

    const docSnap = await getDoc(pageRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.allowFavourites === false) {
            alert("Chủ bài viết đã khoá quyền thả sao trang này rồi! 🔒");
            return;
        }

        let favouritesBy = data.favouritesBy || [];
        if (favouritesBy.includes(state.user.uid)) {
            favouritesBy = favouritesBy.filter(uid => uid !== state.user.uid);
        } else {
            favouritesBy.push(state.user.uid);
        }
        await updateDoc(pageRef, { favouritesBy: favouritesBy });
    }

};

export const updateShareUI = (isPublic) => {
    const settings = document.getElementById("share-public-settings");
    const msg = document.getElementById("share-private-msg");
    
    if (isPublic) { 
        if (settings) settings.classList.remove("hidden"); 
        if (msg) msg.classList.add("hidden"); 
        
        // Check xem có phải CHỦ đang mở bài của mình không
        const curPage = state.pages.find(x => x.id === state.curId);
        
        if (curPage) {
            // Đồng bộ nút gạt cho chủ bài viết
            const allowFavInput = document.getElementById("allow-fav-toggle");
            if (allowFavInput) {
                allowFavInput.checked = curPage.allowFavourites !== false; 
            }

            // Hiện danh sách mật vụ Stalker - CHỦ MỚI THẤY KHỐI NÀY
            const stalkerArea = document.getElementById("owner-only-stalker-zone");
            const stalkerContainer = document.getElementById("owner-fav-stalker-list");
            
            if (stalkerArea) stalkerArea.classList.remove("hidden");
            if (stalkerContainer) {
                const uids = curPage.favouritesBy || [];
                const strangerUids = uids.filter(uid => uid !== curPage.uid);

                if (strangerUids.length === 0) {
                    stalkerContainer.innerHTML = `<p class="text-[10px] text-gray-500 italic mt-1">Chưa có ai thả sao trang này bro à.</p>`;
                } else {
                    stalkerContainer.innerHTML = strangerUids.map(uid => `
                        <div class="flex items-center space-x-1.5 mt-1 text-[11px] text-gray-300 bg-[#252525] px-2 py-1 rounded w-fit border border-[#353535] font-mono">
                            <i class="fa-solid fa-user-secret text-yellow-500 text-[10px]"></i>
                            <span>User_..${uid.substring(0, 6)} đã thích bài viết</span>
                        </div>
                    `).join('');
                }
            }
        } else {
            // NẾU LÀ GUEST XEM LINK PUBLIC: Ẩn hoàn toàn, đố soi được list
            const stalkerArea = document.getElementById("owner-only-stalker-zone");
            if (stalkerArea) stalkerArea.classList.add("hidden");
        }
    } else { 
        if (settings) settings.classList.add("hidden"); 
        if (msg) msg.classList.remove("hidden"); 
    }
}