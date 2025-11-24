(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/welcome/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Welcomepage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
(()=>{
    const e1 = new Error("Cannot find module '@/components/ui/button'");
    e1.code = 'MODULE_NOT_FOUND';
    throw e1;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$cloudinary$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-cloudinary/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Welcomepage() {
    _s();
    const [error, seterror] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setloading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [wallet, setwallet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showpopup, setshowpopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [name, setname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    //-----------------------------------------------------------//
    //มีMATAMASKบ่อ้าย
    async function handleConnectWallet() {
        seterror("");
        if (!window?.ethereum) {
            alert("Please install Metamask"); //ไปติดตั้งก่อนเด้ออ้าย
            return;
        }
        try {
            setloading(true);
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });
            const account = accounts[0];
            setwallet(account);
            //------------------------popup------------------------------//
            setshowpopup(true);
            setloading(false);
        } catch (err) {
            console.error(err);
            seterror("Failed to connect wallet");
        } finally{
            setloading(false);
        }
    }
    //-----------------------------------------------------------//
    async function summitname() {
        e.preventDefault();
        seterror("");
        const trimmed = name.trim();
        if (!trimmed) {
            seterror("enter your name");
            return;
        }
        if (!wallet) {
            seterror("no wallet connected");
            return;
        }
        //-----------------------------------------------------------//
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$cloudinary$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CldImage"], {
                src: "goat_homepage",
                width: 1920,
                height: 1080,
                className: "w-full h-full object-cover",
                alt: "goat rider homepage"
            }, void 0, false, {
                fileName: "[project]/app/welcome/page.js",
                lineNumber: 55,
                columnNumber: 21
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/welcome/page.js",
            lineNumber: 54,
            columnNumber: 17
        }, this);
        //TURBOPACK unreachable
        ;
        function connectWallet() {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Button, {
                href: "/dashboa",
                children: "Connect With METAMASK"
            }, void 0, false, {
                fileName: "[project]/app/welcome/page.js",
                lineNumber: 65,
                columnNumber: 24
            }, this);
        }
    }
}
_s(Welcomepage, "5q//3aiUrlgmtWiQqGGZy+XCdxU=");
_c = Welcomepage;
var _c;
__turbopack_context__.k.register(_c, "Welcomepage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_welcome_page_1d140680.js.map