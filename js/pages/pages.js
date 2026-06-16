import{state} from "../store/state.js";
import { collection, addDoc,deleteDoc, onSnapshot, query, where, orderBy, doc, updateDoc, db } from "../config/firebase-config.js";
import { getRelativeTime } from "../utils/helpers.js";

// ================= 8. FIRESTORE SYNC & RENDER =================
export const loadData = (uid) => {
    if (state.un_sub) state.un_sub();
    state.un_sub = onSnapshot(query(collection(db, "docs"), where("uid", "==", uid), orderBy("ts", "asc")), (s) => {
        let temp = []; s.forEach(d => temp.push({id: d.id, ...d.data()}));
        state.pages = temp.reverse();
        render();
        const active = state.pages.filter(p => !p.isDeleted);
        if (!state.curId && active.length > 0) { window.select(active[0].id); return; }
        if (state.curId) {
            const current = state.pages.find(x => x.id === state.curId);
            if (current) {
                document.getElementById("breadcrumb-title").innerText = current.title || "Untitled";
                document.getElementById("page-priority").value = current.priority || "low";
                document.getElementById("page-edited-time").innerText = `Edited ${getRelativeTime(current.ts)}`;
            }
        }
    });
}

export const render = () => {
    const active = state.pages.filter(p => !p.isDeleted);
    const favorites = active.filter(p => p.isFavourite);
    const priorityIcons = { high: "🔴", medium: "🟡", low: "🔵", trash: "⚪" };

    document.getElementById("sidebar-favorites").innerHTML = favorites.map(p => {
        const favActiveClass = p.id === state.curId ? 'bg-[#2f2f2f] text-white' : 'text-gray-400';
        return `
            <div onclick="window.select('${p.id}')" class="p-1.5 rounded hover:bg-[#2f2f2f] cursor-pointer text-xs flex justify-between group ${favActiveClass}">
                <span class="truncate"><i class="fa-solid fa-star text-yellow-500 mr-1 text-[10px]"></i>${p.title || 'Untitled'}</span>
            </div>
        `;
    }).join('');

    document.getElementById("sidebar-pages").innerHTML = active.map(p => {
        const icon = priorityIcons[p.priority] || priorityIcons['low'];
        const activeClass = p.id === state.curId ? 'bg-[#2f2f2f] text-white' : 'text-gray-400';
        return `
            <div onclick="window.select('${p.id}')" class="p-1.5 rounded hover:bg-[#2f2f2f] cursor-pointer text-xs flex justify-between group ${activeClass}">
                <span class="truncate">
                    <span class="mr-1 text-[10px]">${icon}</span>
                    <i class="fa-regular fa-file-lines mr-1.5 text-gray-500"></i>
                    ${p.title || 'Untitled'}
                </span>
                <button onclick="event.stopPropagation(); window.moveToTrash('${p.id}')" class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 px-1">×</button>
            </div>
        `;
    }).join('');

    if (state.curId) {
    const curPage = state.pages.find(x => x.id === state.curId);
    const starIcon = document.getElementById("main-star-icon");
    const favZone = document.getElementById("dynamic-fav-zone");
    
    // Nếu là CHỦ bài viết đang xem trang của mình
    if (curPage && state.user && curPage.uid === state.user.uid) {
        if (starIcon) {
            if (curPage.isFavourite) {
                starIcon.className = "fa-solid fa-star text-yellow-500 cursor-pointer transition p-1 rounded hover:bg-[#2c2c2c]";
            } else {
                starIcon.className = "fa-regular fa-star text-gray-400 hover:text-white cursor-pointer transition p-1 rounded hover:bg-[#2c2c2c]";
            }
            // Gán sự kiện click chuẩn chỉ cho chủ bài viết
            starIcon.onclick = () => window.toggleFavourite(curPage.id, curPage.isFavourite);
        }
    }
}

    const deleted = state.pages.filter(p => p.isDeleted);
    document.getElementById("trash-count").innerText = deleted.length;
    const trashContainer = document.getElementById("trash-list");
    if (deleted.length === 0) {
        trashContainer.innerHTML = `<div class="text-center py-4 text-gray-600 text-[11px]">Trash is empty</div>`;
    } else {
        trashContainer.innerHTML = deleted.map(p => `
            <div class="flex items-center justify-between p-1.5 hover:bg-[#2f2f2f] rounded text-[11px] text-gray-300">
                <span class="truncate max-w-[140px] italic">${p.title || 'Untitled'}</span>
                <div class="flex space-x-1 shrink-0">
                    <button onclick="event.stopPropagation(); window.restorePage('${p.id}')" class="text-green-500 px-1 hover:bg-[#3f3f3f] rounded">Restore</button>
                    <button onclick="event.stopPropagation(); window.deleteForever('${p.id}')" class="text-red-500 px-1 hover:bg-[#3f3f3f] rounded">Del</button>
                </div>
            </div>
        `).join('');
    }
}

