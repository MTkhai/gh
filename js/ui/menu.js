import { state } from "../store/state.js";


// ================= 3. POPUP MENU & TRASH TOGGLE (CHẶN NỔI BỌT) =================
export const toggleMenu = (e, menuId) => {
    if (e) e.stopPropagation();
    ['share-menu', 'more-menu', 'trash-menu', 'history-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === menuId) el.classList.toggle("hidden");
        else el.classList.add("hidden");
    });
};

export const toggleTrash = (e) => {
    if (e) e.stopPropagation();
    ['share-menu', 'more-menu', 'history-sidebar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });
    const trashMenu = document.getElementById("trash-menu");
    if (trashMenu) trashMenu.classList.toggle("hidden");
};

// ================= 13. MORE MENU DETAILED FUNCTIONS =================
export const copyPageContents = () => {
    const content = document.getElementById("page-content").value;
    if (!content) return alert("Trang trống không có gì để copy!");
    navigator.clipboard.writeText(content);
    alert("📋 Đã copy nội dung thuần vào Clipboard!");
};

export const toggleSmallText = () => {
    state.isSmallText = !state.isSmallText;
    const title = document.getElementById("page-title");
    const content = document.getElementById("page-content");
    
    if (state.isSmallText) {
        title.classList.add("text-xl"); title.classList.remove("text-4xl");
        content.classList.add("text-xs"); content.classList.remove("text-base");
    } else {
        title.classList.add("text-4xl"); title.classList.remove("text-xl");
        content.classList.add("text-base"); content.classList.remove("text-xs");
    }
    document.getElementById("toggle-small-text-input").checked = state.isSmallText;
};

export const toggleLockPage = () => {
    state.isPageLocked = !state.isPageLocked;
    const title = document.getElementById("page-title");
    const content = document.getElementById("page-content");
    const priority = document.getElementById("page-priority");

    title.disabled = state.isPageLocked;
    content.disabled = state.isPageLocked;
    if (priority) priority.disabled = state.isPageLocked;

    document.getElementById("toggle-lock-input").checked = state.isPageLocked;
    alert(state.isPageLocked ? "🔒 Đã khóa trang!" : "🔓 Đã mở khóa trang!");
};

export const translatePage = async (lang) => {
    const contentBox = document.getElementById("page-content");
    const text = contentBox.value;
    if (!text) return alert("Không có văn bản để dịch!");
    
    alert(`⚡ Đang dịch sang ${lang === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'}...`);
    let translatedText = lang === 'en' 
        ? " [Translated to EN]:\n" + text.replace(/Xin chào/gi, "Hello").replace(/Cảm ơn/gi, "Thank you")
        : " [Đã dịch sang VI]:\n" + text.replace(/Hello/gi, "Xin chào").replace(/Thank you/gi, "Cảm ơn");
    
    contentBox.value = translatedText;
    save();
};

// ================= 5. MORE MENU EXTRA ACTIONS =================
export const changeFont = (fontClass) => {
    const title = document.getElementById("page-title");
    const content = document.getElementById("page-content");
    if (title && content) {
        [title, content].forEach(el => {
            el.classList.remove("font-sans", "font-serif", "font-mono");
            el.classList.add(fontClass);
        });
    }
};

export const changePageWidth = (e) => {
    const editorContainer = document.getElementById("editor-container");
    if (!editorContainer) return;
    editorContainer.setAttribute("data-layout", e.target.checked ? "full" : "normal");
};

export const duplicatePage = async () => {
    if (!state.curId || !state.user) return;
    const curPage = state.pages.find(p => p.id === state.curId);
    if (!curPage) return;
    try {
        const docRef = await addDoc(collection(db, "docs"), {
            uid: state.user.uid, title: `${curPage.title || "Untitled"} (Copy)`,
            content: curPage.content || "", priority: curPage.priority || "low",
            isDeleted: false, isFavourite: false, ts: Date.now()
        });
        window.select(docRef.id);
    } catch (e) {
        console.error("Lỗi duplicate:", e);
    }
};

export const triggerDeleteFromMenu = () => { if (state.curId) window.moveToTrash(state.curId); };
