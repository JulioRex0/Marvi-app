export const changeTheme = () => {
    try {
        if (typeof window === "undefined") return;
        const current = localStorage.getItem("theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        localStorage.setItem("theme", next);
        try {
            document.body.classList.toggle("dark", next === "dark");
        } catch (err) {
            // ignore when not in browser
        }
    } catch (err) {
        // noop
    }
};

export default { changeTheme };
