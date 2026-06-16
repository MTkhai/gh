
import { state } from "../store/state.js";

// ================= 6. LOGIC TÌM KIẾM (SEARCH) =================
export const openSearch = () => {
    const modal = document.getElementById("search-modal");
    if (modal) {
        modal.classList.remove("hidden"); 
        modal.classList.add("flex");
        const input = document.getElementById("search-input");
        if (input) {
            input.value = "";
            input.focus();
        }
        runSearch("");
    }
};

export const closeSearch = () => {
    const modal = document.getElementById("search-modal");
    if (modal) { modal.classList.add("hidden"); modal.classList.remove("flex"); }
};

export const runSearch = (keyword) => {
    const kw = keyword.toLowerCase().trim();
    const filtered = state.pages.filter(p => !p.isDeleted && (p.title || "Untitled").toLowerCase().includes(kw));
    const container = document.getElementById("search-results");
    if (!container) return;
    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-xs text-gray-500">No results found 😢</div>`;
        return;
    }
    container.innerHTML = filtered.map(p => `
        <div onclick="window.select('${p.id}'); window.closeSearch();" class="flex items-center space-x-3 p-2 rounded hover:bg-[#2f2f2f] cursor-pointer text-xs">
            <i class="fa-regular fa-file-lines text-gray-400 text-sm"></i>
            <div class="truncate flex-1">
                <p class="text-gray-200 font-medium truncate">${p.title || 'Untitled'}</p>
            </div>
        </div>
    `).join('');
}

export const searchInput = document.getElementById("search-input");
if (searchInput) {
    searchInput.oninput = (e) => runSearch(e.target.value);
}