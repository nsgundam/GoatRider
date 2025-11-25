module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/app/homepage/page.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Welcomepage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$cloudinary$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-cloudinary/dist/index.mjs [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/utils/auth'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
"use client";
;
;
;
;
function Welcomepage() {
    const [error, seterror] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setloading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [wallet, setwallet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showpopup, setshowpopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [name, setname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    //-----------------------------------------------------------//
    // Connect to MetaMask (safe for SSR) 
    async function handleConnectWallet() {
        seterror("");
        // Protect against server-side execution: window is only available in the browser
        if ("TURBOPACK compile-time truthy", 1) {
            console.warn("handleConnectWallet called on the server. Abort.");
            seterror("This action must be performed in a browser.");
            return;
        }
        //TURBOPACK unreachable
        ;
        // Now it's safe to read window.ethereum
        const provider = undefined;
    }
    //-----------------------------------------------------------//
    async function summitname(e) {
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
        // สมมมุติว่า fetch เรียบร้อย ไม่มีปัญหา
        console.log("Submitting (frontend test naja):", {
            wallet,
            name: trimmed
        });
        // show a simple confirmation and close popup
        alert(`Welcome, ${trimmed}!\nWallet: ${wallet}`);
        setshowpopup(false);
        setname("");
    }
    //-----------------------------------------------------------//
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 -z-10 pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$cloudinary$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CldImage"], {
                    src: "qy3vo3jhmpocodpavgrf",
                    width: 1920,
                    height: 1080,
                    className: "w-full h-full object-cover pointer-events-none",
                    alt: "goat rider homepage"
                }, void 0, false, {
                    fileName: "[project]/app/homepage/page.js",
                    lineNumber: 83,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/homepage/page.js",
<<<<<<< HEAD
                lineNumber: 82,
                columnNumber: 7
=======
                lineNumber: 62,
                columnNumber: 5
>>>>>>> 78940119c9bdf8a4c1df0b5093f564efe3c929bd
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex flex-col items-center justify-center text-center gap-8 px-4 z-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-5xl md:text-7xl lg:text-[150px] font-bold text-white",
                        children: "Goat"
                    }, void 0, false, {
                        fileName: "[project]/app/homepage/page.js",
<<<<<<< HEAD
                        lineNumber: 95,
                        columnNumber: 9
=======
                        lineNumber: 70,
                        columnNumber: 5
>>>>>>> 78940119c9bdf8a4c1df0b5093f564efe3c929bd
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-5xl md:text-7xl lg:text-[150px] font-bold text-white -mt-6",
                        children: "Ridder"
                    }, void 0, false, {
                        fileName: "[project]/app/homepage/page.js",
<<<<<<< HEAD
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            console.log("Connect button clicked (debug)");
                            handleConnectWallet();
                        },
                        // only disable while loading; let wallet state be shown but not block reconnect attempts
                        disabled: loading,
                        className: "z-30 pointer-events-auto text-2xl font-normal bg-blue-50 text-black rounded-none hover:bg-blue-100 transition-colors duration-300 px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed",
                        children: loading ? "Connecting..." : "Connect Wallet"
                    }, void 0, false, {
                        fileName: "[project]/app/homepage/page.js",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 text-red-200 bg-red-900/30 px-3 py-1 rounded-md",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/app/homepage/page.js",
                        lineNumber: 112,
                        columnNumber: 11
=======
                        lineNumber: 71,
                        columnNumber: 5
>>>>>>> 78940119c9bdf8a4c1df0b5093f564efe3c929bd
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/homepage/page.js",
<<<<<<< HEAD
                lineNumber: 93,
                columnNumber: 7
            }, this),
            showpopup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-40 flex items-center justify-center bg-black/50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white p-6 rounded-md max-w-sm w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-black text-lg font-semibold",
                            children: "Enter your name"
                        }, void 0, false, {
                            fileName: "[project]/app/homepage/page.js",
                            lineNumber: 120,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: summitname,
                            className: "mt-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    value: name,
                                    onChange: (e)=>setname(e.target.value),
                                    className: "w-full px-3 py-2 border rounded-md",
                                    placeholder: "Your name"
                                }, void 0, false, {
                                    fileName: "[project]/app/homepage/page.js",
                                    lineNumber: 122,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 flex justify-end gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setshowpopup(false),
                                            className: " text-black px-3 py-2 border rounded-md",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/app/homepage/page.js",
                                            lineNumber: 129,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "px-3 py-2 bg-blue-600 text-white rounded-md",
                                            children: "Submit"
                                        }, void 0, false, {
                                            fileName: "[project]/app/homepage/page.js",
                                            lineNumber: 130,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/homepage/page.js",
                                    lineNumber: 128,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/homepage/page.js",
                            lineNumber: 121,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/homepage/page.js",
                    lineNumber: 119,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/homepage/page.js",
                lineNumber: 118,
                columnNumber: 9
=======
                lineNumber: 69,
                columnNumber: 1
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: auth.handleLogin,
                disabled: loading || wallet,
                className: "text-2xl absolute top-140 right-240 px-20 py-5 font-normal  bg-blue-50 text-black rounded none hover:bg-blue-100 transition-colors duration-300",
                children: loading ? "Connecting..." : "Connect Wallet"
            }, void 0, false, {
                fileName: "[project]/app/homepage/page.js",
                lineNumber: 75,
                columnNumber: 5
>>>>>>> 78940119c9bdf8a4c1df0b5093f564efe3c929bd
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/homepage/page.js",
<<<<<<< HEAD
        lineNumber: 81,
        columnNumber: 5
=======
        lineNumber: 61,
        columnNumber: 3
>>>>>>> 78940119c9bdf8a4c1df0b5093f564efe3c929bd
    }, this);
} // Notes:
 // - The important fix: check `typeof window` before accessing `window.ethereum`. That avoids errors during SSR.
 // - Keep pointer-events-none on the background image only; don't put it on a root wrapper.
 // - When debugging MetaMask, open DevTools and watch console logs from the button click and the provider request.
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__07c00421._.js.map