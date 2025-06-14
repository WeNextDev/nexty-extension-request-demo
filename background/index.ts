import { Storage } from "@plasmohq/storage";
import { generateSignature } from "./crypto-utils";

const storage = new Storage({ area: "local" });

const API_BASE_URL = process.env.PLASMO_PUBLIC_SITE_URL;

/**
 * A generic API request function that handles backend requests and automatically caches successful data.
 * @param endpoint API path
 * @param authenticated Whether the request is authenticated
 * @param cacheKey The key used to store the data
 * @returns A standard object containing { success, data?, error? }
 */
const apiFetch = async (endpoint: string, authenticated: boolean, cacheKey: string) => {
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const urlObject = new URL(fullUrl);
    const payload = urlObject.search;
    const timestamp = Date.now().toString();
    const signature = generateSignature(timestamp, payload);

    const headers = new Headers();
    headers.set("x-timestamp", timestamp);
    headers.set("x-signature", signature);

    const response = await fetch(fullUrl, {
      method: "GET",
      credentials: authenticated ? "include" : "omit",
      headers,
    });

    const body = await response.json();

    if (body.success) {
      // save the data to the storage
      await storage.set(cacheKey, body.data);
    } else {
      // if failed, clear the storage
      await storage.remove(cacheKey);
    }

    return body;

  } catch (error) {
    await storage.remove(cacheKey);
    return { success: false, data: null, error: "connection error, please check your network" };
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PUBLIC_DATA") {
    apiFetch("/api/extension-demo/public-data", false, "public_data_cache").then(sendResponse);
    return true;
  }

  if (request.type === "GET_USER_STATUS") {
    apiFetch("/api/extension-demo/user-status", true, "user_status_cache").then(sendResponse);
    return true;
  }
  
  if (request.type === "GET_USER_BENEFITS") {
    apiFetch("/api/extension-demo/user-benefits", true, "user_benefits_cache").then(sendResponse);
    return true;
  }

  return false;
});

// When the extension installed or the browser starts
// get the status once as the initial cache
chrome.runtime.onInstalled.addListener(() => {
  apiFetch("/api/extension-demo/user-status", true, "user_status_cache");
});

chrome.runtime.onStartup.addListener(() => {
  apiFetch("/api/extension-demo/user-status", true, "user_status_cache");
});