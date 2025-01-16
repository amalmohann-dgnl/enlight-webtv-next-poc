import { configurationUtilities } from '@enlight-webtv/utilities';

const { getPlayerConfig } = configurationUtilities;

class PlayerController {
    static instance: PlayerController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (PlayerController.instance) {
            return PlayerController.instance;
        }
        PlayerController.instance = this;
    }

    destroy() {
        if (PlayerController.instance) {
            PlayerController.instance = null;
        }
    }

    /**
     * @name playerConfigurationProvider
     * @type function
     * @description This function will provide the data required to populate the Player page as well as the
     * contentful configurations.
     *
     * @author amalmohann
     */
    playerConfigurationProvider = async () => {
        await getPlayerConfig();
        return Promise;
    };
}

export default PlayerController;
