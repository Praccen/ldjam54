import Entity from "../../Engine/ECS/Entity";
import Div from "../../Engine/GUI/Div";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering";
import State, { StatesEnum } from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
import Game from "./Game";

export default class LobbyState extends State {
	private overlay: OverlayRendering;
	private sa: StateAccessible;

	private participantsDiv: Div;

	private botCounter: number;

	private timePassed: number = 0;

	private startButton;

	constructor(sa: StateAccessible) {
		super();
		this.sa = sa;
		this.overlay = new OverlayRendering();

		this.botCounter = 0;

		this.startButton = this.overlay.getNewButton();
		this.startButton.position.x = 0.8;
		this.startButton.position.y = 0.8;
		this.startButton.center = true;
		this.startButton.textString = "Start";

		let self = this;
		this.startButton.onClick(function () {
			// Server is true by default so should be okay for local games too?
			if (Game.getInstanceNoSa().client.isServer) {
				Game.getInstanceNoSa().client.sendStart();
				self.gotoState = StatesEnum.GAME;
			}
		});

		let backButton = this.overlay.getNewButton();
		backButton.position.x = 0.01;
		backButton.position.y = 0.8;
		backButton.textString = "Back";

		backButton.onClick(function () {
			self.gotoState = StatesEnum.MAINMENU;
		});

		this.participantsDiv = this.overlay.getNewDiv();
		this.participantsDiv.getElement().style.backgroundColor = "gray";
		this.participantsDiv.getElement().style.opacity = "70%";
		this.participantsDiv.position.x = 0.01;
		this.participantsDiv.position.y = 0.03;
		this.participantsDiv.getElement().style.borderRadius = "5px";
		this.participantsDiv.getElement().style.overflowY = "auto";
		this.participantsDiv.getElement().style.width = "50%";
		this.participantsDiv.getElement().style.height = "70%";

		let participantsDivTitle = this.overlay.getNew2DText(this.participantsDiv);
		participantsDivTitle.textString = "Participants";
		participantsDivTitle.getElement().style.backgroundColor = "dimgray";
		participantsDivTitle.getElement().style.width = "100%";
		participantsDivTitle.getElement().style.borderRadius = "5px";

		this.addParticipant("me");

		let addBotButton = this.overlay.getNewButton();
		addBotButton.position.x = 0.55;
		addBotButton.position.y = 0.7;
		addBotButton.textString = "Add bot";
		addBotButton.onClick(() => {
			this.addParticipant("Bot " + this.botCounter++);
		});

		let removeParticipantButton = this.overlay.getNewButton();
		removeParticipantButton.position.x = 0.55;
		removeParticipantButton.position.y = 0.6;
		removeParticipantButton.textString = "Remove";
		removeParticipantButton.onClick(() => {
			let length = this.participantsDiv.children.length;
			if (length > 2) {
				this.participantsDiv.children[length - 1].remove();
				this.participantsDiv.children.pop();
			}
		});
	}

	private addParticipant(name: string) {
		let participantText = this.overlay.getNew2DText(this.participantsDiv);
		participantText.textString = name;
	}

	async init() {
		super.init();
		this.overlay.show();
	}

	reset() {
		super.reset();
		this.overlay.hide();
	}

	update(dt: number) {
		this.timePassed += dt;
		if (this.timePassed > 1) {
			// Clear list
			for (const div of this.participantsDiv.children) {
				div.remove();
			}
			if (Game.getInstanceNoSa().client.connected) {
				// Hide start if not server
				if (!Game.getInstanceNoSa().client.isServer) {
					this.startButton.setHidden(true);
				}
				this.addParticipant("You");
				Game.getInstanceNoSa().client.bodyEntities.forEach(
					(value: Entity, key: string) => {
						this.addParticipant("Player_" + key);
					}
				);
				if (Game.getInstanceNoSa().client.gameStarted) {
					this.gotoState = StatesEnum.GAME;
				}
			}
			// TODO: Add bots if local game
		}
	}

	draw() {
		this.overlay.draw();
	}
}
