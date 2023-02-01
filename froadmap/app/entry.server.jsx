import "./db/mongo.server";
import { PassThrough } from "stream";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as Sentry from "@sentry/remix";
import { SENTRY_XXX, ENVIRONMENT } from "~/config.server";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: SENTRY_XXX,
    tracesSampleRate: 1,
    environment: `api-${ENVIRONMENT}`,
    integrations: [
      new Sentry.Integrations.Mongo({
        useMongoose: true,
      }),
    ],
  });
}

const ABORT_DELAY = 5000;

export default function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
      onAllReady() {
        const body = new PassThrough();

        responseHeaders.set("Content-Type", "text/html");

        resolve(
          new Response(body, {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          })
        );

        pipe(body);
      },
      onShellError(error) {
        reject(error);
      },
      onError(error) {
        didError = true;

        console.error(error);
      },
    });

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
      onShellReady() {
        const body = new PassThrough();

        responseHeaders.set("Content-Type", "text/html");

        resolve(
          new Response(body, {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          })
        );

        pipe(body);
      },
      onShellError(err) {
        reject(err);
      },
      onError(error) {
        didError = true;

        console.error(error);
      },
    });

    setTimeout(abort, ABORT_DELAY);
  });
}
