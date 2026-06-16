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
,authForm
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
window.save = save;
window.loadPublicPage = loadPublicPage;
window.openHistoryModal = openHistoryModal;
window.closeHistoryModal = closeHistoryModal;
window.restoreSelectedHistory = restoreSelectedHistory;
window.toggleFavourite = toggleFavourite;
window.updateShareRole = updateShareRole;
window.copyPublicLink = copyPublicLink;
window.toggleAllowFavourites = toggleAllowFavourites;



















