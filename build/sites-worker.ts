import { siteAPI, scheduledReminders, seoFile, pageShellFor } from '../lib/site-api';
import shell from '../lib/site-shell';
import { installationAsset } from '../lib/app-icons';
declare const __APSUA_BUILD_ID__:string;
declare const __APSUA_SELF_HOSTED__: boolean;
const pageShell=shell.replace('</head>','<script>window.apsuaPageBuildId='+JSON.stringify(__APSUA_BUILD_ID__)+'</script></head>');
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

// build 166: safe defaults for the HTML shell. Script/style/frame sources are deliberately not restricted here:
// the page uses inline scripts, Telegram login, Yandex maps/reviews widgets and payment QR images from external hosts.
// frame-ancestors is left for a separate decision (the hosting preview may embed the site in a frame).
const pageHeaders={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"object-src 'none'; base-uri 'self'",'Referrer-Policy':'strict-origin-when-cross-origin','X-Content-Type-Options':'nosniff','Permissions-Policy':'camera=(), microphone=()'};
export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    // On our own Worker these Sites identity headers arrive from the public internet.
    // Never trust them as authentication (especially for owner/admin permissions).
    if (__APSUA_SELF_HOSTED__) {
      const safeHeaders = new Headers(request.headers);
      for (const key of Array.from(safeHeaders.keys())) {
        if (key.toLowerCase().startsWith("oai-authenticated-user-")) safeHeaders.delete(key);
      }
      request = new Request(request, { headers: safeHeaders });
    }
    const path=new URL(request.url).pathname;
    if(['GET','HEAD'].includes(request.method)&&path==='/yandex_b0ca4a0e8cb79573.html')return new Response(request.method==='HEAD'?null:'<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: b0ca4a0e8cb79573</body></html>',{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
    const asset=installationAsset(request);if(asset)return asset;
    if(path.startsWith('/api/'))return siteAPI(request,env as any,ctx);
    if(['GET','HEAD'].includes(request.method)&&(path==='/robots.txt'||path==='/sitemap.xml'))return seoFile(request,env as any);
    // The excursion list moved from /catalog to /excursions; old links and search results follow permanently.
    // The diary lives at /journal; /diary links typed by hand or shared from the app follow it.
    if(['GET','HEAD'].includes(request.method)&&/^\/diary(\/|$)/.test(path)){const url=new URL(request.url);return new Response(null,{status:301,headers:{Location:'/journal'+path.slice('/diary'.length).replace(/\/$/,'')+url.search,'Cache-Control':'public, max-age=3600'}})}
    if(['GET','HEAD'].includes(request.method)&&/^\/catalog(\/|$)/.test(path)){const url=new URL(request.url),rest=path.slice('/catalog'.length).replace(/\/$/,'');url.pathname=rest?'/tour'+rest:'/excursions';return new Response(null,{status:301,headers:{Location:url.pathname+url.search,'Cache-Control':'public, max-age=3600'}})}
    if(['GET','HEAD'].includes(request.method)&&(path==='/'||path==='/index.html'||/^\/(excursions|administrator|journal|account|transfer|map|faq|tour|reviews|useful|fleet|about|contacts|orders|favorites|compare|pick|install|excursions-from)(\/|$)/.test(path)))return new Response(request.method==='HEAD'?null:await pageShellFor(pageShell,request,env as any),{headers:pageHeaders});
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
  // build 146: trip reminders. Runs when a Cron Trigger is configured for this Worker (e.g. every 15 minutes);
  // without it, reminders are swept opportunistically by /api/state traffic at most every 10 minutes.
  scheduled(_controller: unknown, env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(scheduledReminders(env as any).catch(() => 0));
  },
};
