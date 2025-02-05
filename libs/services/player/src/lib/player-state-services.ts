import { PlayerState } from '@enlight-webtv/models';
import PlaybackDataServices from './playback-data-services';

const { getPlayerStatusData } = new PlaybackDataServices();

class PlayerStateServices {
    static instance: PlayerStateServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerStateServices.instance) {
            return PlayerStateServices.instance;
        }
        PlayerStateServices.instance = this;
    }

    destroy() {
        if (PlayerStateServices.instance === this) {
            PlayerStateServices.instance = null;
        }
    }

    setPlayerState = (state: PlayerState) => {
        const { playerContext } = { ...getPlayerStatusData() };
        playerContext._playerState = state;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.playerState = state;
    };

    getPlayerState = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return window.playerState;
    };
}

export default PlayerStateServices;
