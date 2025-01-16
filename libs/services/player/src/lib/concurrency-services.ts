import { ConcurrencyData, ConcurrencyLockStatus, PlaybackType, UpdateConcurrencyRequest } from '@enlight-webtv/models';
import { PlaybackServices } from '@enlight-webtv/network-services';
import PlaybackDataServices from './playback-data-services';

//services
const { updateConcurrencyLockUnLock } = new PlaybackServices();
const { getPlaybackVideoData } = new PlaybackDataServices();
//global variables
let CONCURRENCY_LOCK_TIMER_ID: any;
let UPDATED_CONCURRENCY_DATA: UpdateConcurrencyRequest | null;
let CONCURRENCY_LOCK_STATUS: ConcurrencyLockStatus = ConcurrencyLockStatus.UNLOCK;
let UNLOCKING_INPROGRESS = false;

class ConcurrencyServices {
    static instance: ConcurrencyServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (ConcurrencyServices.instance) {
            return ConcurrencyServices.instance;
        }
        ConcurrencyServices.instance = this;
    }

    destroy() {
        if (ConcurrencyServices.instance === this) {
            ConcurrencyServices.instance = null;
        }
    }

    /**
     * @name updateConcurrencyLock
     * @type function
     * @description This function will call the currency lock api
     * @param {ConcurrencyData } concurrencyData - concurrency Data
     *
     * @author amalmohann
     */
    updateConcurrencyLock = async (concurrencyData: ConcurrencyData) => {
        //stop the concurrency updates if already existing
        if (CONCURRENCY_LOCK_TIMER_ID) {
            clearInterval(CONCURRENCY_LOCK_TIMER_ID);
            CONCURRENCY_LOCK_TIMER_ID = null;
        }

        //get concurrency lock params from concurrency data
        const { concurrencyLockParam } = concurrencyData;

        //get the lock url form concurrency data parsed from SMIL.
        let lockRequest: UpdateConcurrencyRequest = {
            _encryptedLock: concurrencyLockParam.encryptedLock,
            _sequenceToken: concurrencyLockParam.sequenceToken,
            _id: concurrencyLockParam.id,
        } as UpdateConcurrencyRequest;

        //assign to cache value, in case of concurrency unlock is called first.
        if (!UPDATED_CONCURRENCY_DATA) {
            this.updateConcurrencyRequestData(lockRequest);
        }

        const contentType = getPlaybackVideoData()?.contentType;
        if (![PlaybackType.TRAILER, PlaybackType.PREVIEW].includes(contentType)) {
            //start concurrency update in interval specified in the manifest
            CONCURRENCY_LOCK_TIMER_ID = setInterval(async () => {
                //set the previous response
                lockRequest = UPDATED_CONCURRENCY_DATA ?? lockRequest;

                //call the lock api
                const lockResponse = await updateConcurrencyLockUnLock(concurrencyData.concurrencyLockUrl, lockRequest);
                if (lockResponse && lockResponse.status === 200 && lockResponse.data && lockResponse?.data.updateResponse) {
                    //get updated Response
                    const { updateResponse } = lockResponse.data;
                    //update the latest value to concurrency data
                    const updatedRequest = {
                        ...lockRequest,
                        _id: updateResponse.id,
                        _encryptedLock: updateResponse.encryptedLock,
                        _sequenceToken: updateResponse.sequenceToken,
                    } as UpdateConcurrencyRequest;
                    this.updateConcurrencyRequestData(updatedRequest);
                    this.updateConcurrencyLockStatus(ConcurrencyLockStatus.LOCK);
                } else {
                    //unlock the concurrency
                    this.unlockConcurrencyLock(concurrencyData);
                }

                //set the concurrency status
            }, Number(concurrencyData.updateLockInterval) * 1000); //convert to seconds by multiplying with 1000
        }
    };

    /**
     * @name unlockConcurrencyLock
     * @type function
     * @description This function will call the currency unlock api
     * @param {ConcurrencyData } concurrencyData - concurrency Data
     *
     * @author amalmohann
     */
    unlockConcurrencyLock = async (concurrencyData: ConcurrencyData) => {
        //get the unlock url from concurrency data.
        const { concurrencyUnlockUrl } = concurrencyData;

        //stop the concurrency updates
        if (CONCURRENCY_LOCK_TIMER_ID) {
            clearInterval(CONCURRENCY_LOCK_TIMER_ID);
            CONCURRENCY_LOCK_TIMER_ID = null;
        }

        //unlock only if the concurrency is locked
        if (!UNLOCKING_INPROGRESS && CONCURRENCY_LOCK_STATUS === ConcurrencyLockStatus.LOCK && UPDATED_CONCURRENCY_DATA) {
            //set unlocking status to avoid duplicate request
            UNLOCKING_INPROGRESS = true;
            //call the unlock api with previous concurrency update response
            const unlockResponse = await updateConcurrencyLockUnLock(concurrencyUnlockUrl, UPDATED_CONCURRENCY_DATA);
            if (unlockResponse && unlockResponse.status === 200) {
                //set the concurrency status
                this.updateConcurrencyLockStatus(ConcurrencyLockStatus.UNLOCK);
                this.updateConcurrencyRequestData(null);
            }
            UNLOCKING_INPROGRESS = false;
        }
    };

    /**
     * @name updateConcurrencyLockStatus
     * @type function
     * @description This function will update the concurrency Lock Status
     * @param {ConcurrencyData } concurrencyData - concurrency Data
     *
     * @author amalmohann
     */
    updateConcurrencyLockStatus = async (status: ConcurrencyLockStatus) => {
        CONCURRENCY_LOCK_STATUS = status;
    };

    /**
     * @name updateConcurrencyRequestData
     * @type function
     * @description This function will update the concurrency request data
     * @param {UpdateConcurrencyRequest | null } request -  request Data
     *
     * @author amalmohann
     */
    updateConcurrencyRequestData = (request: UpdateConcurrencyRequest | null) => {
        UPDATED_CONCURRENCY_DATA = request;
    };
}

export default ConcurrencyServices;
