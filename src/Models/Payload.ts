

export class Payload {

    private _message: string = '';
    private _access_key: string = '';
    private _userId: number = 0;
    private _currentRoomId: number = 0;
    private _nextRoomId: number = 0;

    constructor(object = {userId: 0, message: '', access_key: '', currentRoomId: 0, nextRoomId: 0}) {
        if (object.hasOwnProperty('userId')) {
            this._userId = object.userId;
        }
        if (object.hasOwnProperty('message')) {
            this._message = object.message;
        }
        if (object.hasOwnProperty('access_key')) {
            this._access_key = object.access_key;
        }
        if (object.hasOwnProperty('currentRoomId')) {
            this._currentRoomId = object.currentRoomId;
        }
        if (object.hasOwnProperty('nextRoomId')) {
            this._nextRoomId = object.nextRoomId;
        }
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }

    get userId(): number {
        return this._userId;
    }

    set userId(value: number) {
        this._userId = value;
    }

    get currentRoomId(): number {
        return this._currentRoomId;
    }

    set currentRoomId(value: number) {
        this._currentRoomId = value;
    }

    get nextRoomId(): number {
        return this._nextRoomId;
    }

    set nextRoomId(value: number) {
        this._nextRoomId = value;
    }

    get access_key(): string {
        return this._access_key;
    }

    set access_key(value: string) {
        this._access_key = value;
    }
};