export const select = async (id) => {
    if (state.curId && state.curId !== id && state.user) {
        if (state.st) clearTimeout(state.st);
        const t = document.getElementById("page-title").value;
        const c = document.getElementById("page-content").value;
        const p = document.getElementById("page-priority").value;
        try { await updateDoc(doc(db, "docs", state.curId), { title: t, content: c, priority: p }); } catch (e) {}
    }
    
    state.curId = id;
    render(); 
    
    const p = state.pages.find(x => x.id === id);
    if (p) {
        document.getElementById("page-title").value = p.title || "";
        document.getElementById("page-content").value = p.content || "";
        document.getElementById("page-priority").value = p.priority || "low";
        document.getElementById("breadcrumb-title").innerText = p.title || "Untitled";
        document.getElementById("page-edited-time").innerText = `Edited ${getRelativeTime(p.ts)}`;
        
        const isPub = p.isPublic || false;
        if (document.getElementById("share-public-toggle")) document.getElementById("share-public-toggle").checked = isPub;
        if (document.getElementById("share-access-role")) document.getElementById("share-access-role").value = p.publicRole || "viewer";
        if (typeof updateShareUI === "function") updateShareUI(isPub);

        state.isPageLocked = false;
        state.isSmallText = false;
        
        document.getElementById("page-title").disabled = false;
        document.getElementById("page-content").disabled = false;
        if (document.getElementById("page-priority")) document.getElementById("page-priority").disabled = false;
        
        document.getElementById("page-title").className = "w-full bg-transparent text-4xl font-bold outline-none placeholder-white/10 text-white tracking-tight p-0 border-none focus:ring-0 mb-4";
        document.getElementById("page-content").className = "w-full h-[70vh] bg-transparent outline-none resize-none leading-relaxed text-base text-gray-300 placeholder-white/5 p-0 border-none focus:ring-0 font-normal";

        const lockInput = document.getElementById("toggle-lock-input");
        const smallTextInput = document.getElementById("toggle-small-text-input");
        if (lockInput) lockInput.checked = false;
        if (smallTextInput) smallTextInput.checked = false;
    }
};

export const createNewPage = async () => {
    if (!state.user) return;
    if (state.curId) {
        if (state.st) clearTimeout(state.st);
        try { await updateDoc(doc(db, "docs", state.curId), { title: document.getElementById("page-title").value, content: document.getElementById("page-content").value, priority: document.getElementById("page-priority").value }); } catch (e) {}
    }
    try {
        const docRef = await addDoc(collection(db, "docs"), { 
            uid: state.user.uid, title: "", content: "", priority: "low", 
            isDeleted: false, isFavourite: false, ts: Date.now(),
            allowFavourites: true, favouritesBy: [] // ✨ Đặc sản ae mình
        });
        window.select(docRef.id);
    } catch (e) {}
};

// tạo trang mới bằng tổ hợp phím ctrl+O
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        window.createNewPage();
    }
});
// xóa trang 
