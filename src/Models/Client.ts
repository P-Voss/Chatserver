import WebSocket from 'ws';

export class Client {

    private _clientUuid: string = '';
    private _userId: number;
    private _currentRoomId: number = 0;
    private _username: string;
    private _role: string;
    private _ws: WebSocket = {} as WebSocket;

    constructor (userId: number = 0, username: string = '', role: string = 'user') {
        this._userId = userId;
        this._username = username;
        this._role = role;
    }


    get clientUuid(): string {
        return this._clientUuid;
    }

    set clientUuid(value: string) {
        this._clientUuid = value;
    }

    get userId(): number {
        return this._userId;
    }

    set userId(value: number) {
        this._userId = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get role(): string {
        return this._role;
    }

    set role(value: string) {
        this._role = value;
    }

    get ws(): WebSocket {
        return this._ws;
    }

    set ws(value: WebSocket) {
        this._ws = value;
    }

    get currentRoomId(): number {
        return this._currentRoomId;
    }

    set currentRoomId(value: number) {
        this._currentRoomId = value;
    }
};