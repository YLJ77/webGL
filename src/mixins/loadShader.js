import { waitToLoad } from "@/util/appFunc";

export default {
    mounted() {
        waitToLoad(() => this?.$refs?.canvasWrap?.gl?.program).then(() => {
            this.main();
        });
    },
    components: {
        canvasWrap: () => import('@/components/canvasWrap')
    }
}