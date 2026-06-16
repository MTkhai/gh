// ================= 11. VERSION HISTORY (CHẶN NỔI BỌT CLICK) =================
export const openHistoryModal = async (e) => {
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

    const listContainer = document.getElementById("history-list");
    if (!listContainer) return;
    listContainer.innerHTML = `<div class="text-center py-6 text-gray-500 text-[11px]">⏳ Đang tìm bản lưu...</div>`;

    try {
        const q = query(collection(db, "history"), where("pageId", "==", state.curId), orderBy("ts", "desc"));
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
                state.selectedHistoryDoc = { id: docSnap.id, ...data };
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

export const closeHistoryModal = (e) => {
    if (e) e.stopPropagation(); 
    const sidebar = document.getElementById("history-sidebar");
    const innerContent = document.getElementById("history-sidebar-content");
    
    if (!innerContent || !sidebar) return;
    
    innerContent.classList.add("translate-x-full");
    setTimeout(() => {
        sidebar.classList.add("hidden");
        const p = state.pages.find(x => x.id === state.curId);
        if (p) {
            document.getElementById("page-title").value = p.title || "";
            document.getElementById("page-content").value = p.content || "";
        }
    }, 300);
};

export const restoreSelectedHistory = async () => {
    if (!state.selectedHistoryDoc || !state.curId) return;
    try {
        await updateDoc(doc(db, "docs", state.curId), {
            title: state.selectedHistoryDoc.title,
            content: state.selectedHistoryDoc.content,
            ts: Date.now()
        });
        window.closeHistoryModal();
    } catch (e) {
        alert("Khôi phục thất bại!");
    }
};