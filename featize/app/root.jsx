import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import "dayjs/locale/fr"; // use locale globally
import tailwindStyles from "./styles/tailwind-compiled.css";
import globalStyles from "./styles/global.css";
import resetStyles from "./styles/reset.css";
import fontFace from "./styles/font.css";
import smoothscroll from "smoothscroll-polyfill";
import dialogPolyfillCSS from "dialog-polyfill/dist/dialog-polyfill.css";
import { APP_DESCRIPTION, APP_NAME } from "./services/appName";
// import resolveConfig from "tailwindcss/resolveConfig";
// import tailwindConfig from "../tailwind.config.js";
// const fullConfig = resolveConfig(tailwindConfig);

dayjs.locale("fr");
dayjs.extend(advancedFormat);

if (typeof document !== "undefined") {
  smoothscroll.polyfill();
}

export const meta = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
  // "theme-color": fullConfig.theme.colors.app,
  "theme-color": "#fafbfe",
  title: `${APP_NAME} | ${APP_DESCRIPTION}`,
  description: `${APP_NAME} | ${APP_DESCRIPTION}`,
  "og:title": `${APP_NAME}`,
  "og:description": APP_DESCRIPTION,
  "twitter:title": `${APP_NAME}`,
  "twitter:description": APP_DESCRIPTION,
  // "og:url": { APP_URL },
  // canonical: { APP_URL },
  // "og:image": "/assets/icons/og-image-1200-630.png",
  // "og:image:secure_url": `${APP_URL}/assets/icons/og-image-1200-630.png`,
  // "twitter:image": "/assets/icons/og-image-1200-630.png",
  // "og:image:type": "image/png",
  // "og:image:width": "1200",
  // "og:image:height": "630",
  // "og:image:alt": "My og image",
  // "twitter:image:alt": "My og image",
  // "og:type": "website",
  // "msapplication-square70x70logo": "/assets/icons/mstile-icon-128.png",
  // "msapplication-square150x150logo": "/assets/icons/mstile-icon-270.png",
  // "msapplication-square310x310logo": "/assets/icons/mstile-icon-558.png",
  // "msapplication-wide310x150logo": "/assets/icons/mstile-icon-558-270.png",
  // "apple-mobile-web-app-capable": "yes",
  // "mobile-web-app-capable": "yes",
  // "apple-mobile-web-app-status-bar-style": fullConfig.theme.colors.app,
});

// load browser env variables here, the inject in the script below
export const loader = () => ({
  ENV: JSON.stringify({
    SENTRY_XXX: process.env.SENTRY_XXX,
  }),
  NODE_ENV: process.env.NODE_ENV,
});

// prettier-ignore
export const links = () => {
  return [
    { rel:"icon", type:"image/png", sizes:"196x196", href:"/favicon.png" },
    { rel: "stylesheet", href: fontFace },
    { rel: "stylesheet", href: resetStyles },
    { rel: "stylesheet", href: tailwindStyles },
    { rel: "stylesheet", href: globalStyles },
    { rel: "stylesheet", type: "text/css", href: dialogPolyfillCSS },
    // { rel: "manifest", type: "text/css", href: "/my-app.webmanifest" },
    // { rel: "apple-touch-icon", href:"/assets/icons/apple-icon-180.png" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2048-2732.jpg", media:"(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2732-2048.jpg", media:"(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1668-2388.jpg", media:"(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2388-1668.jpg", media:"(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1536-2048.jpg", media:"(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2048-1536.jpg", media:"(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1668-2224.jpg", media:"(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2224-1668.jpg", media:"(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1620-2160.jpg", media:"(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2160-1620.jpg", media:"(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1284-2778.jpg", media:"(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2778-1284.jpg", media:"(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1170-2532.jpg", media:"(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2532-1170.jpg", media:"(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1125-2436.jpg", media:"(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2436-1125.jpg", media:"(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1242-2688.jpg", media:"(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2688-1242.jpg", media:"(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-828-1792.jpg", media:"(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1792-828.jpg", media:"(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1242-2208.jpg", media:"(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-2208-1242.jpg", media:"(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-750-1334.jpg", media:"(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1334-750.jpg", media:"(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-640-1136.jpg", media:"(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    // { rel: "apple-touch-startup-image", href:"/assets/icons/apple-splash-1136-640.jpg", media:"(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" },
  ];
};

export function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* add the UI you want your users to see */}
        Une erreur est survenue, désolé on s'en occupe !
        <Scripts />
      </body>
    </html>
  );
}

const App = () => {
  const data = useLoaderData();
  return (
    <html lang="en" className="w-screen overflow-hidden">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen w-screen flex-col scroll-smooth bg-[#fafbfe] antialiased outline-app">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script
          suppressHydrationWarning
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.ENV=${data.ENV};`,
          }}
        />

        <script
          suppressHydrationWarning
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
// https://tailwindcss.com/docs/dark-mode#supporting-system-preference-and-manual-selection
// On page load or when changing themes, best to add inline in head to avoid FOUC
// if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//   document.documentElement.classList.add('dark')
// } else {
//   document.documentElement.classList.remove('dark')
// }

            `,
          }}
        />

        {data.NODE_ENV === "production" && (
          <>
            <script
              suppressHydrationWarning
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `
    // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen#javascript_for_handling_the_install
    let deferredPrompt;
    const addBtn = document.getElementById('add-button-to-destkop-home');
    if (!!addBtn) {
      addBtn.classList.add('hidden');

      window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI to notify the user they can add to home screen
      addBtn.classList.remove('hidden');

      addBtn.addEventListener('click', (e) => {
        // hide our user interface that shows our A2HS button
        addBtn.classList.add('hidden');
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the A2HS prompt');
            } else {
              console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
          });
        });
      });
    }
    `,
              }}
            />
          </>
        )}
        <LiveReload />
      </body>
    </html>
  );
};

export default App;
