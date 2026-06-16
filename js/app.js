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
import { render, loadData,select,createNewPage, exportPage, pagePriorityInput,pageTitleInput} from "./pages/pages.js";
import { moveToTrash, restorePage, deleteForever } from "./pages/trash.js";
import {openAuth
,closeAuth
,updateAuthUI
,authToggleBtn
,logout
,loadPublicPage
} from "./auth/auth.js";
import {save} from "./utils/autosave.js";
import { openHistoryModal, closeHistoryModal, restoreSelectedHistory } from "./history/history.js";
import { toggleFavourite, updateShareRole, copyPublicLink, toggleAllowFavourites } from "./utils/share.js";

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
window.logout = logout;
window.onAuthStateChanged = onAuthStateChanged;
window.save = save;
window.loadPublicPage = loadPublicPage;
window.openHistoryModal = openHistoryModal;
window.closeHistoryModal = closeHistoryModal;
window.restoreSelectedHistory = restoreSelectedHistory;
window.toggleFavourite = toggleFavourite;
window.updateShareRole = updateShareRole;
window.copyPublicLink = copyPublicLink;
window.toggleAllowFavourites = toggleAllowFavourites;










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








