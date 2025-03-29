import { useEffect } from "react";
import "../app/globals.css";

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js")
                .then(reg => console.log("✅ Service Worker Registered", reg))
                .catch(err => console.error("❌ Service Worker Error", err));
        }
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;
