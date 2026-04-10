(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hoc/withRole.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withAdminRole",
    ()=>withAdminRole,
    "withClienteRole",
    ()=>withClienteRole,
    "withEmpleadaRole",
    ()=>withEmpleadaRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
"use client";
;
;
;
function withAdminRole(Component) {
    var _s = __turbopack_context__.k.signature();
    return _s(function AdminProtected(props) {
        _s();
        const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
        const [authorized, setAuthorized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
            "withAdminRole.AdminProtected.useEffect": ()=>{
                const checkAuth = {
                    "withAdminRole.AdminProtected.useEffect.checkAuth": async ()=>{
                        try {
                            const token = localStorage.getItem("access_token");
                            if (!token) {
                                router.replace("/usuario/auth/login");
                                return;
                            }
                            const res = await fetch("".concat(("TURBOPACK compile-time value", "http://127.0.0.1:8000"), "/api/auth/me"), {
                                headers: {
                                    Authorization: "Bearer ".concat(token)
                                }
                            });
                            if (res.status === 401) {
                                localStorage.removeItem("access_token");
                                localStorage.removeItem("refresh_token");
                                router.replace("/usuario/auth/login");
                                return;
                            }
                            if (!res.ok) {
                                router.replace("/unauthorized");
                                return;
                            }
                            const data = await res.json();
                            // El backend devuelve el usuario directamente, no envuelto en { user: {...} }
                            if (data.rol !== 'admin') {
                                router.replace("/unauthorized");
                                return;
                            }
                            setAuthorized(true);
                        } catch (error) {
                            router.replace("/unauthorized");
                        }
                    }
                }["withAdminRole.AdminProtected.useEffect.checkAuth"];
                checkAuth();
            }
        }["withAdminRole.AdminProtected.useEffect"], [
            router
        ]);
        if (authorized === null) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#4894AD]"
                }, void 0, false, {
                    fileName: "[project]/src/hoc/withRole.tsx",
                    lineNumber: 65,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/hoc/withRole.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, this);
        }
        if (!authorized) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
            ...props
        }, void 0, false, {
            fileName: "[project]/src/hoc/withRole.tsx",
            lineNumber: 72,
            columnNumber: 12
        }, this);
    }, "XQDO+itjj02xAU6PyFmBpcl3Il8=", false, function() {
        return [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
        ];
    });
}
function withEmpleadaRole(Component) {
    var _s = __turbopack_context__.k.signature();
    return _s(function EmpleadaProtected(props) {
        _s();
        const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
        const [authorized, setAuthorized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
            "withEmpleadaRole.EmpleadaProtected.useEffect": ()=>{
                const checkAuth = {
                    "withEmpleadaRole.EmpleadaProtected.useEffect.checkAuth": async ()=>{
                        try {
                            const token = localStorage.getItem("access_token");
                            if (!token) {
                                router.replace("/usuario/auth/login");
                                return;
                            }
                            const res = await fetch("".concat(("TURBOPACK compile-time value", "http://127.0.0.1:8000"), "/api/auth/me"), {
                                headers: {
                                    Authorization: "Bearer ".concat(token)
                                }
                            });
                            if (res.status === 401) {
                                localStorage.removeItem("access_token");
                                localStorage.removeItem("refresh_token");
                                router.replace("/usuario/auth/login");
                                return;
                            }
                            if (!res.ok) {
                                router.replace("/unauthorized");
                                return;
                            }
                            const data = await res.json();
                            // El backend devuelve el usuario directamente, no envuelto en { user: {...} }
                            if (data.rol !== 'empleada') {
                                router.replace("/unauthorized");
                                return;
                            }
                            setAuthorized(true);
                        } catch (error) {
                            router.replace("/unauthorized");
                        }
                    }
                }["withEmpleadaRole.EmpleadaProtected.useEffect.checkAuth"];
                checkAuth();
            }
        }["withEmpleadaRole.EmpleadaProtected.useEffect"], [
            router
        ]);
        if (authorized === null) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#4894AD]"
                }, void 0, false, {
                    fileName: "[project]/src/hoc/withRole.tsx",
                    lineNumber: 132,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/hoc/withRole.tsx",
                lineNumber: 131,
                columnNumber: 9
            }, this);
        }
        if (!authorized) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
            ...props
        }, void 0, false, {
            fileName: "[project]/src/hoc/withRole.tsx",
            lineNumber: 139,
            columnNumber: 12
        }, this);
    }, "XQDO+itjj02xAU6PyFmBpcl3Il8=", false, function() {
        return [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
        ];
    });
}
function withClienteRole(Component) {
    var _s = __turbopack_context__.k.signature();
    return _s(function ClienteProtected(props) {
        _s();
        const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
        const [authorized, setAuthorized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
            "withClienteRole.ClienteProtected.useEffect": ()=>{
                const checkAuth = {
                    "withClienteRole.ClienteProtected.useEffect.checkAuth": ()=>{
                        try {
                            // Validación simplificada: solo verifica localStorage
                            const userStr = localStorage.getItem("user");
                            if (!userStr) {
                                router.replace("/usuario/auth/login");
                                return;
                            }
                            const userData = JSON.parse(userStr);
                            // Verificar que tenga rol de cliente
                            if (userData.rol !== 'cliente') {
                                router.replace("/unauthorized");
                                return;
                            }
                            setAuthorized(true);
                        } catch (error) {
                            router.replace("/usuario/auth/login");
                        }
                    }
                }["withClienteRole.ClienteProtected.useEffect.checkAuth"];
                checkAuth();
            }
        }["withClienteRole.ClienteProtected.useEffect"], [
            router
        ]);
        if (authorized === null) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#4894AD]"
                }, void 0, false, {
                    fileName: "[project]/src/hoc/withRole.tsx",
                    lineNumber: 179,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/hoc/withRole.tsx",
                lineNumber: 178,
                columnNumber: 9
            }, this);
        }
        if (!authorized) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
            ...props
        }, void 0, false, {
            fileName: "[project]/src/hoc/withRole.tsx",
            lineNumber: 186,
            columnNumber: 12
        }, this);
    }, "XQDO+itjj02xAU6PyFmBpcl3Il8=", false, function() {
        return [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
        ];
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/cliente/ubicaciones/crear/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hoc$2f$withRole$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hoc/withRole.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-client] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bath$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bath.js [app-client] (ecmascript) <export default as Bath>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building.js [app-client] (ecmascript) <export default as Building>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
// Tipos predefinidos de ubicaciones
const TIPOS_LUGAR = [
    {
        value: 'casa',
        label: 'Casa',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
        description: 'Vivienda unifamiliar'
    },
    {
        value: 'apartamento',
        label: 'Apartamento',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
        description: 'Unidad residencial en edificio'
    },
    {
        value: 'oficina',
        label: 'Oficina',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"],
        description: 'Espacio de trabajo'
    },
    {
        value: 'local_comercial',
        label: 'Local Comercial',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"],
        description: 'Establecimiento comercial'
    },
    {
        value: 'otro',
        label: 'Otro',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
        description: 'Otro tipo de ubicación'
    }
];
const defaultCenter = {
    lat: 6.2442,
    lng: -75.5812
};
// Hook personalizado para Google Maps con manejo mejorado
const useGoogleMaps = ()=>{
    _s();
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const scriptsLoadedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGoogleMaps.useEffect": ()=>{
            var _window_google;
            if (scriptsLoadedRef.current) {
                setIsLoaded(true);
                return;
            }
            if ("object" !== 'undefined' && ((_window_google = window.google) === null || _window_google === void 0 ? void 0 : _window_google.maps)) {
                setIsLoaded(true);
                scriptsLoadedRef.current = true;
                return;
            }
            const script = document.createElement('script');
            script.src = "https://maps.googleapis.com/maps/api/js?key=".concat(("TURBOPACK compile-time value", "AIzaSyB4T6dUKdHyGxoo6MC7js1jx75dfBB1w7M"), "&libraries=places,geometry");
            script.async = true;
            script.defer = true;
            script.onload = ({
                "useGoogleMaps.useEffect": ()=>{
                    setIsLoaded(true);
                    scriptsLoadedRef.current = true;
                }
            })["useGoogleMaps.useEffect"];
            script.onerror = ({
                "useGoogleMaps.useEffect": ()=>{
                    setLoadError('Error cargando Google Maps');
                }
            })["useGoogleMaps.useEffect"];
            if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
                document.head.appendChild(script);
            }
            return ({
                "useGoogleMaps.useEffect": ()=>{
                // No remover el script para evitar recargas
                }
            })["useGoogleMaps.useEffect"];
        }
    }["useGoogleMaps.useEffect"], []);
    return {
        isLoaded,
        loadError
    };
};
_s(useGoogleMaps, "JHJ4biAo8xZSvFs90or334bAWkc=");
function CrearUbicacion() {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { isLoaded: mapsLoaded, loadError } = useGoogleMaps();
    // Refs para manejo de Google Maps
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const autocompleteRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const geocoderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const addressInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Timeouts
    const geocoderTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reverseGeocoderTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const debounceTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Estados
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mapLoading, setMapLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isGeocodingFromAddress, setIsGeocodingFromAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mapInitialized, setMapInitialized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Estados del formulario
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        nombre: '',
        tipo_lugar: '',
        tamaño: '',
        baños: '',
        pisos: '',
        nombre_lugar: '',
        descripcion: '',
        estado: true,
        direccion: '',
        numero_apartamento: '',
        bloque: '',
        referencias: ''
    });
    const [markerPosition, setMarkerPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultCenter);
    const handleInputChange = (field, value)=>{
        setFormData((prev)=>({
                ...prev,
                [field]: value
            }));
        setError(null);
    };
    // Inicializar mapa cuando Google Maps esté cargado
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CrearUbicacion.useEffect": ()=>{
            if (!mapsLoaded || mapInitialized || !mapContainerRef.current) return;
            try {
                // Crear el mapa
                const map = new google.maps.Map(mapContainerRef.current, {
                    center: defaultCenter,
                    zoom: 12,
                    gestureHandling: 'greedy',
                    zoomControl: true,
                    streetViewControl: false,
                    fullscreenControl: false,
                    scrollwheel: true,
                    disableDoubleClickZoom: false,
                    keyboardShortcuts: true,
                    mapTypeControl: false,
                    rotateControl: false
                });
                mapRef.current = map;
                // Crear el marcador
                const marker = new google.maps.Marker({
                    position: defaultCenter,
                    map: map,
                    draggable: true,
                    title: 'Ubicación seleccionada'
                });
                markerRef.current = marker;
                // Crear el geocoder
                geocoderRef.current = new google.maps.Geocoder();
                // Crear el autocomplete
                if (addressInputRef.current) {
                    const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
                        componentRestrictions: {
                            country: 'co'
                        },
                        fields: [
                            'formatted_address',
                            'geometry',
                            'name',
                            'address_components'
                        ],
                        types: [
                            'address'
                        ]
                    });
                    autocompleteRef.current = autocomplete;
                    // Listener para autocomplete
                    autocomplete.addListener('place_changed', {
                        "CrearUbicacion.useEffect": ()=>{
                            var _place_geometry;
                            const place = autocomplete.getPlace();
                            if ((_place_geometry = place.geometry) === null || _place_geometry === void 0 ? void 0 : _place_geometry.location) {
                                const newPosition = {
                                    lat: place.geometry.location.lat(),
                                    lng: place.geometry.location.lng()
                                };
                                setMarkerPosition(newPosition);
                                marker.setPosition(newPosition);
                                map.panTo(newPosition);
                                map.setZoom(16);
                                const nombreLugar = place.name || '';
                                setFormData({
                                    "CrearUbicacion.useEffect": (prev)=>({
                                            ...prev,
                                            direccion: place.formatted_address || '',
                                            nombre_lugar: nombreLugar
                                        })
                                }["CrearUbicacion.useEffect"]);
                            }
                        }
                    }["CrearUbicacion.useEffect"]);
                }
                // Listeners del mapa
                map.addListener('click', {
                    "CrearUbicacion.useEffect": (e)=>{
                        if (e.latLng && !isReverseGeocoding) {
                            const newPosition = {
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng()
                            };
                            setMarkerPosition(newPosition);
                            marker.setPosition(newPosition);
                            // Throttle reverse geocoding
                            if (reverseGeocoderTimeoutRef.current) {
                                clearTimeout(reverseGeocoderTimeoutRef.current);
                            }
                            reverseGeocoderTimeoutRef.current = setTimeout({
                                "CrearUbicacion.useEffect": ()=>{
                                    reverseGeocode(newPosition);
                                }
                            }["CrearUbicacion.useEffect"], 500);
                        }
                    }
                }["CrearUbicacion.useEffect"]);
                // Listener del marcador
                marker.addListener('dragend', {
                    "CrearUbicacion.useEffect": ()=>{
                        const position = marker.getPosition();
                        if (position && !isReverseGeocoding) {
                            const newPosition = {
                                lat: position.lat(),
                                lng: position.lng()
                            };
                            setMarkerPosition(newPosition);
                            // Throttle reverse geocoding
                            if (reverseGeocoderTimeoutRef.current) {
                                clearTimeout(reverseGeocoderTimeoutRef.current);
                            }
                            reverseGeocoderTimeoutRef.current = setTimeout({
                                "CrearUbicacion.useEffect": ()=>{
                                    reverseGeocode(newPosition);
                                }
                            }["CrearUbicacion.useEffect"], 800);
                        }
                    }
                }["CrearUbicacion.useEffect"]);
                setMapInitialized(true);
            } catch (err) {
                setError('Error al inicializar el mapa');
            }
        }
    }["CrearUbicacion.useEffect"], [
        mapsLoaded,
        mapInitialized,
        isReverseGeocoding
    ]);
    // Geocoding con debounce
    const geocodeAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrearUbicacion.useCallback[geocodeAddress]": async (address)=>{
            if (!address.trim() || address.length < 10 || !geocoderRef.current || isGeocodingFromAddress) {
                return;
            }
            try {
                var _results__geometry, _results_;
                setIsGeocodingFromAddress(true);
                setMapLoading(true);
                const results = await new Promise({
                    "CrearUbicacion.useCallback[geocodeAddress]": (resolve, reject)=>{
                        const timeoutId = setTimeout({
                            "CrearUbicacion.useCallback[geocodeAddress].timeoutId": ()=>{
                                reject(new Error('Timeout'));
                            }
                        }["CrearUbicacion.useCallback[geocodeAddress].timeoutId"], 500000);
                        geocoderRef.current.geocode({
                            address: address.trim(),
                            region: 'CO',
                            componentRestrictions: {
                                country: 'CO'
                            }
                        }, {
                            "CrearUbicacion.useCallback[geocodeAddress]": (results, status)=>{
                                clearTimeout(timeoutId);
                                if (status === 'OK' && results && results.length > 0) {
                                    resolve(results);
                                } else {
                                    reject(new Error("Geocoding failed: ".concat(status)));
                                }
                            }
                        }["CrearUbicacion.useCallback[geocodeAddress]"]);
                    }
                }["CrearUbicacion.useCallback[geocodeAddress]"]);
                if ((_results_ = results[0]) === null || _results_ === void 0 ? void 0 : (_results__geometry = _results_.geometry) === null || _results__geometry === void 0 ? void 0 : _results__geometry.location) {
                    const location = results[0].geometry.location;
                    const newPosition = {
                        lat: location.lat(),
                        lng: location.lng()
                    };
                    setMarkerPosition(newPosition);
                    if (markerRef.current) {
                        markerRef.current.setPosition(newPosition);
                    }
                    if (mapRef.current) {
                        mapRef.current.panTo(newPosition);
                        mapRef.current.setZoom(16);
                    }
                }
            } catch (error) {
                var _err_message;
                // Manejo de errores de Geocoding API
                const err = error;
                if ((_err_message = err.message) === null || _err_message === void 0 ? void 0 : _err_message.includes('REQUEST_DENIED')) {
                    // API no habilitada - usuario puede ingresar coordenadas manualmente
                    setError('Geocoding API no disponible. Puedes seleccionar la ubicación en el mapa o usar "Mi Ubicación".');
                }
            } finally{
                setIsGeocodingFromAddress(false);
                setMapLoading(false);
            }
        }
    }["CrearUbicacion.useCallback[geocodeAddress]"], [
        isGeocodingFromAddress
    ]);
    // Reverse geocoding
    const reverseGeocode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CrearUbicacion.useCallback[reverseGeocode]": async (position)=>{
            if (isGeocodingFromAddress || isReverseGeocoding || !geocoderRef.current) {
                return;
            }
            try {
                setIsReverseGeocoding(true);
                setMapLoading(true);
                const results = await new Promise({
                    "CrearUbicacion.useCallback[reverseGeocode]": (resolve, reject)=>{
                        const timeoutId = setTimeout({
                            "CrearUbicacion.useCallback[reverseGeocode].timeoutId": ()=>{
                                reject(new Error('Timeout'));
                            }
                        }["CrearUbicacion.useCallback[reverseGeocode].timeoutId"], 300000);
                        geocoderRef.current.geocode({
                            location: position
                        }, {
                            "CrearUbicacion.useCallback[reverseGeocode]": (results, status)=>{
                                clearTimeout(timeoutId);
                                if (status === 'OK' && results && results.length > 0) {
                                    resolve(results);
                                } else {
                                    reject(new Error("Reverse geocoding failed: ".concat(status)));
                                }
                            }
                        }["CrearUbicacion.useCallback[reverseGeocode]"]);
                    }
                }["CrearUbicacion.useCallback[reverseGeocode]"]);
                if (results[0]) {
                    const address = results[0].formatted_address;
                    const addressComponents = results[0].address_components || [];
                    let nombreLugar = '';
                    const poiComponent = addressComponents.find({
                        "CrearUbicacion.useCallback[reverseGeocode].poiComponent": (component)=>component.types.includes('point_of_interest') || component.types.includes('establishment')
                    }["CrearUbicacion.useCallback[reverseGeocode].poiComponent"]);
                    if (poiComponent) {
                        nombreLugar = poiComponent.long_name;
                    }
                    setFormData({
                        "CrearUbicacion.useCallback[reverseGeocode]": (prev)=>({
                                ...prev,
                                direccion: address,
                                nombre_lugar: nombreLugar || prev.nombre_lugar
                            })
                    }["CrearUbicacion.useCallback[reverseGeocode]"]);
                }
            } catch (error) {
                var _err_message;
                // Manejo de errores de Geocoding API
                const err = error;
                if ((_err_message = err.message) === null || _err_message === void 0 ? void 0 : _err_message.includes('REQUEST_DENIED')) {
                    // API no habilitada - silencioso, no afecta funcionalidad core
                    setFormData({
                        "CrearUbicacion.useCallback[reverseGeocode]": (prev)=>({
                                ...prev,
                                direccion: "Lat: ".concat(position.lat.toFixed(6), ", Lng: ").concat(position.lng.toFixed(6))
                            })
                    }["CrearUbicacion.useCallback[reverseGeocode]"]);
                }
            } finally{
                setIsReverseGeocoding(false);
                setMapLoading(false);
            }
        }
    }["CrearUbicacion.useCallback[reverseGeocode]"], [
        isGeocodingFromAddress,
        isReverseGeocoding
    ]);
    // Debounce para direcciones
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CrearUbicacion.useEffect": ()=>{
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            if (formData.direccion && formData.direccion.length >= 10 && mapInitialized) {
                debounceTimeoutRef.current = setTimeout({
                    "CrearUbicacion.useEffect": ()=>{
                        geocodeAddress(formData.direccion);
                    }
                }["CrearUbicacion.useEffect"], 300000);
            }
            return ({
                "CrearUbicacion.useEffect": ()=>{
                    if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                    }
                }
            })["CrearUbicacion.useEffect"];
        }
    }["CrearUbicacion.useEffect"], [
        formData.direccion,
        geocodeAddress,
        mapInitialized
    ]);
    // Detectar ubicación actual
    const detectCurrentLocation = ()=>{
        if (!navigator.geolocation) {
            setError('Tu navegador no soporta geolocalización');
            return;
        }
        setLoading(true);
        setMapLoading(true);
        navigator.geolocation.getCurrentPosition((position)=>{
            const newPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            setMarkerPosition(newPosition);
            if (markerRef.current) {
                markerRef.current.setPosition(newPosition);
            }
            if (mapRef.current) {
                mapRef.current.panTo(newPosition);
                mapRef.current.setZoom(16);
            }
            setTimeout(()=>{
                reverseGeocode(newPosition);
            }, 500);
            setLoading(false);
            setMapLoading(false);
        }, (error)=>{
            let errorMessage = 'No se pudo obtener tu ubicación actual';
            switch(error.code){
                case error.PERMISSION_DENIED:
                    errorMessage = 'Permiso de ubicación denegado';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Ubicación no disponible';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Timeout obteniendo ubicación';
                    break;
            }
            setError(errorMessage);
            setLoading(false);
            setMapLoading(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        });
    };
    // Manejar cambio manual de dirección
    const handleAddressChange = (address)=>{
        setFormData((prev)=>({
                ...prev,
                direccion: address
            }));
    };
    // Cleanup
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CrearUbicacion.useEffect": ()=>{
            return ({
                "CrearUbicacion.useEffect": ()=>{
                    if (geocoderTimeoutRef.current) {
                        clearTimeout(geocoderTimeoutRef.current);
                    }
                    if (reverseGeocoderTimeoutRef.current) {
                        clearTimeout(reverseGeocoderTimeoutRef.current);
                    }
                    if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                    }
                }
            })["CrearUbicacion.useEffect"];
        }
    }["CrearUbicacion.useEffect"], []);
    // Enviar formulario con validaciones mejoradas
    const handleSubmit = async (e)=>{
        e.preventDefault();
        // Validaciones del lado del cliente
        if (!formData.nombre.trim()) {
            setError('El nombre de la ubicación es obligatorio');
            return;
        }
        if (formData.nombre.trim().length > 100) {
            setError('El nombre no puede exceder 100 caracteres');
            return;
        }
        // Validar campos numéricos si están presentes
        if (formData.tamaño && (isNaN(Number(formData.tamaño)) || Number(formData.tamaño) <= 0 || Number(formData.tamaño) > 500)) {
            setError('El tamaño debe ser un número entre 1 y 500 metros cuadrados');
            return;
        }
        if (formData.baños && (isNaN(Number(formData.baños)) || Number(formData.baños) < 1 || Number(formData.baños) > 5)) {
            setError('El número de baños debe estar entre 1 y 5');
            return;
        }
        if (formData.pisos && (isNaN(Number(formData.pisos)) || Number(formData.pisos) < 1 || Number(formData.pisos) > 5)) {
            setError('El número de pisos debe estar entre 1 y 5');
            return;
        }
        // Preparar datos de ubicación según el schema de FastAPI
        const ubicacionData = {
            lat: markerPosition.lat,
            lng: markerPosition.lng,
            direccion: formData.direccion,
            detalles: {
                numero_apartamento: formData.numero_apartamento || null,
                bloque: formData.bloque || null,
                referencias: formData.referencias || null
            }
        };
        // Obtener id_usuario del localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setError('No se encontró información del usuario');
            return;
        }
        const user = JSON.parse(userStr);
        // Preparar campo tamaño con el formato correcto
        let tamañoData = null;
        if (formData.tamaño) {
            const metros = Number(formData.tamaño);
            let categoria = 'pequeño';
            if (metros > 150) categoria = 'grande';
            else if (metros > 80) categoria = 'mediano';
            tamañoData = {
                metros: metros,
                unidad: 'm²',
                categoria: categoria,
                display: "".concat(metros, " m² (").concat(categoria.charAt(0).toUpperCase() + categoria.slice(1), ")")
            };
        }
        // Preparar payload según el schema UbicacionServicioCreate de FastAPI
        const payload = {
            id_usuario: user.id,
            nombre: formData.nombre.trim(),
            tipo_lugar: formData.tipo_lugar || null,
            tamaño: tamañoData,
            baños: formData.baños ? parseInt(formData.baños) : null,
            pisos: formData.pisos ? parseInt(formData.pisos) : null,
            nombre_lugar: formData.nombre_lugar.trim() || null,
            descripcion: formData.descripcion.trim() || null,
            estado: formData.estado,
            ubicacion: ubicacionData
        };
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("".concat(("TURBOPACK compile-time value", "http://127.0.0.1:8000"), "/api/ubicaciones/cliente/crear"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || "Error HTTP ".concat(response.status));
            }
            setSuccess(true);
            setTimeout(()=>{
                router.push('/cliente/ubicaciones/index');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido al crear la ubicación");
        } finally{
            setLoading(false);
        }
    };
    if (success) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center bg-gray-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full mx-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                            className: "h-8 w-8 text-green-600"
                        }, void 0, false, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 612,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 611,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 mb-2",
                        children: "¡Ubicación creada exitosamente!"
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 614,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mb-4",
                        children: "Redirigiendo a tus ubicaciones..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 615,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-6 w-6 border-b-2 border-[#4894AD] mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 616,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                lineNumber: 610,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
            lineNumber: 609,
            columnNumber: 7
        }, this);
    }
    if (loadError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center bg-gray-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full mx-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "h-12 w-12 text-red-500 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 626,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 mb-2",
                        children: "Error cargando el mapa"
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 627,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mb-4",
                        children: loadError
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 628,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>window.location.reload(),
                        className: "bg-[#4894AD] text-white px-4 py-2 rounded-lg hover:bg-[#195083]",
                        children: "Recargar página"
                    }, void 0, false, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 629,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                lineNumber: 625,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
            lineNumber: 624,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 py-4 sm:py-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gradient-to-r from-[#4894AD] to-[#D95B26] rounded-xl p-4 sm:p-6 text-white mb-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push('/cliente/ubicaciones/index'),
                                className: "p-2 hover:bg-white/20 rounded-lg transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 650,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                lineNumber: 646,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-xl sm:text-2xl font-extrabold text-[#FCF7F0]",
                                        children: "Nueva Ubicación"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                        lineNumber: 653,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[#FCF7F0]/80 text-sm sm:text-base mt-1",
                                        children: "Registra una nueva ubicación para servicios de limpieza"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                        lineNumber: 656,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                lineNumber: 652,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                        lineNumber: 645,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                    lineNumber: 644,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                            className: "h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
                        }, void 0, false, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 666,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-medium text-red-800",
                                    children: "Error"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 668,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-red-700 text-sm mt-1",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 669,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setError(null),
                                    className: "text-red-600 text-sm mt-2 hover:text-red-800",
                                    children: "Cerrar"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 670,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 667,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                    lineNumber: 665,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                            className: "h-5 w-5 text-[#4894AD]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 684,
                                            columnNumber: 15
                                        }, this),
                                        "Información Básica"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 683,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sm:col-span-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                                    children: "Nombre de la ubicación *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 690,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: formData.nombre,
                                                    onChange: (e)=>handleInputChange('nombre', e.target.value),
                                                    placeholder: "Ej: Casa principal, Apartamento centro...",
                                                    maxLength: 100,
                                                    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500",
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 693,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-500 mt-1",
                                                    children: [
                                                        formData.nombre.length,
                                                        "/100 caracteres"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 702,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 689,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sm:col-span-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                                    children: "Tipo de ubicación"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 708,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-2 sm:grid-cols-5 gap-3",
                                                    children: TIPOS_LUGAR.map((tipo)=>{
                                                        const Icon = tipo.icon;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>handleInputChange('tipo_lugar', tipo.value),
                                                            className: "p-3 rounded-lg border-2 transition-colors text-center ".concat(formData.tipo_lugar === tipo.value ? 'border-[#4894AD] bg-[#4894AD]/10 text-[#4894AD]' : 'border-gray-200 hover:border-gray-300 text-gray-600'),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                    className: "h-6 w-6 mx-auto mb-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                                    lineNumber: 725,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs font-medium",
                                                                    children: tipo.label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                                    lineNumber: 726,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, tipo.value, true, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 715,
                                                            columnNumber: 23
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 711,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 707,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 688,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 682,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                            className: "h-5 w-5 text-[#4894AD]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 738,
                                            columnNumber: 15
                                        }, this),
                                        "Características"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 737,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 745,
                                                            columnNumber: 19
                                                        }, this),
                                                        "Tamaño (m²)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 744,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    value: formData.tamaño,
                                                    onChange: (e)=>handleInputChange('tamaño', e.target.value),
                                                    placeholder: "Ej: 80",
                                                    min: "1",
                                                    max: "500",
                                                    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 748,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 743,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bath$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bath$3e$__["Bath"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 761,
                                                            columnNumber: 19
                                                        }, this),
                                                        "Baños"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 760,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: formData.baños,
                                                    onChange: (e)=>handleInputChange('baños', e.target.value),
                                                    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 bg-white",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Seleccionar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 769,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "1",
                                                            children: "1 baño"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 770,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "2",
                                                            children: "2 baños"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 771,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "3",
                                                            children: "3 baños"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 772,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "4",
                                                            children: "4 baños"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 773,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "5",
                                                            children: "5 o más baños"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 774,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 764,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 759,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 780,
                                                            columnNumber: 19
                                                        }, this),
                                                        "Pisos"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 779,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: formData.pisos,
                                                    onChange: (e)=>handleInputChange('pisos', e.target.value),
                                                    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 bg-white",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Seleccionar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 788,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "1",
                                                            children: "1 piso"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 789,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "2",
                                                            children: "2 pisos"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 790,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "3",
                                                            children: "3 pisos"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 791,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "4",
                                                            children: "4 pisos"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 792,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "5",
                                                            children: "5 pisos"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                            lineNumber: 793,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 783,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 778,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 742,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 736,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                            className: "h-5 w-5 text-[#4894AD]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 802,
                                            columnNumber: 15
                                        }, this),
                                        "Ubicación"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 801,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-2",
                                            children: "Dirección"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 808,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: addressInputRef,
                                                type: "text",
                                                value: formData.direccion,
                                                onChange: (e)=>handleAddressChange(e.target.value),
                                                placeholder: "Busca o escribe la dirección...",
                                                className: "flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                lineNumber: 812,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 811,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 807,
                                    columnNumber: 13
                                }, this),
                                (markerPosition.lat !== defaultCenter.lat || markerPosition.lng !== defaultCenter.lng) && formData.direccion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                lineNumber: 827,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-medium text-blue-800 mb-1",
                                                        children: "Ubicación seleccionada"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                        lineNumber: 829,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-blue-700 text-sm mb-2",
                                                        children: formData.direccion
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                        lineNumber: 830,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-blue-600 grid grid-cols-2 gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Latitud: ",
                                                                    markerPosition.lat.toFixed(6)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                                lineNumber: 832,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Longitud: ",
                                                                    markerPosition.lng.toFixed(6)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                                lineNumber: 833,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                        lineNumber: 831,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                lineNumber: 828,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                        lineNumber: 826,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 825,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4 relative overflow-hidden rounded-lg",
                                    style: {
                                        touchAction: 'none'
                                    },
                                    children: [
                                        mapLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-[#4894AD]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "h-5 w-5 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                        lineNumber: 845,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm",
                                                        children: "Actualizando ubicación..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                        lineNumber: 846,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                lineNumber: 844,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 843,
                                            columnNumber: 17
                                        }, this),
                                        !mapsLoaded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-gray-600",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "h-5 w-5 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                        lineNumber: 854,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Cargando mapa..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                        lineNumber: 855,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                lineNumber: 853,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 852,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            ref: mapContainerRef,
                                            className: "w-full h-[400px] rounded-lg",
                                            style: {
                                                minHeight: '400px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 859,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 841,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 870,
                                                    columnNumber: 17
                                                }, this),
                                                "Nombre del edificio/lugar"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 869,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: formData.nombre_lugar,
                                            onChange: (e)=>handleInputChange('nombre_lugar', e.target.value),
                                            placeholder: "Ej: Edificio Torres del Poblado, Casa Blanca...",
                                            maxLength: 100,
                                            className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 873,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 868,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                                    children: "Apartamento/Unidad"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 886,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: formData.numero_apartamento,
                                                    onChange: (e)=>handleInputChange('numero_apartamento', e.target.value),
                                                    placeholder: "Ej: 301, A-15...",
                                                    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 889,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 885,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                                    children: "Bloque/Torre"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 899,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: formData.bloque,
                                                    onChange: (e)=>handleInputChange('bloque', e.target.value),
                                                    placeholder: "Ej: Torre A, Bloque 2...",
                                                    className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                                    lineNumber: 902,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 898,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 884,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-2",
                                            children: "Referencias para llegar"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 914,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            value: formData.referencias,
                                            onChange: (e)=>handleInputChange('referencias', e.target.value),
                                            placeholder: "Ej: Casa esquinera con antejardín, frente al supermercado, portón verde...",
                                            rows: 3,
                                            className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 917,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 913,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 800,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            className: "h-5 w-5 text-[#4894AD]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 930,
                                            columnNumber: 15
                                        }, this),
                                        "Instrucciones Para El Servicio"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 929,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-2",
                                            children: "Descripción y observaciones"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 936,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            value: formData.descripcion,
                                            onChange: (e)=>handleInputChange('descripcion', e.target.value),
                                            placeholder: "Comparte información importante para el servicio: mascotas, restricciones, horarios especiales, etc.",
                                            rows: 4,
                                            maxLength: 1000,
                                            className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4894AD] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 939,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-500 mt-1",
                                            children: [
                                                formData.descripcion.length,
                                                "/1000 caracteres"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 947,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 935,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            id: "estado",
                                            checked: formData.estado,
                                            onChange: (e)=>handleInputChange('estado', e.target.checked),
                                            className: "h-4 w-4 text-[#4894AD] border-gray-300 rounded focus:ring-[#4894AD]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 954,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "estado",
                                            className: "text-sm font-medium text-gray-700",
                                            children: "Ubicación activa (disponible para programar servicios)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 961,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 953,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 928,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4 pt-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>router.push('/cliente/ubicaciones/index'),
                                    className: "flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 969,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: loading || !formData.nombre.trim() || isGeocodingFromAddress || isReverseGeocoding,
                                    className: "flex-1 bg-[#4894AD] text-white px-6 py-3 rounded-lg hover:bg-[#195083] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                                    children: [
                                        loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "h-5 w-5 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 982,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                            lineNumber: 984,
                                            columnNumber: 17
                                        }, this),
                                        loading ? 'Creando...' : 'Crear Ubicación'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                                    lineNumber: 976,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                            lineNumber: 968,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
                    lineNumber: 680,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
            lineNumber: 642,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/cliente/ubicaciones/crear/page.tsx",
        lineNumber: 641,
        columnNumber: 5
    }, this);
}
_s1(CrearUbicacion, "Geeif7rel11QpPfeB/wBIYyH2Xg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        useGoogleMaps
    ];
});
_c = CrearUbicacion;
const __TURBOPACK__default__export__ = _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hoc$2f$withRole$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withClienteRole"])(CrearUbicacion);
var _c, _c1;
__turbopack_context__.k.register(_c, "CrearUbicacion");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_fb3dcd97._.js.map