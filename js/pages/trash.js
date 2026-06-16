import { state } from "../store/state.js";
import { collection, addDoc,deleteDoc, onSnapshot, query, where, orderBy, doc, updateDoc, db } from "../config/firebase-config.js";

export const moveToTrash = async (id) => {
    await updateDoc(doc(db, "docs", id), { isDeleted: true, priority: "trash" });
    if (state.curId === id) {
        state.curId = null;
        const active = state.pages.filter(p => !p.isDeleted && p.id !== id);
        if (active.length > 0) window.select(active[0].id);
        else {
            document.getElementById("page-title").value = ""; 
            document.getElementById("page-content").value = "";
            document.getElementById("breadcrumb-title").innerText = "Untitled";
        }
    }
};

export const restorePage = async (id) => {
    await updateDoc(doc(db, "docs", id), { isDeleted: false, priority: "medium" });
    window.select(id);
};

export const deleteForever = async (id) => {
    if (confirm("Xóa vĩnh viễn trang này?")) await deleteDoc(doc(db, "docs", id));
};

// chuyển trang vào thùng rác bằng tổ hợp phím delete
document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" && state.curId) {
        e.preventDefault();
        window.moveToTrash(state.curId);
    }
});