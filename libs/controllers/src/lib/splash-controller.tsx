import { EventType, HTMLEvents } from '@enlight-webtv/models';
import { addWindowEventListener } from '@enlight-webtv/utils';

/**
 * @name initializeBooting
 * @type function/method
 * @description This function will be called for the booting of the application.
 * @param {Promise<void>}
 *
 * @author amalmohann
 */

const initializeBooting = () => {
  addWindowEventListener(HTMLEvents.BEFORE_UNLOAD, () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (window?.has_session_ended === false) {
      sendMixPanelEvent(
        EventType.SESSION_END,
        {
          session_duration:
            Math.round(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              (Date.now() - Number(window.sessionStartTime)) / 60000
            ) ?? 0,
        },
        false
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      window.has_session_ended = true;
    }
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  window.has_session_ended = false;
};

export { initializeBooting };
