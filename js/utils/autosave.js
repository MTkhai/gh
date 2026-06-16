import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, db } from "../config/firebase-config.js";
import { state } from "../store/state.js";

// ================= 12. AUTO SAVE LOGIC =================
export const save = () => {
    if (state.st) clearTimeout(state.st);
    state.st = setTimeout(async () => { 
        if (!state.curId) return;
        const t = document.getElementById("page-title").value;
        const c = document.getElementById("page-content").value;
        const p = document.getElementById("page-priority").value;
        
        if (p === "trash") {
            await updateDoc(doc(db, "docs", state.curId), { title: t, content: c, priority: p, isDeleted: true, ts: Date.now() });
            state.curId = null;
            const act = state.pages.filter(x => !x.isDeleted && x.id !== state.curId);
            if (act.length > 0) window.select(act[0].id);
            else { document.getElementById("page-title").value = ""; document.getElementById("page-content").value = ""; }
        } else {
            const docRef = doc(db, "docs", state.curId);
            if (state.user) {
                await updateDoc(docRef, { title: t, content: c, priority: p, isDeleted: false, ts: Date.now() }); 
            } else {
                await updateDoc(docRef, { title: t, content: c, ts: Date.now() }); 
            }
        }

        const now = Date.now();
        const timeInterval = 45 * 1000;
        const pageLastSave = lastSnapshotTimeMap[state.curId] || 0;
        
        if (now - pageLastSave > timeInterval && c.trim() !== "") {
            try {
                await addDoc(collection(db, "history"), { 
                    pageId: state.curId, title: t, content: c, 
                    preview: c.substring(0, 40).replace(/\n/g, " "), ts: now 
                });
                lastSnapshotTimeMap[state.curId] = now; 
                console.log(`🔒 Checkpoint 45s chốt tại trang: ${state.curId}`);
            } catch (e) {
                console.error("Snapshot thất bại:", e);
            }
        }
    }, 500);
};