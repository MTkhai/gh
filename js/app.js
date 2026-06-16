import { db, auth, collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, where, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getDocs } from "./config/firebase-config.js";
import { getRelativeTime } from "./utils/helpers.js";
import {
  toggleMenu,
  toggleTrash,
  toggleSmallText,
  toggleLockPage,
  translatePage,
  copyPageContents,
  changeFont,
  changePageWidth,
  duplicatePage,
  triggerDeleteFromMenu

} from "./ui/menu.js";
import {
  openSearch,
  closeSearch,
  runSearch,
} from "./search/search.js";

import { state } from "./store/state.js";
import { render, loadData,select,createNewPage} from "./pages/pages.js";
import { moveToTrash, restorePage, deleteForever } from "./pages/trash.js";
import {openAuth
,closeAuth
,updateAuthUI
,authToggleBtn
,logout
,onAuthStateChanged
,loadPublicPage
} from "./auth/auth.js";
// ================= 1. KHAI BÁO BIẾN TOÀN CỤC HỆ THỐNG =================


// ================= 2.Gắn tên hàm sự kiện =================
window.toggleMenu = toggleMenu;
window.toggleTrash = toggleTrash;
window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.runSearch = runSearch;
window.toggleSmallText = toggleSmallText;
window.toggleLockPage = toggleLockPage;
window.translatePage = translatePage;
window.copyPageContents = copyPageContents;
window.changeFont = changeFont;
window.changePageWidth = changePageWidth;
window.duplicatePage = duplicatePage;
window.triggerDeleteFromMenu = triggerDeleteFromMenu;
window.pageState = state;
window.render = render;
window.loadData = loadData;
window.select = select;
window.createNewPage = createNewPage;
window.restorePage = restorePage;
window.deleteForever = deleteForever;
window.moveToTrash = moveToTrash;
window.openAuth = openAuth;
window.closeAuth = closeAuth;
window.updateAuthUI = updateAuthUI;
window.authToggleBtn = authToggleBtn;
window.authForm = authForm;
window.logout = () => signOut(auth);
window.onAuthStateChanged = onAuthStateChanged;
window.loadPublicPage = loadPublicPage;










// ================= 9. AUTO SAVE & SLASH MENU LỆNH NOTION =================
const textarea = document.getElementById("page-content");
const slashMenu = document.getElementById("slash-menu");
let activeSlashIndex = 0;
const slashCommands = ['h2', 'h3', 'h4', 'bullet', 'number', 'todo', 'toggle'];

function updateSlashMenuHighlight() {
    if (!slashMenu) return;
    const buttons = slashMenu.querySelectorAll("button");
    buttons.forEach((btn, idx) => {
        if (idx === activeSlashIndex) btn.classList.add("bg-[#2f2f2f]", "text-white");
        else btn.classList.remove("bg-[#2f2f2f]", "text-white");
    });
}

if (textarea) {
    textarea.addEventListener("input", (e) => {
        const value = textarea.value;
        const textBefore = value.substring(0, textarea.selectionStart);
        const currentLine = textBefore.split("\n").pop();

        if (slashMenu) {
            if (currentLine === "/" || currentLine.endsWith(" /")) {
                slashMenu.classList.remove("hidden");
                activeSlashIndex = 0;
                updateSlashMenuHighlight();
                const lineCount = textBefore.split("\n").length;
                slashMenu.style.top = `${Math.min(lineCount * 24, 400)}px`;
            } else {
                if (!slashMenu.classList.contains("hidden")) slashMenu.classList.add("hidden");
            }
        }
        save();
    });

    textarea.addEventListener("keydown", (e) => {
        if (slashMenu && !slashMenu.classList.contains("hidden")) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                activeSlashIndex = (activeSlashIndex + 1) % slashCommands.length;
                updateSlashMenuHighlight();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                activeSlashIndex = (activeSlashIndex - 1 + slashCommands.length) % slashCommands.length;
                updateSlashMenuHighlight();
            } else if (e.key === "Enter") {
                e.preventDefault();
                window.executeSlashCommand(slashCommands[activeSlashIndex]);
            } else if (e.key === "Escape") {
                e.preventDefault();
                slashMenu.classList.add("hidden");
                const val = textarea.value; const start = textarea.selectionStart;
                if (val.substring(start - 1, start) === "/") {
                    textarea.value = val.substring(0, start - 1) + val.substring(start);
                    textarea.selectionStart = textarea.selectionEnd = start - 1;
                }
            }
        }
    });
}

