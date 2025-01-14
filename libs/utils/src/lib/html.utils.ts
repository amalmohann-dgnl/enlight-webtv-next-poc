import { HTMLEvents } from "@enlight-webtv/models";

const addWindowEventListener = (event: HTMLEvents, callback: (e: any) => any) => {
  window.addEventListener(event, callback);
}

const addDocumentEventListener = (event: HTMLEvents, callback: (e: any) => any) => {
  document.addEventListener(event, callback);
}

export { addWindowEventListener, addDocumentEventListener };
