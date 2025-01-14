/**
 * @name removeDVPlayerTag
 * @type function
 * @description This function will delete the player tag if already exists, to avoid conflicts.
 *
 * @author amalmohann
 */
const removeDVPlayerTag = () => {
    const dplayer = document.getElementById('dplayer');
    if (dplayer && dplayer.children.length > 0) {
        for (let i = 0; i < dplayer.children.length; i++) {
            const player = dplayer.children[i];
            if (player) {
                dplayer.removeChild(player);
            }
        }
    }
};

export { removeDVPlayerTag };