window.executeSlashCommand = async (type) => {
    if (!textarea) return;
    const value = textarea.value;
    const start = textarea.selectionStart;
    const textBefore = value.substring(0, start);
    const lastSlashIndex = textBefore.lastIndexOf("/");
    
    if (lastSlashIndex === -1) return;

    const beforeSlash = value.substring(0, lastSlashIndex);
    const afterSlash = value.substring(start);
    
    let template = "";
    if (type === 'h2') template = "------------ ";
    else if (type === 'h3') template = "═══ ";
    else if (type === 'h4') template = "--- ";
    else if (type === 'bullet') template = "• ";
    else if (type === 'number') template = "1. ";
    else if (type === 'todo') template = "[ ] ";
    else if (type === 'toggle') template = "▶ ";

    textarea.value = beforeSlash + template + afterSlash;
    textarea.selectionStart = textarea.selectionEnd = beforeSlash.length + template.length;
    
    if (slashMenu) slashMenu.classList.add("hidden");
    textarea.focus();
    save();
};

document.addEventListener("click", (e) => {
    if (slashMenu && !slashMenu.contains(e.target) && e.target !== textarea) slashMenu.classList.add("hidden");
});

// ================= 10. SHARE LINK & PHÂN QUYỀN ĐỘNG =================
window.togglePublicShare = async () => {
    if (!curId) return;
    const isChecked = document.getElementById("share-public-toggle").checked;
    const role = document.getElementById("share-access-role").value;
    
    // Giữ nguyên trạng thái bật/tắt cho phép thả sao hiện tại khi gạt share link
    const allowFavEl = document.getElementById("allow-fav-toggle");
    const allowFav = allowFavEl ? allowFavEl.checked : true;

    await updateDoc(doc(db, "docs", curId), { 
        isPublic: isChecked, 
        publicRole: isChecked ? role : 'viewer',
        allowFavourites: allowFav
    });
    updateShareUI(isChecked);
};

window.updateShareRole = async () => {
    if (!curId) return;
    const role = document.getElementById("share-access-role").value;
    await updateDoc(doc(db, "docs", curId), { publicRole: role });
};

window.copyPublicLink = () => {
    if (!curId) return;
    const publicUrl = `${window.location.origin}${window.location.pathname}?page=${curId}`;
    navigator.clipboard.writeText(publicUrl);
    alert("Đã copy link chia sẻ công khai rồi nha bro! 🚀");
};

window.toggleAllowFavourites = async () => {
    if (!curId) return;
    const isChecked = document.getElementById("allow-fav-toggle").checked;
    await updateDoc(doc(db, "docs", curId), { allowFavourites: isChecked });
};

window.toggleFavourite = async (pageId, currentStatus) => {
    if (!pageId) return;
    const pageRef = doc(db, "docs", pageId);
    const curPage = pages.find(x => x.id === pageId);

    // 1. Nếu là CHỦ bài viết tự bấm thích bài của mình
    if (curPage && user && curPage.uid === user.uid) {
        await updateDoc(pageRef, { isFavourite: !currentStatus });
        return;
    }

    // 2. Nếu là NGƯỜI NGOÀI (GUEST) bấm thả sao
    if (!user) {
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
        if (favouritesBy.includes(user.uid)) {
            favouritesBy = favouritesBy.filter(uid => uid !== user.uid);
        } else {
            favouritesBy.push(user.uid);
        }
        await updateDoc(pageRef, { favouritesBy: favouritesBy });
    }
};
// ================= 11. VERSION HISTORY (CHẶN NỔI BỌT CLICK) =================
window.openHistoryModal = async (e) => {
    if (e) e.stopPropagation(); 

    ['share-menu', 'more-menu', 'trash-menu'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });

    const sidebar = document.getElementById("history-sidebar");
    const innerContent = document.getElementById("history-sidebar-content");
    
    if (!sidebar || !innerContent) return;

    sidebar.classList.remove("hidden");
    setTimeout(() => innerContent.classList.remove("translate-x-full"), 10);

    innerContent.onclick = (event) => event.stopPropagation();

    const restoreBtn = document.getElementById("btn-restore-history");
    if (restoreBtn) restoreBtn.disabled = true;
    selectedHistoryDoc = null;

    const listContainer = document.getElementById("history-list");
    if (!listContainer) return;
    listContainer.innerHTML = `<div class="text-center py-6 text-gray-500 text-[11px]">⏳ Đang tìm bản lưu...</div>`;

    try {
        const q = query(collection(db, "history"), where("pageId", "==", curId), orderBy("ts", "desc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            listContainer.innerHTML = `<div class="text-center py-6 text-gray-500 text-[11px]">📭 Không có dữ liệu lịch sử.</div>`;
            return;
        }

        listContainer.innerHTML = "";
        snap.forEach(docSnap => {
            const data = docSnap.data();
            const dateObj = new Date(data.ts);
            const isToday = dateObj.toDateString() === new Date().toDateString();
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const dateStr = isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

            const btn = document.createElement("button");
            btn.className = "w-full text-left px-3 py-2 rounded-md hover:bg-[#252525] transition flex flex-col focus:outline-none border border-transparent text-gray-300";
            
            btn.onclick = (event) => {
                if (event) event.stopPropagation(); 

                document.querySelectorAll("#history-list button").forEach(b => b.classList.remove("bg-[#2c2c2c]"));
                btn.classList.add("bg-[#2c2c2c]");

                document.getElementById("page-title").value = data.title || "";
                document.getElementById("page-content").value = data.content || "";
                
                if (restoreBtn) restoreBtn.disabled = false;
                selectedHistoryDoc = { id: docSnap.id, ...data };
            };

            btn.innerHTML = `
                <span class="text-xs font-medium text-gray-200">${dateStr} · ${timeStr}</span>
                <span class="text-[10px] text-gray-500 font-mono mt-0.5">kcott</span>
            `;
            listContainer.appendChild(btn);
        });

    } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
        listContainer.innerHTML = `<div class="text-center py-6 text-red-500 text-[11px]">❌ Lỗi tải dữ liệu.</div>`;
    }
};

