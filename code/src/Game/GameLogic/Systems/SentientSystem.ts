import { ComponentTypeEnum } from "../../../Engine/ECS/Components/Component";
import ECSManager from "../../../Engine/ECS/ECSManager";
import System from "../../../Engine/ECS/Systems/System";
import SentientComponent from "../Components/SentientComponent";
import VicinityTriggerComponent from "../Components/VicinityTriggerComponent";

export default class SentientSystem extends System {
    private ecsManager: ECSManager;

	constructor(ecsManager: ECSManager) {
		super([ComponentTypeEnum.SENTIENT, ComponentTypeEnum.VICINITYTRIGGER]);
        this.ecsManager = ecsManager;
	}

	update(dt: number) {
        for (let e of this.entities) {
            let vicinityTriggerComponent = e.getComponent(ComponentTypeEnum.VICINITYTRIGGER) as VicinityTriggerComponent;
            let sentientComponent = e.getComponent(ComponentTypeEnum.SENTIENT) as SentientComponent;
            for (let vicinityEntity of vicinityTriggerComponent.inVicinityOf) {
                if (vicinityEntity.hasComponent(ComponentTypeEnum.CANDLE)) {
                    this.ecsManager.removeEntity(vicinityEntity.id);
                    sentientComponent.hasCandle = true;
                    break;
                }
            }
        }
	}
}