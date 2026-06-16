// ================= 12. AUTO SAVE LOGIC =================
export const save = () => {
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