window.closeHistoryModal = (e) => {
    if (e) e.stopPropagation(); 
    const sidebar = document.getElementById("history-sidebar");
    const innerContent = document.getElementById("history-sidebar-content");
    
    if (!innerContent || !sidebar) return;
    
    innerContent.classList.add("translate-x-full");
    setTimeout(() => {
        sidebar.classList.add("hidden");
        const p = pages.find(x => x.id === curId);
        if (p) {
            document.getElementById("page-title").value = p.title || "";
            document.getElementById("page-content").value = p.content || "";
        }
    }, 300);
};

window.restoreSelectedHistory = async () => {
    if (!selectedHistoryDoc || !curId) return;
    try {
        await updateDoc(doc(db, "docs", curId), {
            title: selectedHistoryDoc.title,
            content: selectedHistoryDoc.content,
            ts: Date.now()
        });
        window.closeHistoryModal();
    } catch (e) {
        alert("Khôi phục thất bại!");
    }
};

// ================= 12. AUTO SAVE LOGIC =================
const save = () => {
    if (st) clearTimeout(st);
    st = setTimeout(async () => { 
        if (!curId) return;
        const t = document.getElementById("page-title").value;
        const c = document.getElementById("page-content").value;
        const p = document.getElementById("page-priority").value;
        
        if (p === "trash") {
            await updateDoc(doc(db, "docs", curId), { title: t, content: c, priority: p, isDeleted: true, ts: Date.now() });
            curId = null;
            const act = pages.filter(x => !x.isDeleted && x.id !== curId);
            if (act.length > 0) window.select(act[0].id);
            else { document.getElementById("page-title").value = ""; document.getElementById("page-content").value = ""; }
        } else {
            const docRef = doc(db, "docs", curId);
            if (user) {
                await updateDoc(docRef, { title: t, content: c, priority: p, isDeleted: false, ts: Date.now() }); 
            } else {
                await updateDoc(docRef, { title: t, content: c, ts: Date.now() }); 
            }
        }

        const now = Date.now();
        const timeInterval = 45 * 1000;
        const pageLastSave = lastSnapshotTimeMap[curId] || 0;
        
        if (now - pageLastSave > timeInterval && c.trim() !== "") {
            try {
                await addDoc(collection(db, "history"), { 
                    pageId: curId, title: t, content: c, 
                    preview: c.substring(0, 40).replace(/\n/g, " "), ts: now 
                });
                lastSnapshotTimeMap[curId] = now; 
                console.log(`🔒 Checkpoint 45s chốt tại trang: ${curId}`);
            } catch (e) {
                console.error("Snapshot thất bại:", e);
            }
        }
    }, 500);
};


function updateShareUI(isPublic) {
    const settings = document.getElementById("share-public-settings");
    const msg = document.getElementById("share-private-msg");
    
    if (isPublic) { 
        if (settings) settings.classList.remove("hidden"); 
        if (msg) msg.classList.add("hidden"); 
        
        // Check xem có phải CHỦ đang mở bài của mình không
        const curPage = pages.find(x => x.id === curId);
        
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
window.exportPage = (format) => {
    const title = document.getElementById("page-title").value || "Untitled";
    const content = document.getElementById("page-content").value;
    let fileContent = format === 'md' ? `# ${title}\n\n${content}` : `TIÊU ĐỀ: ${title}\nNỘI DUNG:\n${content}`;
    
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.${format === 'md' ? 'md' : 'txt'}`;
    a.click();
};

const pageTitleInput = document.getElementById("page-title");
const pagePriorityInput = document.getElementById("page-priority");
if (pageTitleInput) pageTitleInput.oninput = save;
if (pagePriorityInput) pagePriorityInput.onchange = save;