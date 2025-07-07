import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';

class StompService {
	private client: Client | null = null;
	private subscriptions: Map<string, StompSubscription> = new Map();
	private static instance: StompService;

	private constructor() {}

	public static getInstance(): StompService {
		if (!StompService.instance) {
			StompService.instance = new StompService();
		}
		return StompService.instance;
	}

	/**
	 * STOMP 클라이언트 연결
	 * @param brokerURL STOMP 브로커 URL (기본값: ws://localhost:8080/ws)
	 * @param headers 연결 시 추가할 헤더
	 * @returns STOMP 클라이언트 인스턴스
	 */
	public connect(
		brokerURL = "ws://localhost:8080/ws",
		headers: Record<string, string> = {},
	): Client {
		if (!this.client) {
			this.client = new Client({
				brokerURL,
				connectHeaders: headers,
				debug: function (str) {
					console.debug(str);
				},
				reconnectDelay: 5000,
				heartbeatIncoming: 4000,
				heartbeatOutgoing: 4000,
			});

			this.client.onConnect = () => {
				console.log("STOMP 서버에 연결되었습니다.");
			};

			this.client.onStompError = (frame) => {
				console.error("STOMP 에러:", frame.headers["message"], frame.body);
			};

			this.client.onDisconnect = () => {
				console.log("STOMP 서버와의 연결이 끊어졌습니다.");
			};

			this.client.onWebSocketClose = (event) => {
				console.log("WebSocket 연결이 끊어졌습니다:", event);
			};

			this.client.activate();
		}

		return this.client;
	}

	/**
	 * STOMP 클라이언트 연결 해제
	 */
	public disconnect(): void {
		if (this.client) {
			// 모든 구독 해제
			this.subscriptions.forEach((subscription) => {
				subscription.unsubscribe();
			});
			this.subscriptions.clear();

			this.client.deactivate();
			this.client = null;
		}
	}

	/**
	 * 주제(destination)에 메시지 전송
	 * @param destination 대상 주제
	 * @param body 메시지 내용
	 * @param headers 추가 헤더
	 */
	public publish<T>(
		destination: string,
		body?: T,
		headers: Record<string, string> = {},
	): void {
		if (this.client && this.client.connected) {
			this.client.publish({
				destination,
				headers,
				body: body ? JSON.stringify(body) : undefined,
			});
		} else {
			console.warn("STOMP 서버에 연결되어 있지 않습니다.");
		}
	}

	/**
	 * 주제 구독
	 * @param destination 구독할 주제
	 * @param callback 메시지 수신 시 호출할 콜백 함수
	 * @param headers 구독 시 추가 헤더
	 * @returns 구독 ID
	 */
	public subscribe<T>(
		destination: string,
		callback: (data: T) => void,
		headers: Record<string, string> = {},
	): string {
		if (!this.client || !this.client.connected) {
			console.warn(
				"STOMP 서버에 연결되어 있지 않습니다. 자동으로 연결을 시도합니다.",
			);
			this.connect();

			// 연결이 완료된 후 구독 진행
			this.client!.onConnect = () => {
				console.log("STOMP 서버에 연결되었습니다.");
				this.doSubscribe(destination, callback, headers);
			};

			return destination;
		}

		return this.doSubscribe(destination, callback, headers);
	}

	private doSubscribe<T>(
		destination: string,
		callback: (data: T) => void,
		headers: Record<string, string> = {},
	): string {
		const subscription = this.client!.subscribe(
			destination,
			(message) => {
				try {
					const data = message.body
						? (JSON.parse(message.body) as T)
						: undefined;
					callback(data as T);
				} catch (error) {
					console.error("메시지 파싱 오류:", error);
				}
			},
			headers,
		);

		this.subscriptions.set(destination, subscription);
		return destination;
	}

	/**
	 * 주제 구독 해제
	 * @param subscriptionId 구독 ID
	 */
	public unsubscribe(subscriptionId: string): void {
		const subscription = this.subscriptions.get(subscriptionId);
		if (subscription) {
			subscription.unsubscribe();
			this.subscriptions.delete(subscriptionId);
		}
	}

	/**
	 * 모든 구독 해제
	 */
	public unsubscribeAll(): void {
		this.subscriptions.forEach((subscription) => {
			subscription.unsubscribe();
		});
		this.subscriptions.clear();
	}

	/**
	 * 클라이언트 연결 상태 확인
	 * @returns 연결 상태
	 */
	public isConnected(): boolean {
		return !!this.client && this.client.connected;
	}
}

// STOMP 서비스 싱글턴 인스턴스 내보내기
export const stompService = StompService.getInstance();
